const { Product } = require('../models');
const logger = require('../lib/logger');

class ProductService {
  /**
   * Tüm ürünleri listele (aktif ürünler)
   */
  async listProducts(payload = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        isActive = true,
        isStockTrackingActive 
      } = payload;

      const where = {};
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (isStockTrackingActive !== undefined) {
        where.isStockTrackingActive = isStockTrackingActive;
      }

      const offset = (page - 1) * limit;
      
      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing products', { error: error.message });
      throw error;
    }
  }

  /**
   * ID'ye göre ürün getir
   */
  async getProductById(id) {
    try {
      const product = await Product.findByPk(id);
      
      if (!product) {
        const error = new Error('Ürün bulunamadı');
        error.status = 404;
        throw error;
      }

      return product;
    } catch (error) {
      logger.error('Error getting product', { productId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Yeni ürün oluştur
   */
  async createProduct(payload) {
    try {
      const { 
        name, 
        description, 
        price, 
        stockQuantity = 0,
        isStockTrackingActive = true,
        isActive = true 
      } = payload;

      const product = await Product.create({
        name,
        description,
        price,
        stockQuantity,
        isStockTrackingActive,
        isActive
      });

      logger.info('Product created', { productId: product.id, name: product.name });
      return product;
    } catch (error) {
      logger.error('Error creating product', { error: error.message });
      throw error;
    }
  }

  /**
   * Ürün güncelle
   */
  async updateProduct(id, payload) {
    try {
      const product = await this.getProductById(id);

      const { 
        name, 
        description, 
        price, 
        stockQuantity,
        isStockTrackingActive,
        isActive 
      } = payload;

      await product.update({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stockQuantity !== undefined && { stockQuantity }),
        ...(isStockTrackingActive !== undefined && { isStockTrackingActive }),
        ...(isActive !== undefined && { isActive })
      });

      logger.info('Product updated', { productId: id });
      return product;
    } catch (error) {
      logger.error('Error updating product', { productId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Ürünü sil (soft delete)
   */
  async deleteProduct(id) {
    try {
      const product = await this.getProductById(id);
      
      await product.update({ isActive: false });
      
      logger.info('Product soft deleted', { productId: id });
      return { message: 'Ürün başarıyla silindi' };
    } catch (error) {
      logger.error('Error deleting product', { productId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Stok kontrolü yap
   * @param {number} productId - Ürün ID
   * @param {number} requestedQuantity - İstenen miktar
   * @returns {boolean} - Stok yeterli mi?
   */
  async checkStock(productId, requestedQuantity) {
    try {
      const product = await this.getProductById(productId);

      // Stok takibi kapalıysa her zaman true
      if (!product.isStockTrackingActive) {
        return true;
      }

      // Stok takibi açıksa kontrol et
      return product.stockQuantity >= requestedQuantity;
    } catch (error) {
      logger.error('Error checking stock', { productId, error: error.message });
      throw error;
    }
  }

  /**
   * Stok güncelle (sipariş sonrası)
   */
  async updateStock(productId, quantity) {
    try {
      const product = await this.getProductById(productId);

      // Stok takibi kapalıysa güncelleme yapma
      if (!product.isStockTrackingActive) {
        logger.info('Stock tracking disabled for product', { productId });
        return product;
      }

      const newStock = product.stockQuantity - quantity;
      
      if (newStock < 0) {
        const error = new Error('Yetersiz stok');
        error.status = 400;
        throw error;
      }

      await product.update({ stockQuantity: newStock });
      
      logger.info('Stock updated', { productId, oldStock: product.stockQuantity, newStock });
      return product;
    } catch (error) {
      logger.error('Error updating stock', { productId, error: error.message });
      throw error;
    }
  }
}

module.exports = new ProductService();
