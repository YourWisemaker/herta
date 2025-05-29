/**
 * Newtonian Physics module for herta.js
 * Provides classical mechanics, dynamics and collision simulations
 */

import matrix from '../core/matrix.js';
import arithmetic from '../core/arithmetic.js';

const newtonianPhysics = {};

/**
 * Calculate motion with constant acceleration
 * @param {Object} params - Parameters with initial conditions
 * @param {number} time - Time at which to calculate position/velocity
 * @returns {Object} - Position and velocity at the specified time
 */
newtonianPhysics.constantAcceleration = function (params, time) {
  const { initialPosition, initialVelocity, acceleration } = params;

  // s = s0 + v0*t + 0.5*a*t^2
  const position = initialPosition + initialVelocity * time + 0.5 * acceleration * time * time;

  // v = v0 + a*t
  const velocity = initialVelocity + acceleration * time;

  return { position, velocity };
};

/**
 * Calculate projectile motion in 2D (ignoring air resistance)
 * @param {Object} params - Initial conditions
 * @param {number} time - Time at which to calculate position
 * @returns {Object} - Position at the specified time
 */
newtonianPhysics.projectileMotion = function (params, time) {
  const {
    initialHeight, initialVelocity, angle, gravity = 9.81
  } = params;

  const v0x = initialVelocity * Math.cos(angle);
  const v0y = initialVelocity * Math.sin(angle);

  // x = x0 + v0x*t
  const x = v0x * time;

  // y = y0 + v0y*t - 0.5*g*t^2
  const y = initialHeight + v0y * time - 0.5 * gravity * time * time;

  // vx = v0x
  const vx = v0x;

  // vy = v0y - g*t
  const vy = v0y - gravity * time;

  return {
    x, y, vx, vy
  };
};

/**
 * Calculate time of flight for projectile motion
 * @param {Object} params - Initial conditions
 * @returns {number} - Time of flight
 */
newtonianPhysics.timeOfFlight = function (params) {
  const {
    initialHeight, initialVelocity, angle, gravity = 9.81
  } = params;

  const v0y = initialVelocity * Math.sin(angle);

  // Quadratic formula: t = (-v0y ± sqrt(v0y^2 + 2*g*h0)) / -g
  // We want the positive root
  return (v0y + Math.sqrt(v0y * v0y + 2 * gravity * initialHeight)) / gravity;
};

/**
 * Calculate range of projectile motion
 * @param {Object} params - Initial conditions
 * @returns {number} - Horizontal range
 */
newtonianPhysics.projectileRange = function (params) {
  const {
    initialHeight, initialVelocity, angle, gravity = 9.81
  } = params;

  const time = this.timeOfFlight(params);
  const v0x = initialVelocity * Math.cos(angle);

  return v0x * time;
};

/**
 * Calculate orbital parameters for circular orbit
 * @param {number} mass1 - Mass of central body (kg)
 * @param {number} mass2 - Mass of orbiting body (kg)
 * @param {number} radius - Orbital radius (m)
 * @returns {Object} - Orbital parameters
 */
newtonianPhysics.circularOrbit = function (mass1, mass2, radius) {
  const G = 6.67430e-11; // Gravitational constant (m^3 kg^-1 s^-2)

  // Orbital velocity: v = sqrt(G * M / r)
  const velocity = Math.sqrt(G * mass1 / radius);

  // Orbital period: T = 2π * r / v
  const period = 2 * Math.PI * radius / velocity;

  // Gravitational force: F = G * m1 * m2 / r^2
  const force = G * mass1 * mass2 / (radius * radius);

  // Specific angular momentum: h = r * v
  const angularMomentum = radius * velocity;

  return {
    velocity, period, force, angularMomentum
  };
};

/**
 * Calculate parameters for elliptical orbit
 * @param {number} mass - Mass of central body (kg)
 * @param {number} semiMajorAxis - Semi-major axis (m)
 * @param {number} eccentricity - Orbital eccentricity
 * @returns {Object} - Orbital parameters
 */
newtonianPhysics.ellipticalOrbit = function (mass, semiMajorAxis, eccentricity) {
  const G = 6.67430e-11; // Gravitational constant

  // Orbital period (Kepler's third law): T^2 = (4π^2 / GM) * a^3
  const period = 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / (G * mass));

  // Semi-minor axis: b = a * sqrt(1 - e^2)
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

  // Periapsis distance: r_p = a * (1 - e)
  const periapsis = semiMajorAxis * (1 - eccentricity);

  // Apoapsis distance: r_a = a * (1 + e)
  const apoapsis = semiMajorAxis * (1 + eccentricity);

  // Velocity at periapsis: v_p = sqrt(GM * (2/r_p - 1/a))
  const velocityAtPeriapsis = Math.sqrt(G * mass * (2 / periapsis - 1 / semiMajorAxis));

  // Velocity at apoapsis: v_a = sqrt(GM * (2/r_a - 1/a))
  const velocityAtApoapsis = Math.sqrt(G * mass * (2 / apoapsis - 1 / semiMajorAxis));

  return {
    period,
    semiMinorAxis,
    periapsis,
    apoapsis,
    velocityAtPeriapsis,
    velocityAtApoapsis
  };
};

