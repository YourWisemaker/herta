/**
 * Differential equations module for herta.js
 * Provides methods for solving ordinary differential equations (ODEs)
 */

import utils from '../utils/utils.js'; // Added .js extension

// Differential equations module
const differential = {};

/**
 * Solve a first-order ODE using Euler's method
 * @param {Function} func - The function f(t, y) in the ODE dy/dt = f(t, y)
 * @param {number} y0 - Initial value y(t0)
 * @param {number} t0 - Initial time
 * @param {number} t1 - Final time
 * @param {number} [h=0.01] - Step size
 * @returns {Object} - Object containing arrays of t and y values
 */
differential.solveEuler = function (func, y0, t0, t1, h = 0.01) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }

  if (t0 >= t1) {
    throw new Error('Final time must be greater than initial time');
  }

  const tValues = [];
  const yValues = [];

  let t = t0;
  let y = y0;

  while (t <= t1) {
    tValues.push(t);
    yValues.push(y);

    // Euler's method: y_{n+1} = y_n + h * f(t_n, y_n)
    y += h * func(t, y);
    t += h;
  }

  return {
    t: tValues,
    y: yValues
  };
};

/**
 * Solve a first-order ODE using the 4th-order Runge-Kutta method (RK4)
 * @param {Function} func - The function f(t, y) in the ODE dy/dt = f(t, y)
 * @param {number} y0 - Initial value y(t0)
 * @param {number} t0 - Initial time
 * @param {number} t1 - Final time
 * @param {number} [h=0.01] - Step size
 * @returns {Object} - Object containing arrays of t and y values
 */
differential.solveRK4 = function (func, y0, t0, t1, h = 0.01) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }

  if (t0 >= t1) {
    throw new Error('Final time must be greater than initial time');
  }

  const tValues = [];
  const yValues = [];

  let t = t0;
  let y = y0;

  while (t <= t1) {
    tValues.push(t);
    yValues.push(y);

    // RK4 method
    const k1 = h * func(t, y);
    const k2 = h * func(t + h / 2, y + k1 / 2);
    const k3 = h * func(t + h / 2, y + k2 / 2);
    const k4 = h * func(t + h, y + k3);

    y += (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    t += h;
  }

  return {
    t: tValues,
    y: yValues
  };
};

/**
 * Solve a system of first-order ODEs using the 4th-order Runge-Kutta method
 * @param {Function} funcs - Array of functions representing the system
 * @param {Array<number>} y0 - Array of initial values
 * @param {number} t0 - Initial time
 * @param {number} t1 - Final time
 * @param {number} [h=0.01] - Step size
 * @returns {Object} - Object containing arrays of t and y values
 */
differential.solveSystemRK4 = function (funcs, y0, t0, t1, h = 0.01) {
  if (!Array.isArray(funcs) || !funcs.every((f) => typeof f === 'function')) {
    throw new Error('First argument must be an array of functions');
  }

  if (!Array.isArray(y0) || y0.length !== funcs.length) {
    throw new Error('Initial values array must match the number of equations');
  }

  if (t0 >= t1) {
    throw new Error('Final time must be greater than initial time');
  }

  const tValues = [];
  const yValues = Array(funcs.length).fill().map(() => []);

  let t = t0;
  let y = [...y0];

  while (t <= t1) {
    tValues.push(t);
    y.forEach((val, i) => yValues[i].push(val));

    // RK4 for system of equations
    const k1 = funcs.map((f) => h * f(t, y));
    const k2 = funcs.map((f, i) => {
      const yTemp = y.map((yVal, j) => yVal + k1[j] / 2);
      return h * f(t + h / 2, yTemp);
    });
    const k3 = funcs.map((f, i) => {
      const yTemp = y.map((yVal, j) => yVal + k2[j] / 2);
      return h * f(t + h / 2, yTemp);
    });
    const k4 = funcs.map((f, i) => {
      const yTemp = y.map((yVal, j) => yVal + k3[j]);
      return h * f(t + h, yTemp);
    });

    y = y.map((yVal, i) => yVal + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6);
    t += h;
  }

  return {
    t: tValues,
    y: yValues
  };
};

/**
 * Solve a second-order ODE by converting to a system of first-order ODEs
 * @param {Function} func - The function f(t, y, y') in the ODE y'' = f(t, y, y')
 * @param {number} y0 - Initial value y(t0)
 * @param {number} yPrime0 - Initial derivative y'(t0)
 * @param {number} t0 - Initial time
 * @param {number} t1 - Final time
 * @param {number} [h=0.01] - Step size
 * @returns {Object} - Object containing arrays of t, y, and y' values
 */
differential.solveSecondOrder = function (func, y0, yPrime0, t0, t1, h = 0.01) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }

  // Convert to system of first-order ODEs
  // Let y[0] = y and y[1] = y'
  // Then y'[0] = y[1] and y'[1] = f(t, y[0], y[1])
  const systemFunc = [
    (t, y) => y[1],
    (t, y) => func(t, y[0], y[1])
  ];

  const result = differential.solveSystemRK4(systemFunc, [y0, yPrime0], t0, t1, h);

  return {
    t: result.t,
    y: result.y[0],
    yPrime: result.y[1]
  };
};

/**
 * Solve a boundary value problem using the shooting method
 * @param {Function} func - The function f(t, y, y') in the ODE y'' = f(t, y, y')
 * @param {number} a - Left boundary point
 * @param {number} b - Right boundary point
 * @param {number} ya - Value of y at a
 * @param {number} yb - Value of y at b
 * @param {number} [tol=1e-6] - Tolerance for convergence
 * @param {number} [maxIter=100] - Maximum number of iterations
 * @returns {Object} - Object containing arrays of t and y values
 */
differential.solveBVP = function (func, a, b, ya, yb, tol = 1e-6, maxIter = 100) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }

  if (a >= b) {
    throw new Error('Right boundary must be greater than left boundary');
  }

  // Shooting method implementation
  // Try different initial slopes until the boundary condition at b is satisfied
  let slope1 = 0; // First guess for y'(a)
  let slope2 = 1; // Second guess for y'(a)

  // Solve with first guess
  const solution1 = differential.solveSecondOrder(func, ya, slope1, a, b);
  let error1 = solution1.y[solution1.y.length - 1] - yb;

  if (Math.abs(error1) < tol) {
    return {
      t: solution1.t,
      y: solution1.y
    };
  }

  // Solve with second guess
  let solution2 = differential.solveSecondOrder(func, ya, slope2, a, b);
  let error2 = solution2.y[solution2.y.length - 1] - yb;

  let iter = 0;
  while (Math.abs(error2) > tol && iter < maxIter) {
    // Linear interpolation to find better slope
    const slope = slope2 - error2 * (slope2 - slope1) / (error2 - error1);

    // Update previous guesses
    slope1 = slope2;
    error1 = error2;
    slope2 = slope;

    // Solve with new slope
    solution2 = differential.solveSecondOrder(func, ya, slope2, a, b);
    error2 = solution2.y[solution2.y.length - 1] - yb;

    iter++;
  }

  if (iter >= maxIter) {
    throw new Error(`Shooting method did not converge after ${maxIter} iterations`);
  }

  return {
    t: solution2.t,
    y: solution2.y
  };
};

export default differential;
