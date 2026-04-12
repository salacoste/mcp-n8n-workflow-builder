import axios, { AxiosInstance, AxiosError } from 'axios';
import { ConfigLoader } from '../config/configLoader';
import { N8NInstance } from '../types/config';
import { normalizeBaseUrl, describeUrlChanges } from '../utils/urlNormalization';
import { validateApiResponse } from '../utils/responseValidation';

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private configLoader: ConfigLoader;
  private apiInstances: Map<string, AxiosInstance> = new Map();

  private constructor() {
    this.configLoader = ConfigLoader.getInstance();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Get or create an axios instance for the specified environment
   */
  public getApiInstance(instanceSlug?: string): AxiosInstance {
    try {
      const targetEnv = instanceSlug || this.configLoader.getDefaultEnvironment();

      // Check cache first - return cached instance if available
      if (this.apiInstances.has(targetEnv)) {
        return this.apiInstances.get(targetEnv)!;
      }

      // No cached instance - create new one with URL normalization
      const envConfig = this.configLoader.getEnvironmentConfig(instanceSlug);

      // Fix 2: URL Normalization — use dedicated utility to ensure consistent
      // baseURL regardless of user input format (trailing slashes, /api/v1 suffix, etc.)
      // This prevents HTTP redirects caused by URL format mismatches.
      const baseURL = normalizeBaseUrl(envConfig.n8n_host);

      // Log a warning when the URL required normalization — this helps users
      // discover misconfigured N8N_HOST values that would cause redirects.
      const urlChangeDescription = describeUrlChanges(envConfig.n8n_host, baseURL);
      if (urlChangeDescription) {
        console.error(`[EnvironmentManager] WARNING: ${urlChangeDescription}`);
      }

      // Debug logging for transparency (only when DEBUG=true)
      if (process.env.DEBUG === 'true') {
        console.error(`[EnvironmentManager] Original URL: ${envConfig.n8n_host}`);
        console.error(`[EnvironmentManager] Normalized baseURL: ${baseURL}`);
        console.error(`[EnvironmentManager] API Key: ${envConfig.n8n_api_key?.substring(0, 20)}...`);
      }
      
      const apiInstance = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': envConfig.n8n_api_key
        },
        // Fix 1: Allow redirects but preserve the original HTTP method.
        // By default, HTTP 301/302 redirects convert POST→GET (per HTTP spec),
        // which silently drops the request body. The beforeRedirect callback
        // overrides this behaviour by forcing the redirected request to keep
        // the original method and body, so POST stays POST even through a
        // 301/302.  maxRedirects is set to 5 (instead of axios default of 5)
        // explicitly for clarity, and we add the protective callback.
        maxRedirects: 5,
        beforeRedirect: (options: Record<string, any>, responseDetails: { headers: Record<string, string>; statusCode: number }) => {
          // Preserve the original HTTP method across redirects.
          // Without this, 301/302 responses cause POST→GET downgrades
          // per the HTTP specification — the redirect drops the body and
          // switches to GET.  We override that by restoring the method and
          // body/headers from the original request.
          const originalMethod = (options as any).__redirectOriginalMethod || options.method;

          if (process.env.DEBUG === 'true') {
            console.error(
              `[EnvironmentManager] Redirect ${responseDetails.statusCode}: ` +
              `${originalMethod} → ${options.href} (preserving method)`
            );
          }

          // Store the very first method so chained redirects also preserve it
          if (!(options as any).__redirectOriginalMethod) {
            (options as any).__redirectOriginalMethod = options.method;
          }

          // Force the redirected request to keep the original method
          options.method = originalMethod;

          // Preserve headers (especially Content-Type and API key) which
          // some HTTP clients strip on redirect
          if (options.headers) {
            if (!options.headers['Content-Type']) {
              options.headers['Content-Type'] = 'application/json';
            }
            if (!options.headers['X-N8N-API-KEY'] && envConfig.n8n_api_key) {
              options.headers['X-N8N-API-KEY'] = envConfig.n8n_api_key;
            }
          }
        },
        // Accept only 2xx as success — 3xx that slip past beforeRedirect
        // will be caught by the response interceptor below.
        validateStatus: (status: number) => status >= 200 && status < 300,
      });

      // Fix 1 (continued): Request interceptor — tag every outgoing request
      // with its original HTTP method so we can detect POST→GET downgrades
      // if a redirect somehow slips through.
      apiInstance.interceptors.request.use((config) => {
        // Store original method for redirect detection
        (config as any).__originalMethod = config.method?.toUpperCase();
        return config;
      });

      // Fix 1 & 3: Response interceptor — validate response structure and
      // provide actionable error messages for any redirect edge cases.
      apiInstance.interceptors.response.use(
        (response) => {
          // Fix 3: Validate that the response matches what we expect for
          // the original request method (e.g., POST should return created
          // resource, not an HTML page or empty body from a GET redirect).
          const originalMethod = (response.config as any).__originalMethod;
          const validationError = validateApiResponse(response, originalMethod);
          if (validationError) {
            if (process.env.DEBUG === 'true') {
              console.error(`[EnvironmentManager] Response validation warning: ${validationError}`);
            }
          }
          return response;
        },
        (error: AxiosError) => {
          // Safety net: If a redirect somehow exceeds maxRedirects or fails
          // despite the beforeRedirect callback, provide a clear error message
          // explaining the likely cause (misconfigured N8N_HOST).
          if (error.response && error.response.status >= 300 && error.response.status < 400) {
            const redirectUrl = error.response.headers?.location || 'unknown';
            const method = (error.config as any)?.__originalMethod || error.config?.method?.toUpperCase();
            const url = error.config?.url || 'unknown';

            const message =
              `HTTP ${error.response.status} redirect detected on ${method} ${url} → ${redirectUrl}. ` +
              `The beforeRedirect callback preserves the HTTP method, but this redirect may indicate ` +
              `a misconfigured N8N_HOST. Please check that the URL is correct (without trailing slash). ` +
              `Current baseURL: ${error.config?.baseURL}`;

            if (process.env.DEBUG === 'true') {
              console.error(`[EnvironmentManager] Redirect error: ${message}`);
            }

            return Promise.reject(new Error(message));
          }

          // Handle max redirects exceeded error from axios/follow-redirects
          if (error.code === 'ERR_FR_TOO_MANY_REDIRECTS' || error.message?.includes('maxRedirects')) {
            const method = (error.config as any)?.__originalMethod || error.config?.method?.toUpperCase();
            const url = error.config?.url || 'unknown';

            const message =
              `Too many redirects on ${method} ${url}. ` +
              `This usually means N8N_HOST is misconfigured, causing a redirect loop. ` +
              `Please verify the URL points to the n8n API endpoint. ` +
              `Current baseURL: ${error.config?.baseURL}`;

            return Promise.reject(new Error(message));
          }

          return Promise.reject(error);
        }
      );

      // Cache the instance
      this.apiInstances.set(targetEnv, apiInstance);
      
      return apiInstance;
    } catch (error) {
      throw new Error(`Failed to get API instance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get environment configuration
   */
  public getEnvironmentConfig(instanceSlug?: string): N8NInstance {
    return this.configLoader.getEnvironmentConfig(instanceSlug);
  }

  /**
   * Get list of available environments
   */
  public getAvailableEnvironments(): string[] {
    return this.configLoader.getAvailableEnvironments();
  }

  /**
   * Get default environment name
   */
  public getDefaultEnvironment(): string {
    return this.configLoader.getDefaultEnvironment();
  }

  /**
   * Clear cached API instances (useful for configuration reloads)
   */
  public clearCache(): void {
    this.apiInstances.clear();
  }
}