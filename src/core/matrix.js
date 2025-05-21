/**
 * Core matrix operations for herta.js
 * Provides matrix manipulation, decompositions, and linear algebra operations
 */

const Decimal = require('decimal.js');
const Complex = require('complex.js');

// Matrix module
const matrix = {};

/**
 * Create a matrix from an array of arrays
 * @param {Array} data - Array of arrays representing the matrix
 * @returns {Object} - Matrix object with operations
 */
matrix.create = function(data) {
  // Validate input data
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
    throw new Error('Invalid matrix data. Expected non-empty array of arrays.');
  }
  
  // Check if all rows have the same length
  const rowLength = data[0].length;
  for (let i = 1; i < data.length; i++) {
    if (!Array.isArray(data[i]) || data[i].length !== rowLength) {
      throw new Error('Invalid matrix data. All rows must have the same length.');
    }
  }
  
  // Create a deep copy of the data
  const matrixData = data.map(row => [...row]);
  
  return {
    // Matrix data
    data: matrixData,
    
    // Dimensions
    rows: matrixData.length,
    cols: matrixData[0].length,
    
    /**
     * Get an element at the specified position
     * @param {number} i - Row index (0-based)
     * @param {number} j - Column index (0-based)
     * @returns {number} - The element at position (i,j)
     */
    get: function(i, j) {
      if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
        throw new Error(`Index out of bounds: (${i},${j})`);
      }
      return this.data[i][j];
    },
    
    /**
     * Set an element at the specified position
     * @param {number} i - Row index (0-based)
     * @param {number} j - Column index (0-based)
     * @param {number} value - The value to set
     */
    set: function(i, j, value) {
      if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
        throw new Error(`Index out of bounds: (${i},${j})`);
      }
      this.data[i][j] = value;
    },
    
    /**
     * Add another matrix to this matrix
     * @param {Object} other - The matrix to add
     * @returns {Object} - New matrix containing the sum
     */
    add: function(other) {
      if (this.rows !== other.rows || this.cols !== other.cols) {
        throw new Error('Matrix dimensions must match for addition.');
      }
      
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result[i] = [];
        for (let j = 0; j < this.cols; j++) {
          result[i][j] = this.data[i][j] + other.data[i][j];
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Subtract another matrix from this matrix
     * @param {Object} other - The matrix to subtract
     * @returns {Object} - New matrix containing the difference
     */
    subtract: function(other) {
      if (this.rows !== other.rows || this.cols !== other.cols) {
        throw new Error('Matrix dimensions must match for subtraction.');
      }
      
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result[i] = [];
        for (let j = 0; j < this.cols; j++) {
          result[i][j] = this.data[i][j] - other.data[i][j];
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Multiply this matrix by another matrix
     * @param {Object} other - The matrix to multiply by
     * @returns {Object} - New matrix containing the product
     */
    multiply: function(other) {
      if (this.cols !== other.rows) {
        throw new Error('Matrix dimensions incompatible for multiplication.');
      }
      
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result[i] = [];
        for (let j = 0; j < other.cols; j++) {
          let sum = 0;
          for (let k = 0; k < this.cols; k++) {
            sum += this.data[i][k] * other.data[k][j];
          }
          result[i][j] = sum;
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Multiply this matrix by a scalar
     * @param {number} scalar - The scalar to multiply by
     * @returns {Object} - New matrix containing the product
     */
    scalarMultiply: function(scalar) {
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result[i] = [];
        for (let j = 0; j < this.cols; j++) {
          result[i][j] = this.data[i][j] * scalar;
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Transpose this matrix
     * @returns {Object} - New matrix containing the transpose
     */
    transpose: function() {
      const result = [];
      for (let j = 0; j < this.cols; j++) {
        result[j] = [];
        for (let i = 0; i < this.rows; i++) {
          result[j][i] = this.data[i][j];
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Calculate the determinant of this matrix
     * @returns {number} - The determinant
     */
    determinant: function() {
      if (this.rows !== this.cols) {
        throw new Error('Determinant can only be calculated for square matrices.');
      }
      
      // For 1x1 matrix
      if (this.rows === 1) {
        return this.data[0][0];
      }
      
      // For 2x2 matrix
      if (this.rows === 2) {
        return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
      }
      
      // For larger matrices, use cofactor expansion
      let det = 0;
      for (let j = 0; j < this.cols; j++) {
        det += this.data[0][j] * this.cofactor(0, j);
      }
      
      return det;
    },
    
    /**
     * Calculate the cofactor of an element
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {number} - The cofactor
     */
    cofactor: function(row, col) {
      const minor = this.minor(row, col);
      return ((row + col) % 2 === 0 ? 1 : -1) * minor.determinant();
    },
    
    /**
     * Get the minor matrix by removing a row and column
     * @param {number} row - Row index to remove
     * @param {number} col - Column index to remove
     * @returns {Object} - The minor matrix
     */
    minor: function(row, col) {
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        if (i === row) continue;
        
        const newRow = [];
        for (let j = 0; j < this.cols; j++) {
          if (j === col) continue;
          newRow.push(this.data[i][j]);
        }
        
        result.push(newRow);
      }
      
      return matrix.create(result);
    },
    
    /**
     * Calculate the inverse of this matrix
     * @returns {Object} - The inverse matrix
     */
    inverse: function() {
      if (this.rows !== this.cols) {
        throw new Error('Inverse can only be calculated for square matrices.');
      }
      
      const det = this.determinant();
      if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular and cannot be inverted.');
      }
      
      // For 1x1 matrix
      if (this.rows === 1) {
        return matrix.create([[1 / this.data[0][0]]]);
      }
      
      // For larger matrices, use adjugate method
      const adjugate = [];
      for (let i = 0; i < this.rows; i++) {
        adjugate[i] = [];
        for (let j = 0; j < this.cols; j++) {
          adjugate[i][j] = this.cofactor(j, i); // Note: i and j are swapped for transpose
        }
      }
      
      const result = [];
      for (let i = 0; i < this.rows; i++) {
        result[i] = [];
        for (let j = 0; j < this.cols; j++) {
          result[i][j] = adjugate[i][j] / det;
        }
      }
      
      return matrix.create(result);
    },
    
    /**
     * Calculate the trace of this matrix
     * @returns {number} - The trace
     */
    trace: function() {
      if (this.rows !== this.cols) {
        throw new Error('Trace can only be calculated for square matrices.');
      }
      
      let sum = 0;
      for (let i = 0; i < this.rows; i++) {
        sum += this.data[i][i];
      }
      
      return sum;
    },
    
    /**
     * Convert the matrix to a string
     * @returns {string} - String representation
     */
    toString: function() {
      return this.data.map(row => row.join('\t')).join('\n');
    }
  };
};

/**
 * Create an identity matrix of the specified size
 * @param {number} size - The size of the matrix
 * @returns {Object} - Identity matrix
 */
matrix.identity = function(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    data[i] = [];
    for (let j = 0; j < size; j++) {
      data[i][j] = i === j ? 1 : 0;
    }
  }
  
  return matrix.create(data);
};

/**
 * Create a zero matrix of the specified dimensions
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object} - Zero matrix
 */
matrix.zeros = function(rows, cols) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    data[i] = Array(cols).fill(0);
  }
  
  return matrix.create(data);
};

/**
 * Create a matrix filled with ones
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Object} - Matrix of ones
 */
matrix.ones = function(rows, cols) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    data[i] = Array(cols).fill(1);
  }
  
  return matrix.create(data);
};

/**
 * Create a diagonal matrix from an array
 * @param {Array} diagonal - The diagonal elements
 * @returns {Object} - Diagonal matrix
 */
matrix.diagonal = function(diagonal) {
  const size = diagonal.length;
  const data = [];
  
  for (let i = 0; i < size; i++) {
    data[i] = Array(size).fill(0);
    data[i][i] = diagonal[i];
  }
  
  return matrix.create(data);
};

/**
 * Solve a system of linear equations Ax = b
 * @param {Object} A - Coefficient matrix
 * @param {Array|Object} b - Right-hand side vector or matrix
 * @returns {Array|Object} - Solution vector or matrix
 */
matrix.solve = function(A, b) {
  // Convert b to a matrix if it's an array
  const B = Array.isArray(b) ? matrix.create(b.map(val => [val])) : b;
  
  // Check dimensions
  if (A.rows !== B.rows) {
    throw new Error('Dimensions of A and b must be compatible.');
  }
  
  // Use Gaussian elimination with partial pivoting
  // This is a simplified implementation and would be expanded for a full library
  
  // For now, use the inverse method (not efficient for large systems)
  const inverse = A.inverse();
  return inverse.multiply(B);
};

/**
 * Compute the eigenvalues and eigenvectors of a matrix
 * @param {Object} A - The matrix
 * @returns {Object} - Object containing eigenvalues and eigenvectors
 */
matrix.eigen = function(A) {
  if (A.rows !== A.cols) {
    throw new Error('Eigenvalues can only be computed for square matrices.');
  }
  
  // This would implement numerical methods for eigenvalue computation
  // For now, return a placeholder
  return {
    values: [],
    vectors: matrix.identity(A.rows)
  };
};

/**
 * Compute the LU decomposition of a matrix
 * @param {Object} A - The matrix
 * @returns {Object} - Object containing L and U matrices
 */
matrix.lu = function(A) {
  if (A.rows !== A.cols) {
    throw new Error('LU decomposition requires a square matrix.');
  }
  
  // This would implement the LU decomposition algorithm
  // For now, return a placeholder
  return {
    L: matrix.identity(A.rows),
    U: matrix.create(A.data)
  };
};

/**
 * Compute the QR decomposition of a matrix
 * @param {Object} A - The matrix
 * @returns {Object} - Object containing Q and R matrices
 */
matrix.qr = function(A) {
  // This would implement the QR decomposition algorithm
  // For now, return a placeholder
  return {
    Q: matrix.identity(A.rows),
    R: matrix.create(A.data)
  };
};

/**
 * Compute the singular value decomposition (SVD) of a matrix
 * @param {Object} A - The matrix
 * @returns {Object} - Object containing U, S, and V matrices
 */
matrix.svd = function(A) {
  // This would implement the SVD algorithm
  // For now, return a placeholder
  return {
    U: matrix.identity(A.rows),
    S: matrix.diagonal(Array(Math.min(A.rows, A.cols)).fill(1)),
    V: matrix.identity(A.cols)
  };
};

/**
 * Compute the rank of a matrix
 * @param {Object} A - The matrix
 * @returns {number} - The rank
 */
matrix.rank = function(A) {
  // This would implement a rank calculation algorithm
  // For now, return a placeholder
  return Math.min(A.rows, A.cols);
};

/**
 * Compute the condition number of a matrix
 * @param {Object} A - The matrix
 * @returns {number} - The condition number
 */
matrix.cond = function(A) {
  // This would implement a condition number calculation
  // For now, return a placeholder
  return 1;
};

module.exports = matrix;