/**
 * Complex numbers module for herta.js
 */

const Complex = require('complex.js');

// Complex numbers module
const complex = {};

/**
 * Create a complex number
 * @param {number} real - The real part
 * @param {number} [imag=0] - The imaginary part
 * @returns {Complex} - The complex number
 */
complex.complex = function (real, imag = 0) {
  return new Complex(real, imag);
};

/**
 * Create a complex number from polar coordinates
 * @param {number} r - The magnitude (radius)
 * @param {number} phi - The phase angle in radians
 * @returns {Complex} - The complex number
 */
complex.fromPolar = function (r, phi) {
  return Complex.fromPolar(r, phi);
};

/**
 * Get the real part of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {number} - The real part
 */
complex.re = function (a) {
  return a instanceof Complex ? a.re : a;
};

/**
 * Get the imaginary part of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {number} - The imaginary part
 */
complex.im = function (a) {
  return a instanceof Complex ? a.im : 0;
};

/**
 * Get the magnitude (absolute value) of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {number} - The magnitude
 */
complex.abs = function (a) {
  return a instanceof Complex ? a.abs() : Math.abs(a);
};

/**
 * Get the argument (phase) of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {number} - The argument in radians
 */
complex.arg = function (a) {
  if (a instanceof Complex) {
    return a.arg();
  } if (a >= 0) {
    return 0;
  }
  return Math.PI;
};

/**
 * Get the conjugate of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The conjugate
 */
complex.conj = function (a) {
  return a instanceof Complex ? a.conjugate() : a;
};

/**
 * Add two complex numbers
 * @param {Complex|number} a - First complex number
 * @param {Complex|number} b - Second complex number
 * @returns {Complex|number} - Sum of the complex numbers
 */
complex.add = function (a, b) {
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.add(bComplex);
  }
  return a + b;
};

/**
 * Subtract two complex numbers
 * @param {Complex|number} a - First complex number
 * @param {Complex|number} b - Second complex number
 * @returns {Complex|number} - Difference of the complex numbers
 */
complex.subtract = function (a, b) {
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.sub(bComplex);
  }
  return a - b;
};

/**
 * Multiply two complex numbers
 * @param {Complex|number} a - First complex number
 * @param {Complex|number} b - Second complex number
 * @returns {Complex|number} - Product of the complex numbers
 */
complex.multiply = function (a, b) {
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.mul(bComplex);
  }
  return a * b;
};

/**
 * Divide two complex numbers
 * @param {Complex|number} a - First complex number (numerator)
 * @param {Complex|number} b - Second complex number (denominator)
 * @returns {Complex|number} - Quotient of the complex numbers
 */
complex.divide = function (a, b) {
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.div(bComplex);
  }
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
};

/**
 * Raise a complex number to a power
 * @param {Complex|number} a - The base
 * @param {Complex|number} b - The exponent
 * @returns {Complex|number} - The result of exponentiation
 */
complex.pow = function (a, b) {
  if (a instanceof Complex || b instanceof Complex) {
    const aComplex = a instanceof Complex ? a : new Complex(a);
    const bComplex = b instanceof Complex ? b : new Complex(b);
    return aComplex.pow(bComplex);
  }
  return a ** b;
};

/**
 * Calculate the square root of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The square root
 */
complex.sqrt = function (a) {
  if (a instanceof Complex) {
    return a.sqrt();
  } if (a >= 0) {
    return Math.sqrt(a);
  }
  return new Complex(0, Math.sqrt(-a));
};

/**
 * Calculate the exponential of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The exponential
 */
complex.exp = function (a) {
  if (a instanceof Complex) {
    return a.exp();
  }
  return Math.exp(a);
};

/**
 * Calculate the natural logarithm of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The natural logarithm
 */
complex.log = function (a) {
  if (a instanceof Complex) {
    return a.log();
  } if (a > 0) {
    return Math.log(a);
  } if (a === 0) {
    throw new Error('Logarithm of zero');
  } else {
    return new Complex(Math.log(-a), Math.PI);
  }
};

/**
 * Calculate the sine of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The sine
 */
complex.sin = function (a) {
  if (a instanceof Complex) {
    return a.sin();
  }
  return Math.sin(a);
};

/**
 * Calculate the cosine of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The cosine
 */
complex.cos = function (a) {
  if (a instanceof Complex) {
    return a.cos();
  }
  return Math.cos(a);
};

/**
 * Calculate the tangent of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The tangent
 */
complex.tan = function (a) {
  if (a instanceof Complex) {
    return a.tan();
  }
  return Math.tan(a);
};

/**
 * Calculate the hyperbolic sine of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The hyperbolic sine
 */
complex.sinh = function (a) {
  if (a instanceof Complex) {
    return a.sinh();
  }
  return Math.sinh(a);
};

/**
 * Calculate the hyperbolic cosine of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The hyperbolic cosine
 */
complex.cosh = function (a) {
  if (a instanceof Complex) {
    return a.cosh();
  }
  return Math.cosh(a);
};

/**
 * Calculate the hyperbolic tangent of a complex number
 * @param {Complex|number} a - The complex number
 * @returns {Complex|number} - The hyperbolic tangent
 */
complex.tanh = function (a) {
  if (a instanceof Complex) {
    return a.tanh();
  }
  return Math.tanh(a);
};

/**
 * Convert a complex number to a string
 * @param {Complex|number} a - The complex number
 * @returns {string} - String representation
 */
complex.toString = function (a) {
  if (a instanceof Complex) {
    return a.toString();
  }
  return a.toString();
};

/**
 * Check if a value is a complex number
 * @param {any} a - The value to check
 * @returns {boolean} - True if the value is a complex number
 */
complex.isComplex = function (a) {
  return a instanceof Complex;
};

/**
 * Create a complex number from a string
 * @param {string} str - The string representation
 * @returns {Complex} - The complex number
 */
complex.parse = function (str) {
  // Remove spaces
  str = str.replace(/\s/g, '');

  // Check for simple imaginary number notation
  if (str === 'i') {
    return new Complex(0, 1);
  }

  // Check for a+bi format
  const match = str.match(/^([-+]?\d*\.?\d*)(?:([-+])(?:(\d*\.?\d*))?i)?$/);
  if (match) {
    const real = match[1] ? parseFloat(match[1]) : 0;
    let imag = 0;

    if (match[2]) {
      if (match[3]) {
        imag = parseFloat(match[2] + match[3]);
      } else {
        imag = match[2] === '+' ? 1 : -1;
      }
    }

    return new Complex(real, imag);
  }

  throw new Error(`Cannot parse "${str}" as a complex number`);
};

module.exports = complex;
