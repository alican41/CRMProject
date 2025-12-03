const { body, param, validationResult } = require('express-validator');

// Validation hatalarını kontrol eden middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Müşteri oluşturma validation kuralları
const createCustomerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('İsim zorunludur')
    .isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arası olmalıdır'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Soyisim 2-50 karakter arası olmalıdır'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası giriniz (örn: 05321112233)'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Adres en fazla 500 karakter olabilir'),
  
  validate
];

// Müşteri güncelleme validation kuralları
const updateCustomerValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçerli bir ID giriniz'),
  
  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('İsim boş olamaz')
    .isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arası olmalıdır'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Soyisim 2-50 karakter arası olmalıdır'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası giriniz'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Adres en fazla 500 karakter olabilir'),
  
  validate
];

// ID parametresi validation
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçerli bir ID giriniz'),
  validate
];

module.exports = {
  createCustomerValidation,
  updateCustomerValidation,
  idValidation
};