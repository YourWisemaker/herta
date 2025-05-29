/**
 * Getting Started with Herta.js
 * Basic examples demonstrating core functionality
 */

// Import the Herta.js library
const herta = require('../../src/index.js');

console.log('Herta.js Basic Examples');
console.log('=======================\n');

// Matrix operations
console.log('Matrix Operations:');
const A = herta.matrix.create([[1, 2], [3, 4]]);
const B = herta.matrix.create([[5, 6], [7, 8]]);
console.log('Matrix A:', A);
console.log('Matrix B:', B);
console.log('A + B:', herta.matrix.add(A, B));
console.log('A * B:', herta.matrix.multiply(A, B));
console.log('Determinant of A:', herta.matrix.determinant(A));
console.log('Inverse of A:', herta.matrix.inverse(A));
console.log();

// Basic calculus
console.log('\nCalculus Examples (using symbolic differentiation):');
const exprString = 'x^2 + 2*x + 1';
const parsedExpr = herta.symbolic.parse(exprString);
const derivativeExpr = herta.symbolic.differentiate(parsedExpr, 'x');
console.log('f(x) =', exprString);
console.log('f\'(x) =', derivativeExpr.toString());
console.log('f\'(2) =', herta.symbolic.evaluate(derivativeExpr, { x: 2 })); // Should be 6

// Keep the original integration example for now, assuming herta.calculus.integrate works numerically
// or is a separate issue to address if it also fails.
// The original 'f' function is fine for herta.calculus.integrate if it handles JS functions.
const f_integrate = (x) => x * x + 2 * x + 1; 
console.log('∫f(x)dx from 0 to 2 (numerical) =', herta.calculus.integrate(f_integrate, 'x', 0, 2));
console.log();

// Statistical functions
console.log('Statistical Functions:');
const data = [12, 15, 18, 22, 25, 30, 35, 40, 45, 50];
console.log('Data:', data);

const stats = herta.statistics;
let meanFunc = stats.mean;
let medianFunc = stats.median;
let stdDevFunc = stats.standardDeviation;
let corrFunc = stats.correlation;

if (typeof meanFunc !== 'function' && stats.descriptive && typeof stats.descriptive.mean === 'function') {
    console.log('Accessing stats via herta.statistics.descriptive.*');
    meanFunc = stats.descriptive.mean;
    medianFunc = stats.descriptive.median;
    stdDevFunc = stats.descriptive.standardDeviation;
    corrFunc = stats.descriptive.correlation;
} else if (typeof meanFunc === 'function') {
    console.log('Accessing stats via herta.statistics.*');
} else {
    console.error('Could not find statistics functions (mean, median, etc.)');
}

if (meanFunc) console.log('Mean:', meanFunc(data));
if (medianFunc) console.log('Median:', medianFunc(data));
if (stdDevFunc) console.log('Standard Deviation:', stdDevFunc(data));
if (corrFunc) console.log('Correlation:', corrFunc([1, 2, 3, 4, 5], [2, 3, 4, 5, 6]));
console.log();

// Complex numbers
console.log('Complex Numbers:');
const c1 = herta.complex.create(3, 4);
const c2 = herta.complex.create(1, 2);
console.log('c1 = 3 + 4i');
console.log('c2 = 1 + 2i');
console.log('c1 + c2 =', herta.complex.add(c1, c2));
console.log('c1 * c2 =', herta.complex.multiply(c1, c2));
console.log('|c1| =', herta.complex.abs(c1));
console.log();

// Symbolic computation
console.log('Symbolic Computation:');
const expr = herta.symbolic.parse('x^2 + 2*x + 1');
console.log('Expression:', expr.toString());
console.log('Simplified:', herta.symbolic.simplify(expr).toString());
console.log('Derivative:', herta.symbolic.differentiate(expr, 'x').toString());
console.log('Evaluated at x=3:', herta.symbolic.evaluate(expr, { x: 3 }));
console.log();

// Creating a custom instance with configuration
console.log('Custom Configuration:');
const scientificHerta = herta.create({
  precision: 128,
  scientificMode: true
});
console.log('High precision calculation:');
console.log('π to 50 decimal places:', scientificHerta.constants.pi.toFixed(50));
console.log();

console.log('Examples completed successfully!');
