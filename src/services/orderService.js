const { Order, Customer } = require('../models');
const logger = require('../lib/logger');

async function listOrders(filters = {}) {
  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.customerId) {
    where.customerId = filters.customerId;
  }
  
  return Order.findAll({
    where,
    include: [{
      model: Customer,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }],
    limit: filters.limit || 50,
    order: [['createdAt', 'DESC']]
  });
}

async function createOrder(payload) {
  // Müşterinin var olduğunu kontrol et
  const customer = await Customer.findByPk(payload.customerId);
  if (!customer) {
    const error = new Error('Müşteri bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  
  logger.info('Creating order', { 
    traceId: payload.traceId,
    customerId: payload.customerId,
    totalAmount: payload.totalAmount
    });
  const order = await Order.create(payload);
  
  // Müşteri bilgisi ile birlikte döndür
  return Order.findByPk(order.id, {
    include: [{
      model: Customer,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }]
  });
}

async function getOrderById(id, traceId) {
  const order = await Order.findByPk(id, {
    include: [{
      model: Customer,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    }]
  });
  
  if (!order) {
    const error = new Error('Sipariş bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  logger.info('Order found', { 
    traceId,
    id,
    customerId: order.customerId
    });
  return order;
}

async function updateOrder(id, payload) {
  const order = await Order.findByPk(id);
  if (!order) {
    const error = new Error('Sipariş bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  
  logger.info('Updating order', { 
    traceId: payload.traceId,
    id,
    status: payload.status
    });
  await order.update(payload);
  
  // Güncel veriyi müşteri bilgisi ile döndür
  return Order.findByPk(id, {
    include: [{
      model: Customer,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }]
  });
}

async function deleteOrder(id, traceId) {
  const order = await Order.findByPk(id);
  if (!order) {
    const error = new Error('Sipariş bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  
  logger.info('Deleting order', { 
    traceId,
    id 
    });
  await order.destroy();
  return { message: 'Sipariş başarıyla silindi' };
}

module.exports = {
  listOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
};