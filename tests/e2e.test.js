const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('E2E Tests - Complete Workflows', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Senaryo 1: Müşteri Oluştur ve Sipariş Ver', () => {
    it('1. Yeni müşteri oluştur', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          email: 'ahmet@example.com',
          phone: '05321112233',
          address: 'İstanbul'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.firstName).toBe('Ahmet');
      expect(res.body.email).toBe('ahmet@example.com');
    });

    it('2. Müşteri bilgilerini getir', async () => {
      // Müşteri oluştur
      const createRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Mehmet',
          lastName: 'Demir',
          email: 'mehmet@example.com',
          phone: '05321112234',
          address: 'Ankara'
        });
      
      const customerId = createRes.body.id;

      // Müşteriyi getir
      const res = await request(app).get(`/api/customers/${customerId}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('mehmet@example.com');
      expect(res.body.firstName).toBe('Mehmet');
    });

    it('3. Müşteriye sipariş oluştur', async () => {
      // Müşteri oluştur
      const createRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Ali',
          lastName: 'Veli',
          email: 'ali@example.com',
          phone: '05321112235',
          address: 'Test Adresi No:1 Istanbul'
        });
      
      const customerId = createRes.body.id;

      // Sipariş oluştur
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'pending',
          totalAmount: '150.75'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.customerId).toBe(customerId);
      expect(res.body.totalAmount).toBe('150.75');
    });

    it('4. Sipariş durumunu güncelle', async () => {
      // Müşteri oluştur
      const customerRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Ayşe',
          lastName: 'Kaya',
          email: 'ayse@example.com',
          phone: '05321112236',
          address: 'İzmir'
        });
      
      const customerId = customerRes.body.id;

      // Sipariş oluştur
      const orderRes = await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'pending',
          totalAmount: '150.75' 
        });
      
      const orderId = orderRes.body.id;

      // Sipariş durumunu güncelle
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'shipped' });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('shipped');
    });

    it('5. Müşterinin siparişlerini listele', async () => {
      // Müşteri oluştur
      const customerRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Fatma',
          lastName: 'Şahin',
          email: 'fatma@example.com',
          phone: '05321112237',
          address: 'Bursa'
        });
      
      const customerId = customerRes.body.id;

      // 2 sipariş oluştur
      await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'pending',
          totalAmount: '200.00'
        });

      await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'delivered',
          totalAmount: '350.50'
        });

      // Müşterinin siparişlerini listele
      const res = await request(app).get(`/api/orders?customerId=${customerId}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].customerId).toBe(customerId);
      expect(res.body[1].customerId).toBe(customerId);
    });
  });

  describe('Senaryo 2: Validation ve Error Handling', () => {
    it('1. Geçersiz email ile müşteri oluşturma denemesi', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('2. Olmayan müşteriye sipariş oluşturma denemesi', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: 99999,
          status: 'pending'
        });

      expect(res.status).toBe(404);
    });

    it('3. Geçersiz ID ile müşteri getirme denemesi', async () => {
      const res = await request(app).get('/api/customers/abc');

      expect(res.status).toBe(400);
    });

    it('4. Geçersiz status ile sipariş oluşturma denemesi', async () => {
      // Önce geçerli bir müşteri oluştur
      const customerRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'testvalidation@example.com',
          phone: '05321112299'
        });
      
      const customerId = customerRes.body.id;
      
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'invalid_status'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Senaryo 3: Trace ID Kontrolü', () => {
    it('Her response trace ID içermeli', async () => {
      const res = await request(app).get('/api/customers');

      expect(res.headers).toHaveProperty('x-trace-id');
      expect(res.headers['x-trace-id']).toBeTruthy();
    });

    it('Error response da trace ID içermeli', async () => {
      const res = await request(app).get('/api/customers/99999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('traceId');
    });
  });

  describe('Senaryo 4: Cascade Delete', () => {
    it('Müşteri silindiğinde siparişler de silinmeli', async () => {
      // 1. Müşteri oluştur
      const customerRes = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'DeleteTest',
          lastName: 'User',
          email: 'deletetest@example.com',
          phone: '05321119999',
          address: 'Silinecek Adres'
        });

      const customerId = customerRes.body.id;
      expect(customerRes.status).toBe(201);

      // 2. Sipariş oluştur
      const orderRes = await request(app)
        .post('/api/orders')
        .send({
          customerId,
          status: 'pending',
          totalAmount: '100.00'
        });
      
      expect(orderRes.status).toBe(201);

      // 3. Müşteriyi sil
      const deleteRes = await request(app).delete(`/api/customers/${customerId}`);
      expect(deleteRes.status).toBe(200);

      // 4. Siparişlerin silindiğini kontrol et
      const ordersRes = await request(app).get(`/api/orders?customerId=${customerId}`);
      expect(ordersRes.body.length).toBe(0);
    });
  });
});