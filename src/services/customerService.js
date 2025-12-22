const { Customer } = require('../models');
const { Op } = require('sequelize');
const logger = require('../lib/logger');

async function listCustomers() {
  return Customer.findAll({
    limit: 50 // TODO: pagination eksik
  });
}

async function createCustomer(payload) {
  // Email veya telefon numarası ile mükerrer kayıt kontrolü
  const whereConditions = [];
  if (payload.email) whereConditions.push({ email: payload.email });
  if (payload.phone) whereConditions.push({ phone: payload.phone });

  if (whereConditions.length > 0) {
    const existingCustomer = await Customer.findOne({
      where: {
        [Op.or]: whereConditions
      }
    });

    if (existingCustomer) {
      const error = new Error('Bu email veya telefon numarası ile kayıtlı müşteri zaten var.');
      error.statusCode = 400;
      throw error;
    }
  }

  logger.info('Creating customer', { 
    traceId: payload.traceId,
    firstName: payload.firstName,
    email: payload.email 
  });
  const customer = await Customer.create(payload);
  return customer;
}

async function getCustomerById(id, traceId) {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const error = new Error('Müşteri bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  logger.info('Customer found', { 
    traceId,
    id,
    firstName: customer.firstName
  });
  return customer;
}

async function updateCustomer(id, payload) {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const error = new Error('Müşteri bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  
  logger.info('Updating customer', { 
    traceId: payload.traceId,
    id,
    firstName: payload.firstName
  });
  await customer.update(payload);
  return customer;
}

async function deleteCustomer(id, traceId) {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const error = new Error('Müşteri bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  
  logger.info('Deleting customer', { 
    traceId,
    id 
  });
  await customer.destroy();
  return { message: 'Müşteri başarıyla silindi' };
}

module.exports = {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
