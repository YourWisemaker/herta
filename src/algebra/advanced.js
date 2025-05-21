/**
 * Advanced Algebra module for herta.js
 * Provides advanced algebraic structures, abstract algebra, and computational algebra
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');
const complex = require('../core/complex');

const advancedAlgebra = {};

/**
 * Create a group structure
 * @param {Array} elements - Elements of the group
 * @param {Function} operation - Binary operation (a, b) => result
 * @param {Object} options - Additional properties
 * @returns {Object} - Group object with operations
 */
advancedAlgebra.createGroup = function (elements, operation, options = {}) {
  const identity = options.identity || elements[0];

  // Check if it's a valid group
  if (!this.isGroup(elements, operation, identity)) {
    throw new Error('The specified set and operation do not form a group');
  }

  return {
    elements,
    operation,
    identity,

    // Find the inverse of an element
    inverse(element) {
      for (const e of elements) {
        if (operation(element, e) === identity && operation(e, element) === identity) {
          return e;
        }
      }
      throw new Error('Inverse not found');
    },

    // Apply the operation
    apply(a, b) {
      return operation(a, b);
    },

    // Check if element belongs to the group
    contains(element) {
      return elements.includes(element);
    },

    // Calculate the order of an element
    orderOf(element) {
      if (!this.contains(element)) {
        throw new Error('Element not in group');
      }

      let result = element;
      let order = 1;

      while (result !== identity) {
        result = operation(result, element);
        order++;

        if (order > elements.length) {
          throw new Error('Group operation is not associative');
        }
      }

      return order;
    },

    // Generate the power of an element
    power(element, n) {
      if (!this.contains(element)) {
        throw new Error('Element not in group');
      }

      if (n === 0) return identity;

      if (n < 0) {
        element = this.inverse(element);
        n = -n;
      }

      let result = element;
      for (let i = 1; i < n; i++) {
        result = operation(result, element);
      }

      return result;
    }
  };
};

/**
 * Check if a set with a binary operation forms a group
 * @param {Array} elements - Elements of the set
 * @param {Function} operation - Binary operation
 * @param {*} identity - Identity element
 * @returns {boolean} - True if the set forms a group
 */
advancedAlgebra.isGroup = function (elements, operation, identity) {
  // Check closure
  for (const a of elements) {
    for (const b of elements) {
      const result = operation(a, b);
      if (!elements.includes(result)) {
        return false; // Not closed under the operation
      }
    }
  }

  // Check associativity
  for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        const result1 = operation(operation(a, b), c);
        const result2 = operation(a, operation(b, c));
        if (result1 !== result2) {
          return false; // Not associative
        }
      }
    }
  }

  // Check identity
  if (!elements.includes(identity)) {
    return false; // Identity not in set
  }

  for (const a of elements) {
    if (operation(a, identity) !== a || operation(identity, a) !== a) {
      return false; // Not an identity element
    }
  }

  // Check inverses
  for (const a of elements) {
    let hasInverse = false;
    for (const b of elements) {
      if (operation(a, b) === identity && operation(b, a) === identity) {
        hasInverse = true;
        break;
      }
    }
    if (!hasInverse) {
      return false; // Element doesn't have inverse
    }
  }

  return true;
};

/**
 * Create a ring structure
 * @param {Array} elements - Elements of the ring
 * @param {Function} addition - Addition operation
 * @param {Function} multiplication - Multiplication operation
 * @param {Object} options - Additional properties
 * @returns {Object} - Ring object with operations
 */
