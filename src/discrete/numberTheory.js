/**
 * numberTheory.js
 * Advanced number theory operations for Herta.js
 */

/**
 * Generate prime numbers up to a given limit using the Sieve of Eratosthenes
 * @param {Number} limit - Upper limit for prime generation
 * @returns {Array} - Array of prime numbers
 */
function generatePrimes(limit) {
  const sieve = Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;

  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) primes.push(i);
  }

  return primes;
}

/**
 * Factorize a number into its prime factors
 * @param {Number} n - Number to factorize
 * @returns {Array} - Array of prime factors
 */
function factorize(n) {
  const factors = [];
  let divisor = 2;

  while (n > 1) {
    while (n % divisor === 0) {
      factors.push(divisor);
      n /= divisor;
    }
    divisor++;

    // Optimization for large prime factors
    if (divisor * divisor > n && n > 1) {
      factors.push(n);
      break;
    }
  }

  return factors;
}

/**
 * Calculate the greatest common divisor (GCD) of two numbers
 * @param {Number} a - First number
 * @param {Number} b - Second number
 * @returns {Number} - Greatest common divisor
 */
function gcd(a, b) {
  if (b === 0) return Math.abs(a);
  return gcd(b, a % b);
}

/**
 * Calculate the least common multiple (LCM) of two numbers
 * @param {Number} a - First number
 * @param {Number} b - Second number
 * @returns {Number} - Least common multiple
 */
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Check if a number is prime
 * @param {Number} n - Number to check
 * @returns {Boolean} - True if prime, false otherwise
 */
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * Calculate modular exponentiation (a^b mod n) efficiently
 * @param {Number} base - Base value
 * @param {Number} exponent - Exponent value
 * @param {Number} modulus - Modulus value
 * @returns {Number} - Result of modular exponentiation
 */
function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;

  let result = 1;
  base %= modulus;

  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }

  return result;
}

/**
 * Calculate Euler's totient function φ(n) - counts numbers up to n that are coprime to n
 * @param {Number} n - Input number
 * @returns {Number} - Value of Euler's totient function
 */
function eulerTotient(n) {
  let result = n; // Initialize result as n

  // Consider all prime factors of n and subtract their
  // multiples from result
  for (let p = 2; p * p <= n; p++) {
    // Check if p is a prime factor
    if (n % p === 0) {
      // If yes, then update n and result
      while (n % p === 0) {
        n = Math.floor(n / p);
      }
      result -= Math.floor(result / p);
    }
  }

  // If n has a prime factor greater than sqrt(n)
  // (There can be at-most one such prime factor)
  if (n > 1) {
    result -= Math.floor(result / n);
  }

  return result;
}

/**
 * Extended Euclidean Algorithm to find Bézout coefficients and GCD
 * @param {Number} a - First number
 * @param {Number} b - Second number
 * @returns {Array} - Array [gcd, x, y] where ax + by = gcd(a,b)
 */
function extendedGcd(a, b) {
  if (b === 0) {
    return [a, 1, 0];
  }
  const [d, x, y] = extendedGcd(b, a % b);
  return [d, y, x - Math.floor(a / b) * y];
}

/**
 * Solve linear congruence ax ≡ b (mod m)
 * @param {Number} a - Coefficient
 * @param {Number} b - Right-hand side
 * @param {Number} m - Modulus
 * @returns {Array} - Array of solutions modulo m, or empty array if no solution
 */
function solveLinearCongruence(a, b, m) {
  // Ensure positive values
  a = ((a % m) + m) % m;
  b = ((b % m) + m) % m;

  const [g, x, _] = extendedGcd(a, m);

  if (b % g !== 0) {
    return []; // No solution
  }

  let x0 = (x * (b / g)) % m;
  x0 = ((x0 % m) + m) % m;

  const solutions = [];
  for (let i = 0; i < g; i++) {
    solutions.push((x0 + i * (m / g)) % m);
  }

  return solutions;
}

