/**
 * Complex Analysis Module for herta.js
 * Provides tools for working with complex functions, contour integrals, and conformal mappings
 */

/**
 * Represents a complex number with real and imaginary parts
 * @param {number} real - Real part
 * @param {number} imag - Imaginary part
 * @returns {Object} - Complex number object
 */
export function complex(real, imag = 0) {
  return {
    re: real,
    im: imag,

    /**
         * Get the modulus (absolute value) of the complex number
         * @returns {number} - Modulus
         */
    modulus() {
      return Math.sqrt(this.re * this.re + this.im * this.im);
    },

    /**
         * Get the argument (phase) of the complex number
         * @returns {number} - Argument in radians
         */
    argument() {
      return Math.atan2(this.im, this.re);
    },

    /**
         * Get the complex conjugate
         * @returns {Object} - Complex conjugate
         */
    conjugate() {
      return complex(this.re, -this.im);
    },

    /**
         * Add another complex number
         * @param {Object} other - Complex number to add
         * @returns {Object} - Result of addition
         */
    add(other) {
      return complex(this.re + other.re, this.im + other.im);
    },

    /**
         * Subtract another complex number
         * @param {Object} other - Complex number to subtract
         * @returns {Object} - Result of subtraction
         */
    subtract(other) {
      return complex(this.re - other.re, this.im - other.im);
    },

    /**
         * Multiply by another complex number
         * @param {Object} other - Complex number to multiply by
         * @returns {Object} - Result of multiplication
         */
    multiply(other) {
      return complex(
        this.re * other.re - this.im * other.im,
        this.re * other.im + this.im * other.re
      );
    },

    /**
         * Divide by another complex number
         * @param {Object} other - Complex number to divide by
         * @returns {Object} - Result of division
         */
    divide(other) {
      const denominator = other.re * other.re + other.im * other.im;
      return complex(
        (this.re * other.re + this.im * other.im) / denominator,
        (this.im * other.re - this.re * other.im) / denominator
      );
    },

    /**
         * Raise to a power
         * @param {number} n - Power to raise to
         * @returns {Object} - Result of exponentiation
         */
    pow(n) {
      if (n === 0) return complex(1, 0);

      const r = this.modulus();
      const theta = this.argument();
      const newR = r ** n;
      const newTheta = theta * n;

      return complex(
        newR * Math.cos(newTheta),
        newR * Math.sin(newTheta)
      );
    },

    /**
         * Get the complex exponential
         * @returns {Object} - Result of e^z
         */
    exp() {
      const expReal = Math.exp(this.re);
      return complex(
        expReal * Math.cos(this.im),
        expReal * Math.sin(this.im)
      );
    },

    /**
         * Get the complex logarithm (principal value)
         * @returns {Object} - Result of log(z)
         */
    log() {
      return complex(
        Math.log(this.modulus()),
        this.argument()
      );
    },

    /**
         * Get the complex sine
         * @returns {Object} - Result of sin(z)
         */
    sin() {
      return complex(
        Math.sin(this.re) * Math.cosh(this.im),
        Math.cos(this.re) * Math.sinh(this.im)
      );
    },

    /**
         * Get the complex cosine
         * @returns {Object} - Result of cos(z)
         */
    cos() {
      return complex(
        Math.cos(this.re) * Math.cosh(this.im),
        -Math.sin(this.re) * Math.sinh(this.im)
      );
    },

    /**
         * Get the complex tangent
         * @returns {Object} - Result of tan(z)
         */
    tan() {
      return this.sin().divide(this.cos());
    },

    /**
         * String representation
         * @returns {string} - String form of complex number
         */
    toString() {
      if (this.im === 0) return `${this.re}`;
      if (this.re === 0) return `${this.im}i`;
      if (this.im < 0) return `${this.re} - ${-this.im}i`;
      return `${this.re} + ${this.im}i`;
    }
  };
}

/**
 * Creates a complex function from real and imaginary component functions
 * @param {Function} realPart - Function computing the real part
 * @param {Function} imagPart - Function computing the imaginary part
 * @returns {Function} - Complex function
 */