advancedAlgebra.createRing = function (elements, addition, multiplication, options = {}) {
  const addIdentity = options.addIdentity || elements[0];
  const { multIdentity } = options;

  // Check if it's a valid ring
  if (!this.isRing(elements, addition, multiplication, addIdentity)) {
    throw new Error('The specified set and operations do not form a ring');
  }

  // Create ring object
  const ring = {
    elements,
    addition,
    multiplication,
    addIdentity,

    // Find additive inverse
    additiveInverse(element) {
      for (const e of elements) {
        if (addition(element, e) === addIdentity && addition(e, element) === addIdentity) {
          return e;
        }
      }
      throw new Error('Additive inverse not found');
    },

    // Apply addition
    add(a, b) {
      return addition(a, b);
    },

    // Apply multiplication
    multiply(a, b) {
      return multiplication(a, b);
    },

    // Check if element belongs to the ring
    contains(element) {
      return elements.includes(element);
    }
  };

  // If multiplicative identity exists, add field-specific operations
  if (multIdentity) {
    ring.multIdentity = multIdentity;

    // Check if it's a field
    if (this.isField(elements, addition, multiplication, addIdentity, multIdentity)) {
      ring.isField = true;

      // Find multiplicative inverse
      ring.multiplicativeInverse = function (element) {
        if (element === addIdentity) {
          throw new Error('Zero has no multiplicative inverse');
        }

        for (const e of elements) {
          if (multiplication(element, e) === multIdentity && multiplication(e, element) === multIdentity) {
            return e;
          }
        }
        throw new Error('Multiplicative inverse not found');
      };

      // Division operation
      ring.divide = function (a, b) {
        if (b === addIdentity) {
          throw new Error('Division by zero');
        }
        return multiplication(a, this.multiplicativeInverse(b));
      };
    }
  }

  return ring;
};

/**
 * Check if a set with two binary operations forms a ring
 * @param {Array} elements - Elements of the set
 * @param {Function} addition - Addition operation
 * @param {Function} multiplication - Multiplication operation
 * @param {*} addIdentity - Additive identity element
 * @returns {boolean} - True if the set forms a ring
 */
advancedAlgebra.isRing = function (elements, addition, multiplication, addIdentity) {
  // Check if addition forms an abelian group
  if (!this.isGroup(elements, addition, addIdentity)) {
    return false;
  }

  // Check if addition is commutative
  for (const a of elements) {
    for (const b of elements) {
      if (addition(a, b) !== addition(b, a)) {
        return false; // Addition not commutative
      }
    }
  }

  // Check if multiplication is associative
  for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        const result1 = multiplication(multiplication(a, b), c);
        const result2 = multiplication(a, multiplication(b, c));
        if (result1 !== result2) {
          return false; // Multiplication not associative
        }
      }
    }
  }

  // Check closure under multiplication
  for (const a of elements) {
    for (const b of elements) {
      const result = multiplication(a, b);
      if (!elements.includes(result)) {
        return false; // Not closed under multiplication
      }
    }
  }

  // Check distributivity
  for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        // Left distributivity
        const left1 = multiplication(a, addition(b, c));
        const left2 = addition(multiplication(a, b), multiplication(a, c));

        // Right distributivity
        const right1 = multiplication(addition(a, b), c);
        const right2 = addition(multiplication(a, c), multiplication(b, c));

        if (left1 !== left2 || right1 !== right2) {
          return false; // Not distributive
        }
      }
    }
  }

  return true;
};

/**
 * Check if a set with two binary operations forms a field
 * @param {Array} elements - Elements of the set
 * @param {Function} addition - Addition operation
 * @param {Function} multiplication - Multiplication operation
 * @param {*} addIdentity - Additive identity element
 * @param {*} multIdentity - Multiplicative identity element
 * @returns {boolean} - True if the set forms a field
 */
advancedAlgebra.isField = function (elements, addition, multiplication, addIdentity, multIdentity) {
  // Check if it's a ring
  if (!this.isRing(elements, addition, multiplication, addIdentity)) {
    return false;
  }

  // Check if multiplication identity exists and is not the additive identity
  if (!elements.includes(multIdentity) || multIdentity === addIdentity) {
    return false;
  }

  // Check multiplicative identity
  for (const a of elements) {
    if (multiplication(a, multIdentity) !== a || multiplication(multIdentity, a) !== a) {
      return false;
    }
  }

  // Check if multiplication is commutative
  for (const a of elements) {
    for (const b of elements) {
      if (multiplication(a, b) !== multiplication(b, a)) {
        return false; // Multiplication not commutative
      }
    }
  }

  // Check multiplicative inverses
  for (const a of elements) {
    if (a === addIdentity) continue; // Skip zero

    let hasInverse = false;
    for (const b of elements) {
      if (multiplication(a, b) === multIdentity && multiplication(b, a) === multIdentity) {
        hasInverse = true;
        break;
      }
    }
    if (!hasInverse) {
      return false; // Non-zero element doesn't have multiplicative inverse
    }
  }

  return true;
};

