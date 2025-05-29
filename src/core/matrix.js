/**
 * Core matrix operations for herta.js
 * Provides matrix manipulation, decompositions, and linear algebra operations
 */

import Decimal from 'decimal.js';
import Complex from 'complex.js';

/**
 * Matrix class to handle matrix operations
 */
class Matrix {
  /**
   * Create a matrix object from array data
   * @param {Array} data - The matrix data
   */
  constructor(data) {
    if (!Array.isArray(data) || (data.length > 0 && !Array.isArray(data[0]))) {
      throw new Error('Invalid matrix data: input must be a 2D array.');
    }
    // Ensure all rows have the same number of columns
    if (data.length > 0) {
      const firstRowLength = data[0].length;
      for (let i = 1; i < data.length; i++) {
        if (!Array.isArray(data[i]) || data[i].length !== firstRowLength) {
          throw new Error('Invalid matrix data: all rows must have the same number of columns.');
        }
      }
      this.cols = firstRowLength;
    } else {
      this.cols = 0; // Matrix with 0 rows has 0 columns
    }
    this.elements = data.map((row) => [...row]);
    this.rows = data.length;
    this.type = 'matrix'; // Useful for type checking if needed
  }

  /**
   * Convert matrix to string
   * @returns {string} String representation
   */
  toString() {
    return this.elements.map((row) => row.join(' ')).join('\n');
  }

  /** Static factory methods **/

  static create(dataArray) {
    return new Matrix(dataArray);
  }

