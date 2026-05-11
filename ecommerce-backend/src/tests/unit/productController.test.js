const productController = require('../../controllers/productController');
const { Product, Category } = require('../../models');

// Mock the models
jest.mock('../../models', () => ({
    Product: {
        create: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        findAndCountAll: jest.fn(),
        update: jest.fn()
    },
    Category: {
        findByPk: jest.fn()
    }
}));

describe('Product Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 1, role: 'admin' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        
        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            // Mock request data
            req.body = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                sku: 'TEST123',
                stockQuantity: 100,
                categoryId: 1
            };

            // Mock category exists
            Category.findByPk.mockResolvedValue({ id: 1, name: 'Test Category' });

            // Mock SKU doesn't exist
            Product.findOne.mockResolvedValue(null);

            // Mock created product
            const mockProduct = {
                id: 1,
                ...req.body,
                createdBy: 1
            };
            Product.create.mockResolvedValue(mockProduct);

            // Mock product with category
            Product.findByPk.mockResolvedValue({
                ...mockProduct,
                category: { id: 1, name: 'Test Category', slug: 'test-category' }
            });

            await productController.createProduct(req, res, next);

            expect(Category.findByPk).toHaveBeenCalledWith(1);
            expect(Product.findOne).toHaveBeenCalledWith({ where: { sku: 'TEST123' } });
            expect(Product.create).toHaveBeenCalledWith({
                ...req.body,
                createdBy: 1
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: {
                    product: expect.any(Object)
                }
            });
        });

        it('should return 404 if category not found', async () => {
            req.body = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                categoryId: 999
            };

            Category.findByPk.mockResolvedValue(null);

            await productController.createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Category not found'
            });
        });

        it('should return 400 if SKU already exists', async () => {
            req.body = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                sku: 'EXISTING123',
                categoryId: 1
            };

            Category.findByPk.mockResolvedValue({ id: 1 });
            Product.findOne.mockResolvedValue({ id: 2, sku: 'EXISTING123' });

            await productController.createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'SKU already exists'
            });
        });

        it('should handle validation errors', async () => {
            req.body = {
                name: 'A', // Too short
                description: '',
                price: -10 // Invalid price
            };

            await productController.createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Validation failed',
                errors: expect.any(Array)
            });
        });
    });

    describe('getProductById', () => {
        it('should return product if found', async () => {
            req.params.id = 1;
            
            const mockProduct = {
                id: 1,
                name: 'Test Product',
                price: 99.99,
                category: { id: 1, name: 'Test Category' }
            };

            Product.findByPk.mockResolvedValue(mockProduct);

            await productController.getProductById(req, res, next);

            expect(Product.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: { product: mockProduct }
            });
        });

        it('should return 404 if product not found', async () => {
            req.params.id = 999;
            Product.findByPk.mockResolvedValue(null);

            await productController.getProductById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Product not found'
            });
        });
    });

    describe('deleteProduct', () => {
        it('should soft delete product', async () => {
            req.params.id = 1;
            
            const mockProduct = {
                id: 1,
                name: 'Test Product',
                isActive: true,
                update: jest.fn().mockResolvedValue(true)
            };

            Product.findByPk.mockResolvedValue(mockProduct);

            await productController.deleteProduct(req, res, next);

            expect(mockProduct.update).toHaveBeenCalledWith({ isActive: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Product deleted successfully'
            });
        });
    });
});