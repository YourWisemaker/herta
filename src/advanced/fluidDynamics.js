/**
 * Fluid Dynamics module for herta.js
 * Provides computational fluid dynamics algorithms and simulations
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const fluidDynamics = {};

/**
 * Calculate Reynolds number for a flow
 * @param {number} density - Fluid density (kg/m³)
 * @param {number} velocity - Flow velocity (m/s)
 * @param {number} length - Characteristic length (m)
 * @param {number} viscosity - Dynamic viscosity (kg/(m·s))
 * @returns {number} - Reynolds number (dimensionless)
 */
fluidDynamics.reynoldsNumber = function(density, velocity, length, viscosity) {
  return (density * velocity * length) / viscosity;
};

/**
 * Calculate pressure drop in a pipe using Darcy-Weisbach equation
 * @param {number} frictionFactor - Darcy friction factor
 * @param {number} length - Pipe length (m)
 * @param {number} diameter - Pipe diameter (m)
 * @param {number} density - Fluid density (kg/m³)
 * @param {number} velocity - Flow velocity (m/s)
 * @returns {number} - Pressure drop (Pa)
 */
fluidDynamics.pressureDrop = function(frictionFactor, length, diameter, density, velocity) {
  return frictionFactor * (length / diameter) * (density * Math.pow(velocity, 2)) / 2;
};

/**
 * Calculate friction factor using Colebrook-White equation
 * @param {number} reynoldsNumber - Reynolds number
 * @param {number} relativeRoughness - Relative roughness (ε/D)
 * @returns {number} - Darcy friction factor
 */
fluidDynamics.frictionFactor = function(reynoldsNumber, relativeRoughness) {
  // Initial guess (from Haaland equation)
  let f = Math.pow(-1.8 * Math.log10(Math.pow(relativeRoughness/3.7, 1.11) + 6.9/reynoldsNumber), -2);
  
  // Newton-Raphson method to solve Colebrook-White equation
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  for (let i = 0; i < maxIterations; i++) {
    const term = relativeRoughness/3.7 + 2.51/(reynoldsNumber * Math.sqrt(f));
    const f_old = f;
    
    // Update f using the derivative of Colebrook-White
    const df = 1/(2*Math.sqrt(f)) * 2.51/(reynoldsNumber * term * Math.log(10));
    f = f - (1/Math.sqrt(f) + 2*Math.log10(term))/(df);
    
    if (Math.abs(f - f_old) < tolerance) break;
  }
  
  return f;
};

/**
 * Calculate head loss in a pipe system
 * @param {number} frictionFactor - Darcy friction factor
 * @param {number} length - Pipe length (m)
 * @param {number} diameter - Pipe diameter (m)
 * @param {number} velocity - Flow velocity (m/s)
 * @param {number} gravity - Gravitational acceleration (m/s²)
 * @returns {number} - Head loss (m)
 */
fluidDynamics.headLoss = function(frictionFactor, length, diameter, velocity, gravity = 9.81) {
  return frictionFactor * (length / diameter) * Math.pow(velocity, 2) / (2 * gravity);
};

/**
 * Calculate the Mach number for a fluid flow
 * @param {number} velocity - Flow velocity (m/s)
 * @param {number} speedOfSound - Speed of sound in the fluid (m/s)
 * @returns {number} - Mach number (dimensionless)
 */
fluidDynamics.machNumber = function(velocity, speedOfSound) {
  return velocity / speedOfSound;
};

/**
 * Solve 1D advection equation using upwind scheme
 * @param {Array} initialValues - Initial field values
 * @param {number} velocity - Advection velocity
 * @param {number} dx - Spatial step size
 * @param {number} dt - Time step size
 * @param {number} totalTime - Total simulation time
 * @returns {Array} - Solution at each time step
 */