/**
 * Simulate motion of an object under gravitational force
 * @param {Object} initialState - Initial position and velocity
 * @param {number} mass - Mass of object
 * @param {Function} forceField - Function that returns force vector at position
 * @param {Object} options - Simulation options
 * @returns {Array} - Array of states {t, position, velocity}
 */
newtonianPhysics.simulateMotion = function (initialState, mass, forceField, options = {}) {
  const timeStep = options.timeStep || 0.01;
  const duration = options.duration || 10;
  const method = options.method || 'rk4'; // 'euler', 'verlet', or 'rk4'

  const steps = Math.ceil(duration / timeStep);
  const states = [{ t: 0, position: [...initialState.position], velocity: [...initialState.velocity] }];

  for (let i = 1; i <= steps; i++) {
    const t = i * timeStep;
    const prevState = states[i - 1];

    let newPosition; let
      newVelocity;

    if (method === 'euler') {
      // Euler method (first-order)
      const force = forceField(prevState.position, prevState.velocity, prevState.t);
      const acceleration = force.map((f) => f / mass);

      newPosition = prevState.position.map((p, j) => p + prevState.velocity[j] * timeStep);
      newVelocity = prevState.velocity.map((v, j) => v + acceleration[j] * timeStep);
    } else if (method === 'verlet') {
      // Velocity Verlet method (second-order)
      const force = forceField(prevState.position, prevState.velocity, prevState.t);
      const acceleration = force.map((f) => f / mass);

      newPosition = prevState.position.map((p, j) => p + prevState.velocity[j] * timeStep + 0.5 * acceleration[j] * timeStep * timeStep);

      const newForce = forceField(newPosition, prevState.velocity, t);
      const newAcceleration = newForce.map((f) => f / mass);

      newVelocity = prevState.velocity.map((v, j) => v + 0.5 * (acceleration[j] + newAcceleration[j]) * timeStep);
    } else if (method === 'rk4') {
      // 4th-order Runge-Kutta method
      const k1v = forceField(prevState.position, prevState.velocity, prevState.t).map((f) => f / mass);
      const k1p = prevState.velocity;

      const midPosition1 = prevState.position.map((p, j) => p + k1p[j] * timeStep / 2);
      const midVelocity1 = prevState.velocity.map((v, j) => v + k1v[j] * timeStep / 2);

      const k2v = forceField(midPosition1, midVelocity1, prevState.t + timeStep / 2).map((f) => f / mass);
      const k2p = midVelocity1;

      const midPosition2 = prevState.position.map((p, j) => p + k2p[j] * timeStep / 2);
      const midVelocity2 = prevState.velocity.map((v, j) => v + k2v[j] * timeStep / 2);

      const k3v = forceField(midPosition2, midVelocity2, prevState.t + timeStep / 2).map((f) => f / mass);
      const k3p = midVelocity2;

      const endPosition = prevState.position.map((p, j) => p + k3p[j] * timeStep);
      const endVelocity = prevState.velocity.map((v, j) => v + k3v[j] * timeStep);

      const k4v = forceField(endPosition, endVelocity, prevState.t + timeStep).map((f) => f / mass);
      const k4p = endVelocity;

      newPosition = prevState.position.map((p, j) => p + (k1p[j] + 2 * k2p[j] + 2 * k3p[j] + k4p[j]) * timeStep / 6);

      newVelocity = prevState.velocity.map((v, j) => v + (k1v[j] + 2 * k2v[j] + 2 * k3v[j] + k4v[j]) * timeStep / 6);
    }

    states.push({ t, position: newPosition, velocity: newVelocity });
  }

  return states;
};

/**
 * Calculate elastic collision between two objects
 * @param {Object} object1 - First object {mass, velocity}
 * @param {Object} object2 - Second object {mass, velocity}
 * @param {number} restitution - Coefficient of restitution (1 for elastic, 0 for inelastic)
 * @returns {Object} - New velocities after collision
 */
newtonianPhysics.elasticCollision1D = function (object1, object2, restitution = 1) {
  const { mass: m1, velocity: v1 } = object1;
  const { mass: m2, velocity: v2 } = object2;

  // Conservation of momentum and energy
  const newV1 = ((m1 - restitution * m2) * v1 + (1 + restitution) * m2 * v2) / (m1 + m2);
  const newV2 = ((1 + restitution) * m1 * v1 + (m2 - restitution * m1) * v2) / (m1 + m2);

  return {
    velocity1: newV1,
    velocity2: newV2
  };
};

/**
 * Calculate 2D elastic collision between two objects
 * @param {Object} object1 - First object {mass, position, velocity}
 * @param {Object} object2 - Second object {mass, position, velocity}
 * @param {number} restitution - Coefficient of restitution
 * @returns {Object} - New velocities after collision
 */
