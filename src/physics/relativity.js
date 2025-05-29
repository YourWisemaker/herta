/**
 * Relativistic Astrophysics module for herta.js
 * Provides mathematical tools for calculations involving relativistic effects
 * in astronomical scenarios, including black holes, gravitational waves,
 * and spacetime curvature.
 */

import matrix from '../core/matrix.js';
import complex from '../core/complex.js';

const relativisticAstrophysics = {};

/**
 * Constants
 */
relativisticAstrophysics.constants = {
  G: 6.67430e-11, // Gravitational constant (m^3 kg^-1 s^-2)
  c: 299792458, // Speed of light (m/s)
  solarMass: 1.989e30, // Mass of the Sun (kg)
  schwarzschildRadius(mass) {
    return (2 * this.G * mass) / (this.c * this.c);
  }
};

/**
 * Calculate the Schwarzschild radius for a given mass
 * @param {number} mass - Mass in kilograms
 * @returns {number} - Schwarzschild radius in meters
 */
relativisticAstrophysics.schwarzschildRadius = function (mass) {
  return (2 * this.constants.G * mass) / (this.constants.c * this.constants.c);
};

/**
 * Calculate the gravitational time dilation
 * @param {number} mass - Mass causing the gravity (kg)
 * @param {number} distance - Distance from the center of mass (m)
 * @returns {number} - Time dilation factor
 */
relativisticAstrophysics.gravitationalTimeDilation = function (mass, distance) {
  const rs = this.schwarzschildRadius(mass);

  // Time dilation factor: sqrt(1 - rs/r)
  // As r approaches rs, time dilation approaches infinity
  if (distance <= rs) {
    throw new Error('Distance must be greater than the Schwarzschild radius');
  }

  return Math.sqrt(1 - rs / distance);
};

/**
 * Calculate the gravitational redshift of light
 * @param {number} mass - Mass causing the gravity (kg)
 * @param {number} emissionDistance - Distance from center where light is emitted (m)
 * @param {number} observerDistance - Distance from center where light is observed (m)
 * @returns {number} - Redshift factor z
 */
relativisticAstrophysics.gravitationalRedshift = function (mass, emissionDistance, observerDistance) {
  const rs = this.schwarzschildRadius(mass);

  if (emissionDistance <= rs) {
    throw new Error('Emission point must be outside the Schwarzschild radius');
  }

  const sqrtFactorEmission = Math.sqrt(1 - rs / emissionDistance);
  const sqrtFactorObserver = Math.sqrt(1 - rs / observerDistance);

  // Redshift factor z = (λ_observed - λ_emitted) / λ_emitted
  return (sqrtFactorObserver / sqrtFactorEmission) - 1;
};

/**
 * Calculate the orbital velocity in the weak field approximation
 * @param {number} mass - Central mass (kg)
 * @param {number} radius - Orbital radius (m)
 * @returns {number} - Orbital velocity (m/s)
 */
relativisticAstrophysics.orbitalVelocity = function (mass, radius) {
  return Math.sqrt(this.constants.G * mass / radius);
};

/**
 * Calculate relativistic orbital precession per orbit
 * @param {number} mass - Central mass (kg)
 * @param {number} semiMajorAxis - Semi-major axis of the orbit (m)
 * @param {number} eccentricity - Eccentricity of the orbit
 * @returns {number} - Precession angle per orbit (radians)
 */
relativisticAstrophysics.orbitalPrecession = function (mass, semiMajorAxis, eccentricity) {
  const rs = this.schwarzschildRadius(mass);
  // Einstein's formula for orbital precession
  return (6 * Math.PI * rs) / (semiMajorAxis * (1 - eccentricity * eccentricity));
};

/**
 * Calculate the properties of an ISCO (Innermost Stable Circular Orbit)
 * @param {number} mass - Black hole mass (kg)
 * @param {number} spin - Black hole spin parameter (0 to 1)
 * @returns {Object} - ISCO properties
 */
