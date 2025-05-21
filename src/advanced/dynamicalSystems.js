/**
 * Dynamical Systems module for herta.js
 * Provides tools for analyzing and simulating dynamical systems
 */

const arithmetic = require('../core/arithmetic');
const matrix = require('../core/matrix');
const numerical = require('./numerical');

const dynamicalSystems = {};

/**
 * Iterate a discrete dynamical system
 * @param {Function} f - The evolution function f(x)
 * @param {number|Array} x0 - Initial state
 * @param {number} iterations - Number of iterations
 * @returns {Array} - Trajectory of the system
 */
dynamicalSystems.iterate = function(f, x0, iterations) {
  const trajectory = [x0];
  let currentState = x0;
  
  for (let i = 0; i < iterations; i++) {
    currentState = f(currentState);
    trajectory.push(currentState);
  }
  
  return trajectory;
};

/**
 * Calculate the Lyapunov exponent for a 1D map
 * @param {Function} f - The map function
 * @param {number} x0 - Initial state
 * @param {number} iterations - Number of iterations
 * @param {number} [discardTransients=100] - Number of initial iterations to discard
 * @returns {number} - Estimated Lyapunov exponent
 */
dynamicalSystems.lyapunovExponent = function(f, x0, iterations, discardTransients = 100) {
  let x = x0;
  let sum = 0;
  
  // Discard transients
  for (let i = 0; i < discardTransients; i++) {
    x = f(x);
  }
  
  // Estimate Lyapunov exponent
  for (let i = 0; i < iterations; i++) {
    const derivative = (f(x + 1e-10) - f(x)) / 1e-10; // Numerical derivative
    sum += Math.log(Math.abs(derivative));
    x = f(x);
  }
  
  return sum / iterations;
};

/**
 * Calculate the bifurcation diagram for a 1D map
 * @param {Function} f - The map function f(x, r) where r is the parameter
 * @param {number} minParam - Minimum parameter value
 * @param {number} maxParam - Maximum parameter value
 * @param {number} paramSteps - Number of parameter steps
 * @param {Object} [options] - Options for the calculation
 * @returns {Object} - Bifurcation diagram data
 */
dynamicalSystems.bifurcationDiagram = function(f, minParam, maxParam, paramSteps, options = {}) {
  const initialX = options.initialX || 0.5;
  const iterations = options.iterations || 500;
  const discardTransients = options.discardTransients || 200;
  
  const paramStep = (maxParam - minParam) / paramSteps;
  const diagram = { parameters: [], values: [] };
  
  for (let i = 0; i <= paramSteps; i++) {
    const r = minParam + i * paramStep;
    diagram.parameters.push(r);
    
    // Create function with fixed parameter
    const fr = x => f(x, r);
    
    // Initialize and discard transients
    let x = initialX;
    for (let j = 0; j < discardTransients; j++) {
      x = fr(x);
    }
    
    // Record stable points
    const values = [];
    for (let j = 0; j < iterations; j++) {
      x = fr(x);
      if (j >= iterations - 50) { // Record only last 50 iterations
        values.push(x);
      }
    }
    
    diagram.values.push(values);
  }
  
  return diagram;
};

/**
 * Solve a system of ordinary differential equations using Runge-Kutta 4th order method
 * @param {Function} derivs - Function that calculates derivatives: derivs(t, y) returns array of derivatives
 * @param {Array} initialState - Initial state vector
 * @param {number} tStart - Start time
 * @param {number} tEnd - End time
 * @param {number} numSteps - Number of steps
 * @returns {Object} - Solution object with time and state arrays
 */
