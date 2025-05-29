/**
 * Advanced numerical methods module for herta.js
 * Provides numerical algorithms for scientific computing
 */

import Decimal from 'decimal.js';

// Numerical methods module
const numerical = {};

/**
 * Root-finding methods
 */
numerical.roots = {};

/**
 * Find a root of a function using Newton's method
 * @param {Function|string} f - The function to find roots for
 * @param {Function|string} [df] - The derivative of f (optional, will use numerical differentiation if not provided)
 * @param {number} x0 - Initial guess
 * @param {Object} [options] - Additional options
 * @returns {number} - The root of the function
 */
numerical.roots.newton = function (f, df, x0, options = {}) {
  // Default options
  const defaultOptions = {
    maxIterations: 100,
    tolerance: 1e-10,
    epsilon: 1e-8 // For numerical differentiation
  };

  const config = { ...defaultOptions, ...options };

  // Handle case where derivative is not provided
  if (typeof df !== 'function' && typeof df !== 'string') {
    options = x0 || {};
    x0 = df;
    // Use numerical differentiation
    df = (x) => {
      const h = config.epsilon;
      const fx = typeof f === 'function' ? f(x) : evaluateExpression(f, { x });
      const fxh = typeof f === 'function' ? f(x + h) : evaluateExpression(f, { x: x + h });
      return (fxh - fx) / h;
    };
  }

  // Convert to functions if strings
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });
  const dfFunc = typeof df === 'function' ? df : (x) => evaluateExpression(df, { x });

  // Newton's method iteration
  let x = x0;
  for (let i = 0; i < config.maxIterations; i++) {
    const fx = fFunc(x);
    const dfx = dfFunc(x);

    // Check for division by zero
    if (Math.abs(dfx) < config.tolerance) {
      throw new Error('Derivative too close to zero');
    }

    // Newton step
    const xNew = x - fx / dfx;

    // Check for convergence
    if (Math.abs(xNew - x) < config.tolerance) {
      return xNew;
    }

    x = xNew;
  }

  throw new Error(`Newton's method did not converge after ${config.maxIterations} iterations`);
};

/**
 * Find a root of a function using the bisection method
 * @param {Function|string} f - The function to find roots for
 * @param {number} a - Lower bound of the interval
 * @param {number} b - Upper bound of the interval
 * @param {Object} [options] - Additional options
 * @returns {number} - The root of the function
 */
numerical.roots.bisection = function (f, a, b, options = {}) {
  // Default options
  const defaultOptions = {
    maxIterations: 100,
    tolerance: 1e-10
  };

  const config = { ...defaultOptions, ...options };

  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  // Check if the function changes sign in the interval
  const fa = fFunc(a);
  const fb = fFunc(b);

  if (fa * fb > 0) {
    throw new Error('Function must have opposite signs at interval endpoints');
  }

  // Bisection method iteration
  let left = a;
  let right = b;

  for (let i = 0; i < config.maxIterations; i++) {
    const mid = (left + right) / 2;
    const fMid = fFunc(mid);

    // Check for convergence
    if (Math.abs(right - left) < config.tolerance || Math.abs(fMid) < config.tolerance) {
      return mid;
    }

    // Update interval
    if (fa * fMid < 0) {
      right = mid;
    } else {
      left = mid;
    }
  }

  throw new Error(`Bisection method did not converge after ${config.maxIterations} iterations`);
};

/**
 * Differential equation solvers
 */
numerical.ode = {};

/**
 * Solve an ordinary differential equation using the Runge-Kutta 4th order method
 * @param {Function|string} f - The ODE function dy/dx = f(x, y)
 * @param {number} x0 - Initial x value
 * @param {number} y0 - Initial y value
 * @param {number} xEnd - End x value
 * @param {number} steps - Number of steps
 * @param {Object} [options] - Additional options
 * @returns {Array} - Array of [x, y] pairs representing the solution
 */
numerical.ode.rk4 = function (f, x0, y0, xEnd, steps, options = {}) {
  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x, y) => evaluateExpression(f, { x, y });

  const h = (xEnd - x0) / steps;
  const result = [[x0, y0]];

  let x = x0;
  let y = y0;

  for (let i = 0; i < steps; i++) {
    // RK4 steps
    const k1 = fFunc(x, y);
    const k2 = fFunc(x + h / 2, y + k1 * h / 2);
    const k3 = fFunc(x + h / 2, y + k2 * h / 2);
    const k4 = fFunc(x + h, y + k3 * h);

    // Update y using weighted average
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;

    result.push([x, y]);
  }

  return result;
};

