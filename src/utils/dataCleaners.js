const logger = require('../lib/logger');

/**
 * Telefon numarasını temizle ve normalize et
 * Hedef format: 05XXXXXXXXX (11 haneli)
 */
function cleanPhone(phone) {
  if (!phone) return null;
  
  // Tüm özel karakterleri ve boşlukları kaldır
  let cleaned = phone.toString().replace(/[\s\-\(\)]/g, '');
  
  // +90 ile başlıyorsa kaldır
  if (cleaned.startsWith('+90')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('90') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  // 0 ile başlamıyorsa ekle
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  
  // 11 haneli değilse veya 0 ile başlamıyorsa geçersiz
  if (cleaned.length !== 11 || !cleaned.startsWith('0')) {
    logger.warn('Invalid phone format', { original: phone, cleaned });
    return null;
  }
  
  return cleaned;
}

/**
 * Email adresini temizle ve doğrula
 */
function cleanEmail(email) {
  if (!email) return null;
  
  // Trim ve lowercase
  let cleaned = email.toString().trim().toLowerCase();
  
  // Basit email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    logger.warn('Invalid email format', { email });
    return null;
  }
  
  return cleaned;
}

/**
 * İsmi temizle ve düzelt
 */
function cleanName(name) {
  if (!name) return null;
  
  // Tırnak işaretlerini kaldır
  let cleaned = name.toString().replace(/["""]/g, '').trim();
  
  // Çok kısa ise geçersiz
  if (cleaned.length < 2) {
    logger.warn('Name too short', { name });
    return null;
  }
  
  // İlk harfi büyük yap
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return cleaned;
}

/**
 * Adres temizle
 */
function cleanAddress(address) {
  if (!address || address === '-') return null;
  return address.toString().trim();
}

/**
 * Türkçe karakterleri normalize et (duplicate kontrolü için)
 */
function normalizeForComparison(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/[\s\-_]/g, '');
}

module.exports = {
  cleanPhone,
  cleanEmail,
  cleanName,
  cleanAddress,
  normalizeForComparison
};