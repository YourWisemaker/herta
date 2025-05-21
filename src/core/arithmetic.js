/**
 * Core arithmetic operations for herta.js
 */

const Decimal = require('decimal.js');
const Complex = require('complex.js');

// Configure decimal precision
Decimal.set({ precision: 64 });

// Basic arithmetic operations
const arithmetic = {};

/**
 * Addition of two or more values
 * @param {...(number|Complex|Array)} args - Values to add
 * @returns {number|Complex|Array} - Sum of the values
 */
arithmetic.add = function (a, b) {
  // Handle array inputs (matrices)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      throw new Error('Dimensions mismatch in addition');
    }

    return a.map((val, i) => {
      if (Array.isArray(val) && Array.isArray(b[i])) {
        return arithmetic.add(val, b[i]);
      }
      return arithmetic.add(val, b[i]);
    });
  }

  // Handle complex numbers
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.add(bComplex);
  }

  // Handle regular numbers with high precision
  return new Decimal(a).plus(new Decimal(b)).toNumber();
};

/**
 * Subtraction of two values
 * @param {number|Complex|Array} a - First value
 * @param {number|Complex|Array} b - Second value to subtract from first
 * @returns {number|Complex|Array} - Difference of the values
 */
arithmetic.subtract = function (a, b) {
  // Handle array inputs (matrices)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      throw new Error('Dimensions mismatch in subtraction');
    }

    return a.map((val, i) => {
      if (Array.isArray(val) && Array.isArray(b[i])) {
        return arithmetic.subtract(val, b[i]);
      }
      return arithmetic.subtract(val, b[i]);
    });
  }

  // Handle complex numbers
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.sub(bComplex);
  }

  // Handle regular numbers with high precision
  return new Decimal(a).minus(new Decimal(b)).toNumber();
};

/**
 * Multiplication of two or more values
 * @param {...(number|Complex|Array)} args - Values to multiply
 * @returns {number|Complex|Array} - Product of the values
 */
arithmetic.multiply = function (a, b) {
  // Handle array inputs (matrices)
  if (Array.isArray(a) && Array.isArray(b)) {
    // Matrix multiplication
    if (Array.isArray(a[0]) && Array.isArray(b[0])) {
      // Check if dimensions are compatible for matrix multiplication
      const aRows = a.length;
      const aCols = a[0].length;
      const bRows = b.length;
      const bCols = b[0].length;

      if (aCols !== bRows) {
        throw new Error('Dimensions mismatch in matrix multiplication');
      }

      // Perform matrix multiplication
      const result = new Array(aRows);
      for (let i = 0; i < aRows; i++) {
        result[i] = new Array(bCols);
        for (let j = 0; j < bCols; j++) {
          result[i][j] = 0;
          for (let k = 0; k < aCols; k++) {
            result[i][j] = arithmetic.add(result[i][j], arithmetic.multiply(a[i][k], b[k][j]));
          }
        }
      }
      return result;
    }
    // Element-wise multiplication for vectors
    if (a.length !== b.length) {
      throw new Error('Dimensions mismatch in element-wise multiplication');
    }

    return a.map((val, i) => arithmetic.multiply(val, b[i]));
  }

  // Handle complex numbers
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.mul(bComplex);
  }

  // Handle regular numbers with high precision
  return new Decimal(a).times(new Decimal(b)).toNumber();
};

/**
 * Division of two values
 * @param {number|Complex|Array} a - Numerator
 * @param {number|Complex|Array} b - Denominator
 * @returns {number|Complex|Array} - Quotient of the values
 */
arithmetic.divide = function (a, b) {
  // Handle array inputs (element-wise division for matrices)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      throw new Error('Dimensions mismatch in division');
    }

    return a.map((val, i) => {
      if (Array.isArray(val) && Array.isArray(b[i])) {
        return arithmetic.divide(val, b[i]);
      }
      return arithmetic.divide(val, b[i]);
    });
  }

  // Handle complex numbers
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.div(bComplex);
  }

  // Check for division by zero
  if (b === 0) {
    throw new Error('Division by zero');
  }

  // Handle regular numbers with high precision
  return new Decimal(a).div(new Decimal(b)).toNumber();
};

