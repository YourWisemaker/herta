/**
 * Herta.js API Module
 * Provides REST and GraphQL interfaces for Herta.js mathematical capabilities
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { ApolloServer } from 'apollo-server-express';
import herta from '../index.js'; // Added .js extension

// Import API modules
import restRouter from './rest/index.js'; // Added /index.js
import { typeDefs, resolvers } from './graphql/index.js'; // Added /index.js

/**
 * Create and configure a Herta.js API server
 * @param {Object} options - Configuration options
 * @param {number} options.port - Port to listen on (default: 3000)
 * @param {boolean} options.enableSwagger - Enable Swagger documentation (default: true)
 * @param {boolean} options.enableGraphQL - Enable GraphQL API (default: true)
 * @param {boolean} options.enableCORS - Enable CORS (default: true)
 * @param {Object} options.swaggerOptions - Swagger configuration options
 * @returns {Object} Express app and server instances
 */
function createApiServer(options = {}) {
  const {
    port = 3000,
    enableSwagger = true,
    enableGraphQL = true,
    enableCORS = true,
    swaggerOptions = {}
  } = options;

  // Create Express app
  const app = express();

  // Middleware
  if (enableCORS) {
    app.use(cors());
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API routes
  app.use('/api', restRouter);

  // Swagger documentation
  if (enableSwagger) {
    const swaggerDefinition = {
      info: {
        title: 'Herta.js API',
        version: '1.0.0',
        description: 'API for the Herta.js advanced mathematics framework',
        license: {
          name: 'MIT'
        }
      },
      host: `localhost:${port}`,
      basePath: '/api',
      ...swaggerOptions
    };

    const swaggerSpec = swaggerJsDoc({
      swaggerDefinition,
      apis: ['./src/api/**/*.js']
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // GraphQL API
  if (enableGraphQL) {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      playground: true
    });

    // Initialize Apollo server and apply middleware to Express
    const startApolloServer = async () => {
      await apolloServer.start();
      apolloServer.applyMiddleware({ app, path: '/graphql' });
    };

    startApolloServer();
  }

  // Root route with API information
  app.get('/', (req, res) => {
    res.json({
      name: 'Herta.js API',
      version: '1.0.0',
      description: 'API for the Herta.js advanced mathematics framework',
      endpoints: {
        rest: '/api',
        graphql: '/graphql',
        documentation: '/api-docs'
      }
    });
  });

  // Helper function to start server
  const startServer = (customPort = port) => new Promise((resolve) => {
    const server = app.listen(customPort, () => {
      console.log(`Herta.js API Server running on port ${customPort}`);
      resolve(server);
    });
  });

  return {
    app,
    startServer
  };
}

export {
  createApiServer
};
