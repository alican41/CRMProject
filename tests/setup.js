const { sequelize } = require('../src/models');

// Her test suite'inden önce
beforeAll(async () => {
  // Test veritabanına bağlan
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'mini_crm_test';
  
  await sequelize.authenticate();
});

// Her test'ten önce veritabanını temizle
beforeEach(async () => {
  await sequelize.sync({ force: true });
});

// Tüm testler bittikten sonra
afterAll(async () => {
  await sequelize.close();
});