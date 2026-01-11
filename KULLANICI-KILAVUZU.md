#  Kullanıcı Kılavuzu

Mini-CRM sistemi, e-ticaret müşteri ve siparişlerini yönetmek için tasarlanmış web tabanlı bir API servisidir. Bu kılavuz, sistemin temel fonksiyonlarının nasıl kullanılacağını açıklar.

*Not: Bu sistem bir API (Arka Uç) projesidir. Kullanım için "Postman" gibi bir API istemcisi veya entegre edilmiş bir Frontend uygulaması gereklidir.*

---

## 1. Müşteri Yönetimi

### Müşteri Kaydı
Yeni bir müşteri eklemek için sisteme Ad, Soyad ve İletişim bilgilerini göndermeniz gerekir.
- **Zorunlu:** Ad (First Name)
- **Önemli:** E-posta adresi sistemde benzersiz olmalıdır. Aynı e-posta ile ikinci kez kayıt yapılamaz.

### Müşteri Arama
Kayıtlı müşterileri listelerken sayfalama (pagination) kullanabilirsiniz. Binlerce müşteriyi tek seferde çekmek yerine sayfa sayfa görüntüleyebilirsiniz.

---

## 2. Sipariş İşlemleri

### Sipariş Verme (Kayıtlı Müşteri)
Sistemde zaten kayıtlı bir müşteri için sipariş oluştururken sadece `customerId` (müşteri numarası) ve alınacak ürünleri belirtmeniz yeterlidir.

### Misafir Siparişi (Guest Checkout)
Eğer sipariş veren kişi sisteme üye değilse, sistemi önce üye olmaya zorlamazsınız. Sipariş bilgileriyle birlikte müşterinin Adı ve İletişim bilgilerini gönderdiğinizde, sistem arka planda önce müşteriyi kaydeder, sonra siparişi oluşturur.

### Stok Kontrolü
Sipariş verirken sistem ürün stoklarını kontrol eder. Eğer talep edilen ürün stokta yoksa veya yetersizse, sipariş işlemi reddedilir ve size uyarı mesajı döner.

---

## 3. Sık Sorulan Sorular (SSS)

**S:** Bir müşteriyi sildiğimde geçmiş siparişleri de silinir mi?
**C:** Evet, varsayılan ayarlarda bir müşteri silindiğinde (Hard Delete) ona ait siparişler de silinir. Bu yüzden silme işlemi yaparken dikkatli olunmalıdır.

**S:** Telefon numarası hangi formatta olmalı?
**C:** Sistem `0555...` veya `+90...` gibi formatları kabul eder ve otomatik olarak standart bir formata çevirir.

**S:** Sipariş durumu neler olabilir?
**C:** Bir sipariş şu aşamalardan geçer: `pending` (Bekliyor) -> `processing` (Hazırlanıyor) -> `shipped` (Kargoda) -> `delivered` (Teslim Edildi). Ayrıca `cancelled` (İptal) durumu da mevcuttur.