  static identity(size) {
    if (size <= 0) throw new Error('Size must be a positive integer.');
    const identityArray = Array(size).fill(null).map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      identityArray[i][i] = 1;
    }
    return new Matrix(identityArray);
  }

  static zeros(rows, cols) {
    if (rows <= 0 || cols <= 0) throw new Error('Dimensions must be positive integers.');
    const zeroArray = Array(rows).fill(null).map(() => Array(cols).fill(0));
    return new Matrix(zeroArray);
  }

  static fill(rows, cols, value) {
    if (rows <= 0 || cols <= 0) throw new Error('Dimensions must be positive integers.');
    const filledArray = Array(rows).fill(null).map(() => Array(cols).fill(value));
    return new Matrix(filledArray);
  }

  /** Instance methods **/

  add(otherMatrix) {
    if (!(otherMatrix instanceof Matrix)) {
      throw new Error('Input must be a Matrix instance for addition.');
    }
    if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
      throw new Error('Matrix dimensions must match for addition.');
    }
    const resultData = this.elements.map((row, i) =>
      row.map((val, j) => val + otherMatrix.elements[i][j])
    );
    return new Matrix(resultData);
  }

  subtract(otherMatrix) {
    if (!(otherMatrix instanceof Matrix)) {
      throw new Error('Input must be a Matrix instance for subtraction.');
    }
    if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
      throw new Error('Matrix dimensions must match for subtraction.');
    }
    const resultData = this.elements.map((row, i) =>
      row.map((val, j) => val - otherMatrix.elements[i][j])
    );
    return new Matrix(resultData);
  }

  multiply(otherMatrixOrScalar) {
    if (otherMatrixOrScalar instanceof Matrix) {
      // Matrix multiplication
      if (this.cols !== otherMatrixOrScalar.rows) {
        throw new Error('Number of columns in the first matrix must match the number of rows in the second matrix for multiplication.');
      }
      const resultData = Array(this.rows).fill(null).map(() => Array(otherMatrixOrScalar.cols).fill(0));
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < otherMatrixOrScalar.cols; j++) {
          for (let k = 0; k < this.cols; k++) {
            resultData[i][j] += this.elements[i][k] * otherMatrixOrScalar.elements[k][j];
          }
        }
      }
      return new Matrix(resultData);
    } else if (typeof otherMatrixOrScalar === 'number') {
      // Scalar multiplication
      const resultData = this.elements.map(row =>
        row.map(val => val * otherMatrixOrScalar)
      );
      return new Matrix(resultData);
    } else {
      throw new Error('Input for multiplication must be a Matrix instance or a scalar number.');
    }
  }

  transpose() {
    if (this.rows === 0) return new Matrix([]); // Transpose of empty matrix is empty matrix
    const transposedData = Array(this.cols).fill(null).map(() => Array(this.rows).fill(0));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        transposedData[j][i] = this.elements[i][j];
      }
    }
    return new Matrix(transposedData);
  }

  determinant() {
    if (this.rows !== this.cols) {
      throw new Error('Matrix must be square to calculate its determinant.');
    }
    if (this.rows === 0) return 1; // Determinant of an empty matrix (0x0) is 1 by convention
    return this._calculateDeterminant(this.elements);
  }

  _calculateDeterminant(matrixElements) {
    const n = matrixElements.length;
    if (n === 1) {
      return matrixElements[0][0];
    }
    if (n === 2) {
      return matrixElements[0][0] * matrixElements[1][1] - matrixElements[0][1] * matrixElements[1][0];
    }

    let det = 0;
    for (let j = 0; j < n; j++) {
      const subMatrix = matrixElements
        .slice(1)
        .map(row => row.filter((_, colIndex) => colIndex !== j));
      det += (j % 2 === 0 ? 1 : -1) * matrixElements[0][j] * this._calculateDeterminant(subMatrix);
    }
    return det;
  }

  inverse() {
    if (this.rows !== this.cols) {
      throw new Error('Matrix must be square to calculate its inverse.');
    }
    if (this.rows === 0) throw new Error("Cannot invert an empty matrix.");

    const det = this.determinant();
    if (Math.abs(det) < 1e-10) { // Using epsilon for float comparison
      throw new Error('Matrix is singular and cannot be inverted (determinant is close to zero).');
    }

    const n = this.rows;
    if (n === 1) {
      return new Matrix([[1 / this.elements[0][0]]]);
    }

    // Calculate cofactor matrix
    const cofactorMatrixData = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const subMatrixElements = this.elements
          .filter((_, rowIndex) => rowIndex !== i)
          .map(row => row.filter((_, colIndex) => colIndex !== j));
        const sign = (i + j) % 2 === 0 ? 1 : -1;
        cofactorMatrixData[i][j] = sign * this._calculateDeterminant(subMatrixElements);
      }
    }
    
    const adjugateMatrix = new Matrix(cofactorMatrixData).transpose();
    
    const inverseMatrixData = adjugateMatrix.elements.map(row =>
      row.map(val => val / det)
    );

    return new Matrix(inverseMatrixData);
  }

  luDecomposition() {
    if (this.rows !== this.cols) {
      throw new Error('Matrix must be square for LU decomposition.');
    }
    if (this.rows === 0) {
        return { L: new Matrix([]), U: new Matrix([]) };
    }

    const n = this.rows;
    const LData = Matrix.identity(n).elements;
    const UData = Matrix.zeros(n, n).elements;

    const A_copy = this.elements.map(row => [...row]); // Operate on a copy

    for (let j = 0; j < n; j++) {
      // Calculate U_ij
      for (let i = 0; i <= j; i++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += LData[i][k] * UData[k][j];
        }
        UData[i][j] = A_copy[i][j] - sum;
      }

      // Calculate L_ij
      for (let i = j + 1; i < n; i++) {
        if (Math.abs(UData[j][j]) < 1e-10) { // Check for zero pivot
          throw new Error('LU decomposition failed: zero pivot encountered. Matrix may be singular or require pivoting.');
        }
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += LData[i][k] * UData[k][j];
        }
        LData[i][j] = (A_copy[i][j] - sum) / UData[j][j];
      }
    }

    return {
      L: new Matrix(LData),
      U: new Matrix(UData)
    };
  }
}

// Export the Matrix class as the primary export
export default Matrix;
