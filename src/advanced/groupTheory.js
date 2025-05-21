/**
 * Group Theory Module for herta.js
 * Provides tools for working with groups, group operations, representations, and symmetry
 */

const arithmetic = require('../core/arithmetic');

const groupTheory = {};

/**
 * Check if a binary operation forms a group on a set
 * @param {Array} set - The set of elements
 * @param {Function} operation - Binary operation function(a, b)
 * @returns {Object} - Result of group axiom checks
 */
groupTheory.isGroup = function (set, operation) {
  // Create operation table for efficient lookup
  const table = new Map();
  for (const a of set) {
    table.set(a, new Map());
    for (const b of set) {
      table.get(a).set(b, operation(a, b));
    }
  }

  // Check closure
  const closure = set.every((a) => set.every((b) => {
    const result = table.get(a).get(b);
    return set.some((e) => e === result);
  }));

  if (!closure) {
    return { isGroup: false, reason: 'Not closed under operation' };
  }

  // Check associativity
  const associative = set.every((a) => set.every((b) => set.every((c) => {
    const ab_c = operation(table.get(a).get(b), c);
    const a_bc = operation(a, table.get(b).get(c));
    return ab_c === a_bc;
  })));

  if (!associative) {
    return { isGroup: false, reason: 'Operation is not associative' };
  }

  // Find identity element
  let identity = null;
  for (const e of set) {
    if (set.every((a) => table.get(e).get(a) === a && table.get(a).get(e) === a)) {
      identity = e;
      break;
    }
  }

  if (identity === null) {
    return { isGroup: false, reason: 'No identity element' };
  }

  // Check for inverses
  const hasInverses = set.every((a) => set.some((b) => table.get(a).get(b) === identity && table.get(b).get(a) === identity));

  if (!hasInverses) {
    return { isGroup: false, reason: 'Not all elements have inverses' };
  }

  // Check if abelian (commutative)
  const abelian = set.every((a) => set.every((b) => table.get(a).get(b) === table.get(b).get(a)));

  return {
    isGroup: true,
    identity,
    abelian
  };
};

/**
 * Find the inverse of an element in a group
 * @param {*} element - Element to find inverse for
 * @param {Array} set - The group elements
 * @param {Function} operation - Group operation
 * @param {*} identity - Identity element of the group
 * @returns {*} - Inverse element or null if not found
 */
groupTheory.findInverse = function (element, set, operation, identity) {
  for (const a of set) {
    if (operation(element, a) === identity && operation(a, element) === identity) {
      return a;
    }
  }

  return null;
};

/**
 * Generate the Cayley table for a group
 * @param {Array} set - The group elements
 * @param {Function} operation - Group operation
 * @returns {Array} - 2D array representing the Cayley table
 */
groupTheory.cayleyTable = function (set, operation) {
  const table = [];

  // Header row
  table.push([null, ...set]);

  // Fill in table
  for (const a of set) {
    const row = [a];
    for (const b of set) {
      row.push(operation(a, b));
    }
    table.push(row);
  }

  return table;
};

/**
 * Find all subgroups of a group
 * @param {Array} set - The group elements
 * @param {Function} operation - Group operation
 * @param {*} identity - Identity element of the group
 * @returns {Array} - Array of subgroups (each subgroup is an array of elements)
 */
groupTheory.findSubgroups = function (set, operation, identity) {
  const subgroups = [];
  const powerSet = this._generatePowerSet(set);

  // Always include the trivial subgroup
  subgroups.push([identity]);

  // Check each subset
  for (const subset of powerSet) {
    // Skip empty set and single element identity (already added)
    if (subset.length <= 1) continue;

    // Must contain identity
    if (!subset.includes(identity)) continue;

    // Check if closed under operation
    const closed = subset.every((a) => subset.every((b) => {
      const result = operation(a, b);
      return subset.some((e) => e === result);
    }));

    if (!closed) continue;

    // Check if every element has an inverse in the subset
    const hasInverses = subset.every((a) => subset.some((b) => operation(a, b) === identity && operation(b, a) === identity));

    if (!hasInverses) continue;

    // We found a subgroup
    subgroups.push(subset);
  }

  return subgroups;
};

