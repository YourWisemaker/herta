/**
 * Utility functions for herta.js
 * Provides common utilities used across the framework
 */

const Decimal = require('decimal.js');
const Complex = require('complex.js');

// Utilities module
const utils = {};

/**
 * Check if a value is a number (including numeric strings)
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a number
 */
utils.isNumber = function(value) {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }
  return false;
};

/**
 * Check if a value is a complex number
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a complex number
 */
utils.isComplex = function(value) {
  return value instanceof Complex;
};

/**
 * Check if a value is a matrix
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a matrix
 */
utils.isMatrix = function(value) {
  return Array.isArray(value) && value.length > 0 && Array.isArray(value[0]);
};

/**
 * Check if a value is a tensor (array with depth > 2)
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a tensor
 */
utils.isTensor = function(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  if (!Array.isArray(value[0])) return false;
  
  // Check if at least one element in the first row is an array
  return value[0].some(item => Array.isArray(item));
};

/**
 * Format a number to a specified precision
 * @param {number} value - The number to format
 * @param {number} [precision=14] - The number of significant digits
 * @returns {string} - The formatted number
 */
utils.format = function(value, precision = 14) {
  if (typeof value === 'number') {
    return new Decimal(value).toPrecision(precision);
  }
  return String(value);
};

/**
 * Deep clone an object or array
 * @param {any} obj - The object to clone
 * @returns {any} - The cloned object
 */
utils.clone = function(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Complex) return new Complex(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => utils.clone(item));
  }
  
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = utils.clone(obj[key]);
    }
  }
  
  return result;
};

/**
 * Check if two values are approximately equal
 * @param {number|Complex} a - First value
 * @param {number|Complex} b - Second value
 * @param {number} [epsilon=1e-12] - Tolerance
 * @returns {boolean} - True if values are approximately equal
 */
utils.approxEqual = function(a, b, epsilon = 1e-12) {
  if (utils.isComplex(a) || utils.isComplex(b)) {
    const aComplex = utils.isComplex(a) ? a : new Complex(a);
    const bComplex = utils.isComplex(b) ? b : new Complex(b);
    
    return Math.abs(aComplex.re - bComplex.re) < epsilon && 
           Math.abs(aComplex.im - bComplex.im) < epsilon;
  }
  
  return Math.abs(a - b) < epsilon;
};

/**
 * Generate a range of numbers
 * @param {number} start - Start value (inclusive)
 * @param {number} end - End value (inclusive)
 * @param {number} [step=1] - Step size
 * @returns {Array} - Array of numbers in the range
 */
utils.range = function(start, end, step = 1) {
  const result = [];
  
  if (step === 0) {
    throw new Error('Step cannot be zero');
  }
  
  if ((step > 0 && start > end) || (step < 0 && start < end)) {
    return result;
  }
  
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    result.push(i);
  }
  
  return result;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
utils.toRadians = function(degrees) {
  return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} - Angle in degrees
 */
utils.toDegrees = function(radians) {
  return radians * (180 / Math.PI);
};

/**
 * Parse a mathematical expression string
 * @param {string} expr - The expression to parse
 * @returns {Object} - Parsed expression object
 */
utils.parseExpression = function(expr) {
  // This would implement a proper expression parser
  // For now, return a placeholder
  return {
    type: 'expression',
    value: expr
  };
};

/**
 * Check if a value is prime
 * @param {number} n - The number to check
 * @returns {boolean} - True if the number is prime
 */
utils.isPrime = function(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  const limit = Math.sqrt(n);
  for (let i = 5; i <= limit; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  
  return true;
};

/**
 * Calculate the factorial of a number
 * @param {number} n - The number
 * @returns {number} - The factorial
 */
utils.factorial = function(n) {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  
  if (n === 0 || n === 1) return 1;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  return result;
};

/**
 * Calculate the binomial coefficient (n choose k)
 * @param {number} n - Total number of items
 * @param {number} k - Number of items to choose
 * @returns {number} - The binomial coefficient
 */
utils.binomial = function(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use symmetry to reduce calculations
  k = Math.min(k, n - k);
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - (i - 1));
    result /= i;
  }
  
  return result;
};

/**
 * Calculate the greatest common divisor (GCD) of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - The GCD
 */
utils.gcd = function(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
};

/**
 * Calculate the least common multiple (LCM) of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - The LCM
 */
utils.lcm = function(a, b) {
  return Math.abs(a * b) / utils.gcd(a, b);
};

/**
 * Calculate the mean of an array of numbers
 * @param {Array<number>} values - Array of numbers
 * @returns {number} - The arithmetic mean
 */
utils.mean = function(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Calculate the median of an array of numbers
 * @param {Array<number>} values - Array of numbers
 * @returns {number} - The median value
 */
utils.median = function(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
};

/**
 * Calculate the variance of an array of numbers
 * @param {Array<number>} values - Array of numbers
 * @param {boolean} [sample=true] - If true, calculates sample variance, otherwise population variance
 * @returns {number} - The variance
 */
utils.variance = function(values, sample = true) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Input must be a non-empty array');
  }
  
  const mean = utils.mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const sum = squaredDiffs.reduce((acc, val) => acc + val, 0);
  
  return sum / (values.length - (sample ? 1 : 0));
};

/**
 * Calculate the standard deviation of an array of numbers
 * @param {Array<number>} values - Array of numbers
 * @param {boolean} [sample=true] - If true, calculates sample standard deviation, otherwise population
 * @returns {number} - The standard deviation
 */