newtonianPhysics.elasticCollision2D = function (object1, object2, restitution = 1) {
  const { mass: m1, position: p1, velocity: v1 } = object1;
  const { mass: m2, position: p2, velocity: v2 } = object2;

  // Vector from center of object1 to center of object2
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];

  // Distance between centers
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  const nx = dx / distance;
  const ny = dy / distance;

  // Relative velocity
  const dvx = v2[0] - v1[0];
  const dvy = v2[1] - v1[1];

  // Relative velocity along the normal direction
  const vn = dvx * nx + dvy * ny;

  // If objects are moving away from each other, no collision
  if (vn > 0) {
    return {
      velocity1: [...v1],
      velocity2: [...v2]
    };
  }

  // Impulse scalar
  const impulse = -(1 + restitution) * vn / (1 / m1 + 1 / m2);

  // Apply impulse in the normal direction
  const impulseX = impulse * nx;
  const impulseY = impulse * ny;

  const newV1 = [
    v1[0] - impulseX / m1,
    v1[1] - impulseY / m1
  ];

  const newV2 = [
    v2[0] + impulseX / m2,
    v2[1] + impulseY / m2
  ];

  return {
    velocity1: newV1,
    velocity2: newV2
  };
};

/**
 * Calculate moment of inertia for common shapes
 * @param {string} shape - Shape type ('point', 'rod', 'disk', etc.)
 * @param {Object} params - Shape parameters
 * @returns {number} - Moment of inertia
 */
newtonianPhysics.momentOfInertia = function (shape, params) {
  switch (shape.toLowerCase()) {
    case 'point':
      // I = m*r^2
      return params.mass * params.distance * params.distance;

    case 'rod':
      if (params.axis === 'end') {
        // I = (1/3)*m*L^2
        return params.mass * params.length * params.length / 3;
      } if (params.axis === 'center') {
        // I = (1/12)*m*L^2
        return params.mass * params.length * params.length / 12;
      }
      break;

    case 'disk':
      if (params.axis === 'center') {
        // I = (1/2)*m*r^2
        return params.mass * params.radius * params.radius / 2;
      } if (params.axis === 'edge') {
        // I = (3/2)*m*r^2
        return 3 * params.mass * params.radius * params.radius / 2;
      }
      break;

    case 'sphere':
      if (params.axis === 'center') {
        // I = (2/5)*m*r^2
        return 2 * params.mass * params.radius * params.radius / 5;
      }
      break;

    case 'cylinder':
      if (params.axis === 'center') {
        // I = (1/2)*m*r^2
        return params.mass * params.radius * params.radius / 2;
      } if (params.axis === 'end') {
        // I = (1/4)*m*r^2 + (1/12)*m*h^2
        return params.mass * (
          params.radius * params.radius / 4
          + params.height * params.height / 12
        );
      }
      break;
  }

  throw new Error('Invalid shape or axis parameter');
};

/**
 * Calculate rotational dynamics
 * @param {Object} params - Parameters {inertia, torque, initialAngularVelocity, initialAngle}
 * @param {number} time - Time at which to calculate rotation
 * @returns {Object} - Angular position and velocity
 */
newtonianPhysics.rotationalMotion = function (params, time) {
  const {
    inertia, torque, initialAngularVelocity, initialAngle
  } = params;

  // α = τ / I
  const angularAcceleration = torque / inertia;

  // ω = ω0 + α*t
  const angularVelocity = initialAngularVelocity + angularAcceleration * time;

  // θ = θ0 + ω0*t + (1/2)*α*t^2
  const angle = initialAngle + initialAngularVelocity * time
                + 0.5 * angularAcceleration * time * time;

  return { angle, angularVelocity };
};

/**
 * Calculate work done by a force
 * @param {Array} force - Force vector
 * @param {Array} displacement - Displacement vector
 * @returns {number} - Work done
 */
newtonianPhysics.work = function (force, displacement) {
  return force.reduce((sum, f, i) => sum + f * displacement[i], 0);
};

/**
 * Calculate power
 * @param {Array} force - Force vector
 * @param {Array} velocity - Velocity vector
 * @returns {number} - Power
 */
newtonianPhysics.power = function (force, velocity) {
  return force.reduce((sum, f, i) => sum + f * velocity[i], 0);
};

/**
 * Calculate kinetic energy
 * @param {number} mass - Mass of object
 * @param {Array} velocity - Velocity vector
 * @returns {number} - Kinetic energy
 */
newtonianPhysics.kineticEnergy = function (mass, velocity) {
  const speedSquared = velocity.reduce((sum, v) => sum + v * v, 0);
  return 0.5 * mass * speedSquared;
};

/**
 * Calculate gravitational potential energy
 * @param {number} mass - Mass of object
 * @param {number} height - Height above reference level
 * @param {number} gravity - Gravitational acceleration
 * @returns {number} - Potential energy
 */
newtonianPhysics.gravitationalPotentialEnergy = function (mass, height, gravity = 9.81) {
  return mass * gravity * height;
};

export default newtonianPhysics;
