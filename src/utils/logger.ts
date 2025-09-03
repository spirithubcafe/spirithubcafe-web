/**
 * Production-safe logger utility
 * Only logs in development mode to improve performance
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors even in production for debugging
    console.error(...args)
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  
  // Silent logger for production - no output at all
  silent: {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  }
}

// Export shortcuts
export const devLog = logger.log
export const devWarn = logger.warn
export const devError = logger.error
export const devInfo = logger.info
export const devDebug = logger.debug
