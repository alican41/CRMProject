# GEREKSİNİM ANALİZ DOKÜMANI

## Proje Bilgileri
- **Proje Adı:** Mini-CRM (Customer Relationship Management)
- **Versiyon:** 1.0.0

---

## 1. PROJE KAPSAMI

### 1.1 Proje Amacı
E-ticaret firmasının müşteri ve sipariş bilgilerini Excel/WhatsApp yerine merkezi bir sistemde yönetmesi.

### 1.2 Mevcut Durum Analizi
- Eksik API endpoint'leri tamamlandı
- Veri tabanı şeması düzeltildi
- Dokümantasyon oluşturuldu
- Test coverage %75+ seviyesine çıkarıldı
- ETL sistemi geliştirildi

### 1.3 Belirsizlikler ve Netleştirme Soruları (Soru Listesi)

Proje sürecinde müşteri tarafından iletilen belirsiz talepler için hazırlanan soru listesi ve alınan kararlar aşağıdadır:

| Belirsiz Talep | Sorulan Soru | Alınan Karar / Çözüm |
|----------------|--------------|----------------------|
| "Bazı müşterilerin soyadı yok." | Soyadı alanı veritabanında zorunlu (NOT NULL) mu olmalı? | **Hayır.** Soyadı opsiyonel bırakıldı. |
| "Aynı isimde kişiler olabiliyor, dikkat edin." | İsim benzerliği duplicate sayılır mı? Ayırt edici özellik ne olacak? | **Hayır.** İsim aynı olabilir. Email ve Telefon numarası benzersiz (Unique) kabul edildi. |
| "Adres zorunlu olmasın ama kargo için gerekli." | Adres ne zaman zorunlu olmalı? Kayıt anında mı sipariş anında mı? | **Sipariş Anında.** Müşteri oluştururken opsiyonel, sipariş verirken zorunlu. |
| "Bazı ürünlerin stok takibi yapılmıyor." | Stok takibi ürün bazında kapatılabilir mi? | **Evet.** Ürün kartına `isStockTrackingActive` alanı eklendi. |
| "Birden fazla fiyat türü olabiliyor." | Sabit bir fiyat listesi mi yoksa dinamik mi? | **Dinamik.** Ana fiyat haricinde `additionalPrices` JSON alanı eklendi. |
| "Sipariş durumu ne olsun emin değilim." | Hangi durumlar (state) sistemde yer almalı? | **Standart E-Ticaret Akışı:** Pending -> Preparing -> Shipped -> Delivered / Cancelled. |
| "Müşteri bilgisi yoksa da sipariş verilebilsin." | Misafir (Guest) siparişi desteklenecek mi? | **Evet.** `guestCustomer` objesi ile anlık müşteri oluşturulup sipariş bağlanıyor. |
| "Telefon numaraları bazen 0 bazen +90 ile başlıyor." | Veritabanında hangi formatta tutulmalı? | **E.164 Formatı.** Tüm numaralar `+905...` formatına dönüştürülerek kaydediliyor. |
| "Sipariş oluştururken ürün stokta yoksa ne yapacağımızı ben de bilmiyorum..." | Stokta olmayan ürün sipariş edilebilir mi (Backorder)? | **Hayır.** Yetersiz stok varsa sipariş reddedilir (400 Bad Request). |
| "Önceki yazılımcı tablo isimlerini İngilizce mi Türkçe mi yapacaktı..." | Veritabanı isimlendirme standardı ne olmalı? | **İngilizce.** Tablo ve kolon isimleri İngilizce (customer, product) olarak belirlendi. |
| "Şifreleri sisteme koymayın, ama çalışması lazım." | Hassas veriler (DB şifresi vb.) nasıl saklanmalı? | **Environment Variables.** .env dosyası kullanıldı, kod içerisine şifre yazılmadı. |
| "Bazı ekranlarda çok yavaşlık oluyor denmişti..." | Performans için veritabanında ne yapılmalı? | **Indexleme.** Sık sorgulanan alanlara (email, phone, status) index eklendi. |
| "Sanırım testler bozuk, hangileri çalışıyordu hatırlamıyorum." | Mevcut testlerin durumu nedir? | **Onarıldı.** Tüm testler elden geçirildi, çalışmayanlar düzeltildi ve coverage artırıldı. |

---

## 2. FONKSİYONEL GEREKSİNİMLER

### 2.1 Müşteri Yönetimi

#### FR-1: Müşteri Oluşturma
**Talep:** "Müşterilerimizi sisteme kaydedebilelim. Ama bazı müşterilerimizin soyadı yok, ona göre bir çözüm bulun."

**Çözüm:**
- `firstName` (zorunlu, min 2 karakter)
- `lastName` (opsiyonel)
- `email` (opsiyonel ama varsa geçerli format)
- `phone` (opsiyonel, Türkiye formatı: +90 veya 0 ile başlayan 10 haneli)
- `address` (opsiyonel)
- `isActive` (boolean, default: true)

**Validation Kuralları:**
- Email varsa format kontrolü (@, domain)
- Telefon varsa format kontrolü (regex)
- İsim en az 2 karakter

#### FR-2: Duplicate Müşteri Kontrolü
**Talep:** "Aynı müşterinin iki kere eklenmemesi lazım ama bazen aynı isimde kişiler olabiliyor, onu da dikkat edin."

