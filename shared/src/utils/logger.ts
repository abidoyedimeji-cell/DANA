type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private isDev = process.env.NODE_ENV !== "production";

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDev && level === "debug") return;

    const prefix = `[DANA-${level.toUpperCase()}]`;
    const args = data === undefined ? [prefix, message] : [prefix, message, data];

    switch (level) {
      case "info":
        console.info(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      case "debug":
      default:
        console.log(...args);
        break;
    }
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data);
  }
}

export const logger = new Logger();
