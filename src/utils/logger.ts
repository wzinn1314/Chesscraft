type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const context = entry.context ? `[${entry.context}]` : '';
    return `${timestamp} ${entry.level.toUpperCase()} ${context} ${entry.message}`;
  }

  private log(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    const message = this.formatMessage(entry);

    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.data);
        break;
    }
    if (this.isDevelopment) {
      try {
        localStorage.setItem('chesscraft_logs', JSON.stringify(this.logs));
      } catch {
      }
    }
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log({
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  info(message: string, context?: string, data?: unknown) {
    this.log({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  error(message: string, context?: string, data?: unknown) {
    this.log({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    if (this.isDevelopment) {
      try {
        localStorage.removeItem('chesscraft_logs');
      } catch {
      }
    }
  }

  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }
}

export const logger = new Logger();
