/**
 * Machine Learning Primitives module for herta.js
 * Provides fundamental operations for machine learning
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const machineLearning = {};

/**
 * Sigmoid activation function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Output after sigmoid activation
 */
machineLearning.sigmoid = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.sigmoid(val) : 
                1 / (1 + Math.exp(-val)));
  }
  return 1 / (1 + Math.exp(-x));
};

/**
 * Derivative of sigmoid function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Derivative of sigmoid at x
 */
machineLearning.sigmoidDerivative = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.sigmoidDerivative(val) : 
                machineLearning.sigmoid(val) * (1 - machineLearning.sigmoid(val)));
  }
  const s = machineLearning.sigmoid(x);
  return s * (1 - s);
};

/**
 * ReLU activation function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Output after ReLU activation
 */
machineLearning.relu = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.relu(val) : 
                Math.max(0, val));
  }
  return Math.max(0, x);
};

/**
 * Derivative of ReLU function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Derivative of ReLU at x
 */
machineLearning.reluDerivative = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.reluDerivative(val) : 
                val > 0 ? 1 : 0);
  }
  return x > 0 ? 1 : 0;
};

/**
 * Leaky ReLU activation function
 * @param {number|Array} x - Input value or array
 * @param {number} [alpha=0.01] - Slope for negative values
 * @returns {number|Array} - Output after Leaky ReLU activation
 */
machineLearning.leakyRelu = function(x, alpha = 0.01) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.leakyRelu(val, alpha) : 
                val > 0 ? val : alpha * val);
  }
  return x > 0 ? x : alpha * x;
};

/**
 * Derivative of Leaky ReLU function
 * @param {number|Array} x - Input value or array
 * @param {number} [alpha=0.01] - Slope for negative values
 * @returns {number|Array} - Derivative of Leaky ReLU at x
 */
machineLearning.leakyReluDerivative = function(x, alpha = 0.01) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.leakyReluDerivative(val, alpha) : 
                val > 0 ? 1 : alpha);
  }
  return x > 0 ? 1 : alpha;
};

/**
 * Tanh activation function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Output after tanh activation
 */
machineLearning.tanh = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.tanh(val) : 
                Math.tanh(val));
  }
  return Math.tanh(x);
};

/**
 * Derivative of tanh function
 * @param {number|Array} x - Input value or array
 * @returns {number|Array} - Derivative of tanh at x
 */
machineLearning.tanhDerivative = function(x) {
  if (Array.isArray(x)) {
    return x.map(val => Array.isArray(val) ? 
                machineLearning.tanhDerivative(val) : 
                1 - Math.pow(Math.tanh(val), 2));
  }
  return 1 - Math.pow(Math.tanh(x), 2);
};

/**
 * Softmax activation function
 * @param {Array} x - Input array
 * @returns {Array} - Output after softmax activation
 */
machineLearning.softmax = function(x) {
  if (!Array.isArray(x)) {
    throw new Error('Softmax requires an array input');
  }
  
  // For numerical stability, subtract the max value
  const maxVal = Math.max(...x);
  const expValues = x.map(val => Math.exp(val - maxVal));
  const sumExp = expValues.reduce((acc, val) => acc + val, 0);
  
  return expValues.map(val => val / sumExp);
};

/**
 * Mean Squared Error loss function
 * @param {Array} predicted - Predicted values
 * @param {Array} actual - Actual values
 * @returns {number} - MSE loss
 */