dynamicalSystems.solveODE = function(derivs, initialState, tStart, tEnd, numSteps) {
  const dt = (tEnd - tStart) / numSteps;
  const times = Array(numSteps + 1).fill().map((_, i) => tStart + i * dt);
  const states = Array(numSteps + 1).fill().map(() => Array(initialState.length));
  
  // Set initial state
  states[0] = [...initialState];
  
  // RK4 integration
  for (let i = 0; i < numSteps; i++) {
    const t = times[i];
    const y = states[i];
    const k1 = derivs(t, y);
    
    const k2Args = y.map((yi, j) => yi + k1[j] * dt / 2);
    const k2 = derivs(t + dt / 2, k2Args);
    
    const k3Args = y.map((yi, j) => yi + k2[j] * dt / 2);
    const k3 = derivs(t + dt / 2, k3Args);
    
    const k4Args = y.map((yi, j) => yi + k3[j] * dt);
    const k4 = derivs(t + dt, k4Args);
    
    states[i + 1] = y.map((yi, j) => 
      yi + (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]) * dt / 6
    );
  }
  
  return { times, states };
};

/**
 * Calculate the fixed points of a 1D map
 * @param {Function} f - The map function
 * @param {number} min - Minimum search range
 * @param {number} max - Maximum search range
 * @param {number} [precision=1e-10] - Precision for fixed point determination
 * @returns {Array} - Array of fixed points
 */
dynamicalSystems.fixedPoints = function(f, min, max, precision = 1e-10) {
  // Define the function g(x) = f(x) - x, whose roots are fixed points
  const g = x => f(x) - x;
  
  // Initial sampling
  const numSamples = 100;
  const step = (max - min) / numSamples;
  const samples = [];
  
  for (let i = 0; i <= numSamples; i++) {
    const x = min + i * step;
    samples.push({ x, y: g(x) });
  }
  
  // Look for sign changes
  const fixedPoints = [];
  for (let i = 0; i < samples.length - 1; i++) {
    if (samples[i].y * samples[i + 1].y <= 0) {
      // Potential root found, use bisection method
      let a = samples[i].x;
      let b = samples[i + 1].x;
      let fa = g(a);
      let fb = g(b);
      
      // Bisection search
      while (Math.abs(b - a) > precision) {
        const c = (a + b) / 2;
        const fc = g(c);
        
        if (Math.abs(fc) < precision) {
          // Found fixed point
          fixedPoints.push(c);
          break;
        }
        
        if (fa * fc < 0) {
          b = c;
          fb = fc;
        } else {
          a = c;
          fa = fc;
        }
      }
      
      // Add the approximation
      if (Math.abs(b - a) <= precision) {
        fixedPoints.push((a + b) / 2);
      }
    }
  }
  
  return fixedPoints;
};

/**
 * Calculate the stability of fixed points of a 1D map
 * @param {Function} f - The map function
 * @param {Array} fixedPoints - Array of fixed points
 * @returns {Array} - Array of objects {point, stability}
 */
dynamicalSystems.stability = function(f, fixedPoints) {
  return fixedPoints.map(point => {
    // Calculate derivative at fixed point
    const derivative = (f(point + 1e-10) - f(point)) / 1e-10;
    const absDerivative = Math.abs(derivative);
    
    let stability;
    if (absDerivative < 1) {
      stability = 'stable';
    } else if (absDerivative > 1) {
      stability = 'unstable';
    } else {
      stability = 'neutral';
    }
    
    return { point, derivative, stability };
  });
};

/**
 * Generate a Poincaré map for a continuous dynamical system
 * @param {Function} derivs - Function that calculates derivatives
 * @param {Array} initialStates - Array of initial states
 * @param {number} tMax - Maximum integration time
 * @param {Function} sectionCondition - Function that returns true when trajectory crosses section
 * @param {number} [dt=0.01] - Time step for integration
 * @returns {Array} - Array of points on the Poincaré section
 */
