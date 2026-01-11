#  Kurulum Rehberi

Bu rehber, Mini-CRM projesini yerel geliştirme ortamınızda (Localhost) çalıştırmak için gerekli adımları içerir.

##  Gereksinimler

Kuruluma başlamadan önce bilgisayarınızda aşağıdakilerin yüklü olduğundan emin olun:

1.  **Node.js** (v18 veya üzeri) - [İndir](https://nodejs.org/)
2.  **PostgreSQL** (v14 veya üzeri) - [İndir](https://www.postgresql.org/)
3.  **Git** - [İndir](https://git-scm.com/)

---

##  Adım Adım Kurulum

### 1. Projeyi Klonlayın
Komut satırını (Terminal/CMD) açın ve aşağıdaki komutları çalıştırın:

```bash
git clone https://github.com/alican41/CRMProject.git
cd CRMProject
# Eğer klasör adı farklıysa, indirdiğiniz klasöre girin (örn: cd mini-crm)
```

### 2. Bağımlılıkları Yükleyin
Proje klasöründeyken gerekli kütüphaneleri yükleyin:

```bash
npm install
```

### 3. Çevre Değişkenlerini (Environment Variables) Ayarlayın
Ana dizinde `.env` dosyasını oluşturun (Varsa `.env.example` dosyasını kopyalayarak adını `.env` yapabilirsiniz).

`.env` dosyası içeriği:

```env
NODE_ENV=development
APP_PORT=3000

# Veritabanı Ayarları
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=mini_crm
DB_USER=postgres    # Kendi DB kullanıcınız
DB_PASS=sifreniz    # Kendi DB şifreniz

# Log Ayarları
LOG_LEVEL=debug
```

### 4. Veritabanını Oluşturun
PostgreSQL'de `mini_crm` adında bir veritabanı oluşturmanız gerekir. Bunu SQL komutuyla veya pgAdmin gibi bir arayüzle yapabilirsiniz.

**SQL Komutu ile:**
```bash
psql -U postgres
# Şifrenizi girin, ardından:
CREATE DATABASE mini_crm;
\q
```

### 5. Veritabanı Tablolarını Oluşturun (Migration)
Sequelize kullanarak tabloları oluşturmak için:

```bash
npm run migrate
```
*Bu işlem `customers`, `orders`, `products` gibi tabloları veritabanında oluşturacaktır.*

### 6. Uygulamayı Başlatın

Geliştirme modunda (değişiklikleri anlık izler):
```bash
npm run dev
```

veya Standart modda:
```bash
npm start
```

### 7. Kontrol Edin
Tarayıcınızı açın ve adrese gidin:
`http://localhost:3000/health`

`{"status": "ok"}` yanıtını görüyorsanız kurulum başarılıdır! 🎉

---

##  Testleri Çalıştırma
Sistemin doğru çalıştığından emin olmak için testleri çalıştırabilirsiniz:

```bash
npm test
```