/**
 * Power function
 * @param {number|Complex|Array} base - The base
 * @param {number|Complex} exponent - The exponent
 * @returns {number|Complex|Array} - The base raised to the power of the exponent
 */
arithmetic.pow = function (base, exponent) {
  // Handle matrix power
  if (Array.isArray(base)) {
    // For matrix exponentiation with integer powers
    if (Number.isInteger(exponent) && exponent >= 0) {
      // Check if it's a square matrix
      const rows = base.length;
      if (!base.every((row) => Array.isArray(row) && row.length === rows)) {
        throw new Error('Matrix must be square for power operation');
      }

      // Identity matrix for the base case
      let result = Array(rows).fill().map((_, i) => Array(rows).fill().map((_, j) => (i === j ? 1 : 0)));

      // Compute matrix power using exponentiation by squaring
      let power = base;
      let n = exponent;

      while (n > 0) {
        if (n % 2 === 1) {
          result = arithmetic.multiply(result, power);
        }
        power = arithmetic.multiply(power, power);
        n = Math.floor(n / 2);
      }

      return result;
    }
    throw new Error('Matrix exponentiation only supports non-negative integer exponents');
  }

  // Handle complex numbers
  if (base instanceof Complex || exponent instanceof Complex) {
    const baseComplex = base instanceof Complex ? base : new Complex(base);
    const expComplex = exponent instanceof Complex ? exponent : new Complex(exponent);
    return baseComplex.pow(expComplex);
  }

  // Handle negative base with integer exponent
  if (base < 0 && Number.isInteger(exponent)) {
    return exponent % 2 === 0 ? (-base) ** exponent : -((-base) ** exponent);
  }

  // Handle negative base with non-integer exponent (results in complex number)
  if (base < 0 && !Number.isInteger(exponent)) {
    return new Complex(base).pow(exponent);
  }

  // Handle regular numbers with high precision
  return new Decimal(base).pow(new Decimal(exponent)).toNumber();
};

/**
 * Square root function
 * @param {number|Complex} value - The value to compute the square root of
 * @returns {number|Complex} - The square root of the value
 */
arithmetic.sqrt = function (value) {
  // Handle complex numbers
  if (value instanceof Complex) {
    return value.sqrt();
  }

  // Handle negative numbers (return complex result)
  if (value < 0) {
    return new Complex(0, Math.sqrt(-value));
  }

  // Handle regular numbers with high precision
  return new Decimal(value).sqrt().toNumber();
};

/**
 * Absolute value function
 * @param {number|Complex|Array} value - The value to compute the absolute value of
 * @returns {number|Array} - The absolute value
 */
arithmetic.abs = function (value) {
  // Handle array inputs
  if (Array.isArray(value)) {
    return value.map((val) => arithmetic.abs(val));
  }

  // Handle complex numbers
  if (value instanceof Complex) {
    return value.abs();
  }

  // Handle regular numbers with high precision
  return new Decimal(value).abs().toNumber();
};

/**
 * Round a value to a specified number of decimal places
 * @param {number|Complex|Array} value - The value to round
 * @param {number} [decimals=0] - The number of decimal places
 * @returns {number|Complex|Array} - The rounded value
 */
arithmetic.round = function (value, decimals = 0) {
  // Handle array inputs
  if (Array.isArray(value)) {
    return value.map((val) => arithmetic.round(val, decimals));
  }

  // Handle complex numbers
  if (value instanceof Complex) {
    return new Complex(
      arithmetic.round(value.re, decimals),
      arithmetic.round(value.im, decimals)
    );
  }

  // Handle regular numbers with high precision
  const factor = new Decimal(10).pow(decimals);
  return new Decimal(value).times(factor).round().div(factor)
    .toNumber();
};

/**
 * Floor function
 * @param {number|Complex|Array} value - The value to floor
 * @returns {number|Complex|Array} - The floored value
 */
arithmetic.floor = function (value) {
  // Handle array inputs
  if (Array.isArray(value)) {
    return value.map((val) => arithmetic.floor(val));
  }

  // Handle complex numbers
  if (value instanceof Complex) {
    return new Complex(
      Math.floor(value.re),
      Math.floor(value.im)
    );
  }

  // Handle regular numbers with high precision
  return new Decimal(value).floor().toNumber();
};

