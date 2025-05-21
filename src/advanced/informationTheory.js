/**
 * Information Theory module for herta.js
 * Provides entropy, mutual information, and coding theory functions
 */

const arithmetic = require('../core/arithmetic');

const informationTheory = {};

/**
 * Calculate the Shannon entropy of a discrete probability distribution
 * @param {Array} probabilities - Array of probabilities that sum to 1
 * @param {number} [base=2] - Logarithm base (default: 2 for bits)
 * @returns {number} - Shannon entropy
 */
informationTheory.entropy = function(probabilities, base = 2) {
  // Validate input
  const sum = probabilities.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 1e-10) {
    throw new Error('Probabilities must sum to 1');
  }
  
  // Calculate entropy: H(X) = -∑p(x) log p(x)
  let entropy = 0;
  for (const p of probabilities) {
    if (p > 0) { // 0 log 0 = 0 by convention
      entropy -= p * Math.log(p) / Math.log(base);
    }
  }
  
  return entropy;
};

/**
 * Calculate the joint entropy of two discrete random variables
 * @param {Array} jointProbs - 2D array of joint probabilities
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - Joint entropy H(X,Y)
 */
informationTheory.jointEntropy = function(jointProbs, base = 2) {
  let jointEntropy = 0;
  
  for (const row of jointProbs) {
    for (const p of row) {
      if (p > 0) {
        jointEntropy -= p * Math.log(p) / Math.log(base);
      }
    }
  }
  
  return jointEntropy;
};

/**
 * Calculate the conditional entropy H(Y|X)
 * @param {Array} jointProbs - 2D array of joint probabilities
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - Conditional entropy
 */
informationTheory.conditionalEntropy = function(jointProbs, base = 2) {
  // Calculate marginal probabilities for X
  const marginalX = jointProbs.map(row => 
    row.reduce((a, b) => a + b, 0)
  );
  
  let conditionalEntropy = 0;
  
  for (let i = 0; i < jointProbs.length; i++) {
    for (let j = 0; j < jointProbs[i].length; j++) {
      const joint = jointProbs[i][j];
      if (joint > 0) {
        const conditional = joint / marginalX[i]; // p(y|x) = p(x,y) / p(x)
        conditionalEntropy -= joint * Math.log(conditional) / Math.log(base);
      }
    }
  }
  
  return conditionalEntropy;
};

/**
 * Calculate the mutual information between two random variables
 * @param {Array} jointProbs - 2D array of joint probabilities
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - Mutual information I(X;Y)
 */
informationTheory.mutualInformation = function(jointProbs, base = 2) {
  // Calculate marginal probabilities
  const marginalX = jointProbs.map(row => 
    row.reduce((a, b) => a + b, 0)
  );
  
  const marginalY = Array(jointProbs[0].length).fill(0);
  for (let j = 0; j < jointProbs[0].length; j++) {
    for (let i = 0; i < jointProbs.length; i++) {
      marginalY[j] += jointProbs[i][j];
    }
  }
  
  // Calculate mutual information: I(X;Y) = ∑∑p(x,y) log(p(x,y)/(p(x)p(y)))
  let mutualInfo = 0;
  
  for (let i = 0; i < jointProbs.length; i++) {
    for (let j = 0; j < jointProbs[i].length; j++) {
      const joint = jointProbs[i][j];
      if (joint > 0) {
        const term = joint / (marginalX[i] * marginalY[j]);
        mutualInfo += joint * Math.log(term) / Math.log(base);
      }
    }
  }
  
  return mutualInfo;
};

/**
 * Calculate the Kullback-Leibler divergence (relative entropy)
 * @param {Array} p - First probability distribution
 * @param {Array} q - Second probability distribution
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - KL divergence D_KL(P||Q)
 */
informationTheory.klDivergence = function(p, q, base = 2) {
  if (p.length !== q.length) {
    throw new Error('Distributions must have the same length');
  }
  
  let divergence = 0;
  
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      if (q[i] <= 0) {
        return Infinity; // KL divergence is infinite if q(x)=0 and p(x)>0
      }
      
      divergence += p[i] * Math.log(p[i] / q[i]) / Math.log(base);
    }
  }
  
  return divergence;
};

/**
 * Calculate the Jensen-Shannon divergence between two distributions
 * @param {Array} p - First probability distribution
 * @param {Array} q - Second probability distribution
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - JS divergence
 */
informationTheory.jsDistance = function(p, q, base = 2) {
  if (p.length !== q.length) {
    throw new Error('Distributions must have the same length');
  }
  
  // Calculate the midpoint distribution m = (p + q) / 2
  const m = p.map((v, i) => (v + q[i]) / 2);
  
  // JS divergence is the average of D(P||M) and D(Q||M)
  const dpm = this.klDivergence(p, m, base);
  const dqm = this.klDivergence(q, m, base);
  
  return (dpm + dqm) / 2;
};

/**
 * Calculate the channel capacity of a discrete memoryless channel
 * @param {Array} transitionMatrix - Channel transition probabilities p(y|x)
 * @param {number} [base=2] - Logarithm base
 * @returns {number} - Approximate channel capacity
 */
