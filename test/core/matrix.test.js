/**
 * Tests for the Matrix module in Herta.js
 */

const { assert, assertApproxEqual, assertMatrixApproxEqual, herta } = require('../setup');

describe('Matrix Module', () => {
  // Matrix creation tests
  describe('Matrix Creation', () => {
    it('should create a matrix from a 2D array', () => {
      const data = [[1, 2], [3, 4]];
      const matrix = herta.matrix.create(data);
      assert.deepStrictEqual(matrix, data);
    });
    
    it('should create an identity matrix', () => {
      const identity3 = herta.matrix.identity(3);
      const expected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      assert.deepStrictEqual(identity3, expected);
    });
    
    it('should create a zero matrix', () => {
      const zero3x2 = herta.matrix.zeros(3, 2);
      const expected = [[0, 0], [0, 0], [0, 0]];
      assert.deepStrictEqual(zero3x2, expected);
    });
    
    it('should create a matrix filled with a specific value', () => {
      const ones3x2 = herta.matrix.fill(3, 2, 1);
      const expected = [[1, 1], [1, 1], [1, 1]];
      assert.deepStrictEqual(ones3x2, expected);
    });
  });
  
  // Matrix operations tests
  describe('Matrix Operations', () => {
    it('should add two matrices correctly', () => {
      const A = [[1, 2], [3, 4]];
      const B = [[5, 6], [7, 8]];
      const result = herta.matrix.add(A, B);
      const expected = [[6, 8], [10, 12]];
      assert.deepStrictEqual(result, expected);
    });
    
    it('should subtract two matrices correctly', () => {
      const A = [[5, 6], [7, 8]];
      const B = [[1, 2], [3, 4]];
      const result = herta.matrix.subtract(A, B);
      const expected = [[4, 4], [4, 4]];
      assert.deepStrictEqual(result, expected);
    });
    
    it('should multiply two matrices correctly', () => {
      const A = [[1, 2], [3, 4]];
      const B = [[5, 6], [7, 8]];
      const result = herta.matrix.multiply(A, B);
      const expected = [[19, 22], [43, 50]];
      assert.deepStrictEqual(result, expected);
    });
    
    it('should calculate matrix determinant correctly', () => {
      const A = [[1, 2], [3, 4]];
      const det = herta.matrix.determinant(A);
      assert.strictEqual(det, -2);
    });
    
    it('should transpose a matrix correctly', () => {
      const A = [[1, 2, 3], [4, 5, 6]];
      const result = herta.matrix.transpose(A);
      const expected = [[1, 4], [2, 5], [3, 6]];
      assert.deepStrictEqual(result, expected);
    });
  });
  
  // Advanced matrix operations
  describe('Advanced Matrix Operations', () => {
    it('should calculate the inverse of a matrix', () => {
      const A = [[4, 7], [2, 6]];
      const result = herta.matrix.inverse(A);
      const expected = [[0.6, -0.7], [-0.2, 0.4]];
      
      // Using approximate equality due to floating point operations
      assertMatrixApproxEqual(result, expected);
    });
    
    it('should calculate eigenvalues of a symmetric matrix', () => {
      // A symmetric 2x2 matrix
      const A = [[2, 1], [1, 2]];
      const eigenvalues = herta.matrix.eigenvalues(A);
      
      // Expected eigenvalues: 3 and 1
      assert.strictEqual(eigenvalues.length, 2);
      
      // Sort to ensure consistent order
      eigenvalues.sort((a, b) => b - a);
      assertApproxEqual(eigenvalues[0], 3);
      assertApproxEqual(eigenvalues[1], 1);
    });
    
    it('should perform LU decomposition correctly', () => {
      const A = [[4, 3], [6, 3]];
      const { L, U } = herta.matrix.luDecomposition(A);
      
      // Expected L and U matrices
      const expectedL = [[1, 0], [1.5, 1]];
      const expectedU = [[4, 3], [0, -1.5]];
      
      assertMatrixApproxEqual(L, expectedL);
      assertMatrixApproxEqual(U, expectedU);
      
      // Verify that L*U equals the original matrix
      const product = herta.matrix.multiply(L, U);
      assertMatrixApproxEqual(product, A);
    });
  });
});
