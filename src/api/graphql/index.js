/**
 * Herta.js GraphQL API
 * Provides GraphQL interface for Herta.js mathematical capabilities
 */

const { gql } = require('apollo-server-express');
const herta = require('../../index');

// GraphQL Schema Definition
const typeDefs = gql`
  "Complex number representation"
  type Complex {
    re: Float!
    im: Float!
  }
  
  "Complex number input"
  input ComplexInput {
    re: Float!
    im: Float
  }
  
  "Matrix input (2D array of numbers)"
  scalar Matrix
  
  "Optimization result type"
  type OptimizationResult {
    solution: [Float!]!
    value: Float!
    iterations: Int!
    converged: Boolean!
  }
  
  "Quantum state type"
  type QuantumState {
    amplitudes: [Complex!]!
    probabilities: [Float!]!
  }
  
  "Graph structure representation"
  type Graph {
    vertices: [String!]!
    edges: [Edge!]!
  }
  
  "Edge in a graph"
  type Edge {
    source: String!
    target: String!
    weight: Float
  }
  
  "Graph analysis results"
  type GraphAnalysis {
    centrality: [CentralityMeasure!]
    shortestPaths: [[PathSegment!]!]
    communities: [[String!]!]
  }
  
  "Centrality measure for a vertex"
  type CentralityMeasure {
    vertex: String!
    degree: Float
    betweenness: Float
    closeness: Float
  }
  
  "Segment of a path in a graph"
  type PathSegment {
    from: String!
    to: String!
    distance: Float!
  }

  type Query {
    # Core operations
    evaluate(expression: String!): Float
    
    # Matrix operations
    matrixMultiply(a: Matrix!, b: Matrix!): Matrix!
    matrixDeterminant(matrix: Matrix!): Float!
    matrixInverse(matrix: Matrix!): Matrix
    matrixEigenvalues(matrix: Matrix!): [Complex!]!
    
    # Optimization
    optimize(
      algorithm: String!, 
      objectiveFunction: String!, 
      initialParams: [Float!]!, 
      options: String
    ): OptimizationResult
    
    # Quantum mechanics
    quantumCreateState(amplitudes: [ComplexInput!]!): QuantumState!
    quantumApplyGate(state: [ComplexInput!]!, gate: String!): QuantumState!
    quantumEntanglement(state: [ComplexInput!]!): Float!
    
    # Graph theory
    graphAnalyze(
      vertices: [String!]!, 
      edges: [EdgeInput!]!, 
      metrics: [String!]
    ): GraphAnalysis!
    
    # Number theory
    primeFactors(number: Int!): [Int!]!
    gcd(a: Int!, b: Int!): Int!
    
    # Fluid dynamics
    reynoldsNumber(velocity: Float!, diameter: Float!, density: Float!, viscosity: Float!): Float!
    
    # String algorithms
    editDistance(str1: String!, str2: String!): Int!
    stringSimilarity(str1: String!, str2: String!): Float!
  }
  
  "Edge input for graph construction"
  input EdgeInput {
    source: String!
    target: String!
    weight: Float
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    // Core operations
    evaluate: (_, { expression }) => {
      return herta.evaluate(expression);
    },
    
    // Matrix operations
    matrixMultiply: (_, { a, b }) => {
      return herta.multiply(a, b);
    },
    matrixDeterminant: (_, { matrix }) => {
      return herta.det(matrix);
    },
    matrixInverse: (_, { matrix }) => {
      return herta.inv(matrix);
    },
    matrixEigenvalues: (_, { matrix }) => {
      return herta.eigs(matrix).values;
    },
    
    // Optimization
    optimize: (_, { algorithm, objectiveFunction, initialParams, options }) => {
      // Convert string representation to function
      const objective = new Function('x', `return ${objectiveFunction}`);
      
      // Parse options if provided
      const parsedOptions = options ? JSON.parse(options) : {};
      
      // Run appropriate optimization algorithm
      switch (algorithm.toLowerCase()) {
        case 'gradient-descent':
          return herta.optimization.gradientDescent({
            objective,
            initialParams,
            ...parsedOptions
          });
        case 'genetic':
          return herta.optimization.geneticAlgorithm({
            fitnessFunction: objective,
            chromosomeLength: initialParams.length,
            ...parsedOptions
          });
        default:
          throw new Error(`Unknown optimization algorithm: ${algorithm}`);
      }
    },
    
    // Quantum mechanics
    quantumCreateState: (_, { amplitudes }) => {
      const state = herta.quantum.createState(amplitudes);
      // Calculate probabilities
      const probabilities = state.map(amp => {
        if (typeof amp === 'number') {
          return amp * amp;
        }
        return amp.re * amp.re + amp.im * amp.im;
      });
      
      return { amplitudes: state, probabilities };
    },
    quantumApplyGate: (_, { state, gate }) => {
      const quantumState = herta.quantum.createState(state);
      const newState = herta.quantum.applyGate(gate, quantumState);
      
      // Calculate probabilities
      const probabilities = newState.map(amp => {
        if (typeof amp === 'number') {
          return amp * amp;
        }
        return amp.re * amp.re + amp.im * amp.im;
      });
      
      return { amplitudes: newState, probabilities };
    },
    quantumEntanglement: (_, { state }) => {
      const quantumState = herta.quantum.createState(state);
      return herta.quantum.vonNeumannEntropy(quantumState);
    },
    
    // Graph theory
    graphAnalyze: (_, { vertices, edges, metrics = ['centrality'] }) => {
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
        const degree = herta.graph.degreeCentrality(graph);
        const betweenness = herta.graph.betweennessCentrality(graph);
        const closeness = herta.graph.closenessCentrality(graph);
        
        result.centrality = vertices.map(v => ({
          vertex: v,
          degree: degree[v],
          betweenness: betweenness[v],
          closeness: closeness[v]
        }));
      }
      
      if (metrics.includes('shortestPaths')) {
        result.shortestPaths = [];
        for (let i = 0; i < vertices.length; i++) {
          for (let j = i + 1; j < vertices.length; j++) {
            const path = herta.graph.shortestPath(graph, vertices[i], vertices[j]);
            if (path) {
              result.shortestPaths.push({
                from: vertices[i],
                to: vertices[j],
                distance: path.distance
              });
            }
          }
        }
      }
      
      if (metrics.includes('communities')) {
        result.communities = herta.graph.communityDetection(graph, 'louvain');
      }
      
      return result;
    },
    
    // Number theory
    primeFactors: (_, { number }) => {
      return herta.numberTheory.primeFactorize(number);
    },
    gcd: (_, { a, b }) => {
      return herta.numberTheory.gcd(a, b);
    },
    
    // Fluid dynamics
    reynoldsNumber: (_, { velocity, diameter, density, viscosity }) => {
      return herta.fluidDynamics.reynoldsNumber({ velocity, diameter, density, viscosity });
    },
    
    // String algorithms
    editDistance: (_, { str1, str2 }) => {
      return herta.stringAlgorithms.levenshteinDistance(str1, str2);
    },
    stringSimilarity: (_, { str1, str2 }) => {
      return herta.stringAlgorithms.stringSimilarity(str1, str2);
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};
