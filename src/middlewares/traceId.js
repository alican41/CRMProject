// uuid için basit alternatif (test uyumlu)
function generateTraceId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function traceIdMiddleware(req, res, next) {
  // Her istek için benzersiz trace ID
  req.traceId = generateTraceId();
  
  // Response header'a ekle
  res.setHeader('X-Trace-ID', req.traceId);
  
  next();
}

module.exports = traceIdMiddleware;