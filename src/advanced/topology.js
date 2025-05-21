/**
 * Topology module for herta.js
 * Provides operations on topological spaces and related concepts
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const topology = {};

/**
 * Check if a relation is an equivalence relation
 * @param {Array} set - The set of elements
 * @param {Function} relation - Function that takes two elements and returns true/false
 * @returns {boolean} - Whether the relation is an equivalence relation
 */
topology.isEquivalenceRelation = function(set, relation) {
  // Check reflexivity: a R a for all a
  for (const a of set) {
    if (!relation(a, a)) {
      return false; // Not reflexive
    }
  }
  
  // Check symmetry: a R b implies b R a
  for (const a of set) {
    for (const b of set) {
      if (relation(a, b) !== relation(b, a)) {
        return false; // Not symmetric
      }
    }
  }
  
  // Check transitivity: a R b and b R c implies a R c
  for (const a of set) {
    for (const b of set) {
      for (const c of set) {
        if (relation(a, b) && relation(b, c) && !relation(a, c)) {
          return false; // Not transitive
        }
      }
    }
  }
  
  return true; // All properties satisfied
};

/**
 * Compute equivalence classes for a set with an equivalence relation
 * @param {Array} set - The set of elements
 * @param {Function} relation - Equivalence relation function
 * @returns {Array} - Array of equivalence classes
 */
topology.equivalenceClasses = function(set, relation) {
  const classes = [];
  const classMap = new Map(); // Maps elements to their class index
  
  for (const a of set) {
    // Check if a is already in a class
    if (classMap.has(a)) continue;
    
    // Create a new class for a
    const newClass = [a];
    classMap.set(a, classes.length);
    
    // Add all elements equivalent to a
    for (const b of set) {
      if (a !== b && relation(a, b) && !classMap.has(b)) {
        newClass.push(b);
        classMap.set(b, classes.length);
      }
    }
    
    classes.push(newClass);
  }
  
  return classes;
};

/**
 * Check if a collection of sets forms a topology
 * @param {Array} X - The underlying set (universe)
 * @param {Array} T - Collection of subsets
 * @returns {boolean} - Whether T forms a topology on X
 */
topology.isTopology = function(X, T) {
  // Check if empty set and X are in T
  const hasEmptySet = T.some(set => set.length === 0);
  const hasX = T.some(set => {
    if (set.length !== X.length) return false;
    return X.every(elem => set.includes(elem));
  });
  
  if (!hasEmptySet || !hasX) {
    return false;
  }
  
  // Check for arbitrary unions
  // Since T is finite, we only need to check all possible unions
  const allUnions = [];
  
  // Generate all possible subset combinations of T
  for (let mask = 0; mask < (1 << T.length); mask++) {
    // Skip empty collection
    if (mask === 0) continue;
    
    const subsets = [];
    for (let i = 0; i < T.length; i++) {
      if ((mask & (1 << i)) !== 0) {
        subsets.push(T[i]);
      }
    }
    
    // Calculate union
    const union = [...new Set(subsets.flat())];
    
    // Check if union is in T
    if (!T.some(set => {
      if (set.length !== union.length) return false;
      return union.every(elem => set.includes(elem));
    })) {
      return false;
    }
    
    allUnions.push(union);
  }
  
  // Check for finite intersections
  for (let i = 0; i < T.length; i++) {
    for (let j = i; j < T.length; j++) {
      const intersection = T[i].filter(elem => T[j].includes(elem));
      
      // Check if intersection is in T
      if (!T.some(set => {
        if (set.length !== intersection.length) return false;
        return intersection.every(elem => set.includes(elem));
      })) {
        return false;
      }
    }
  }
  
  return true; // All properties satisfied
};

/**
 * Check if a subset is open in a given topology
 * @param {Array} set - The subset to check
 * @param {Array} T - The topology (collection of open sets)
 * @returns {boolean} - Whether the set is open
 */
topology.isOpen = function(set, T) {
  return T.some(openSet => {
    if (set.length !== openSet.length) return false;
    return set.every(elem => openSet.includes(elem));
  });
};

