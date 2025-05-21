/**
 * Chaos Theory module for herta.js
 * Provides tools for analyzing and generating chaotic systems and fractals
 */

const Decimal = require('decimal.js');
const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');
const complex = require('../core/complex');

const chaosTheory = {};

/**
 * Calculate the Lyapunov exponent for a 1D map
 * Measures the rate of separation of infinitesimally close trajectories
 * @param {Function} map - The one-dimensional map function
 * @param {number} x0 - Initial value
 * @param {Object} options - Calculation options
 * @returns {number} - The Lyapunov exponent
 */
chaosTheory.lyapunovExponent = function(map, x0, options = {}) {
  const iterations = options.iterations || 10000;
  const discardTransient = options.discardTransient || 1000;
  
  let x = x0;
  let sum = 0;
  
  // Discard transient behavior
  for (let i = 0; i < discardTransient; i++) {
    x = map(x);
  }
  
  // Calculate Lyapunov exponent
  for (let i = 0; i < iterations; i++) {
    const derivative = options.derivative 
      ? options.derivative(x) 
      : (map(x + 1e-8) - map(x)) / 1e-8;
    
    sum += Math.log(Math.abs(derivative));
    x = map(x);
  }
  
  return sum / iterations;
};

/**
 * Generate the bifurcation diagram for a parametrized map
 * @param {Function} map - Function(x, r) where r is the parameter
 * @param {Object} options - Generation options
 * @returns {Array} - Points for the bifurcation diagram
 */
chaosTheory.bifurcationDiagram = function(map, options = {}) {
  const rStart = options.rStart || 2.8;
  const rEnd = options.rEnd || 4.0;
  const rSteps = options.rSteps || 1000;
  const xInitial = options.xInitial || 0.5;
  const iterations = options.iterations || 1000;
  const discardTransient = options.discardTransient || 500;
  
  const points = [];
  const rStep = (rEnd - rStart) / rSteps;
  
  for (let rIndex = 0; rIndex <= rSteps; rIndex++) {
    const r = rStart + rIndex * rStep;
    let x = xInitial;
    
    // Discard transient behavior
    for (let i = 0; i < discardTransient; i++) {
      x = map(x, r);
    }
    
    // Record steady state behavior
    for (let i = 0; i < iterations; i++) {
      x = map(x, r);
      if (i % options.recordEvery || 1 === 0) {
        points.push({ r, x });
      }
    }
  }
  
  return points;
};

/**
 * Calculate Feigenbaum constant approximation
 * @param {Function} map - Parametrized map function(x, r)
 * @param {Array} initialBifurcationPoints - Array of initial bifurcation parameter values
 * @returns {number} - Approximation of Feigenbaum constant (≈ 4.669)
 */
chaosTheory.feigenbaumConstant = function(map, initialBifurcationPoints) {
  if (initialBifurcationPoints.length < 4) {
    throw new Error('At least 4 bifurcation points are needed');
  }
  
  const deltas = [];
  for (let i = 0; i < initialBifurcationPoints.length - 2; i++) {
    const delta = (initialBifurcationPoints[i+1] - initialBifurcationPoints[i]) / 
                 (initialBifurcationPoints[i+2] - initialBifurcationPoints[i+1]);
    deltas.push(delta);
  }
  
  return deltas[deltas.length - 1];
};

/**
 * Generate iterations of the Mandelbrot set for visualization
 * @param {Object} options - Generation options
 * @returns {Array} - 2D array of iteration counts
 */
chaosTheory.mandelbrotSet = function(options = {}) {
  const width = options.width || 800;
  const height = options.height || 800;
  const xMin = options.xMin || -2.0;
  const xMax = options.xMax || 1.0;
  const yMin = options.yMin || -1.5;
  const yMax = options.yMax || 1.5;
  const maxIterations = options.maxIterations || 1000;
  const escapeRadius = options.escapeRadius || 2.0;
  
  const iterations = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const re = xMin + (xMax - xMin) * x / (width - 1);
      const im = yMin + (yMax - yMin) * y / (height - 1);
      
      let zRe = 0, zIm = 0;
      let iter;
      
      for (iter = 0; iter < maxIterations; iter++) {
        // z = z^2 + c
        const zRe2 = zRe * zRe;
        const zIm2 = zIm * zIm;
        
        if (zRe2 + zIm2 > escapeRadius * escapeRadius) {
          break;
        }
        
        zIm = 2 * zRe * zIm + im;
        zRe = zRe2 - zIm2 + re;
      }
      
      iterations[y][x] = iter;
    }
  }
  
  return iterations;
};

