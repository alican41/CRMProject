const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Customer, sequelize } = require('../src/models');
const {
  cleanPhone,
  cleanEmail,
  cleanName,
  cleanAddress,
  generateCompositeKey,
  toEnglishCharacters
} = require('../src/utils/dataCleaners');

// Konfigürasyon
const CONFIG = {
  BATCH_SIZE: 100
};

const report = {
  total: 0,
  success: 0,
  failed: 0,
  duplicates: 0,
  skipped: 0,
  errors: [], // Ciddi hatalar (Veritabanı vb)
  warnings: [] // Validasyon hataları
};

function isValidEmail(email) {
  if (!email) return false;
  // Basit regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readFile(filePath) {
  try {
    // Dosyayı buffer olarak oku ve UTF-8 olarak parse etmeye zorla
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer', codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } catch (error) {
    throw new Error(`Dosya okunamadı: ${error.message}`);
  }
}

/**
 * Veritabanındaki mevcut kayıtları yükle
 * Not: Veritabanındaki veriler zaten İngilizce karakterli olacağı için (yeni sisteme göre),
 * doğrudan key oluşturabiliriz. Ancak eski veriler Türkçeyse onları da İngilizceymiş gibi key'e çeviririz.
 */
async function loadExistingRecords() {
  try {
    const customers = await Customer.findAll({
      attributes: ['firstName', 'lastName', 'phone'],
      raw: true
    });
    
    const recordSet = new Set();
    
    customers.forEach(c => {
      // Veritabanından gelen veriyi de temizleyiciden geçiriyoruz ki
      // format (Büyük/Küçük harf vs.) garanti olsun.
      const f = cleanName(c.firstName);
      const l = cleanName(c.lastName);
      const p = cleanPhone(c.phone); // Format garantisi
      
      const key = generateCompositeKey(f, l, p);
      recordSet.add(key);
    });
    
    return recordSet;
  } catch (error) {
    console.error("Tablo boş veya okunamadı, devam ediliyor.");
    return new Set();
  }
}

async function importCustomers(options = {}) {
  const filePath = options.filePath || path.join(__dirname, '..', 'data', 'customers.csv');
  
  console.log('🚀 ETL İşlemi Başlıyor (Tamamen İngilizce Karakter Formatı)...');

  try {
    await sequelize.authenticate();
    
    // 1. Dosyayı Oku
    let rows = readFile(filePath);
    report.total = rows.length;
    console.log(`📄 Toplam ${rows.length} satır okundu.`);

    // 2. Mevcut kayıtları hafızaya al
    const existingRecords = await loadExistingRecords();
    console.log(`💾 Veritabanında ${existingRecords.size} kayıt bulundu.`);

    const customersToInsert = [];
    
    // 3. Satır satır işle
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // --- VERİ TEMİZLEME VE DÖNÜŞTÜRME ---
      // Artık cleanName fonksiyonu "Öztürk"ü "Ozturk" yapar.
      // Veritabanına bu dönüştürülmüş hali kaydedilecek.
      let firstName = cleanName(row.Ad); 
      let lastName = cleanName(row.Soyad);
      const phone = cleanPhone(row.Telefon);
      const email = cleanEmail(row.Email);
      const address = cleanAddress(row.Adres);
      const notes = row.Not ? toEnglishCharacters(row.Not.toString().trim()) : null;

      // --- VALIDASYON ---
      const validationErrors = [];

      if (!firstName || firstName.length < 2) {
        validationErrors.push(`Geçersiz Ad (${row.Ad})`);
      }
      
      if (!lastName || lastName.length < 2) {
        validationErrors.push(`Geçersiz Soyad (${row.Soyad})`);
      }

      // Email varsa valid formatta olmalı
      if (row.Email && !isValidEmail(email)) {
        validationErrors.push(`Geçersiz Email (${row.Email})`);
      }

      // Telefon zorunlu olsun
      if (!phone) {
        validationErrors.push(`Geçersiz/Eksik Telefon (${row.Telefon})`);
      }

      // Validasyon hatası varsa atla
      if (validationErrors.length > 0) {
        report.skipped++;
        report.warnings.push(`Satır ${rowNum} Atlandı: ${validationErrors.join(', ')}`);
        continue;
      }

      // 4. DUPLICATE KONTROLÜ
      // "Omer" + "Celik" + "+905..." kombinasyonu kontrol edilir.
      const compositeKey = generateCompositeKey(firstName, lastName, phone);

      if (existingRecords.has(compositeKey)) {
        report.duplicates++;
        report.warnings.push(`Satır ${rowNum}: [${firstName} ${lastName} - ${phone}] zaten mevcut (Duplicate).`);
      } else {
        // 5. LİSTEYE EKLE (İngilizce Karakterli Haliyle)
        customersToInsert.push({
          firstName, // Örn: Omer (Dönüştürülmüş hali)
          lastName,  // Örn: Celik (Dönüştürülmüş hali)
          phone: phone || null,
          email: email || null,
          address: address || null,
          notes: notes || null,
          isActive: true
        });

        // Set'i güncelle
        existingRecords.add(compositeKey);
      }
    }

    // 6. Veritabanına Kaydet
    if (customersToInsert.length > 0) {
      console.log(`📦 ${customersToInsert.length} yeni müşteri (normalize edilmiş) kaydediliyor...`);
      
      const batches = [];
      while (customersToInsert.length > 0) {
        batches.push(customersToInsert.splice(0, CONFIG.BATCH_SIZE));
      }

      for (const batch of batches) {
        try {
          // validate: false ile hız kazanalım, veriyi zaten temizledik
          await Customer.bulkCreate(batch, { validate: false });
          report.success += batch.length;
          process.stdout.write('.');
        } catch (err) {
          console.error("\n❌ Batch hatası:", err.message);
          report.failed += batch.length;
        }
      }
      console.log("\n");
    } else {
      console.log("⚠️ Eklenecek yeni kayıt yok.");
    }

    // Rapor
    console.log('\n========================================');
    console.log(`✅ Başarılı: ${report.success}`);
    console.log(`⚠️  Duplicate: ${report.duplicates}`);
    console.log(`❌ Hata: ${report.failed}`);
    console.log('========================================\n');

    if (report.warnings.length > 0) {
      console.log("Atlanan Kayıtlar (İlk 5):");
      report.warnings.slice(0, 5).forEach(w => console.log(w));
    }

    // Raporu dosyaya yaz
    const reportPath = path.join(__dirname, '..', 'data', 'import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapor dosyası güncellendi: ${reportPath}`);

  } catch (error) {
    console.error("Kritik Hata:", error);
  }
}

if (require.main === module) {
  importCustomers();
}

module.exports = { importCustomers };