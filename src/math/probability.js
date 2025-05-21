/**
 * Probability distributions module for herta.js
 * Provides methods for working with various probability distributions
 */

const utils = require('../utils/utils');

// Probability distributions module
const probability = {};

/**
 * Normal (Gaussian) distribution functions
 */
probability.normal = {
  /**
   * Calculate the probability density function (PDF) of a normal distribution
   * @param {number} x - The value to calculate the PDF at
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - The PDF value
   */
  pdf(x, mean = 0, stdDev = 1) {
    return utils.normalPDF(x, mean, stdDev);
  },

  /**
   * Calculate the cumulative distribution function (CDF) of a normal distribution
   * @param {number} x - The value to calculate the CDF at
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - The CDF value (between 0 and 1)
   */
  cdf(x, mean = 0, stdDev = 1) {
    return utils.normalCDF(x, mean, stdDev);
  },

  /**
   * Generate a random sample from a normal distribution
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - A random sample
   */
  sample(mean = 0, stdDev = 1) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + stdDev * z0;
  },

  /**
   * Calculate the inverse CDF (quantile function) of a normal distribution
   * @param {number} p - Probability value (between 0 and 1)
   * @param {number} [mean=0] - The mean of the distribution
   * @param {number} [stdDev=1] - The standard deviation of the distribution
   * @returns {number} - The value x such that CDF(x) = p
   */
  inverse(p, mean = 0, stdDev = 1) {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1 (exclusive)');
    }

    // Approximation of the inverse error function
    function inverseErf(x) {
      const a = 0.147;
      const y = Math.log(1 - x * x);
      const z = 2 / (Math.PI * a) + y / 2;
      return Math.sign(x) * Math.sqrt(Math.sqrt(z * z - y / a) - z);
    }

    // Convert to standard normal and then scale
    const x = Math.sqrt(2) * inverseErf(2 * p - 1);
    return mean + stdDev * x;
  }
};

/**
 * Binomial distribution functions
 */
probability.binomial = {
  /**
   * Calculate the probability mass function (PMF) of a binomial distribution
   * @param {number} k - Number of successes
   * @param {number} n - Number of trials
   * @param {number} p - Probability of success in a single trial
   * @returns {number} - The PMF value
   */
  pmf(k, n, p) {
    if (k < 0 || k > n) {
      return 0;
    }

    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    const binomialCoeff = utils.binomial(n, k);
    return binomialCoeff * p ** k * (1 - p) ** (n - k);
  },

  /**
   * Calculate the cumulative distribution function (CDF) of a binomial distribution
   * @param {number} k - Number of successes
   * @param {number} n - Number of trials
   * @param {number} p - Probability of success in a single trial
   * @returns {number} - The CDF value
   */
  cdf(k, n, p) {
    if (k < 0) {
      return 0;
    }

    if (k >= n) {
      return 1;
    }

    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.pmf(i, n, p);
    }

    return sum;
  },

  /**
   * Calculate the mean of a binomial distribution
   * @param {number} n - Number of trials
   * @param {number} p - Probability of success in a single trial
   * @returns {number} - The mean
   */
  mean(n, p) {
    return n * p;
  },

  /**
   * Calculate the variance of a binomial distribution
   * @param {number} n - Number of trials
   * @param {number} p - Probability of success in a single trial
   * @returns {number} - The variance
   */
  variance(n, p) {
    return n * p * (1 - p);
  },

  /**
   * Generate a random sample from a binomial distribution
   * @param {number} n - Number of trials
   * @param {number} p - Probability of success in a single trial
   * @returns {number} - A random sample
   */
  sample(n, p) {
    let successes = 0;

    for (let i = 0; i < n; i++) {
      if (Math.random() < p) {
        successes++;
      }
    }

    return successes;
  }
};

/**
 * Poisson distribution functions
 */