/**
 * Implement Chinese Remainder Theorem to solve system of congruences
 * @param {Array} remainders - Array of remainders
 * @param {Array} moduli - Array of moduli
 * @returns {Number} - Solution x such that x ≡ remainders[i] (mod moduli[i]) for all i
 */
function chineseRemainderTheorem(remainders, moduli) {
  if (remainders.length !== moduli.length) {
    throw new Error('Number of remainders must equal number of moduli');
  }

  let result = 0;
  const product = moduli.reduce((a, b) => a * b, 1);

  for (let i = 0; i < moduli.length; i++) {
    const m = moduli[i];
    const pp = Math.floor(product / m);
    const [_, inv, __] = extendedGcd(pp, m);
    result += remainders[i] * pp * inv;
  }

  return ((result % product) + product) % product;
}

/**
 * Calculate Legendre symbol (a/p) - determines whether a is a quadratic residue modulo p
 * @param {Number} a - Number to check
 * @param {Number} p - Prime modulus
 * @returns {Number} - 1 if a is a quadratic residue modulo p, -1 if not, 0 if a is divisible by p
 */
function legendreSymbol(a, p) {
  if (p <= 1 || p % 2 === 0) {
    throw new Error('p must be an odd prime');
  }

  a = ((a % p) + p) % p;
  if (a === 0) return 0;
  if (a === 1) return 1;

  let result;
  if (a % 2 === 0) {
    result = legendreSymbol(a / 2, p);
    if (p % 8 === 3 || p % 8 === 5) result = -result;
  } else {
    result = legendreSymbol(p % a, a);
    if (a % 4 === 3 && p % 4 === 3) result = -result;
  }

  return result;
}

/**
 * Find all quadratic residues modulo p
 * @param {Number} p - Modulus
 * @returns {Array} - Array of quadratic residues
 */
function quadraticResidues(p) {
  const residues = new Set();

  for (let i = 1; i < p; i++) {
    residues.add((i * i) % p);
  }

  return Array.from(residues).sort((a, b) => a - b);
}

/**
 * Convert a number to continued fraction representation
 * @param {Number} num - Numerator
 * @param {Number} den - Denominator
 * @returns {Array} - Array of coefficients in the continued fraction
 */
function toContinuedFraction(num, den) {
  const result = [];

  while (den > 0) {
    result.push(Math.floor(num / den));
    const temp = num;
    num = den;
    den = temp % den;
  }

  return result;
}

/**
 * Convert a continued fraction back to a rational number
 * @param {Array} cf - Continued fraction coefficients
 * @returns {Array} - [numerator, denominator]
 */
function fromContinuedFraction(cf) {
  let num = 1;
  let den = 0;

  for (let i = cf.length - 1; i >= 0; i--) {
    const temp = num;
    num = cf[i] * num + den;
    den = temp;
  }

  return [num, den];
}

/**
 * Calculate the convergents of a continued fraction
 * @param {Array} cf - Continued fraction coefficients
 * @returns {Array} - Array of convergents as [num, den] pairs
 */
function continuedFractionConvergents(cf) {
  const convergents = [];
  let p = [1, 0];
  let q = [0, 1];

  for (let i = 0; i < cf.length; i++) {
    const nextP = cf[i] * p[0] + p[1];
    const nextQ = cf[i] * q[0] + q[1];

    p = [nextP, p[0]];
    q = [nextQ, q[0]];

    convergents.push([p[0], q[0]]);
  }

  return convergents;
}

/**
 * Primality test using Miller-Rabin probabilistic algorithm
 * @param {Number} n - Number to test
 * @param {Number} k - Number of iterations for accuracy (higher is more accurate)
 * @returns {Boolean} - True if probably prime, false if definitely composite
 */