/**
 * Check if a subset is closed in a given topology
 * @param {Array} X - The underlying set (universe)
 * @param {Array} set - The subset to check
 * @param {Array} T - The topology (collection of open sets)
 * @returns {boolean} - Whether the set is closed
 */
topology.isClosed = function(X, set, T) {
  // A set is closed if its complement is open
  const complement = X.filter(elem => !set.includes(elem));
  return this.isOpen(complement, T);
};

/**
 * Compute the closure of a subset in a topology
 * @param {Array} X - The underlying set (universe)
 * @param {Array} set - The subset
 * @param {Array} T - The topology (collection of open sets)
 * @returns {Array} - The closure of the set
 */
topology.closure = function(X, set, T) {
  // The closure is the smallest closed set containing the given set
  // It is the intersection of all closed sets containing the set
  
  // Find all closed sets
  const closedSets = T.map(openSet => X.filter(elem => !openSet.includes(elem)))
    .filter(closedSet => set.every(elem => closedSet.includes(elem)));
  
  if (closedSets.length === 0) {
    return [...X]; // If no closed sets contain the set, the closure is X
  }
  
  // Intersection of all closed sets containing the set
  let closure = [...X];
  for (const closedSet of closedSets) {
    closure = closure.filter(elem => closedSet.includes(elem));
  }
  
  return closure;
};

/**
 * Compute the interior of a subset in a topology
 * @param {Array} set - The subset
 * @param {Array} T - The topology (collection of open sets)
 * @returns {Array} - The interior of the set
 */
topology.interior = function(set, T) {
  // The interior is the largest open set contained in the given set
  // It is the union of all open sets contained in the set
  
  // Find all open sets contained in the set
  const containedOpenSets = T.filter(openSet => 
    openSet.every(elem => set.includes(elem))
  );
  
  if (containedOpenSets.length === 0) {
    return []; // If no open sets are contained in the set, the interior is empty
  }
  
  // Union of all open sets contained in the set
  return [...new Set(containedOpenSets.flat())];
};

/**
 * Compute the boundary of a subset in a topology
 * @param {Array} X - The underlying set (universe)
 * @param {Array} set - The subset
 * @param {Array} T - The topology (collection of open sets)
 * @returns {Array} - The boundary of the set
 */
topology.boundary = function(X, set, T) {
  // The boundary is the closure minus the interior
  const closure = this.closure(X, set, T);
  const interior = this.interior(set, T);
  
  return closure.filter(elem => !interior.includes(elem));
};

/**
 * Check if a function is continuous between topological spaces
 * @param {Function} f - The function
 * @param {Array} X - Domain set
 * @param {Array} TX - Topology on domain
 * @param {Array} Y - Codomain set
 * @param {Array} TY - Topology on codomain
 * @returns {boolean} - Whether the function is continuous
 */
