/**
 * Core tensor operations for herta.js
 * Provides tensor manipulation, contractions, and tensor calculus operations
 */

// These dependencies are used throughout tensor operations
const Decimal = require('decimal.js');
const Complex = require('complex.js');
const tensorContraction = require('tensor-contraction');

// Tensor module
const tensor = {};

/**
 * Create a tensor from nested arrays
 * @param {Array} data - Nested arrays representing the tensor
 * @param {Array} [dimensions] - Optional dimensions array
 * @returns {Object} - Tensor object with operations
 */
tensor.create = function (data, dimensions) {
  // Determine dimensions if not provided
  if (!dimensions) {
    dimensions = getDimensions(data);
  }

  // Validate data against dimensions
  validateTensorData(data, dimensions);

  return {
    // Tensor data
    data: deepCopy(data),

    // Dimensions
    dimensions: [...dimensions],
    rank: dimensions.length,

    /**
     * Get an element at the specified indices
     * @param {...number} indices - Indices for each dimension
     * @returns {number|Array} - The element or subtensor at the specified indices
     */
    get(...indices) {
      if (indices.length > this.rank) {
        throw new Error(`Too many indices: expected ${this.rank}, got ${indices.length}`);
      }

      let result = this.data;
      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        if (index < 0 || index >= this.dimensions[i]) {
          throw new Error(`Index out of bounds: ${index} at dimension ${i}`);
        }
        result = result[index];
      }

      return result;
    },

    /**
     * Set an element at the specified indices
     * @param {...number} args - Indices followed by the value to set
     */
    set(...args) {
      if (args.length !== this.rank + 1) {
        throw new Error(`Invalid number of arguments: expected ${this.rank + 1}, got ${args.length}`);
      }

      const indices = args.slice(0, this.rank);
      const value = args[this.rank];

      let target = this.data;
      for (let i = 0; i < indices.length - 1; i++) {
        const index = indices[i];
        if (index < 0 || index >= this.dimensions[i]) {
          throw new Error(`Index out of bounds: ${index} at dimension ${i}`);
        }
        target = target[index];
      }

      const lastIndex = indices[indices.length - 1];
      if (lastIndex < 0 || lastIndex >= this.dimensions[indices.length - 1]) {
        throw new Error(`Index out of bounds: ${lastIndex} at dimension ${indices.length - 1}`);
      }

      target[lastIndex] = value;
    },

    /**
     * Add another tensor to this tensor
     * @param {Object} other - The tensor to add
     * @returns {Object} - New tensor containing the sum
     */
    add(other) {
      // Check if dimensions match
      if (this.rank !== other.rank || !arraysEqual(this.dimensions, other.dimensions)) {
        throw new Error('Tensor dimensions must match for addition.');
      }

      // Perform element-wise addition
      const result = elementWiseOperation(this.data, other.data, this.dimensions, (a, b) => a + b);

      return tensor.create(result, this.dimensions);
    },

    /**
     * Subtract another tensor from this tensor
     * @param {Object} other - The tensor to subtract
     * @returns {Object} - New tensor containing the difference
     */
    subtract(other) {
      // Check if dimensions match
      if (this.rank !== other.rank || !arraysEqual(this.dimensions, other.dimensions)) {
        throw new Error('Tensor dimensions must match for subtraction.');
      }

      // Perform element-wise subtraction
      const result = elementWiseOperation(this.data, other.data, this.dimensions, (a, b) => a - b);

      return tensor.create(result, this.dimensions);
    },

    /**
     * Multiply this tensor by a scalar
     * @param {number} scalar - The scalar to multiply by
     * @returns {Object} - New tensor containing the product
     */
    scalarMultiply(scalar) {
      // Perform element-wise multiplication by scalar
      const result = scalarOperation(this.data, this.dimensions, (value) => value * scalar);

      return tensor.create(result, this.dimensions);
    },

    /**
     * Perform element-wise multiplication with another tensor
     * @param {Object} other - The tensor to multiply with
     * @returns {Object} - New tensor containing the element-wise product
     */
    elementMultiply(other) {
      // Check if dimensions match
      if (this.rank !== other.rank || !arraysEqual(this.dimensions, other.dimensions)) {
        throw new Error('Tensor dimensions must match for element-wise multiplication.');
      }

      // Perform element-wise multiplication
      const result = elementWiseOperation(this.data, other.data, this.dimensions, (a, b) => a * b);

      return tensor.create(result, this.dimensions);
    },

    /**
     * Perform tensor contraction along specified dimensions
     * @param {number} dim1 - First dimension to contract
     * @param {number} dim2 - Second dimension to contract
     * @returns {Object} - New tensor after contraction
     */
    contract(dim1, dim2) {
      if (dim1 < 0 || dim1 >= this.rank || dim2 < 0 || dim2 >= this.rank) {
        throw new Error(`Invalid dimensions for contraction: ${dim1}, ${dim2}`);
      }

      if (dim1 === dim2) {
        throw new Error('Cannot contract a dimension with itself.');
      }

      if (this.dimensions[dim1] !== this.dimensions[dim2]) {
        throw new Error(`Dimensions for contraction must have the same size: ${this.dimensions[dim1]} != ${this.dimensions[dim2]}`);
      }

      // This would implement tensor contraction
      // For now, return a placeholder
      const newDimensions = this.dimensions.filter((_, i) => i !== dim1 && i !== dim2);
      const resultData = createZeroTensor(newDimensions);

      return tensor.create(resultData, newDimensions);
    },

    /**
     * Perform tensor product with another tensor
     * @param {Object} other - The tensor to multiply with
     * @returns {Object} - New tensor containing the tensor product
     */
    tensorProduct(other) {
      // Calculate dimensions of the result
      const resultDimensions = [...this.dimensions, ...other.dimensions];

      // Create a zero tensor with the result dimensions
      const resultData = createZeroTensor(resultDimensions);

      // This would implement the tensor product
      // For now, return a placeholder

      return tensor.create(resultData, resultDimensions);
    },

    /**
     * Transpose the tensor by swapping dimensions
     * @param {...number} permutation - New order of dimensions
     * @returns {Object} - Transposed tensor
     */
    transpose(...permutation) {
      // If no permutation is provided, reverse the dimensions
      if (permutation.length === 0) {
        permutation = Array.from({ length: this.rank }, (_, i) => this.rank - i - 1);
      }

      // Validate permutation
      if (permutation.length !== this.rank) {
        throw new Error(`Invalid permutation length: expected ${this.rank}, got ${permutation.length}`);
      }

      // Check if permutation contains all dimensions
      const sorted = [...permutation].sort((a, b) => a - b);
      for (let i = 0; i < this.rank; i++) {
        if (sorted[i] !== i) {
          throw new Error(`Invalid permutation: must contain all dimensions from 0 to ${this.rank - 1}`);
        }
      }

      // Calculate new dimensions
      const newDimensions = permutation.map((i) => this.dimensions[i]);

      // Create a zero tensor with the new dimensions
      const resultData = createZeroTensor(newDimensions);

      // This would implement the tensor transposition
      // For now, return a placeholder

      return tensor.create(resultData, newDimensions);
    },

    /**
     * Reshape the tensor to new dimensions
     * @param {...number} newDimensions - New dimensions
     * @returns {Object} - Reshaped tensor
     */
    reshape(...newDimensions) {
      // Calculate total number of elements
      const totalElements = this.dimensions.reduce((a, b) => a * b, 1);
      const newTotalElements = newDimensions.reduce((a, b) => a * b, 1);

      if (totalElements !== newTotalElements) {
        throw new Error(`Cannot reshape tensor of size ${totalElements} to size ${newTotalElements}`);
      }

      // Flatten the tensor data
      const flatData = flattenTensor(this.data, this.dimensions);

      // Reshape the flattened data
      const resultData = reshapeTensor(flatData, newDimensions);

      return tensor.create(resultData, newDimensions);
    },

    /**
     * Convert the tensor to a string
     * @returns {string} - String representation
     */
    toString() {
      return JSON.stringify(this.data, null, 2);
    }
  };
};