/**
 * Generate the power set (all possible subsets) of a set
 * @private
 * @param {Array} set - The set
 * @returns {Array} - Array of all subsets
 */
groupTheory._generatePowerSet = function (set) {
  const result = [[]];

  for (const item of set) {
    const { length } = result;
    for (let i = 0; i < length; i++) {
      result.push([...result[i], item]);
    }
  }

  return result;
};

/**
 * Find the order of an element in a group
 * @param {*} element - Group element
 * @param {Function} operation - Group operation
 * @param {*} identity - Identity element
 * @returns {number} - Order of the element
 */
groupTheory.elementOrder = function (element, operation, identity) {
  let current = element;
  let order = 1;

  while (current !== identity) {
    current = operation(current, element);
    order++;

    // Safeguard against infinite loops
    if (order > 1000) {
      return Infinity; // Element doesn't have finite order
    }
  }

  return order;
};

/**
 * Generate the cyclic group of order n
 * @param {number} n - Order of the group
 * @returns {Object} - Cyclic group representation
 */
groupTheory.cyclicGroup = function (n) {
  if (n <= 0) {
    throw new Error('Group order must be positive');
  }

  // Create elements 0, 1, ..., n-1
  const elements = Array.from({ length: n }, (_, i) => i);

  // Addition modulo n operation
  const operation = (a, b) => (a + b) % n;

  // 0 is the identity
  const identity = 0;

  return {
    elements,
    operation,
    identity,
    name: `Z${n}`,
    abelian: true
  };
};

/**
 * Generate the dihedral group D_n (symmetries of regular n-gon)
 * @param {number} n - Number of sides of the regular polygon
 * @returns {Object} - Dihedral group representation
 */
groupTheory.dihedralGroup = function (n) {
  if (n < 3) {
    throw new Error('Dihedral group requires n >= 3');
  }

  // Create elements: rotations r^0, r^1, ..., r^(n-1) and
  // reflections s, sr, sr^2, ..., sr^(n-1)
  const elements = [];
  for (let i = 0; i < n; i++) {
    elements.push(`r${i}`); // Rotation by i*360/n degrees
  }
  for (let i = 0; i < n; i++) {
    elements.push(`s${i}`); // Reflection across line from center to vertex i
  }

  // Define operation based on relations: r^n = s^2 = 1, srs = r^(-1)
  const operation = (a, b) => {
    // Parse elements
    const aType = a.charAt(0);
    const aExp = parseInt(a.substring(1)) % n;
    const bType = b.charAt(0);
    const bExp = parseInt(b.substring(1)) % n;

    if (aType === 'r' && bType === 'r') {
      // Rotation * Rotation = Rotation
      return `r${(aExp + bExp) % n}`;
    } if (aType === 's' && bType === 'r') {
      // Reflection * Rotation = Reflection
      return `s${(aExp - bExp + n) % n}`;
    } if (aType === 'r' && bType === 's') {
      // Rotation * Reflection = Reflection
      return `s${(aExp + bExp) % n}`;
    } if (aType === 's' && bType === 's') {
      // Reflection * Reflection = Rotation
      return `r${(aExp - bExp + n) % n}`;
    }

    throw new Error('Invalid group elements');
  };

  // r^0 is the identity
  const identity = 'r0';

  return {
    elements,
    operation,
    identity,
    name: `D${n}`,
    abelian: n === 2 // Only D_2 is abelian
  };
};

/**
 * Generate the symmetric group S_n (permutations of n elements)
 * @param {number} n - Number of elements to permute
 * @returns {Object} - Symmetric group representation
 */
