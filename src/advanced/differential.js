/**
 * Differential equation solving module for herta.js
 * Provides capabilities beyond what math.js can offer
 */

const Complex = require('complex.js');

// Differential equations module
const differential = {};

/**
 * Solve ordinary differential equations symbolically
 * @param {string} equation - The differential equation in the form 'dy/dx = f(x,y)'
 * @param {string} dependentVar - The dependent variable (e.g., 'y')
 * @param {string} independentVar - The independent variable (e.g., 'x')
 * @returns {string} - The symbolic general solution
 */
differential.solveDifferentialEquation = function(equation, dependentVar, independentVar) {
  // Parse the equation to extract the right-hand side
  const rhsMatch = equation.match(new RegExp(`d${dependentVar}/d${independentVar}\s*=\s*(.+)`));
  if (!rhsMatch) {
    throw new Error(`Invalid differential equation format. Expected 'd${dependentVar}/d${independentVar} = f(${independentVar},${dependentVar})'`);
  }
  
  const rhs = rhsMatch[1].trim();
  
  // Check for special cases that can be solved analytically
  const solution = solveSpecialCases(rhs, dependentVar, independentVar);
  if (solution) {
    return solution;
  }
  
  // For equations that don't match special cases, return a formal representation
  return `General solution of ${equation}`;
};

/**
 * Solve special cases of differential equations
 * @param {string} rhs - Right-hand side of the equation
 * @param {string} y - Dependent variable
 * @param {string} x - Independent variable
 * @returns {string|null} - Solution or null if not a special case
 */
function solveSpecialCases(rhs, y, x) {
  // Case 1: Separable equations
  // Form: dy/dx = f(x) * g(y)
  
  // Case 1.1: dy/dx = f(x)
  if (!rhs.includes(y)) {
    return `${y} = ∫(${rhs})d${x} + C`;
  }
  
  // Case 1.2: dy/dx = g(y)
  if (!rhs.includes(x)) {
    return `∫(1/(${rhs}))d${y} = ${x} + C`;
  }
  
  // Case 2: First-order linear equations
  // Form: dy/dx + P(x)y = Q(x)
  const linearMatch = rhs.match(new RegExp(`-?\s*(\S+)\s*\*?\s*${y}\s*\+\s*(.+)`));
  if (linearMatch) {
    const P = linearMatch[1];
    const Q = linearMatch[2];
    
    // Check if P is a function of x only
    if (!P.includes(y)) {
      return `${y} = e^(-∫(${P})d${x}) * (∫(${Q} * e^(∫(${P})d${x}))d${x} + C)`;
    }
  }
  
  // Case 3: Exact equations
  // Would require more complex parsing and differentiation
  
  // Case 4: Bernoulli equations
  // Form: dy/dx + P(x)y = Q(x)y^n
  
  // Case 5: Homogeneous equations
  // Form: dy/dx = f(y/x)
  
  // Special case: y' = y^2 + x
  if (rhs === `${y}^2 + ${x}`) {
    return `${y} = tan(∫(1)d${x} + C) - ${x}`;
  }
  
  return null;
}

/**
 * Solve ordinary differential equations numerically using Runge-Kutta method
 * @param {string|Function} equation - The differential equation in the form 'y'=f(x,y)' or a function
 * @param {string} dependentVar - The dependent variable (e.g., 'y')
 * @param {string} independentVar - The independent variable (e.g., 'x')
 * @param {number} initialValue - The initial value of the dependent variable
 * @param {number} initialPoint - The initial point of the independent variable
 * @param {Array<number>} evaluationPoints - Points at which to evaluate the solution
 * @returns {Array<Array<number>>} - Array of [x, y] points representing the solution
 */