function isProbablePrime(n, k = 5) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false;

  // Write n as 2^r * d + 1
  let r = 0;
  let d = n - 1;
  while (d % 2 === 0) {
    d /= 2;
    r++;
  }

  // Witness loop
  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

  // Use a limited number of witnesses for practicality
  const witnesses_to_use = witnesses.filter((w) => w < n).slice(0, k);

  // If we've exhausted our witnesses list, fall back to random witnesses
  if (witnesses_to_use.length < k) {
    while (witnesses_to_use.length < k) {
      const a = 2 + Math.floor(Math.random() * (n - 3));
      if (!witnesses_to_use.includes(a)) {
        witnesses_to_use.push(a);
      }
    }
  }

  // For each witness
  for (const a of witnesses_to_use) {
    // Skip if a is not in range [2, n-2]
    if (a < 2 || a > n - 2) continue;

    let x = modPow(a, d, n);
    if (x === 1 || x === n - 1) continue;

    let continueMainLoop = false;
    for (let i = 0; i < r - 1; i++) {
      x = modPow(x, 2, n);
      if (x === n - 1) {
        continueMainLoop = true;
        break;
      }
    }

    if (continueMainLoop) continue;
    return false; // Definitely composite
  }

  return true; // Probably prime
}

/**
 * Pollard's rho algorithm for integer factorization
 * @param {Number} n - Number to factorize
 * @returns {Number} - A non-trivial factor of n, or n if none found
 */
function pollardRho(n) {
  if (n === 1) return 1;
  if (n % 2 === 0) return 2;
  if (isPrime(n)) return n;

  // g(x) = (x^2 + c) % n, with c = 1
  const g = (x) => (x * x + 1) % n;

  let x = 2; let y = 2; let
    d = 1;
  while (d === 1) {
    x = g(x);
    y = g(g(y));
    d = gcd(Math.abs(x - y), n);
  }

  if (d === n) return n; // Failure, but n might be prime
  return d;
}

/**
 * Fast factorization using trial division and Pollard's rho
 * @param {Number} n - Number to factorize
 * @returns {Array} - Array of prime factors with repetition
 */
function fastFactorize(n) {
  if (n <= 1) return [n];

  const factors = [];
  // Trial division for small primes
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

  for (const p of smallPrimes) {
    while (n % p === 0) {
      factors.push(p);
      n /= p;
    }
  }

  if (n === 1) return factors;

  // If n is prime, we're done
  if (isProbablePrime(n)) {
    factors.push(n);
    return factors;
  }

  // Otherwise, use Pollard's rho to find a factor
  const stack = [n];
  while (stack.length > 0) {
    const num = stack.pop();
    if (isProbablePrime(num)) {
      factors.push(num);
      continue;
    }

    const factor = pollardRho(num);
    if (factor === num) {
      // If pollardRho fails, fall back to trial division
      factors.push(num);
    } else {
      stack.push(factor);
      stack.push(num / factor);
    }
  }

  return factors.sort((a, b) => a - b);
}

/**
 * Solve a linear Diophantine equation ax + by = c
 * @param {Number} a - Coefficient of x
 * @param {Number} b - Coefficient of y
 * @param {Number} c - Right-hand side constant
 * @returns {Object} - Object with solution information
 */
function solveDiophantine(a, b, c) {
  // Step 1: Find gcd(a, b) using extended Euclidean algorithm
  const [g, x0, y0] = extendedGcd(Math.abs(a), Math.abs(b));

  // Make sure coefficients have correct sign
  const x0_signed = a < 0 ? -x0 : x0;
  const y0_signed = b < 0 ? -y0 : y0;

  // Step 2: Check if c is divisible by gcd(a,b)
  if (c % g !== 0) {
    return { solvable: false, reason: `${c} is not divisible by gcd(${a},${b}) = ${g}` };
  }

  // Step 3: Compute the particular solution
  const factor = c / g;
  const x = x0_signed * factor;
  const y = y0_signed * factor;

  return {
    solvable: true,
    particular: { x, y },
    general: { x: `${x} + ${b / g}*t`, y: `${y} - ${a / g}*t` },
    parameterized: (t) => ({ x: x + (b / g) * t, y: y - (a / g) * t })
  };
}

