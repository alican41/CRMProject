# 🚀 Mini-CRM API

E-Ticaret firması için müşteri ve sipariş yönetim sistemi.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Test](#test)
- [Proje Yapısı](#proje-yapısı)
- [Katkıda Bulunma](#katkıda-bulunma)

## ✨ Özellikler

- ✅ **Müşteri Yönetimi:** CRUD operasyonları
- ✅ **Sipariş Yönetimi:** Sipariş oluşturma, güncelleme, takip
- ✅ **Validation:** express-validator ile veri doğrulama
- ✅ **Loglama:** Winston ile profesyonel loglama (Trace ID desteği)
- ✅ **ETL:** Excel/CSV'den veri aktarımı ve temizleme
- ✅ **Test Coverage:** %75+ test kapsama oranı
- ✅ **API Dokümantasyonu:** Swagger/OpenAPI 3.0
- ✅ **Database Migration:** Sequelize ile veritabanı yönetimi

## 🛠 Teknolojiler

- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Sequelize
- **Validation:** express-validator
- **Logging:** Winston
- **Testing:** Jest, Supertest
- **Documentation:** Swagger UI Express

## 📦 Kurulum

### Gereksinimler

- Node.js v18 veya üzeri
- PostgreSQL 14 veya üzeri
- npm veya yarn

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd mini-crm
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Veritabanını Oluşturun

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Veritabanını oluşturun
CREATE DATABASE mini_crm;
CREATE DATABASE mini_crm_test;
\q
```

### Adım 4: Environment Variables

`.env` dosyası oluşturun:

```env
NODE_ENV=development
APP_PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=mini_crm
DB_USER=postgres
DB_PASS=your_password

LOG_LEVEL=debug
LOG_FILE=logs/app.log

TEST_DB_NAME=mini_crm_test
```

### Adım 5: Migration Çalıştırın

```bash
npm run migrate
```

### Adım 6: Sunucuyu Başlatın

```bash
# Development
npm run dev

# Production
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacaktır.

## 🚀 Kullanım

### API Endpoint'leri

#### Customers

- `GET /api/customers` - Tüm müşterileri listele
- `POST /api/customers` - Yeni müşteri oluştur
- `GET /api/customers/:id` - Müşteri detayı
- `PUT /api/customers/:id` - Müşteri güncelle
- `DELETE /api/customers/:id` - Müşteri sil

#### Orders

- `GET /api/orders` - Siparişleri listele (filtreleme desteği)
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders/:id` - Sipariş detayı
- `PUT /api/orders/:id` - Sipariş güncelle
- `DELETE /api/orders/:id` - Sipariş sil

### Örnek Kullanım

```bash
# Müşteri oluştur
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet@example.com",
    "phone": "05321112233"
  }'

# Sipariş oluştur
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "status": "pending",
    "totalAmount": 250.50
  }'

  ## 📖 API Dokümantasyonu

Swagger UI dokümantasyonuna erişin:

```
http://localhost:3000/api-docs
```

OpenAPI JSON:

```
http://localhost:3000/api-docs.json
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Watch modda test
npm run test:watch

# Coverage raporu
npm run test:coverage
```

Test coverage raporu: `coverage/lcov-report/index.html`

## 📂 Proje Yapısı

```
mini-crm/
├── src/
│   ├── app.js                 # Express app konfigürasyonu
│   ├── server.js              # Sunucu başlatma
│   ├── config/
│   │   ├── index.js           # Genel konfigürasyon
│   │   ├── database.js        # Database konfigürasyonu
│   │   └── swagger.js         # Swagger konfigürasyonu
│   ├── lib/
│   │   └── logger.js          # Winston logger
│   ├── middlewares/
│   │   ├── traceId.js         # Trace ID middleware
│   │   ├── requestLogger.js   # Request/Response logging
│   │   ├── customerValidation.js
│   │   └── orderValidation.js
│   ├── models/
│   │   ├── index.js           # Sequelize initialization
│   │   ├── customer.js        # Customer model
│   │   └── order.js           # Order model
│   ├── routes/
│   │   ├── customers.js       # Customer routes
│   │   └── orders.js          # Order routes
│   ├── services/
│   │   ├── customerService.js # Customer business logic
│   │   └── orderService.js    # Order business logic
│   └── utils/
│       └── dataCleaners.js    # ETL utility fonksiyonları
├── migrations/                # Database migrations
├── scripts/
│   └── importCustomers.js     # ETL scripti
├── tests/                     # Test dosyaları
├── logs/                      # Log dosyaları
├── data/                      # CSV/Excel dosyaları
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔄 ETL (Veri Aktarımı)

Excel/CSV dosyasından müşteri verilerini sisteme aktarın:

```bash
npm run etl:import
```

Rapor: `data/import-report.json`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

MIT License

## 👥 İletişim

Proje Linki: [https://github.com/yourusername/mini-crm](https://github.com/yourusername/mini-crm)