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
      const envConfig = this.configLoader.getEnvironmentConfig(instanceSlug);
      const targetEnv = instanceSlug || this.configLoader.getDefaultEnvironment();

      // Check if we already have an instance for this environment
      if (this.apiInstances.has(targetEnv)) {
        return this.apiInstances.get(targetEnv)!;
      }

      // Create new axios instance for this environment
      const apiInstance = axios.create({
        baseURL: envConfig.n8n_host,
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