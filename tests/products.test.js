const { Product } = require('../src/models');

describe('Product Model', () => {
  
  test('should create product with additional prices', async () => {
    const productData = {
      name: 'Çok Fiyatlı Ürün',
      price: 100.00,
      stockQuantity: 50,
      additionalPrices: {
        toptan: 80.00,
        ozelMusteri: 90.00,
        dolar: 5.50
      }
    };

    const product = await Product.create(productData);

    expect(product.id).toBeDefined();
    expect(product.additionalPrices).toBeDefined();
    expect(product.additionalPrices.toptan).toBe(80.00);
    expect(product.additionalPrices.dolar).toBe(5.50);
  });

  test('should allow null additional prices', async () => {
    const product = await Product.create({
      name: 'Normal Ürün',
      price: 50.00,
      stockQuantity: 10
    });

    expect(product.id).toBeDefined();
    expect(product.additionalPrices).toBeNull();
  });
});
