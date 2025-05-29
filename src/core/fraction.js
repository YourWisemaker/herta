/**
 * fraction.js
 * Advanced fraction operations for Herta.js
 */

/**
 * Greatest common divisor (GCD) of two numbers
 * @param {Number} a - First number
 * @param {Number} b - Second number
 * @returns {Number} - GCD of a and b
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

/**
 * Least common multiple (LCM) of two numbers
 * @param {Number} a - First number
 * @param {Number} b - Second number
 * @returns {Number} - LCM of a and b
 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Fraction class for representing and manipulating fractions
 */
export class Fraction {
  /**
   * Create a new fraction
   * @param {Number} numerator - Numerator of the fraction
   * @param {Number} denominator - Denominator of the fraction
   */
  constructor(numerator, denominator = 1) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }

    this.numerator = numerator;
    this.denominator = denominator;

    // Normalize sign (negative sign always goes in numerator)
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }

    this.simplify();
  }

  /**
   * Simplify the fraction by dividing both numerator and denominator by their GCD
   * @returns {Fraction} - Simplified fraction (this)
   */
  simplify() {
    const divisor = gcd(this.numerator, this.denominator);

    this.numerator /= divisor;
    this.denominator /= divisor;

    return this;
  }

  /**
   * Add another fraction to this fraction
   * @param {Fraction|Number} other - Fraction or number to add
   * @returns {Fraction} - New fraction representing the sum
   */
  add(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    const commonDenominator = lcm(this.denominator, other.denominator);
    const thisScaleFactor = commonDenominator / this.denominator;
    const otherScaleFactor = commonDenominator / other.denominator;

    const newNumerator = this.numerator * thisScaleFactor + other.numerator * otherScaleFactor;

    return new Fraction(newNumerator, commonDenominator);
  }

  /**
   * Subtract another fraction from this fraction
   * @param {Fraction|Number} other - Fraction or number to subtract
   * @returns {Fraction} - New fraction representing the difference
   */
  subtract(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    return this.add(new Fraction(-other.numerator, other.denominator));
  }

  /**
   * Multiply this fraction by another fraction
   * @param {Fraction|Number} other - Fraction or number to multiply by
   * @returns {Fraction} - New fraction representing the product
   */
  multiply(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  /**
   * Divide this fraction by another fraction
   * @param {Fraction|Number} other - Fraction or number to divide by
   * @returns {Fraction} - New fraction representing the quotient
   */
  divide(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    if (other.numerator === 0) {
      throw new Error('Division by zero');
    }

    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }

  /**
   * Raise this fraction to a power
   * @param {Number} exponent - Exponent to raise the fraction to
   * @returns {Fraction} - New fraction representing the power
   */
  pow(exponent) {
    if (!Number.isInteger(exponent)) {
      throw new Error('Exponent must be an integer for Fraction.pow');
    }

    if (exponent === 0) {
      return new Fraction(1, 1);
    } if (exponent < 0) {
      // Negative exponent means reciprocal
      return new Fraction(
        this.denominator ** -exponent,
        this.numerator ** -exponent
      );
    }
    return new Fraction(
      this.numerator ** exponent,
      this.denominator ** exponent
    );
  }

  /**
   * Get the absolute value of this fraction
   * @returns {Fraction} - New fraction representing the absolute value
   */
  abs() {
    return new Fraction(Math.abs(this.numerator), this.denominator);
  }

  /**
   * Get the reciprocal of this fraction
   * @returns {Fraction} - New fraction representing the reciprocal
   */
  reciprocal() {
    if (this.numerator === 0) {
      throw new Error('Cannot take reciprocal of zero');
    }

    return new Fraction(this.denominator, this.numerator);
  }

  /**
   * Check if this fraction is equal to another fraction
   * @param {Fraction|Number} other - Fraction or number to compare with
   * @returns {Boolean} - True if fractions are equal
   */
  equals(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    // Compare simplified versions
    const a = new Fraction(this.numerator, this.denominator);
    const b = new Fraction(other.numerator, other.denominator);

    return a.numerator === b.numerator && a.denominator === b.denominator;
  }

  /**
   * Check if this fraction is less than another fraction
   * @param {Fraction|Number} other - Fraction or number to compare with
   * @returns {Boolean} - True if this fraction is less than other
   */
  lessThan(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    return this.numerator * other.denominator < other.numerator * this.denominator;
  }

  /**
   * Check if this fraction is greater than another fraction
   * @param {Fraction|Number} other - Fraction or number to compare with
   * @returns {Boolean} - True if this fraction is greater than other
   */
  greaterThan(other) {
    if (typeof other === 'number') {
      other = new Fraction(other, 1);
    }

    return this.numerator * other.denominator > other.numerator * this.denominator;
  }

  /**
   * Convert this fraction to a decimal number
   * @returns {Number} - Decimal representation of the fraction
   */
  toDecimal() {
    return this.numerator / this.denominator;
  }

  /**
   * Convert this fraction to a string representation
   * @returns {String} - String representation of the fraction
   */
  toString() {
    if (this.denominator === 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Convert this fraction to a mixed number string representation
   * @returns {String} - Mixed number representation of the fraction
   */
  toMixedString() {
    if (Math.abs(this.numerator) < this.denominator || this.denominator === 1) {
      return this.toString();
    }
    const wholePart = Math.floor(Math.abs(this.numerator) / this.denominator);
    const remainder = Math.abs(this.numerator) % this.denominator;
    const sign = this.numerator < 0 ? '-' : '';

    if (remainder === 0) {
      return `${sign}${wholePart}`;
    }
    return `${sign}${wholePart} ${remainder}/${this.denominator}`;
  }

  /**
   * Create a fraction from a decimal number
   * @param {Number} decimal - Decimal number to convert
   * @param {Number} maxDenominator - Maximum denominator to use (default: 1000000)
   * @returns {Fraction} - Fraction approximating the decimal
   */
  static fromDecimal(decimal, maxDenominator = 1000000) {
    if (isNaN(decimal)) {
      throw new Error('Cannot create fraction from NaN');
    }

    if (!isFinite(decimal)) {
      throw new Error('Cannot create fraction from Infinity');
    }

    // Handle negative numbers
    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);

    // Handle integers
    if (Number.isInteger(decimal)) {
      return new Fraction(sign * decimal, 1);
    }

    // Best approximation algorithm
    let bestNumerator = 0;
    let bestDenominator = 1;
    let bestError = Math.abs(decimal);

    // Try simple fractions first with small denominators
    for (let denominator = 1; denominator <= 100; denominator++) {
      const numerator = Math.round(decimal * denominator);
      const error = Math.abs(decimal - numerator / denominator);

      if (error < bestError) {
        bestNumerator = numerator;
        bestDenominator = denominator;
        bestError = error;

        if (error < 1e-10) break;
      }
    }

    // For more precision, use continued fraction algorithm if needed
    if (bestError > 1e-6 && maxDenominator > 100) {
      // Continued fraction algorithm
      let x = decimal;
      let a = Math.floor(x);
      let h1 = 1; let
        h2 = a;
      let k1 = 0; let
        k2 = 1;

      while (k2 <= maxDenominator) {
        x = 1 / (x - a);
        a = Math.floor(x);

        const h3 = a * h2 + h1;
        const k3 = a * k2 + k1;

        if (k3 > maxDenominator) break;

        h1 = h2; h2 = h3;
        k1 = k2; k2 = k3;

        const error = Math.abs(decimal - h2 / k2);
        if (error < bestError) {
          bestNumerator = h2;
          bestDenominator = k2;
          bestError = error;
        }

        if (error < 1e-10) break;
      }
    }

    return new Fraction(sign * bestNumerator, bestDenominator);
  }

  /**
   * Create a fraction from a mixed number
   * @param {Number} whole - Whole part of the mixed number
   * @param {Number} numerator - Numerator of the fractional part
   * @param {Number} denominator - Denominator of the fractional part
   * @returns {Fraction} - Equivalent improper fraction
   */
  static fromMixed(whole, numerator, denominator) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }

    const sign = whole < 0 ? -1 : 1;
    whole = Math.abs(whole);

    const improperNumerator = whole * denominator + numerator;
    return new Fraction(sign * improperNumerator, denominator);
  }

  /**
   * Create a fraction from a string representation
   * @param {String} str - String representation of a fraction (e.g., "3/4", "5", "2 1/2")
   * @returns {Fraction} - Parsed fraction
   */
  static fromString(str) {
    str = str.trim();

    // Mixed number (e.g., "2 1/2")
    const mixedMatch = str.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1], 10);
      const numerator = parseInt(mixedMatch[2], 10);
      const denominator = parseInt(mixedMatch[3], 10);
      return Fraction.fromMixed(whole, numerator, denominator);
    }

    // Simple fraction (e.g., "3/4")
    const fractionMatch = str.match(/^(-?\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1], 10);
      const denominator = parseInt(fractionMatch[2], 10);
      return new Fraction(numerator, denominator);
    }

    // Integer (e.g., "5")
    const integerMatch = str.match(/^(-?\d+)$/);
    if (integerMatch) {
      const numerator = parseInt(integerMatch[1], 10);
      return new Fraction(numerator, 1);
    }

    throw new Error(`Invalid fraction string: ${str}`);
  }
}
