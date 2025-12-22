const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');
const { 
  createOrderValidation, 
  updateOrderValidation, 
  idValidation 
} = require('../middlewares/orderValidation');


/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Siparişleri listele
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Duruma göre filtrele
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Müşteriye göre filtrele
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maksimum kayıt sayısı
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      customerId: req.query.customerId,
      limit: req.query.limit
    };
    const orders = await orderService.listOrders(filters);
    res.json(orders);
  } catch (err) {
    logger.error('Error listing orders', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni sipariş oluştur
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: "Mevcut müşteri ID (guestCustomer yoksa zorunlu)"
 *                 example: 1
 *               guestCustomer:
 *                 type: object
 *                 description: "Misafir müşteri bilgileri (customerId yoksa zorunlu)"
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *               status:
 *                 type: string
 *                 enum: [pending, preparing, shipped, delivered, cancelled]
 *                 example: pending
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     productName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *                 example: 250.50
 *     responses:
 *       201:
 *         description: Sipariş oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation hatası
 *       404:
 *         description: Müşteri bulunamadı
 */
// POST /api/orders
router.post('/', createOrderValidation, async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      traceId: req.traceId
    });
    res.status(201).json(order);
  } catch (err) {
    logger.error('Error creating order', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: ID'ye göre sipariş getir
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş bulundu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Sipariş bulunamadı
 */
// GET /api/orders/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.traceId);
    res.json(order);
  } catch (err) {
    logger.error('Error getting order', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Sipariş güncelle
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               totalAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sipariş güncellendi
 *       404:
 *         description: Sipariş bulunamadı
 */
// PUT /api/orders/:id
router.put('/:id', updateOrderValidation, async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, {
      ...req.body,
      traceId: req.traceId
    });
    res.json(order);
  } catch (err) {
    logger.error('Error updating order', { err });
    next(err);
  }
});


/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Sipariş sil
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş silindi
 *       404:
 *         description: Sipariş bulunamadı
 */
// DELETE /api/orders/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id, req.traceId);
    res.json(result);
  } catch (err) {
    logger.error('Error deleting order', { err });
    next(err);
  }
});

module.exports = router;