/**
 * Generate Julia set for a given complex parameter c
 * @param {Object} options - Generation options
 * @returns {Array} - 2D array of iteration counts
 */
chaosTheory.juliaSet = function(options = {}) {
  const width = options.width || 800;
  const height = options.height || 800;
  const xMin = options.xMin || -2.0;
  const xMax = options.xMax || 2.0;
  const yMin = options.yMin || -2.0;
  const yMax = options.yMax || 2.0;
  const cRe = options.cRe || -0.7;
  const cIm = options.cIm || 0.27015;
  const maxIterations = options.maxIterations || 1000;
  const escapeRadius = options.escapeRadius || 2.0;
  
  const iterations = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let zRe = xMin + (xMax - xMin) * x / (width - 1);
      let zIm = yMin + (yMax - yMin) * y / (height - 1);
      
      let iter;
      
      for (iter = 0; iter < maxIterations; iter++) {
        // z = z^2 + c
        const zRe2 = zRe * zRe;
        const zIm2 = zIm * zIm;
        
        if (zRe2 + zIm2 > escapeRadius * escapeRadius) {
          break;
        }
        
        zIm = 2 * zRe * zIm + cIm;
        zRe = zRe2 - zIm2 + cRe;
      }
      
      iterations[y][x] = iter;
    }
  }
  
  return iterations;
};

/**
 * Computes the fractal dimension using the box-counting method
 * @param {Function} isInSet - Function that takes (x, y) and returns boolean if the point is in the set
 * @param {Object} bounds - {xMin, xMax, yMin, yMax} defining the area to analyze
 * @param {Object} options - Calculation options
 * @returns {number} - The estimated fractal dimension
 */
chaosTheory.boxCountingDimension = function(isInSet, bounds, options = {}) {
  const minBoxSize = options.minBoxSize || 2;
  const maxBoxSize = options.maxBoxSize || 128;
  
  const width = bounds.xMax - bounds.xMin;
  const height = bounds.yMax - bounds.yMin;
  
  const sizes = [];
  const counts = [];
  
  // Try different box sizes
  for (let boxSize = minBoxSize; boxSize <= maxBoxSize; boxSize *= 2) {
    const numBoxesX = Math.ceil(width / boxSize);
    const numBoxesY = Math.ceil(height / boxSize);
    let boxCount = 0;
    
    // Check each box
    for (let boxY = 0; boxY < numBoxesY; boxY++) {
      for (let boxX = 0; boxX < numBoxesX; boxX++) {
        let boxHasPoint = false;
        
        // Check sample points in box
        const samplePoints = options.samplesPerBox || 5;
        for (let sy = 0; sy < samplePoints; sy++) {
          for (let sx = 0; sx < samplePoints; sx++) {
            const x = bounds.xMin + (boxX + sx / samplePoints) * boxSize;
            const y = bounds.yMin + (boxY + sy / samplePoints) * boxSize;
            
            if (isInSet(x, y)) {
              boxHasPoint = true;
              break;
            }
          }
          if (boxHasPoint) break;
        }
        
        if (boxHasPoint) {
          boxCount++;
        }
      }
    }
    
    sizes.push(boxSize);
    counts.push(boxCount);
  }
  
  // Linear regression on log-log scale to find dimension
  const n = sizes.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    const x = Math.log(1 / sizes[i]);
    const y = Math.log(counts[i]);
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
};

/**
 * Generate the Lorenz attractor trajectory
 * @param {Object} options - Generation options
 * @returns {Array} - Array of points {x, y, z} representing the trajectory
 */
chaosTheory.lorenzAttractor = function(options = {}) {
  const sigma = options.sigma || 10;
  const rho = options.rho || 28;
  const beta = options.beta || 8/3;
  const dt = options.dt || 0.01;
  const duration = options.duration || 100;
  const initialState = options.initialState || { x: 0.1, y: 0, z: 0 };
  
  const points = [{ ...initialState }];
  const steps = Math.floor(duration / dt);
  
  let x = initialState.x;
  let y = initialState.y;
  let z = initialState.z;
  
  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    
    if (i % (options.saveEvery || 10) === 0) {
      points.push({ x, y, z });
    }
  }
  
  return points;
};

/**
 * Implement the logistic map function f(x) = rx(1-x)
 * @param {number} x - Value between 0 and 1
 * @param {number} r - Control parameter, typically between 0 and 4
 * @returns {number} - The next value
 */
chaosTheory.logisticMap = function(x, r) {
  return r * x * (1 - x);
};

