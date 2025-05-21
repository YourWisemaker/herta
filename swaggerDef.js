/**
 * Swagger definition for Herta.js API
 * This configures the auto-generated API documentation
 */

module.exports = {
  info: {
    title: 'Herta.js API',
    version: '1.0.0',
    description: 'API for the Herta.js advanced mathematics framework',
    license: {
      name: 'MIT',
      url: 'https://github.com/hertajs/herta/blob/main/LICENSE'
    },
    contact: {
      name: 'Herta.js Team',
      url: 'https://github.com/hertajs/herta',
      email: 'team@hertajs.org'
    }
  },
  host: 'localhost:3000',
  basePath: '/api',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Core',
      description: 'Core mathematical operations'
    },
    {
      name: 'Matrix',
      description: 'Matrix operations and linear algebra'
    },
    {
      name: 'Calculus',
      description: 'Calculus and differential equations'
    },
    {
      name: 'Optimization',
      description: 'Optimization algorithms and solvers'
    },
    {
      name: 'Graph',
      description: 'Graph theory and network analysis'
    },
    {
      name: 'Quantum',
      description: 'Quantum mechanics calculations'
    },
    {
      name: 'Statistics',
      description: 'Statistical analysis and probability theory'
    },
    {
      name: 'Fluid',
      description: 'Fluid dynamics simulations'
    },
    {
      name: 'Vision',
      description: 'Computer vision algorithms'
    },
    {
      name: 'Strings',
      description: 'String algorithms and text processing'
    },
    {
      name: 'NumberTheory',
      description: 'Number theory operations'
    },
    {
      name: 'Chaos',
      description: 'Chaos theory and fractals'
    }
  ],
  definitions: {
    Error: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false
        },
        error: {
          type: 'string',
          example: 'Error description'
        }
      }
    },
    SuccessResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        data: {
          type: 'object',
          example: {}
        }
      }
    }
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Bearer token authentication'
    }
  }
};
