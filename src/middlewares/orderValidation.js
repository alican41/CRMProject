const { body, param, validationResult } = require('express-validator');

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

// Sipariş oluşturma validation
const createOrderValidation = [
  body('customerId')
    .if(body('guestCustomer').not().exists()) // Eğer guestCustomer yoksa customerId zorunlu
    .notEmpty().withMessage('Müşteri ID veya Misafir Müşteri bilgisi zorunludur')
    .isInt({ min: 1 }).withMessage('Geçerli bir müşteri ID giriniz'),
  
  body('guestCustomer')
    .if(body('customerId').not().exists()) // Eğer customerId yoksa guestCustomer zorunlu
    .notEmpty().withMessage('Müşteri ID veya Misafir Müşteri bilgisi zorunludur')
    .isObject().withMessage('Misafir müşteri bilgileri obje olmalıdır'),

  body('status')
    .optional()
    .isIn(['pending', 'preparing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Geçersiz sipariş durumu'),
  
  body('totalAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('Geçerli bir tutar giriniz')
    .custom((value) => value >= 0).withMessage('Tutar negatif olamaz'),
  
  validate
];

// Sipariş güncelleme validation
const updateOrderValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçerli bir ID giriniz'),
  
  body('status')
    .optional()
    .isIn(['pending', 'preparing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Geçersiz sipariş durumu'),
  
  body('totalAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('Geçerli bir tutar giriniz')
    .custom((value) => value >= 0).withMessage('Tutar negatif olamaz'),
  
  validate
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçerli bir ID giriniz'),
  validate
];

module.exports = {
  createOrderValidation,
  updateOrderValidation,
  idValidation
};