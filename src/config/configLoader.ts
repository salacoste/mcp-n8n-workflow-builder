import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Config, MultiInstanceConfig, N8NInstance } from '../types/config';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: MultiInstanceConfig | null = null;

  private constructor() {}

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Load configuration from .config.json or .env (fallback)
   */
  public loadConfig(): MultiInstanceConfig {
    if (this.config) {
      return this.config;
    }

    // Use stderr for debug logging to avoid interfering with MCP JSON-RPC protocol
    if (process.env.DEBUG === 'true') {
      console.error(`[ConfigLoader] Current working directory: ${process.cwd()}`);
      console.error(`[ConfigLoader] Script directory: ${__dirname}`);
    }

    // Try to load .config.json first
    // Look in both current working directory and project root (relative to this file)
    const configPaths = [
      path.join(process.cwd(), '.config.json'),
      path.join(__dirname, '../../.config.json'), // Relative to build/config/configLoader.js
      path.join(__dirname, '../../../.config.json') // In case of different build structure
    ];
    
    for (const configJsonPath of configPaths) {
      if (process.env.DEBUG === 'true') {
        console.error(`[ConfigLoader] Checking for config at: ${configJsonPath}`);
      }
      if (fs.existsSync(configJsonPath)) {
        if (process.env.DEBUG === 'true') {
          console.error(`[ConfigLoader] Loading config from: ${configJsonPath}`);
        }
        this.config = this.loadFromJson(configJsonPath);
        return this.config;
      }
    }

    // Fallback to .env for backward compatibility
    if (process.env.DEBUG === 'true') {
      console.error(`[ConfigLoader] No .config.json found, falling back to .env`);
    }
    this.config = this.loadFromEnv();
    return this.config;
  }

  /**
   * Load configuration from .config.json
   */
  private loadFromJson(configPath: string): MultiInstanceConfig {
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      const parsedConfig: Config = JSON.parse(configData);

      // Validate the config structure
      if (parsedConfig.environments && parsedConfig.defaultEnv) {
        // Multi-instance configuration
        if (!parsedConfig.environments[parsedConfig.defaultEnv]) {
          throw new Error(`Default environment '${parsedConfig.defaultEnv}' not found in environments`);
        }

        // Validate all environments have required fields
        for (const [envName, envConfig] of Object.entries(parsedConfig.environments)) {
          if (!envConfig.n8n_host || !envConfig.n8n_api_key) {
            throw new Error(`Environment '${envName}' is missing required fields (n8n_host, n8n_api_key)`);
          }
        }

        return {
          environments: parsedConfig.environments,
          defaultEnv: parsedConfig.defaultEnv
        };
      } else if (parsedConfig.n8n_host && parsedConfig.n8n_api_key) {
        // Single instance configuration in JSON format
        return {
          environments: {
            'default': {
              n8n_host: parsedConfig.n8n_host,
              n8n_api_key: parsedConfig.n8n_api_key
            }
          },
          defaultEnv: 'default'
        };
      } else {
        throw new Error('Invalid configuration format in .config.json');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format in .config.json: ${error.message}`);
      }
      throw new Error(`Configuration error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load configuration from .env (backward compatibility)
   */
  private loadFromEnv(): MultiInstanceConfig {
    // Load .env file from multiple possible locations
    const envPaths = [
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '../../.env'), // Relative to build/config/configLoader.js
    ];
    
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        if (process.env.DEBUG === 'true') {
          console.error(`Loading .env from: ${envPath}`);
        }
        dotenv.config({ path: envPath });
        break;
      }
    }

    const n8nHost = process.env.N8N_HOST;
    const n8nApiKey = process.env.N8N_API_KEY;

    if (!n8nHost || !n8nApiKey) {
      throw new Error('Missing required environment variables: N8N_HOST and N8N_API_KEY must be set');
    }

    // Create single instance configuration for backward compatibility
    return {
      environments: {
        'default': {
          n8n_host: n8nHost,
          n8n_api_key: n8nApiKey
        }
      },
      defaultEnv: 'default'
    };
  }

  /**
   * Get configuration for a specific environment
   */
  public getEnvironmentConfig(instanceSlug?: string): N8NInstance {
    const config = this.loadConfig();
    const targetEnv = instanceSlug || config.defaultEnv;

    if (!config.environments[targetEnv]) {
      throw new Error(`Environment '${targetEnv}' not found. Available environments: ${Object.keys(config.environments).join(', ')}`);
    }

    return config.environments[targetEnv];
  }

  /**
   * Get list of available environments
   */
  public getAvailableEnvironments(): string[] {
    const config = this.loadConfig();
    return Object.keys(config.environments);
  }

  /**
   * Get default environment name
   */
  public getDefaultEnvironment(): string {
    const config = this.loadConfig();
    return config.defaultEnv;
  }
}