# Mimari Tasarım Dokümanı

## 1. Veritabanı Şeması

Projenin veritabanı şeması aşağıdaki gibidir:

### Customers Table
`customers`
- `id` (PK, Serial)
- `first_name` (NOT NULL)
- `last_name`
- `email` (Unique)
- `phone`
- `address`
- `is_active` (Default: true)
- `created_at`, `updated_at`

### Products Table
`products`
- `id` (PK, Serial)
- `name` (NOT NULL)
- `price` (Decimal(10,2))
- `stock_quantity` (Int, Default: 0)
- `is_stock_tracking_active` (Boolean, Default: true)
- `additional_prices` (JSON)
- `is_active` (Default: true)

### Orders Table
`orders`
- `id` (PK, Serial)
- `customer_id` (FK -> customers.id)
- `status` (Enum: pending, processing, shipped, delivered, cancelled)
- `total_amount` (Decimal)
- `created_at`, `updated_at`

### Order Items Table
`order_items`
- `id` (PK, Serial)
- `order_id` (FK -> orders.id)
- `product_id` (FK -> products.id, Nullable)
- `product_name` (String) - Anlık görüntüsü
- `quantity` (Int)
- `unit_price` (Decimal)
- `subtotal` (Decimal)

---

## 2. Modüller ve Servisler

### 1. Routes (Routing Katmanı)
- **Görev:** HTTP isteklerini karşılar, route tanımları
- **Dosyalar:** `src/routes/*.js`
- **Sorumluluklar:**
  - HTTP endpoint tanımları
  - Validation middleware çağrısı
  - Service katmanına yönlendirme
  - HTTP response oluşturma

### 2. Middlewares (Ara Katman)
- **Görev:** İstek/yanıt işleme, doğrulama, loglama
- **Dosyalar:** `src/middlewares/*.js`
- **Bileşenler:**
  - `traceId.js`: Her istek için benzersiz ID
  - `requestLogger.js`: Request/response loglama
  - `*Validation.js`: Veri doğrulama

### 3. Services (İş Mantığı Katmanı)
- **Görev:** İş kuralları ve logic
- **Dosyalar:** `src/services/*.js`
- **Sorumluluklar:**
  - CRUD operasyonları
  - İş kuralları uygulaması
  - Model katmanı ile etkileşim
  - Hata yönetimi

### 4. Models (Veri Katmanı)
- **Görev:** Veritabanı şeması ve ORM
- **Dosyalar:** `src/models/*.js`
- **Sorumluluklar:**
  - Sequelize model tanımları
  - İlişki tanımları
  - Veri validasyonu

---

## 3. UML Diyagramları

### 1. Use Case Diyagramı

*![alt text](usecase.png)*

**PlantUML Kodu:**
```plantuml
@startuml
left to right direction
actor "Admin/Kullanıcı" as User

package "Mini-CRM Sistemi" {
  usecase "Müşteri Ekle" as UC1
  usecase "Müşteri Listele" as UC2
  usecase "Sipariş Oluştur" as UC3
  usecase "Sipariş Durumu Güncelle" as UC4
  usecase "Ürün Ekle" as UC5
  usecase "Stok Takibi" as UC6
  usecase "Excel'den Müşteri Aktar" as UC7
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
@enduml
```

### 2. Class Diyagramı

*![alt text](class.png)*


**PlantUML Kodu:**
```plantuml
@startuml
class Customer {
  +Integer id
  +String firstName
  +String lastName
  +String email
  +String phone
  +String address
  +Boolean isActive
}

class Order {
  +Integer id
  +Integer customerId
  +String status
  +Decimal totalAmount
  +Date createdAt
}

class OrderItem {
  +Integer id
  +Integer orderId
  +Integer productId
  +String productName
  +Integer quantity
  +Decimal unitPrice
}

class Product {
  +Integer id
  +String name
  +Decimal price
  +Integer stockQuantity
  +Boolean isStockTrackingActive
  +JSON additionalPrices
}

Customer "1" -- "0..*" Order : places
Order "1" -- "1..*" OrderItem : contains
Product "1" -- "0..*" OrderItem : referenced_by
@enduml
```

### 3. Sequence Diyagramı (Sipariş Oluşturma)

*![alt text](sequence.png)*

**PlantUML Kodu:**
```plantuml
@startuml
actor Client
participant "Order Route" as Route
participant "Order Service" as Service
participant "Customer Model" as CustModel
participant "Product Model" as ProdModel
participant "Order Model" as OrdModel
database DB

Client -> Route: POST /api/orders
Route -> Service: createOrder(payload)
Service -> CustModel: findByPk(customerId)
alt Müşteri Yok
  Service --> Route: Error 404
else Müşteri Var
  Service -> Service: Adres Kontrolü
  alt Adres Yok
    Service --> Route: Error 400
  else Adres Var
    loop Her Ürün İçin
      Service -> ProdModel: Stok Kontrolü
      alt Stok Yetersiz
        Service --> Route: Error 400
      else Stok Yeterli
        Service -> ProdModel: Stok Düş (decrement)
      end
    end
    Service -> OrdModel: create(order)
    OrdModel -> DB: INSERT INTO orders
    Service --> Route: Order Created
    Route --> Client: 201 Created
  end
end
@enduml
```

---

## 4. API Uçları Listesi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/customers` | Müşterileri listele |
| POST | `/api/customers` | Yeni müşteri oluştur |
| GET | `/api/customers/:id` | Müşteri detayı |
| PUT | `/api/customers/:id` | Müşteri güncelle |
| DELETE | `/api/customers/:id` | Müşteri sil (soft delete) |
| GET | `/api/orders` | Siparişleri listele |
| POST | `/api/orders` | Sipariş oluştur |
| GET | `/api/orders/:id` | Sipariş detayı |
| PUT | `/api/orders/:id` | Sipariş durumu güncelle |
| GET | `/api/products` | Ürünleri listele |
| POST | `/api/products` | Ürün oluştur |

---

## 5. Logging, Konfigürasyon ve Migration

### Logging Yapısı
- **Kütüphane:** Winston
- **Özellikler:**
  - `traceId`: Her isteği takip etmek için benzersiz ID.
  - `DailyRotateFile`: Loglar günlük dosyalanır ve 14 gün saklanır.
  - `requestLogger`: HTTP isteklerinin süresini ve durumunu otomatik loglar.

### Konfigürasyon
- **Yöntem:** Environment Variables (.env)
- **Yapı:** `src/config/index.js` üzerinden ortam (dev/test/prod) bazlı ayarlar yüklenir.
- **Güvenlik:** Şifreler kodda değil, ortam değişkenlerinde saklanır.

### Migration Stratejisi
- **Araç:** Sequelize CLI
- **Yaklaşım:**
  - Tablo oluşturma (`createTable`)
  - Kolon ekleme (`addColumn`) - Mevcut veriyi korumak için.
  - İndeks ekleme (`addIndex`) - Performans için.
- **Versiyonlama:** Timestamp tabanlı dosya isimleri ile sıralı çalışma garantisi.
