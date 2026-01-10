const express = require('express');
const logger = require('./lib/logger');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const traceIdMiddleware = require('./middlewares/traceId');
const requestLogger = require('./middlewares/requestLogger');
const cors = require('cors');

const app = express();


app.use(express.json());

app.use(traceIdMiddleware);
app.use(requestLogger);


// basit log kaldırıldı


// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Database bağlantısını kontrol et
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: require('../package.json').version
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
  exposedHeaders: ['X-Trace-ID'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
// Hata yakalama middleware
app.use((err, req, res, next) => {
  const traceId = req.traceId;
  const statusCode = err.statusCode || 500;
  
  // Log error
  logger.error('Error occurred', {
    traceId,
    error: err.message,
    stack: err.stack,
    statusCode
  });

  // Production'da stack trace gönderme
  const response = {
    success: false,
    message: err.message || 'Bir hata oluştu',
    traceId
  };

  // Development'ta stack trace ekle
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Validation errors varsa ekle
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = app;
