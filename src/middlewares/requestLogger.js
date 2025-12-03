const logger = require('../lib/logger');

function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Request bilgilerini logla
  logger.info('Incoming request', {
    traceId: req.traceId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Response bittiğinde logla
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'Request completed', {
      traceId: req.traceId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
}

module.exports = requestLogger;