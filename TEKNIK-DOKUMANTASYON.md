# Teknik Dokümantasyon

## Genel Bakış

Bu doküman, Mini-CRM projesinin teknik altyapısını, kullanılan teknolojileri, tasarım kararlarını, güvenlik ve performans stratejilerini kapsar.

## 1. Tasarım Kararları

Projenin geliştirilmesinde aşağıdaki temel tasarım kararları alınmıştır:

### Mimari Yaklaşım
- **Katmanlı Mimari (Layered Architecture):** Kod tabanı Routes, Services ve Models olarak 3 ana katmana ayrılmıştır. Bu sayede sorumlulukların ayrılması (Separation of Concerns) sağlanmış, kodun test edilebilirliği ve bakımı kolaylaştırılmıştır.

### Teknoloji Seçimleri
- **Node.js & Express:** Hafif ve performanslı yapısı nedeniyle tercih edilmiştir.
- **PostgreSQL & Sequelize:** İlişkisel veri tutarlılığı (ACID) ve migration yönetimi kolaylığı için seçilmiştir.
- **Winston:** Merkezi ve seviyeli loglama ihtiyacı için kullanılmıştır.

### Veritabanı Stratejisi
- **Soft Delete:** Verilerin kaybolmaması için silme işlemlerinde kayıtların `is_active` alanı `false` yapılır veya `deletedAt` timestampi kullanılır.
- **Indexing:** Performans kritik sorgular için (Email, Phone, Status alanları) veritabanı indeksleri oluşturulmuştur.

## 2. API Tasarım Prensipleri

1. **RESTful:** Resource-based URL'ler
2. **Validation:** Her input doğrulanır
3. **Error Handling:** Standart error format
4. **Logging:** Her istek loglanır
5. **Trace ID:** Request tracking

## 3. Güvenlik

- **Input Validation:** Tüm kullanıcı girdileri `express-validator` ile kontrol edilir.
- **SQL Injection Koruması:** Sequelize ORM kullanılarak ham SQL sorguları yerine parametreli sorgular kullanılır.
- **Error Handling:** Production ortamında `stack trace` bilgileri gizlenerek sistem detaylarının dışarı sızması engellenir.
- **Environment Variables:** Veritabanı şifreleri, API anahtarları gibi hassas bilgiler kod içinde değil, `.env` dosyalarında saklanır.

## 4. Performans İyileştirmeleri

- **Database Indexing:** Sıkça aranan sütunlar (email, phone, status) üzerinde indeksler oluşturulmuştur.
- **Connection Pooling:** Veritabanı bağlantı havuzu kullanılarak yüksek trafikli anlarda performans korunur.
- **Log Rotation:** Log dosyalarının disk alanını doldurmasını engellemek için `winston-daily-rotate-file` kullanılır.
- **Pagination:** Listeleme servislerinde sayfalama desteği (limit/offset) sunulur.

## 5. Mimari Tasarım
Projenin detaylı mimari tasarımı, veritabanı şeması ve UML diyagramları için lütfen [MIMARI-TASARIM.md](./MIMARI-TASARIM.md) dosyasına bakınız.

- Pagination desteği (limit)