/**
 * Optimization methods
 */
numerical.optimize = {};

/**
 * Find the minimum of a function using gradient descent
 * @param {Function|string} f - The function to minimize
 * @param {Array} initialGuess - Initial guess for the minimum
 * @param {Object} [options] - Additional options
 * @returns {Array} - The point that minimizes the function
 */
numerical.optimize.gradientDescent = function (f, initialGuess, options = {}) {
  // Default options
  const defaultOptions = {
    learningRate: 0.01,
    maxIterations: 1000,
    tolerance: 1e-6,
    epsilon: 1e-8 // For numerical gradient
  };

  const config = { ...defaultOptions, ...options };

  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  // Numerical gradient function
  function gradient(point) {
    const grad = [];
    const h = config.epsilon;

    for (let i = 0; i < point.length; i++) {
      const pointPlusH = [...point];
      pointPlusH[i] += h;

      grad.push((fFunc(pointPlusH) - fFunc(point)) / h);
    }

    return grad;
  }

  // Gradient descent iteration
  const point = [...initialGuess];

  for (let i = 0; i < config.maxIterations; i++) {
    const grad = gradient(point);

    // Check for convergence
    const gradNorm = Math.sqrt(grad.reduce((sum, val) => sum + val * val, 0));
    if (gradNorm < config.tolerance) {
      return point;
    }

    // Update point
    for (let j = 0; j < point.length; j++) {
      point[j] -= config.learningRate * grad[j];
    }
  }

  return point;
};

/**
 * Interpolation methods
 */
numerical.interpolate = {};

/**
 * Perform polynomial interpolation using Lagrange polynomials
 * @param {Array} points - Array of [x, y] points to interpolate
 * @param {number} x - The x value to interpolate at
 * @returns {number} - The interpolated y value
 */
numerical.interpolate.lagrange = function (points, x) {
  let result = 0;

  for (let i = 0; i < points.length; i++) {
    let term = points[i][1];

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        term *= (x - points[j][0]) / (points[i][0] - points[j][0]);
      }
    }

    result += term;
  }

  return result;
};

/**
 * Placeholder for expression evaluation
 * @private
 * @param {string} expr - The expression to evaluate
 * @param {Object} scope - Variable values
 * @returns {number} - The evaluated result
 */
function evaluateExpression(expr, scope) {
  // This would be implemented with a proper expression parser
  // For now, return a placeholder implementation
  try {
    // Create a function from the expression
    const vars = Object.keys(scope).join(',');
    const values = Object.values(scope);
    return Function(vars, `return ${expr.replace(/\^/g, '**')}`).apply(null, values);
  } catch (error) {
    throw new Error(`Error evaluating expression: ${error.message}`);
  }
}

/**
 * Numerical integration methods
 */
numerical.integrate = {};

/**
 * Perform numerical integration using the trapezoidal rule
 * @param {Function|string} f - The function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Number of intervals
 * @returns {number} - The approximated integral
 */
numerical.integrate.trapezoidal = function (f, a, b, n) {
  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  const h = (b - a) / n;
  let sum = 0.5 * (fFunc(a) + fFunc(b));

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += fFunc(x);
  }

  return h * sum;
};

/**
 * Perform numerical integration using Simpson's rule
 * @param {Function|string} f - The function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Number of intervals (must be even)
 * @returns {number} - The approximated integral
 */
numerical.integrate.simpson = function (f, a, b, n) {
  if (n % 2 !== 0) {
    throw new Error('Number of intervals must be even for Simpson\'s rule');
  }

  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  const h = (b - a) / n;
  let sum = fFunc(a) + fFunc(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const coef = i % 2 === 0 ? 2 : 4;
    sum += coef * fFunc(x);
  }

  return (h / 3) * sum;
};

/**
 * Perform numerical integration using Gaussian quadrature
 * @param {Function|string} f - The function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Number of quadrature points
 * @returns {number} - The approximated integral
 */
