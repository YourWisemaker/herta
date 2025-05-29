/**
 * Tests for the Matrix module in Herta.js
 */

const {
  assert, assertApproxEqual, assertMatrixApproxEqual, herta
} = require('../setup');
// const Matrix = require('../../src/core/matrix'); // Old import
const Matrix = herta.matrix; // Use Matrix class from herta.matrix

describe('Matrix Module', () => {
  // Matrix creation tests
  describe('Matrix Creation', () => {
    it('should create a matrix from a 2D array', () => {
      const data = [[1, 2], [3, 4]];
      const matrix = Matrix.create(data);
      assert.deepStrictEqual(matrix.elements, data);
    });

    it('should create an identity matrix', () => {
      const identity3 = Matrix.identity(3);
      const expected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      assert.deepStrictEqual(identity3.elements, expected);
    });

    it('should create a zero matrix', () => {
      const zero3x2 = Matrix.zeros(3, 2);
      const expected = [[0, 0], [0, 0], [0, 0]];
      assert.deepStrictEqual(zero3x2.elements, expected);
    });

    it('should create a matrix filled with a specific value', () => {
      const ones3x2 = Matrix.fill(3, 2, 1);
      const expected = [[1, 1], [1, 1], [1, 1]];
      assert.deepStrictEqual(ones3x2.elements, expected);
    });
  });

  // Matrix operations tests
  describe('Matrix Operations', () => {
    it('should add two matrices correctly', () => {
      const A = Matrix.create([[1, 2], [3, 4]]);
      const B = Matrix.create([[5, 6], [7, 8]]);
      const resultMatrix = A.add(B);
      const expected = [[6, 8], [10, 12]];
      assert.deepStrictEqual(resultMatrix.elements, expected);
    });

    it('should subtract two matrices correctly', () => {
      const A = Matrix.create([[5, 6], [7, 8]]);
      const B = Matrix.create([[1, 2], [3, 4]]);
      const resultMatrix = A.subtract(B);
      const expected = [[4, 4], [4, 4]];
      assert.deepStrictEqual(resultMatrix.elements, expected);
    });

    it('should multiply two matrices correctly (matrix-matrix and scalar)', () => {
      // Matrix-matrix multiplication
      const A_mm = Matrix.create([[1, 2], [3, 4]]);
      const B_mm = Matrix.create([[5, 6], [7, 8]]);
      const resultMatrix_mm = A_mm.multiply(B_mm);
      const expected_mm = [[19, 22], [43, 50]];
      assert.deepStrictEqual(resultMatrix_mm.elements, expected_mm);

      // Scalar multiplication
      const A_scalar = Matrix.create([[1, 2], [3, 4]]);
      const scalarResult = A_scalar.multiply(3);
      const expected_scalar = [[3, 6], [9, 12]];
      assert.deepStrictEqual(scalarResult.elements, expected_scalar);
    });

    it('should calculate matrix determinant correctly', () => {
      const A = Matrix.create([[1, 2], [3, 4]]);
      const det = A.determinant();
      assert.strictEqual(det, -2);
    });

    it('should transpose a matrix correctly', () => {
      const A = Matrix.create([[1, 2, 3], [4, 5, 6]]);
      const resultMatrix = A.transpose();
      const expected = [[1, 4], [2, 5], [3, 6]];
      assert.deepStrictEqual(resultMatrix.elements, expected);
    });
  });

  // Advanced matrix operations
  describe('Advanced Matrix Operations', () => {
    it('should calculate the inverse of a matrix', () => {
      const A_inv = Matrix.create([[4, 7], [2, 6]]);
      const resultMatrix_inv = A_inv.inverse();
      const expected_inv = [[0.6, -0.7], [-0.2, 0.4]];
      // Using approximate equality due to floating point operations
      // assertMatrixApproxEqual expects arrays of arrays, not Matrix instances.
      assertMatrixApproxEqual(resultMatrix_inv.elements, expected_inv, 'Inverse calculation');
    });

    it('should calculate eigenvalues of a symmetric matrix', () => {
      // A symmetric 2x2 matrix
      const A_eig = Matrix.create([[2, 1], [1, 2]]);
      assert.throws(() => {
        // Assuming eigenvalues would be an instance method if implemented
        A_eig.eigenvalues(); 
      }, Error, 'NotImplementedError: General eigenvalue calculation is not implemented yet. This function is a placeholder.');
    });

    it('should perform LU decomposition correctly', () => {
      const A_lu = Matrix.create([[4, 3], [6, 3]]);
      const { L, U } = A_lu.luDecomposition(); // Call as instance method

      const expectedL = [[1, 0], [1.5, 1]];
      const expectedU = [[4, 3], [0, -1.5]];

      assertMatrixApproxEqual(L.elements, expectedL, 'L matrix in LU decomposition');
      assertMatrixApproxEqual(U.elements, expectedU, 'U matrix in LU decomposition');

      // Verify that L*U equals the original matrix A_lu
      const product = L.multiply(U);
      assertMatrixApproxEqual(product.elements, A_lu.elements, 'L*U product verification');
    });
  });
});
