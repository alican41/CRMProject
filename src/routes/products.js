const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Ürün yönetimi
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listele
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: isStockTrackingActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Ürün listesi
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, isActive, isStockTrackingActive } = req.query;
    
    const result = await productService.listProducts({
      page,
      limit,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isStockTrackingActive: isStockTrackingActive !== undefined ? isStockTrackingActive === 'true' : undefined
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: ID'ye göre ürün getir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün detayları
 *       404:
 *         description: Ürün bulunamadı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün oluştur
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop"
 *               description:
 *                 type: string
 *                 example: "Dell XPS 15"
 *               price:
 *                 type: number
 *                 example: 25000.00
 *               stockQuantity:
 *                 type: integer
 *                 example: 10
 *               isStockTrackingActive:
 *                 type: boolean
 *                 default: true
 *                 description: "Stok takibi aktif mi? False ise sınırsız stok"
 *     responses:
 *       201:
 *         description: Ürün oluşturuldu
 */
router.post('/', async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    
    logger.info('Product created via API', { 
      productId: product.id, 
      traceId: req.traceId 
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Ürün güncelle
 *     tags: [Products]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isStockTrackingActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ürün güncellendi
 */
router.put('/:id', async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Ürünü sil (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün silindi
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}/check-stock:
 *   post:
 *     summary: Stok kontrolü yap
 *     tags: [Products]
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
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Stok durumu
 */
router.post('/:id/check-stock', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const isAvailable = await productService.checkStock(req.params.id, quantity);
    
    res.json({ 
      productId: parseInt(req.params.id),
      requestedQuantity: quantity,
      isAvailable 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