fluidDynamics.advection1D = function(initialValues, velocity, dx, dt, totalTime) {
  const nx = initialValues.length;
  const nt = Math.floor(totalTime / dt);
  const courantNumber = Math.abs(velocity) * dt / dx;
  
  if (courantNumber > 1) {
    console.warn(`Courant number (${courantNumber}) > 1, solution may be unstable`);
  }
  
  const solution = new Array(nt + 1);
  solution[0] = [...initialValues];
  
  for (let n = 0; n < nt; n++) {
    solution[n + 1] = new Array(nx);
    
    for (let i = 0; i < nx; i++) {
      if (velocity > 0) {
        // Upwind scheme for positive velocity
        const upwindIndex = (i > 0) ? i - 1 : nx - 1;
        solution[n + 1][i] = solution[n][i] - velocity * dt / dx * 
          (solution[n][i] - solution[n][upwindIndex]);
      } else {
        // Upwind scheme for negative velocity
        const upwindIndex = (i < nx - 1) ? i + 1 : 0;
        solution[n + 1][i] = solution[n][i] - velocity * dt / dx * 
          (solution[n][upwindIndex] - solution[n][i]);
      }
    }
  }
  
  return solution;
};

/**
 * Solve 1D diffusion equation using explicit scheme
 * @param {Array} initialValues - Initial field values
 * @param {number} diffusionCoefficient - Diffusion coefficient
 * @param {number} dx - Spatial step size
 * @param {number} dt - Time step size
 * @param {number} totalTime - Total simulation time
 * @returns {Array} - Solution at each time step
 */
fluidDynamics.diffusion1D = function(initialValues, diffusionCoefficient, dx, dt, totalTime) {
  const nx = initialValues.length;
  const nt = Math.floor(totalTime / dt);
  const alpha = diffusionCoefficient * dt / (dx * dx);
  
  if (alpha > 0.5) {
    console.warn(`Diffusion coefficient (${alpha}) > 0.5, solution may be unstable`);
  }
  
  const solution = new Array(nt + 1);
  solution[0] = [...initialValues];
  
  for (let n = 0; n < nt; n++) {
    solution[n + 1] = new Array(nx);
    
    for (let i = 0; i < nx; i++) {
      const left = (i > 0) ? i - 1 : nx - 1;
      const right = (i < nx - 1) ? i + 1 : 0;
      
      solution[n + 1][i] = solution[n][i] + alpha * 
        (solution[n][left] - 2 * solution[n][i] + solution[n][right]);
    }
  }
  
  return solution;
};

/**
 * Solve 1D Burgers equation using the Lax-Wendroff scheme
 * @param {Array} initialValues - Initial field values
 * @param {number} viscosity - Fluid viscosity
 * @param {number} dx - Spatial step size
 * @param {number} dt - Time step size
 * @param {number} totalTime - Total simulation time
 * @returns {Array} - Solution at each time step
 */
fluidDynamics.burgers1D = function(initialValues, viscosity, dx, dt, totalTime) {
  const nx = initialValues.length;
  const nt = Math.floor(totalTime / dt);
  
  const solution = new Array(nt + 1);
  solution[0] = [...initialValues];
  
  for (let n = 0; n < nt; n++) {
    solution[n + 1] = new Array(nx);
    
    for (let i = 0; i < nx; i++) {
      const im1 = (i > 0) ? i - 1 : nx - 1;
      const ip1 = (i < nx - 1) ? i + 1 : 0;
      
      // Nonlinear advection term
      const advection = -0.5 * solution[n][i] * 
        (solution[n][ip1] - solution[n][im1]) / dx;
      
      // Diffusion term
      const diffusion = viscosity * 
        (solution[n][im1] - 2 * solution[n][i] + solution[n][ip1]) / (dx * dx);
      
      solution[n + 1][i] = solution[n][i] + dt * (advection + diffusion);
    }
  }
  
  return solution;
};

/**
 * Solve 2D incompressible Navier-Stokes equations using a simplified method
 * @param {Object} options - Simulation options
 * @returns {Object} - Simulation results
 */
