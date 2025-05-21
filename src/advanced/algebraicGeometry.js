/**
 * Algebraic Geometry module for herta.js
 * Provides tools for algebraic varieties, polynomials, and related concepts
 */

const arithmetic = require('../core/arithmetic');
const algebra = require('../core/algebra');
const matrix = require('../core/matrix');
const symbolic = require('./symbolic');

const algebraicGeometry = {};

/**
 * Represent a multivariate polynomial
 * @param {Object} terms - Object mapping monomials to coefficients
 * @param {Array} variables - Array of variable names
 * @returns {Object} - Polynomial object
 */
algebraicGeometry.polynomial = function (terms, variables) {
  return {
    terms: { ...terms },
    variables: [...variables],

    toString() {
      const parts = [];

      for (const monomial in this.terms) {
        const coefficient = this.terms[monomial];

        if (coefficient === 0) continue;

        let term = '';
        if (coefficient !== 1 || monomial === '') {
          term += coefficient;
        }

        if (monomial !== '') {
          if (coefficient !== 1) {
            term += '*';
          }
          term += monomial;
        }

        parts.push(term);
      }

      return parts.join(' + ').replace(/\+ -/g, '- ');
    },

    evaluate(values) {
      let result = 0;

      for (const monomial in this.terms) {
        const coefficient = this.terms[monomial];

        if (monomial === '') {
          result += coefficient;
          continue;
        }

        const parts = monomial.split('*');
        let termValue = coefficient;

        for (const part of parts) {
          const [variable, exponent] = part.split('^');
          const exp = exponent ? parseInt(exponent) : 1;

          if (values[variable] === undefined) {
            throw new Error(`Value for variable ${variable} not provided`);
          }

          termValue *= values[variable] ** exp;
        }

        result += termValue;
      }

      return result;
    },

    add(other) {
      const result = { ...this.terms };

      for (const monomial in other.terms) {
        if (result[monomial] === undefined) {
          result[monomial] = other.terms[monomial];
        } else {
          result[monomial] += other.terms[monomial];

          if (Math.abs(result[monomial]) < 1e-10) {
            delete result[monomial];
          }
        }
      }

      const allVariables = [...new Set([...this.variables, ...other.variables])];

      return algebraicGeometry.polynomial(result, allVariables);
    },

    multiply(other) {
      const result = {};

      for (const monomial1 in this.terms) {
        for (const monomial2 in other.terms) {
          const coefficient = this.terms[monomial1] * other.terms[monomial2];

          let newMonomial;
          if (monomial1 === '' && monomial2 === '') {
            newMonomial = '';
          } else if (monomial1 === '') {
            newMonomial = monomial2;
          } else if (monomial2 === '') {
            newMonomial = monomial1;
          } else {
            // Parse monomials
            const terms1 = monomial1.split('*');
            const terms2 = monomial2.split('*');

            // Combine and sort terms
            const combined = [...terms1, ...terms2];
            const variableMap = {};

            for (const term of combined) {
              const [variable, exponent] = term.split('^');
              const exp = exponent ? parseInt(exponent) : 1;

              if (variableMap[variable] === undefined) {
                variableMap[variable] = exp;
              } else {
                variableMap[variable] += exp;
              }
            }

            // Build new monomial
            const newTerms = [];
            for (const variable in variableMap) {
              if (variableMap[variable] === 1) {
                newTerms.push(variable);
              } else {
                newTerms.push(`${variable}^${variableMap[variable]}`);
              }
            }

            newMonomial = newTerms.sort().join('*');
          }

          if (result[newMonomial] === undefined) {
            result[newMonomial] = coefficient;
          } else {
            result[newMonomial] += coefficient;

            if (Math.abs(result[newMonomial]) < 1e-10) {
              delete result[newMonomial];
            }
          }
        }
      }

      const allVariables = [...new Set([...this.variables, ...other.variables])];

      return algebraicGeometry.polynomial(result, allVariables);
    },

    power(n) {
      if (n === 0) {
        return algebraicGeometry.polynomial({ '': 1 }, this.variables);
      }

      let result = this;
      for (let i = 1; i < n; i++) {
        result = result.multiply(this);
      }

      return result;
    },

    differentiate(variable) {
      const result = {};

      for (const monomial in this.terms) {
        if (monomial === '') continue;

        const coefficient = this.terms[monomial];
        const terms = monomial.split('*');

        // Find the term with the given variable
        let variableFound = false;
        const newTerms = [];

        for (let i = 0; i < terms.length; i++) {
          const [termVar, exponent] = terms[i].split('^');

          if (termVar === variable) {
            variableFound = true;
            const exp = exponent ? parseInt(exponent) : 1;

            if (exp === 1) {
              // Skip this term, it gets differentiated to a constant
              continue;
            } else {
              // Differentiate
              newTerms.push(`${termVar}^${exp - 1}`);

              // Multiply coefficient by the exponent
              result[''] = coefficient * exp;
            }
          } else {
            newTerms.push(terms[i]);
          }
        }

        if (variableFound) {
          const newMonomial = newTerms.join('*');

          if (result[newMonomial] === undefined) {
            result[newMonomial] = coefficient;
          } else {
            result[newMonomial] += coefficient;
          }
        }
      }

      return algebraicGeometry.polynomial(result, this.variables);
    }
  };
};