export function complexFunction(realPart, imagPart) {
  return function (z) {
    if (typeof z === 'number') {
      z = complex(z, 0);
    }
    return complex(realPart(z.re, z.im), imagPart(z.re, z.im));
  };
}

/**
 * Check if a complex function is analytic (using Cauchy-Riemann equations)
 * @param {Function} f - Complex function to check
 * @param {Object} z - Complex point to check at
 * @param {number} epsilon - Tolerance for derivative approximation
 * @returns {boolean} - True if function appears to be analytic at the point
 */
export function isAnalytic(f, z, epsilon = 1e-8) {
  // Compute partial derivatives at point
  const h = epsilon;

  // f(z) = u(x,y) + iv(x,y)
  const f_z = f(z);

  // f(z+h)
  const f_z_plus_h = f(complex(z.re + h, z.im));

  // f(z+ih)
  const f_z_plus_ih = f(complex(z.re, z.im + h));

  // Approximate partial derivatives
  const du_dx = (f_z_plus_h.re - f_z.re) / h;
  const du_dy = (f_z_plus_ih.re - f_z.re) / h;
  const dv_dx = (f_z_plus_h.im - f_z.im) / h;
  const dv_dy = (f_z_plus_ih.im - f_z.im) / h;

  // Check Cauchy-Riemann equations
  return Math.abs(du_dx - dv_dy) < epsilon && Math.abs(du_dy + dv_dx) < epsilon;
}

/**
 * Compute the complex derivative of a function at a point
 * @param {Function} f - Complex function
 * @param {Object} z - Complex point
 * @param {number} h - Step size for approximation
 * @returns {Object} - Complex derivative f'(z)
 */
export function derivative(f, z, h = 1e-6) {
  const f_z = f(z);
  const f_z_plus_h = f(complex(z.re + h, z.im));

  return complex(
    (f_z_plus_h.re - f_z.re) / h,
    (f_z_plus_h.im - f_z.im) / h
  );
}

/**
 * Compute the zeros of a complex polynomial
 * @param {Array<Object>} coefficients - Array of complex coefficients [a_n, a_{n-1}, ..., a_1, a_0]
 * @returns {Array<Object>} - Array of complex zeros
 */
export function findPolynomialZeros(coefficients) {
  // For now, we'll implement a simple case for linear and quadratic polynomials
  if (coefficients.length === 2) {
    // Linear case: a*z + b = 0
    const a = coefficients[0];
    const b = coefficients[1];
    return [complex(-b.re / a.re, -b.im / a.re)];
  }

  if (coefficients.length === 3) {
    // Quadratic case: a*z^2 + b*z + c = 0
    const a = coefficients[0];
    const b = coefficients[1];
    const c = coefficients[2];

    // Calculate discriminant
    const discriminant = b.multiply(b).subtract(a.multiply(c).multiply(complex(4, 0)));
    const sqrtDisc = complex(Math.sqrt(discriminant.modulus()), 0);

    // Apply quadratic formula
    const negB = complex(-b.re, -b.im);
    const twoA = complex(2 * a.re, 2 * a.im);

    const root1 = negB.add(sqrtDisc).divide(twoA);
    const root2 = negB.subtract(sqrtDisc).divide(twoA);

    return [root1, root2];
  }

  // For higher-degree polynomials, we'd need to implement numerical methods
  // like Durand-Kerner, but this is beyond the scope of this simple implementation
  throw new Error('Finding zeros of polynomials higher than quadratic is not implemented yet');
}

/**
 * Compute a contour integral of a complex function
 * @param {Function} f - Complex function to integrate
 * @param {Array<Object>} contour - Array of complex points defining the contour
 * @returns {Object} - Result of the contour integral
 */
export function contourIntegral(f, contour) {
  let result = complex(0, 0);

  for (let i = 0; i < contour.length - 1; i++) {
    const z1 = contour[i];
    const z2 = contour[i + 1];

    // Line segment from z1 to z2
    const dz = z2.subtract(z1);

    // Midpoint rule for each segment
    const midpoint = z1.add(z2).multiply(complex(0.5, 0));
    const f_mid = f(midpoint);

    // Accumulate contribution from this segment
    result = result.add(f_mid.multiply(dz));
  }

  return result;
}