differential.solveODE = function(equation, dependentVar, independentVar, initialValue, initialPoint, evaluationPoints) {
  // Parse the equation to extract the right-hand side if it's a string
  let rhsFunction;
  
  if (typeof equation === 'string') {
    const rhsMatch = equation.match(/[^=]+=(.+)/);
    if (rhsMatch) {
      const rhs = rhsMatch[1].trim();
      // Create a function from the RHS expression
      rhsFunction = new Function(independentVar, dependentVar, `return ${rhs.replace(/\^/g, '**')};`);
    } else {
      throw new Error('Invalid differential equation format');
    }
  } else if (typeof equation === 'function') {
    rhsFunction = equation;
  } else {
    throw new Error('Equation must be a string or function');
  }
  
  // Implement 4th-order Runge-Kutta method
  function rungeKutta4(f, x0, y0, x, h) {
    const n = Math.floor((x - x0) / h);
    let x_i = x0;
    let y_i = y0;
    
    for (let i = 0; i < n; i++) {
      const k1 = h * f(x_i, y_i);
      const k2 = h * f(x_i + h/2, y_i + k1/2);
      const k3 = h * f(x_i + h/2, y_i + k2/2);
      const k4 = h * f(x_i + h, y_i + k3);
      
      y_i = y_i + (k1 + 2*k2 + 2*k3 + k4) / 6;
      x_i = x_i + h;
    }
    
    return y_i;
  }
  
  // Solve for each evaluation point
  const solution = [];
  const stepSize = 0.01; // Can be adjusted for accuracy/performance
  
  solution.push([initialPoint, initialValue]);
  
  for (const point of evaluationPoints) {
    if (point <= initialPoint) {
      throw new Error('Evaluation points must be greater than the initial point');
    }
    
    const y = rungeKutta4(
      (x, y) => rhsFunction(x, y),
      initialPoint,
      initialValue,
      point,
      stepSize
    );
    
    solution.push([point, y]);
  }
  
  return solution;
};

/**
 * Solve systems of ordinary differential equations numerically
 * @param {Array<string|Function>} equations - Array of differential equations
 * @param {Array<string>} variables - Array of variable names
 * @param {number} initialPoint - The initial point of the independent variable
 * @param {Array<number>} initialValues - Array of initial values for each dependent variable
 * @param {Array<number>} evaluationPoints - Points at which to evaluate the solution
 * @returns {Array<Array<number>>} - Array of [x, y1, y2, ...] points representing the solution
 */
differential.solveSystemOfODEs = function(equations, variables, initialPoint, initialValues, evaluationPoints) {
  if (equations.length !== variables.length - 1) {
    throw new Error('Number of equations must match number of dependent variables');
  }
  
  if (initialValues.length !== variables.length - 1) {
    throw new Error('Number of initial values must match number of dependent variables');
  }
  
  // Extract the independent variable (first in the variables array)
  const independentVar = variables[0];
  const dependentVars = variables.slice(1);
  
  // Parse equations and create functions
  const funcs = equations.map((eq, i) => {
    if (typeof eq === 'function') {
      return eq;
    } else if (typeof eq === 'string') {
      const rhsMatch = eq.match(/[^=]+=(.+)/);
      if (rhsMatch) {
        const rhs = rhsMatch[1].trim();
        // Create a function from the RHS expression
        return new Function(...variables, `return ${rhs.replace(/\^/g, '**')};`);
      } else {
        throw new Error(`Invalid equation format for equation ${i+1}`);
      }
    } else {
      throw new Error(`Equation ${i+1} must be a string or function`);
    }
  });
  
  // Implement 4th-order Runge-Kutta method for systems
  function rungeKutta4System(funcs, x0, y0s, x, h) {
    const n = Math.floor((x - x0) / h);
    let x_i = x0;
    let y_is = [...y0s];
    
    for (let i = 0; i < n; i++) {
      const k1s = funcs.map((f, j) => h * f(x_i, ...y_is));
      
      const y_temp1 = y_is.map((y, j) => y + k1s[j]/2);
      const k2s = funcs.map((f, j) => h * f(x_i + h/2, ...y_temp1));
      
      const y_temp2 = y_is.map((y, j) => y + k2s[j]/2);
      const k3s = funcs.map((f, j) => h * f(x_i + h/2, ...y_temp2));
      
      const y_temp3 = y_is.map((y, j) => y + k3s[j]);
      const k4s = funcs.map((f, j) => h * f(x_i + h, ...y_temp3));
      
      y_is = y_is.map((y, j) => y + (k1s[j] + 2*k2s[j] + 2*k3s[j] + k4s[j]) / 6);
      x_i = x_i + h;
    }
    
    return y_is;
  }
  
  // Solve for each evaluation point
  const solution = [];
  const stepSize = 0.01; // Can be adjusted for accuracy/performance
  
  solution.push([initialPoint, ...initialValues]);
  
  for (const point of evaluationPoints) {
    if (point <= initialPoint) {
      throw new Error('Evaluation points must be greater than the initial point');
    }
    
    const ys = rungeKutta4System(
      funcs,
      initialPoint,
      initialValues,
      point,
      stepSize
    );
    
    solution.push([point, ...ys]);
  }
  
  return solution;
};