topology.isContinuous = function(f, X, TX, Y, TY) {
  // A function is continuous if the preimage of every open set is open
  for (const openSet of TY) {
    // Compute preimage
    const preimage = X.filter(x => openSet.includes(f(x)));
    
    // Check if preimage is open in domain topology
    if (!this.isOpen(preimage, TX)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Check if two topological spaces are homeomorphic
 * This is a simplified version that works for finite spaces
 * @param {Array} X - First space
 * @param {Array} TX - Topology on first space
 * @param {Array} Y - Second space
 * @param {Array} TY - Topology on second space
 * @returns {boolean} - Whether the spaces are homeomorphic
 */
topology.areHomeomorphic = function(X, TX, Y, TY) {
  if (X.length !== Y.length) {
    return false; // Different cardinality
  }
  
  // Check topology structures
  // For finite spaces, a necessary condition is that they have the same number of open sets
  if (TX.length !== TY.length) {
    return false;
  }
  
  // Count open sets of each size
  const TXSizes = TX.map(set => set.length).sort();
  const TYSizes = TY.map(set => set.length).sort();
  
  // Compare size distributions
  for (let i = 0; i < TXSizes.length; i++) {
    if (TXSizes[i] !== TYSizes[i]) {
      return false;
    }
  }
  
  // Note: This is a necessary but not sufficient condition for homeomorphism
  // Full check would require testing all possible bijections, which is factorial complexity
  
  return true; // Potentially homeomorphic
};

/**
 * Compute the fundamental group representation for simple shapes
 * This is a simplified version that returns the group type
 * @param {string} shape - Type of shape ('circle', 'torus', 'sphere', 'projective-plane', etc.)
 * @returns {string} - Description of the fundamental group
 */
topology.fundamentalGroup = function(shape) {
  switch (shape.toLowerCase()) {
    case 'point':
    case 'sphere':
    case 'ball':
    case 'disk':
      return 'Trivial group (0)';
      
    case 'circle':
      return 'Integers (Z)';
      
    case 'torus':
      return 'Z × Z (Direct product of two copies of integers)';
      
    case 'projective-plane':
      return 'Z/2Z (Cyclic group of order 2)';
      
    case 'klein-bottle':
      return 'Non-abelian group (presentation: <a,b | aba^(-1)b>)';
      
    case 'figure-eight':
      return 'Free group on two generators';
      
    default:
      return 'Unknown or complex fundamental group';
  }
};

/**
 * Compute Euler characteristic of a polyhedron or surface
 * @param {number} vertices - Number of vertices
 * @param {number} edges - Number of edges
 * @param {number} faces - Number of faces
 * @returns {number} - Euler characteristic (χ = V - E + F)
 */
topology.eulerCharacteristic = function(vertices, edges, faces) {
  return vertices - edges + faces;
};

/**
 * Identify the surface type based on Euler characteristic and orientability
 * @param {number} eulerChar - Euler characteristic
 * @param {boolean} orientable - Whether the surface is orientable
 * @returns {string} - Description of the surface
 */
topology.identifySurface = function(eulerChar, orientable) {
  if (orientable) {
    switch (eulerChar) {
      case 2:
        return 'Sphere';
      case 0:
        return 'Torus';
      case -2:
        return 'Double torus (genus 2)';
      case -4:
        return 'Triple torus (genus 3)';
      default:
        const genus = (2 - eulerChar) / 2;
        if (Number.isInteger(genus) && genus >= 0) {
          return `Orientable surface of genus ${genus}`;
        }
        return 'Unknown orientable surface';
    }
  } else {
    switch (eulerChar) {
      case 1:
        return 'Projective plane';
      case 0:
        return 'Klein bottle';
      case -1:
        return 'Connected sum of 3 projective planes';
      default:
        return `Non-orientable surface with ${1 - eulerChar} cross-caps`;
    }
  }
};

/**
 * Calculate homology groups of simple spaces (simplified version)
 * @param {string} space - Type of space
 * @returns {Array} - Array of homology groups [H0, H1, H2, ...]
 */
topology.homologyGroups = function(space) {
  switch (space.toLowerCase()) {
    case 'point':
      return ['Z', '0', '0'];
      
    case 'sphere':
      return ['Z', '0', 'Z', '0'];
      
    case 'torus':
      return ['Z', 'Z×Z', 'Z', '0'];
      
    case 'projective-plane':
      return ['Z', 'Z/2Z', '0', '0'];
      
    case 'klein-bottle':
      return ['Z', 'Z×Z/2Z', '0', '0'];
      
    case 'figure-eight':
      return ['Z', 'Z×Z', '0', '0'];
      
    default:
      return ['Unknown homology groups'];
  }
};

/**
 * Generate a simplicial complex from a set of simplices
 * @param {Array} simplices - Array of arrays, each representing a simplex
 * @returns {Object} - Simplicial complex with faces and properties
 */
topology.simplicialComplex = function(simplices) {
  // Validate simplices
  for (const simplex of simplices) {
    if (!Array.isArray(simplex)) {
      throw new Error('Each simplex must be an array');
    }
  }
  
  const complex = {
    simplices: [...simplices],
    facets: [], // Maximal simplices
    dimension: 0,
    eulerCharacteristic: 0
  };
  
  // Generate all faces
  const faces = new Map(); // Map from dimension to array of faces
  
  for (const simplex of simplices) {
    // Update dimension
    complex.dimension = Math.max(complex.dimension, simplex.length - 1);
    
    // Generate all subsets (faces)
    const generateFaces = (current, start, face) => {
      // Add current face if not empty
      if (face.length > 0) {
        const dim = face.length - 1;
        if (!faces.has(dim)) {
          faces.set(dim, []);
        }
        
        // Only add if not already present
        const faceStr = face.sort().toString();
        if (!faces.get(dim).some(f => f.sort().toString() === faceStr)) {
          faces.get(dim).push([...face]);
        }
      }
      
      // Generate all subsets
      for (let i = start; i < simplex.length; i++) {
        face.push(simplex[i]);
        generateFaces(current + 1, i + 1, face);
        face.pop();
      }
    };
    
    generateFaces(0, 0, []);
  }
  
  // Identify facets (maximal simplices)
  complex.facets = [...simplices];
  for (let i = complex.facets.length - 1; i >= 0; i--) {
    const a = complex.facets[i];
    for (let j = complex.facets.length - 1; j >= 0; j--) {
      if (i === j) continue;
      
      const b = complex.facets[j];
      if (a.length < b.length && a.every(item => b.includes(item))) {
        // a is contained in b, so a is not maximal
        complex.facets.splice(i, 1);
        break;
      }
    }
  }
  
  // Calculate Euler characteristic
  let eulerChar = 0;
  for (const [dim, dimFaces] of faces.entries()) {
    eulerChar += (dim % 2 === 0 ? 1 : -1) * dimFaces.length;
  }
  complex.eulerCharacteristic = eulerChar;
  
  // Store faces by dimension
  complex.faces = Object.fromEntries(faces);
  
  return complex;
};

/**
 * Compute the Betti numbers of a simplicial complex
 * @param {Object} complex - The simplicial complex
 * @param {number} maxDimension - Maximum dimension to compute
 * @returns {Array} - Betti numbers [β₀, β₁, β₂, ...]
 */
topology.betti = function(complex, maxDimension = 2) {
  // Simplified implementation that works for basic spaces
  
  // Compute the homology groups
  const homology = this.computeHomology(complex, maxDimension);
  
  // Betti numbers are the ranks of the homology groups
  const betti = [];
  for (let i = 0; i <= maxDimension; i++) {
    betti[i] = homology[i] ? homology[i].rank : 0;
  }
  
  return betti;
};

/**
 * Compute the homology groups of a simplicial complex
 * @param {Object} complex - The simplicial complex
 * @param {number} maxDimension - Maximum dimension to compute
 * @returns {Array} - Homology groups with rank and torsion
 */
topology.computeHomology = function(complex, maxDimension = 2) {
  // This is a simplified implementation
  // A real implementation would compute boundary matrices and Smith normal form
  
  const homology = [];
  
  // Extract the simplices by dimension
  const simplicesByDim = new Map();
  for (const simplex of complex.simplices) {
    const dim = simplex.length - 1;
    if (!simplicesByDim.has(dim)) {
      simplicesByDim.set(dim, []);
    }
    simplicesByDim.get(dim).push(simplex);
  }
  
  // Compute the ranks of chain groups
  const chainRanks = [];
  for (let i = 0; i <= maxDimension; i++) {
    chainRanks[i] = simplicesByDim.has(i) ? simplicesByDim.get(i).length : 0;
  }
  
  // For the simplified implementation, we use predetermined values for common spaces
  if (complex.name === 'sphere') {
    const dimension = complex.dimension || 2;
    for (let i = 0; i <= maxDimension; i++) {
      if (i === 0 || i === dimension) {
        homology[i] = { rank: 1, torsion: [] };
      } else {
        homology[i] = { rank: 0, torsion: [] };
      }
    }
  }
  else if (complex.name === 'torus') {
    homology[0] = { rank: 1, torsion: [] };
    homology[1] = { rank: 2, torsion: [] };
    homology[2] = { rank: 1, torsion: [] };
    for (let i = 3; i <= maxDimension; i++) {
      homology[i] = { rank: 0, torsion: [] };
    }
  }
  else if (complex.name === 'projective-plane') {
    homology[0] = { rank: 1, torsion: [] };
    homology[1] = { rank: 0, torsion: [2] }; // Z/2Z torsion
    homology[2] = { rank: 0, torsion: [] };
    for (let i = 3; i <= maxDimension; i++) {
      homology[i] = { rank: 0, torsion: [] };
    }
  }
  else if (complex.name === 'klein-bottle') {
    homology[0] = { rank: 1, torsion: [] };
    homology[1] = { rank: 1, torsion: [2] }; // Z⊕Z/2Z
    homology[2] = { rank: 0, torsion: [] };
    for (let i = 3; i <= maxDimension; i++) {
      homology[i] = { rank: 0, torsion: [] };
    }
  }
  else {
    // Generic case - for a custom complex we would compute this properly
    for (let i = 0; i <= maxDimension; i++) {
      homology[i] = { rank: i === 0 ? 1 : 0, torsion: [] };
    }
  }
  
  return homology;
};

/**
 * Generate a filtered simplicial complex for persistent homology
 * @param {Array} points - Points in the space
 * @param {Function} distanceFn - Distance function between points
 * @param {number} maxEpsilon - Maximum distance parameter
 * @param {number} steps - Number of filtration steps
 * @returns {Object} - Filtered simplicial complex
 */
topology.vietorisRipsComplex = function(points, distanceFn, maxEpsilon, steps = 10) {
  const filtration = [];
  const epsilonStep = maxEpsilon / steps;
  
  for (let s = 0; s <= steps; s++) {
    const epsilon = s * epsilonStep;
    const simplices = [];
    
    // Add 0-simplices (vertices)
    for (let i = 0; i < points.length; i++) {
      simplices.push([i]);
    }
    
    // Add 1-simplices (edges)
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = distanceFn(points[i], points[j]);
        if (dist <= epsilon) {
          simplices.push([i, j]);
        }
      }
    }
    
    // Add 2-simplices (triangles)
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        for (let k = j + 1; k < points.length; k++) {
          const dist_ij = distanceFn(points[i], points[j]);
          const dist_jk = distanceFn(points[j], points[k]);
          const dist_ik = distanceFn(points[i], points[k]);
          
          if (dist_ij <= epsilon && dist_jk <= epsilon && dist_ik <= epsilon) {
            simplices.push([i, j, k]);
          }
        }
      }
    }
    
    filtration.push({
      epsilon,
      simplices: [...simplices]
    });
  }
  
  return {
    points,
    filtration
  };
};