/**
 * Create an ideal from a set of polynomials
 * @param {Array} polynomials - Array of polynomials generating the ideal
 * @returns {Object} - Ideal object
 */
algebraicGeometry.ideal = function (polynomials) {
  return {
    generators: [...polynomials],

    contains(polynomial) {
      // Note: Testing ideal membership properly requires Gröbner basis computation
      // This is a simplified version that only checks if polynomial is an exact linear combination

      // Check if polynomial is zero
      if (Object.keys(polynomial.terms).length === 0) {
        return true;
      }

      // Check if polynomial is a generator
      for (const generator of this.generators) {
        if (generator.toString() === polynomial.toString()) {
          return true;
        }
      }

      // More sophisticated techniques would be required for a complete check
      return false;
    },

    add(polynomial) {
      this.generators.push(polynomial);
      return this;
    }
  };
};

/**
 * Compute a Gröbner basis for an ideal (simplified)
 * @param {Array} polynomials - Array of polynomials generating the ideal
 * @param {Array} variables - Array of variable names in order
 * @returns {Array} - Array of polynomials forming a Gröbner basis
 */
algebraicGeometry.groebnerBasis = function (polynomials, variables) {
  // Note: This is a placeholder for a full Buchberger algorithm implementation
  // Implementing a complete Gröbner basis algorithm is complex and would require
  // more sophisticated polynomial handling including term orders

  // For simple cases, try a basic implementation
  if (polynomials.length <= 1) {
    return [...polynomials];
  }

  // Check for linear polynomials only
  const isLinear = polynomials.every((p) => {
    for (const monomial in p.terms) {
      if (monomial === '') continue;

      const terms = monomial.split('*');
      for (const term of terms) {
        const [variable, exponent] = term.split('^');
        if (exponent && parseInt(exponent) > 1) {
          return false;
        }
      }
    }
    return true;
  });

  if (isLinear) {
    // For linear polynomials, Gaussian elimination is equivalent
    return [...polynomials]; // Just return the original generators for now
  }

  // For more complex cases, just return the original generators
  // with a note that a full implementation is needed
  console.warn('Full Gröbner basis computation not implemented');
  return [...polynomials];
};

/**
 * Check if a point satisfies a system of polynomial equations
 * @param {Array} polynomials - Array of polynomials
 * @param {Object} point - Point coordinates {x: value, y: value, ...}
 * @param {number} [tolerance=1e-10] - Tolerance for numerical errors
 * @returns {boolean} - Whether the point is on the variety
 */
algebraicGeometry.isPointOnVariety = function (polynomials, point, tolerance = 1e-10) {
  for (const polynomial of polynomials) {
    const value = polynomial.evaluate(point);
    if (Math.abs(value) > tolerance) {
      return false;
    }
  }

  return true;
};

/**
 * Find the intersection of two plane curves defined by polynomials
 * @param {Object} poly1 - First polynomial in x, y
 * @param {Object} poly2 - Second polynomial in x, y
 * @param {Object} [options={}] - Options for the computation
 * @returns {Array} - Array of intersection points
 */
