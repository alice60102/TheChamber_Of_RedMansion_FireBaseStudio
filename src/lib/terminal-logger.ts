/**
 * @fileOverview Terminal Logger Utility
 * 終端日誌記錄工具
 * 
 * This utility provides enhanced logging capabilities for debugging
 * async generator and streaming issues in the Perplexity QA system.
 * Logs are written to terminal and log files but NOT shown in UI.
 */

import { promises as fs } from 'fs';
import path from 'path';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'TRACE';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class TerminalLogger {
  private logDir: string;
  private currentLogFile: string;
  private isEnabled: boolean;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.currentLogFile = path.join(
      this.logDir,
      `perplexity-debug-${new Date().toISOString().split('T')[0]}.log`
    );
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGGING === 'true';
    
    if (this.isEnabled) {
      this.ensureLogDir();
    }
  }

  private async ensureLogDir(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, category, message, data, stack } = entry;
    let logLine = `[${timestamp}] [${level}] [${category}] ${message}`;
    
    if (data) {
      logLine += `\nDATA: ${JSON.stringify(data, null, 2)}`;
    }
    
    if (stack) {
      logLine += `\nSTACK: ${stack}`;
    }
    
    return logLine + '\n';
  }

  private async writeToFile(logEntry: LogEntry): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const logLine = this.formatLog(logEntry);
      await fs.appendFile(this.currentLogFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    includeStack = false
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      stack: includeStack ? new Error().stack : undefined,
    };
  }

  async debug(category: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('DEBUG', category, message, data);
    console.log(`🐛 [${category}] ${message}`, data || '');
    await this.writeToFile(entry);
  }

  async info(category: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('INFO', category, message, data);
    console.log(`ℹ️  [${category}] ${message}`, data || '');
    await this.writeToFile(entry);
  }

  async warn(category: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('WARN', category, message, data);
    console.warn(`⚠️  [${category}] ${message}`, data || '');
    await this.writeToFile(entry);
  }

  async error(category: string, message: string, error?: any): Promise<void> {
    const entry = this.createLogEntry('ERROR', category, message, error, true);
    console.error(`❌ [${category}] ${message}`, error || '');
    await this.writeToFile(entry);
  }

  async trace(category: string, message: string, data?: any): Promise<void> {
    const entry = this.createLogEntry('TRACE', category, message, data, true);
    console.log(`🔍 [${category}] ${message}`, data || '');
    await this.writeToFile(entry);
  }

  // Specialized methods for async generator debugging
  async logAsyncGeneratorStart(category: string, functionName: string, input: any): Promise<void> {
    await this.debug(category, `Starting async generator: ${functionName}`, {
      functionName,
      inputType: typeof input,
      inputKeys: input ? Object.keys(input) : [],
      hasAsyncIterator: input && typeof input[Symbol.asyncIterator] === 'function',
    });
  }

  async logAsyncGeneratorError(category: string, functionName: string, error: any): Promise<void> {
    await this.error(category, `Async generator error in ${functionName}`, {
      functionName,
      errorType: error?.constructor?.name,
      errorMessage: error?.message,
      isTypeError: error instanceof TypeError,
      stack: error?.stack,
    });
  }

  async logForAwaitStart(category: string, iterableSource: string, iterableType: any): Promise<void> {
    await this.debug(category, `Starting for-await loop on: ${iterableSource}`, {
      iterableSource,
      iterableType: typeof iterableType,
      hasAsyncIterator: iterableType && typeof iterableType[Symbol.asyncIterator] === 'function',
      hasIterator: iterableType && typeof iterableType[Symbol.iterator] === 'function',
      constructorName: iterableType?.constructor?.name,
    });
  }

  async logFunctionCall(category: string, functionName: string, args: any[], returnType?: any): Promise<void> {
    await this.debug(category, `Function call: ${functionName}`, {
      functionName,
      argsLength: args.length,
      argsTypes: args.map(arg => typeof arg),
      returnType: typeof returnType,
      returnConstructor: returnType?.constructor?.name,
      hasAsyncIterator: returnType && typeof returnType[Symbol.asyncIterator] === 'function',
    });
  }

  // Get current log file path for reference
  getLogFilePath(): string {
    return this.currentLogFile;
  }

  // Enable/disable logging dynamically
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const terminalLogger = new TerminalLogger();

// Convenience functions
export const debugLog = terminalLogger.debug.bind(terminalLogger);
export const infoLog = terminalLogger.info.bind(terminalLogger);
export const warnLog = terminalLogger.warn.bind(terminalLogger);
export const errorLog = terminalLogger.error.bind(terminalLogger);
export const traceLog = terminalLogger.trace.bind(terminalLogger);