/**
 * Create a polynomial with coefficients over a given field or ring
 * @param {Array} coefficients - Coefficients of the polynomial (a0, a1, a2, ...)
 * @param {Object} structure - Field or ring for the coefficients
 * @returns {Object} - Polynomial object with operations
 */
advancedAlgebra.createPolynomial = function (coefficients, structure) {
  // Remove leading zero coefficients
  while (coefficients.length > 1 && coefficients[coefficients.length - 1] === structure.addIdentity) {
    coefficients.pop();
  }

  return {
    coefficients: [...coefficients],
    structure,

    // Get the degree of the polynomial
    degree() {
      return this.coefficients.length - 1;
    },

    // Evaluate the polynomial at x
    evaluate(x) {
      let result = structure.addIdentity;
      let power = structure.multIdentity;

      for (const coef of this.coefficients) {
        const term = structure.multiply(coef, power);
        result = structure.add(result, term);
        power = structure.multiply(power, x);
      }

      return result;
    },

    // Add two polynomials
    add(other) {
      const maxLength = Math.max(this.coefficients.length, other.coefficients.length);
      const result = [];

      for (let i = 0; i < maxLength; i++) {
        const a = i < this.coefficients.length ? this.coefficients[i] : structure.addIdentity;
        const b = i < other.coefficients.length ? other.coefficients[i] : structure.addIdentity;
        result.push(structure.add(a, b));
      }

      return advancedAlgebra.createPolynomial(result, structure);
    },

    // Multiply two polynomials
    multiply(other) {
      const result = Array(this.coefficients.length + other.coefficients.length - 1).fill(structure.addIdentity);

      for (let i = 0; i < this.coefficients.length; i++) {
        for (let j = 0; j < other.coefficients.length; j++) {
          const term = structure.multiply(this.coefficients[i], other.coefficients[j]);
          result[i + j] = structure.add(result[i + j], term);
        }
      }

      return advancedAlgebra.createPolynomial(result, structure);
    }
  };
};

/**
 * Perform polynomial division
 * @param {Object} numerator - Numerator polynomial
 * @param {Object} denominator - Denominator polynomial
 * @returns {Object} - Result with quotient and remainder
 */
advancedAlgebra.polynomialDivision = function (numerator, denominator) {
  if (!denominator.structure.isField) {
    throw new Error('Polynomial division requires coefficients from a field');
  }

  if (denominator.degree() < 0) {
    throw new Error('Cannot divide by zero polynomial');
  }

  const { structure } = numerator;
  const n = numerator.coefficients;
  const d = denominator.coefficients;
  const nDeg = numerator.degree();
  const dDeg = denominator.degree();

  if (nDeg < dDeg) {
    // If degree of numerator is less than denominator, quotient is 0 and remainder is numerator
    return {
      quotient: advancedAlgebra.createPolynomial([structure.addIdentity], structure),
      remainder: numerator
    };
  }

  // Initialize quotient and remainder
  const quotientCoefs = Array(nDeg - dDeg + 1).fill(structure.addIdentity);
  const remainder = [...n];

  // Long division algorithm
  for (let i = nDeg; i >= dDeg; i--) {
    const coef = structure.divide(remainder[i], d[dDeg]);
    quotientCoefs[i - dDeg] = coef;

    for (let j = 0; j <= dDeg; j++) {
      remainder[i - dDeg + j] = structure.add(
        remainder[i - dDeg + j],
        structure.additiveInverse(structure.multiply(coef, d[j]))
      );
    }
  }

  // Trim remainder
  while (remainder.length > 1 && remainder[remainder.length - 1] === structure.addIdentity) {
    remainder.pop();
  }

  return {
    quotient: advancedAlgebra.createPolynomial(quotientCoefs, structure),
    remainder: advancedAlgebra.createPolynomial(remainder, structure)
  };
};

/**
 * Calculate the greatest common divisor of two polynomials
 * @param {Object} a - First polynomial
 * @param {Object} b - Second polynomial
 * @returns {Object} - GCD polynomial
 */