algebraicGeometry.curvesIntersection = function (poly1, poly2, options = {}) {
  const tolerance = options.tolerance || 1e-10;
  const bounds = options.bounds || { x: [-10, 10], y: [-10, 10] };
  const gridSize = options.gridSize || 100;

  const result = [];
  const dx = (bounds.x[1] - bounds.x[0]) / gridSize;
  const dy = (bounds.y[1] - bounds.y[0]) / gridSize;

  // Brute force grid search for intersections
  // (A complete implementation would use resultants or other algebraic techniques)
  for (let i = 0; i <= gridSize; i++) {
    const x = bounds.x[0] + i * dx;

    for (let j = 0; j <= gridSize; j++) {
      const y = bounds.y[0] + j * dy;

      const value1 = poly1.evaluate({ x, y });
      const value2 = poly2.evaluate({ x, y });

      if (Math.abs(value1) < tolerance && Math.abs(value2) < tolerance) {
        // Potential intersection, refine using Newton's method
        const refinedPoint = this._refineIntersection(poly1, poly2, { x, y }, tolerance);

        // Check if point is already in result (within tolerance)
        const isNewPoint = !result.some((p) => Math.abs(p.x - refinedPoint.x) < tolerance
          && Math.abs(p.y - refinedPoint.y) < tolerance);

        if (isNewPoint) {
          result.push(refinedPoint);
        }
      }
    }
  }

  return result;
};

/**
 * Refine an approximate intersection point using Newton's method
 * @private
 * @param {Object} poly1 - First polynomial
 * @param {Object} poly2 - Second polynomial
 * @param {Object} initialPoint - Initial approximation
 * @param {number} tolerance - Error tolerance
 * @returns {Object} - Refined intersection point
 */
algebraicGeometry._refineIntersection = function (poly1, poly2, initialPoint, tolerance) {
  const maxIterations = 10;
  const point = { ...initialPoint };

  for (let iter = 0; iter < maxIterations; iter++) {
    // Calculate function values
    const f1 = poly1.evaluate(point);
    const f2 = poly2.evaluate(point);

    // Check if already within tolerance
    if (Math.abs(f1) < tolerance && Math.abs(f2) < tolerance) {
      break;
    }

    // Calculate Jacobian
    const df1dx = poly1.differentiate('x').evaluate(point);
    const df1dy = poly1.differentiate('y').evaluate(point);
    const df2dx = poly2.differentiate('x').evaluate(point);
    const df2dy = poly2.differentiate('y').evaluate(point);

    // Determinant
    const det = df1dx * df2dy - df1dy * df2dx;

    if (Math.abs(det) < tolerance) {
      // Singular Jacobian, use the original point
      break;
    }

    // Newton step
    const dx = (f1 * df2dy - f2 * df1dy) / det;
    const dy = (f2 * df1dx - f1 * df2dx) / det;

    // Update point
    point.x -= dx;
    point.y -= dy;
  }

  return point;
};

/**
 * Compute the dimension of a variety (simplified)
 * @param {Array} polynomials - Array of polynomials defining the variety
 * @returns {number} - Estimated dimension
 */
algebraicGeometry.varietyDimension = function (polynomials) {
  // This is a very simplified approach
  if (polynomials.length === 0) {
    return 0; // Empty case
  }

  // Get all variables across all polynomials
  const allVariables = new Set();

  for (const poly of polynomials) {
    for (const variable of poly.variables) {
      allVariables.add(variable);
    }
  }

  // A very crude estimate: ambient dimension - number of equations
  // This only works in very simple cases with independent equations
  const ambientDimension = allVariables.size;
  const estimatedDimension = Math.max(0, ambientDimension - polynomials.length);

  return estimatedDimension;
};

/**
 * Compute the tangent space to a variety at a point
 * @param {Array} polynomials - Array of polynomials defining the variety
 * @param {Object} point - Point on the variety
 * @returns {Object} - Description of the tangent space
 */
algebraicGeometry.tangentSpace = function (polynomials, point) {
  // Check if point is on the variety
  if (!this.isPointOnVariety(polynomials, point)) {
    throw new Error('Point is not on the variety');
  }

  // Calculate the Jacobian matrix at the point
  const jacobian = [];

  for (const poly of polynomials) {
    const row = [];

    for (const variable of poly.variables) {
      const partial = poly.differentiate(variable);
      row.push(partial.evaluate(point));
    }

    jacobian.push(row);
  }

  // Calculate rank of Jacobian
  const rank = this._matrixRank(jacobian);

  // The tangent space has dimension = number of variables - rank of Jacobian
  const dimension = poly.variables.length - rank;

  return {
    dimension,
    jacobian
  };
};

