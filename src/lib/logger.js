const { createLogger, transports, format } = require('winston');
require('winston-daily-rotate-file');

// Log formatı
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Console için özel format (development)
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, traceId, ...meta }) => {
    let msg = `${timestamp} [${level}]`;
    if (traceId) msg += ` [${traceId}]`;
    msg += `: ${message}`;
    
    // Meta bilgiler varsa ekle
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return metaStr ? `${msg}\n${metaStr}` : msg;
  })
);

// Günlük log dosyaları için rotate ayarı
const fileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Error logları için ayrı dosya
const errorFileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat
});

// Logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    fileRotateTransport,
    errorFileRotateTransport
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Development ortamında console'a da yaz
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat
  }));
}

// Test ortamında logları kapat
if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach((t) => (t.silent = true));
}

module.exports = logger;