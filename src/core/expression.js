/**
 * Expression evaluation module for herta.js
 */

const Complex = require('complex.js');

// Expression module
const expression = {};

/**
 * Evaluate a mathematical expression
 * @param {string} expr - The expression to evaluate
 * @param {Object} [scope] - Variables and their values
 * @returns {number|Complex|Array|string} - The result of the evaluation
 */
expression.evaluate = function(expr, scope = {}) {
  // Parse and evaluate the expression
  try {
    // Handle unit conversions
    if (expr.includes(' to ')) {
      return handleUnitConversion(expr);
    }
    
    // Handle matrix expressions
    if (expr.includes('det(')) {
      return handleMatrixExpressions(expr, scope);
    }
    
    // Handle complex numbers
    if (expr.includes('i') && !expr.match(/[a-zA-Z]+i[a-zA-Z]*/)) {
      return handleComplexExpression(expr, scope);
    }
    
    // Handle trigonometric expressions with degrees
    if (expr.includes('deg')) {
      return handleDegreeExpressions(expr, scope);
    }
    
    // Standard expression evaluation
    return evaluateStandardExpression(expr, scope);
  } catch (error) {
    throw new Error(`Error evaluating expression: ${error.message}`);
  }
};

/**
 * Handle unit conversions
 * @param {string} expr - The expression with unit conversion
 * @returns {string} - The result with the target unit
 */
function handleUnitConversion(expr) {
  const parts = expr.split(' to ');
  if (parts.length !== 2) {
    throw new Error('Invalid unit conversion format');
  }
  
  const sourceExpr = parts[0].trim();
  const targetUnit = parts[1].trim();
  
  // Extract the value and source unit
  const valueMatch = sourceExpr.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!valueMatch) {
    throw new Error('Invalid source format for unit conversion');
  }
  
  const value = parseFloat(valueMatch[1]);
  const sourceUnit = valueMatch[2];
  
  // Perform the conversion
  return convertUnit(value, sourceUnit, targetUnit);
}

/**
 * Convert a value from one unit to another
 * @param {number} value - The value to convert
 * @param {string} sourceUnit - The source unit
 * @param {string} targetUnit - The target unit
 * @returns {string} - The converted value with the target unit
 */