/**
 * Check if a number is a perfect power (n = a^b for some integers a, b with b > 1)
 * @param {Number} n - Number to check
 * @returns {Object} - If it's a perfect power, returns {base: a, exponent: b}, otherwise null
 */
function isPerfectPower(n) {
  if (n < 2) return null;

  const logn = Math.log2(n);
  for (let b = 2; b <= logn; b++) {
    // Calculate a = n^(1/b)
    const a = Math.round(n ** (1 / b));
    if (a ** b === n) {
      return { base: a, exponent: b };
    }
  }

  return null;
}

/**
 * Calculate the Möbius function μ(n)
 * @param {Number} n - Input number
 * @returns {Number} - μ(n): 1 if n is square-free with even number of prime factors,
 *                           -1 if n is square-free with odd number of prime factors,
 *                           0 if n has a squared prime factor
 */
function mobiusFunction(n) {
  if (n <= 0) throw new Error('Input must be a positive integer');
  if (n === 1) return 1;

  let factors = 0;
  let squareFree = true;

  // Get prime factorization
  const primeFactors = factorize(n);

  // Count unique prime factors and check for squares
  let lastFactor = primeFactors[0];
  let count = 1;

  for (let i = 1; i < primeFactors.length; i++) {
    if (primeFactors[i] === lastFactor) {
      count++;
      if (count === 2) {
        squareFree = false;
        break;
      }
    } else {
      lastFactor = primeFactors[i];
      count = 1;
      factors++;
    }
  }

  if (!squareFree) return 0;
  if (factors % 2 === 0) return 1;
  return -1;
}

/**
 * Calculate the sum of the kth powers of divisors of n
 * @param {Number} n - Input number
 * @param {Number} k - Power
 * @returns {Number} - Sum of the kth powers of divisors
 */
function divisorSum(n, k = 1) {
  if (n <= 0) throw new Error('Input must be a positive integer');

  let sum = 0;
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      sum += i ** k;
      if (i !== n / i) {
        sum += (n / i) ** k;
      }
    }
  }

  return sum;
}

/**
 * Find all primitive Pythagorean triples with hypotenuse less than a given limit
 * @param {Number} limit - Maximum value for the hypotenuse
 * @returns {Array} - Array of Pythagorean triples [a, b, c] where a^2 + b^2 = c^2
 */
function primitivePythagoreanTriples(limit) {
  const triples = [];

  // Euclid's formula: For coprime m, n with m > n > 0 and one even, one odd:
  // a = m^2 - n^2, b = 2mn, c = m^2 + n^2 gives a primitive Pythagorean triple
  for (let m = 2; m * m <= limit; m++) {
    const start = m % 2 === 0 ? 1 : 2;
    for (let n = start; n < m; n += 2) {
      if (gcd(m, n) !== 1) continue;

      const a = m * m - n * n;
      const b = 2 * m * n;
      const c = m * m + n * n;

      if (c > limit) break;

      triples.push([Math.min(a, b), Math.max(a, b), c]);
    }
  }

  return triples.sort((a, b) => a[2] - b[2]);
}

// Export the number theory functions
module.exports = {
  generatePrimes,
  factorize,
  fastFactorize,
  gcd,
  lcm,
  isPrime,
  isProbablePrime,
  modPow,
  eulerTotient,
  extendedGcd,
  solveLinearCongruence,
  chineseRemainderTheorem,
  legendreSymbol,
  quadraticResidues,
  toContinuedFraction,
  fromContinuedFraction,
  continuedFractionConvergents,
  pollardRho,
  solveDiophantine,
  isPerfectPower,
  mobiusFunction,
  divisorSum,
  primitivePythagoreanTriples
};
