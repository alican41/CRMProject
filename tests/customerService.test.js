const { Customer } = require('../src/models');
const customerService = require('../src/services/customerService');

describe('CustomerService', () => {
  
  describe('listCustomers', () => {
    test('should return all customers', async () => {
      await Customer.bulkCreate([
        { firstName: 'Ahmet', lastName: 'Yılmaz' },
        { firstName: 'Mehmet', lastName: 'Demir' }
      ]);

      const customers = await customerService.listCustomers();

      expect(customers.length).toBe(2);
    });

    test('should respect limit', async () => {
      // 60 müşteri oluştur
      const customers = Array.from({ length: 60 }, (_, i) => ({
        firstName: `Customer${i}`,
        lastName: 'Test'
      }));
      await Customer.bulkCreate(customers);

      const result = await customerService.listCustomers();

      expect(result.length).toBeLessThanOrEqual(50); // Service'de limit 50
    });
  });

  describe('createCustomer', () => {
    test('should create customer successfully', async () => {
      const payload = {
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@test.com',
        phone: '05321112233',
        traceId: 'test-trace-id'
      };

      const customer = await customerService.createCustomer(payload);

      expect(customer.id).toBeDefined();
      expect(customer.firstName).toBe('Ahmet');
      expect(customer.email).toBe('ahmet@test.com');
    });

    test('should throw error when email or phone already exists', async () => {
      // 1. Mevcut bir müşteri oluşturuyoruz
      await Customer.create({
        firstName: 'Mevcut',
        lastName: 'Müşteri',
        email: 'duplicate@test.com',
        phone: '05554443322'
      });

      // 2. Aynı email ile yeni kayıt deniyoruz -> Hata vermeli
      const payloadEmail = {
        firstName: 'Yeni',
        lastName: 'Müşteri',
        email: 'duplicate@test.com',
        traceId: 'test-trace-id'
      };

      await expect(customerService.createCustomer(payloadEmail))
        .rejects.toThrow('Bu email veya telefon numarası ile kayıtlı müşteri zaten var.');

      // 3. Aynı telefon ile yeni kayıt deniyoruz -> Hata vermeli
      const payloadPhone = {
        firstName: 'Yeni',
        lastName: 'Müşteri',
        phone: '05554443322',
        traceId: 'test-trace-id'
      };

      await expect(customerService.createCustomer(payloadPhone))
        .rejects.toThrow('Bu email veya telefon numarası ile kayıtlı müşteri zaten var.');
    });
  });

  describe('getCustomerById', () => {
    test('should return customer when exists', async () => {
      const created = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz'
      });

      const customer = await customerService.getCustomerById(created.id, 'test-trace');

      expect(customer.id).toBe(created.id);
      expect(customer.firstName).toBe('Ahmet');
    });

    test('should throw error when customer not found', async () => {
      await expect(
        customerService.getCustomerById(99999, 'test-trace')
      ).rejects.toThrow('Müşteri bulunamadı');
    });
  });

  describe('updateCustomer', () => {
    test('should update customer successfully', async () => {
      const customer = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz'
      });

      const updated = await customerService.updateCustomer(customer.id, {
        firstName: 'Mehmet',
        phone: '05321112233',
        traceId: 'test-trace'
      });

      expect(updated.firstName).toBe('Mehmet');
      expect(updated.phone).toBe('05321112233');
    });

    test('should throw error when customer not found', async () => {
      await expect(
        customerService.updateCustomer(99999, { firstName: 'Test', traceId: 'test' })
      ).rejects.toThrow('Müşteri bulunamadı');
    });
  });

  describe('deleteCustomer', () => {
    test('should delete customer successfully', async () => {
      const customer = await Customer.create({
        firstName: 'Ahmet',
        lastName: 'Yılmaz'
      });

      const result = await customerService.deleteCustomer(customer.id, 'test-trace');

      expect(result.message).toBeDefined();
      
      const deleted = await Customer.findByPk(customer.id);
      expect(deleted).toBeNull();
    });

    test('should throw error when customer not found', async () => {
      await expect(
        customerService.deleteCustomer(99999, 'test-trace')
      ).rejects.toThrow('Müşteri bulunamadı');
    });
  });
});