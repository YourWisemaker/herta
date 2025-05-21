/**
 * Advanced statistical analysis module for herta.js
 * Provides statistical functions for scientific data analysis
 */

const Decimal = require('decimal.js');

// Statistics module
const statistics = {};

/**
 * Descriptive statistics functions
 */
statistics.descriptive = {};

/**
 * Calculate the mean of an array of values
 * @param {Array} data - Array of numerical values
 * @returns {number} - The mean value
 */
statistics.descriptive.mean = function (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

/**
 * Calculate the median of an array of values
 * @param {Array} data - Array of numerical values
 * @returns {number} - The median value
 */
statistics.descriptive.median = function (data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  // Sort the data
  const sorted = [...data].sort((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Even number of elements
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  // Odd number of elements
  return sorted[mid];
};

/**
 * Calculate the variance of an array of values
 * @param {Array} data - Array of numerical values
 * @param {boolean} [sample=true] - If true, calculate sample variance, otherwise population variance
 * @returns {number} - The variance
 */
statistics.descriptive.variance = function (data, sample = true) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  const mean = statistics.descriptive.mean(data);
  const squaredDiffs = data.map((val) => (val - mean) ** 2);
  const sum = squaredDiffs.reduce((acc, val) => acc + val, 0);

  return sample ? sum / (data.length - 1) : sum / data.length;
};

/**
 * Calculate the standard deviation of an array of values
 * @param {Array} data - Array of numerical values
 * @param {boolean} [sample=true] - If true, calculate sample standard deviation, otherwise population
 * @returns {number} - The standard deviation
 */
statistics.descriptive.standardDeviation = function (data, sample = true) {
  return Math.sqrt(statistics.descriptive.variance(data, sample));
};

/**
 * Calculate the covariance between two arrays of values
 * @param {Array} dataX - First array of numerical values
 * @param {Array} dataY - Second array of numerical values
 * @param {boolean} [sample=true] - If true, calculate sample covariance, otherwise population
 * @returns {number} - The covariance
 */
statistics.descriptive.covariance = function (dataX, dataY, sample = true) {
  if (!Array.isArray(dataX) || !Array.isArray(dataY) || dataX.length !== dataY.length) {
    throw new Error('Inputs must be arrays of equal length');
  }

  const meanX = statistics.descriptive.mean(dataX);
  const meanY = statistics.descriptive.mean(dataY);

  let sum = 0;
  for (let i = 0; i < dataX.length; i++) {
    sum += (dataX[i] - meanX) * (dataY[i] - meanY);
  }

  return sample ? sum / (dataX.length - 1) : sum / dataX.length;
};

/**
 * Calculate the correlation coefficient between two arrays of values
 * @param {Array} dataX - First array of numerical values
 * @param {Array} dataY - Second array of numerical values
 * @returns {number} - The correlation coefficient (Pearson's r)
 */
statistics.descriptive.correlation = function (dataX, dataY) {
  const covariance = statistics.descriptive.covariance(dataX, dataY);
  const stdDevX = statistics.descriptive.standardDeviation(dataX);
  const stdDevY = statistics.descriptive.standardDeviation(dataY);

  return covariance / (stdDevX * stdDevY);
};

/**
 * Probability distributions
 */
statistics.distributions = {};

/**
 * Normal (Gaussian) distribution functions
 */
statistics.distributions.normal = {
  /**
   * Calculate the probability density function (PDF) of the normal distribution
   * @param {number} x - The value to evaluate
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - The PDF value
   */
  pdf(x, mean = 0, stdDev = 1) {
    const variance = stdDev * stdDev;
    return (1 / Math.sqrt(2 * Math.PI * variance))
           * Math.exp(-((x - mean) ** 2) / (2 * variance));
  },

  /**
   * Calculate the cumulative distribution function (CDF) of the normal distribution
   * @param {number} x - The value to evaluate
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - The CDF value
   */
  cdf(x, mean = 0, stdDev = 1) {
    // Error function approximation for normal CDF
    const z = (x - mean) / (stdDev * Math.sqrt(2));
    return 0.5 * (1 + statistics.special.erf(z));
  },

  /**
   * Generate random samples from a normal distribution
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @param {number} [n=1] - Number of samples to generate
   * @returns {Array|number} - Array of samples or a single sample if n=1
   */
  sample(mean = 0, stdDev = 1, n = 1) {
    // Box-Muller transform for normal distribution sampling
    function generateSample() {
      let u1; let
        u2;
      do {
        u1 = Math.random();
        u2 = Math.random();
      } while (u1 <= Number.EPSILON);

      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mean + stdDev * z0;
    }

    if (n === 1) {
      return generateSample();
    }

    const samples = [];
    for (let i = 0; i < n; i++) {
      samples.push(generateSample());
    }

    return samples;
  }
};

/**
 * Student's t-distribution functions
 */
statistics.distributions.t = {
  /**
   * Calculate the probability density function (PDF) of the t-distribution
   * @param {number} x - The value to evaluate
   * @param {number} dof - Degrees of freedom
   * @returns {number} - The PDF value
   */
  pdf(x, dof) {
    if (dof <= 0) {
      throw new Error('Degrees of freedom must be positive');
    }

    const numerator = statistics.special.gamma((dof + 1) / 2);
    const denominator = Math.sqrt(dof * Math.PI) * statistics.special.gamma(dof / 2);

    return (numerator / denominator) * (1 + (x * x) / dof) ** (-(dof + 1) / 2);
  }
};

/**
 * Hypothesis testing functions
 */
statistics.hypothesis = {};

/**
 * Perform a one-sample t-test
 * @param {Array} data - Sample data
 * @param {number} mu - Population mean to test against
 * @param {Object} [options] - Additional options
 * @returns {Object} - Test results including t-statistic, p-value, etc.
 */
statistics.hypothesis.tTest = function (data, mu, options = {}) {
  const defaultOptions = {
    alpha: 0.05,
    alternative: 'two-sided' // 'two-sided', 'less', 'greater'
  };

  const config = { ...defaultOptions, ...options };

  const n = data.length;
  const mean = statistics.descriptive.mean(data);
  const stdDev = statistics.descriptive.standardDeviation(data);
  const se = stdDev / Math.sqrt(n);

  const tStat = (mean - mu) / se;
  const dof = n - 1;

  // Calculate p-value based on alternative hypothesis
  let pValue;
  if (config.alternative === 'two-sided') {
    // Two-tailed test
    pValue = 2 * (1 - statistics.distributions.t.cdf(Math.abs(tStat), dof));
  } else if (config.alternative === 'less') {
    // One-tailed test (less than)
    pValue = statistics.distributions.t.cdf(tStat, dof);
  } else if (config.alternative === 'greater') {
    // One-tailed test (greater than)
    pValue = 1 - statistics.distributions.t.cdf(tStat, dof);
  }

  const reject = pValue < config.alpha;

  return {
    tStat,
    pValue,
    dof,
    mean,
    stdDev,
    se,
    mu,
    reject,
    alternative: config.alternative,
    alpha: config.alpha
  };
};

/**
 * Special mathematical functions for statistics
 */
statistics.special = {
  /**
   * Error function
   * @param {number} x - Input value
   * @returns {number} - Error function value
   */
  erf(x) {
    // Abramowitz and Stegun approximation (maximum error: 1.5×10^−7)
    const sign = x >= 0 ? 1 : -1;
    const t = 1.0 / (1.0 + 0.3275911 * Math.abs(x));
    const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  },

  /**
   * Gamma function approximation
   * @param {number} z - Input value
   * @returns {number} - Gamma function value
   */
  gamma(z) {
    // Lanczos approximation for the gamma function
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * statistics.special.gamma(1 - z));
    }

    z -= 1;
    const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

    let x = p[0];
    for (let i = 1; i < p.length; i++) {
      x += p[i] / (z + i);
    }

    const t = z + p.length - 1.5;
    return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
  }
};