/**
 * Calculate the rank of a matrix
 * @private
 * @param {Array} matrix - The matrix as a 2D array
 * @returns {number} - Rank of the matrix
 */
algebraicGeometry._matrixRank = function (matrix) {
  if (matrix.length === 0 || matrix[0].length === 0) {
    return 0;
  }

  // Create a copy of the matrix
  const m = matrix.map((row) => [...row]);
  const rows = m.length;
  const cols = m[0].length;

  let rank = 0;
  const processedRows = new Set();

  // Gaussian elimination
  for (let j = 0; j < cols; j++) {
    // Find the pivot
    let pivotRow = -1;
    for (let i = 0; i < rows; i++) {
      if (!processedRows.has(i) && Math.abs(m[i][j]) > 1e-10) {
        pivotRow = i;
        break;
      }
    }

    if (pivotRow === -1) {
      continue; // No pivot in this column
    }

    // Mark row as processed and increment rank
    processedRows.add(pivotRow);
    rank++;

    // Normalize pivot row
    const pivot = m[pivotRow][j];
    for (let k = j; k < cols; k++) {
      m[pivotRow][k] /= pivot;
    }

    // Eliminate other rows
    for (let i = 0; i < rows; i++) {
      if (i !== pivotRow) {
        const factor = m[i][j];
        for (let k = j; k < cols; k++) {
          m[i][k] -= factor * m[pivotRow][k];
        }
      }
    }
  }

  return rank;
};

/**
 * Compute the resultant of two polynomials
 * @param {Object} poly1 - First polynomial
 * @param {Object} poly2 - Second polynomial
 * @param {string} variable - Variable to eliminate
 * @returns {Object} - Resultant polynomial
 */
algebraicGeometry.resultant = function (poly1, poly2, variable) {
  // Note: This is a placeholder for a full resultant implementation
  // A proper implementation would use Sylvester matrices or other methods

  // For simple cases with linear polynomials, try a direct approach
  if (isPolynomialLinear(poly1, variable) && isPolynomialLinear(poly2, variable)) {
    // Extract coefficients of the variable
    const c1 = getLinearCoefficient(poly1, variable);
    const c2 = getLinearCoefficient(poly2, variable);

    // Get constant terms
    const k1 = getConstantTerm(poly1, variable);
    const k2 = getConstantTerm(poly2, variable);

    // For linear polynomials a*x + b and c*x + d, the resultant is ad - bc
    const result = c1.multiply(k2).subtract(k1.multiply(c2));

    return result;
  }

  // Helper functions
  function isPolynomialLinear(poly, variable) {
    for (const monomial in poly.terms) {
      if (monomial === '') continue;

      const terms = monomial.split('*');
      for (const term of terms) {
        const [termVar, exponent] = term.split('^');
        if (termVar === variable && exponent && parseInt(exponent) > 1) {
          return false;
        }
      }
    }
    return true;
  }

  function getLinearCoefficient(poly, variable) {
    // This is a simplified approach
    const result = {};

    for (const monomial in poly.terms) {
      if (monomial === '') continue;

      const terms = monomial.split('*');
      let hasVariable = false;

      for (const term of terms) {
        const [termVar, exponent] = term.split('^');
        if (termVar === variable && (!exponent || parseInt(exponent) === 1)) {
          hasVariable = true;
          break;
        }
      }

      if (hasVariable) {
        // Remove the variable to get the coefficient
        const newMonomial = monomial.replace(`${variable}`, '').replace('**', '*').replace(/^\*|\*$/g, '');
        result[newMonomial || ''] = poly.terms[monomial];
      }
    }

    return algebraicGeometry.polynomial(result, poly.variables.filter((v) => v !== variable));
  }

  function getConstantTerm(poly, variable) {
    // This is a simplified approach
    const result = {};

    for (const monomial in poly.terms) {
      if (monomial === '') {
        result[''] = poly.terms[monomial];
        continue;
      }

      const terms = monomial.split('*');
      let hasVariable = false;

      for (const term of terms) {
        const [termVar] = term.split('^');
        if (termVar === variable) {
          hasVariable = true;
          break;
        }
      }

      if (!hasVariable) {
        result[monomial] = poly.terms[monomial];
      }
    }

    return algebraicGeometry.polynomial(result, poly.variables.filter((v) => v !== variable));
  }

  console.warn('Full resultant computation not implemented');

  // Return null to indicate that computation is not implemented
  return null;
};