advancedAlgebra.polynomialGCD = function (a, b) {
  if (!a.structure.isField) {
    throw new Error('Polynomial GCD requires coefficients from a field');
  }

  if (b.degree() > a.degree()) {
    [a, b] = [b, a]; // Ensure a has higher degree
  }

  if (b.degree() < 0) {
    return a; // GCD with zero polynomial is the other polynomial
  }

  while (b.degree() >= 0) {
    const { remainder } = this.polynomialDivision(a, b);
    a = b;
    b = remainder;
  }

  return a;
};

/**
 * Create a matrix algebra structure
 * @param {Array} matrices - Set of matrices
 * @param {Object} options - Additional options
 * @returns {Object} - Matrix algebra with operations
 */
advancedAlgebra.createMatrixAlgebra = function (matrices, options = {}) {
  const n = options.dimension || matrices[0].length;

  // Check if all matrices have the same dimension
  for (const m of matrices) {
    if (m.length !== n || m.some((row) => row.length !== n)) {
      throw new Error('All matrices must have the same dimension');
    }
  }

  return {
    matrices,
    dimension: n,

    // Matrix addition
    add(A, B) {
      return A.map((row, i) => row.map((value, j) => value + B[i][j]));
    },

    // Matrix multiplication
    multiply(A, B) {
      const result = Array(n).fill().map(() => Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < n; k++) {
            result[i][j] += A[i][k] * B[k][j];
          }
        }
      }

      return result;
    },

    // Scalar multiplication
    scalarMultiply(scalar, A) {
      return A.map((row) => row.map((value) => scalar * value));
    },

    // Matrix determinant
    determinant(A) {
      if (n === 1) {
        return A[0][0];
      }
      if (n === 2) {
        return A[0][0] * A[1][1] - A[0][1] * A[1][0];
      }

      let det = 0;

      // Expand along first row
      for (let j = 0; j < n; j++) {
        // Create minor by removing first row and column j
        const minor = [];
        for (let i = 1; i < n; i++) {
          const row = [];
          for (let k = 0; k < n; k++) {
            if (k !== j) {
              row.push(A[i][k]);
            }
          }
          minor.push(row);
        }

        // Add term to determinant
        const sign = j % 2 === 0 ? 1 : -1;
        det += sign * A[0][j] * this.determinant(minor);
      }

      return det;
    },

    // Matrix inverse
    inverse(A) {
      const det = this.determinant(A);
      if (det === 0) {
        throw new Error('Matrix is not invertible');
      }

      if (n === 1) {
        return [[1 / A[0][0]]];
      }

      // Create adjugate matrix
      const adjugate = Array(n).fill().map(() => Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          // Create minor by removing row i and column j
          const minor = [];
          for (let r = 0; r < n; r++) {
            if (r !== i) {
              const row = [];
              for (let c = 0; c < n; c++) {
                if (c !== j) {
                  row.push(A[r][c]);
                }
              }
              minor.push(row);
            }
          }

          // Calculate cofactor
          const sign = (i + j) % 2 === 0 ? 1 : -1;
          adjugate[j][i] = sign * this.determinant(minor);
        }
      }

      // Divide adjugate by determinant
      return adjugate.map((row) => row.map((value) => value / det));
    }
  };
};

/**
 * Create a modular ring Z/nZ
 * @param {number} n - Modulus
 * @returns {Object} - Modular ring structure
 */
advancedAlgebra.createModularRing = function (n) {
  if (n <= 1) {
    throw new Error('Modulus must be greater than 1');
  }

  const elements = Array.from({ length: n }, (_, i) => i);

  const addition = (a, b) => (a + b) % n;
  const multiplication = (a, b) => (a * b) % n;

  const structure = this.createRing(elements, addition, multiplication, {
    addIdentity: 0,
    multIdentity: 1
  });

  // Add modular exponentiation
  structure.power = function (base, exponent) {
    if (exponent < 0) {
      // For negative exponents, find modular inverse and use positive exponent
      base = this.extendedEuclidean(base, n)[0];
      exponent = -exponent;
    }

    let result = 1;
    base %= n;

    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % n;
      }
      exponent = Math.floor(exponent / 2);
      base = (base * base) % n;
    }

    return result;
  };

  // Extended Euclidean algorithm for modular inverse
  structure.extendedEuclidean = function (a, b) {
    if (b === 0) {
      return [1, 0, a];
    }

    const [x, y, gcd] = this.extendedEuclidean(b, a % b);
    return [y, x - Math.floor(a / b) * y, gcd];
  };

  return structure;
};

