const request = require('supertest');
const app = require('../src/app');
const { Customer } = require('../src/models');

describe('Customers API', () => {
  
  describe('GET /api/customers', () => {
    test('should return empty array when no customers', async () => {
      const res = await request(app).get('/api/customers');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should return all customers', async () => {
      // Test verisi oluştur
      await Customer.bulkCreate([
        { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@test.com', phone: '05321112233' },
        { firstName: 'Mehmet', lastName: 'Demir', email: 'mehmet@test.com', phone: '05321112234' }
      ]);

      const res = await request(app).get('/api/customers');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].firstName).toBe('Ahmet');
    });
  });

  describe('POST /api/customers', () => {
    test('should create customer with valid data', async () => {
      const customerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '05321112233',
        address: 'Test Address'
      };

      const res = await request(app)
        .post('/api/customers')
        .send(customerData);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.firstName).toBe('Test');
      expect(res.body.email).toBe('test@example.com');
    });

    test('should fail without firstName', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ lastName: 'User' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ 
          firstName: 'Test',
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with invalid phone', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({ 
          firstName: 'Test',
          phone: '123' // Çok kısa
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/customers/:id', () => {
    test('should return customer by id', async () => {
      const customer = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@test.com',
        phone: '05321112233'
      });

      const res = await request(app).get(`/api/customers/${customer.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(customer.id);
      expect(res.body.firstName).toBe('Ahmet');
    });

    test('should return 404 for non-existent customer', async () => {
      const res = await request(app).get('/api/customers/99999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 for invalid id', async () => {
      const res = await request(app).get('/api/customers/invalid');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    test('should update customer', async () => {
      const customer = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@test.com'
      });

      const res = await request(app)
        .put(`/api/customers/${customer.id}`)
        .send({ 
          firstName: 'Mehmet',
          phone: '05321112233'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe('Mehmet');
      expect(res.body.phone).toBe('05321112233');
    });

    test('should return 404 for non-existent customer', async () => {
      const res = await request(app)
        .put('/api/customers/99999')
        .send({ firstName: 'Test' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    test('should delete customer', async () => {
      const customer = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz'
      });

      const res = await request(app).delete(`/api/customers/${customer.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBeDefined();

      // Silindiğini doğrula
      const deletedCustomer = await Customer.findByPk(customer.id);
      expect(deletedCustomer).toBeNull();
    });

    test('should return 404 for non-existent customer', async () => {
      const res = await request(app).delete('/api/customers/99999');

      expect(res.statusCode).toBe(404);
    });
  });
});