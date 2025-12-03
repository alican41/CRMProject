const { createCustomerValidation, updateCustomerValidation, idValidation } = require('../middlewares/customerValidation');
const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');


/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listele
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Müşteri listesi başarıyla döndürüldü
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
// GET /api/customers
router.get('/', async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers();
    res.json(customers);
  } catch (err) {
    logger.error('Error listing customers', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Yeni müşteri oluştur
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Ahmet
 *               lastName:
 *                 type: string
 *                 example: Yılmaz
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmet@example.com
 *               phone:
 *                 type: string
 *                 example: 05321112233
 *               address:
 *                 type: string
 *                 example: İstanbul, Kadıköy
 *     responses:
 *       201:
 *         description: Müşteri başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/customers
router.post('/',createCustomerValidation, async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer({
      ...req.body,
      traceId: req.traceId
    });
    res.status(201).json(customer);
  } catch (err) {
    logger.error('Error creating customer', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: ID'ye göre müşteri getir
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Müşteri ID
 *     responses:
 *       200:
 *         description: Müşteri bulundu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/customers/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.traceId);
    res.json(customer);
  } catch (err) {
    logger.error('Error getting customer', { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Müşteri bilgilerini güncelle
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Müşteri ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Müşteri güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 */
// PUT /api/customers/:id
router.put('/:id', updateCustomerValidation, async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, {
      ...req.body,
      traceId: req.traceId
    });
    res.json(customer);
  } catch (err) {
    logger.error('Error updating customer', { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Müşteri sil
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Müşteri ID
 *     responses:
 *       200:
 *         description: Müşteri silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Müşteri bulunamadı
 */
// DELETE /api/customers/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id, req.traceId);
    res.json(result);
  } catch (err) {
    logger.error('Error deleting customer', { err });
    next(err);
  }
});

module.exports = router;
