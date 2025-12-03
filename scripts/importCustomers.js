const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Customer, sequelize } = require('../src/models');
const logger = require('../src/lib/logger');
const {
  cleanPhone,
  cleanEmail,
  cleanName,
  cleanAddress,
  normalizeForComparison
} = require('../src/utils/dataCleaners');

// Sonuç raporlama
const report = {
  total: 0,
  success: 0,
  failed: 0,
  duplicates: 0,
  errors: []
};

/**
 * CSV dosyasını oku
 */
function readCSV(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

/**
 * Duplicate kontrolü yap
 */
async function isDuplicate(firstName, lastName, phone, email, existingCustomers) {
  const normalizedFirst = normalizeForComparison(firstName);
  const normalizedLast = normalizeForComparison(lastName);
  const normalizedPhone = phone ? phone.replace(/\D/g, '') : null;
  
  // Bellekteki veriler ile kontrol
  const memoryDuplicate = existingCustomers.find(c => {
    const samePhone = normalizedPhone && c.phone && 
                     c.phone.replace(/\D/g, '') === normalizedPhone;
    const sameName = normalizeForComparison(c.firstName) === normalizedFirst &&
                     normalizeForComparison(c.lastName) === normalizedLast;
    return samePhone || sameName;
  });
  
  if (memoryDuplicate) {
    return true;
  }
  
  // Veritabanındaki veriler ile kontrol
  if (normalizedPhone) {
    const dbCustomer = await Customer.findOne({
      where: sequelize.where(
        sequelize.fn('REPLACE', 
          sequelize.fn('REPLACE',
            sequelize.fn('REPLACE', sequelize.col('phone'), ' ', ''),
          '-', ''),
        '(', ''),
        normalizedPhone
      )
    });
    if (dbCustomer) return true;
  }
  
  return false;
}

/**
 * Müşteriyi işle ve kaydet
 */
async function processCustomer(row, index, existingCustomers) {
  const rowNum = index + 2; // Excel'de 1. satır başlık, 2. satır ilk veri
  
  try {
    // Veri temizleme
    const firstName = cleanName(row.Ad);
    const lastName = cleanName(row.Soyad);
    const phone = cleanPhone(row.Telefon);
    const email = cleanEmail(row.Email);
    const address = cleanAddress(row.Adres);
    
    // İsim zorunlu
    if (!firstName) {
      report.errors.push({
        row: rowNum,
        reason: 'İsim zorunludur',
        data: row
      });
      report.failed++;
      return null;
    }
    
    // Duplicate kontrolü
    if (await isDuplicate(firstName, lastName, phone, email, existingCustomers)) {
      logger.info(`Duplicate found at row ${rowNum}`, { firstName, lastName, phone });
      report.duplicates++;
      return null;
    }
    
    // Müşteri oluştur
    const customer = await Customer.create({
      firstName,
      lastName,
      phone,
      email,
      address,
      isActive: true
    });
    
    logger.info(`Customer created from row ${rowNum}`, { 
      id: customer.id, 
      firstName, 
      lastName 
    });
    
    report.success++;
    return customer;
    
  } catch (error) {
    report.errors.push({
      row: rowNum,
      reason: error.message,
      data: row
    });
    report.failed++;
    logger.error(`Failed to process row ${rowNum}`, { error: error.message, row });
    return null;
  }
}

/**
 * Ana ETL fonksiyonu
 */
async function importCustomers() {
  const filePath = path.join(__dirname, '..', 'data', 'customers.csv');
  
  logger.info('Starting ETL process', { filePath });
  
  try {
    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    logger.info('Database connection OK');
    
    // CSV dosyasını oku
    const rows = readCSV(filePath);
    report.total = rows.length;
    
    logger.info(`Found ${rows.length} rows in CSV`);
    
    // İşlenen müşterileri sakla (duplicate kontrolü için)
    const processedCustomers = [];
    
    // Her satırı işle
    for (let i = 0; i < rows.length; i++) {
      const customer = await processCustomer(rows[i], i, processedCustomers);
      if (customer) {
        processedCustomers.push(customer);
      }
    }
    
    // Rapor oluştur
    console.log('\n' + '='.repeat(60));
    console.log('ETL PROCESS COMPLETED');
    console.log('='.repeat(60));
    console.log(`Total rows processed: ${report.total}`);
    console.log(`✅ Successfully imported: ${report.success}`);
    console.log(`⚠️  Duplicates skipped: ${report.duplicates}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log('='.repeat(60));
    
    // Hata detayları
    if (report.errors.length > 0) {
      console.log('\nERROR DETAILS:');
      report.errors.forEach(err => {
        console.log(`Row ${err.row}: ${err.reason}`);
        console.log(`  Data:`, err.data);
      });
    }
    
    // JSON rapor kaydet
    const reportPath = path.join(__dirname, '..', 'data', 'import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info('Report saved', { reportPath });
    
  } catch (error) {
    logger.error('ETL process failed', { error: error.message });
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Script'i çalıştır
if (require.main === module) {
  importCustomers()
    .then(() => {
      console.log('\n✅ ETL process finished successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ETL process failed:', error);
      process.exit(1);
    });
}

module.exports = { importCustomers };