/**
 * Compute persistent homology
 * @param {Object} filteredComplex - Filtered simplicial complex
 * @param {number} maxDimension - Maximum homology dimension to compute
 * @returns {Object} - Persistence diagrams for each dimension
 */
topology.persistentHomology = function(filteredComplex, maxDimension = 1) {
  // This is a simplified implementation - a full implementation would use the
  // algorithm by Edelsbrunner and Harer or similar
  
  const { filtration } = filteredComplex;
  const persistenceDiagrams = [];
  
  for (let dim = 0; dim <= maxDimension; dim++) {
    const diagram = [];
    
    // Crude implementation that tracks features through the filtration
    let features = new Set();
    let birthTimes = new Map();
    
    for (let i = 0; i < filtration.length; i++) {
      const step = filtration[i];
      const { epsilon, simplices } = step;
      
      // Get simplices of the current dimension
      const dimSimplices = simplices.filter(s => s.length === dim + 1);
      
      // Each new simplex could create a new feature
      for (const simplex of dimSimplices) {
        const id = simplex.join('-');
        if (!features.has(id)) {
          features.add(id);
          birthTimes.set(id, epsilon);
        }
      }
      
      // Simplices of dimension+1 could kill features
      const killerSimplices = simplices.filter(s => s.length === dim + 2);
      for (const killer of killerSimplices) {
        // Find a feature that this simplex might kill
        // This is highly simplified - real algorithm would use boundary matrices
        for (const id of features) {
          const feature = id.split('-').map(Number);
          if (feature.every(v => killer.includes(v))) {
            features.delete(id);
            diagram.push([birthTimes.get(id), epsilon]);
            birthTimes.delete(id);
            break;
          }
        }
      }
    }
    
    // Features that never die have death time = infinity
    for (const id of features) {
      diagram.push([birthTimes.get(id), Infinity]);
    }
    
    persistenceDiagrams[dim] = diagram;
  }
  
  return persistenceDiagrams;
};

