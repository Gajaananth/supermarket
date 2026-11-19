import { LoggerService, LogLevel } from '@nestjs/common';
import { inspect } from 'node:util';

export class StructuredLogger implements LoggerService {
  private enabledLevels = new Set<LogLevel>([
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
    'fatal',
  ]);

  log(message: unknown, ...optionalParams: unknown[]) {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.write('fatal', message, optionalParams);
  }

  setLogLevels(levels: LogLevel[]) {
    this.enabledLevels = new Set(levels);
  }

  private write(level: LogLevel, message: unknown, optionalParams: unknown[]) {
    if (!this.enabledLevels.has(level)) return;

    const stack = level === 'error'
      ? optionalParams.find((value): value is string =>
          typeof value === 'string' && value.includes('\n'),
        )
      : undefined;
    const context = [...optionalParams].reverse().find(
      (value): value is string =>
        typeof value === 'string' && value !== stack,
    );
    const record = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof message === 'string' ? message : inspect(message),
      ...(stack ? { stack } : {}),
    };
    const output = `${JSON.stringify(record)}\n`;

    if (level === 'error' || level === 'fatal') {
      process.stderr.write(output);
    } else {
      process.stdout.write(output);
    }
  }
}