/**
 * Compute the singular locus of a variety
 * @param {Array} polynomials - Array of polynomials defining the variety
 * @returns {Array} - Array of polynomials defining the singular locus
 */
algebraicGeometry.singularLocus = function (polynomials) {
  // The singular locus is where the Jacobian doesn't have full rank
  const jacobianPolys = [];

  // Get all variables
  const allVariables = new Set();
  for (const poly of polynomials) {
    for (const variable of poly.variables) {
      allVariables.add(variable);
    }
  }
  const variables = [...allVariables];

  // Compute all partial derivatives
  for (const poly of polynomials) {
    for (const variable of variables) {
      const partial = poly.differentiate(variable);
      if (Object.keys(partial.terms).length > 0) {
        jacobianPolys.push(partial);
      }
    }
  }

  // The singular locus is the variety defined by the original polynomials
  // and the minors of the Jacobian
  return [...polynomials, ...jacobianPolys];
};

/**
 * Check if a variety is smooth at a point
 * @param {Array} polynomials - Array of polynomials defining the variety
 * @param {Object} point - Point on the variety
 * @returns {boolean} - Whether the variety is smooth at the point
 */
algebraicGeometry.isSmoothAtPoint = function (polynomials, point) {
  // Check if point is on the variety
  if (!this.isPointOnVariety(polynomials, point)) {
    throw new Error('Point is not on the variety');
  }

  // Calculate the Jacobian matrix at the point
  const jacobian = [];

  for (const poly of polynomials) {
    const row = [];

    for (const variable of poly.variables) {
      const partial = poly.differentiate(variable);
      row.push(partial.evaluate(point));
    }

    jacobian.push(row);
  }

  // The variety is smooth if the Jacobian has full rank
  const rank = this._matrixRank(jacobian);

  return rank === polynomials.length;
};

/**
 * Compute the degree of a projective variety
 * @param {Array} polynomials - Array of homogeneous polynomials
 * @returns {number} - Degree of the variety
 */
algebraicGeometry.varietyDegree = function (polynomials) {
  // This is a placeholder for a proper implementation
  // Computing the degree of a variety is a complex task

  // Check if polynomials are homogeneous
  for (const poly of polynomials) {
    if (!this._isHomogeneous(poly)) {
      throw new Error('Polynomials must be homogeneous');
    }
  }

  // For simple cases, return some basic estimates
  if (polynomials.length === 1) {
    return this._getPolynomialDegree(polynomials[0]);
  }

  // For complete intersections, degrees multiply
  let degree = 1;
  for (const poly of polynomials) {
    degree *= this._getPolynomialDegree(poly);
  }

  return degree;
};

/**
 * Check if a polynomial is homogeneous
 * @private
 * @param {Object} polynomial - The polynomial to check
 * @returns {boolean} - Whether the polynomial is homogeneous
 */
algebraicGeometry._isHomogeneous = function (polynomial) {
  if (Object.keys(polynomial.terms).length === 0) {
    return true; // Empty polynomial is homogeneous
  }

  let degree = null;

  for (const monomial in polynomial.terms) {
    if (monomial === '') {
      // Constant term must be zero in a homogeneous polynomial
      if (polynomial.terms[monomial] !== 0) {
        return false;
      }
      continue;
    }

    let monomialDegree = 0;
    const terms = monomial.split('*');

    for (const term of terms) {
      const [variable, exponent] = term.split('^');
      monomialDegree += exponent ? parseInt(exponent) : 1;
    }

    if (degree === null) {
      degree = monomialDegree;
    } else if (degree !== monomialDegree) {
      return false;
    }
  }

  return true;
};

/**
 * Get the degree of a polynomial
 * @private
 * @param {Object} polynomial - The polynomial
 * @returns {number} - Degree of the polynomial
 */