numerical.integrate.gauss = function (f, a, b, n = 5) {
  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  // Gauss-Legendre weights and points for different orders
  const weights = {
    2: [1.0, 1.0],
    3: [0.5555555555555556, 0.8888888888888888, 0.5555555555555556],
    4: [0.3478548451374538, 0.6521451548625462, 0.6521451548625462, 0.3478548451374538],
    5: [0.2369268850561891, 0.4786286704993665, 0.5688888888888889, 0.4786286704993665, 0.2369268850561891]
  };

  const points = {
    2: [-0.5773502691896257, 0.5773502691896257],
    3: [-0.7745966692414834, 0.0, 0.7745966692414834],
    4: [-0.8611363115940526, -0.3399810435848563, 0.3399810435848563, 0.8611363115940526],
    5: [-0.9061798459386640, -0.5384693101056831, 0.0, 0.5384693101056831, 0.9061798459386640]
  };

  if (!weights[n] || !points[n]) {
    throw new Error(`Gaussian quadrature with ${n} points is not implemented`);
  }

  // Scale from [-1, 1] to [a, b]
  const c1 = (b - a) / 2;
  const c2 = (b + a) / 2;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = c1 * points[n][i] + c2;
    sum += weights[n][i] * fFunc(x);
  }

  return c1 * sum;
};

/**
 * Perform numerical integration using adaptive Simpson's rule
 * @param {Function|string} f - The function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} tolerance - Error tolerance
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {number} - The approximated integral
 */
numerical.integrate.adaptiveSimpson = function (f, a, b, tolerance = 1e-10, maxDepth = 20) {
  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  function adaptiveSimpsonRecursive(a, b, fa, fm, fb, tolerance, depth) {
    const m = (a + b) / 2;
    const h = (b - a) / 6;
    const fml = fFunc((a + m) / 2);
    const fmr = fFunc((m + b) / 2);

    // Simpson's rule on whole interval and subintervals
    const whole = h * (fa + 4 * fm + fb);
    const left = h / 2 * (fa + 4 * fml + fm);
    const right = h / 2 * (fm + 4 * fmr + fb);

    const difference = Math.abs(left + right - whole);

    if (difference <= 15 * tolerance || depth >= maxDepth) {
      return left + right + difference / 15; // Add correction term
    }
    return adaptiveSimpsonRecursive(a, m, fa, fml, fm, tolerance / 2, depth + 1)
             + adaptiveSimpsonRecursive(m, b, fm, fmr, fb, tolerance / 2, depth + 1);
  }

  const fa = fFunc(a);
  const fm = fFunc((a + b) / 2);
  const fb = fFunc(b);

  return adaptiveSimpsonRecursive(a, b, fa, fm, fb, tolerance, 0);
};

/**
 * Perform Monte Carlo integration
 * @param {Function|string} f - The function to integrate
 * @param {Array} lowerBounds - Lower bounds for each dimension
 * @param {Array} upperBounds - Upper bounds for each dimension
 * @param {number} samples - Number of random samples
 * @returns {Object} - The approximated integral and error estimate
 */
numerical.integrate.monteCarlo = function (f, lowerBounds, upperBounds, samples = 10000) {
  // Convert to function if string
  const fFunc = typeof f === 'function' ? f : (x) => evaluateExpression(f, { x });

  if (lowerBounds.length !== upperBounds.length) {
    throw new Error('Dimension mismatch between lower and upper bounds');
  }

  const dim = lowerBounds.length;
  const volume = upperBounds.reduce((vol, upper, i) => vol * (upper - lowerBounds[i]), 1);

  // Generate random samples and evaluate function
  let sum = 0;
  let sumSquared = 0;

  for (let i = 0; i < samples; i++) {
    // Generate random point within bounds
    const point = Array(dim).fill(0).map((_, j) => lowerBounds[j] + Math.random() * (upperBounds[j] - lowerBounds[j]));

    const value = fFunc(...point);
    sum += value;
    sumSquared += value * value;
  }

  const mean = sum / samples;
  const variance = sumSquared / samples - mean * mean;

  const integral = volume * mean;
  const error = volume * Math.sqrt(variance / samples);

  return { integral, error };
};

/**
 * PDE solvers for partial differential equations
 */
numerical.pde = {};

