import axios, { AxiosInstance, AxiosError } from 'axios';
import { ConfigLoader } from '../config/configLoader';
import { N8NInstance } from '../types/config';
import { normalizeBaseUrl } from '../utils/urlNormalization';
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
        // Fix 1: Prevent HTTP redirect from silently downgrading POST→GET.
        // By default, axios follows 301/302 redirects and converts POST to GET
        // (per HTTP spec), which drops the request body. Setting maxRedirects: 0
        // makes redirects fail explicitly so we can detect misconfigured URLs
        // instead of silently losing data.
        maxRedirects: 0,
        // Treat redirect status codes (3xx) as errors so they don't silently
        // convert POST→GET. The response interceptor below handles these
        // gracefully with a descriptive error message.
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

      // Fix 1 & 3: Response interceptor — detect redirect-related errors
      // and validate response structure for the expected HTTP method.
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
          // Fix 1 (continued): Convert redirect errors into actionable messages.
          // When maxRedirects: 0 catches a redirect, the error will be an
          // AxiosError with a 3xx status. We intercept this and provide a
          // clear message about the root cause.
          if (error.response && error.response.status >= 300 && error.response.status < 400) {
            const redirectUrl = error.response.headers?.location || 'unknown';
            const method = (error.config as any)?.__originalMethod || error.config?.method?.toUpperCase();
            const url = error.config?.url || 'unknown';

            const message =
              `HTTP ${error.response.status} redirect detected on ${method} ${url} → ${redirectUrl}. ` +
              `This would silently convert POST to GET, losing the request body. ` +
              `Please check that N8N_HOST is configured correctly (without trailing slash). ` +
              `Current baseURL: ${error.config?.baseURL}`;

            if (process.env.DEBUG === 'true') {
              console.error(`[EnvironmentManager] Redirect blocked: ${message}`);
            }

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