/**
 * Calculate persistence barcodes from persistence diagrams
 * @param {Array} persistenceDiagrams - Persistence diagrams for each dimension
 * @returns {Array} - Persistence barcodes for visualization
 */
topology.persistenceBarcodes = function(persistenceDiagrams) {
  const barcodes = [];
  
  for (let dim = 0; dim < persistenceDiagrams.length; dim++) {
    const diagram = persistenceDiagrams[dim];
    const dimensionBarcodes = diagram.map(([birth, death]) => ({
      dimension: dim,
      birth,
      death: death === Infinity ? 'inf' : death,
      persistence: death === Infinity ? Infinity : death - birth
    }));
    
    // Sort by persistence (most persistent first)
    dimensionBarcodes.sort((a, b) => {
      if (a.persistence === Infinity) return -1;
      if (b.persistence === Infinity) return 1;
      return b.persistence - a.persistence;
    });
    
    barcodes.push(dimensionBarcodes);
  }
  
  return barcodes;
};

/**
 * Smooth manifold operations
 * @param {string} manifoldType - Type of manifold (sphere, torus, etc.)
 * @param {number} dimension - Dimension of the manifold
 * @returns {Object} - Manifold object with operations
 */
topology.manifold = function(manifoldType, dimension = 2) {
  const manifold = {
    type: manifoldType,
    dimension: dimension,
    // Basic topological invariants
    eulerCharacteristic: 0,
    homologyGroups: [],
    fundamentalGroup: '',
    isClosed: true,
    isOriented: true,
    isCompact: true,
    isBounded: true,
    genus: 0
  };
  
  // Set properties based on manifold type
  switch (manifoldType) {
    case 'sphere':
      manifold.eulerCharacteristic = 2;
      manifold.homologyGroups = this.homologyGroups('sphere');
      manifold.fundamentalGroup = 'trivial';
      manifold.genus = 0;
      break;
      
    case 'torus':
      manifold.eulerCharacteristic = 0;
      manifold.homologyGroups = this.homologyGroups('torus');
      manifold.fundamentalGroup = 'Z × Z';
      manifold.genus = 1;
      break;
      
    case 'klein-bottle':
      manifold.eulerCharacteristic = 0;
      manifold.homologyGroups = this.homologyGroups('klein-bottle');
      manifold.fundamentalGroup = 'Klein bottle group';
      manifold.isOriented = false;
      manifold.genus = 2; // Non-orientable genus
      break;
      
    case 'projective-plane':
      manifold.eulerCharacteristic = 1;
      manifold.homologyGroups = this.homologyGroups('projective-plane');
      manifold.fundamentalGroup = 'Z/2Z';
      manifold.isOriented = false;
      manifold.genus = 1; // Non-orientable genus
      break;
      
    case 'mobius-strip':
      manifold.eulerCharacteristic = 0;
      manifold.homologyGroups = [{type: 'Z'}, {type: '0'}, {type: '0'}];
      manifold.fundamentalGroup = 'Z';
      manifold.isOriented = false;
      manifold.isClosed = false;
      manifold.isBounded = true;
      break;
      
    default:
      throw new Error(`Unknown manifold type: ${manifoldType}`);
  }
  
  return manifold;
};

