// src/logger/winston.logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.printf(
  ({ level, message, timestamp, context }) =>
    `${timestamp} [${level.toUpperCase()}]${context ? ' [' + context + ']' : ''} ${message}`,
);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    // 🖥 consola
    new winston.transports.Console(),

    // 📄 logs diarios
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),

    // ❌ errores
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
    }),
  ],
});