relativisticAstrophysics.innermost_stable_circular_orbit = function (mass, spin) {
  if (spin < 0 || spin > 1) {
    throw new Error('Spin parameter must be between 0 and 1');
  }

  // Calculate ISCO radius (in units of rs/2)
  const Z1 = 1 + (1 - spin * spin) ** (1 / 3) * ((1 + spin) ** (1 / 3) + (1 - spin) ** (1 / 3));
  const Z2 = Math.sqrt(3 * spin * spin + Z1 * Z1);

  // For prograde orbit
  const rPrograde = 3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));

  // For retrograde orbit
  const rRetrograde = 3 + Z2 + Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));

  // Convert to physical units
  const rs = this.schwarzschildRadius(mass);
  const rProg = rPrograde * rs / 2;
  const rRetro = rRetrograde * rs / 2;

  // Calculate orbital velocities
  const vProg = this.constants.c * Math.sqrt(1 / rPrograde);
  const vRetro = this.constants.c * Math.sqrt(1 / rRetrograde);

  return {
    prograde: {
      radius: rProg,
      velocity: vProg,
      angularMomentum: vProg * rProg
    },
    retrograde: {
      radius: rRetro,
      velocity: vRetro,
      angularMomentum: vRetro * rRetro
    }
  };
};

/**
 * Calculate gravitational wave frequency from a binary system
 * @param {number} mass1 - Mass of first object (kg)
 * @param {number} mass2 - Mass of second object (kg)
 * @param {number} separation - Separation distance (m)
 * @returns {number} - Gravitational wave frequency (Hz)
 */
relativisticAstrophysics.gravitationalWaveFrequency = function (mass1, mass2, separation) {
  const totalMass = mass1 + mass2;
  // Orbital frequency
  const orbitalFreq = (1 / (2 * Math.PI)) * Math.sqrt(
    this.constants.G * totalMass / separation ** 3
  );
  // Gravitational wave frequency is twice the orbital frequency
  return 2 * orbitalFreq;
};

/**
 * Calculate gravitational wave strain amplitude
 * @param {number} mass1 - Mass of first object (kg)
 * @param {number} mass2 - Mass of second object (kg)
 * @param {number} distance - Distance to observer (m)
 * @param {number} frequency - Gravitational wave frequency (Hz)
 * @returns {number} - Dimensionless strain amplitude
 */
relativisticAstrophysics.gravitationalWaveStrain = function (mass1, mass2, distance, frequency) {
  const chirpMass = (mass1 * mass2) ** (3 / 5) / (mass1 + mass2) ** (1 / 5);

  // Calculate strain amplitude
  const strain = (4 / distance)
                * (this.constants.G * chirpMass / this.constants.c ** 2) ** (5 / 3)
                * (Math.PI * frequency) ** (2 / 3);

  return strain;
};

/**
 * Calculate time to merger for a binary system
 * @param {number} mass1 - Mass of first object (kg)
 * @param {number} mass2 - Mass of second object (kg)
 * @param {number} separation - Current separation (m)
 * @returns {number} - Time to merger (seconds)
 */
relativisticAstrophysics.timeToMerger = function (mass1, mass2, separation) {
  const chirpMass = (mass1 * mass2) ** (3 / 5) / (mass1 + mass2) ** (1 / 5);

  // Time to merger from quadrupole formula
  return (5 / 256)
         * separation ** 4
         / ((this.constants.G * chirpMass / this.constants.c ** 2) ** (5 / 3));
};

/**
 * Calculate the Kerr metric component for a rotating black hole
 * @param {number} mass - Black hole mass (kg)
 * @param {number} spin - Black hole spin parameter (0 to 1)
 * @param {number} r - Radial coordinate (m)
 * @param {number} theta - Polar angle (radians)
 * @returns {Object} - Metric components
 */
relativisticAstrophysics.kerrMetric = function (mass, spin, r, theta) {
  const rs = this.schwarzschildRadius(mass);
  const a = spin * rs / 2; // Angular momentum parameter

  // Auxiliary functions
  const delta = r * r - rs * r + a * a;
  const rho2 = r * r + a * a * Math.cos(theta) ** 2;
  const sigma = (r * r + a * a) ** 2 - a * a * delta * Math.sin(theta) ** 2;

  // Metric components (in Boyer-Lindquist coordinates)
  const gtt = -(1 - rs * r / rho2);
  const gtphi = -rs * r * a * Math.sin(theta) ** 2 / rho2;
  const grr = rho2 / delta;
  const gthth = rho2;
  const gphiphi = (r * r + a * a + rs * r * a * a * Math.sin(theta) ** 2 / rho2)
                 * Math.sin(theta) ** 2;

  return {
    gtt,
    gtphi,
    grr,
    gthth,
    gphiphi
  };
};