machineLearning.meanSquaredError = function(predicted, actual) {
  if (predicted.length !== actual.length) {
    throw new Error('Predicted and actual arrays must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    sum += Math.pow(predicted[i] - actual[i], 2);
  }
  
  return sum / predicted.length;
};

/**
 * Binary Cross Entropy loss function
 * @param {Array} predicted - Predicted probabilities
 * @param {Array} actual - Actual binary labels
 * @returns {number} - Binary cross entropy loss
 */
machineLearning.binaryCrossEntropy = function(predicted, actual) {
  if (predicted.length !== actual.length) {
    throw new Error('Predicted and actual arrays must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    // Clip to avoid log(0)
    const p = Math.max(Math.min(predicted[i], 1 - 1e-15), 1e-15);
    sum += actual[i] * Math.log(p) + (1 - actual[i]) * Math.log(1 - p);
  }
  
  return -sum / predicted.length;
};

/**
 * Categorical Cross Entropy loss function
 * @param {Array} predicted - Predicted class probabilities
 * @param {Array} actual - Actual one-hot encoded labels
 * @returns {number} - Categorical cross entropy loss
 */
machineLearning.categoricalCrossEntropy = function(predicted, actual) {
  if (predicted.length !== actual.length) {
    throw new Error('Predicted and actual arrays must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < predicted.length; i++) {
    // Clip to avoid log(0)
    const p = Math.max(predicted[i], 1e-15);
    sum += actual[i] * Math.log(p);
  }
  
  return -sum;
};

/**
 * Z-score standardization (zero mean, unit variance)
 * @param {Array} data - Input data array
 * @returns {Object} - Standardized data and parameters
 */
machineLearning.standardize = function(data) {
  const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
  
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  const standardized = data.map(val => (val - mean) / stdDev);
  
  return {
    standardized,
    mean,
    stdDev
  };
};

/**
 * Min-Max scaling (normalize to [0, 1] range)
 * @param {Array} data - Input data array
 * @returns {Object} - Normalized data and parameters
 */
machineLearning.minMaxScale = function(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  if (range === 0) {
    return {
      normalized: data.map(() => 0.5),
      min,
      max
    };
  }
  
  const normalized = data.map(val => (val - min) / range);
  
  return {
    normalized,
    min,
    max
  };
};

/**
 * Principal Component Analysis (PCA)
 * @param {Array} X - Data matrix (each row is a sample, each column a feature)
 * @param {number} numComponents - Number of principal components to return
 * @returns {Object} - PCA results
 */
machineLearning.pca = function(X, numComponents) {
  if (!Array.isArray(X) || !Array.isArray(X[0])) {
    throw new Error('X must be a 2D array');
  }
  
  const n = X.length; // Number of samples
  const d = X[0].length; // Number of features
  
  // Calculate mean of each feature
  const means = Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      means[j] += X[i][j] / n;
    }
  }
  
  // Center the data
  const centered = X.map(row => 
    row.map((val, j) => val - means[j])
  );
  
  // Calculate covariance matrix
  const covariance = Array(d).fill().map(() => Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      covariance[i][j] = sum / (n - 1);
      covariance[j][i] = covariance[i][j]; // Covariance matrix is symmetric
    }
  }
  
  // Get eigenvalues and eigenvectors (using power iteration for simplicity)
  // This is a simplified approach, a production implementation would use more robust methods
  function powerIteration(A, numIterations = 100) {
    const n = A.length;
    let x = Array(n).fill().map(() => Math.random());
    
    // Normalize
    const norm = Math.sqrt(x.reduce((sum, val) => sum + val*val, 0));
    x = x.map(val => val / norm);
    
    for (let i = 0; i < numIterations; i++) {
      // Multiply A*x
      const Ax = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Ax[i] += A[i][j] * x[j];
        }
      }
      
      // Normalize
      const norm = Math.sqrt(Ax.reduce((sum, val) => sum + val*val, 0));
      x = Ax.map(val => val / norm);
    }
    
    // Calculate eigenvalue (Rayleigh quotient)
    let eigenvalue = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        eigenvalue += x[i] * A[i][j] * x[j];
      }
    }
    
    return { eigenvalue, eigenvector: x };
  }
  
  // Find top eigenvalues/vectors
  const components = [];
  let remainingCovariance = [...covariance.map(row => [...row])];
  
  for (let i = 0; i < numComponents; i++) {
    const { eigenvalue, eigenvector } = powerIteration(remainingCovariance);
    components.push({ eigenvalue, eigenvector });
    
    // Deflate covariance matrix
    for (let j = 0; j < d; j++) {
      for (let k = 0; k < d; k++) {
        remainingCovariance[j][k] -= eigenvalue * eigenvector[j] * eigenvector[k];
      }
    }
  }
  
  // Sort by eigenvalue
  components.sort((a, b) => b.eigenvalue - a.eigenvalue);
  
  // Transform data
  const transformedData = centered.map(x => 
    components.map(comp => 
      comp.eigenvector.reduce((sum, v, j) => sum + v * x[j], 0)
    )
  );
  
  return {
    transformedData,
    components: components.map(c => c.eigenvector),
    explainedVariance: components.map(c => c.eigenvalue),
    means
  };
};

/**
 * K-means clustering algorithm
 * @param {Array} data - Input data points (array of arrays)
 * @param {number} k - Number of clusters
 * @param {Object} [options] - Options for the algorithm
 * @returns {Object} - Clustering result
 */
machineLearning.kmeans = function(data, k, options = {}) {
  const maxIterations = options.maxIterations || 100;
  const tolerance = options.tolerance || 1e-4;
  
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Data must be a 2D array');
  }
  
  const n = data.length; // Number of data points
  const d = data[0].length; // Number of dimensions
  
  // Initialize centroids randomly
  let centroids = Array(k).fill().map(() => {
    const randomIndex = Math.floor(Math.random() * n);
    return [...data[randomIndex]];
  });
  
  // Helper function to calculate distance
  function distance(a, b) {
    let sum = 0;
    for (let i = 0; i < d; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
  
  let labels = Array(n);
  let iterations = 0;
  let converged = false;
  
  while (iterations < maxIterations && !converged) {
    // Assign points to nearest centroid
    const newLabels = Array(n);
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let minIndex = 0;
      
      for (let j = 0; j < k; j++) {
        const dist = distance(data[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          minIndex = j;
        }
      }
      
      newLabels[i] = minIndex;
    }
    
    // Check convergence
    if (iterations > 0) {
      let changed = 0;
      for (let i = 0; i < n; i++) {
        if (newLabels[i] !== labels[i]) {
          changed++;
        }
      }
      if (changed / n < tolerance) {
        converged = true;
      }
    }
    
    labels = newLabels;
    
    // Update centroids
    const newCentroids = Array(k).fill().map(() => Array(d).fill(0));
    const counts = Array(k).fill(0);
    
    for (let i = 0; i < n; i++) {
      const cluster = labels[i];
      counts[cluster]++;
      
      for (let j = 0; j < d; j++) {
        newCentroids[cluster][j] += data[i][j];
      }
    }
    
    // Calculate mean for each centroid
    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        for (let j = 0; j < d; j++) {
          newCentroids[i][j] /= counts[i];
        }
      }
    }
    
    centroids = newCentroids;
    iterations++;
  }
  
  // Calculate inertia (sum of squared distances to assigned centroids)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += Math.pow(distance(data[i], centroids[labels[i]]), 2);
  }
  
  return {
    labels,
    centroids,
    inertia,
    iterations,
    converged
  };
};

module.exports = machineLearning;
