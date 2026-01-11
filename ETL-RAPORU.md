#  ETL Raporu (Extract, Transform, Load)

##  Amaç
Bu rapor, dış kaynaklardan (örneğin Excel veya CSV) alınan ham müşteri verilerinin Mini-CRM sistemine aktarılması sürecini, temizleme kurallarını ve aktarım sonuçlarını açıklar.

##  Kullanılan Araçlar
- **Script:** `scripts/importCustomers.js`
- **Kütüphaneler:** `csv-parser` veya `xlsx` (veri okuma için), `sequelize` (veritabanı yazımı için)
- **Kaynak Dosya:** `data/customers.csv`

---

##  İşlem Adımları (Pipeline)

### 1. Extract (Veri Çıkarma)
- Kaynak dosya satır satır okunur.
- Bellek yönetimi için stream yapısı kullanılır (büyük dosyalar için optimize edilmiştir).

### 2. Transform (Dönüştürme ve Temizleme)
Ham veri üzerinde aşağıdaki temizleme işlemleri uygulanır:

#### Telefon Numarası Normalizasyonu
- Farklı formatlardaki numaralar `+90` formatına veya sadece `0` ile başlayan 11 haneli formata dönüştürülür.
- Örnek:
    - `"532 100 20 30"` -> `"05321002030"`
    - `"+90532..."` -> `"0532..."`
- Geçersiz karakterler (boşluk, tire) temizlenir.

#### İsim Düzenleme
- İsimlerin baş harfleri büyütülür, geri kalanı küçük harf yapılır (Title Case).
- Gereksiz boşluklar (trim) temizlenir.

#### Validasyon
- **Email:** Geçerli bir email formatı olup olmadığı kontrol edilir.
- **Zorunlu Alanlar:** Ad (First Name) alanı boş olamaz.

### 3. Load (Yükleme)
- Temizlenen veriler veritabanına aktarılır.
- **Duplicate Kontrolü:** Sistemde zaten kayıtlı olan (Email veya Telefon eşleşmesi) müşteriler tekrar eklenmez, "Duplicate" olarak işaretlenip rapora eklenir.

---

##  Özet Sonuçları

(`data/import-report.json`):

```json
{
  "total": 20,
  "success": 11,
  "failed": 0,
  "duplicates": 3,
  "skipped": 6,
  "errors": [],
  "warnings": [
    "Satır 3 Atlandı: Geçersiz Soyad (undefined)",
    "Satır 4 Atlandı: Geçersiz Email (ayse.kara@mail)",
    "Satır 8: [Fatma Nur Yilmaz - +905321112233] zaten mevcut (Duplicate).",
    "Satır 9 Atlandı: Geçersiz Ad (undefined)",
    "Satır 10 Atlandı: Geçersiz Soyad (undefined)",
    "Satır 12: [Ali Ozturk - +905554443322] zaten mevcut (Duplicate).",
    "Satır 15: [Ahmet Yilmaz - +905321112233] zaten mevcut (Duplicate).",
    "Satır 17 Atlandı: Geçersiz Soyad (undefined)",
    "Satır 19 Atlandı: Geçersiz Email (esra_arslanmail.com)"
  ]
}
```

## ✅ Sonuç
ETL süreci başarıyla test edilmiş ve örnek veriler sisteme tutarlı bir şekilde aktarılmıştır.