informationTheory.channelCapacity = function(transitionMatrix, base = 2) {
  // Note: Exact channel capacity requires optimization over input distribution
  // This is a simplified implementation using Blahut-Arimoto algorithm
  
  const inputDim = transitionMatrix.length;
  const outputDim = transitionMatrix[0].length;
  
  // Initialize uniform input distribution
  let inputDist = Array(inputDim).fill(1 / inputDim);
  let capacity = 0;
  let prevCapacity = -Infinity;
  
  // Blahut-Arimoto algorithm
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Calculate joint distribution p(x,y)
    const joint = [];
    for (let i = 0; i < inputDim; i++) {
      joint[i] = [];
      for (let j = 0; j < outputDim; j++) {
        joint[i][j] = inputDist[i] * transitionMatrix[i][j];
      }
    }
    
    // Calculate output distribution p(y)
    const outputDist = Array(outputDim).fill(0);
    for (let j = 0; j < outputDim; j++) {
      for (let i = 0; i < inputDim; i++) {
        outputDist[j] += joint[i][j];
      }
    }
    
    // Calculate mutual information with current distribution
    let mutualInfo = 0;
    for (let i = 0; i < inputDim; i++) {
      for (let j = 0; j < outputDim; j++) {
        if (joint[i][j] > 0) {
          mutualInfo += joint[i][j] * Math.log(joint[i][j] / (inputDist[i] * outputDist[j])) / Math.log(base);
        }
      }
    }
    
    capacity = mutualInfo;
    
    // Check convergence
    if (Math.abs(capacity - prevCapacity) < tolerance) {
      break;
    }
    prevCapacity = capacity;
    
    // Update input distribution
    const tempDist = Array(inputDim).fill(0);
    for (let i = 0; i < inputDim; i++) {
      let sum = 0;
      for (let j = 0; j < outputDim; j++) {
        if (transitionMatrix[i][j] > 0 && outputDist[j] > 0) {
          sum += transitionMatrix[i][j] * Math.log(transitionMatrix[i][j] / outputDist[j]) / Math.log(base);
        }
      }
      tempDist[i] = Math.exp(sum);
    }
    
    // Normalize
    const tempSum = tempDist.reduce((a, b) => a + b, 0);
    inputDist = tempDist.map(v => v / tempSum);
  }
  
  return capacity;
};

/**
 * Compute the optimal Huffman coding for a set of symbols
 * @param {Array} symbols - Array of symbols to encode
 * @param {Array} probabilities - Probability of each symbol
 * @returns {Object} - Huffman code for each symbol and average code length
 */
informationTheory.huffmanCoding = function(symbols, probabilities) {
  if (symbols.length !== probabilities.length) {
    throw new Error('Symbols and probabilities arrays must have the same length');
  }
  
  // Create initial leaf nodes
  const nodes = [];
  for (let i = 0; i < symbols.length; i++) {
    nodes.push({
      symbol: symbols[i],
      probability: probabilities[i],
      code: '',
      left: null,
      right: null
    });
  }
  
  // Build Huffman tree
  while (nodes.length > 1) {
    // Sort nodes by probability (ascending)
    nodes.sort((a, b) => a.probability - b.probability);
    
    // Take two nodes with lowest probabilities
    const left = nodes.shift();
    const right = nodes.shift();
    
    // Create new internal node
    const newNode = {
      symbol: null,
      probability: left.probability + right.probability,
      code: '',
      left: left,
      right: right
    };
    
    nodes.push(newNode);
  }
  
  // Get root of the tree
  const root = nodes[0];
  
  // Assign codes by traversing the tree
  function assignCodes(node, code) {
    if (node === null) return;
    
    node.code = code;
    
    assignCodes(node.left, code + '0');
    assignCodes(node.right, code + '1');
  }
  
  assignCodes(root, '');
  
  // Extract codes for each symbol
  const codes = {};
  const extract = (node) => {
    if (node === null) return;
    
    if (node.symbol !== null) {
      codes[node.symbol] = node.code;
    }
    
    extract(node.left);
    extract(node.right);
  };
  
  extract(root);
  
  // Calculate average code length
  let avgLength = 0;
  for (let i = 0; i < symbols.length; i++) {
    avgLength += probabilities[i] * codes[symbols[i]].length;
  }
  
  return {
    codes,
    averageLength: avgLength
  };
};

/**
 * Compute the Shannon-Fano coding for a set of symbols
 * @param {Array} symbols - Array of symbols to encode
 * @param {Array} probabilities - Probability of each symbol
 * @returns {Object} - Shannon-Fano code for each symbol and average code length
 */
