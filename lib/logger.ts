type LogLevel = 'info' | 'error' | 'warn' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  args?: any[]
}

// Simple logger that doesn't depend on pino-pretty
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        args: args.length ? args : undefined,
      }
      console.log(`[INFO] ${entry.timestamp} - ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      args: args.length ? args : undefined,
    }
    console.error(`[ERROR] ${entry.timestamp} - ${message}`, ...args)
    
    // In production, you might want to send errors to a monitoring service
    if (process.env.NODE_ENV === "production") {
      // TODO: Implement error reporting service integration
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      args: args.length ? args : undefined,
    }
    console.warn(`[WARN] ${entry.timestamp} - ${message}`, ...args)
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        args: args.length ? args : undefined,
      }
      console.debug(`[DEBUG] ${entry.timestamp} - ${message}`, ...args)
    }
  },
  
  // Helper to log contract interactions
  contract: {
    call: (functionName: string, args?: any[]) => {
      logger.debug(`Contract call: ${functionName}`, args)
    },
    success: (functionName: string, result: any) => {
      logger.info(`Contract call successful: ${functionName}`, result)
    },
    error: (functionName: string, error: any) => {
      logger.error(`Contract call failed: ${functionName}`, error)
    },
  },
}
