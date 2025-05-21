/**
 * Number Theory Module Examples
 * Demonstrates advanced number theory capabilities in Herta.js
 */

const herta = require('../../src/index.js');
const { numberTheory } = herta;

console.log('Herta.js Number Theory Examples');
console.log('===============================\n');

// Prime factorization using Pollard's rho algorithm
console.log('1. Prime Factorization');
console.log('---------------------');
const numberToFactorize = 12345678;
console.log(`Factorizing ${numberToFactorize}:`);
const factors = numberTheory.primeFactorize(numberToFactorize);
console.log('Factors:', factors);
console.log('Verification:', factors.reduce((a, b) => a * b, 1) === numberToFactorize ? 'Valid' : 'Invalid');
console.log();

// Miller-Rabin primality testing
console.log('2. Miller-Rabin Primality Test');
console.log('-----------------------------');
const primeCandidates = [97, 561, 1299827];
primeCandidates.forEach(num => {
  const isPrime = numberTheory.isProbablePrime(num);
  console.log(`${num} is ${isPrime ? 'probably prime' : 'composite'}`);
});
console.log();

// Extended Euclidean Algorithm
console.log('3. Extended Euclidean Algorithm');
console.log('------------------------------');
const a = 123, b = 456;
const { gcd, x, y } = numberTheory.extendedGCD(a, b);
console.log(`GCD(${a}, ${b}) = ${gcd}`);
console.log(`Bézout coefficients: ${x} * ${a} + ${y} * ${b} = ${gcd}`);
console.log(`Verification: ${x * a + y * b === gcd ? 'Valid' : 'Invalid'}`);
console.log();

// Chinese Remainder Theorem
console.log('4. Chinese Remainder Theorem');
console.log('---------------------------');
const remainders = [3, 4, 5];
const moduli = [5, 7, 9];
const solution = numberTheory.chineseRemainderTheorem(remainders, moduli);
console.log(`Find x such that:`);
for (let i = 0; i < remainders.length; i++) {
  console.log(`  x ≡ ${remainders[i]} (mod ${moduli[i]})`);
}
console.log(`Solution: x = ${solution}`);
console.log('Verification:');
for (let i = 0; i < moduli.length; i++) {
  console.log(`  ${solution} ≡ ${solution % moduli[i]} (mod ${moduli[i]}) => ${solution % moduli[i] === remainders[i] ? 'Valid' : 'Invalid'}`);
}
console.log();

// Euler's Totient Function
console.log('5. Euler\'s Totient Function');
console.log('---------------------------');
const totientNumbers = [10, 20, 30, 60];
totientNumbers.forEach(num => {
  const totient = numberTheory.eulerTotient(num);
  console.log(`φ(${num}) = ${totient}`);
});
console.log();

// Diophantine Equation Solver
console.log('6. Linear Diophantine Equation Solver');
console.log('-----------------------------------');
const coefA = 13, coefB = 17, coefC = 1;
console.log(`Solving: ${coefA}x + ${coefB}y = ${coefC}`);
const diophSolution = numberTheory.solveDiophantine(coefA, coefB, coefC);
if (diophSolution) {
  const { x0, y0, xParam, yParam } = diophSolution;
  console.log(`General solution: x = ${x0} + ${yParam}t, y = ${y0} - ${xParam}t, where t is an integer`);
  
  // Show a few solutions
  console.log('Some solutions:');
  for (let t = 0; t < 3; t++) {
    const x = x0 + yParam * t;
    const y = y0 - xParam * t;
    console.log(`  t = ${t}: (${x}, ${y}) => ${coefA}(${x}) + ${coefB}(${y}) = ${coefA * x + coefB * y}`);
  }
} else {
  console.log('No solution exists');
}
console.log();

// Continued Fractions
console.log('7. Continued Fractions');
console.log('----------------------');
const rationalNumber = 415/93;
console.log(`Express ${rationalNumber} as a continued fraction:`);
const continuedFraction = numberTheory.toContinuedFraction(rationalNumber);
console.log('Continued fraction:', continuedFraction);

// Calculate convergents
console.log('\nCalculating convergents:');
const convergents = numberTheory.continuedFractionConvergents(continuedFraction);
convergents.forEach((conv, i) => {
  console.log(`  Convergent ${i+1}: ${conv.numerator}/${conv.denominator} = ${conv.numerator/conv.denominator}`);
});
console.log();

// Pythagorean Triples
console.log('8. Primitive Pythagorean Triples');
console.log('-------------------------------');
const maxHypotenuse = 100;
console.log(`Generating primitive Pythagorean triples with hypotenuse ≤ ${maxHypotenuse}:`);
const triples = numberTheory.primitivePythagoreanTriples(maxHypotenuse);
triples.forEach(triple => {
  console.log(`  (${triple[0]}, ${triple[1]}, ${triple[2]}) => ${triple[0]}² + ${triple[1]}² = ${triple[0]*triple[0] + triple[1]*triple[1]} = ${triple[2]}²`);
});

console.log('\nHerta.js Number Theory module demonstration completed!');