dynamicalSystems.poincareMap = function(derivs, initialStates, tMax, sectionCondition, dt = 0.01) {
  const result = [];
  
  for (const initialState of initialStates) {
    let t = 0;
    let state = [...initialState];
    let prevState = null;
    
    while (t < tMax) {
      // RK4 step
      const k1 = derivs(t, state);
      const k2Args = state.map((s, i) => s + k1[i] * dt / 2);
      const k2 = derivs(t + dt / 2, k2Args);
      const k3Args = state.map((s, i) => s + k2[i] * dt / 2);
      const k3 = derivs(t + dt / 2, k3Args);
      const k4Args = state.map((s, i) => s + k3[i] * dt);
      const k4 = derivs(t + dt, k4Args);
      
      prevState = [...state];
      state = state.map((s, i) => 
        s + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6
      );
      
      t += dt;
      
      // Check if trajectory crossed the section
      if (prevState && sectionCondition(state) && !sectionCondition(prevState)) {
        result.push([...state]);
      }
    }
  }
  
  return result;
};

/**
 * Calculate the fractal dimension of a set of points (box-counting dimension)
 * @param {Array} points - Array of points (each point is an array of coordinates)
 * @param {number} minSize - Minimum box size
 * @param {number} maxSize - Maximum box size
 * @param {number} numSteps - Number of box sizes to try
 * @returns {number} - Estimated fractal dimension
 */
dynamicalSystems.fractalDimension = function(points, minSize, maxSize, numSteps) {
  if (!points.length) return 0;
  
  // Find bounds of the point set
  const dimensions = points[0].length;
  const min = Array(dimensions).fill(Infinity);
  const max = Array(dimensions).fill(-Infinity);
  
  for (const point of points) {
    for (let d = 0; d < dimensions; d++) {
      min[d] = Math.min(min[d], point[d]);
      max[d] = Math.max(max[d], point[d]);
    }
  }
  
  // Calculate box counting at different scales
  const scales = [];
  const counts = [];
  
  const logBase = Math.log(maxSize / minSize) / (numSteps - 1);
  
  for (let i = 0; i < numSteps; i++) {
    const size = maxSize / Math.exp(i * logBase);
    scales.push(1 / size);
    
    // Count occupied boxes
    const occupied = new Set();
    
    for (const point of points) {
      // Calculate box indices for this point
      const indices = point.map((x, d) => Math.floor((x - min[d]) / size));
      occupied.add(indices.join(','));
    }
    
    counts.push(occupied.size);
  }
  
  // Linear regression to find slope (dimension)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = scales.length;
  
  for (let i = 0; i < n; i++) {
    const x = Math.log(scales[i]);
    const y = Math.log(counts[i]);
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
};

/**
 * Generate the phase portrait of a 2D dynamical system
 * @param {Function} derivs - Function that calculates derivatives
 * @param {number} xMin - Minimum x value
 * @param {number} xMax - Maximum x value
 * @param {number} yMin - Minimum y value
 * @param {number} yMax - Maximum y value
 * @param {number} numX - Number of grid points in x direction
 * @param {number} numY - Number of grid points in y direction
 * @returns {Object} - Phase portrait data
 */
dynamicalSystems.phasePortrait = function(derivs, xMin, xMax, yMin, yMax, numX, numY) {
  const dx = (xMax - xMin) / (numX - 1);
  const dy = (yMax - yMin) / (numY - 1);
  
  const portrait = {
    grid: { x: [], y: [] },
    vectors: []
  };
  
  // Create grid
  for (let i = 0; i < numX; i++) {
    portrait.grid.x.push(xMin + i * dx);
  }
  
  for (let j = 0; j < numY; j++) {
    portrait.grid.y.push(yMin + j * dy);
  }
  
  // Calculate vector field
  for (let j = 0; j < numY; j++) {
    const y = portrait.grid.y[j];
    const row = [];
    
    for (let i = 0; i < numX; i++) {
      const x = portrait.grid.x[i];
      const derivatives = derivs(0, [x, y]);
      
      row.push({
        x: x,
        y: y,
        dx: derivatives[0],
        dy: derivatives[1]
      });
    }
    
    portrait.vectors.push(row);
  }
  
  return portrait;
};

module.exports = dynamicalSystems;
