/**
 * Herta.js Example Server
 * Demonstrates Herta.js's mathematical modules exposed through REST and GraphQL APIs
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { ApolloServer } = require('apollo-server-express');
const herta = require('../src/index');
const path = require('path');

// Import Swagger definition
const swaggerDefinition = require('../swaggerDef');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./examples/*.js', './src/api/**/*.js']
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @swagger
 * /api/matrix/multiply:
 *   post:
 *     tags:
 *       - Matrix
 *     summary: Multiply two matrices
 *     description: Multiplies matrix A by matrix B
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matrixA
 *               - matrixB
 *             properties:
 *               matrixA:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *               matrixB:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       200:
 *         description: Matrix multiplication result
 */
app.post('/api/matrix/multiply', (req, res) => {
  try {
    const { matrixA, matrixB } = req.body;
    const result = herta.multiply(matrixA, matrixB);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/optimize:
 *   post:
 *     tags:
 *       - Optimization
 *     summary: Run optimization algorithm
 *     description: Runs gradient descent or genetic algorithm optimization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - algorithm
 *               - params
 *             properties:
 *               algorithm:
 *                 type: string
 *                 enum: [gradient-descent, genetic]
 *               params:
 *                 type: object
 *     responses:
 *       200:
 *         description: Optimization results
 */
app.post('/api/optimize', (req, res) => {
  try {
    const { algorithm, params } = req.body;
    let result;
    
    switch(algorithm) {
      case 'gradient-descent':
        result = herta.optimization.gradientDescent(params);
        break;
      case 'genetic':
        result = herta.optimization.geneticAlgorithm(params);
        break;
      default:
        throw new Error('Unknown optimization algorithm');
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/quantum/state:
 *   post:
 *     tags:
 *       - Quantum
 *     summary: Create and operate on quantum states
 *     description: Create quantum states and apply quantum operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amplitudes
 *             properties:
 *               amplitudes:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: number
 *                     - type: object
 *                       properties:
 *                         re:
 *                           type: number
 *                         im:
 *                           type: number
 *               operation:
 *                 type: string
 *                 enum: [H, X, Y, Z, CNOT]
 *     responses:
 *       200:
 *         description: Resulting quantum state
 */
app.post('/api/quantum/state', (req, res) => {
  try {
    const { amplitudes, operation } = req.body;
    let state = herta.quantum.createState(amplitudes);
    
    if (operation) {
      state = herta.quantum.applyGate(operation, state);
    }
    
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/graph/analyze:
 *   post:
 *     tags:
 *       - Graph
 *     summary: Analyze graph properties
 *     description: Calculates various graph metrics and properties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vertices
 *               - edges
 *             properties:
 *               vertices:
 *                 type: array
 *                 items:
 *                   type: string
 *               edges:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     source:
 *                       type: string
 *                     target:
 *                       type: string
 *                     weight:
 *                       type: number
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [centrality, shortestPaths, communities]
 *     responses:
 *       200:
 *         description: Graph analysis results
 */
app.post('/api/graph/analyze', (req, res) => {
  try {
    const { vertices, edges, metrics = ['centrality'] } = req.body;
    
    // Create graph
    const graph = herta.graph.createUndirectedGraph();
    
    // Add vertices
    vertices.forEach(v => graph.addVertex(v));
    
    // Add edges
    edges.forEach(e => {
      graph.addEdge(e.source, e.target, { weight: e.weight || 1 });
    });
    
    // Calculate requested metrics
    const result = {};
    
    if (metrics.includes('centrality')) {
      result.degreeCentrality = herta.graph.degreeCentrality(graph);
      result.betweennessCentrality = herta.graph.betweennessCentrality(graph);
    }
    
    if (metrics.includes('shortestPaths')) {
      result.shortestPaths = {};
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const path = herta.graph.shortestPath(graph, vertices[i], vertices[j]);
          if (path) {
            if (!result.shortestPaths[vertices[i]]) {
              result.shortestPaths[vertices[i]] = {};
            }
            result.shortestPaths[vertices[i]][vertices[j]] = path;
          }
        }
      }
    }
    
    if (metrics.includes('communities')) {
      result.communities = herta.graph.communityDetection(graph, 'louvain');
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/fluid/reynolds:
 *   post:
 *     tags:
 *       - Fluid
 *     summary: Calculate Reynolds number
 *     description: Calculates Reynolds number for fluid flow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - velocity
 *               - diameter
 *               - density
 *               - viscosity
 *             properties:
 *               velocity:
 *                 type: number
 *               diameter:
 *                 type: number
 *               density:
 *                 type: number
 *               viscosity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reynolds number calculation result
 */
app.post('/api/fluid/reynolds', (req, res) => {
  try {
    const { velocity, diameter, density, viscosity } = req.body;
    const reynolds = herta.fluidDynamics.reynoldsNumber({
      velocity, diameter, density, viscosity
    });
    res.json({ success: true, data: { reynolds } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GraphQL schema definition
const typeDefs = `
  type Query {
    matrixMultiply(matrixA: [[Float!]!]!, matrixB: [[Float!]!]!): [[Float!]!]!
    optimize(algorithm: String!, params: String!): OptimizationResult
    quantumApplyGate(state: [ComplexInput!]!, gate: String!): [Complex!]!
    numberTheoryFactorize(number: Int!): [Int!]!
  }
  
  input ComplexInput {
    re: Float!
    im: Float
  }
  
  type Complex {
    re: Float!
    im: Float!
  }
  
  type OptimizationResult {
    solution: [Float!]!
    value: Float!
    iterations: Int!
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    matrixMultiply: (_, { matrixA, matrixB }) => {
      return herta.multiply(matrixA, matrixB);
    },
    optimize: (_, { algorithm, params }) => {
      const parsedParams = JSON.parse(params);
      
      if (algorithm === 'gradient-descent') {
        return herta.optimization.gradientDescent(parsedParams);
      } else if (algorithm === 'genetic') {
        return herta.optimization.geneticAlgorithm(parsedParams);
      }
      
      throw new Error('Unknown optimization algorithm');
    },
    quantumApplyGate: (_, { state, gate }) => {
      const quantumState = herta.quantum.createState(state);
      return herta.quantum.applyGate(gate, quantumState);
    },
    numberTheoryFactorize: (_, { number }) => {
      return herta.numberTheory.primeFactorize(number);
    }
  }
};

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs, 
  resolvers,
  introspection: true,
  playground: true
});

// Apply Apollo middleware to Express
async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });
}

startApolloServer();

// Start the server
app.listen(PORT, () => {
  console.log(`
  ╭─────────────────────────────────────────────────╮
  │           HERTA.JS EXAMPLE SERVER               │
  ╰─────────────────────────────────────────────────╯
  
  Server running on port ${PORT}
  
  Available endpoints:
  - REST API: http://localhost:${PORT}/api/...
  - GraphQL: http://localhost:${PORT}/graphql
  - API Documentation: http://localhost:${PORT}/api-docs
  - Homepage: http://localhost:${PORT}/
  
  Press Ctrl+C to stop
  `);
});