function convertUnit(value, sourceUnit, targetUnit) {
  // Define conversion factors
  const unitConversions = {
    // Length
    'm': { 'cm': 100, 'mm': 1000, 'km': 0.001, 'inch': 39.3701, 'ft': 3.28084, 'mi': 0.000621371 },
    'cm': { 'm': 0.01, 'mm': 10, 'km': 0.00001, 'inch': 0.393701, 'ft': 0.0328084, 'mi': 0.00000621371 },
    'mm': { 'm': 0.001, 'cm': 0.1, 'km': 0.000001, 'inch': 0.0393701, 'ft': 0.00328084, 'mi': 0.000000621371 },
    'km': { 'm': 1000, 'cm': 100000, 'mm': 1000000, 'inch': 39370.1, 'ft': 3280.84, 'mi': 0.621371 },
    'inch': { 'm': 0.0254, 'cm': 2.54, 'mm': 25.4, 'km': 0.0000254, 'ft': 0.0833333, 'mi': 0.0000157828 },
    'ft': { 'm': 0.3048, 'cm': 30.48, 'mm': 304.8, 'km': 0.0003048, 'inch': 12, 'mi': 0.000189394 },
    'mi': { 'm': 1609.34, 'cm': 160934, 'mm': 1609340, 'km': 1.60934, 'inch': 63360, 'ft': 5280 },
    
    // Weight/Mass
    'kg': { 'g': 1000, 'mg': 1000000, 'lb': 2.20462, 'oz': 35.274 },
    'g': { 'kg': 0.001, 'mg': 1000, 'lb': 0.00220462, 'oz': 0.035274 },
    'mg': { 'kg': 0.000001, 'g': 0.001, 'lb': 0.00000220462, 'oz': 0.000035274 },
    'lb': { 'kg': 0.453592, 'g': 453.592, 'mg': 453592, 'oz': 16 },
    'oz': { 'kg': 0.0283495, 'g': 28.3495, 'mg': 28349.5, 'lb': 0.0625 },
    
    // Volume
    'l': { 'ml': 1000, 'gal': 0.264172, 'qt': 1.05669, 'pt': 2.11338, 'cup': 4.22675 },
    'ml': { 'l': 0.001, 'gal': 0.000264172, 'qt': 0.00105669, 'pt': 0.00211338, 'cup': 0.00422675 },
    'gal': { 'l': 3.78541, 'ml': 3785.41, 'qt': 4, 'pt': 8, 'cup': 16 },
    'qt': { 'l': 0.946353, 'ml': 946.353, 'gal': 0.25, 'pt': 2, 'cup': 4 },
    'pt': { 'l': 0.473176, 'ml': 473.176, 'gal': 0.125, 'qt': 0.5, 'cup': 2 },
    'cup': { 'l': 0.236588, 'ml': 236.588, 'gal': 0.0625, 'qt': 0.25, 'pt': 0.5 },
    
    // Temperature
    'c': { 'f': (v) => v * 9/5 + 32, 'k': (v) => v + 273.15 },
    'f': { 'c': (v) => (v - 32) * 5/9, 'k': (v) => (v - 32) * 5/9 + 273.15 },
    'k': { 'c': (v) => v - 273.15, 'f': (v) => (v - 273.15) * 9/5 + 32 },
    
    // Time
    's': { 'ms': 1000, 'min': 1/60, 'h': 1/3600, 'day': 1/86400 },
    'ms': { 's': 0.001, 'min': 0.0000166667, 'h': 2.77778e-7, 'day': 1.15741e-8 },
    'min': { 's': 60, 'ms': 60000, 'h': 1/60, 'day': 1/1440 },
    'h': { 's': 3600, 'ms': 3600000, 'min': 60, 'day': 1/24 },
    'day': { 's': 86400, 'ms': 86400000, 'min': 1440, 'h': 24 },
  };
  
  // Normalize units to lowercase
  sourceUnit = sourceUnit.toLowerCase();
  targetUnit = targetUnit.toLowerCase();
  
  // Check if conversion is possible
  if (!unitConversions[sourceUnit] || !unitConversions[sourceUnit][targetUnit]) {
    throw new Error(`Cannot convert from ${sourceUnit} to ${targetUnit}`);
  }
  
  // Perform the conversion
  let result;
  const conversion = unitConversions[sourceUnit][targetUnit];
  
  if (typeof conversion === 'function') {
    // For conversions that require a formula (like temperature)
    result = conversion(value);
  } else {
    // For conversions that use a simple factor
    result = value * conversion;
  }
  
  // Format the result
  return `${result} ${targetUnit}`;
}

/**
 * Handle matrix expressions
 * @param {string} expr - The expression with matrix operations
 * @param {Object} scope - Variables and their values
 * @returns {number|Array} - The result of the matrix operation
 */
function handleMatrixExpressions(expr, scope) {
  // Handle determinant calculation
  if (expr.includes('det(')) {
    const matrixMatch = expr.match(/det\(\[(.+)\]\)/);
    if (matrixMatch) {
      const matrixStr = matrixMatch[1];
      // Parse the matrix from the string
      const matrix = parseMatrix(matrixStr);
      // Calculate the determinant
      return calculateDeterminant(matrix);
    }
  }
  
  // For other matrix operations, we would need a more sophisticated parser
  throw new Error('Unsupported matrix operation');
}

/**
 * Parse a matrix from a string representation
 * @param {string} matrixStr - The string representation of the matrix
 * @returns {Array<Array<number>>} - The parsed matrix
 */
function parseMatrix(matrixStr) {
  // Split by semicolons to get rows
  const rows = matrixStr.split(';');
  
  // Parse each row
  return rows.map(row => {
    // Remove brackets and split by commas
    const cleanRow = row.trim().replace(/[\[\]]/g, '');
    return cleanRow.split(',').map(val => parseFloat(val.trim()));
  });
}