/**
 * Solve the 2D heat equation using the explicit finite difference method
 * u_t = k * (u_xx + u_yy)
 * @param {Function} initialCondition - Initial temperature distribution u(x,y,0)
 * @param {Function} boundaryCondition - Boundary values u(x,y,t) at the domain edges
 * @param {number} xMin - Lower x boundary
 * @param {number} xMax - Upper x boundary
 * @param {number} yMin - Lower y boundary
 * @param {number} yMax - Upper y boundary
 * @param {number} tMax - Maximum time
 * @param {number} dx - Spatial step in x
 * @param {number} dy - Spatial step in y
 * @param {number} dt - Time step
 * @param {number} k - Thermal diffusivity
 * @returns {Array} - 3D array u[t][y][x] representing the solution
 */
numerical.pde.heat2d = function (initialCondition, boundaryCondition, xMin, xMax, yMin, yMax, tMax, dx = 0.1, dy = 0.1, dt = 0.01, k = 1.0) {
  // Check stability condition
  const stability = k * dt * (1 / (dx * dx) + 1 / (dy * dy));
  if (stability > 0.5) {
    throw new Error(`Unstable parameters: dt is too large. Reduce dt or increase dx and dy. Stability value: ${stability}, should be <= 0.5`);
  }

  // Setup grid
  const nx = Math.floor((xMax - xMin) / dx) + 1;
  const ny = Math.floor((yMax - yMin) / dy) + 1;
  const nt = Math.floor(tMax / dt) + 1;

  // Initialize solution array
  const u = Array(nt).fill().map(() => Array(ny).fill().map(() => Array(nx).fill(0)));

  // Set initial condition
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      u[0][j][i] = initialCondition(x, y);
    }
  }

  // Time stepping
  for (let n = 0; n < nt - 1; n++) {
    // Set boundary conditions for current time step
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = xMin + i * dx;
        const y = yMin + j * dy;
        const t = n * dt;

        // Check if point is on boundary
        if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) {
          u[n + 1][j][i] = boundaryCondition(x, y, t);
        }
      }
    }

    // Update interior points
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        // Finite difference scheme
        const uxx = (u[n][j][i + 1] - 2 * u[n][j][i] + u[n][j][i - 1]) / (dx * dx);
        const uyy = (u[n][j + 1][i] - 2 * u[n][j][i] + u[n][j - 1][i]) / (dy * dy);

        u[n + 1][j][i] = u[n][j][i] + k * dt * (uxx + uyy);
      }
    }
  }

  return u;
};

/**
 * Solve the 1D wave equation using the explicit finite difference method
 * u_tt = c^2 * u_xx
 * @param {Function} initialPosition - Initial displacement u(x,0)
 * @param {Function} initialVelocity - Initial velocity u_t(x,0)
 * @param {Function} boundaryCondition - Boundary values u(x,t) at the domain edges
 * @param {number} xMin - Lower x boundary
 * @param {number} xMax - Upper x boundary
 * @param {number} tMax - Maximum time
 * @param {number} dx - Spatial step
 * @param {number} dt - Time step
 * @param {number} c - Wave speed
 * @returns {Array} - 2D array u[t][x] representing the solution
 */
numerical.pde.wave1d = function (initialPosition, initialVelocity, boundaryCondition, xMin, xMax, tMax, dx = 0.1, dt = 0.01, c = 1.0) {
  // Check Courant–Friedrichs–Lewy condition
  const cfl = c * dt / dx;
  if (cfl > 1.0) {
    throw new Error(`CFL condition violated: c*dt/dx = ${cfl} > 1. Reduce dt or increase dx.`);
  }

  // Setup grid
  const nx = Math.floor((xMax - xMin) / dx) + 1;
  const nt = Math.floor(tMax / dt) + 1;

  // Initialize solution array
  const u = Array(nt).fill().map(() => Array(nx).fill(0));

  // Set initial position
  for (let i = 0; i < nx; i++) {
    const x = xMin + i * dx;
    u[0][i] = initialPosition(x);
  }

  // Set initial velocity (using central difference for first time step)
  for (let i = 1; i < nx - 1; i++) {
    const x = xMin + i * dx;
    u[1][i] = u[0][i] + dt * initialVelocity(x)
              + 0.5 * c * c * dt * dt * (u[0][i + 1] - 2 * u[0][i] + u[0][i - 1]) / (dx * dx);
  }

  // Set boundary conditions for first time step
  u[1][0] = boundaryCondition(xMin, dt);
  u[1][nx - 1] = boundaryCondition(xMax, dt);

  // Time stepping
  for (let n = 1; n < nt - 1; n++) {
    // Set boundary conditions
    u[n + 1][0] = boundaryCondition(xMin, (n + 1) * dt);
    u[n + 1][nx - 1] = boundaryCondition(xMax, (n + 1) * dt);

    // Update interior points
    for (let i = 1; i < nx - 1; i++) {
      // Explicit finite difference scheme for wave equation
      const c2 = c * c;
      u[n + 1][i] = 2 * u[n][i] - u[n - 1][i] + c2 * dt * dt * (u[n][i + 1] - 2 * u[n][i] + u[n][i - 1]) / (dx * dx);
    }
  }

  return u;
};

