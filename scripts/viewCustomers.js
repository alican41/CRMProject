const { Customer, sequelize } = require('../src/models');
const logger = require('../src/lib/logger');

/**
 * Müşterileri konsolda görüntüle
 */
async function viewCustomers(options = {}) {
  const { limit = 10, offset = 0, search = null } = options;
  
  try {
    // Veritabanı bağlantısı
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Arama filtresi
    const where = {};
    if (search) {
      where[sequelize.Op.or] = [
        { firstName: { [sequelize.Op.iLike]: `%${search}%` } },
        { lastName: { [sequelize.Op.iLike]: `%${search}%` } },
        { email: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Müşterileri getir
    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      raw: true
    });
    
    console.log('📊 MÜŞTERI LİSTESİ');
    console.log('='.repeat(100));
    console.log(`Toplam: ${count} müşteri | Gösterilen: ${rows.length} | Sayfa: ${Math.floor(offset / limit) + 1}\n`);
    
    if (rows.length === 0) {
      console.log('❌ Müşteri bulunamadı');
      return;
    }
    
    // Tablo başlıkları
    console.log(
      'ID'.padEnd(5),
      'AD'.padEnd(20),
      'SOYAD'.padEnd(20),
      'TELEFON'.padEnd(15),
      'EMAIL'.padEnd(30)
    );
    console.log('-'.repeat(100));
    
    // Müşteri verileri
    rows.forEach(c => {
      console.log(
        String(c.id).padEnd(5),
        (c.firstName || '-').padEnd(20),
        (c.lastName || '-').padEnd(20),
        (c.phone || '-').padEnd(15),
        (c.email || '-').padEnd(30)
      );
    });
    
    console.log('='.repeat(100));
    
    // İstatistikler
    console.log('\n📈 İSTATİSTİKLER:');
    const stats = await Customer.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('email')), 'withEmail'],
        [sequelize.fn('COUNT', sequelize.col('phone')), 'withPhone'],
        [sequelize.literal("COUNT(CASE WHEN is_active = true THEN 1 END)"), 'active']
      ],
      raw: true
    });
    
    const stat = stats[0];
    console.log(`   Toplam Müşteri: ${stat.total}`);
    console.log(`   Aktif: ${stat.active}`);
    console.log(`   Email'li: ${stat.withEmail}`);
    console.log(`   Telefonlu: ${stat.withPhone}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Script çalıştırma
if (require.main === module) {
  // Komut satırı argümanları
  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 20;
  const offset = parseInt(args[1]) || 0;
  const search = args[2] || null;
  
  viewCustomers({ limit, offset, search })
    .then(() => {
      console.log('✅ Tamamlandı\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script hatası:', error);
      process.exit(1);
    });
}

module.exports = { viewCustomers };