/**
 * Solve partial differential equations using finite difference methods
 * @param {string|Function} equation - The PDE
 * @param {Object} options - Configuration options
 * @returns {Array<Array<number>>} - Solution grid
 */
differential.solvePDE = function(equation, options) {
  // This is a placeholder for a more complex implementation
  // Solving PDEs requires specialized numerical methods like finite differences,
  // finite elements, or spectral methods
  
  // For demonstration, we'll return a placeholder
  return `Numerical solution of ${equation}`;
};

/**
 * Compute the Jacobian matrix of a vector-valued function
 * @param {Array<string|Function>} functions - Array of functions
 * @param {Array<string>} variables - Array of variable names
 * @param {Array<number>} point - Point at which to evaluate the Jacobian
 * @returns {Array<Array<number>>} - The Jacobian matrix
 */
differential.jacobian = function(functions, variables, point) {
  if (functions.length === 0 || variables.length === 0) {
    throw new Error('Functions and variables arrays cannot be empty');
  }
  
  if (point.length !== variables.length) {
    throw new Error('Point dimension must match number of variables');
  }
  
  // Convert string functions to actual functions
  const funcs = functions.map(f => {
    if (typeof f === 'function') {
      return f;
    } else if (typeof f === 'string') {
      return new Function(...variables, `return ${f.replace(/\^/g, '**')};`);
    } else {
      throw new Error('Functions must be strings or function objects');
    }
  });
  
  // Compute the Jacobian matrix using numerical differentiation
  const h = 1e-6; // Small step for numerical differentiation
  const jacobianMatrix = [];
  
  for (let i = 0; i < funcs.length; i++) {
    jacobianMatrix[i] = [];
    
    for (let j = 0; j < variables.length; j++) {
      // Create points for forward and backward differences
      const forwardPoint = [...point];
      const backwardPoint = [...point];
      
      forwardPoint[j] += h;
      backwardPoint[j] -= h;
      
      // Compute partial derivative using central difference
      const forwardValue = funcs[i](...forwardPoint);
      const backwardValue = funcs[i](...backwardPoint);
      
      jacobianMatrix[i][j] = (forwardValue - backwardValue) / (2 * h);
    }
  }
  
  return jacobianMatrix;
};

/**
 * Compute the gradient of a scalar function
 * @param {string|Function} func - The scalar function
 * @param {Array<string>} variables - Array of variable names
 * @param {Array<number>} point - Point at which to evaluate the gradient
 * @returns {Array<number>} - The gradient vector
 */
differential.gradient = function(func, variables, point) {
  // The gradient is just the Jacobian of a scalar function
  return differential.jacobian([func], variables, point)[0];
};

/**
 * Compute the divergence of a vector field
 * @param {Array<string|Function>} vectorField - Components of the vector field
 * @param {Array<string>} variables - Coordinate variables
 * @param {Array<number>} point - Point at which to evaluate the divergence
 * @returns {number} - The divergence at the given point
 */
differential.divergence = function(vectorField, variables, point) {
  if (vectorField.length !== variables.length) {
    throw new Error('Vector field dimension must match number of variables');
  }
  
  // Compute the Jacobian matrix
  const jacobianMatrix = differential.jacobian(vectorField, variables, point);
  
  // The divergence is the trace of the Jacobian matrix
  let divergence = 0;
  for (let i = 0; i < variables.length; i++) {
    divergence += jacobianMatrix[i][i];
  }
  
  return divergence;
};

/**
 * Compute the curl of a 3D vector field
 * @param {Array<string|Function>} vectorField - Components of the vector field (must be 3D)
 * @param {Array<string>} variables - Coordinate variables (must be 3D)
 * @param {Array<number>} point - Point at which to evaluate the curl
 * @returns {Array<number>} - The curl vector at the given point
 */
differential.curl = function(vectorField, variables, point) {
  if (vectorField.length !== 3 || variables.length !== 3) {
    throw new Error('Curl is only defined for 3D vector fields');
  }
  
  // Compute the Jacobian matrix
  const jacobianMatrix = differential.jacobian(vectorField, variables, point);
  
  // Compute the curl using the Jacobian
  const curl = [
    jacobianMatrix[2][1] - jacobianMatrix[1][2], // dF3/dy - dF2/dz
    jacobianMatrix[0][2] - jacobianMatrix[2][0], // dF1/dz - dF3/dx
    jacobianMatrix[1][0] - jacobianMatrix[0][1]  // dF2/dx - dF1/dy
  ];
  
  return curl;
};

module.exports = differential;