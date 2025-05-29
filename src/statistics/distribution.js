/**
 * Probability Theory module for herta.js
 * Provides probability distributions, stochastic processes, and statistical functions
 */

import matrix from '../core/matrix.js';
import arithmetic from '../core/arithmetic.js';

const probabilityTheory = {};

/**
 * Calculate factorial
 * @param {number} n - Non-negative integer
 * @returns {number} - Factorial of n
 */
probabilityTheory.factorial = function (n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

/**
 * Calculate binomial coefficient (n choose k)
 * @param {number} n - Total items
 * @param {number} k - Items to choose
 * @returns {number} - Binomial coefficient
 */
probabilityTheory.binomialCoefficient = function (n, k) {
  if (k < 0 || n < k || !Number.isInteger(n) || !Number.isInteger(k)) {
    throw new Error('Binomial coefficient requires integers with 0 ≤ k ≤ n');
  }

  // Optimize calculation for large values
  if (k > n - k) {
    k = n - k;
  }

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i) / (i + 1);
  }

  return Math.round(result);
};

/**
 * Probability mass function for Binomial distribution
 * @param {number} k - Number of successes
 * @param {number} n - Number of trials
 * @param {number} p - Probability of success in a single trial
 * @returns {number} - Probability of exactly k successes
 */
probabilityTheory.binomialPMF = function (k, n, p) {
  if (k < 0 || k > n || !Number.isInteger(k) || !Number.isInteger(n)) {
    throw new Error('Binomial PMF requires integers with 0 ≤ k ≤ n');
  }
  if (p < 0 || p > 1) {
    throw new Error('Probability p must be between 0 and 1');
  }

  return this.binomialCoefficient(n, k) * p ** k * (1 - p) ** (n - k);
};

/**
 * Cumulative distribution function for Binomial distribution
 * @param {number} k - Number of successes
 * @param {number} n - Number of trials
 * @param {number} p - Probability of success in a single trial
 * @returns {number} - Probability of at most k successes
 */
probabilityTheory.binomialCDF = function (k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += this.binomialPMF(i, n, p);
  }
  return sum;
};

/**
 * Probability mass function for Poisson distribution
 * @param {number} k - Number of events
 * @param {number} lambda - Expected number of events
 * @returns {number} - Probability of exactly k events
 */
probabilityTheory.poissonPMF = function (k, lambda) {
  if (k < 0 || !Number.isInteger(k)) {
    throw new Error('Poisson PMF requires non-negative integer k');
  }
  if (lambda <= 0) {
    throw new Error('Lambda must be positive');
  }

  return Math.exp(-lambda) * lambda ** k / this.factorial(k);
};

/**
 * Cumulative distribution function for Poisson distribution
 * @param {number} k - Number of events
 * @param {number} lambda - Expected number of events
 * @returns {number} - Probability of at most k events
 */
probabilityTheory.poissonCDF = function (k, lambda) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += this.poissonPMF(i, lambda);
  }
  return sum;
};

/**
 * Probability density function for Normal distribution
 * @param {number} x - Value
 * @param {number} mean - Mean of the distribution
 * @param {number} stdDev - Standard deviation of the distribution
 * @returns {number} - PDF at x
 */
probabilityTheory.normalPDF = function (x, mean = 0, stdDev = 1) {
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  const z = (x - mean) / stdDev;
  return Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
};

/**
 * Cumulative distribution function for Normal distribution
 * @param {number} x - Value
 * @param {number} mean - Mean of the distribution
 * @param {number} stdDev - Standard deviation of the distribution
 * @returns {number} - CDF at x
 */
probabilityTheory.normalCDF = function (x, mean = 0, stdDev = 1) {
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  const z = (x - mean) / stdDev;
  return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
};

/**
 * Error function implementation
 * @param {number} x - Input value
 * @returns {number} - Error function value
 */
probabilityTheory.erf = function (x) {
  // Abramowitz and Stegun approximation (accuracy ~1.5×10−7)
  const sign = x >= 0 ? 1 : -1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
};

/**
 * Probability density function for Exponential distribution
 * @param {number} x - Value
 * @param {number} lambda - Rate parameter
 * @returns {number} - PDF at x
 */
probabilityTheory.exponentialPDF = function (x, lambda) {
  if (lambda <= 0) {
    throw new Error('Rate parameter must be positive');
  }
  if (x < 0) {
    return 0;
  }

  return lambda * Math.exp(-lambda * x);
};

/**
 * Cumulative distribution function for Exponential distribution
 * @param {number} x - Value
 * @param {number} lambda - Rate parameter
 * @returns {number} - CDF at x
 */
