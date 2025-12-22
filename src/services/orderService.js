const { Order, Customer, OrderItem, Product, sequelize } = require('../models');
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
  // Transaction ile sipariş + item'ları birlikte oluştur
  const order = await sequelize.transaction(async (t) => {
    let customerId = payload.customerId;
    let customer;

    // 1. Müşteri ID verilmişse kontrol et
    if (customerId) {
      customer = await Customer.findByPk(customerId, { transaction: t });
      if (!customer) {
        const error = new Error('Müşteri bulunamadı');
        error.statusCode = 404;
        throw error;
      }
    } 
    // 2. Müşteri ID yoksa ama müşteri bilgileri varsa yeni müşteri oluştur
    else if (payload.guestCustomer) {
      // Mükerrer kontrolü (basitçe email ile)
      if (payload.guestCustomer.email) {
        const existing = await Customer.findOne({ 
          where: { email: payload.guestCustomer.email },
          transaction: t 
        });
        
        if (existing) {
          customer = existing;
          customerId = existing.id;
        } else {
          customer = await Customer.create({
            ...payload.guestCustomer,
            traceId: payload.traceId
          }, { transaction: t });
          customerId = customer.id;
        }
      } else {
        // Email yoksa direkt oluştur (Validation katmanı zorunlu tutabilir ama service esnek olsun)
        customer = await Customer.create({
          ...payload.guestCustomer,
          traceId: payload.traceId
        }, { transaction: t });
        customerId = customer.id;
      }
    } else {
      const error = new Error('Sipariş için müşteri ID veya misafir müşteri bilgileri gereklidir.');
      error.statusCode = 400;
      throw error;
    }

    // Sipariş için adres zorunluluğu kontrolü (Hem mevcut hem yeni müşteri için)
    if (!customer.address || customer.address.trim() === '') {
      const error = new Error('Sipariş oluşturabilmek için müşterinin adres bilgisi kayıtlı olmalıdır.');
      error.statusCode = 400;
      throw error;
    }

    // Eğer items varsa, totalAmount'u hesapla
    let totalAmount = payload.totalAmount;
    
    if (payload.items && payload.items.length > 0) {
      totalAmount = payload.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
    }

    logger.info('Creating order', { 
      traceId: payload.traceId,
      customerId: customerId,
      totalAmount: totalAmount,
      itemCount: payload.items ? payload.items.length : 0
    });

    // Sipariş oluştur
    const newOrder = await Order.create({
      customerId: customerId,
      status: payload.status || 'pending',
      totalAmount: totalAmount
    }, { transaction: t });

    // Eğer items varsa, stok kontrolü yap ve ekle
    if (payload.items && payload.items.length > 0) {
      const orderItems = [];

      for (const item of payload.items) {
        // Eğer productId varsa stok kontrolü yap
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          
          if (!product) {
             const error = new Error(`Ürün bulunamadı: ID ${item.productId}`);
             error.statusCode = 404;
             throw error;
          }

          // Stok takibi aktifse kontrol et ve düş
          if (product.isStockTrackingActive) {
            if (product.stockQuantity < item.quantity) {
              const error = new Error(`Yetersiz stok: ${product.name} (Mevcut: ${product.stockQuantity})`);
              error.statusCode = 400;
              throw error;
            }
            
            await product.decrement('stockQuantity', { 
              by: item.quantity, 
              transaction: t 
            });
          }
        }

        orderItems.push({
          orderId: newOrder.id,
          productId: item.productId || null,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice
        });
      }

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