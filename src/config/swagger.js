const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini-CRM API',
      version: '1.0.0',
      description: 'E-Ticaret firması için müşteri ve sipariş yönetim sistemi API dokümantasyonu',
      contact: {
        name: 'API Destek',
        email: 'support@minicrm.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.minicrm.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          required: ['firstName'],
          properties: {
            id: {
              type: 'integer',
              description: 'Otomatik artan benzersiz ID',
              example: 1
            },
            firstName: {
              type: 'string',
              description: 'Müşterinin adı',
              minLength: 2,
              maxLength: 50,
              example: 'Ahmet'
            },
            lastName: {
              type: 'string',
              description: 'Müşterinin soyadı',
              minLength: 2,
              maxLength: 50,
              example: 'Yılmaz'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email adresi',
              example: 'ahmet@example.com'
            },
            phone: {
              type: 'string',
              pattern: '^(\\+90|0)?[0-9]{10}$',
              description: 'Telefon numarası (05XXXXXXXXX formatında)',
              example: '05321112233'
            },
            address: {
              type: 'string',
              maxLength: 500,
              description: 'Müşteri adresi',
              example: 'İstanbul, Kadıköy'
            },
            isActive: {
              type: 'boolean',
              description: 'Müşteri aktif mi?',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['customerId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Otomatik artan benzersiz ID',
              example: 1
            },
            customerId: {
              type: 'integer',
              description: 'Müşteri ID',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Sipariş durumu',
              default: 'pending',
              example: 'pending'
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Toplam tutar',
              example: 250.50
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi'
            },
            Customer: {
              $ref: '#/components/schemas/Customer'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Bir hata oluştu'
            },
            traceId: {
              type: 'string',
              example: 'abc123xyz789'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;