/**
 * Spectral methods for solving differential equations
 */
numerical.spectral = {};

/**
 * Solve a differential equation using the Fourier spectral method
 * @param {Function} f - The right-hand side of the equation u_t = f(u, u_x, u_xx, ...)
 * @param {Function} initialCondition - Initial condition u(x,0)
 * @param {number} xMin - Lower x boundary
 * @param {number} xMax - Upper x boundary
 * @param {number} tMax - Maximum time
 * @param {number} nx - Number of spatial grid points
 * @param {number} nt - Number of time steps
 * @returns {Array} - 2D array u[t][x] representing the solution
 */
numerical.spectral.fourier = function (f, initialCondition, xMin, xMax, tMax, nx = 64, nt = 100) {
  // This is a simplified version that requires an FFT implementation
  // In a real implementation, we'd use a proper FFT library

  // Mock FFT implementation
  const fft = function (data) {
    // In a real implementation, this would be a proper FFT
    // For now, just return a transformed array of same length
    return data.map((val, idx) => ({ re: val, im: 0 }));
  };

  const ifft = function (data) {
    // In a real implementation, this would be a proper inverse FFT
    // For now, just return the real parts
    return data.map((val) => val.re);
  };

  // Setup grid
  const L = xMax - xMin;
  const dx = L / nx;
  const dt = tMax / nt;

  // Initialize solution array
  const u = Array(nt + 1).fill().map(() => Array(nx).fill(0));

  // Set initial condition
  for (let i = 0; i < nx; i++) {
    const x = xMin + i * dx;
    u[0][i] = initialCondition(x);
  }

  // Wavenumbers in Fourier space
  const k = Array(nx).fill(0).map((_, i) => {
    const k_val = 2 * Math.PI * (i <= nx / 2 ? i : i - nx) / L;
    return k_val;
  });

  // Time stepping with 4th order Runge-Kutta in Fourier space
  for (let n = 0; n < nt; n++) {
    const t = n * dt;

    // Transform to Fourier space
    const u_hat = fft(u[n]);

    // RK4 step 1
    const k1 = evaluateRightHandSide(u_hat, k, t, f);

    // RK4 step 2
    const u_hat2 = u_hat.map((val, i) => ({
      re: val.re + 0.5 * dt * k1[i].re,
      im: val.im + 0.5 * dt * k1[i].im
    }));
    const k2 = evaluateRightHandSide(u_hat2, k, t + 0.5 * dt, f);

    // RK4 step 3
    const u_hat3 = u_hat.map((val, i) => ({
      re: val.re + 0.5 * dt * k2[i].re,
      im: val.im + 0.5 * dt * k2[i].im
    }));
    const k3 = evaluateRightHandSide(u_hat3, k, t + 0.5 * dt, f);

    // RK4 step 4
    const u_hat4 = u_hat.map((val, i) => ({
      re: val.re + dt * k3[i].re,
      im: val.im + dt * k3[i].im
    }));
    const k4 = evaluateRightHandSide(u_hat4, k, t + dt, f);

    // Combine RK4 steps
    const u_hat_new = u_hat.map((val, i) => ({
      re: val.re + (dt / 6) * (k1[i].re + 2 * k2[i].re + 2 * k3[i].re + k4[i].re),
      im: val.im + (dt / 6) * (k1[i].im + 2 * k2[i].im + 2 * k3[i].im + k4[i].im)
    }));

    // Transform back to real space
    u[n + 1] = ifft(u_hat_new);
  }

  return u;

  // Helper function to evaluate the right-hand side in Fourier space
  function evaluateRightHandSide(u_hat, k, t, f) {
    // This is a placeholder - in a real implementation, we would compute
    // derivatives in Fourier space and evaluate f accordingly
    return u_hat.map((val, i) => ({
      re: -k[i] * k[i] * val.re, // Example: heat equation u_t = u_xx
      im: -k[i] * k[i] * val.im
    }));
  }
};