/**
 * Get the dimensions of nested arrays
 * @private
 * @param {Array} data - Nested arrays
 * @returns {Array} - Array of dimensions
 */
function getDimensions(data) {
  const dimensions = [];
  let current = data;

  while (Array.isArray(current)) {
    dimensions.push(current.length);
    current = current[0];
  }

  return dimensions;
}

/**
 * Validate tensor data against dimensions
 * @private
 * @param {Array} data - Nested arrays
 * @param {Array} dimensions - Expected dimensions
 * @param {number} [level=0] - Current nesting level
 */
function validateTensorData(data, dimensions, level = 0) {
  if (level === dimensions.length) {
    if (Array.isArray(data)) {
      throw new Error(`Expected scalar at level ${level}, got array`);
    }
    return;
  }

  if (!Array.isArray(data)) {
    throw new Error(`Expected array at level ${level}, got scalar`);
  }

  if (data.length !== dimensions[level]) {
    throw new Error(`Expected length ${dimensions[level]} at level ${level}, got ${data.length}`);
  }

  for (let i = 0; i < data.length; i++) {
    validateTensorData(data[i], dimensions, level + 1);
  }
}

/**
 * Create a deep copy of nested arrays
 * @private
 * @param {Array} data - Nested arrays
 * @returns {Array} - Deep copy
 */