fluidDynamics.navierstokes2D = function(options) {
  const {
    nx = 50,        // Grid points in x direction
    ny = 50,        // Grid points in y direction
    dx = 0.1,       // Spatial step in x
    dy = 0.1,       // Spatial step in y
    dt = 0.01,      // Time step
    steps = 100,    // Number of time steps
    rho = 1.0,      // Density
    nu = 0.1,       // Kinematic viscosity
    initialU = null,// Initial x-velocity field
    initialV = null,// Initial y-velocity field
    initialP = null // Initial pressure field
  } = options;

  // Initialize fields if not provided
  const u = Array(steps + 1).fill().map(() => Array(ny).fill().map(() => Array(nx).fill(0)));
  const v = Array(steps + 1).fill().map(() => Array(ny).fill().map(() => Array(nx).fill(0)));
  const p = Array(steps + 1).fill().map(() => Array(ny).fill().map(() => Array(nx).fill(0)));
  
  // Set initial conditions
  if (initialU) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        u[0][j][i] = initialU[j][i];
      }
    }
  }
  
  if (initialV) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        v[0][j][i] = initialV[j][i];
      }
    }
  }
  
  if (initialP) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        p[0][j][i] = initialP[j][i];
      }
    }
  }
  
  // Simplified solver - Demo implementation 
  // For a real solver, we would need proper handling of boundary conditions
  // and more sophisticated algorithms for pressure-velocity coupling
  
  for (let n = 0; n < steps; n++) {
    // Simplified solver approach
    
    // 1. Compute intermediate velocity field (without pressure gradient)
    const u_star = Array(ny).fill().map(() => Array(nx).fill(0));
    const v_star = Array(ny).fill().map(() => Array(nx).fill(0));
    
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        // x-momentum equation (simplified)
        const u_lap = (u[n][j][i+1] + u[n][j][i-1] + u[n][j+1][i] + u[n][j-1][i] - 4*u[n][j][i]) / (dx*dx);
        u_star[j][i] = u[n][j][i] + dt * (nu * u_lap);
        
        // y-momentum equation (simplified)
        const v_lap = (v[n][j][i+1] + v[n][j][i-1] + v[n][j+1][i] + v[n][j-1][i] - 4*v[n][j][i]) / (dy*dy);
        v_star[j][i] = v[n][j][i] + dt * (nu * v_lap);
      }
    }
    
    // 2. Solve pressure Poisson equation (simplified approach)
    const p_next = Array(ny).fill().map(() => Array(nx).fill(0));
    
    // In a real solver, we would iterate to convergence
    for (let iter = 0; iter < 10; iter++) {
      for (let j = 1; j < ny - 1; j++) {
        for (let i = 1; i < nx - 1; i++) {
          const div = (u_star[j][i+1] - u_star[j][i-1]) / (2*dx) + 
                      (v_star[j+1][i] - v_star[j-1][i]) / (2*dy);
          
          p_next[j][i] = 0.25 * (
            p[n][j][i+1] + p[n][j][i-1] + p[n][j+1][i] + p[n][j-1][i] - 
            div * rho * dx * dy / dt
          );
        }
      }
    }
    
    // 3. Correct velocity field using pressure gradient
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        u[n+1][j][i] = u_star[j][i] - (dt / rho) * (p_next[j][i+1] - p_next[j][i-1]) / (2*dx);
        v[n+1][j][i] = v_star[j][i] - (dt / rho) * (p_next[j+1][i] - p_next[j-1][i]) / (2*dy);
      }
    }
    
    // Update pressure field
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        p[n+1][j][i] = p_next[j][i];
      }
    }
    
    // Apply simplified boundary conditions
    applyBoundaryConditions(u[n+1], v[n+1], p[n+1], nx, ny);
  }
  
  return { u, v, p };
  
  // Helper function for boundary conditions
  function applyBoundaryConditions(u, v, p, nx, ny) {
    // Simplified no-slip boundary conditions
    for (let i = 0; i < nx; i++) {
      u[0][i] = 0;              // Bottom wall
      u[ny-1][i] = 0;           // Top wall
      v[0][i] = 0;              // Bottom wall
      v[ny-1][i] = 0;           // Top wall
    }
    
    for (let j = 0; j < ny; j++) {
      u[j][0] = 0;              // Left wall
      u[j][nx-1] = 0;           // Right wall
      v[j][0] = 0;              // Left wall
      v[j][nx-1] = 0;           // Right wall
    }
    
    // Neumann boundary condition for pressure
    for (let i = 0; i < nx; i++) {
      p[0][i] = p[1][i];        // Bottom wall
      p[ny-1][i] = p[ny-2][i];  // Top wall
    }
    
    for (let j = 0; j < ny; j++) {
      p[j][0] = p[j][1];        // Left wall
      p[j][nx-1] = p[j][nx-2];  // Right wall
    }
  }
};

module.exports = fluidDynamics;