/**
 * Compute the residue of a complex function at a pole
 * @param {Function} f - Complex function
 * @param {Object} pole - Complex pole location
 * @param {number} order - Order of the pole
 * @returns {Object} - Complex residue
 */
export function residue(f, pole, order = 1) {
  if (order === 1) {
    // Simple pole: evaluate lim_{z→pole} (z-pole)*f(z)
    const h = 1e-6;
    const z = complex(pole.re + h, pole.im);
    const z_minus_pole = z.subtract(pole);
    return z_minus_pole.multiply(f(z));
  }

  // For higher-order poles, we'd need to implement more advanced methods
  // but this is a simplification for educational purposes
  throw new Error('Finding residues of poles with order > 1 is not implemented yet');
}

/**
 * Compute Laurent series coefficients for a complex function
 * @param {Function} f - Complex function
 * @param {Object} center - Center of Laurent series
 * @param {number} radius - Radius for contour integration
 * @param {number} nTerms - Number of terms to compute
 * @returns {Object} - Object with positive and negative index coefficients
 */
export function laurentSeries(f, center, radius, nTerms = 5) {
  const coefficients = {
    // Positive indices (analytic part)
    positive: [],
    // Negative indices (principal part)
    negative: []
  };

  // Generate points on a circle
  const numPoints = 100;
  const circle = [];
  for (let i = 0; i < numPoints; i++) {
    const theta = 2 * Math.PI * i / numPoints;
    circle.push(complex(
      center.re + radius * Math.cos(theta),
      center.im + radius * Math.sin(theta)
    ));
  }
  circle.push(circle[0]); // Close the contour

  // Compute coefficients using contour integration
  for (let n = -nTerms; n <= nTerms; n++) {
    // Integrand for nth coefficient
    const integrand = function (z) {
      const z_minus_center = z.subtract(center);
      const denominator = z_minus_center.pow(n + 1);
      return f(z).divide(denominator);
    };

    const result = contourIntegral(integrand, circle);
    const coefficient = result.divide(complex(2 * Math.PI * 1, 0)); // 2πi

    if (n < 0) {
      coefficients.negative[-n] = coefficient;
    } else {
      coefficients.positive[n] = coefficient;
    }
  }

  return coefficients;
}

/**
 * Create a conformal mapping between two domains
 * @param {Function} mapping - Complex function representing the mapping
 * @returns {Object} - Conformal mapping object with direct and inverse functions
 */
export function conformalMapping(mapping, inverse = null) {
  // Validate that mapping is analytic at a sample point
  const testPoint = complex(1, 1);
  if (!isAnalytic(mapping, testPoint)) {
    console.warn('Provided mapping may not be conformal (not analytic at test point)');
  }

  return {
    map: mapping,
    inverse,

    /**
         * Map a contour from domain to range
         * @param {Array<Object>} contour - Array of complex points
         * @returns {Array<Object>} - Mapped contour
         */
    mapContour(contour) {
      return contour.map((z) => this.map(z));
    },

    /**
         * Map a contour from range back to domain (if inverse is provided)
         * @param {Array<Object>} contour - Array of complex points
         * @returns {Array<Object>} - Mapped contour
         */
    inverseMapContour(contour) {
      if (!this.inverse) {
        throw new Error('Inverse mapping is not provided');
      }
      return contour.map((z) => this.inverse(z));
    }
  };
}

/**
 * Common conformal mappings
 */
