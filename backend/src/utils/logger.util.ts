/**
 * Logger utility for the application
 * Provides structured logging with different levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;

    let log = `[${timestamp}] [${level}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      log += ` ${JSON.stringify(context)}`;
    }

    if (error) {
      log += `\nError: ${error.message}`;
      if (error.stack && this.isDevelopment) {
        log += `\nStack: ${error.stack}`;
      }
    }

    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Request logging helper
  logRequest(method: string, path: string, statusCode: number, duration: number) {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `${method} ${path} ${statusCode} - ${duration}ms`, {
      method,
      path,
      statusCode,
      duration,
    });
  }

  // Database operation logging helper
  logDatabaseOperation(operation: string, model: string, duration: number, error?: Error) {
    if (error) {
      this.error(`Database operation failed: ${operation} on ${model}`, error, { operation, model, duration });
    } else {
      this.debug(`Database operation: ${operation} on ${model}`, { operation, model, duration });
    }
  }

  // Authentication logging helper
  logAuthEvent(event: string, userId?: string, context?: Record<string, any>) {
    this.info(`Auth event: ${event}`, { userId, ...context });
  }
}

export const logger = new Logger();