groupTheory.symmetricGroup = function (n) {
  if (n <= 0) {
    throw new Error('Group order must be positive');
  }

  // Helper function to generate all permutations
  function permutations(arr) {
    if (arr.length <= 1) return [arr];

    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const remainingPerms = permutations(remaining);

      for (const perm of remainingPerms) {
        result.push([current, ...perm]);
      }
    }

    return result;
  }

  // Elements are permutations of [0, 1, ..., n-1]
  const base = Array.from({ length: n }, (_, i) => i);
  const elements = permutations(base);

  // Format elements for easier reading
  const formattedElements = elements.map((perm) => JSON.stringify(perm));

  // Composition of permutations: (f∘g)(x) = f(g(x))
  const operation = (a, b) => {
    const permA = JSON.parse(a);
    const permB = JSON.parse(b);

    const result = new Array(n);
    for (let i = 0; i < n; i++) {
      result[i] = permA[permB[i]];
    }

    return JSON.stringify(result);
  };

  // Identity permutation [0, 1, ..., n-1]
  const identity = JSON.stringify(base);

  return {
    elements: formattedElements,
    operation,
    identity,
    name: `S${n}`,
    abelian: n <= 2 // Only S_1 and S_2 are abelian
  };
};

/**
 * Find the direct product G × H of two groups
 * @param {Object} G - First group with elements and operation
 * @param {Object} H - Second group with elements and operation
 * @returns {Object} - Direct product group
 */
groupTheory.directProduct = function (G, H) {
  // Elements are pairs (g, h) where g ∈ G and h ∈ H
  const elements = [];
  for (const g of G.elements) {
    for (const h of H.elements) {
      elements.push(JSON.stringify([g, h]));
    }
  }

  // Operation: (g1, h1) * (g2, h2) = (g1 * g2, h1 * h2)
  const operation = (a, b) => {
    const [g1, h1] = JSON.parse(a);
    const [g2, h2] = JSON.parse(b);

    const gResult = G.operation(g1, g2);
    const hResult = H.operation(h1, h2);

    return JSON.stringify([gResult, hResult]);
  };

  // Identity is (e_G, e_H)
  const identity = JSON.stringify([G.identity, H.identity]);

  return {
    elements,
    operation,
    identity,
    name: `${G.name}×${H.name}`,
    abelian: G.abelian && H.abelian
  };
};

/**
 * Test if a subset forms a normal subgroup
 * @param {Array} subset - Potential normal subgroup elements
 * @param {Array} set - Group elements
 * @param {Function} operation - Group operation
 * @returns {boolean} - True if subset is a normal subgroup
 */
