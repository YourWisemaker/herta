/**
 * Discrete Mathematics module for herta.js
 * Provides combinatorial functions and discrete structures
 */

const arithmetic = require('../core/arithmetic');

const discreteMath = {};

/**
 * Calculate the binomial coefficient (n choose k)
 * @param {number} n - Total number of items
 * @param {number} k - Number of items to choose
 * @returns {number} - Binomial coefficient (n choose k)
 */
discreteMath.binomialCoefficient = function(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Optimize for large values
  if (k > n - k) {
    k = n - k;
  }
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - (k - i));
    result /= i;
  }
  
  return Math.round(result); // To handle floating point errors
};

/**
 * Calculate the Stirling number of the first kind
 * @param {number} n - First parameter
 * @param {number} k - Second parameter
 * @returns {number} - Stirling number of the first kind s(n,k)
 */
discreteMath.stirlingFirst = function(n, k) {
  if (n === 0 && k === 0) return 1;
  if (n === 0 || k === 0) return 0;
  if (k === 1) return arithmetic.factorial(n - 1);
  if (k === n) return 1;
  
  // Recurrence relation: s(n,k) = s(n-1,k-1) - (n-1)*s(n-1,k)
  return this.stirlingFirst(n - 1, k - 1) - (n - 1) * this.stirlingFirst(n - 1, k);
};

/**
 * Calculate the Stirling number of the second kind
 * @param {number} n - First parameter
 * @param {number} k - Second parameter
 * @returns {number} - Stirling number of the second kind S(n,k)
 */
discreteMath.stirlingSecond = function(n, k) {
  if (n === 0 && k === 0) return 1;
  if (n === 0 || k === 0) return 0;
  if (k === 1 || k === n) return 1;
  
  // Recurrence relation: S(n,k) = k*S(n-1,k) + S(n-1,k-1)
  return k * this.stirlingSecond(n - 1, k) + this.stirlingSecond(n - 1, k - 1);
};

/**
 * Calculate the Bell number (total number of partitions of a set)
 * @param {number} n - Size of the set
 * @returns {number} - Bell number
 */
discreteMath.bellNumber = function(n) {
  if (n === 0) return 1;
  
  // Compute using Stirling numbers of the second kind
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    sum += this.stirlingSecond(n, k);
  }
  
  return sum;
};

/**
 * Calculate the Catalan number
 * @param {number} n - Parameter for Catalan number
 * @returns {number} - nth Catalan number
 */
discreteMath.catalanNumber = function(n) {
  return this.binomialCoefficient(2 * n, n) / (n + 1);
};

/**
 * Generate all permutations of an array
 * @param {Array} arr - Input array
 * @returns {Array} - Array of all permutations
 */
discreteMath.permutations = function(arr) {
  const result = [];
  
  // Helper function to generate permutations
  function permute(arr, m = []) {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }
  
  permute(arr);
  return result;
};

/**
 * Generate all combinations of k elements from an array
 * @param {Array} arr - Input array
 * @param {number} k - Size of each combination
 * @returns {Array} - Array of all k-combinations
 */
