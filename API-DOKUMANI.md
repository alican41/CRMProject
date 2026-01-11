#  API Dokümantasyonu

Mini-CRM sistemi RESTful mimariye uygun API uçları sağlar. Tüm yanıtlar JSON formatındadır.

## Genel Bilgiler

- **Base URL:** `http://localhost:3000/api`
- **Authentication:** Şu an için public (Geliştirme aşaması)
- **Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { ... } // Opsiyonel (pagination vb.)
  }
  ```

---

##  Müşteri (Customers) Endpoints

### 1. Müşterileri Listele
**GET** `/customers`

Bütün müşterileri listeler.

**Query Parameters:**
- `page`: Sayfa numarası (Default: 1)
- `limit`: Sayfa başı kayıt (Default: 10)

### 2. Müşteri Oluştur
**POST** `/customers`

Yeni bir müşteri kaydı oluşturur.

**Body:**
```json
{
  "firstName": "Ali",
  "lastName": "Veli",
  "email": "ali@example.com", // Unique
  "phone": "05321234567" // Opsiyonel
}
```

### 3. Müşteri Detayı
**GET** `/customers/:id`

ID'si verilen müşterinin detaylarını döndürür.

### 4. Müşteri Güncelle
**PUT** `/customers/:id`

**Body:** (Değişmesi istenen alanlar)
```json
{
  "firstName": "Mehmet"
}
```

### 5. Müşteri Sil
**DELETE** `/customers/:id`

Müşteriyi sistemden siler (Soft delete veya hard delete konfigürasyona bağlı).

---

##  Sipariş (Orders) Endpoints

### 1. Siparişleri Listele
**GET** `/orders`

**Query Parameters:**
- `customerId`: Belirli bir müşterinin siparişleri
- `status`: Sipariş durumu ('pending', 'shipped' vb.)

### 2. Sipariş Oluştur
**POST** `/orders`

Mevcut bir müşteri için veya yeni (guest) müşteri bilgileriyle sipariş oluşturur.

**Body (Mevcut Müşteri):**
```json
{
  "customerId": 1,
  "status": "pending",
  "items": [
    { "productId": 10, "quantity": 2, "unitPrice": 100 }
  ]
}
```

**Body (Guest Customer):**
```json
{
  "guestCustomer": {
    "firstName": "Ayşe",
    "email": "ayse@test.com"
  },
  "items": [...]
}
```

### 3. Sipariş Detayı
**GET** `/orders/:id`

Sipariş detayını ve içindeki ürün kalemlerini (items) döndürür.

---

##  Ürün (Products) Endpoints

### 1. Ürünleri Listele
**GET** `/products`

### 2. Ürün Oluştur
**POST** `/products`

**Body:**
```json
{
  "name": "Laptop",
  "price": 15000.00,
  "stockQuantity": 50
}
```

---

##  Swagger UI

Detaylı interaktif dokümantasyon için sistem çalışırken aşağıdaki adresi ziyaret edebilirsiniz:

`http://localhost:3000/api-docs`