informationTheory.shannonFanoCoding = function(symbols, probabilities) {
  if (symbols.length !== probabilities.length) {
    throw new Error('Symbols and probabilities arrays must have the same length');
  }
  
  // Create initial items
  const items = symbols.map((symbol, i) => ({
    symbol,
    probability: probabilities[i],
    code: ''
  }));
  
  // Sort items by probability (descending)
  items.sort((a, b) => b.probability - a.probability);
  
  // Recursive Shannon-Fano coding
  function divideShannonFano(items, start, end) {
    if (start >= end) return;
    
    if (start + 1 === end) {
      items[start].code += '0';
      return;
    }
    
    // Find optimal split point
    let totalProb = 0;
    for (let i = start; i < end; i++) {
      totalProb += items[i].probability;
    }
    
    let currentProb = 0;
    let splitPoint = start;
    
    for (let i = start; i < end; i++) {
      if (Math.abs(currentProb - (totalProb - currentProb)) > 
          Math.abs((currentProb + items[i].probability) - (totalProb - currentProb - items[i].probability))) {
        currentProb += items[i].probability;
        splitPoint = i + 1;
      } else {
        break;
      }
    }
    
    // Assign codes
    for (let i = start; i < splitPoint; i++) {
      items[i].code += '0';
    }
    
    for (let i = splitPoint; i < end; i++) {
      items[i].code += '1';
    }
    
    // Recursively process each half
    divideShannonFano(items, start, splitPoint);
    divideShannonFano(items, splitPoint, end);
  }
  
  divideShannonFano(items, 0, items.length);
  
  // Create code map
  const codes = {};
  for (const item of items) {
    codes[item.symbol] = item.code;
  }
  
  // Calculate average code length
  let avgLength = 0;
  for (let i = 0; i < symbols.length; i++) {
    avgLength += probabilities[i] * codes[symbols[i]].length;
  }
  
  return {
    codes,
    averageLength: avgLength
  };
};

/**
 * Calculate the source coding theorem bounds
 * @param {Array} probabilities - Probability distribution
 * @returns {Object} - Lower and upper bounds for optimal code length
 */
informationTheory.sourceCodingBounds = function(probabilities) {
  const entropy = this.entropy(probabilities);
  
  return {
    lowerBound: entropy,
    upperBound: entropy + 1
  };
};

/**
 * Compute the rate-distortion function for a given distortion measure (simplified)
 * @param {Array} probabilities - Source probability distribution
 * @param {Array} distortionMatrix - Distortion measure d(x,x̂)
 * @param {number} distortion - Target distortion level
 * @returns {number} - Approximate minimum rate required
 */
informationTheory.rateDistortion = function(probabilities, distortionMatrix, distortion) {
  // Note: This is a simplified approximation that doesn't fully compute the rate-distortion function
  // A complete implementation would require more complex optimization
  
  // Validate inputs
  if (distortionMatrix.length !== probabilities.length) {
    throw new Error('Distortion matrix dimensions must match probability distribution');
  }
  
  // Calculate source entropy
  const sourceEntropy = this.entropy(probabilities);
  
  // Calculate entropy of the distortion
  let distortionEntropy = 0;
  for (let i = 0; i < probabilities.length; i++) {
    let conditionalEntropy = 0;
    const normalizedRow = distortionMatrix[i].map(d => Math.exp(-d));
    const sum = normalizedRow.reduce((a, b) => a + b, 0);
    const normalized = normalizedRow.map(d => d / sum);
    
    for (const p of normalized) {
      if (p > 0) {
        conditionalEntropy -= p * Math.log2(p);
      }
    }
    
    distortionEntropy += probabilities[i] * conditionalEntropy;
  }
  
  // Approximate rate-distortion based on target distortion
  // R(D) ≈ H(X) - f(D) where f is a function of the distortion
  const rate = Math.max(0, sourceEntropy - Math.log2(distortion + 1) * distortionEntropy);
  
  return rate;
};

/**
 * Calculate the capacity of a Binary Symmetric Channel (BSC)
 * @param {number} p - Crossover probability (error probability)
 * @returns {number} - Channel capacity in bits per channel use
 */
informationTheory.bscCapacity = function(p) {
  if (p < 0 || p > 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  
  // C = 1 - H(p) where H is the binary entropy function
  let entropy = 0;
  if (p > 0 && p < 1) {
    entropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }
  
  return 1 - entropy;
};

/**
 * Calculate the capacity of a Binary Erasure Channel (BEC)
 * @param {number} e - Erasure probability
 * @returns {number} - Channel capacity in bits per channel use
 */
informationTheory.becCapacity = function(e) {
  if (e < 0 || e > 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  
  // C = 1 - e
  return 1 - e;
};

/**
 * Calculate the differential entropy of a continuous random variable
 * @param {Function} pdf - Probability density function
 * @param {number} a - Lower bound of support
 * @param {number} b - Upper bound of support
 * @param {number} [samples=1000] - Number of samples for numerical integration
 * @returns {number} - Differential entropy
 */
informationTheory.differentialEntropy = function(pdf, a, b, samples = 1000) {
  const dx = (b - a) / samples;
  let entropy = 0;
  
  for (let i = 0; i < samples; i++) {
    const x = a + (i + 0.5) * dx; // Midpoint rule
    const p = pdf(x);
    
    if (p > 0) {
      entropy -= p * Math.log(p) * dx;
    }
  }
  
  return entropy / Math.log(2); // Convert to bits
};

module.exports = informationTheory;