algebraicGeometry._getPolynomialDegree = function (polynomial) {
  let maxDegree = 0;

  for (const monomial in polynomial.terms) {
    if (monomial === '') continue;

    let monomialDegree = 0;
    const terms = monomial.split('*');

    for (const term of terms) {
      const [variable, exponent] = term.split('^');
      monomialDegree += exponent ? parseInt(exponent) : 1;
    }

    maxDegree = Math.max(maxDegree, monomialDegree);
  }

  return maxDegree;
};

/**
 * Create an elliptic curve in Weierstrass form
 * @param {number} a - Coefficient a in y^2 = x^3 + ax + b
 * @param {number} b - Coefficient b in y^2 = x^3 + ax + b
 * @returns {Object} - Elliptic curve object
 */
algebraicGeometry.ellipticCurve = function (a, b) {
  // Check that the discriminant is non-zero
  const discriminant = -16 * (4 * a * a * a + 27 * b * b);

  if (Math.abs(discriminant) < 1e-10) {
    throw new Error('Discriminant is zero, curve is singular');
  }

  // Create the elliptic curve polynomial: y^2 - x^3 - a*x - b
  const curve = this.polynomial(
    {
      'y^2': 1, 'x^3': -1, x: -a, '': -b
    },
    ['x', 'y']
  );

  return {
    a,
    b,
    discriminant,
    curve,

    /**
     * Check if a point is on the elliptic curve
     * @param {number} x - x-coordinate
     * @param {number} y - y-coordinate
     * @param {number} [tolerance=1e-10] - Tolerance for floating point errors
     * @returns {boolean} - Whether the point is on the curve
     */
    containsPoint(x, y, tolerance = 1e-10) {
      return Math.abs(y * y - (x * x * x + a * x + b)) < tolerance;
    },

    /**
     * Add two points on the elliptic curve
     * @param {Array} P - First point [x1, y1]
     * @param {Array} Q - Second point [x2, y2]
     * @returns {Array} - Sum point [x3, y3]
     */
    addPoints(P, Q) {
      // Special cases for identity element
      if (P === null || (Array.isArray(P) && P.length === 0)) return Q;
      if (Q === null || (Array.isArray(Q) && Q.length === 0)) return P;

      const [x1, y1] = P;
      const [x2, y2] = Q;

      // Check if points are valid
      if (!this.containsPoint(x1, y1) || !this.containsPoint(x2, y2)) {
        throw new Error('Points must be on the elliptic curve');
      }

      // Case: P = -Q
      if (x1 === x2 && y1 === -y2) {
        return []; // Return the identity element (point at infinity)
      }

      let lambda;
      if (x1 === x2 && y1 === y2) {
        // Case: P = Q (doubling)
        if (Math.abs(y1) < 1e-10) {
          return []; // 2P = O if y = 0
        }
        lambda = (3 * x1 * x1 + a) / (2 * y1);
      } else {
        // Case: P ≠ Q (addition)
        lambda = (y2 - y1) / (x2 - x1);
      }

      // Calculate the new point
      const x3 = lambda * lambda - x1 - x2;
      const y3 = lambda * (x1 - x3) - y1;

      return [x3, y3];
    },

    /**
     * Multiply a point by a scalar
     * @param {Array} P - Point [x, y]
     * @param {number} n - Scalar multiplier
     * @returns {Array} - Resulting point [x', y']
     */
    multiplyPoint(P, n) {
      if (n === 0 || P === null || (Array.isArray(P) && P.length === 0)) {
        return []; // Return the identity element
      }

      if (n < 0) {
        // Negating a point flips the y-coordinate
        return this.multiplyPoint([P[0], -P[1]], -n);
      }

      // Double-and-add algorithm
      let result = [];
      let addend = [...P];

      while (n > 0) {
        if (n & 1) {
          // If the lowest bit is 1, add the current addend
          result = this.addPoints(result, addend);
        }

        // Double the addend
        addend = this.addPoints(addend, addend);

        // Shift right by 1 bit
        n >>= 1;
      }

      return result;
    },

    /**
     * Compute the j-invariant of the elliptic curve
     * @returns {number} - j-invariant
     */
    jInvariant() {
      return 1728 * (4 * a * a * a) / discriminant;
    },

    /**
     * Check if two elliptic curves are isomorphic
     * @param {Object} other - Another elliptic curve
     * @returns {boolean} - Whether the curves are isomorphic
     */
    isIsomorphicTo(other) {
      return Math.abs(this.jInvariant() - other.jInvariant()) < 1e-10;
    },

    /**
     * Find all points with integer coordinates in a given range
     * @param {number} min - Minimum x and y value
     * @param {number} max - Maximum x and y value
     * @returns {Array} - Array of points with integer coordinates
     */
    findIntegerPoints(min, max) {
      const points = [];

      for (let x = min; x <= max; x++) {
        // Calculate y^2 = x^3 + ax + b
        const ySquared = x * x * x + a * x + b;

        // Check if ySquared is a perfect square
        const y = Math.sqrt(ySquared);
        if (Math.floor(y) === y && y >= min && y <= max) {
          points.push([x, y]);
          if (y !== 0) {
            points.push([x, -y]); // Add the negative y if not zero
          }
        }
      }

      return points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    }
  };
};