export const conformalMappings = {
  /**
     * Möbius transformation with parameters a, b, c, d (where ad-bc ≠ 0)
     * Maps z → (az+b)/(cz+d)
     */
  mobius(a, b, c, d) {
    // Check that ad-bc ≠ 0
    const determinant = (a.re * d.re - a.im * d.im) - (b.re * c.re - b.im * c.im);
    if (Math.abs(determinant) < 1e-10) {
      throw new Error('Invalid Möbius transformation: ad-bc must not be zero');
    }

    const mapping = function (z) {
      const numerator = a.multiply(z).add(b);
      const denominator = c.multiply(z).add(d);
      return numerator.divide(denominator);
    };

    const inverse = function (w) {
      // Inverse Möbius transformation: (dw-b)/(-cw+a)
      const numerator = d.multiply(w).subtract(b);
      const denominator = a.subtract(c.multiply(w));
      return numerator.divide(denominator);
    };

    return conformalMapping(mapping, inverse);
  },

  /**
     * Exponential mapping: z → e^z
     */
  exponential() {
    const mapping = function (z) {
      return z.exp();
    };

    const inverse = function (w) {
      return w.log();
    };

    return conformalMapping(mapping, inverse);
  },

  /**
     * Logarithmic mapping: z → log(z)
     */
  logarithmic() {
    const mapping = function (z) {
      return z.log();
    };

    const inverse = function (w) {
      return w.exp();
    };

    return conformalMapping(mapping, inverse);
  },

  /**
     * Power mapping: z → z^n
     */
  power(n) {
    const mapping = function (z) {
      return z.pow(n);
    };

    let inverse = null;
    // Only provide inverse for integer powers
    if (Number.isInteger(n) && n !== 0) {
      inverse = function (w) {
        return w.pow(1 / n);
      };
    }

    return conformalMapping(mapping, inverse);
  },

  /**
     * Joukowski mapping: z → z + 1/z
     * Maps unit circle to line segment [-2, 2]
     */
  joukowski() {
    const mapping = function (z) {
      return z.add(complex(1, 0).divide(z));
    };

    // No simple inverse for Joukowski mapping
    return conformalMapping(mapping);
  }
};

/**
 * Compute the complex potential flow around a cylinder
 * @param {number} velocity - Uniform flow velocity
 * @param {number} radius - Cylinder radius
 * @returns {Function} - Complex potential function
 */
export function potentialFlowAroundCylinder(velocity, radius) {
  return function (z) {
    const r2 = radius * radius;
    const term1 = complex(velocity * z.re, velocity * z.im);
    const term2 = complex(
      velocity * r2 * z.re / (z.re * z.re + z.im * z.im),
      -velocity * r2 * z.im / (z.re * z.re + z.im * z.im)
    );
    return term1.subtract(term2);
  };
}

/**
 * Compute the image of a rectangular grid under a conformal mapping
 * @param {Function} mapping - Complex function
 * @param {number} xMin - Minimum x value
 * @param {number} xMax - Maximum x value
 * @param {number} yMin - Minimum y value
 * @param {number} yMax - Maximum y value
 * @param {number} xSteps - Number of x steps
 * @param {number} ySteps - Number of y steps
 * @returns {Object} - Grid lines in original and mapped domains
 */
export function conformalGrid(mapping, xMin, xMax, yMin, yMax, xSteps = 10, ySteps = 10) {
  const result = {
    originalHorizontal: [],
    originalVertical: [],
    mappedHorizontal: [],
    mappedVertical: []
  };

  // Create horizontal grid lines
  for (let j = 0; j <= ySteps; j++) {
    const y = yMin + (yMax - yMin) * j / ySteps;
    const line = [];
    const mappedLine = [];

    for (let i = 0; i <= xSteps; i++) {
      const x = xMin + (xMax - xMin) * i / xSteps;
      const z = complex(x, y);
      line.push(z);
      mappedLine.push(mapping(z));
    }

    result.originalHorizontal.push(line);
    result.mappedHorizontal.push(mappedLine);
  }

  // Create vertical grid lines
  for (let i = 0; i <= xSteps; i++) {
    const x = xMin + (xMax - xMin) * i / xSteps;
    const line = [];
    const mappedLine = [];

    for (let j = 0; j <= ySteps; j++) {
      const y = yMin + (yMax - yMin) * j / ySteps;
      const z = complex(x, y);
      line.push(z);
      mappedLine.push(mapping(z));
    }

    result.originalVertical.push(line);
    result.mappedVertical.push(mappedLine);
  }

  return result;
}
