/**
 * Mathematical constants for herta.js
 */

const Decimal = require('decimal.js');

// Configure decimal precision
Decimal.set({ precision: 64 });

// Constants module
const constants = {};

// Mathematical constants with high precision

/**
 * The mathematical constant π (pi)
 * Represents the ratio of the circumference of a circle to its diameter
 */
constants.pi = new Decimal(Math.PI).toNumber();

/**
 * The mathematical constant e (Euler's number)
 * Base of the natural logarithm
 */
constants.e = new Decimal(Math.E).toNumber();

/**
 * The golden ratio (φ)
 * (1 + sqrt(5)) / 2
 */
constants.phi = new Decimal('1.61803398874989484820458683436563811772030917980576');

/**
 * The square root of 2
 */
constants.sqrt2 = new Decimal('1.41421356237309504880168872420969807856967187537694');

/**
 * The square root of 1/2
 */
constants.sqrt1_2 = new Decimal('0.70710678118654752440084436210484903928483593768847');

/**
 * Infinity
 */
constants.Infinity = Infinity;

/**
 * Not a Number
 */
constants.NaN = NaN;

/**
 * Natural logarithm of 2
 */
constants.LN2 = new Decimal(Math.LN2).toNumber();

/**
 * Natural logarithm of 10
 */
constants.LN10 = new Decimal(Math.LN10).toNumber();

/**
 * Base-2 logarithm of e
 */
constants.LOG2E = new Decimal(Math.LOG2E).toNumber();

/**
 * Base-10 logarithm of e
 */
constants.LOG10E = new Decimal(Math.LOG10E).toNumber();

/**
 * Euler-Mascheroni constant (γ)
 */
constants.gamma = new Decimal('0.57721566490153286060651209008240243104215933593992');

/**
 * Planck constant (h) in J⋅s
 */
constants.planck = new Decimal('6.62607015e-34');

/**
 * Speed of light in vacuum (c) in m/s
 */
constants.speedOfLight = new Decimal('299792458');

/**
 * Gravitational constant (G) in m³/(kg⋅s²)
 */
constants.gravitationalConstant = new Decimal('6.67430e-11');

/**
 * Elementary charge (e) in C
 */
constants.elementaryCharge = new Decimal('1.602176634e-19');

/**
 * Avogadro's number (N_A) in mol^-1
 */
constants.avogadro = new Decimal('6.02214076e23');

/**
 * Boltzmann constant (k_B) in J/K
 */
constants.boltzmann = new Decimal('1.380649e-23');

/**
 * Vacuum permittivity (ε_0) in F/m
 */
constants.vacuumPermittivity = new Decimal('8.8541878128e-12');

/**
 * Vacuum permeability (μ_0) in H/m
 */
constants.vacuumPermeability = new Decimal('1.25663706212e-6');

/**
 * Gravitational acceleration (g) on Earth in m/s²
 */
constants.gravitationalAcceleration = new Decimal('9.80665');

/**
 * Atomic mass unit (u) in kg
 */
constants.atomicMassUnit = new Decimal('1.66053906660e-27');

/**
 * Electron mass (m_e) in kg
 */
constants.electronMass = new Decimal('9.1093837015e-31');

/**
 * Proton mass (m_p) in kg
 */
constants.protonMass = new Decimal('1.67262192369e-27');

/**
 * Neutron mass (m_n) in kg
 */
constants.neutronMass = new Decimal('1.67492749804e-27');

/**
 * Bohr radius (a_0) in m
 */
constants.bohrRadius = new Decimal('5.29177210903e-11');

/**
 * Rydberg constant (R_∞) in m^-1
 */
constants.rydbergConstant = new Decimal('10973731.568160');

/**
 * Fine-structure constant (α)
 */
constants.fineStructureConstant = new Decimal('7.2973525693e-3');

module.exports = constants;