/**
 * Create a simplicial approximation of a smooth manifold
 * @param {string} manifoldType - Type of manifold
 * @param {number} resolution - Resolution of the approximation
 * @returns {Object} - Simplicial complex approximating the manifold
 */
topology.triangulateManifold = function(manifoldType, resolution = 10) {
  let vertices = [];
  let faces = [];
  
  switch (manifoldType) {
    case 'sphere':
      // Generate a icosphere approximation of a sphere
      return this._triangulateIcosphere(resolution);
      
    case 'torus':
      // Generate a grid approximation of a torus
      return this._triangulateTorus(resolution);
      
    // More manifolds would be implemented here
    
    default:
      throw new Error(`No triangulation implemented for ${manifoldType}`);
  }
};

/**
 * Helper to triangulate a sphere as an icosphere
 * @private
 * @param {number} subdivisions - Number of subdivisions
 * @returns {Object} - Simplicial complex for the sphere
 */
topology._triangulateIcosphere = function(subdivisions = 1) {
  // Start with an icosahedron
  const t = (1.0 + Math.sqrt(5.0)) / 2.0;
  
  // Initial vertices of an icosahedron
  let vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ];
  
  // Normalize vertices to lie on unit sphere
  vertices = vertices.map(v => {
    const length = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/length, v[1]/length, v[2]/length];
  });
  
  // Initial faces of an icosahedron
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];
  
  // Convert to simplices
  const simplices = [];
  
  // Add vertices (0-simplices)
  for (let i = 0; i < vertices.length; i++) {
    simplices.push([i]);
  }
  
  // Add edges (1-simplices)
  const edges = new Set();
  for (const face of faces) {
    for (let i = 0; i < 3; i++) {
      const a = face[i];
      const b = face[(i + 1) % 3];
      const edgeKey = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(edgeKey)) {
        edges.add(edgeKey);
        simplices.push([a, b]);
      }
    }
  }
  
  // Add faces (2-simplices)
  for (const face of faces) {
    simplices.push([...face]);
  }
  
  return {
    name: 'sphere',
    dimension: 2,
    vertices,
    faces,
    simplices
  };
};