/**
 * Calculate the determinant of a matrix
 * @param {Array<Array<number>>} matrix - The matrix
 * @returns {number} - The determinant
 */
function calculateDeterminant(matrix) {
  // Check if it's a square matrix
  const n = matrix.length;
  if (!matrix.every(row => row.length === n)) {
    throw new Error('Determinant can only be calculated for square matrices');
  }
  
  // Base case for 1x1 matrix
  if (n === 1) {
    return matrix[0][0];
  }
  
  // Base case for 2x2 matrix
  if (n === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  
  // For larger matrices, use cofactor expansion
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += matrix[0][j] * cofactor(matrix, 0, j);
  }
  
  return det;
}

/**
 * Calculate the cofactor of a matrix element
 * @param {Array<Array<number>>} matrix - The matrix
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @returns {number} - The cofactor
 */
function cofactor(matrix, row, col) {
  const minor = calculateMinor(matrix, row, col);
  return ((row + col) % 2 === 0 ? 1 : -1) * minor;
}

/**
 * Calculate the minor of a matrix element
 * @param {Array<Array<number>>} matrix - The matrix
 * @param {number} row - The row to exclude
 * @param {number} col - The column to exclude
 * @returns {number} - The minor determinant
 */
function calculateMinor(matrix, row, col) {
  // Create a submatrix by excluding the specified row and column
  const submatrix = [];
  const n = matrix.length;
  
  for (let i = 0; i < n; i++) {
    if (i === row) continue;
    
    const newRow = [];
    for (let j = 0; j < n; j++) {
      if (j === col) continue;
      newRow.push(matrix[i][j]);
    }
    
    submatrix.push(newRow);
  }
  
  // Calculate the determinant of the submatrix
  return calculateDeterminant(submatrix);
}

/**
 * Handle complex number expressions
 * @param {string} expr - The expression with complex numbers
 * @param {Object} scope - Variables and their values
 * @returns {Complex} - The result as a complex number
 */
function handleComplexExpression(expr, scope) {
  // Replace 'i' with Complex.I for evaluation
  const jsExpr = expr.replace(/([0-9])i/g, '$1*I').replace(/i/g, 'I');
  
  // Create a scope with Complex.I
  const complexScope = { ...scope, I: new Complex(0, 1) };
  
  // Evaluate the expression
  const result = evaluateStandardExpression(jsExpr, complexScope);
  
  // Convert the result to a string if it's a complex number
  if (result instanceof Complex) {
    return result;
  }
  
  return result;
}

/**
 * Handle expressions with degrees
 * @param {string} expr - The expression with degrees
 * @param {Object} scope - Variables and their values
 * @returns {number} - The result
 */
function handleDegreeExpressions(expr, scope) {
  // Replace 'deg' with conversion to radians
  const radianExpr = expr.replace(/([\d.]+)\s*deg/g, (match, p1) => {
    return `(${p1} * Math.PI / 180)`;
  });
  
  // Evaluate the modified expression
  return evaluateStandardExpression(radianExpr, scope);
}

/**
 * Evaluate a standard mathematical expression
 * @param {string} expr - The expression to evaluate
 * @param {Object} scope - Variables and their values
 * @returns {number|Complex|Array} - The result of the evaluation
 */
