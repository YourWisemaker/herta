/**
 * Herta.js Test Setup
 * Common test configuration and helper functions
 */

const assert = require('assert');
const herta = require('../src/index.js');

// Custom assertion for approximate equality (floating point comparisons)
function assertApproxEqual(actual, expected, message, epsilon = 1e-10) {
  const diff = Math.abs(actual - expected);
  assert(diff < epsilon, message || `Expected ${expected} but got ${actual}, difference: ${diff}`);
}

// Custom assertion for array approximate equality
function assertArrayApproxEqual(actual, expected, message, epsilon = 1e-10) {
  assert.strictEqual(actual.length, expected.length, 
    message || `Arrays have different lengths: ${actual.length} vs ${expected.length}`);
  
  for (let i = 0; i < actual.length; i++) {
    assertApproxEqual(actual[i], expected[i], 
      message || `Arrays differ at index ${i}: ${actual[i]} vs ${expected[i]}`, epsilon);
  }
}

// Custom assertion for matrix approximate equality
function assertMatrixApproxEqual(actual, expected, message, epsilon = 1e-10) {
  assert.strictEqual(actual.length, expected.length, 
    message || `Matrices have different row counts: ${actual.length} vs ${expected.length}`);
  
  for (let i = 0; i < actual.length; i++) {
    assert.strictEqual(actual[i].length, expected[i].length, 
      message || `Matrices have different column counts at row ${i}: ${actual[i].length} vs ${expected[i].length}`);
    
    for (let j = 0; j < actual[i].length; j++) {
      assertApproxEqual(actual[i][j], expected[i][j], 
        message || `Matrices differ at [${i}][${j}]: ${actual[i][j]} vs ${expected[i][j]}`, epsilon);
    }
  }
}

// Export testing utilities
module.exports = {
  assert,
  assertApproxEqual,
  assertArrayApproxEqual,
  assertMatrixApproxEqual,
  herta
};
