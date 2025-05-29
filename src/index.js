/**
 * herta.js
 * Advanced mathematics framework extending beyond math.js capabilities
 * Designed for scientific computing and advanced mathematical analysis
 */

// Create the main object with namespaces
const herta = {
  arithmetic: require('./core/arithmetic'),
  algebra: require('./core/algebra'), // This is basic algebra
  calculus: require('./core/calculus'), // For basic derivative, integrate
  constants: require('./core/constants'),
  complex: require('./core/complex'),
  expression: require('./core/expression'), // For herta.evaluate
  matrix: require('./core/matrix'), // Will be overridden later for tests, but good to have base
  tensor: require('./core/tensor'),
  fraction: require('./core/fraction'),
  utils: require('./utils/utils'), // Main utils
  // Namespaces for more complex/categorized modules
  advanced: {},
  discrete: {},
  statistics: {},
  geometry: {},
  optimization: {},
  physics: {},
  crypto: {},
  applied: {},
  // symbolic directly under herta.symbolic
  symbolic: require('./advanced/symbolic'), // Assign directly
};

// Populate namespaces

// Algebra
herta.algebra.advanced = require('./algebra/advanced');

// Calculus
// Core calculus module (./core/calculus.js) is already assigned to herta.calculus
// We need to ensure its methods like 'derivative' and 'integrate' are directly available if that's the expectation.
// If ./core/calculus.js exports an object with methods, they would be herta.calculus.derivative, etc.
// Let's assume for now ./core/calculus.js provides these directly.
herta.calculus.differential = require('./calculus/differential');
herta.calculus.integral = require('./calculus/integral');
herta.calculus.numerical = require('./calculus/numerical');
herta.calculus.multivariate = require('./calculus/multivariate');


// Advanced Calculus/Symbolic related
herta.advanced.autodiff = require('./advanced/autodiff');

// Discrete Math
herta.discrete.graph = require('./discrete/graph');
herta.discrete.numberTheory = require('./discrete/numberTheory');
herta.advanced.discreteMath = require('./advanced/discreteMath'); 

// Statistics
// The 'descriptive' property from the module is an object containing mean, median etc.
herta.statistics = require('./statistics/descriptive').descriptive; 
herta.statistics.distributions = require('./statistics/distribution');
// Keep reference to probabilityTheory for backward compatibility
herta.probabilityTheory = herta.statistics.distributions;


// Geometry
herta.geometry.euclidean = require('./geometry/euclidean');
herta.geometry.differential = require('./geometry/differential');

// Optimization
herta.optimization.nonlinear = require('./optimization/nonlinear');

// Physics
herta.physics.classical = require('./physics/classical');
herta.physics.quantum = require('./physics/quantum');
herta.physics.relativity = require('./physics/relativity');
herta.advanced.quantumMechanics = require('./advanced/quantumMechanics');


// Cryptography
herta.crypto.hash = require('./crypto/hash');
herta.crypto.zeroKnowledge = require('./advanced/zeroKnowledgeProofs'); 


// Utility modules
herta.utils.random = require('./utils/random');
herta.utils.generators = require('./utils/generators');
herta.utils.units = require('./utils/units');
const chain = require('./utils/chain'); // For herta.chain later

// Applied Math
herta.applied.finance = require('./applied/finance');
herta.applied.machinelearning = require('./applied/machinelearning');
herta.applied.signalprocessing = require('./applied/signalprocessing');
herta.applied.gametheory = require('./applied/gametheory');

