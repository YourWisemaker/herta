/**
 * herta.js
 * Advanced mathematics framework extending beyond math.js capabilities
 * Designed for scientific computing and advanced mathematical analysis
 */

// Import core modules
const arithmetic = require('./core/arithmetic');
const algebra = require('./core/algebra');
const calculus = require('./core/calculus');
const constants = require('./core/constants');
const complex = require('./core/complex');
const expression = require('./core/expression');
const matrix = require('./core/matrix');
const tensor = require('./core/tensor');

// Import advanced modules
const differential = require('./advanced/differential');
const integration = require('./advanced/integration');
const autodiff = require('./advanced/autodiff');
const numerical = require('./advanced/numerical');
const statistics = require('./advanced/statistics');
const quantum = require('./advanced/quantum');
const symbolic = require('./advanced/symbolic');
const numberTheory = require('./advanced/numberTheory');
const graph = require('./advanced/graph');
const cryptography = require('./advanced/cryptography');

// Import new advanced modules
const optimization = require('./advanced/optimization');
const geometry = require('./advanced/geometry');
const signalProcessing = require('./advanced/signalProcessing');
const machineLearning = require('./advanced/machineLearning');
const topology = require('./advanced/topology');
const financialMath = require('./advanced/financialMath');
const discreteMath = require('./advanced/discreteMath');
const dynamicalSystems = require('./advanced/dynamicalSystems');
const groupTheory = require('./advanced/groupTheory');
const informationTheory = require('./advanced/informationTheory');
const gameTheory = require('./advanced/gameTheory');
const algebraicGeometry = require('./advanced/algebraicGeometry');
const differentialGeometry = require('./advanced/differentialGeometry');
const categoryTheory = require('./advanced/categoryTheory');
const complexAnalysis = require('./advanced/complexAnalysis');

// Import modules added in the recent update
const advancedAlgebra = require('./advanced/advancedAlgebra');
const reinforcementLearning = require('./advanced/reinforcementLearning');
const textAnalysis = require('./advanced/textAnalysis');
const cryptoeconomics = require('./advanced/cryptoeconomics');
const zeroKnowledgeProofs = require('./advanced/zeroKnowledgeProofs');
const languageModelMath = require('./advanced/languageModelMath');
const neuralNetworks = require('./advanced/neuralNetworks');
const relativisticAstrophysics = require('./advanced/relativisticAstrophysics');
const technicalAnalysis = require('./advanced/technicalAnalysis');
const tradingStrategies = require('./advanced/tradingStrategies');
const riskManagement = require('./advanced/riskManagement');
const tabularAnalysis = require('./advanced/tabularAnalysis');

// Import additional specialized modules from memories
const fluidDynamics = require('./advanced/fluidDynamics');
const computerVision = require('./advanced/computerVision');
const stringAlgorithms = require('./advanced/stringAlgorithms');
const probabilityTheory = require('./advanced/probabilityTheory');
const quantumMechanics = require('./advanced/quantumMechanics');

// Import utility modules
const utils = require('./utils/utils');
const chain = require('./utils/chain');

// Import math modules
const mathModules = require('./math');

// Create the main object
const herta = {};

// Attach core functionality
Object.assign(herta, 
  arithmetic,
  algebra,
  calculus,
  constants,
  complex,
  expression,
  matrix,
  tensor,
  differential,
  integration,
  autodiff,
  numerical,
  statistics,
  quantum,
  symbolic,
  utils
);

// Attach advanced modules
herta.numberTheory = numberTheory;
herta.quantum = quantum;
herta.graph = graph;
herta.cryptography = cryptography;

// Attach new advanced modules
herta.optimization = optimization;
herta.geometry = geometry;
herta.signalProcessing = signalProcessing;
herta.machineLearning = machineLearning;
herta.topology = topology;
herta.financialMath = financialMath;
herta.discreteMath = discreteMath;
herta.dynamicalSystems = dynamicalSystems;
herta.groupTheory = groupTheory;
herta.informationTheory = informationTheory;
herta.gameTheory = gameTheory;
herta.algebraicGeometry = algebraicGeometry;
herta.differentialGeometry = differentialGeometry;
herta.categoryTheory = categoryTheory;
herta.complexAnalysis = complexAnalysis;

// Attach recent modules
herta.advancedAlgebra = advancedAlgebra;
herta.reinforcementLearning = reinforcementLearning;
herta.textAnalysis = textAnalysis;
herta.cryptoeconomics = cryptoeconomics;
herta.zeroKnowledgeProofs = zeroKnowledgeProofs;
herta.languageModelMath = languageModelMath;
herta.neuralNetworks = neuralNetworks;
herta.relativisticAstrophysics = relativisticAstrophysics;
herta.technicalAnalysis = technicalAnalysis;
herta.tradingStrategies = tradingStrategies;
herta.riskManagement = riskManagement;
herta.tabularAnalysis = tabularAnalysis;

// Attach specialized modules from memories
herta.fluidDynamics = fluidDynamics;
herta.computerVision = computerVision;
herta.stringAlgorithms = stringAlgorithms;
herta.probabilityTheory = probabilityTheory;
herta.quantumMechanics = quantumMechanics;

// Attach math modules
herta.math = mathModules;

// Attach the chain functionality
herta.chain = chain.createChain(herta);

// Expression evaluation function
herta.evaluate = expression.evaluate;

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