utils.standardDeviation = function(values, sample = true) {
  return Math.sqrt(utils.variance(values, sample));
};

/**
 * Calculate the covariance between two arrays of numbers
 * @param {Array<number>} xValues - First array of numbers
 * @param {Array<number>} yValues - Second array of numbers
 * @param {boolean} [sample=true] - If true, calculates sample covariance, otherwise population
 * @returns {number} - The covariance
 */
utils.covariance = function(xValues, yValues, sample = true) {
  if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length === 0 || yValues.length === 0) {
    throw new Error('Inputs must be non-empty arrays');
  }
  
  if (xValues.length !== yValues.length) {
    throw new Error('Arrays must have the same length');
  }
  
  const xMean = utils.mean(xValues);
  const yMean = utils.mean(yValues);
  
  let sum = 0;
  for (let i = 0; i < xValues.length; i++) {
    sum += (xValues[i] - xMean) * (yValues[i] - yMean);
  }
  
  return sum / (xValues.length - (sample ? 1 : 0));
};

/**
 * Calculate the Pearson correlation coefficient between two arrays of numbers
 * @param {Array<number>} xValues - First array of numbers
 * @param {Array<number>} yValues - Second array of numbers
 * @returns {number} - The correlation coefficient (between -1 and 1)
 */
utils.correlation = function(xValues, yValues) {
  const xStdDev = utils.standardDeviation(xValues);
  const yStdDev = utils.standardDeviation(yValues);
  
  if (xStdDev === 0 || yStdDev === 0) {
    return 0; // No correlation when there's no variation
  }
  
  return utils.covariance(xValues, yValues) / (xStdDev * yStdDev);
};

/**
 * Perform numerical integration using the trapezoidal rule
 * @param {Function} func - The function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} [n=100] - Number of intervals
 * @returns {number} - The approximate integral value
 */
utils.integrate = function(func, a, b, n = 100) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }
  
  if (a >= b) {
    throw new Error('Upper bound must be greater than lower bound');
  }
  
  const h = (b - a) / n;
  let sum = 0.5 * (func(a) + func(b));
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += func(x);
  }
  
  return h * sum;
};

/**
 * Find the root of a function using the Newton-Raphson method
 * @param {Function} func - The function to find the root of
 * @param {Function} derivative - The derivative of the function
 * @param {number} initialGuess - Initial guess for the root
 * @param {number} [tolerance=1e-10] - Convergence tolerance
 * @param {number} [maxIterations=100] - Maximum number of iterations
 * @returns {number} - The approximate root
 */
utils.findRoot = function(func, derivative, initialGuess, tolerance = 1e-10, maxIterations = 100) {
  if (typeof func !== 'function' || typeof derivative !== 'function') {
    throw new Error('First two arguments must be functions');
  }
  
  let x = initialGuess;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    const fx = func(x);
    
    if (Math.abs(fx) < tolerance) {
      return x; // Converged to a root
    }
    
    const dfx = derivative(x);
    
    if (dfx === 0) {
      throw new Error('Derivative is zero, cannot continue');
    }
    
    const xNew = x - fx / dfx;
    
    if (Math.abs(xNew - x) < tolerance) {
      return xNew; // Converged to a root
    }
    
    x = xNew;
    iteration++;
  }
  
  throw new Error(`Method did not converge after ${maxIterations} iterations`);
};

/**
 * Calculate the probability density function (PDF) of a normal distribution
 * @param {number} x - The value to calculate the PDF at
 * @param {number} [mean=0] - The mean of the distribution
 * @param {number} [stdDev=1] - The standard deviation of the distribution
 * @returns {number} - The PDF value
 */
utils.normalPDF = function(x, mean = 0, stdDev = 1) {
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }
  
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  
  return coefficient * Math.exp(exponent);
};

/**
 * Calculate the cumulative distribution function (CDF) of a normal distribution
 * @param {number} x - The value to calculate the CDF at
 * @param {number} [mean=0] - The mean of the distribution
 * @param {number} [stdDev=1] - The standard deviation of the distribution
 * @returns {number} - The CDF value (between 0 and 1)
 */
utils.normalCDF = function(x, mean = 0, stdDev = 1) {
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }
  
  // Use error function approximation for normal CDF
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + utils.erf(z));
};

/**
 * Error function approximation
 * @param {number} x - Input value
 * @returns {number} - Error function value
 */
utils.erf = function(x) {
  // Constants for approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  // Save the sign
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  
  // Approximation formula
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
};

/**
 * Perform polynomial interpolation using Lagrange method
 * @param {Array<number>} xValues - Array of x coordinates
 * @param {Array<number>} yValues - Array of y coordinates
 * @returns {Function} - Interpolation function that takes an x value and returns the interpolated y value
 */
utils.interpolate = function(xValues, yValues) {
  if (!Array.isArray(xValues) || !Array.isArray(yValues)) {
    throw new Error('Inputs must be arrays');
  }
  
  if (xValues.length !== yValues.length) {
    throw new Error('Arrays must have the same length');
  }
  
  if (xValues.length === 0) {
    throw new Error('Arrays cannot be empty');
  }
  
  // Return the interpolation function
  return function(x) {
    let result = 0;
    
    for (let i = 0; i < xValues.length; i++) {
      let term = yValues[i];
      
      for (let j = 0; j < xValues.length; j++) {
        if (j !== i) {
          term *= (x - xValues[j]) / (xValues[i] - xValues[j]);
        }
      }
      
      result += term;
    }
    
    return result;
  };
};

module.exports = utils;