probabilityTheory.exponentialCDF = function (x, lambda) {
  if (lambda <= 0) {
    throw new Error('Rate parameter must be positive');
  }
  if (x < 0) {
    return 0;
  }

  return 1 - Math.exp(-lambda * x);
};

/**
 * Quantile function (inverse CDF) for Normal distribution
 * @param {number} p - Probability (0 to 1)
 * @param {number} mean - Mean of the distribution
 * @param {number} stdDev - Standard deviation of the distribution
 * @returns {number} - Value x such that P(X ≤ x) = p
 */
probabilityTheory.normalQuantile = function (p, mean = 0, stdDev = 1) {
  if (p < 0 || p > 1) {
    throw new Error('Probability p must be between 0 and 1');
  }
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  // Approximation of the standard normal quantile function
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;

  let q; let
    r;

  if (p < 0.5) {
    q = p;
    r = -1;
  } else {
    q = 1 - p;
    r = 1;
  }

  const y = Math.sqrt(-2 * Math.log(q));
  const a = 2.515517 + (0.802853 * y) + (0.010328 * y * y);
  const b = 1 + (1.432788 * y) + (0.189269 * y * y) + (0.001308 * y * y * y);

  return mean + stdDev * r * (y - a / b);
};

/**
 * Generate n random samples from Normal distribution
 * @param {number} n - Number of samples
 * @param {number} mean - Mean of the distribution
 * @param {number} stdDev - Standard deviation of the distribution
 * @returns {Array} - Array of random samples
 */
probabilityTheory.normalRandom = function (n, mean = 0, stdDev = 1) {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('Number of samples must be a positive integer');
  }
  if (stdDev <= 0) {
    throw new Error('Standard deviation must be positive');
  }

  const samples = [];

  // Box-Muller transform
  for (let i = 0; i < n; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();

    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(mean + stdDev * z1);

    // Only add the second sample if we need it
    if (i + 1 < n) {
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      samples.push(mean + stdDev * z2);
    }
  }

  return samples;
};

/**
 * Generate n random samples from Exponential distribution
 * @param {number} n - Number of samples
 * @param {number} lambda - Rate parameter
 * @returns {Array} - Array of random samples
 */
probabilityTheory.exponentialRandom = function (n, lambda) {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('Number of samples must be a positive integer');
  }
  if (lambda <= 0) {
    throw new Error('Rate parameter must be positive');
  }

  const samples = [];

  // Inverse transform sampling
  for (let i = 0; i < n; i++) {
    const u = Math.random();
    samples.push(-Math.log(1 - u) / lambda);
  }

  return samples;
};

/**
 * Perform Monte Carlo integration
 * @param {Function} func - Function to integrate
 * @param {Array} lowerBounds - Lower bounds of integration
 * @param {Array} upperBounds - Upper bounds of integration
 * @param {number} samples - Number of samples
 * @returns {Object} - Result containing estimate and error
 */
probabilityTheory.monteCarloIntegration = function (func, lowerBounds, upperBounds, samples = 10000) {
  if (lowerBounds.length !== upperBounds.length) {
    throw new Error('Lower and upper bounds must have the same dimension');
  }
  if (samples <= 0 || !Number.isInteger(samples)) {
    throw new Error('Number of samples must be a positive integer');
  }

  const dimension = lowerBounds.length;
  let sum = 0;
  let sumSquared = 0;

  // Calculate volume of integration region
  let volume = 1;
  for (let i = 0; i < dimension; i++) {
    volume *= (upperBounds[i] - lowerBounds[i]);
  }

  // Perform Monte Carlo integration
  for (let i = 0; i < samples; i++) {
    // Generate random point in integration region
    const point = [];
    for (let j = 0; j < dimension; j++) {
      point.push(lowerBounds[j] + Math.random() * (upperBounds[j] - lowerBounds[j]));
    }

    // Evaluate function at random point
    const value = func(...point);
    sum += value;
    sumSquared += value * value;
  }

  // Calculate estimate and standard error
  const estimate = (sum / samples) * volume;
  const variance = (sumSquared / samples - (sum / samples) ** 2) * volume * volume / samples;
  const error = Math.sqrt(variance);

  return { estimate, error };
};

/**
 * Calculate sample statistics
 * @param {Array} data - Array of numerical data
 * @returns {Object} - Statistics including mean, variance, skewness, etc.
 */
