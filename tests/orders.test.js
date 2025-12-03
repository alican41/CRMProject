const request = require('supertest');
const app = require('../src/app');
const { Customer, Order } = require('../src/models');

describe('Orders API', () => {
  let customer;

  // Her testten önce bir müşteri oluştur
  beforeEach(async () => {
    customer = await Customer.create({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com',
      phone: '05321112233'
    });
  });

  describe('GET /api/orders', () => {
    test('should return empty array when no orders', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should return all orders with customer info', async () => {
      await Order.bulkCreate([
        { customerId: customer.id, status: 'pending', totalAmount: 100.50 },
        { customerId: customer.id, status: 'shipped', totalAmount: 250.00 }
      ]);

      const res = await request(app).get('/api/orders');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].Customer).toBeDefined();
      expect(res.body[0].Customer.firstName).toBe('Test');
    });

    test('should filter orders by status', async () => {
      await Order.bulkCreate([
        { customerId: customer.id, status: 'pending', totalAmount: 100 },
        { customerId: customer.id, status: 'shipped', totalAmount: 200 }
      ]);

      const res = await request(app).get('/api/orders?status=pending');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe('pending');
    });
  });

  describe('POST /api/orders', () => {
    test('should create order with valid data', async () => {
      const orderData = {
        customerId: customer.id,
        status: 'pending',
        totalAmount: 150.75
      };

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.customerId).toBe(customer.id);
      expect(res.body.Customer).toBeDefined();
    });

    test('should fail without customerId', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ status: 'pending' });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with non-existent customer', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ 
          customerId: 99999,
          status: 'pending'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('bulunamadı');
    });

    test('should fail with invalid status', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ 
          customerId: customer.id,
          status: 'invalid_status'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with negative amount', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ 
          customerId: customer.id,
          totalAmount: -50
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should return order by id with customer info', async () => {
      const order = await Order.create({
        customerId: customer.id,
        status: 'pending',
        totalAmount: 100
      });

      const res = await request(app).get(`/api/orders/${order.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(order.id);
      expect(res.body.Customer).toBeDefined();
      expect(res.body.Customer.firstName).toBe('Test');
    });

    test('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/99999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('should update order status', async () => {
      const order = await Order.create({
        customerId: customer.id,
        status: 'pending',
        totalAmount: 100
      });

      const res = await request(app)
        .put(`/api/orders/${order.id}`)
        .send({ status: 'shipped' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('shipped');
    });

    test('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/99999')
        .send({ status: 'shipped' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('should delete order', async () => {
      const order = await Order.create({
        customerId: customer.id,
        status: 'pending'
      });

      const res = await request(app).delete(`/api/orders/${order.id}`);

      expect(res.statusCode).toBe(200);

      const deletedOrder = await Order.findByPk(order.id);
      expect(deletedOrder).toBeNull();
    });

    test('should return 404 for non-existent order', async () => {
      const res = await request(app).delete('/api/orders/99999');

      expect(res.statusCode).toBe(404);
    });
  });
});