/**
 * Create a toric variety from a fan
 * @param {Array} rays - Array of rays (vectors) defining the fan
 * @param {Array} cones - Array of cones, each cone is an array of ray indices
 * @returns {Object} - Toric variety object
 */
algebraicGeometry.toricVariety = function (rays, cones) {
  // Validate the fan
  // Each cone must be a list of valid ray indices
  for (const cone of cones) {
    for (const rayIndex of cone) {
      if (rayIndex < 0 || rayIndex >= rays.length) {
        throw new Error(`Invalid ray index: ${rayIndex}`);
      }
    }
  }

  // Check if the fan is simplicial (each cone is generated by linearly independent rays)
  const isSimplicial = cones.every((cone) => {
    // Extract the rays for this cone
    const coneRays = cone.map((rayIndex) => rays[rayIndex]);

    // Check linear independence using matrix rank
    return this._matrixRank(coneRays) === cone.length;
  });

  return {
    rays,
    cones,
    isSimplicial,
    dimension: rays[0].length,

    /**
     * Check if the toric variety is smooth
     * @returns {boolean} - Whether the variety is smooth
     */
    isSmooth() {
      if (!isSimplicial) return false;

      // A simplicial toric variety is smooth if each cone is generated by a subset of a basis
      return cones.every((cone) => {
        // Extract the rays for this cone
        const coneRays = cone.map((rayIndex) => rays[rayIndex]);

        // For smoothness, the ray generators of each maximal cone should form a Z-basis
        // This is a simplified check - we would need more sophisticated algorithms
        // to determine if vectors form a Z-basis of a lattice

        // Just check if the determinant is ±1 for maximal cones (if dimension matches)
        if (cone.length === this.dimension) {
          const det = this._determinant(coneRays);
          return Math.abs(det) === 1;
        }

        return true;
      });
    },

    /**
     * Calculate the Chow ring of the toric variety (simplified)
     * @returns {Object} - Description of the Chow ring
     */
    chowRing() {
      // This is a very simplified version
      // The Chow ring of a smooth toric variety has generators corresponding to rays
      const generators = rays.map((_, i) => `D_${i}`);

      // Linear relations from the fact that sum of D_i * u_i = 0 for any u
      const linearRelations = [];
      for (let j = 0; j < this.dimension; j++) {
        const relation = {};
        for (let i = 0; i < rays.length; i++) {
          relation[`D_${i}`] = rays[i][j];
        }
        linearRelations.push(relation);
      }

      // Stanley-Reisner ideal (products of D_i where i not in the same cone)
      const srIdeal = [];
      for (let i = 0; i < rays.length; i++) {
        for (let j = i + 1; j < rays.length; j++) {
          // Check if rays i and j do not appear in the same cone
          const notInSameCone = !cones.some((cone) => cone.includes(i) && cone.includes(j));

          if (notInSameCone) {
            srIdeal.push([`D_${i}`, `D_${j}`]);
          }
        }
      }

      return {
        generators,
        linearRelations,
        stanleyReisnerIdeal: srIdeal
      };
    },

    /**
     * Calculate the determinant of a square matrix
     * @private
     * @param {Array} matrix - Square matrix as array of arrays
     * @returns {number} - Determinant of the matrix
     */
    _determinant(matrix) {
      const n = matrix.length;

      // Base case for 1x1 matrix
      if (n === 1) return matrix[0][0];

      // Base case for 2x2 matrix
      if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      }

      // Expand along the first row for larger matrices
      let det = 0;
      for (let j = 0; j < n; j++) {
        // Create the submatrix
        const submatrix = [];
        for (let i = 1; i < n; i++) {
          const row = [];
          for (let k = 0; k < n; k++) {
            if (k !== j) row.push(matrix[i][k]);
          }
          submatrix.push(row);
        }

        // Add or subtract the determinant of the submatrix
        const sign = j % 2 === 0 ? 1 : -1;
        det += sign * matrix[0][j] * this._determinant(submatrix);
      }

      return det;
    }
  };
};