discreteMath.combinations = function(arr, k) {
  const result = [];
  
  // Helper function to generate combinations
  function combine(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  
  combine(0, []);
  return result;
};

/**
 * Calculate the number of derangements (permutations with no fixed points)
 * @param {number} n - Number of elements
 * @returns {number} - Number of derangements
 */
discreteMath.derangements = function(n) {
  if (n === 0) return 1;
  if (n === 1) return 0;
  
  // Using the recurrence relation: D(n) = (n-1) * (D(n-1) + D(n-2))
  let prev2 = 1; // D(0)
  let prev1 = 0; // D(1)
  
  for (let i = 2; i <= n; i++) {
    const current = (i - 1) * (prev1 + prev2);
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
};

/**
 * Calculate the partition function (number of ways to partition an integer)
 * @param {number} n - The integer to partition
 * @returns {number} - Number of partitions
 */
discreteMath.partitionFunction = function(n) {
  if (n < 0) return 0;
  if (n === 0) return 1;
  
  // Use dynamic programming
  const partitions = Array(n + 1).fill(0);
  partitions[0] = 1;
  
  for (let i = 1; i <= n; i++) {
    for (let j = i; j <= n; j++) {
      partitions[j] += partitions[j - i];
    }
  }
  
  return partitions[n];
};

/**
 * Generate the power set (set of all subsets) of an array
 * @param {Array} arr - Input array
 * @returns {Array} - Power set
 */
discreteMath.powerSet = function(arr) {
  const result = [[]];
  
  for (const elem of arr) {
    const current = [...result];
    for (const subset of current) {
      result.push([...subset, elem]);
    }
  }
  
  return result;
};

/**
 * Check if a relation is a function
 * @param {Array} domain - Domain elements
 * @param {Array} relation - Array of pairs [x, y] representing the relation
 * @returns {boolean} - Whether the relation is a function
 */
discreteMath.isFunction = function(domain, relation) {
  const mapped = new Set();
  
  for (const [x, y] of relation) {
    if (mapped.has(x)) {
      return false; // A function maps each element to exactly one element
    }
    mapped.add(x);
  }
  
  // Check if all domain elements are mapped
  return domain.every(x => mapped.has(x));
};

/**
 * Check if a function is injective (one-to-one)
 * @param {Array} relation - Array of pairs [x, y] representing the function
 * @returns {boolean} - Whether the function is injective
 */
discreteMath.isInjective = function(relation) {
  const rangeValues = new Set();
  
  for (const [x, y] of relation) {
    if (rangeValues.has(y)) {
      return false; // Not injective if two domain elements map to the same range element
    }
    rangeValues.add(y);
  }
  
  return true;
};

/**
 * Check if a function is surjective (onto)
 * @param {Array} codomain - Codomain elements
 * @param {Array} relation - Array of pairs [x, y] representing the function
 * @returns {boolean} - Whether the function is surjective
 */
discreteMath.isSurjective = function(codomain, relation) {
  const rangeValues = new Set(relation.map(pair => pair[1]));
  
  // Function is surjective if every element in the codomain is mapped to
  return codomain.every(y => rangeValues.has(y));
};

/**
 * Check if a function is bijective (one-to-one and onto)
 * @param {Array} domain - Domain elements
 * @param {Array} codomain - Codomain elements
 * @param {Array} relation - Array of pairs [x, y] representing the function
 * @returns {boolean} - Whether the function is bijective
 */
discreteMath.isBijective = function(domain, codomain, relation) {
  return this.isFunction(domain, relation) && 
         this.isInjective(relation) && 
         this.isSurjective(codomain, relation);
};

/**
 * Generate the composition of two functions
 * @param {Array} f - First function as array of pairs [x, f(x)]
 * @param {Array} g - Second function as array of pairs [x, g(x)]
 * @returns {Array} - Composition g ∘ f as array of pairs [x, g(f(x))]
 */
discreteMath.composeFunction = function(f, g) {
  const composition = [];
  const gMap = new Map(g);
  
  for (const [x, fx] of f) {
    if (gMap.has(fx)) {
      composition.push([x, gMap.get(fx)]);
    }
  }
  
  return composition;
};

/**
 * Generate the inverse of a function (if it exists)
 * @param {Array} f - Function as array of pairs [x, f(x)]
 * @returns {Array|null} - Inverse function or null if no inverse exists
 */
discreteMath.inverseFunctions = function(f) {
  if (!this.isInjective(f)) {
    return null; // Function must be injective to have an inverse
  }
  
  return f.map(([x, y]) => [y, x]);
};

/**
 * Check if a relation is reflexive
 * @param {Array} set - The set of elements
 * @param {Array} relation - Array of pairs [a, b] in the relation
 * @returns {boolean} - Whether the relation is reflexive
 */
discreteMath.isReflexive = function(set, relation) {
  const relationSet = new Set(relation.map(pair => JSON.stringify(pair)));
  
  // Check if (a, a) is in the relation for every a in the set
  return set.every(a => relationSet.has(JSON.stringify([a, a])));
};

/**
 * Check if a relation is symmetric
 * @param {Array} relation - Array of pairs [a, b] in the relation
 * @returns {boolean} - Whether the relation is symmetric
 */
discreteMath.isSymmetric = function(relation) {
  const relationSet = new Set(relation.map(pair => JSON.stringify(pair)));
  
  // Check if (b, a) is in the relation whenever (a, b) is in the relation
  return relation.every(([a, b]) => 
    a === b || relationSet.has(JSON.stringify([b, a]))
  );
};

/**
 * Check if a relation is transitive
 * @param {Array} relation - Array of pairs [a, b] in the relation
 * @returns {boolean} - Whether the relation is transitive
 */
discreteMath.isTransitive = function(relation) {
  const relationMap = new Map();
  
  // Build map for efficient lookup
  for (const [a, b] of relation) {
    if (!relationMap.has(a)) {
      relationMap.set(a, new Set());
    }
    relationMap.get(a).add(b);
  }
  
  // Check transitivity
  for (const [a, bSet] of relationMap.entries()) {
    for (const b of bSet) {
      if (relationMap.has(b)) {
        for (const c of relationMap.get(b)) {
          if (!relationMap.has(a) || !relationMap.get(a).has(c)) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
};

/**
 * Check if a relation is an equivalence relation
 * @param {Array} set - The set of elements
 * @param {Array} relation - Array of pairs [a, b] in the relation
 * @returns {boolean} - Whether the relation is an equivalence relation
 */
discreteMath.isEquivalenceRelation = function(set, relation) {
  return this.isReflexive(set, relation) && 
         this.isSymmetric(relation) && 
         this.isTransitive(relation);
};

/**
 * Generate equivalence classes from an equivalence relation
 * @param {Array} set - The set of elements
 * @param {Array} relation - Array of pairs [a, b] in the equivalence relation
 * @returns {Array} - Array of equivalence classes (each class is an array of elements)
 */
discreteMath.equivalenceClasses = function(set, relation) {
  // Check if the relation is an equivalence relation
  if (!this.isEquivalenceRelation(set, relation)) {
    throw new Error('Relation is not an equivalence relation');
  }
  
  const classes = [];
  const classified = new Set();
  
  // Build relation map for efficient lookup
  const relationMap = new Map();
  for (const [a, b] of relation) {
    if (!relationMap.has(a)) {
      relationMap.set(a, new Set());
    }
    relationMap.get(a).add(b);
  }
  
  // Find equivalence classes
  for (const a of set) {
    if (classified.has(a)) continue;
    
    const eqClass = [a];
    classified.add(a);
    
    // Add all elements equivalent to a
    for (const b of set) {
      if (a !== b && !classified.has(b) && 
          relationMap.has(a) && relationMap.get(a).has(b)) {
        eqClass.push(b);
        classified.add(b);
      }
    }
    
    classes.push(eqClass);
  }
  
  return classes;
};

/**
 * Solve a recurrence relation of the form a(n) = c1*a(n-1) + c2*a(n-2) + ... + ck*a(n-k) + F(n)
 * This implementation handles linear homogeneous recurrence relations (F(n) = 0)
 * @param {Array} coefficients - Coefficients [c1, c2, ..., ck]
 * @param {Array} initialValues - Initial values [a(0), a(1), ..., a(k-1)]
 * @param {number} n - Term to compute
 * @returns {number} - Value of a(n)
 */
discreteMath.linearRecurrence = function(coefficients, initialValues, n) {
  const k = coefficients.length;
  
  if (initialValues.length !== k) {
    throw new Error('Number of initial values must match number of coefficients');
  }
  
  if (n < k) {
    return initialValues[n];
  }
  
  // Matrix method for linear recurrences
  let companion = Array(k).fill().map(() => Array(k).fill(0));
  
  // Set the coefficients in the first row
  for (let j = 0; j < k; j++) {
    companion[0][j] = coefficients[j];
  }
  
  // Set the 1's on the subdiagonal
  for (let i = 1; i < k; i++) {
    companion[i][i-1] = 1;
  }
  
  // Calculate companion^(n-k+1)
  function matrixPower(matrix, power) {
    const size = matrix.length;
    
    // Identity matrix
    let result = Array(size).fill().map((_, i) => 
      Array(size).fill().map((_, j) => i === j ? 1 : 0)
    );
    
    // Binary exponentiation
    let base = matrix.map(row => [...row]);
    
    while (power > 0) {
      if (power % 2 === 1) {
        result = matrixMultiply(result, base);
      }
      base = matrixMultiply(base, base);
      power = Math.floor(power / 2);
    }
    
    return result;
  }
  
  function matrixMultiply(a, b) {
    const m = a.length;
    const n = b[0].length;
    const p = b.length;
    
    const result = Array(m).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < p; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    
    return result;
  }
  
  const poweredMatrix = matrixPower(companion, n - k + 1);
  
  // Calculate a(n) using matrix-vector multiplication
  let result = 0;
  for (let j = 0; j < k; j++) {
    result += poweredMatrix[0][j] * initialValues[k - j - 1];
  }
  
  return result;
};

module.exports = discreteMath;