/**
 * Time series analysis functions
 */
statistics.timeSeries = {
  /**
   * Calculate the moving average of a time series
   * @param {Array} data - Time series data
   * @param {number} window - Window size for moving average
   * @returns {Array} - Moving average values
   */
  movingAverage(data, window) {
    if (!Array.isArray(data) || window <= 0 || window > data.length) {
      throw new Error('Invalid input parameters');
    }

    const result = [];

    for (let i = 0; i <= data.length - window; i++) {
      const windowData = data.slice(i, i + window);
      const avg = statistics.descriptive.mean(windowData);
      result.push(avg);
    }

    return result;
  },

  /**
   * Calculate the exponential moving average of a time series
   * @param {Array} data - Time series data
   * @param {number} alpha - Smoothing factor (0 < alpha < 1)
   * @returns {Array} - Exponential moving average values
   */
  exponentialMovingAverage(data, alpha) {
    if (!Array.isArray(data) || alpha <= 0 || alpha >= 1) {
      throw new Error('Invalid input parameters');
    }

    const result = [data[0]];

    for (let i = 1; i < data.length; i++) {
      const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }

    return result;
  },

  /**
   * Calculate the autocorrelation of a time series
   * @param {Array} data - Time series data
   * @param {number} lag - Lag value
   * @returns {number} - Autocorrelation value
   */
  autocorrelation(data, lag) {
    if (!Array.isArray(data) || lag <= 0 || lag >= data.length) {
      throw new Error('Invalid input parameters');
    }

    const mean = statistics.descriptive.mean(data);
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < data.length - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }

    for (let i = 0; i < data.length; i++) {
      denominator += (data[i] - mean) ** 2;
    }

    return numerator / denominator;
  }
};

/**
 * Machine learning utilities
 */
statistics.ml = {
  /**
   * Perform simple linear regression
   * @param {Array} x - Independent variable values
   * @param {Array} y - Dependent variable values
   * @returns {Object} - Regression results including slope, intercept, r-squared, etc.
   */
  linearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('Inputs must be arrays of equal length');
    }

    const n = x.length;
    const meanX = statistics.descriptive.mean(x);
    const meanY = statistics.descriptive.mean(y);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Calculate R-squared
    let ssTotal = 0;
    let ssResidual = 0;

    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i] + intercept;
      ssTotal += (y[i] - meanY) ** 2;
      ssResidual += (y[i] - yPred) ** 2;
    }

    const rSquared = 1 - (ssResidual / ssTotal);

    return {
      slope,
      intercept,
      rSquared,
      predict(newX) {
        if (Array.isArray(newX)) {
          return newX.map((val) => slope * val + intercept);
        }
        return slope * newX + intercept;
      }
    };
  },

  /**
   * Normalize data using z-score (standard score)
   * @param {Array} data - Data to normalize
   * @returns {Array} - Normalized data
   */
  zScoreNormalize(data) {
    const mean = statistics.descriptive.mean(data);
    const stdDev = statistics.descriptive.standardDeviation(data);

    return data.map((val) => (val - mean) / stdDev);
  },

  /**
   * Min-max normalization of data to [0, 1] range
   * @param {Array} data - Data to normalize
   * @returns {Array} - Normalized data
   */
  minMaxNormalize(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    return data.map((val) => (val - min) / range);
  }
};

module.exports = statistics;
