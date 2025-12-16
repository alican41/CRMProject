const { Order, Customer, OrderItem, sequelize } = require('../models');
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
    include: [
      {
        model: Customer,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'productName', 'quantity', 'unitPrice', 'subtotal']
      }
    ],
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

  // Transaction ile sipariş + item'ları birlikte oluştur
  const order = await sequelize.transaction(async (t) => {
    // Eğer items varsa, totalAmount'u hesapla
    let totalAmount = payload.totalAmount;
    
    if (payload.items && payload.items.length > 0) {
      totalAmount = payload.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
    }

    logger.info('Creating order', { 
      traceId: payload.traceId,
      customerId: payload.customerId,
      totalAmount: totalAmount,
      itemCount: payload.items ? payload.items.length : 0
    });

    // Sipariş oluştur
    const newOrder = await Order.create({
      customerId: payload.customerId,
      status: payload.status || 'pending',
      totalAmount: totalAmount
    }, { transaction: t });

    // Eğer items varsa, ekle
    if (payload.items && payload.items.length > 0) {
      const orderItems = payload.items.map(item => ({
        orderId: newOrder.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      }));

      await OrderItem.bulkCreate(orderItems, { transaction: t });
    }

    return newOrder;
  });
  
  // Müşteri ve item bilgisi ile birlikte döndür
  return Order.findByPk(order.id, {
    include: [
      {
        model: Customer,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'productName', 'quantity', 'unitPrice', 'subtotal']
      }
    ]
  });
}

async function getOrderById(id, traceId) {
  const order = await Order.findByPk(id, {
    include: [
      {
        model: Customer,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'productName', 'quantity', 'unitPrice', 'subtotal']
      }
    ]
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
  
  // Güncel veriyi müşteri ve item bilgisi ile döndür
  return Order.findByPk(id, {
    include: [
      {
        model: Customer,
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: OrderItem,
        as: 'items',
        attributes: ['id', 'productName', 'quantity', 'unitPrice', 'subtotal']
      }
    ]
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