/**
 * Implement the Hénon map, a discrete-time dynamical system
 * @param {Object} point - {x, y} current point
 * @param {Object} params - {a, b} parameters (classic values: a=1.4, b=0.3)
 * @returns {Object} - The next point {x, y}
 */
chaosTheory.henonMap = function(point, params = { a: 1.4, b: 0.3 }) {
  const { x, y } = point;
  const { a, b } = params;
  
  return {
    x: 1 - a * x * x + y,
    y: b * x
  };
};

/**
 * Generate recurrence plot to visualize recurrences of states in phase space
 * @param {Array} timeSeries - Array of values representing the time series
 * @param {Object} options - Plot options
 * @returns {Array} - 2D array representing the recurrence plot
 */
chaosTheory.recurrencePlot = function(timeSeries, options = {}) {
  const threshold = options.threshold || 0.1;
  const norm = options.norm || 'euclidean';
  const dimension = options.dimension || 1;
  const delay = options.delay || 1;
  
  // Reconstruct phase space using time delay method if dimension > 1
  const vectors = [];
  for (let i = 0; i <= timeSeries.length - dimension * delay; i++) {
    const vector = [];
    for (let j = 0; j < dimension; j++) {
      vector.push(timeSeries[i + j * delay]);
    }
    vectors.push(vector);
  }
  
  const n = vectors.length;
  const plot = Array(n).fill().map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let distance;
      
      if (dimension === 1) {
        distance = Math.abs(vectors[i][0] - vectors[j][0]);
      } else {
        // Calculate distance using specified norm
        if (norm === 'euclidean') {
          let sum = 0;
          for (let k = 0; k < dimension; k++) {
            sum += Math.pow(vectors[i][k] - vectors[j][k], 2);
          }
          distance = Math.sqrt(sum);
        } else if (norm === 'maximum') {
          let max = 0;
          for (let k = 0; k < dimension; k++) {
            max = Math.max(max, Math.abs(vectors[i][k] - vectors[j][k]));
          }
          distance = max;
        }
      }
      
      plot[i][j] = distance <= threshold ? 1 : 0;
    }
  }
  
  return plot;
};

/**
 * Calculate Correlation Dimension using the Grassberger-Procaccia algorithm
 * @param {Array} timeSeries - Array of values representing the time series
 * @param {Object} options - Calculation options
 * @returns {Object} - Correlation dimension estimate and data for plotting
 */
chaosTheory.correlationDimension = function(timeSeries, options = {}) {
  const dimension = options.dimension || 2;
  const delay = options.delay || 1;
  const minEpsilon = options.minEpsilon || 0.01;
  const maxEpsilon = options.maxEpsilon || 1.0;
  const epsilonSteps = options.epsilonSteps || 20;
  
  // Reconstruct phase space using time delay method
  const vectors = [];
  for (let i = 0; i <= timeSeries.length - dimension * delay; i++) {
    const vector = [];
    for (let j = 0; j < dimension; j++) {
      vector.push(timeSeries[i + j * delay]);
    }
    vectors.push(vector);
  }
  
  const n = vectors.length;
  const epsilons = [];
  const correlations = [];
  
  // Calculate correlation sum for different epsilon values
  for (let step = 0; step < epsilonSteps; step++) {
    const epsilon = minEpsilon * Math.pow(maxEpsilon / minEpsilon, step / (epsilonSteps - 1));
    epsilons.push(epsilon);
    
    let correlation = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let distance = 0;
        for (let k = 0; k < dimension; k++) {
          distance += Math.pow(vectors[i][k] - vectors[j][k], 2);
        }
        distance = Math.sqrt(distance);
        
        if (distance < epsilon) {
          correlation += 2; // Count both (i,j) and (j,i)
        }
      }
    }
    
    correlation /= n * (n - 1); // Normalize
    correlations.push(correlation);
  }
  
  // Linear regression on log-log plot to find dimension
  const logEpsilons = epsilons.map(e => Math.log(e));
  const logCorrelations = correlations.map(c => Math.log(c + 1e-10)); // Avoid log(0)
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const validPoints = logCorrelations.filter((_, i) => correlations[i] > 0).length;
  
  for (let i = 0; i < logEpsilons.length; i++) {
    if (correlations[i] > 0) {
      sumX += logEpsilons[i];
      sumY += logCorrelations[i];
      sumXY += logEpsilons[i] * logCorrelations[i];
      sumX2 += logEpsilons[i] * logEpsilons[i];
    }
  }
  
  const slope = (validPoints * sumXY - sumX * sumY) / (validPoints * sumX2 - sumX * sumX);
  
  return {
    dimension: slope,
    epsilons: epsilons,
    correlations: correlations
  };
};

module.exports = chaosTheory;