/**
 * Ceiling function
 * @param {number|Complex|Array} value - The value to ceil
 * @returns {number|Complex|Array} - The ceiled value
 */
arithmetic.ceil = function (value) {
  // Handle array inputs
  if (Array.isArray(value)) {
    return value.map((val) => arithmetic.ceil(val));
  }

  // Handle complex numbers
  if (value instanceof Complex) {
    return new Complex(
      Math.ceil(value.re),
      Math.ceil(value.im)
    );
  }

  // Handle regular numbers with high precision
  return new Decimal(value).ceil().toNumber();
};

/**
 * Modulo operation
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @returns {number} - Remainder of the division
 */
arithmetic.mod = function (a, b) {
  // Check for division by zero
  if (b === 0) {
    throw new Error('Division by zero in modulo operation');
  }

  // Handle regular numbers with high precision
  return new Decimal(a).mod(new Decimal(b)).toNumber();
};

/**
 * Logarithm with specified base
 * @param {number|Complex} value - The value to compute the logarithm of
 * @param {number} [base=Math.E] - The base of the logarithm
 * @returns {number|Complex} - The logarithm value
 */
arithmetic.log = function (value, base = Math.E) {
  // Handle complex numbers
  if (value instanceof Complex) {
    const logValue = value.log();
    if (base === Math.E) {
      return logValue;
    }
    const logBase = Math.log(base);
    return new Complex(logValue.re / logBase, logValue.im / logBase);
  }

  // Handle negative or zero values (return complex result)
  if (value <= 0) {
    return arithmetic.log(new Complex(value), base);
  }

  // Handle regular numbers with high precision
  if (base === Math.E) {
    return new Decimal(value).ln().toNumber();
  }
  return new Decimal(value).log(base).toNumber();
};

/**
 * Natural logarithm
 * @param {number|Complex} value - The value to compute the natural logarithm of
 * @returns {number|Complex} - The natural logarithm value
 */
arithmetic.ln = function (value) {
  return arithmetic.log(value, Math.E);
};

/**
 * Base-10 logarithm
 * @param {number|Complex} value - The value to compute the base-10 logarithm of
 * @returns {number|Complex} - The base-10 logarithm value
 */
arithmetic.log10 = function (value) {
  return arithmetic.log(value, 10);
};

/**
 * Base-2 logarithm
 * @param {number|Complex} value - The value to compute the base-2 logarithm of
 * @returns {number|Complex} - The base-2 logarithm value
 */
arithmetic.log2 = function (value) {
  return arithmetic.log(value, 2);
};

/**
 * Exponential function (e^x)
 * @param {number|Complex} value - The exponent
 * @returns {number|Complex} - The exponential value
 */
arithmetic.exp = function (value) {
  // Handle complex numbers
  if (value instanceof Complex) {
    return value.exp();
  }

  // Handle regular numbers with high precision
  return new Decimal(value).exp().toNumber();
};

/**
 * Factorial function
 * @param {number} n - The non-negative integer
 * @returns {number} - The factorial of n
 */
arithmetic.factorial = function (n) {
  // Check if n is a non-negative integer
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial is only defined for non-negative integers');
  }

  // Base case
  if (n === 0 || n === 1) {
    return 1;
  }

  // Compute factorial with high precision
  let result = new Decimal(1);
  for (let i = 2; i <= n; i++) {
    result = result.times(i);
  }

  return result.toNumber();
};

/**
 * Greatest common divisor of two integers
 * @param {number} a - First integer
 * @param {number} b - Second integer
 * @returns {number} - The greatest common divisor
 */
arithmetic.gcd = function (a, b) {
  // Ensure inputs are integers
  a = Math.round(a);
  b = Math.round(b);

  // Euclidean algorithm
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return Math.abs(a);
};

/**
 * Least common multiple of two integers
 * @param {number} a - First integer
 * @param {number} b - Second integer
 * @returns {number} - The least common multiple
 */
arithmetic.lcm = function (a, b) {
  // Ensure inputs are integers
  a = Math.round(a);
  b = Math.round(b);

  // LCM formula: |a*b| / gcd(a,b)
  return Math.abs(a * b) / arithmetic.gcd(a, b);
};

module.exports = arithmetic;