probabilityTheory.sampleStatistics = function (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  const n = data.length;

  // Calculate mean
  const mean = data.reduce((sum, x) => sum + x, 0) / n;

  // Calculate variance and standard deviation
  let variance = 0;
  let sumCubed = 0;
  let sumFourth = 0;

  for (const x of data) {
    const dev = x - mean;
    const devSquared = dev * dev;
    variance += devSquared;
    sumCubed += devSquared * dev;
    sumFourth += devSquared * devSquared;
  }

  variance /= (n - 1); // Unbiased estimator
  const stdDev = Math.sqrt(variance);

  // Calculate skewness
  const skewness = (sumCubed / n) / stdDev ** 3;

  // Calculate kurtosis
  const kurtosis = (sumFourth / n) / variance ** 2;

  // Calculate median
  const sortedData = [...data].sort((a, b) => a - b);
  let median;
  if (n % 2 === 0) {
    median = (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
  } else {
    median = sortedData[Math.floor(n / 2)];
  }

  // Calculate quantiles
  const q1 = sortedData[Math.floor(n / 4)];
  const q3 = sortedData[Math.floor(3 * n / 4)];

  return {
    n,
    mean,
    variance,
    stdDev,
    skewness,
    kurtosis,
    median,
    q1,
    q3,
    min: sortedData[0],
    max: sortedData[n - 1]
  };
};

/**
 * Calculate correlation coefficient between two variables
 * @param {Array} x - First variable
 * @param {Array} y - Second variable
 * @returns {number} - Pearson correlation coefficient
 */
probabilityTheory.correlation = function (x, y) {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length === 0) {
    throw new Error('Inputs must be arrays of the same non-zero length');
  }

  const n = x.length;

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate covariance and variances
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let i = 0; i < n; i++) {
    const devX = x[i] - meanX;
    const devY = y[i] - meanY;
    covariance += devX * devY;
    varianceX += devX * devX;
    varianceY += devY * devY;
  }

  // Calculate correlation coefficient
  return covariance / Math.sqrt(varianceX * varianceY);
};

/**
 * Perform hypothesis test for the mean of a Normal distribution
 * @param {Array} data - Sample data
 * @param {number} mu0 - Null hypothesis mean
 * @param {Object} options - Test options
 * @returns {Object} - Test result
 */
probabilityTheory.tTest = function (data, mu0, options = {}) {
  const { alternative = 'two-sided', alpha = 0.05 } = options;

  if (!Array.isArray(data) || data.length < 2) {
    throw new Error('Data must be an array with at least two elements');
  }

  if (!['two-sided', 'less', 'greater'].includes(alternative)) {
    throw new Error('Alternative must be "two-sided", "less", or "greater"');
  }

  const stats = this.sampleStatistics(data);
  const { n } = stats;
  const se = stats.stdDev / Math.sqrt(n);
  const tStat = (stats.mean - mu0) / se;

  // Calculate p-value based on t-distribution
  // This is an approximation using the normal distribution
  let pValue;

  if (alternative === 'two-sided') {
    pValue = 2 * (1 - this.normalCDF(Math.abs(tStat)));
  } else if (alternative === 'greater') {
    pValue = 1 - this.normalCDF(tStat);
  } else { // alternative === 'less'
    pValue = this.normalCDF(tStat);
  }

  // Calculate confidence interval
  const criticalValue = this.normalQuantile(1 - alpha / 2);
  const margin = criticalValue * se;
  const ciLower = stats.mean - margin;
  const ciUpper = stats.mean + margin;

  return {
    statistic: tStat,
    pValue,
    rejectNull: pValue < alpha,
    confidenceInterval: [ciLower, ciUpper],
    sampleMean: stats.mean,
    sampleStdDev: stats.stdDev,
    standardError: se
  };
};

/**
 * Simple linear regression
 * @param {Array} x - Independent variable values
 * @param {Array} y - Dependent variable values
 * @returns {Object} - Regression results
 */
probabilityTheory.linearRegression = function (x, y) {
  if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length || x.length < 2) {
    throw new Error('Inputs must be arrays of the same length (at least 2)');
  }

  const n = x.length;

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const devX = x[i] - meanX;
    numerator += devX * (y[i] - meanY);
    denominator += devX * devX;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate predictions and residuals
  const predictions = x.map((xi) => intercept + slope * xi);
  const residuals = y.map((yi, i) => yi - predictions[i]);

  // Calculate R-squared
  const ssTotal = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
  const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0);
  const rSquared = 1 - ssResidual / ssTotal;

  return {
    slope,
    intercept,
    rSquared,
    predictions,
    residuals
  };
};

export default probabilityTheory;
