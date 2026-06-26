const path = require('path');

let winston;
try {
  winston = require('winston');
} catch {
  // winston no instalado - usar logger simple
}

const logDir = path.join(__dirname, '../../logs');
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Streams asíncronos para el fallback — evita bloquear el event loop
// con fs.appendFileSync en cada llamada al logger
const combinedStream = fs.createWriteStream(
  path.join(logDir, 'combined.log'), { flags: 'a' }
);
const errorStream = fs.createWriteStream(
  path.join(logDir, 'error.log'), { flags: 'a' }
);

const simpleLogger = {
  info: (msg, meta) => {
    const line = `[${new Date().toISOString()}] [INFO] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`;
    combinedStream.write(line);
  },
  warn: (msg, meta) => {
    const line = `[${new Date().toISOString()}] [WARN] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`;
    combinedStream.write(line);
  },
  error: (msg, meta) => {
    const line = `[${new Date().toISOString()}] [ERROR] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`;
    errorStream.write(line);
    combinedStream.write(line);
  },
};

const logger = winston
  ? winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 10,
      }),
    ],
  })
  : simpleLogger;

if (winston && process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${extra}`;
      }),
    ),
  }));
}

module.exports = logger;
