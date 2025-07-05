export interface N8NInstance {
  n8n_host: string;
  n8n_api_key: string;
}

export interface MultiInstanceConfig {
  environments: Record<string, N8NInstance>;
  defaultEnv: string;
}

export interface Config {
  // For backward compatibility - single instance
  n8n_host?: string;
  n8n_api_key?: string;
  
  // For multi-instance support
  environments?: Record<string, N8NInstance>;
  defaultEnv?: string;
}