// Other Advanced Modules (can be further categorized or kept in 'advanced')
herta.advanced.topology = require('./advanced/topology');
herta.advanced.dynamicalSystems = require('./advanced/dynamicalSystems');
herta.advanced.groupTheory = require('./advanced/groupTheory');
herta.advanced.informationTheory = require('./advanced/informationTheory');
herta.advanced.algebraicGeometry = require('./advanced/algebraicGeometry');
herta.advanced.categoryTheory = require('./advanced/categoryTheory');
herta.advanced.reinforcementLearning = require('./advanced/reinforcementLearning');
herta.advanced.textAnalysis = require('./advanced/textAnalysis');
herta.advanced.cryptoeconomics = require('./advanced/cryptoeconomics');
herta.advanced.languageModelMath = require('./advanced/languageModelMath');
herta.advanced.neuralNetworks = require('./advanced/neuralNetworks');
herta.advanced.relativisticAstrophysics = require('./advanced/relativisticAstrophysics');
herta.advanced.technicalAnalysis = require('./advanced/technicalAnalysis');
herta.advanced.tradingStrategies = require('./advanced/tradingStrategies');
herta.advanced.riskManagement = require('./advanced/riskManagement');
herta.advanced.tabularAnalysis = require('./advanced/tabularAnalysis');
herta.advanced.fluidDynamics = require('./advanced/fluidDynamics');
herta.advanced.computerVision = require('./advanced/computerVision');
herta.advanced.stringAlgorithms = require('./advanced/stringAlgorithms');


// For backward compatibility - these were directly on herta object before
// We ensure they are still available if other parts of the code rely on this.
// Note: This might override some of the namespaced modules above if names conflict,
// but the subtask asks for `herta.symbolic.parse` etc. to be primary.
herta.arithmetic = herta.arithmetic; // already assigned
herta.algebra = herta.algebra; // already assigned
herta.calculus = herta.calculus; // already assigned
herta.constants = herta.constants; // already assigned
herta.complex = herta.complex; // already assigned
herta.expression = herta.expression; // already assigned
herta.tensor = herta.tensor; // already assigned
herta.fraction = herta.fraction; // already assigned
herta.utils = herta.utils; // already assigned
herta.symbolic = herta.symbolic; // already assigned

herta.differential = herta.calculus.differential; 
herta.integration = herta.calculus.integral;
herta.autodiff = herta.advanced.autodiff;
herta.numericalCalc = herta.calculus.numerical; 
// herta.statistics is now correctly assigned above, so no need to re-assign here.
// If herta.statistics was meant to be an alias to descriptive functions for top-level access, that's different.
// But the goal is herta.statistics.mean(), so the above assignment is correct.
herta.quantum = herta.physics.quantum; 


herta.numberTheory = herta.discrete.numberTheory;
herta.graph = herta.discrete.graph; 
herta.cryptography = herta.crypto.hash;
herta.optimization = herta.optimization.nonlinear;
herta.geometry = herta.geometry.euclidean; 
herta.signalProcessing = herta.applied.signalprocessing;
herta.machineLearning = herta.applied.machinelearning;
herta.topology = herta.advanced.topology;
herta.financialMath = herta.applied.finance;
herta.discreteMath = herta.advanced.discreteMath;
herta.dynamicalSystems = herta.advanced.dynamicalSystems;
herta.groupTheory = herta.advanced.groupTheory;
herta.informationTheory = herta.advanced.informationTheory;
herta.gameTheory = herta.applied.gametheory;
herta.algebraicGeometry = herta.advanced.algebraicGeometry;
herta.differentialGeometry = herta.geometry.differential;
herta.categoryTheory = herta.advanced.categoryTheory;
herta.complexAnalysis = herta.calculus.multivariate; 
herta.zeroKnowledgeProofs = herta.crypto.zeroKnowledge;
herta.reinforcementLearning = herta.advanced.reinforcementLearning;
herta.textAnalysis = herta.advanced.textAnalysis;
herta.cryptoeconomics = herta.advanced.cryptoeconomics;
herta.languageModelMath = herta.advanced.languageModelMath;
herta.neuralNetworks = herta.advanced.neuralNetworks;
herta.relativisticAstrophysics = herta.physics.relativity;
herta.technicalAnalysis = herta.advanced.technicalAnalysis;
herta.tradingStrategies = herta.advanced.tradingStrategies;
herta.riskManagement = herta.advanced.riskManagement;
herta.tabularAnalysis = herta.advanced.tabularAnalysis;
herta.fluidDynamics = herta.advanced.fluidDynamics;
herta.computerVision = herta.advanced.computerVision;
herta.stringAlgorithms = herta.advanced.stringAlgorithms;
herta.quantumMechanics = herta.advanced.quantumMechanics;

