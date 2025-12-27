import axios, { AxiosInstance } from 'axios';
import { ConfigLoader } from '../config/configLoader';
import { N8NInstance } from '../types/config';

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

      // URL Normalization: Ensure consistent baseURL regardless of user input format
      // This provides backward compatibility with configs that include /api/v1
      let baseHost = envConfig.n8n_host;

      // Step 1: Remove all trailing slashes
      baseHost = baseHost.replace(/\/+$/, '');

      // Step 2: Remove /api/v1 if already present (backward compatibility)
      // This handles both legacy configs and new configs
      if (baseHost.endsWith('/api/v1')) {
        baseHost = baseHost.replace(/\/api\/v1$/, '');
      }

      // Step 3: Now safely construct the final URL with /api/v1
      const baseURL = `${baseHost}/api/v1`;

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
        }
      });

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