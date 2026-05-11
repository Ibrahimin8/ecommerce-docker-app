const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for Auth, User, Product, Cart, Category, Orders, and Reviews.',
  },
  servers: [
    {
      url: 'https://ecommerce-docker-app.onrender.com',
      description: 'Production Server',
    },
    {
        url: 'http://localhost:5003',
        description: 'Local development server',
      },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    // --- AUTHENTICATION ---
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', example: 'user' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'User registered. Verify email.' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Login successful' } }
      }
    },
    '/api/auth/verify-email': {
      get: {
        tags: ['Authentication'],
        summary: 'Verify email token',
        parameters: [{ in: 'query', name: 'token', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Email verified' } }
      }
    },

    // --- PRODUCTS ---
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products (Includes Caching)',
        parameters: [
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } },
          { in: 'query', name: 'search', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'List of products' } }
      },
      post: {
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        summary: 'Create product (Admin Only)',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                  categoryId: { type: 'integer' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Product created' } }
      }
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Product details' } }
      }
    },

    // --- CART ---
    '/api/cart': {
      get: {
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        summary: 'View current user cart',
        responses: { 200: { description: 'Cart data' } }
      }
    },
    '/api/cart/add': {
      post: {
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        summary: 'Add item to cart',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'integer', example: 1 },
                  quantity: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Added to cart' } }
      }
    },
    '/api/cart/item/{productId}': {
      delete: {
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        summary: 'Remove single item from cart',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Item removed' } }
      }
    },
    '/api/cart/clear': {
      delete: {
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        summary: 'Clear entire cart',
        responses: { 200: { description: 'Cart cleared' } }
      }
    },

    // --- ORDERS ---
    '/api/orders': {
      post: {
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        summary: 'Place order from cart items',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: { type: 'array', items: { type: 'object' } },
                  totalPrice: { type: 'number', example: 250.50 },
                  city: { type: 'string', example: 'Addis Ababa' },
                  phone: { type: 'string', example: '0911...' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Order successful' } }
      }
    },
    '/api/orders/my-orders': {
      get: {
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        summary: 'Get user order history',
        responses: { 200: { description: 'Order list' } }
      }
    },
    '/api/orders/admin/status/{id}': {
      patch: {
        tags: ['Admin Orders'],
        security: [{ bearerAuth: [] }],
        summary: 'Update order status (Admin Only)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['pending', 'shipping', 'complete', 'cancel'] }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Status updated' } }
      }
    },
    '/api/orders/admin/stats': {
      get: {
        tags: ['Admin Orders'],
        security: [{ bearerAuth: [] }],
        summary: 'Get sales revenue and total count',
        responses: { 200: { description: 'Stats data' } }
      }
    },

    // --- REVIEWS ---
    '/api/reviews': {
      post: {
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        summary: 'Add a product review',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'integer' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Review added' } }
      }
    },
    '/api/reviews/product/{productId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get all reviews for a product',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Reviews list' } }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [], // Keep empty because we defined paths manually above
};

module.exports = swaggerJSDoc(options);