// Expression evaluation function
herta.evaluate = herta.expression.evaluate;

// Matrix module
herta.matrix = require('./core/matrix.js'); // This assigns the Matrix class to herta.matrix


// Extra graph functions needed for tests (augmenting herta.discrete.graph)
const graphAlgorithms = herta.discrete.graph.algorithms;
const graphAdvanced = herta.discrete.graph.advanced;

herta.graph.shortestPath = graphAlgorithms.dijkstra;
herta.graph.minimumSpanningTree = function(currentGraph, algorithm) {
  if (algorithm === 'kruskal') {
    return graphAlgorithms.minimumSpanningTreeKruskal(currentGraph);
  }
  return graphAlgorithms.minimumSpanningTreePrim(currentGraph);
};
herta.graph.floydWarshall = graphAlgorithms.floydWarshall;
herta.graph.degreeCentrality = function(currentGraph) {
  return graphAlgorithms.centrality(currentGraph).degree;
};
herta.graph.betweennessCentrality = function(currentGraph) {
  return graphAlgorithms.centrality(currentGraph).betweenness;
};
herta.graph.communityDetection = function(currentGraph, algorithm) {
  if (algorithm === 'louvain') {
    return graphAdvanced.communityDetectionLouvain(currentGraph).communities;
  }
  return [];
};
herta.graph.articulationPoints = graphAdvanced.articulationPoints;
herta.graph.topologicalSort = graphAdvanced.topologicalSort;


// Attach the chain functionality
herta.chain = chain.createChain(herta);


/**
 * Create a herta.js instance with optional configuration
 * @param {Object} config - Configuration options
 * @returns {Object} - A new herta.js instance
 */
herta.create = function(config) {
  // Create a new instance
  const newInstance = Object.create(herta);
  
  // Apply configuration if provided
  if (config) {
    // Default configuration
    newInstance.config = {
      precision: 64,
      epsilon: 1e-12,
      scientificMode: false,
      ...config
    };
  } else {
    // Default configuration if none provided
    newInstance.config = {
      precision: 64,
      epsilon: 1e-12,
      scientificMode: false
    };
  }
  
  return newInstance;
};

/**
 * Enable scientific mode with specialized functions for research
 * @param {Object} options - Scientific mode options
 * @returns {Object} - The herta instance with scientific mode enabled
 */
herta.scientific = function(options = {}) {
  const instance = this.create({
    ...options,
    scientificMode: true,
    precision: options.precision || 128, // Higher precision for scientific work
    maxIterations: options.maxIterations || 1000 // More iterations for convergence in scientific calculations
  });
  
  // Add specialized scientific functions
  instance.fourier = {
    /**
     * Compute the Discrete Fourier Transform
     * @param {Array} signal - Input signal
     * @returns {Array} - Complex DFT coefficients
     */
    dft: function(signal) {
      const N = signal.length;
      const result = [];
      
      for (let k = 0; k < N; k++) {
        let sum = { re: 0, im: 0 };
        
        for (let n = 0; n < N; n++) {
          const phi = (2 * Math.PI * k * n) / N;
          sum.re += signal[n] * Math.cos(phi);
          sum.im -= signal[n] * Math.sin(phi);
        }
        
        result.push(sum);
      }
      
      return result;
    },
    
    /**
     * Compute the inverse Discrete Fourier Transform
     * @param {Array} spectrum - Input spectrum (complex coefficients)
     * @returns {Array} - Reconstructed signal
     */
    idft: function(spectrum) {
      const N = spectrum.length;
      const result = [];
      
      for (let n = 0; n < N; n++) {
        let sum = 0;
        
        for (let k = 0; k < N; k++) {
          const phi = (2 * Math.PI * k * n) / N;
          sum += spectrum[k].re * Math.cos(phi) - spectrum[k].im * Math.sin(phi);
        }
        
        result.push(sum / N);
      }
      
      return result;
    }
  };
  
  return instance;
};

// Export the herta object as the module
module.exports = herta;