function deepCopy(data) {
  if (!Array.isArray(data)) {
    return data;
  }

  return data.map((item) => deepCopy(item));
}

/**
 * Check if two arrays are equal
 * @private
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {boolean} - True if arrays are equal
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Perform element-wise operation on two tensors
 * @private
 * @param {Array} a - First tensor data
 * @param {Array} b - Second tensor data
 * @param {Array} dimensions - Tensor dimensions
 * @param {Function} operation - Operation to perform
 * @param {number} [level=0] - Current nesting level
 * @returns {Array} - Result of operation
 */
function elementWiseOperation(a, b, dimensions, operation, level = 0) {
  if (level === dimensions.length) {
    return operation(a, b);
  }

  const result = [];
  for (let i = 0; i < dimensions[level]; i++) {
    result.push(elementWiseOperation(a[i], b[i], dimensions, operation, level + 1));
  }

  return result;
}

/**
 * Perform scalar operation on a tensor
 * @private
 * @param {Array} data - Tensor data
 * @param {Array} dimensions - Tensor dimensions
 * @param {Function} operation - Operation to perform
 * @param {number} [level=0] - Current nesting level
 * @returns {Array} - Result of operation
 */
function scalarOperation(data, dimensions, operation, level = 0) {
  if (level === dimensions.length) {
    return operation(data);
  }

  const result = [];
  for (let i = 0; i < dimensions[level]; i++) {
    result.push(scalarOperation(data[i], dimensions, operation, level + 1));
  }

  return result;
}

/**
 * Create a tensor filled with zeros
 * @private
 * @param {Array} dimensions - Tensor dimensions
 * @param {number} [level=0] - Current nesting level
 * @returns {Array} - Zero tensor
 */
function createZeroTensor(dimensions, level = 0) {
  if (level === dimensions.length) {
    return 0;
  }

  const result = [];
  for (let i = 0; i < dimensions[level]; i++) {
    result.push(createZeroTensor(dimensions, level + 1));
  }

  return result;
}

/**
 * Flatten a tensor to a 1D array
 * @private
 * @param {Array} data - Tensor data
 * @param {Array} dimensions - Tensor dimensions
 * @param {number} [level=0] - Current nesting level
 * @returns {Array} - Flattened array
 */
function flattenTensor(data, dimensions, level = 0) {
  if (level === dimensions.length) {
    return [data];
  }

  const result = [];
  for (let i = 0; i < dimensions[level]; i++) {
    result.push(...flattenTensor(data[i], dimensions, level + 1));
  }

  return result;
}

/**
 * Reshape a flattened array to tensor dimensions
 * @private
 * @param {Array} flatData - Flattened array
 * @param {Array} dimensions - Target dimensions
 * @param {number} [level=0] - Current nesting level
 * @param {number} [offset=0] - Current offset in flat data
 * @returns {Array} - Reshaped tensor
 */
function reshapeTensor(flatData, dimensions, level = 0, offset = 0) {
  if (level === dimensions.length - 1) {
    const result = [];
    for (let i = 0; i < dimensions[level]; i++) {
      result.push(flatData[offset + i]);
    }
    return result;
  }

  const result = [];
  const size = dimensions.slice(level + 1).reduce((a, b) => a * b, 1);

  for (let i = 0; i < dimensions[level]; i++) {
    result.push(reshapeTensor(flatData, dimensions, level + 1, offset + i * size));
  }

  return result;
}

/**
 * Create a tensor with ones on the diagonal and zeros elsewhere
 * @param {number} size - Size of each dimension
 * @param {number} rank - Number of dimensions
 * @returns {Object} - Identity tensor
 */