/**
 * Create a Galois field GF(p^n)
 * @param {number} p - Prime characteristic
 * @param {number} n - Extension degree
 * @returns {Object} - Galois field structure
 */
advancedAlgebra.createGaloisField = function (p, n = 1) {
  if (n === 1) {
    // Prime field GF(p)
    if (!this.isPrime(p)) {
      throw new Error('Characteristic must be prime');
    }
    return this.createModularRing(p);
  }

  // Extension field GF(p^n)
  if (!this.isPrime(p)) {
    throw new Error('Characteristic must be prime');
  }

  // TODO: Implement extension fields
  throw new Error('Extension fields not yet implemented');
};

/**
 * Check if a number is prime
 * @param {number} n - Number to check
 * @returns {boolean} - True if prime
 */
advancedAlgebra.isPrime = function (n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
};

/**
 * Create a permutation group on n elements
 * @param {number} n - Number of elements
 * @returns {Object} - Symmetric group S_n
 */
advancedAlgebra.createSymmetricGroup = function (n) {
  // Generate all permutations
  const permutations = [];

  function generate(arr, k) {
    if (k === 1) {
      permutations.push([...arr]);
    } else {
      generate(arr, k - 1);

      for (let i = 0; i < k - 1; i++) {
        if (k % 2 === 0) {
          [arr[i], arr[k - 1]] = [arr[k - 1], arr[i]];
        } else {
          [arr[0], arr[k - 1]] = [arr[k - 1], arr[0]];
        }

        generate(arr, k - 1);
      }
    }
  }

  const arr = Array.from({ length: n }, (_, i) => i);
  generate(arr, n);

  // Define composition operation
  const composition = (p1, p2) => p1.map((i) => p2[i]);

  // Create group
  return this.createGroup(permutations, composition, {
    identity: Array.from({ length: n }, (_, i) => i)
  });
};

/**
 * Create a cyclic group of order n
 * @param {number} n - Order of the group
 * @returns {Object} - Cyclic group Z_n
 */
advancedAlgebra.createCyclicGroup = function (n) {
  const elements = Array.from({ length: n }, (_, i) => i);
  const operation = (a, b) => (a + b) % n;

  return this.createGroup(elements, operation, { identity: 0 });
};

/**
 * Calculate the Chinese Remainder Theorem solution
 * @param {Array} remainders - Array of remainders
 * @param {Array} moduli - Array of moduli
 * @returns {number} - Solution x such that x ≡ remainders[i] (mod moduli[i])
 */
advancedAlgebra.chineseRemainderTheorem = function (remainders, moduli) {
  if (remainders.length !== moduli.length) {
    throw new Error('Number of remainders must match number of moduli');
  }

  // Check if moduli are pairwise coprime
  for (let i = 0; i < moduli.length; i++) {
    for (let j = i + 1; j < moduli.length; j++) {
      if (this.gcd(moduli[i], moduli[j]) !== 1) {
        throw new Error('Moduli must be pairwise coprime');
      }
    }
  }

  const product = moduli.reduce((acc, m) => acc * m, 1);
  let result = 0;

  for (let i = 0; i < remainders.length; i++) {
    const m = moduli[i];
    const mi = product / m;
    const [inv] = this.extendedEuclidean(mi, m);

    result += (remainders[i] * mi * (inv % m)) % product;
  }

  return result % product;
};

/**
 * Extended Euclidean algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {Array} - [x, y, gcd] where ax + by = gcd(a, b)
 */
advancedAlgebra.extendedEuclidean = function (a, b) {
  if (b === 0) {
    return [1, 0, a];
  }

  const [x, y, gcd] = this.extendedEuclidean(b, a % b);
  return [y, x - Math.floor(a / b) * y, gcd];
};

/**
 * Calculate the greatest common divisor
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - GCD of a and b
 */
advancedAlgebra.gcd = function (a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  if (b > a) [a, b] = [b, a];

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a;
};

/**
 * Calculate the least common multiple
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - LCM of a and b
 */
advancedAlgebra.lcm = function (a, b) {
  return Math.abs(a * b) / this.gcd(a, b);
};

module.exports = advancedAlgebra;