function evaluateStandardExpression(expr, scope) {
  // Replace mathematical functions with their JavaScript equivalents
  const jsExpr = expr
    .replace(/\^/g, '**')                // Replace ^ with **
    .replace(/sin\(/g, 'Math.sin(')      // Replace sin with Math.sin
    .replace(/cos\(/g, 'Math.cos(')      // Replace cos with Math.cos
    .replace(/tan\(/g, 'Math.tan(')      // Replace tan with Math.tan
    .replace(/asin\(/g, 'Math.asin(')    // Replace asin with Math.asin
    .replace(/acos\(/g, 'Math.acos(')    // Replace acos with Math.acos
    .replace(/atan\(/g, 'Math.atan(')    // Replace atan with Math.atan
    .replace(/atan2\(/g, 'Math.atan2(')  // Replace atan2 with Math.atan2
    .replace(/sqrt\(/g, 'Math.sqrt(')    // Replace sqrt with Math.sqrt
    .replace(/abs\(/g, 'Math.abs(')      // Replace abs with Math.abs
    .replace(/log\(/g, 'Math.log(')      // Replace log with Math.log
    .replace(/exp\(/g, 'Math.exp(')      // Replace exp with Math.exp
    .replace(/pi/gi, 'Math.PI')          // Replace pi with Math.PI
    .replace(/e(?![a-zA-Z])/g, 'Math.E'); // Replace e with Math.E (but not in variable names)
  
  // Create a function with the scope variables as parameters
  const scopeKeys = Object.keys(scope);
  const scopeValues = scopeKeys.map(key => scope[key]);
  
  // Create and evaluate the function
  try {
    const func = new Function(...scopeKeys, `return ${jsExpr};`);
    return func(...scopeValues);
  } catch (error) {
    throw new Error(`Error evaluating expression: ${error.message}`);
  }
}

/**
 * Parse a string into a mathematical expression
 * @param {string} expr - The expression string
 * @returns {Function} - A function that evaluates the expression
 */
expression.parse = function(expr) {
  // Create a function that evaluates the expression with the given scope
  return function(scope = {}) {
    return expression.evaluate(expr, scope);
  };
};

/**
 * Compile a string into an optimized function
 * @param {string} expr - The expression string
 * @returns {Function} - An optimized function that evaluates the expression
 */
expression.compile = function(expr) {
  // This is a simplified implementation
  // In a full implementation, we would parse the expression into an AST
  // and generate optimized code
  
  return expression.parse(expr);
};

/**
 * Symbolically derive an expression
 * @param {string} expr - The expression to differentiate
 * @param {string} variable - The variable to differentiate with respect to
 * @returns {string} - The derivative expression
 */
expression.derivative = function(expr, variable) {
  // This is a simplified implementation of symbolic differentiation
  // In a full implementation, we would parse the expression into an AST
  // and apply differentiation rules
  
  // Handle some basic cases
  
  // Constant rule: d/dx(c) = 0
  if (!expr.includes(variable)) {
    return '0';
  }
  
  // Power rule: d/dx(x^n) = n*x^(n-1)
  const powerMatch = expr.match(new RegExp(`${variable}\\^(\\d+)`));
  if (powerMatch && expr === `${variable}^${powerMatch[1]}`) {
    const power = parseInt(powerMatch[1]);
    if (power === 0) {
      return '0';
    } else if (power === 1) {
      return '1';
    } else {
      return `${power}*${variable}^${power - 1}`;
    }
  }
  
  // Linear rule: d/dx(x) = 1
  if (expr === variable) {
    return '1';
  }
  
  // Sum rule: d/dx(f(x) + g(x)) = f'(x) + g'(x)
  if (expr.includes('+')) {
    const terms = expr.split('+').map(term => term.trim());
    const derivatives = terms.map(term => expression.derivative(term, variable));
    return derivatives.join(' + ');
  }
  
  // Difference rule: d/dx(f(x) - g(x)) = f'(x) - g'(x)
  if (expr.includes('-')) {
    const terms = expr.split('-').map(term => term.trim());
    const derivatives = terms.map(term => expression.derivative(term, variable));
    return derivatives.join(' - ');
  }
  
  // Product rule: d/dx(f(x)*g(x)) = f'(x)*g(x) + f(x)*g'(x)
  if (expr.includes('*')) {
    const factors = expr.split('*').map(factor => factor.trim());
    if (factors.length === 2) {
      const f = factors[0];
      const g = factors[1];
      const df = expression.derivative(f, variable);
      const dg = expression.derivative(g, variable);
      return `${df}*${g} + ${f}*${dg}`;
    }
  }
  
  // For more complex expressions, return a placeholder
  return `d/d${variable}(${expr})`;
};

module.exports = expression;