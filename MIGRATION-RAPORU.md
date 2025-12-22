# 🗄️ Migration Raporu ve Veritabanı Şema Geçmişi

Bu rapor, projedeki veritabanı şema değişikliklerini, uygulanan migration stratejilerini ve versiyon geçmişini içerir.

## 📋 Migration Stratejisi

Projede **Sequelize CLI** kullanılarak **Versioned Migration** stratejisi uygulanmıştır.
- **Timestamp Bazlı İsimlendirme:** Dosyalar `YYYYMMDDHHMMSS-description.js` formatındadır. Bu, değişikliklerin kronolojik sırayla uygulanmasını garanti eder.
- **Non-Destructive Updates:** Mevcut tabloları silip yeniden oluşturmak yerine, `addColumn` ve `addIndex` gibi komutlarla mevcut veriyi koruyan güncellemeler tercih edilmiştir.
- **Rollback Desteği:** Her migration dosyasında `down` metodu tanımlanmış olup, yapılan değişikliklerin geri alınabilmesi sağlanmıştır.

---

## 📅 Migration Geçmişi

### 1. Başlangıç Şeması (Initial Schema)
**Dosyalar:**
- `20240101000000-create-customer.js`
- `20240102000000-create-order.js`

**Değişiklikler:**
- `customers` tablosu oluşturuldu (id, firstName, lastName, email, phone, address, isActive).
- `orders` tablosu oluşturuldu (id, customerId, status, totalAmount).
- Temel Foreign Key ilişkisi kuruldu (Order -> Customer).

### 2. Performans İyileştirmesi
**Dosya:** `20251203150339-add-indexes.js`

**Değişiklikler:**
- **Customers:** `email` (unique), `phone`, `is_active` alanlarına indeks eklendi.
- **Orders:** `customer_id`, `status`, `created_at` alanlarına indeks eklendi.
- **Amaç:** Arama ve filtreleme sorgularının hızlandırılması.

### 3. Sipariş Detaylandırma (Order Items)
**Dosya:** `20251216135834-create-order-items.js`

**Değişiklikler:**
- `order_items` tablosu oluşturuldu.
- Siparişlerin kalem bazında (ürün adı, miktar, birim fiyat) tutulması sağlandı.
- **Not:** Bu aşamada henüz Ürün (Product) tablosu yoktu, ürün bilgileri manuel giriliyordu.

### 4. Ürün Yönetimi Modülü
**Dosya:** `20251217103555-create-products.js`

**Değişiklikler:**
- `products` tablosu oluşturuldu.
- Alanlar: `name`, `price`, `stock_quantity`, `is_stock_tracking_active`.
- Stok takibi özelliği altyapısı kuruldu.

### 5. İlişki Güncellemesi (Order Items -> Products)
**Dosya:** `20251217103848-add-product-id-to-order-items.js`

**Değişiklikler:**
- `order_items` tablosuna `product_id` kolonu eklendi.
- **Önemli:** `allowNull: true` olarak tanımlandı. Böylece eski sipariş kayıtları bozulmadı, yeni siparişler ise ürün tablosuyla ilişkilendirilebildi.

### 6. Çoklu Fiyat Özelliği
**Dosya:** `20251220120000-add-additional-prices-to-products.js`

**Değişiklikler:**
- `products` tablosuna `additional_prices` (JSON) kolonu eklendi.
- **Amaç:** Farklı para birimleri veya müşteri tipleri (toptan/perakende) için esnek fiyatlandırma yapısı sağlandı.

---

## 📊 Mevcut Tablo Yapısı (Özet)

| Tablo | Açıklama | Önemli İlişkiler |
|-------|----------|------------------|
| **customers** | Müşteri bilgileri | `orders` (1:N) |
| **orders** | Sipariş başlık bilgileri | `customers` (N:1), `order_items` (1:N) |
| **products** | Ürün ve stok bilgileri | `order_items` (1:N) |
| **order_items** | Sipariş detayları | `orders` (N:1), `products` (N:1) |