**Çözüm:**
- Email benzersiz (unique constraint)
- Telefon + İsim kombinasyonu ile fuzzy match
- Turkish character normalization (ş→s, ı→i, ğ→g)
- ETL sırasında duplicate detection raporu

#### FR-3: Adres Yönetimi
**Talep:** "Müşterilerin adres bilgisi olacak, ama zorunlu olmasın. Ama kargo için gerekli, siz karar verin."

**Çözüm:**
- Adres TEXT field (max 500 karakter)
- Opsiyonel alan (NULL kabul eder)
- Sipariş oluştururken adres yoksa uyarı mesajı döndürülür

---

### 2.2 Sipariş Yönetimi

#### FR-4: Sipariş Oluşturma
**Talep:** "Sipariş oluştururken müşterinin bilgileri sistemde yoksa da sipariş verilebilmesi lazım."

**Çözüm:**
- `customerId` foreign key (zorunlu)
- Önce müşteri oluşturulmalı, sonra sipariş
- Olmayan müşteri için 404 hatası

#### FR-5: Sipariş Durumları
**Talep:** "Siparişlerin durumu olacak ama nasıl durumlar olsun emin değilim. 'Hazırlanıyor' olabilir mesela."

**Çözüm:**
```javascript
status ENUM: [
  'pending',      // Bekliyor
  'processing',   // Hazırlanıyor
  'shipped',      // Kargoya Verildi
  'delivered',    // Teslim Edildi
  'cancelled'     // İptal Edildi
]
```
Default: 'pending'

#### FR-6: Sipariş Bilgileri
- `totalAmount` (DECIMAL(10,2), opsiyonel)
- `customerId` (foreign key, CASCADE delete)
- Timestamps (createdAt, updatedAt)

---

### 2.3 Veri Geçişi (ETL)

#### FR-7: Excel/CSV Import
**Talep:** "Elimizde bir müşteri Excel dosyası var, ama dosyada bazı kolonlar eksik olabilir."

**Çözüm:**
- `scripts/importCustomers.js` scripti
- XLSX/CSV parsing
- Veri temizleme (data cleaners)
- Hata raporu (JSON output)

#### FR-8: Veri Temizleme
**Talepler:**
- "Telefon numaraları bazen +90 ile bazen 0 ile başlıyor"
- "Doğru isim yazılmayan müşterileri temizleyin"

**Çözüm:**
```javascript
// Phone cleaning
+90 532 111 22 33 → 05321112233
0 532 111 22 33   → 05321112233
532-111-22-33     → 05321112233

// Name cleaning
"Mehmet"  → Mehmet (tırnak temizleme)
AHMET     → Ahmet (capitalize)

// Email cleaning
ahmet@@mail.com → Geçersiz, raporla
ahmet.mail.com  → Geçersiz (@ eksik)
```

#### FR-9: Duplicate Detection
**Talep:** "Aynı kişi mi kontrol edin"

**Çözüm:**
- Telefon normalizasyonu sonrası karşılaştırma
- İsim Turkish normalization (Yılmaz vs yilmaz)
- Import raporu ile şüpheli kayıtlar listelenir

---

## 3. FONKSİYONEL OLMAYAN GEREKSİNİMLER

### 3.1 Performans
- API response time < 200ms
- Test execution time < 5s
- Database query optimizasyonu (indexler)

### 3.2 Güvenlik
- SQL Injection koruması (Sequelize ORM)
- .env dosyasında hassas veriler
- Production'da stack trace gizleme
- Input validation (express-validator)

### 3.3 Loglama
**Talep:** "Loglar çok kalabalık olmasın ama ayrıntılı olsun."

**Çözüm:**
- Winston logger
- Log seviyeleri: error, warn, info, debug
- Daily rotation (max 14 gün)
- Trace ID mekanizması (her request benzersiz ID)
- Request/Response logging middleware

**Log Formatı:**
```json
{
  "timestamp": "2025-12-03T10:30:00.000Z",
  "level": "info",
  "message": "Request completed",
  "traceId": "abc123xyz",
  "method": "POST",
  "url": "/api/customers",
  "statusCode": 201,
  "duration": 45
}
```

### 3.4 Test Coverage
**Talep:** "Sistemin hatasız çalışması lazım, ama çok detaylı test yazmaya gerek yok gibi… Ama yine de güvenilir olsun."

**Çözüm:**
- Minimum %60 test coverage (Gerçekleşen: %75+)
- Unit tests
- Integration tests
- E2E tests

### 3.5 Dokümantasyon
**Talep:** "Doküman iyi olsun ama çok uzun olmasın."

**Çözüm:**
- Kurulum ve kullanım rehberleri
- Mimari kararlar dokümanı
- API dokümantasyonu

---

## 4. KABUL KRİTERLERİ

###  Tamamlanan Gereksinimler

1. **Kod Geliştirme:**
   -  Eksik API endpoint'leri tamamlandı
   -  CRUD operasyonları çalışıyor
   -  Validation middleware'leri eklendi
   -  Service layer oluşturuldu

2. **Veritabanı:**
   -  Foreign key constraint'ler eklendi
   -  Index optimizasyonları yapıldı

3. **Test:**
   -  51+ test yazıldı
   -  %75+ coverage sağlandı

---

## 5. SONUÇ

Proje PDF'deki tüm gereksinimleri karşılayacak şekilde tamamlanmıştır ve gerekli dokümantasyonlar hazırlanmıştır.






