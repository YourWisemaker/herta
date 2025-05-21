/**
 * random.js
 * Advanced random number generation for Herta.js
 */

/**
 * Generate a random integer within a specified range
 * @param {Number} min - Minimum value (inclusive)
 * @param {Number} max - Maximum value (inclusive)
 * @returns {Number} - Random integer between min and max
 */
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float within a specified range
 * @param {Number} min - Minimum value (inclusive)
 * @param {Number} max - Maximum value (exclusive)
 * @returns {Number} - Random float between min and max
 */
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random boolean with specified probability
 * @param {Number} probability - Probability of true (0-1)
 * @returns {Boolean} - Random boolean
 */
function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Generate a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} - Random item from the array
 */
function randomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Array must be non-empty');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a random string of specified length
 * @param {Number} length - Length of the string
 * @param {String} charset - Characters to use (default: alphanumeric)
 * @returns {String} - Random string
 */
function randomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate a random hexadecimal color
 * @returns {String} - Random hex color code
 */
function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Generate a random date between two dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} - Random date between start and end
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random normal (Gaussian) distributed number
 * @param {Number} mean - Mean of the distribution
 * @param {Number} stdDev - Standard deviation of the distribution
 * @returns {Number} - Random normal distributed number
 */
function randomNormal(mean = 0, stdDev = 1) {
  // Box-Muller transform
  const u1 = 1 - Math.random(); // Avoid 0
  const u2 = 1 - Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate a random exponential distributed number
 * @param {Number} lambda - Rate parameter
 * @returns {Number} - Random exponential distributed number
 */
function randomExponential(lambda = 1) {
  return -Math.log(1 - Math.random()) / lambda;
}

/**
 * Generate random numbers following Poisson distribution
 * @param {Number} lambda - Expected number of occurrences
 * @returns {Number} - Random Poisson distributed number
 */
function randomPoisson(lambda = 1) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
}

/**
 * Generate a UUID (v4)
 * @returns {String} - Random UUID
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a seeded random number generator
 * @param {Number} seed - Seed for the random number generator
 * @returns {Function} - Seeded random number generator
 */
function seededRandom(seed) {
  let s = seed;
  
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

module.exports = {
  randomInt,
  randomFloat,
  randomBoolean,
  randomItem,
  shuffle,
  randomString,
  randomColor,
  randomDate,
  randomNormal,
  randomExponential,
  randomPoisson,
  uuid,
  seededRandom
};
