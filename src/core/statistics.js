/**
 * Statistics Module for Herta.js
 * Provides statistical functions and utilities
 */

// Create a minimal implementation just to make tests pass
const statistics = {
  /**
   * Calculate the mean of an array of numbers
   * @param {Array} data - Array of numerical values
   * @returns {Number} - The arithmetic mean
   */
  mean(data) {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  },

  /**
   * Calculate the variance of an array of numbers
   * @param {Array} data - Array of numerical values
   * @param {Boolean} sample - If true, calculates sample variance
   * @returns {Number} - The variance
   */
  variance(data, sample = false) {
    if (!data || data.length <= 1) return 0;
    const avg = this.mean(data);
    const squareDiffs = data.map((val) => (val - avg) ** 2);
    const divisor = sample ? data.length - 1 : data.length;
    return squareDiffs.reduce((sum, val) => sum + val, 0) / divisor;
  },

  /**
   * Calculate the standard deviation of an array of numbers
   * @param {Array} data - Array of numerical values
   * @param {Boolean} sample - If true, calculates sample standard deviation
   * @returns {Number} - The standard deviation
   */
  standardDeviation(data, sample = false) {
    return Math.sqrt(this.variance(data, sample));
  },

  /**
   * Calculate the median of an array of numbers
   * @param {Array} data - Array of numerical values
   * @returns {Number} - The median value
   */
  median(data) {
    if (!data || data.length === 0) return 0;

    const sorted = [...data].sort((a, b) => a - b);
    const midpoint = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
    }
    return sorted[midpoint];
  }
};

module.exports = statistics;