groupTheory.isNormalSubgroup = function (subset, set, operation) {
  // First check if it's a subgroup
  const identity = subset.find((e) => subset.every((a) => operation(e, a) === a && operation(a, e) === a));

  if (!identity) return false;

  // Check closure
  const closed = subset.every((a) => subset.every((b) => {
    const result = operation(a, b);
    return subset.some((e) => e === result);
  }));

  if (!closed) return false;

  // Check if every element has an inverse
  const hasInverses = subset.every((a) => subset.some((b) => operation(a, b) === identity && operation(b, a) === identity));

  if (!hasInverses) return false;

  // Check normality: gNg^(-1) ⊆ N for all g ∈ G
  for (const g of set) {
    // Find g^(-1)
    const gInv = this.findInverse(g, set, operation, identity);

    // Check conjugation of every element in the subgroup
    for (const n of subset) {
      const gng = operation(operation(g, n), gInv);

      if (!subset.some((e) => e === gng)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Generate cosets of a subgroup
 * @param {Array} subgroup - Subgroup elements
 * @param {Array} group - Group elements
 * @param {Function} operation - Group operation
 * @param {boolean} [right=false] - If true, generate right cosets
 * @returns {Array} - Array of cosets (each coset is an array of elements)
 */
groupTheory.generateCosets = function (subgroup, group, operation, right = false) {
  const cosets = [];
  const represented = new Set();

  for (const g of group) {
    // Skip if g is already in a coset
    if (represented.has(g)) continue;

    const coset = [];

    for (const h of subgroup) {
      const element = right ? operation(h, g) : operation(g, h);
      coset.push(element);
      represented.add(element);
    }

    cosets.push(coset);
  }

  return cosets;
};

/**
 * Calculate the character table of a small group
 * @param {Object} group - Group with elements, operation, and identity
 * @returns {Object} - Character table and irreducible representations
 */
groupTheory.characterTable = function (group) {
  // Note: This is a simplified version for very small groups
  // A full implementation would use more advanced techniques

  const n = group.elements.length;

  // Find conjugacy classes
  const classes = [];
  const processed = new Set();

  for (const g of group.elements) {
    if (processed.has(g)) continue;

    const conjugacyClass = [];

    for (const x of group.elements) {
      const xInv = this.findInverse(x, group.elements, group.operation, group.identity);
      const xgx = group.operation(group.operation(x, g), xInv);

      if (!conjugacyClass.includes(xgx)) {
        conjugacyClass.push(xgx);
      }

      processed.add(xgx);
    }

    classes.push(conjugacyClass);
  }

  // For abelian groups, each element is its own conjugacy class
  const numClasses = classes.length;

  // For abelian groups, the character table is simple
  if (group.abelian) {
    const table = [];

    // First row is always 1s (identity representation)
    table.push(classes.map(() => 1));

    // For a cyclic group of order n, the characters are nth roots of unity
    if (group.name && group.name.startsWith('Z')) {
      for (let i = 1; i < numClasses; i++) {
        const row = [];

        for (let j = 0; j < numClasses; j++) {
          // e^(2πi*i*j/n)
          const angle = 2 * Math.PI * i * j / n;
          const real = Math.cos(angle);
          const imag = Math.sin(angle);

          // Format as complex number if imaginary part is significant
          const character = Math.abs(imag) < 1e-10
            ? Math.round(real * 1000) / 1000
            : `${Math.round(real * 1000) / 1000}${imag > 0 ? '+' : ''}${Math.round(imag * 1000) / 1000}i`;

          row.push(character);
        }

        table.push(row);
      }
    } else {
      // Generic approach for non-cyclic abelian groups
      // This is a placeholder - full implementation would be more complex
      for (let i = 1; i < numClasses; i++) {
        const row = classes.map((_, j) => (i === j ? -1 : 1));
        table.push(row);
      }
    }

    return {
      classes,
      table
    };
  }

  // For non-abelian groups, return a placeholder
  // A full implementation would require more advanced group theory
  return {
    classes,
    table: [classes.map(() => 1)],
    note: 'Full character table computation for non-abelian groups requires advanced methods'
  };
};

/**
 * Create a matrix representation of a group
 * @param {Array} elements - The group elements
 * @param {Function} operation - Group operation
 * @param {Function} representationMap - Maps group elements to matrices
 * @returns {Object} - The representation object
 */
groupTheory.createRepresentation = function (elements, operation, representationMap) {
  // Validate the representation by checking homomorphism property
  const valid = elements.every((g) => elements.every((h) => {
    const gh = operation(g, h);
    const Rg = representationMap(g);
    const Rh = representationMap(h);
    const Rgh = representationMap(gh);

    // Matrix multiplication to verify Φ(g·h) = Φ(g)·Φ(h)
    const RgRh = matrixMultiply(Rg, Rh);
    return matrixEquals(RgRh, Rgh);
  }));

  if (!valid) {
    throw new Error('Invalid representation: homomorphism property violated');
  }

  return {
    elements,
    operation,
    map: representationMap,

    /**
     * Get the character (trace) of a group element's representation
     * @param {*} element - Group element
     * @returns {number} - Character value (trace of matrix)
     */
    character(element) {
      const matrix = representationMap(element);
      return matrixTrace(matrix);
    },

    /**
     * Check if this representation is irreducible
     * @returns {boolean} - True if representation is irreducible
     */
    isIrreducible() {
      // For small groups, we can use character orthogonality
      const characters = elements.map((g) => this.character(g));
      const innerProduct = Math.abs(elements.reduce((sum, g, i) => sum + characters[i] * characters[i], 0) / elements.length);

      // For irreducible representations, <χ,χ> = 1
      return Math.abs(innerProduct - 1) < 1e-10;
    }
  };
};

/**
 * Decompose a representation into irreducible components
 * @param {Object} representation - The group representation to decompose
 * @param {Array} irreps - Array of irreducible representations
 * @returns {Array} - Multiplicities of each irreducible component
 */
groupTheory.decomposeRepresentation = function (representation, irreps) {
  const { elements } = representation;
  const n = elements.length;

  // Calculate character of the representation
  const chi = elements.map((g) => representation.character(g));

  // Calculate multiplicities using character orthogonality
  const multiplicities = irreps.map((irrep) => {
    const irrep_chi = elements.map((g) => irrep.character(g));

    // For complex representations, we need the complex conjugate
    const conjIrrepChi = irrep_chi.map((x) => {
      if (typeof x === 'number') {
        return x; // Real numbers are their own conjugates
      } if (typeof x === 'object' && 're' in x && 'im' in x) {
        // Complex conjugate: (a + bi)* = a - bi
        return {
          re: x.re,
          im: -x.im
        };
      }
      // Handle any other potential format
      console.warn('Unknown format for character value:', x);
      return x;
    });

    // Inner product of characters gives multiplicity
    const innerProduct = elements.reduce((sum, g, i) => {
      // Handle the complex multiplication and addition
      if (typeof chi[i] === 'number' && typeof conjIrrepChi[i] === 'number') {
        return sum + chi[i] * conjIrrepChi[i];
      }
      // At least one is complex
      const a = typeof chi[i] === 'number' ? { re: chi[i], im: 0 } : chi[i];
      const b = typeof conjIrrepChi[i] === 'number' ? { re: conjIrrepChi[i], im: 0 } : conjIrrepChi[i];

      // Complex multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
      const product = {
        re: a.re * b.re - a.im * b.im,
        im: a.re * b.im + a.im * b.re
      };

      // For inner product we only care about the real part
      return sum + product.re;
    }, 0) / n;

    return Math.round(innerProduct); // Should be an integer
  });

  return multiplicities;
};

/**
 * Find all automorphisms of a group
 * @param {Array} elements - The group elements
 * @param {Function} operation - Group operation
 * @returns {Array} - Array of automorphism functions
 */
groupTheory.findAutomorphisms = function (elements, operation) {
  const n = elements.length;
  const identity = elements.find((e) => elements.every((a) => operation(e, a) === a && operation(a, e) === a));

  if (!identity) {
    throw new Error('Group must have an identity element');
  }

  // Generate all bijections from elements to elements
  const bijections = [];

  // Start with the identity map
  const identityMap = {};
  elements.forEach((e) => identityMap[e] = e);
  bijections.push(identityMap);

  // Too expensive to generate all permutations for large groups
  // For small groups, we can try all permutations
  if (n <= 8) { // Practical limit
    // Generate permutations and verify they are automorphisms
    this._generatePermutations(elements, identity)
      .forEach((perm) => {
        const map = {};
        elements.forEach((e, i) => map[e] = perm[i]);

        // Check if it's a homomorphism
        const isAutomorphism = elements.every((a) => elements.every((b) => {
          const ab = operation(a, b);
          const map_a = map[a];
          const map_b = map[b];
          const map_ab = map[ab];
          const map_a_map_b = operation(map_a, map_b);

          return map_a_map_b === map_ab;
        }));

        if (isAutomorphism && !bijections.some((b) => elements.every((e) => b[e] === map[e]))) {
          bijections.push(map);
        }
      });
  }

  // Convert maps to functions
  return bijections.map((map) => function (element) {
    return map[element];
  });
};

/**
 * Generate permutations of elements keeping identity fixed
 * @private
 * @param {Array} elements - Array of elements
 * @param {*} identity - Identity element to keep fixed
 * @returns {Array} - Array of permutations
 */
groupTheory._generatePermutations = function (elements, identity) {
  const result = [];
  const nonIdentity = elements.filter((e) => e !== identity);

  // Recursively generate permutations
  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      // Add identity at the beginning
      result.push([identity, ...m]);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  };

  permute(nonIdentity);
  return result;
};

/**
 * Create one of the 17 wallpaper groups (crystallographic plane groups)
 * @param {string} groupName - Name of the wallpaper group
 * @returns {Object} - Wallpaper group object
 */
groupTheory.wallpaperGroup = function (groupName) {
  // Validate group name
  const validGroups = [
    'p1', 'p2', 'pm', 'pg', 'cm', 'pmm', 'pmg', 'pgg', 'cmm',
    'p4', 'p4m', 'p4g', 'p3', 'p3m1', 'p31m', 'p6', 'p6m'
  ];

  if (!validGroups.includes(groupName)) {
    throw new Error(`Invalid wallpaper group: ${groupName}. Must be one of: ${validGroups.join(', ')}`);
  }

  // Create generators for the group
  let generators = [];

  // Define basic transformations
  const translation = (tx, ty) => function (x, y) {
    return [x + tx, y + ty];
  };

  const rotation = (cx, cy, angle) => {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return function (x, y) {
      const dx = x - cx;
      const dy = y - cy;
      return [
        cx + dx * cos - dy * sin,
        cy + dx * sin + dy * cos
      ];
    };
  };

  const reflection = (px, py, nx, ny) => {
    // Normalize the normal vector
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len;
    ny /= len;

    return function (x, y) {
      const dx = x - px;
      const dy = y - py;
      const dot = dx * nx + dy * ny;
      return [
        x - 2 * dot * nx,
        y - 2 * dot * ny
      ];
    };
  };

  const glideReflection = (px, py, nx, ny, tx, ty) => {
    const reflect = reflection(px, py, nx, ny);
    const translate = translation(tx, ty);

    return function (x, y) {
      const [rx, ry] = reflect(x, y);
      return translate(rx, ry);
    };
  };

  // Define generators based on group type
  switch (groupName) {
    case 'p1':
      // Group p1: Only translations (primitive cell)
      generators = [
        translation(1, 0),
        translation(0, 1)
      ];
      break;

    case 'p2':
      // Group p2: Translations and 180° rotations
      generators = [
        translation(1, 0),
        translation(0, 1),
        rotation(0, 0, 180)
      ];
      break;

    case 'pm':
      // Group pm: Translations and reflection across horizontal axis
      generators = [
        translation(1, 0),
        translation(0, 1),
        reflection(0, 0, 0, 1)
      ];
      break;

    case 'pg':
      // Group pg: Translations and glide reflection
      generators = [
        translation(1, 0),
        translation(0, 1),
        glideReflection(0, 0, 0, 1, 0.5, 0)
      ];
      break;

    case 'cm':
      // Group cm: Translations with centered cell and mirror
      generators = [
        translation(1, 0),
        translation(0, 1),
        translation(0.5, 0.5),
        reflection(0, 0, 1, 1)
      ];
      break;

    case 'pmm':
      // Group pmm: Translations and reflections in both axes
      generators = [
        translation(1, 0),
        translation(0, 1),
        reflection(0, 0, 1, 0), // Vertical mirror
        reflection(0, 0, 0, 1) // Horizontal mirror
      ];
      break;

    case 'pmg':
      // Group pmg: Translations, reflection, and glide reflection
      generators = [
        translation(1, 0),
        translation(0, 1),
        reflection(0, 0, 0, 1), // Horizontal mirror
        rotation(0.5, 0, 180) // 180° rotation at (0.5, 0)
      ];
      break;

    case 'pgg':
      // Group pgg: Translations and glide reflections
      generators = [
        translation(1, 0),
        translation(0, 1),
        rotation(0.5, 0.5, 180), // 180° rotation at (0.5, 0.5)
        glideReflection(0, 0, 1, 0, 0, 0.5) // Glide reflection
      ];
      break;

    case 'cmm':
      // Group cmm: Translations, reflections, with centered cell
      generators = [
        translation(1, 0),
        translation(0, 1),
        translation(0.5, 0.5),
        reflection(0, 0, 1, 0), // Vertical mirror
        reflection(0, 0, 0, 1) // Horizontal mirror
      ];
      break;

    case 'p4':
      // Group p4: Translations and 90° rotation (4-fold)
      generators = [
        translation(1, 0),
        translation(0, 1),
        rotation(0, 0, 90)
      ];
      break;

    case 'p4m':
      // Group p4m: Translations, 90° rotation, and reflections
      generators = [
        translation(1, 0),
        translation(0, 1),
        rotation(0, 0, 90), // 4-fold rotation
        reflection(0, 0, 1, 0) // Vertical mirror
      ];
      break;

    case 'p4g':
      // Group p4g: Translations, 90° rotation, and glide reflections
      generators = [
        translation(1, 0),
        translation(0, 1),
        rotation(0, 0, 90), // 4-fold rotation
        reflection(0.5, 0.5, 1, 1) // Diagonal mirror through (0.5, 0.5)
      ];
      break;

    case 'p3':
      // Group p3: Translations and 120° rotation (3-fold)
      generators = [
        translation(1, 0),
        translation(-0.5, Math.sqrt(3) / 2), // Hexagonal lattice
        rotation(0, 0, 120)
      ];
      break;

    case 'p3m1':
      // Group p3m1: Translations, 120° rotation, and reflections
      generators = [
        translation(1, 0),
        translation(-0.5, Math.sqrt(3) / 2), // Hexagonal lattice
        rotation(0, 0, 120), // 3-fold rotation
        reflection(0, 0, 0, 1) // Horizontal mirror
      ];
      break;

    case 'p31m':
      // Group p31m: Translations, 120° rotation, and different reflection axis
      generators = [
        translation(1, 0),
        translation(-0.5, Math.sqrt(3) / 2), // Hexagonal lattice
        rotation(0, 0, 120), // 3-fold rotation
        reflection(0, 0, 1, Math.sqrt(3)) // Mirror along diagonal
      ];
      break;

    case 'p6':
      // Group p6: Translations and 60° rotation (6-fold)
      generators = [
        translation(1, 0),
        translation(-0.5, Math.sqrt(3) / 2), // Hexagonal lattice
        rotation(0, 0, 60) // 6-fold rotation
      ];
      break;

    case 'p6m':
      // Group p6m: Translations, 60° rotation, and reflections
      generators = [
        translation(1, 0),
        translation(-0.5, Math.sqrt(3) / 2), // Hexagonal lattice
        rotation(0, 0, 60), // 6-fold rotation
        reflection(0, 0, 1, 0) // Vertical mirror
      ];
      break;

    default:
      throw new Error(`Implementation for wallpaper group '${groupName}' is not complete`);
  }

  return {
    name: groupName,
    generators,

    /**
     * Apply the group element to a point
     * @param {number} element - Index of the group element
     * @param {Array} point - [x, y] coordinates
     * @returns {Array} - Transformed point
     */
    transform(element, point) {
      if (element < 0 || element >= this.generators.length) {
        throw new Error(`Invalid element index: ${element}`);
      }

      return this.generators[element](point[0], point[1]);
    },

    /**
     * Generate a pattern by applying the group to a motif
     * @param {Function} motif - Function that draws a motif at a point
     * @param {number} xMin - Minimum x coordinate
     * @param {number} xMax - Maximum x coordinate
     * @param {number} yMin - Minimum y coordinate
     * @param {number} yMax - Maximum y coordinate
     * @param {number} resolution - Grid resolution
     * @returns {Array} - Array of transformed motifs
     */
    generatePattern(motif, xMin, xMax, yMin, yMax, resolution = 10) {
      const points = [];

      // Generate a grid of points
      for (let x = xMin; x <= xMax; x += resolution) {
        for (let y = yMin; y <= yMax; y += resolution) {
          // Apply all combinations of generators
          const transformedPoints = this._applyGenerators([x, y]);
          transformedPoints.forEach((p) => {
            if (p[0] >= xMin && p[0] <= xMax && p[1] >= yMin && p[1] <= yMax) {
              points.push(p);
            }
          });
        }
      }

      // Apply motif to each point
      return points.map((p) => ({
        point: p,
        drawing: motif(p[0], p[1])
      }));
    },

    /**
     * Apply all combinations of generators to a point
     * @private
     * @param {Array} point - [x, y] coordinates
     * @param {number} depth - Maximum recursion depth
     * @returns {Array} - Array of transformed points
     */
    _applyGenerators(point, depth = 3) {
      if (depth === 0) return [point];

      const points = [point];

      for (const generator of this.generators) {
        const transformed = generator(point[0], point[1]);

        // Check if this point is already in the list
        if (!points.some((p) => Math.abs(p[0] - transformed[0]) < 1e-10
                           && Math.abs(p[1] - transformed[1]) < 1e-10)) {
          points.push(transformed);

          // Recursively apply generators to this new point
          const nextPoints = this._applyGenerators(transformed, depth - 1);
          nextPoints.forEach((p) => {
            if (!points.some((existing) => Math.abs(existing[0] - p[0]) < 1e-10
                && Math.abs(existing[1] - p[1]) < 1e-10)) {
              points.push(p);
            }
          });
        }
      }

      return points;
    }
  };
};

/**
 * Define the quaternion group Q8
 * @returns {Object} - Quaternion group representation
 */
groupTheory.quaternionGroup = function () {
  // Elements: 1, -1, i, -i, j, -j, k, -k
  const elements = [
    { symbol: '1', values: [1, 0, 0, 0] }, // Real quaternion 1
    { symbol: '-1', values: [-1, 0, 0, 0] }, // Real quaternion -1
    { symbol: 'i', values: [0, 1, 0, 0] }, // i
    { symbol: '-i', values: [0, -1, 0, 0] }, // -i
    { symbol: 'j', values: [0, 0, 1, 0] }, // j
    { symbol: '-j', values: [0, 0, -1, 0] }, // -j
    { symbol: 'k', values: [0, 0, 0, 1] }, // k
    { symbol: '-k', values: [0, 0, 0, -1] } // -k
  ];

  // Quaternion multiplication
  const operation = function (a, b) {
    const [a0, a1, a2, a3] = a.values;
    const [b0, b1, b2, b3] = b.values;

    const result = [
      a0 * b0 - a1 * b1 - a2 * b2 - a3 * b3, // Real part
      a0 * b1 + a1 * b0 + a2 * b3 - a3 * b2, // i coefficient
      a0 * b2 - a1 * b3 + a2 * b0 + a3 * b1, // j coefficient
      a0 * b3 + a1 * b2 - a2 * b1 + a3 * b0 // k coefficient
    ];

    // Find the matching element
    return elements.find((e) => e.values.every((v, i) => Math.abs(v - result[i]) < 1e-10));
  };

  return {
    elements,
    operation,
    identity: elements[0], // 1 is the identity
    name: 'Q8',
    description: 'Quaternion group of order 8'
  };
};

// Matrix utility functions
function matrixMultiply(A, B) {
  const m = A.length;
  const n = B[0].length;
  const p = A[0].length;

  const C = Array(m).fill().map(() => Array(n).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < p; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return C;
}

function matrixEquals(A, B, epsilon = 1e-10) {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    return false;
  }

  const m = A.length;
  const n = A[0].length;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(A[i][j] - B[i][j]) > epsilon) {
        return false;
      }
    }
  }

  return true;
}

function matrixTrace(A) {
  let trace = 0;
  const n = Math.min(A.length, A[0].length);

  for (let i = 0; i < n; i++) {
    trace += A[i][i];
  }

  return trace;
}

module.exports = groupTheory;
