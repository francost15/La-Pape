import { notify } from "@/lib/notify";

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private minLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = ["🔍", "ℹ️", "⚠️", "❌"][level];
    const msg = `${prefix} [${entry.timestamp.toISOString()}] ${message}`;

    if (level === LogLevel.ERROR) {
      console.error(msg, context);
      notify.error({ title: "Error", description: message });
    } else if (level === LogLevel.WARN) {
      console.warn(msg, context);
    } else {
      console.log(msg, context);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
