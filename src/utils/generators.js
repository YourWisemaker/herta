/**
 * generators.js
 * Mathematical sequence generators for Herta.js
 */

/**
 * Generate Fibonacci sequence up to n terms
 * @param {Number} n - Number of terms to generate
 * @returns {Array} - Array of Fibonacci numbers
 */
export function fibonacci(n) {
  const result = [0, 1];

  if (n <= 0) return [];
  if (n === 1) return [0];

  for (let i = 2; i < n; i++) {
    result.push(result[i - 1] + result[i - 2]);
  }

  return result;
}

/**
 * Generate prime numbers up to n
 * @param {Number} n - Upper limit
 * @returns {Array} - Array of prime numbers up to n
 */
export function primes(n) {
  // Sieve of Eratosthenes
  const sieve = Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false;
      }
    }
  }

  const result = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i]) result.push(i);
  }

  return result;
}

/**
 * Generate arithmetic sequence
 * @param {Number} start - First term
 * @param {Number} difference - Common difference
 * @param {Number} n - Number of terms
 * @returns {Array} - Arithmetic sequence
 */
export function arithmeticSequence(start, difference, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(start + i * difference);
  }

  return result;
}

/**
 * Generate geometric sequence
 * @param {Number} start - First term
 * @param {Number} ratio - Common ratio
 * @param {Number} n - Number of terms
 * @returns {Array} - Geometric sequence
 */
export function geometricSequence(start, ratio, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(start * ratio ** i);
  }

  return result;
}

/**
 * Generate triangular numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of triangular numbers
 */
export function triangularNumbers(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    result.push((i * (i + 1)) / 2);
  }

  return result;
}

/**
 * Generate square numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of square numbers
 */
export function squareNumbers(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    result.push(i * i);
  }

  return result;
}

/**
 * Generate cubic numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of cubic numbers
 */
export function cubicNumbers(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    result.push(i * i * i);
  }

  return result;
}

/**
 * Generate tetrahedral numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of tetrahedral numbers
 */
export function tetrahedralNumbers(n) {
  const result = [];

  for (let i = 1; i <= n; i++) {
    result.push((i * (i + 1) * (i + 2)) / 6);
  }

  return result;
}

/**
 * Generate Pascal's triangle up to n rows
 * @param {Number} n - Number of rows
 * @returns {Array} - 2D array representing Pascal's triangle
 */
export function pascalsTriangle(n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j <= i; j++) {
      if (j === 0 || j === i) {
        row.push(1);
      } else {
        row.push(result[i - 1][j - 1] + result[i - 1][j]);
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Generate Catalan numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of Catalan numbers
 */
export function catalanNumbers(n) {
  const result = [1];

  for (let i = 1; i < n; i++) {
    result.push(result[i - 1] * (4 * i - 2) / (i + 1));
  }

  return result;
}

/**
 * Generate Bell numbers (number of partitions of a set)
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of Bell numbers
 */
export function bellNumbers(n) {
  if (n <= 0) return [];
  if (n === 1) return [1];

  const result = [1];

  for (let i = 1; i < n; i++) {
    let next = 0;
    for (let j = 0; j < i; j++) {
      const binomial = binomialCoefficient(i - 1, j);
      next += binomial * result[j];
    }
    result.push(next);
  }

  return result;
}

/**
 * Calculate binomial coefficient C(n,k)
 * @param {Number} n - Total number of items
 * @param {Number} k - Number of items to choose
 * @returns {Number} - Binomial coefficient
 */
export function binomialCoefficient(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - (k - i));
    result /= i;
  }

  return result;
}

/**
 * Generate Bernoulli numbers
 * @param {Number} n - Number of terms
 * @returns {Array} - Array of Bernoulli numbers
 */
export function bernoulliNumbers(n) {
  if (n <= 0) return [];

  const result = [1];

  for (let m = 1; m < n; m++) {
    let sum = 0;
    for (let k = 0; k < m; k++) {
      sum += binomialCoefficient(m, k) * result[k] / (m - k + 1);
    }
    result.push(-sum);
  }

  // Set B1 to -0.5 (special case)
  if (n > 1) result[1] = -0.5;

  return result;
}

/**
 * Generate collatz sequence starting from n
 * @param {Number} n - Starting number
 * @returns {Array} - Collatz sequence
 */
export function collatzSequence(n) {
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error('Starting number must be a positive integer');
  }

  const result = [n];
  let current = n;

  while (current !== 1) {
    if (current % 2 === 0) {
      current /= 2;
    } else {
      current = 3 * current + 1;
    }
    result.push(current);
  }

  return result;
}

/**
 * Generate look-and-say sequence
 * @param {Number} n - Number of terms
 * @param {Number} start - Starting term (default: 1)
 * @returns {Array} - Look-and-say sequence
 */
function lookAndSaySequence(n, start = 1) {
  const result = [start.toString()];

  for (let i = 1; i < n; i++) {
    const previous = result[i - 1];
    let current = '';
    let count = 1;

    for (let j = 0; j < previous.length; j++) {
      if (j + 1 < previous.length && previous[j] === previous[j + 1]) {
        count++;
      } else {
        current += count + previous[j];
        count = 1;
      }
    }

    result.push(current);
  }

  return result;
}

module.exports = {
  fibonacci,
  primes,
  arithmeticSequence,
  geometricSequence,
  triangularNumbers,
  squareNumbers,
  cubicNumbers,
  tetrahedralNumbers,
  pascalsTriangle,
  catalanNumbers,
  bellNumbers,
  bernoulliNumbers,
  collatzSequence,
  lookAndSaySequence,
  binomialCoefficient
};
