const logger = require('../lib/logger');

/**
 * Metindeki Türkçe karakterleri İngilizce karşılıklarına çevirir.
 * Örnek: "Şule Çelik" -> "Sule Celik"
 */
function toEnglishCharacters(text) {
  if (!text) return null;
  
  let str = text.toString();

  // Türkçe karakter haritası
  const charMap = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O'
  };

  // Karakterleri değiştir
  return str.replace(/[çÇğĞşŞüÜıİöÖ]/g, (char) => charMap[char] || char);
}

/**
 * İsim temizle: Hem İngilizceye çevir hem de baş harfleri büyüt (Title Case)
 * Örnek: "ömer çağrı" -> "Omer Cagri"
 */
function cleanName(name) {
  if (!name) return null;
  
  // 1. Tırnakları kaldır
  let cleaned = name.toString().replace(/['"]/g, '').trim();
  
  // 2. İngilizce karakterlere çevir
  cleaned = toEnglishCharacters(cleaned);

  // 3. Baş harfleri büyüt, gerisini küçült (Okunabilirlik için)
  // Eğer tamamen büyük harf istersen burayı .toUpperCase() yapabilirsin.
  return cleaned.split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Telefon numarasını temizle ve +90 formatına zorla
 */
function cleanPhone(phone) {
  if (!phone) return null;
  
  let digits = phone.toString().replace(/\D/g, ''); // Sadece rakamlar
  
  if (digits.length === 0) return null;

  // 90 ile başlıyorsa
  if (digits.startsWith('90') && digits.length > 10) {
    return '+' + digits;
  }
  
  // 0 ile başlıyorsa
  if (digits.startsWith('0')) {
    return '+90' + digits.substring(1);
  }
  
  // Hiçbiri değilse
  return '+90' + digits;
}

/**
 * Email temizle
 */
function cleanEmail(email) {
  if (!email) return null;
  let cleaned = email.toString().trim();
  // İngilizce karakter zorunluluğu emailde zaten teknik olarak vardır ama yine de uygulayalım
  cleaned = toEnglishCharacters(cleaned).toLowerCase(); 
  cleaned = cleaned.replace('@@', '@');
  return cleaned;
}

/**
 * Adres temizle (Bunu da İngilizce karaktere çeviriyoruz)
 */
function cleanAddress(address) {
  if (!address) return null;
  let cleaned = address.toString().trim();
  return toEnglishCharacters(cleaned);
}

/**
 * Duplicate kontrol anahtarı oluştur
 * Veriler zaten cleanName ile İngilizceye döndüğü için direkt birleştirebiliriz.
 */
function generateCompositeKey(firstName, lastName, phone) {
  const f = firstName ? firstName.toUpperCase() : 'BILINMEYEN';
  const l = lastName ? lastName.toUpperCase() : '-';
  const p = phone ? phone : 'NO_PHONE';
  
  return `${f}|${l}|${p}`;
}

module.exports = {
  toEnglishCharacters,
  cleanPhone,
  cleanEmail,
  cleanName,
  cleanAddress,
  generateCompositeKey
};