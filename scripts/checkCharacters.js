const { Customer } = require('../src/models');

async function checkCharacters() {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'firstName', 'lastName', 'address'],
      limit: 10,
      order: [['id', 'ASC']]
    });

    console.log('\n=== VERİTABANINDAKİ GERÇEK VERİLER ===\n');
    
    customers.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`  Ad: ${c.firstName}`);
      console.log(`  Soyad: ${c.lastName}`);
      console.log(`  Adres: ${c.address || '-'}`);
      
      // Türkçe karakter kontrolü
      const hasTurkish = /[ğĞıİöÖüÜşŞçÇ]/.test(c.firstName + c.lastName + (c.address || ''));
      console.log(`  Türkçe Karakter: ${hasTurkish ? '❌ VAR' : '✅ YOK'}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
}

checkCharacters();
