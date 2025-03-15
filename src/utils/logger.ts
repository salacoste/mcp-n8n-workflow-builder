// Расширенный логгер для работы с Claude App MCP
// Добавляет временные метки и вывод ключевой информации

/**
 * Создает форматированную строку для лога с временной меткой и уровнем логирования
 */
function formatLogMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `${timestamp} [n8n-workflow-builder] [${level}] ${message}`;
}

export const logger = {
  info: function(message: string = '', ...args: any[]) {
    if (message) {
      console.error(formatLogMessage('info', message));
      if (args.length > 0) {
        console.error(...args);
      }
    }
  },
  
  warn: function(message: string = '', ...args: any[]) {
    if (message) {
      console.error(formatLogMessage('warn', message));
      if (args.length > 0) {
        console.error(...args);
      }
    }
  },
  
  error: function(message: string = '', ...args: any[]) {
    if (message) {
      console.error(formatLogMessage('error', message));
      if (args.length > 0) {
        console.error(...args);
      }
    }
  },
  
  debug: function(message: string = '', ...args: any[]) {
    if (message) {
      console.error(formatLogMessage('debug', message));
      if (args.length > 0) {
        console.error(...args);
      }
    }
  },
  
  log: function(message: string = '', ...args: any[]) {
    if (message) {
      console.error(formatLogMessage('log', message));
      if (args.length > 0) {
        console.error(...args);
      }
    }
  }
};

export default logger; 