/**
 * Implement the Chebyshev collocation spectral method
 * @param {Function} diffEq - The differential equation operator L(u) = f
 * @param {Function} source - The right-hand side function f
 * @param {Function} boundaryCondition - Function defining boundary values
 * @param {number} a - Lower boundary
 * @param {number} b - Upper boundary
 * @param {number} n - Number of collocation points
 * @returns {Object} - Object containing the solution function and grid points
 */
numerical.spectral.chebyshev = function (diffEq, source, boundaryCondition, a, b, n = 32) {
  // Generate Chebyshev points in [-1, 1]
  const x_cheb = Array(n).fill(0).map((_, i) => Math.cos(Math.PI * i / (n - 1)));

  // Map to domain [a, b]
  const x = x_cheb.map((x) => 0.5 * ((b - a) * x + (b + a)));

  // Compute differentiation matrix (simplified)
  // In a full implementation, we would compute the proper Chebyshev differentiation matrix
  const D = Array(n).fill().map(() => Array(n).fill(0));

  // Fill in the differentiation matrix (this is just a placeholder)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const ci = (i === 0 || i === n - 1) ? 2 : 1;
        const cj = (j === 0 || j === n - 1) ? 2 : 1;
        D[i][j] = (ci / cj) * (-1) ** (i + j) / (x_cheb[i] - x_cheb[j]);
      }
    }
  }

  // Fill in diagonal elements
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i) sum += D[i][j];
    }
    D[i][i] = -sum;
  }

  // Apply boundary conditions and solve the system
  // This is a simplified placeholder - in a real implementation,
  // we would properly set up and solve the linear system
  const u = Array(n).fill(0);

  // Set boundary conditions
  u[0] = boundaryCondition(a);
  u[n - 1] = boundaryCondition(b);

  // Create interpolation function for the solution
  const solution = function (x_eval) {
    // Simple Lagrange interpolation
    let result = 0;
    for (let i = 0; i < n; i++) {
      let basis = 1;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          basis *= (x_eval - x[j]) / (x[i] - x[j]);
        }
      }
      result += u[i] * basis;
    }
    return result;
  };

  return { solution, points: x, values: u };
};

/**
 * Stochastic differential equation solvers
 */
numerical.sde = {};

/**
 * Solve a stochastic differential equation using the Euler-Maruyama method
 * dX = a(X,t)dt + b(X,t)dW
 * @param {Function} drift - The drift function a(x,t)
 * @param {Function} diffusion - The diffusion function b(x,t)
 * @param {number} x0 - Initial condition
 * @param {number} t0 - Initial time
 * @param {number} T - Final time
 * @param {number} dt - Time step
 * @param {number} paths - Number of sample paths
 * @returns {Array} - Array of sample paths, each an array of [t, X] pairs
 */
numerical.sde.eulerMaruyama = function (drift, diffusion, x0, t0, T, dt = 0.01, paths = 1) {
  const steps = Math.ceil((T - t0) / dt);
  const actualDt = (T - t0) / steps;

  // Generate sample paths
  const results = [];

  for (let path = 0; path < paths; path++) {
    const trajectory = [];
    let t = t0;
    let x = x0;

    trajectory.push([t, x]);

    for (let step = 0; step < steps; step++) {
      // Generate normal random number with mean 0 and variance dt
      const dW = Math.sqrt(actualDt) * randn();

      // Euler-Maruyama update
      x = x + drift(x, t) * actualDt + diffusion(x, t) * dW;
      t += actualDt;

      trajectory.push([t, x]);
    }

    results.push(trajectory);
  }

  return results;

  // Helper function to generate standard normal random number
  function randn() {
    let u = 0; let
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
};

export default numerical;