/**
 * Calculate the effective potential for a particle around a black hole
 * @param {number} mass - Black hole mass (kg)
 * @param {number} spin - Black hole spin parameter (0 to 1)
 * @param {number} particleE - Particle energy per unit mass
 * @param {number} particleL - Particle angular momentum per unit mass
 * @param {number} r - Radial coordinate (m)
 * @returns {number} - Effective potential value
 */
relativisticAstrophysics.effectivePotential = function (mass, spin, particleE, particleL, r) {
  const rs = this.schwarzschildRadius(mass);
  const a = spin * rs / 2;

  // Auxiliary functions
  const delta = r * r - rs * r + a * a;

  // Effective potential for equatorial motion
  const V = -1 + (particleE * (r * r + a * a) - particleL * a) ** 2
           / (r * r * delta)
           - delta * (1 + (particleL - particleE * a) ** 2 / r / r) / r / r;

  return V;
};

/**
 * Calculate photon ring radius for a black hole
 * @param {number} mass - Black hole mass (kg)
 * @param {number} spin - Black hole spin parameter (0 to 1)
 * @returns {Object} - Photon ring radii (prograde and retrograde)
 */
relativisticAstrophysics.photonRing = function (mass, spin) {
  const rs = this.schwarzschildRadius(mass);

  // For Schwarzschild black hole (spin = 0)
  if (Math.abs(spin) < 1e-10) {
    return {
      prograde: 1.5 * rs,
      retrograde: 1.5 * rs
    };
  }

  // For Kerr black hole
  // Prograde photon orbit
  const rp = 2 * mass * (1 + Math.cos(2 / 3 * Math.acos(-spin)));

  // Retrograde photon orbit
  const rm = 2 * mass * (1 + Math.cos(2 / 3 * Math.acos(spin)));

  return {
    prograde: rp,
    retrograde: rm
  };
};

/**
 * Calculate the gravitational lensing deflection angle
 * @param {number} mass - Lensing mass (kg)
 * @param {number} impactParameter - Closest approach distance (m)
 * @returns {number} - Deflection angle (radians)
 */
relativisticAstrophysics.gravitationalLensing = function (mass, impactParameter) {
  const rs = this.schwarzschildRadius(mass);

  // Einstein's formula for light deflection
  return 4 * this.constants.G * mass / (this.constants.c * this.constants.c * impactParameter);
};

/**
 * Calculate Einstein ring radius
 * @param {number} mass - Lensing mass (kg)
 * @param {number} dLS - Distance from lens to source (m)
 * @param {number} dL - Distance from observer to lens (m)
 * @returns {number} - Einstein ring radius (m)
 */
relativisticAstrophysics.einsteinRingRadius = function (mass, dLS, dL) {
  const dS = dL + dLS; // Distance to source

  // Einstein ring radius formula
  return Math.sqrt(4 * this.constants.G * mass * dLS / (this.constants.c * this.constants.c * dS) * dL);
};

/**
 * Calculate Shapiro time delay
 * @param {number} mass - Mass causing the gravity (kg)
 * @param {number} impactParameter - Closest approach distance (m)
 * @returns {number} - Time delay (seconds)
 */
relativisticAstrophysics.shapiroDelay = function (mass, impactParameter) {
  const rs = this.schwarzschildRadius(mass);

  // Shapiro time delay formula
  return 2 * this.constants.G * mass / (this.constants.c * this.constants.c * this.constants.c)
         * Math.log(4 * impactParameter * impactParameter / rs / impactParameter);
};

/**
 * Calculate relativistic Doppler shift
 * @param {number} velocity - Radial velocity (m/s, positive for receding)
 * @param {number} restFrequency - Frequency in rest frame (Hz)
 * @returns {number} - Observed frequency (Hz)
 */
relativisticAstrophysics.relativisticDoppler = function (velocity, restFrequency) {
  const beta = velocity / this.constants.c;

  // Relativistic Doppler formula
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const observedFrequency = restFrequency * gamma * (1 - beta);

  return observedFrequency;
};

/**
 * Calculate apparent size of a black hole shadow
 * @param {number} mass - Black hole mass (kg)
 * @param {number} distance - Distance to observer (m)
 * @returns {number} - Angular diameter of shadow (radians)
 */
relativisticAstrophysics.blackHoleShadowSize = function (mass, distance) {
  const rs = this.schwarzschildRadius(mass);

  // Shadow radius is approximately 2.6 * M (where M = rs/2)
  const shadowRadius = 2.6 * rs / 2;

  // Angular size
  return 2 * shadowRadius / distance;
};