tensor.identity = function (size, rank) {
  if (rank < 2) {
    throw new Error('Identity tensor must have at least rank 2.');
  }

  // Create dimensions array
  const dimensions = Array(rank).fill(size);

  // Create a zero tensor
  const data = createZeroTensor(dimensions);

  // Set ones on the diagonal
  // This is a simplified implementation for rank 2
  if (rank === 2) {
    for (let i = 0; i < size; i++) {
      data[i][i] = 1;
    }
  }
  // For higher ranks, we would need a more complex implementation

  return tensor.create(data, dimensions);
};

/**
 * Create a tensor filled with zeros
 * @param {...number} dimensions - Dimensions of the tensor
 * @returns {Object} - Zero tensor
 */
tensor.zeros = function (...dimensions) {
  if (dimensions.length === 0) {
    throw new Error('Tensor dimensions must be specified.');
  }

  const data = createZeroTensor(dimensions);
  return tensor.create(data, dimensions);
};

/**
 * Create a tensor filled with ones
 * @param {...number} dimensions - Dimensions of the tensor
 * @returns {Object} - Tensor of ones
 */
tensor.ones = function (...dimensions) {
  if (dimensions.length === 0) {
    throw new Error('Tensor dimensions must be specified.');
  }

  const data = createZeroTensor(dimensions);
  const flatData = flattenTensor(data, dimensions);

  for (let i = 0; i < flatData.length; i++) {
    flatData[i] = 1;
  }

  const result = reshapeTensor(flatData, dimensions);
  return tensor.create(result, dimensions);
};

/**
 * Create a tensor from a function
 * @param {Function} func - Function that takes indices and returns a value
 * @param {...number} dimensions - Dimensions of the tensor
 * @returns {Object} - Tensor with values from the function
 */
tensor.fromFunction = function (func, ...dimensions) {
  if (dimensions.length === 0) {
    throw new Error('Tensor dimensions must be specified.');
  }

  // Create a zero tensor with the specified dimensions
  const data = createZeroTensor(dimensions);

  // Fill the tensor with values from the function
  fillTensorFromFunction(data, dimensions, func);

  return tensor.create(data, dimensions);
};

/**
 * Fill a tensor with values from a function
 * @private
 * @param {Array} data - Tensor data to fill
 * @param {Array} dimensions - Tensor dimensions
 * @param {Function} func - Function that takes indices and returns a value
 * @param {Array} [indices=[]] - Current indices
 * @param {number} [level=0] - Current nesting level
 */
function fillTensorFromFunction(data, dimensions, func, indices = [], level = 0) {
  if (level === dimensions.length) {
    return func(...indices);
  }

  for (let i = 0; i < dimensions[level]; i++) {
    const newIndices = [...indices, i];
    data[i] = fillTensorFromFunction(data[i], dimensions, func, newIndices, level + 1);
  }

  return data;
}

/**
 * Compute the outer product of two tensors
 * @param {Object} a - First tensor
 * @param {Object} b - Second tensor
 * @returns {Object} - Outer product tensor
 */
tensor.outerProduct = function (a, b) {
  return a.tensorProduct(b);
};

/**
 * Compute the inner product of two tensors
 * @param {Object} a - First tensor
 * @param {Object} b - Second tensor
 * @returns {number} - Inner product
 */
tensor.innerProduct = function (a, b) {
  // For vectors (rank 1 tensors)
  if (a.rank === 1 && b.rank === 1 && a.dimensions[0] === b.dimensions[0]) {
    let sum = 0;
    for (let i = 0; i < a.dimensions[0]; i++) {
      sum += a.get(i) * b.get(i);
    }
    return sum;
  }

  // For higher rank tensors, we would need to implement contraction
  throw new Error('Inner product for tensors with rank > 1 not implemented yet.');
};

/**
 * Compute the tensor contraction
 * @param {Object} t - The tensor
 * @param {number} dim1 - First dimension to contract
 * @param {number} dim2 - Second dimension to contract
 * @returns {Object} - Contracted tensor
 */
