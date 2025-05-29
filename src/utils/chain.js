/**
 * Chain utility module for herta.js
 * Provides a fluent interface for chaining operations
 */

// Chain module
const chain = {};

/**
 * Create a chain wrapper for a value
 * @param {any} value - The initial value
 * @param {Object} [math] - The math instance
 * @returns {Object} - Chain wrapper with methods
 */
chain.createChain = function (math) {
  /**
   * Create a new chain for a value
   * @param {any} value - The value to wrap in a chain
   * @returns {Object} - The chain object
   */
  return function (value) {
    // The chain object
    const obj = {
      // The current value in the chain
      value,

      /**
       * Finalize the chain and return the final value
       * @returns {any} - The final value
       */
      done() {
        return this.value;
      },

      /**
       * Get a string representation of the current value
       * @returns {string} - String representation
       */
      toString() {
        return math.toString(this.value);
      }
    };

    // Attach all applicable math functions as methods
    for (const name in math) {
      if (name === 'chain') continue; // Skip the chain function itself

      const func = math[name];
      if (typeof func === 'function') {
        // Create a chainable version of the function
        obj[name] = function () {
          // Convert arguments to an array
          const args = Array.prototype.slice.call(arguments);

          // Add the current value as the first argument
          args.unshift(this.value);

          // Apply the function and update the value
          this.value = func.apply(math, args);

          // Return the chain for further chaining
          return this;
        };
      }
    }

    // Add specific methods for common operations

    /**
     * Addition operation
     * @param {any} other - The value to add
     * @returns {Object} - The chain object
     */
    obj.add = function (other) {
      this.value = math.add(this.value, other);
      return this;
    };

    /**
     * Subtraction operation
     * @param {any} other - The value to subtract
     * @returns {Object} - The chain object
     */
    obj.subtract = function (other) {
      this.value = math.subtract(this.value, other);
      return this;
    };

    /**
     * Multiplication operation
     * @param {any} other - The value to multiply by
     * @returns {Object} - The chain object
     */
    obj.multiply = function (other) {
      this.value = math.multiply(this.value, other);
      return this;
    };

    /**
     * Division operation
     * @param {any} other - The value to divide by
     * @returns {Object} - The chain object
     */
    obj.divide = function (other) {
      this.value = math.divide(this.value, other);
      return this;
    };

    /**
     * Power operation
     * @param {any} other - The exponent
     * @returns {Object} - The chain object
     */
    obj.pow = function (other) {
      this.value = math.pow(this.value, other);
      return this;
    };

    /**
     * Square root operation
     * @returns {Object} - The chain object
     */
    obj.sqrt = function () {
      this.value = math.sqrt(this.value);
      return this;
    };

    /**
     * Absolute value operation
     * @returns {Object} - The chain object
     */
    obj.abs = function () {
      this.value = math.abs(this.value);
      return this;
    };

    /**
     * Round operation
     * @param {number} [decimals=0] - The number of decimal places
     * @returns {Object} - The chain object
     */
    obj.round = function (decimals = 0) {
      this.value = math.round(this.value, decimals);
      return this;
    };

    /**
     * Evaluate an expression using the current value
     * @param {string} expr - The expression to evaluate
     * @param {Object} [scope] - Additional variables for the scope
     * @returns {Object} - The chain object
     */
    obj.evaluate = function (expr, scope = {}) {
      // Add the current value to the scope with a default name 'x'
      const newScope = { x: this.value, ...scope };
      this.value = math.evaluate(expr, newScope);
      return this;
    };

    return obj;
  };
};

export default chain;
