import { EnvironmentManager } from '../environmentManager';
import { ConfigLoader } from '../../config/configLoader';
import { N8NInstance } from '../../types/config';

// Mock ConfigLoader
jest.mock('../../config/configLoader');

describe('EnvironmentManager - URL Normalization', () => {
  let environmentManager: EnvironmentManager;
  let mockConfigLoader: jest.Mocked<ConfigLoader>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset singleton instance
    (EnvironmentManager as any).instance = undefined;

    // Create mock ConfigLoader instance
    mockConfigLoader = {
      getEnvironmentConfig: jest.fn(),
      getDefaultEnvironment: jest.fn().mockReturnValue('test-env'),
      getAvailableEnvironments: jest.fn().mockReturnValue(['test-env']),
      getInstance: jest.fn()
    } as any;

    // Mock ConfigLoader.getInstance to return our mock
    (ConfigLoader.getInstance as jest.Mock).mockReturnValue(mockConfigLoader);

    // Get EnvironmentManager instance
    environmentManager = EnvironmentManager.getInstance();
  });

  afterEach(() => {
    // Clear cache after each test
    environmentManager.clearCache();
  });

  describe('Edge Case 1: Base URL without /api/v1', () => {
    it('should append /api/v1 to base URL', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_key_1'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/api/v1');
      expect(mockConfigLoader.getEnvironmentConfig).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Edge Case 2: Base URL with trailing slash', () => {
    it('should remove trailing slash and append /api/v1', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com/',
        n8n_api_key: 'test_key_2'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/api/v1');
    });
  });

  describe('Edge Case 3: Base URL with multiple trailing slashes', () => {
    it('should remove all trailing slashes and append /api/v1', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com//',
        n8n_api_key: 'test_key_3'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/api/v1');
    });
  });

  describe('Edge Case 4: Base URL with /api/v1 (backward compatibility)', () => {
    it('should remove existing /api/v1 and re-append it (no duplication)', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com/api/v1',
        n8n_api_key: 'test_key_4'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/api/v1');
      expect(apiInstance.defaults.baseURL).not.toBe('https://n8n.example.com/api/v1/api/v1');
    });
  });

  describe('Edge Case 5: Base URL with /api/v1/ (backward compatibility with trailing slash)', () => {
    it('should remove existing /api/v1/ and re-append /api/v1 (no duplication)', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com/api/v1/',
        n8n_api_key: 'test_key_5'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/api/v1');
      expect(apiInstance.defaults.baseURL).not.toBe('https://n8n.example.com/api/v1/api/v1');
    });
  });

  describe('Edge Case 6: localhost without /api/v1', () => {
    it('should append /api/v1 to localhost URL', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'http://localhost:5678',
        n8n_api_key: 'test_key_6'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('http://localhost:5678/api/v1');
    });
  });

  describe('Edge Case 7: localhost with /api/v1 (backward compatibility)', () => {
    it('should not duplicate /api/v1 for localhost', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'http://localhost:5678/api/v1',
        n8n_api_key: 'test_key_7'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('http://localhost:5678/api/v1');
      expect(apiInstance.defaults.baseURL).not.toBe('http://localhost:5678/api/v1/api/v1');
    });
  });

  describe('Edge Case 8: n8n Cloud URL format', () => {
    it('should handle n8n Cloud URLs correctly', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://your-instance.app.n8n.cloud',
        n8n_api_key: 'test_key_8'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://your-instance.app.n8n.cloud/api/v1');
    });
  });

  describe('Singleton Caching Behavior', () => {
    it('should return cached axios instance on subsequent calls', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_key_cache'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      // First call - should create new instance
      const firstInstance = environmentManager.getApiInstance();

      // Second call - should return cached instance
      const secondInstance = environmentManager.getApiInstance();

      // Verify they are the same instance
      expect(firstInstance).toBe(secondInstance);

      // Verify ConfigLoader was only called once
      expect(mockConfigLoader.getEnvironmentConfig).toHaveBeenCalledTimes(1);
    });

    it('should cache different instances for different environments', () => {
      const prodConfig: N8NInstance = {
        n8n_host: 'https://n8n-prod.example.com',
        n8n_api_key: 'prod_key'
      };

      const stagingConfig: N8NInstance = {
        n8n_host: 'https://n8n-staging.example.com',
        n8n_api_key: 'staging_key'
      };

      mockConfigLoader.getEnvironmentConfig
        .mockReturnValueOnce(prodConfig)
        .mockReturnValueOnce(stagingConfig);

      mockConfigLoader.getDefaultEnvironment
        .mockReturnValueOnce('production')
        .mockReturnValueOnce('staging');

      // Get instance for production
      const prodInstance = environmentManager.getApiInstance('production');

      // Get instance for staging
      const stagingInstance = environmentManager.getApiInstance('staging');

      // Verify they are different instances
      expect(prodInstance).not.toBe(stagingInstance);

      // Verify different baseURLs
      expect(prodInstance.defaults.baseURL).toBe('https://n8n-prod.example.com/api/v1');
      expect(stagingInstance.defaults.baseURL).toBe('https://n8n-staging.example.com/api/v1');
    });

    it('should use cached instance for same environment on repeated calls', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      // Multiple calls for same environment
      const instance1 = environmentManager.getApiInstance('test-env');
      const instance2 = environmentManager.getApiInstance('test-env');
      const instance3 = environmentManager.getApiInstance('test-env');

      // All should be the same instance
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);

      // ConfigLoader should only be called once
      expect(mockConfigLoader.getEnvironmentConfig).toHaveBeenCalledTimes(1);
    });

    it('should clear cache and create new instances after clearCache()', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      // Get first instance
      const firstInstance = environmentManager.getApiInstance();

      // Clear cache
      environmentManager.clearCache();

      // Get new instance after cache clear
      const secondInstance = environmentManager.getApiInstance();

      // Instances should be different
      expect(firstInstance).not.toBe(secondInstance);

      // ConfigLoader should be called twice (once before clear, once after)
      expect(mockConfigLoader.getEnvironmentConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('API Key Header Configuration', () => {
    it('should set correct X-N8N-API-KEY header', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_api_key_12345'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.headers['X-N8N-API-KEY']).toBe('test_api_key_12345');
      expect(apiInstance.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should throw error with context when ConfigLoader fails', () => {
      const configError = new Error('Configuration not found');
      mockConfigLoader.getEnvironmentConfig.mockImplementation(() => {
        throw configError;
      });

      expect(() => {
        environmentManager.getApiInstance('invalid-env');
      }).toThrow('Failed to get API instance: Configuration not found');
    });

    it('should provide helpful error message for missing environment', () => {
      mockConfigLoader.getEnvironmentConfig.mockImplementation(() => {
        throw new Error('Environment "missing" not found');
      });

      expect(() => {
        environmentManager.getApiInstance('missing');
      }).toThrow();
    });
  });

  describe('Environment Configuration Delegation', () => {
    it('should delegate getEnvironmentConfig to ConfigLoader', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const result = environmentManager.getEnvironmentConfig('test-env');

      expect(result).toEqual(mockConfig);
      expect(mockConfigLoader.getEnvironmentConfig).toHaveBeenCalledWith('test-env');
    });

    it('should delegate getAvailableEnvironments to ConfigLoader', () => {
      const mockEnvironments = ['production', 'staging', 'development'];
      mockConfigLoader.getAvailableEnvironments.mockReturnValue(mockEnvironments);

      const result = environmentManager.getAvailableEnvironments();

      expect(result).toEqual(mockEnvironments);
      expect(mockConfigLoader.getAvailableEnvironments).toHaveBeenCalled();
    });

    it('should delegate getDefaultEnvironment to ConfigLoader', () => {
      mockConfigLoader.getDefaultEnvironment.mockReturnValue('production');

      const result = environmentManager.getDefaultEnvironment();

      expect(result).toBe('production');
      expect(mockConfigLoader.getDefaultEnvironment).toHaveBeenCalled();
    });
  });

  describe('Normalization Logic Integration', () => {
    it('should handle complex URL with path, trailing slashes, and /api/v1', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com/path/to/n8n/api/v1///',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      // Should remove trailing slashes and existing /api/v1, then re-append
      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com/path/to/n8n/api/v1');
    });

    it('should preserve port numbers in URL', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'https://n8n.example.com:8443',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('https://n8n.example.com:8443/api/v1');
    });

    it('should handle custom ports with /api/v1 already present', () => {
      const mockConfig: N8NInstance = {
        n8n_host: 'http://localhost:5678/api/v1/',
        n8n_api_key: 'test_key'
      };

      mockConfigLoader.getEnvironmentConfig.mockReturnValue(mockConfig);

      const apiInstance = environmentManager.getApiInstance();

      expect(apiInstance.defaults.baseURL).toBe('http://localhost:5678/api/v1');
    });
  });
});