/**
 * Perform a blowup of a variety at a point
 * @param {Array} polynomials - Array of polynomials defining the variety
 * @param {Object} point - The point to blow up at
 * @returns {Object} - Description of the blowup
 */
algebraicGeometry.blowup = function (polynomials, point) {
  // Validate that the point is on the variety
  if (!this.isPointOnVariety(polynomials, point)) {
    throw new Error('Blowup point must be on the variety');
  }

  // Extract variables from polynomials
  const variables = new Set();
  polynomials.forEach((poly) => {
    poly.variables.forEach((v) => variables.add(v));
  });
  const vars = Array.from(variables);
  const n = vars.length;

  // Translate the variety so the point is at the origin
  const translated = polynomials.map((poly) => {
    const translated = poly;
    for (let i = 0; i < n; i++) {
      const v = vars[i];
      const shift = point[v] || 0;

      // Create substitution polynomial x --> x + shift
      const substitution = this.polynomial(
        { [v]: 1, '': shift },
        [v]
      );

      // Apply substitution
      // This is a simplified approach; a full implementation would need
      // more sophisticated polynomial manipulation
      // ...
    }
    return translated;
  });

  // In the blowup, we replace the point with a projective space
  // We'd need projective coordinates, equations for the exceptional divisor, etc.
  // For this simplified version, we'll just return the translated polynomials
  // and the exceptional divisor described informally

  return {
    originalVariety: polynomials,
    blowupPoint: point,
    translatedVariety: translated,
    exceptionalDivisor: {
      type: 'Projective Space',
      dimension: n - 1
    },
    description: `Blowup of the variety at the point ${JSON.stringify(point)}`
  };
};

/**
 * Compute the sheaf cohomology dimensions of a curve (simplified)
 * @param {Object} curve - Curve defined by a polynomial
 * @param {number} genus - Genus of the curve
 * @param {number} degree - Degree of the line bundle
 * @returns {Object} - Cohomology dimensions H^0 and H^1
 */
algebraicGeometry.sheafCohomology = function (curve, genus, degree) {
  // For a line bundle L of degree d on a curve of genus g:
  // h^0(L) = d + 1 - g if d >= 2g - 1
  // h^0(L) >= d + 1 - g always
  // h^1(L) = h^0(K - L) by Serre duality, where K is the canonical bundle of degree 2g - 2

  let h0 = 0;
  let h1 = 0;

  if (degree < 0) {
    // Line bundles of negative degree have no global sections
    h0 = 0;
    // By Riemann-Roch: h^0 - h^1 = d + 1 - g
    h1 = genus - degree - 1;
  } else if (degree >= 2 * genus - 1) {
    // In this range, there are no higher cohomology groups
    h0 = degree + 1 - genus;
    h1 = 0;
  } else {
    // In the middle range, we need more detailed analysis
    // For simplicity, we'll use the Riemann-Roch formula
    const chi = degree + 1 - genus; // Euler characteristic

    // Estimate h^0 using Riemann-Roch and Serre duality
    const dualDegree = (2 * genus - 2) - degree;
    if (dualDegree < 0) {
      h1 = 0;
      h0 = chi;
    } else {
      // This is a simplification; truly computing h^0 would require
      // more detailed information about the specific curve and line bundle
      h0 = Math.max(1, chi); // Very rough approximation
      h1 = h0 - chi;
    }
  }

  return {
    h0,
    h1,
    eulerCharacteristic: degree + 1 - genus
  };
};

module.exports = algebraicGeometry;