/**
 * Helper to triangulate a torus
 * @private
 * @param {number} resolution - Grid resolution
 * @returns {Object} - Simplicial complex for the torus
 */
topology._triangulateTorus = function(resolution = 10) {
  const vertices = [];
  const faces = [];
  const simplices = [];
  
  const R = 2;  // Major radius
  const r = 1;  // Minor radius
  
  // Generate vertices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const u = (i / resolution) * 2 * Math.PI;
      const v = (j / resolution) * 2 * Math.PI;
      
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      
      vertices.push([x, y, z]);
    }
  }
  
  // Generate faces
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const current = i * resolution + j;
      const next_i = ((i + 1) % resolution) * resolution + j;
      const next_j = i * resolution + ((j + 1) % resolution);
      const next_ij = ((i + 1) % resolution) * resolution + ((j + 1) % resolution);
      
      faces.push([current, next_i, next_j]);
      faces.push([next_i, next_ij, next_j]);
    }
  }
  
  // Convert to simplices
  // Add vertices (0-simplices)
  for (let i = 0; i < vertices.length; i++) {
    simplices.push([i]);
  }
  
  // Add edges (1-simplices)
  const edges = new Set();
  for (const face of faces) {
    for (let i = 0; i < 3; i++) {
      const a = face[i];
      const b = face[(i + 1) % 3];
      const edgeKey = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(edgeKey)) {
        edges.add(edgeKey);
        simplices.push([a, b]);
      }
    }
  }
  
  // Add faces (2-simplices)
  for (const face of faces) {
    simplices.push([...face]);
  }
  
  return {
    name: 'torus',
    dimension: 2,
    vertices,
    faces,
    simplices
  };
};

module.exports = topology;