/**
 * Calculate emission from an accretion disk using thin disk model
 * @param {number} mass - Black hole mass (kg)
 * @param {number} accretionRate - Mass accretion rate (kg/s)
 * @param {number} radius - Disk radius (m)
 * @returns {number} - Surface brightness (W/m²)
 */
relativisticAstrophysics.accretionDiskEmission = function (mass, accretionRate, radius) {
  const rs = this.schwarzschildRadius(mass);
  const efficiency = 0.1; // Typical accretion efficiency

  // Check if radius is outside the ISCO
  if (radius < 3 * rs) {
    throw new Error('Radius must be outside the innermost stable circular orbit');
  }

  // Total luminosity
  const luminosity = efficiency * accretionRate * this.constants.c * this.constants.c;

  // Surface brightness using Shakura-Sunyaev model (simplified)
  const surfaceBrightness = (3 * luminosity / (8 * Math.PI * radius * radius))
                           * (1 - Math.sqrt(3 * rs / radius));

  return surfaceBrightness;
};

/**
 * Calculate Hawking radiation temperature for a black hole
 * @param {number} mass - Black hole mass (kg)
 * @returns {number} - Hawking temperature (K)
 */
relativisticAstrophysics.hawkingTemperature = function (mass) {
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const kb = 1.380649e-23; // Boltzmann constant (J/K)

  // Hawking temperature formula
  return (hbar * this.constants.c * this.constants.c * this.constants.c)
         / (8 * Math.PI * this.constants.G * mass * kb);
};

/**
 * Calculate black hole entropy
 * @param {number} mass - Black hole mass (kg)
 * @returns {number} - Entropy (J/K)
 */
relativisticAstrophysics.blackHoleEntropy = function (mass) {
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const kb = 1.380649e-23; // Boltzmann constant (J/K)

  // Area of the event horizon
  const area = 4 * Math.PI * this.schwarzschildRadius(mass) ** 2;

  // Bekenstein-Hawking entropy formula
  return (kb * area * this.constants.c * this.constants.c * this.constants.c)
         / (4 * this.constants.G * hbar);
};

/**
 * Calculate frame-dragging (Lense-Thirring) precession
 * @param {number} mass - Black hole mass (kg)
 * @param {number} spin - Black hole spin parameter (0 to 1)
 * @param {number} radius - Orbital radius (m)
 * @param {number} inclination - Orbital inclination (radians)
 * @returns {number} - Precession rate (radians/s)
 */
relativisticAstrophysics.frameDraggingPrecession = function (mass, spin, radius, inclination) {
  const rs = this.schwarzschildRadius(mass);
  const J = spin * mass * this.constants.c * rs / 2; // Angular momentum

  // Lense-Thirring precession formula
  return (2 * this.constants.G * J)
         / (this.constants.c * this.constants.c * radius ** 3)
         * Math.cos(inclination);
};

/**
 * Calculate gravitational wave luminosity from a binary system
 * @param {number} mass1 - Mass of first object (kg)
 * @param {number} mass2 - Mass of second object (kg)
 * @param {number} separation - Separation distance (m)
 * @returns {number} - Luminosity (W)
 */
relativisticAstrophysics.gravitationalWaveLuminosity = function (mass1, mass2, separation) {
  // Reduced mass
  const mu = (mass1 * mass2) / (mass1 + mass2);
  const totalMass = mass1 + mass2;

  // Orbital frequency
  const omega = Math.sqrt(this.constants.G * totalMass / separation ** 3);

  // Quadrupole formula for GW luminosity
  return (32 / 5) * this.constants.G ** (4 / 3)
         * mu ** 2 * totalMass ** (2 / 3)
         * omega ** (10 / 3)
         / this.constants.c ** 5;
};

/**
 * Calculate the geodetic precession rate
 * @param {number} centralMass - Central mass (kg)
 * @param {number} semiMajorAxis - Orbital semi-major axis (m)
 * @param {number} eccentricity - Orbital eccentricity
 * @returns {number} - Precession rate (radians/s)
 */
relativisticAstrophysics.geodeticPrecession = function (centralMass, semiMajorAxis, eccentricity) {
  // Orbital frequency
  const omega = Math.sqrt(this.constants.G * centralMass / semiMajorAxis ** 3);

  // Geodetic precession formula
  return (3 * this.constants.G * centralMass * omega)
         / (2 * this.constants.c * this.constants.c * semiMajorAxis)
         * (1 / Math.sqrt(1 - eccentricity * eccentricity));
};

export default relativisticAstrophysics;
