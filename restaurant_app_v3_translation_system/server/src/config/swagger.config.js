/**
 * Swagger/OpenAPI Configuration
 * 
 * Enterprise-grade API documentation for third-party integrations.
 * Accessible at /api-docs
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management API',
      version: '3.0.0',
      description: `
## Enterprise Restaurant Management System API

Complete API documentation for integrating with:
- **Accounting Software**: Saga, WinMentor, Atlantis
- **Delivery Platforms**: Glovo, Uber Eats, Bolt Food
- **BI Systems**: Power BI, Tableau
- **POS Systems**: External integrations

### Authentication
Most endpoints require authentication via Bearer token or API key.

### Rate Limiting
- 100 requests/minute for standard endpoints
- 1000 requests/minute for read-only endpoints
- Custom limits available for enterprise clients

### Webhooks
Subscribe to real-time events for orders, inventory, and compliance.
      `,
      contact: {
        name: 'API Support',
        email: 'api@restaurant-app.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://restaurant-app.com/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.restaurant-app.com',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Menu', description: 'Menu and product management' },
      { name: 'Inventory', description: 'Stock and ingredient management' },
      { name: 'Recipes', description: 'Recipe and food cost management' },
      { name: 'Delivery', description: 'Delivery and courier management' },
      { name: 'Reports', description: 'Analytics and reporting' },
      { name: 'Compliance', description: 'HACCP and compliance management' },
      { name: 'Financial', description: 'Financial and fiscal operations' },
      { name: 'Webhooks', description: 'Webhook subscriptions and events' },
      { name: 'Settings', description: 'System configuration' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            code: { type: 'string', example: 'ERROR_CODE' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 50 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 2 }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] },
            total: { type: 'number', example: 45.50 },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            timestamp: { type: 'string', format: 'date-time' },
            table_number: { type: 'integer', example: 5 },
            order_source: { type: 'string', enum: ['pos', 'delivery', 'kiosk', 'online'] }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            product_id: { type: 'integer' },
            name: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number' },
            notes: { type: 'string' }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            name_en: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            is_active: { type: 'boolean' },
            allergens: { type: 'array', items: { type: 'string' } }
          }
        },
        Ingredient: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            unit: { type: 'string' },
            current_stock: { type: 'number' },
            min_stock: { type: 'number' },
            cost_per_unit: { type: 'number' },
            category: { type: 'string' },
            supplier: { type: 'string' }
          }
        },
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            url: { type: 'string', format: 'uri' },
            events: { type: 'array', items: { type: 'string' } },
            active: { type: 'boolean' },
            secret: { type: 'string' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ]
  },
  apis: [
    './src/modules/**/routes.js',
    './src/modules/**/controllers/*.js',
    './routes/*.js',
    './src/swagger-docs/*.yaml'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger middleware
 * @param {Express} app - Express application
 */
function setupSwagger(app) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Restaurant API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true
    }
  }));
  
  // Raw OpenAPI spec endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📚 Swagger API docs available at /api-docs');
}

module.exports = {
  swaggerSpec,
  setupSwagger,
  swaggerOptions
};