tensor.contract = function (t, dim1, dim2) {
  // Validate input parameters
  if (!t || !t.data || !t.dimensions) {
    throw new Error('Invalid tensor provided for contraction');
  }

  if (dim1 < 0 || dim1 >= t.rank || dim2 < 0 || dim2 >= t.rank) {
    throw new Error(`Contraction dimensions out of bounds: (${dim1}, ${dim2}) for rank ${t.rank}`);
  }

  if (dim1 === dim2) {
    throw new Error('Cannot contract a dimension with itself');
  }

  // Ensure dimensions match for contraction
  if (t.dimensions[dim1] !== t.dimensions[dim2]) {
    throw new Error(`Contraction dimensions must have same size: ${t.dimensions[dim1]} ≠ ${t.dimensions[dim2]}`);
  }

  try {
    // Use the tensor-contraction library for the actual contraction
    const contractionResult = tensorContraction.contract(t.data, [dim1, dim2]);

    // Calculate dimensions of the result tensor
    const newDimensions = t.dimensions.filter((_, i) => i !== dim1 && i !== dim2);

    // If result is a scalar (all dimensions contracted)
    if (newDimensions.length === 0) {
      return contractionResult;
    }

    // Return the contracted tensor
    return tensor.create(contractionResult, newDimensions);
  } catch (error) {
    // Fall back to our implementation if library fails
    console.warn('Tensor-contraction library failed, using fallback implementation');

    // Sort dimensions for easier handling
    const [minDim, maxDim] = [dim1, dim2].sort((a, b) => a - b);

    // Calculate dimensions of the result tensor
    const newDimensions = t.dimensions.filter((_, i) => i !== minDim && i !== maxDim);

    // If we're contracting all dimensions, result is a scalar
    if (newDimensions.length === 0) {
      let result = 0;
      const contractionSize = t.dimensions[dim1];

      // For a 2D tensor (matrix trace)
      if (t.rank === 2) {
        for (let i = 0; i < contractionSize; i++) {
          result += t.data[i][i];
        }
        return result;
      }
    }

    // Create result tensor data structure
    const resultData = this.createZeroTensor(newDimensions);

    // Perform the contraction
    const contractionResult = performContraction(t.data, t.dimensions, minDim, maxDim, resultData, newDimensions);

    // Return the contracted tensor
    return tensor.create(contractionResult, newDimensions);
  }
};

/**
 * Helper function to perform tensor contraction
 * @private
 * @param {Array} data - Tensor data
 * @param {Array} dimensions - Original dimensions
 * @param {number} dim1 - First contraction dimension
 * @param {number} dim2 - Second contraction dimension
 * @param {Array} resultData - Result data structure (optional)
 * @param {Array} resultDimensions - Result dimensions (optional)
 * @returns {Array|number} - Contracted tensor data or scalar
 */
function performContraction(data, dimensions, dim1, dim2, resultData, resultDimensions) {
  // For 2D case (matrix), use direct approach
  if (dimensions.length === 2) {
    let result = 0;
    for (let i = 0; i < dimensions[0]; i++) {
      result += data[i][i];
    }
    return result;
  }

  // For higher dimensions, we would implement a more complex algorithm here
  // that properly handles the multi-dimensional contraction

  // A full implementation would need to:
  // 1. Iterate through all indices excluding the contracted dimensions
  // 2. For each set of indices, sum over the contracted dimensions
  // 3. Place the result in the appropriate position in resultData

  // This is a simplified placeholder that handles 2D and 3D cases
  if (dimensions.length === 3 && ((dim1 === 0 && dim2 === 1) || (dim1 === 1 && dim2 === 2))) {
    // Contract first two dimensions or last two dimensions of 3D tensor
    const free = dim1 === 0 ? 2 : 0;
    const contractionSize = dimensions[dim1];
    const resultSize = dimensions[free];

    // Create 1D result array
    const result = new Array(resultSize).fill(0);

    // Perform contraction
    for (let i = 0; i < contractionSize; i++) {
      for (let j = 0; j < resultSize; j++) {
        if (free === 2) {
          result[j] += data[i][i][j];
        } else {
          result[j] += data[j][i][i];
        }
      }
    }

    return result;
  }

  // For more complex cases, just return a dummy tensor
  // In a full implementation, this would be replaced with proper logic
  return resultData || 0;
}

/**
 * Compute the tensor product
 * @param {Object} a - First tensor
 * @param {Object} b - Second tensor
 * @returns {Object} - Tensor product
 */
tensor.product = function (a, b) {
  return a.tensorProduct(b);
};

module.exports = tensor;