probability.poisson = {
  /**
   * Calculate the probability mass function (PMF) of a Poisson distribution
   * @param {number} k - Number of events
   * @param {number} lambda - Average number of events in the interval
   * @returns {number} - The PMF value
   */
  pmf(k, lambda) {
    if (k < 0 || !Number.isInteger(k)) {
      return 0;
    }

    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    const numerator = lambda ** k * Math.exp(-lambda);
    const denominator = utils.factorial(k);

    return numerator / denominator;
  },

  /**
   * Calculate the cumulative distribution function (CDF) of a Poisson distribution
   * @param {number} k - Number of events
   * @param {number} lambda - Average number of events in the interval
   * @returns {number} - The CDF value
   */
  cdf(k, lambda) {
    if (k < 0) {
      return 0;
    }

    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    let sum = 0;
    const kFloor = Math.floor(k);

    for (let i = 0; i <= kFloor; i++) {
      sum += this.pmf(i, lambda);
    }

    return sum;
  },

  /**
   * Calculate the mean of a Poisson distribution
   * @param {number} lambda - Average number of events in the interval
   * @returns {number} - The mean
   */
  mean(lambda) {
    return lambda;
  },

  /**
   * Calculate the variance of a Poisson distribution
   * @param {number} lambda - Average number of events in the interval
   * @returns {number} - The variance
   */
  variance(lambda) {
    return lambda;
  },

  /**
   * Generate a random sample from a Poisson distribution
   * @param {number} lambda - Average number of events in the interval
   * @returns {number} - A random sample
   */
  sample(lambda) {
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    // Knuth's algorithm
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= Math.random();
    } while (p > L);

    return k - 1;
  }
};

/**
 * Exponential distribution functions
 */
probability.exponential = {
  /**
   * Calculate the probability density function (PDF) of an exponential distribution
   * @param {number} x - The value to calculate the PDF at
   * @param {number} lambda - Rate parameter
   * @returns {number} - The PDF value
   */
  pdf(x, lambda) {
    if (x < 0) {
      return 0;
    }

    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    return lambda * Math.exp(-lambda * x);
  },

  /**
   * Calculate the cumulative distribution function (CDF) of an exponential distribution
   * @param {number} x - The value to calculate the CDF at
   * @param {number} lambda - Rate parameter
   * @returns {number} - The CDF value
   */
  cdf(x, lambda) {
    if (x < 0) {
      return 0;
    }

    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    return 1 - Math.exp(-lambda * x);
  },

  /**
   * Calculate the mean of an exponential distribution
   * @param {number} lambda - Rate parameter
   * @returns {number} - The mean
   */
  mean(lambda) {
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    return 1 / lambda;
  },

  /**
   * Calculate the variance of an exponential distribution
   * @param {number} lambda - Rate parameter
   * @returns {number} - The variance
   */
  variance(lambda) {
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    return 1 / (lambda * lambda);
  },

  /**
   * Generate a random sample from an exponential distribution
   * @param {number} lambda - Rate parameter
   * @returns {number} - A random sample
   */
  sample(lambda) {
    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    // Inverse transform sampling
    const u = Math.random();
    return -Math.log(1 - u) / lambda;
  },

  /**
   * Calculate the inverse CDF (quantile function) of an exponential distribution
   * @param {number} p - Probability value (between 0 and 1)
   * @param {number} lambda - Rate parameter
   * @returns {number} - The value x such that CDF(x) = p
   */
  inverse(p, lambda) {
    if (p < 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (lambda <= 0) {
      throw new Error('Lambda must be positive');
    }

    return -Math.log(1 - p) / lambda;
  }
};

/**
 * Uniform distribution functions
 */
probability.uniform = {
  /**
   * Calculate the probability density function (PDF) of a uniform distribution
   * @param {number} x - The value to calculate the PDF at
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - The PDF value
   */
  pdf(x, a, b) {
    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    if (x < a || x > b) {
      return 0;
    }

    return 1 / (b - a);
  },

  /**
   * Calculate the cumulative distribution function (CDF) of a uniform distribution
   * @param {number} x - The value to calculate the CDF at
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - The CDF value
   */
  cdf(x, a, b) {
    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    if (x < a) {
      return 0;
    }

    if (x > b) {
      return 1;
    }

    return (x - a) / (b - a);
  },

  /**
   * Calculate the mean of a uniform distribution
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - The mean
   */
  mean(a, b) {
    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    return (a + b) / 2;
  },

  /**
   * Calculate the variance of a uniform distribution
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - The variance
   */
  variance(a, b) {
    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    return (b - a) ** 2 / 12;
  },

  /**
   * Generate a random sample from a uniform distribution
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - A random sample
   */
  sample(a, b) {
    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    return a + Math.random() * (b - a);
  },

  /**
   * Calculate the inverse CDF (quantile function) of a uniform distribution
   * @param {number} p - Probability value (between 0 and 1)
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - The value x such that CDF(x) = p
   */
  inverse(p, a, b) {
    if (p < 0 || p > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (a >= b) {
      throw new Error('Upper bound must be greater than lower bound');
    }

    return a + p * (b - a);
  }
};

module.exports = probability;
