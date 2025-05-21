/**
 * Automatic differentiation module for herta.js
 * Provides capabilities beyond what math.js can offer
 */

const Complex = require('complex.js');

// Automatic differentiation module
const autodiff = {};

/**
 * Class representing a variable in automatic differentiation
 */
class ADVariable {
  /**
   * Create a new variable for automatic differentiation
   * @param {number} value - The value of the variable
   * @param {number|Array} gradient - The gradient (derivative) value or array
   */
  constructor(value, gradient) {
    this.value = value;
    this.gradient = gradient;
  }

  /**
   * Addition operation
   * @param {ADVariable|number} other - The other operand
   * @returns {ADVariable} - Result of addition
   */
  add(other) {
    const otherValue = other instanceof ADVariable ? other.value : other;
    const otherGradient = other instanceof ADVariable ? other.gradient : 0;

    if (Array.isArray(this.gradient) && Array.isArray(otherGradient)) {
      return new ADVariable(
        this.value + otherValue,
        this.gradient.map((g, i) => g + otherGradient[i])
      );
    }
    return new ADVariable(
      this.value + otherValue,
      this.gradient + otherGradient
    );
  }

  /**
   * Subtraction operation
   * @param {ADVariable|number} other - The other operand
   * @returns {ADVariable} - Result of subtraction
   */
  subtract(other) {
    const otherValue = other instanceof ADVariable ? other.value : other;
    const otherGradient = other instanceof ADVariable ? other.gradient : 0;

    if (Array.isArray(this.gradient) && Array.isArray(otherGradient)) {
      return new ADVariable(
        this.value - otherValue,
        this.gradient.map((g, i) => g - otherGradient[i])
      );
    }
    return new ADVariable(
      this.value - otherValue,
      this.gradient - otherGradient
    );
  }

  /**
   * Multiplication operation
   * @param {ADVariable|number} other - The other operand
   * @returns {ADVariable} - Result of multiplication
   */
  multiply(other) {
    const otherValue = other instanceof ADVariable ? other.value : other;
    const otherGradient = other instanceof ADVariable ? other.gradient : 0;

    if (Array.isArray(this.gradient) && Array.isArray(otherGradient)) {
      return new ADVariable(
        this.value * otherValue,
        this.gradient.map((g, i) => g * otherValue + this.value * otherGradient[i])
      );
    }
    return new ADVariable(
      this.value * otherValue,
      this.gradient * otherValue + this.value * otherGradient
    );
  }

  /**
   * Division operation
   * @param {ADVariable|number} other - The other operand
   * @returns {ADVariable} - Result of division
   */
  divide(other) {
    const otherValue = other instanceof ADVariable ? other.value : other;
    const otherGradient = other instanceof ADVariable ? other.gradient : 0;

    if (otherValue === 0) {
      throw new Error('Division by zero');
    }

    if (Array.isArray(this.gradient) && Array.isArray(otherGradient)) {
      return new ADVariable(
        this.value / otherValue,
        this.gradient.map((g, i) => (
          (g * otherValue - this.value * otherGradient[i]) / (otherValue * otherValue)
        ))
      );
    }
    return new ADVariable(
      this.value / otherValue,
      (this.gradient * otherValue - this.value * otherGradient) / (otherValue * otherValue)
    );
  }

  /**
   * Power operation
   * @param {ADVariable|number} other - The exponent
   * @returns {ADVariable} - Result of exponentiation
   */
  pow(other) {
    const otherValue = other instanceof ADVariable ? other.value : other;
    const otherGradient = other instanceof ADVariable ? other.gradient : 0;

    const result = this.value ** otherValue;

    if (Array.isArray(this.gradient) && Array.isArray(otherGradient)) {
      return new ADVariable(
        result,
        this.gradient.map((g, i) => (
          result * (otherValue * g / this.value + otherGradient[i] * Math.log(this.value))
        ))
      );
    }
    return new ADVariable(
      result,
      result * (otherValue * this.gradient / this.value + otherGradient * Math.log(this.value))
    );
  }

  /**
   * Sine operation
   * @returns {ADVariable} - Result of sine
   */
  sin() {
    if (Array.isArray(this.gradient)) {
      return new ADVariable(
        Math.sin(this.value),
        this.gradient.map((g) => g * Math.cos(this.value))
      );
    }
    return new ADVariable(
      Math.sin(this.value),
      this.gradient * Math.cos(this.value)
    );
  }

  /**
   * Cosine operation
   * @returns {ADVariable} - Result of cosine
   */
  cos() {
    if (Array.isArray(this.gradient)) {
      return new ADVariable(
        Math.cos(this.value),
        this.gradient.map((g) => -g * Math.sin(this.value))
      );
    }
    return new ADVariable(
      Math.cos(this.value),
      -this.gradient * Math.sin(this.value)
    );
  }

  /**
   * Exponential operation
   * @returns {ADVariable} - Result of exponential
   */
  exp() {
    const result = Math.exp(this.value);

    if (Array.isArray(this.gradient)) {
      return new ADVariable(
        result,
        this.gradient.map((g) => g * result)
      );
    }
    return new ADVariable(
      result,
      this.gradient * result
    );
  }

  /**
   * Natural logarithm operation
   * @returns {ADVariable} - Result of logarithm
   */
  log() {
    if (this.value <= 0) {
      throw new Error('Logarithm of non-positive number');
    }

    if (Array.isArray(this.gradient)) {
      return new ADVariable(
        Math.log(this.value),
        this.gradient.map((g) => g / this.value)
      );
    }
    return new ADVariable(
      Math.log(this.value),
      this.gradient / this.value
    );
  }
}

/**
 * Class representing a function for automatic differentiation
 */
class ADFunction {
  /**
   * Create a new function for automatic differentiation
   * @param {string|Function} expr - The expression or function
   * @param {Array<string>} variables - The variable names
   */
  constructor(expr, variables) {
    this.expr = expr;
    this.variables = variables;
    this.func = this._parseExpression(expr);
  }

  /**
   * Parse the expression into a function
   * @param {string|Function} expr - The expression or function
   * @returns {Function} - The parsed function
   * @private
   */
  _parseExpression(expr) {
    if (typeof expr === 'function') {
      return expr;
    } if (typeof expr === 'string') {
      // Simple expression parser (would be more complex in production)
      // Replace common operations with their JavaScript equivalents
      const jsExpr = expr
        .replace(/\^/g, '**') // Replace ^ with **
        .replace(/sin\(/g, 'Math.sin(') // Replace sin with Math.sin
        .replace(/cos\(/g, 'Math.cos(') // Replace cos with Math.cos
        .replace(/tan\(/g, 'Math.tan(') // Replace tan with Math.tan
        .replace(/exp\(/g, 'Math.exp(') // Replace exp with Math.exp
        .replace(/log\(/g, 'Math.log(') // Replace log with Math.log
        .replace(/sqrt\(/g, 'Math.sqrt(') // Replace sqrt with Math.sqrt
        .replace(/pi/g, 'Math.PI') // Replace pi with Math.PI
        .replace(/e(?![a-zA-Z])/g, 'Math.E'); // Replace e with Math.E (but not in variable names)

      return new Function(...this.variables, `return ${jsExpr};`);
    }
    throw new Error('Expression must be a string or function');
  }

  /**
   * Evaluate the function at a point
   * @param {Array<number>} point - The point at which to evaluate
   * @returns {number} - The function value
   */
  evaluate(point) {
    if (point.length !== this.variables.length) {
      throw new Error('Point dimension must match number of variables');
    }

    return this.func(...point);
  }

  /**
   * Compute the gradient at a point
   * @param {Array<number>} point - The point at which to compute the gradient
   * @returns {Array<number>} - The gradient vector
   */
  gradient(point) {
    if (point.length !== this.variables.length) {
      throw new Error('Point dimension must match number of variables');
    }

    const gradient = [];

    for (let i = 0; i < this.variables.length; i++) {
      // Create AD variables for each input
      const adInputs = point.map((val, j) =>
        // Set gradient to 1 for the variable we're differentiating with respect to
        new ADVariable(val, i === j ? 1 : 0));

      // Evaluate the function with AD variables
      const result = this._evaluateWithAD(adInputs);

      // Extract the gradient
      gradient.push(result.gradient);
    }

    return gradient;
  }

  /**
   * Compute the Hessian matrix at a point
   * @param {Array<number>} point - The point at which to compute the Hessian
   * @returns {Array<Array<number>>} - The Hessian matrix
   */
  hessian(point) {
    if (point.length !== this.variables.length) {
      throw new Error('Point dimension must match number of variables');
    }

    const n = this.variables.length;
    const hessian = Array(n).fill().map(() => Array(n).fill(0));

    // Compute the Hessian using finite differences on the gradient
    // This is a simple approximation; a full implementation would use
    // second-order automatic differentiation

    const h = 1e-6; // Small step for numerical differentiation
    const baseGradient = this.gradient(point);

    for (let i = 0; i < n; i++) {
      const forwardPoint = [...point];
      forwardPoint[i] += h;

      const forwardGradient = this.gradient(forwardPoint);

      for (let j = 0; j < n; j++) {
        hessian[i][j] = (forwardGradient[j] - baseGradient[j]) / h;
      }
    }

    // Make the Hessian symmetric (it should be theoretically, but numerical errors can occur)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const avg = (hessian[i][j] + hessian[j][i]) / 2;
        hessian[i][j] = hessian[j][i] = avg;
      }
    }

    return hessian;
  }

  /**
   * Evaluate the function with automatic differentiation variables
   * @param {Array<ADVariable>} adInputs - The AD input variables
   * @returns {ADVariable} - The AD result
   * @private
   */
  _evaluateWithAD(adInputs) {
    // This is a simplified implementation
    // In a full implementation, we would need to overload all operations
    // to work with AD variables

    // For demonstration, we'll use a simple approach with finite differences
    const point = adInputs.map((v) => v.value);
    const f0 = this.evaluate(point);

    const gradient = adInputs.map((v, i) => {
      if (v.gradient === 1) {
        const h = 1e-6; // Small step for numerical differentiation
        const forwardPoint = [...point];
        forwardPoint[i] += h;

        const f1 = this.evaluate(forwardPoint);
        return (f1 - f0) / h;
      }
      return 0;
    });

    return new ADVariable(f0, gradient.reduce((sum, g) => sum + g, 0));
  }
}

/**
 * Create a function for automatic differentiation
 * @param {string|Function} expr - The expression or function
 * @param {Array<string>} variables - The variable names
 * @returns {ADFunction} - The AD function
 */
autodiff.createFunction = function (expr, variables) {
  return new ADFunction(expr, variables);
};

/**
 * Compute the gradient of a function at a point
 * @param {string|Function} expr - The expression or function
 * @param {Array<string>} variables - The variable names
 * @param {Array<number>} point - The point at which to compute the gradient
 * @returns {Array<number>} - The gradient vector
 */
autodiff.gradient = function (expr, variables, point) {
  const func = autodiff.createFunction(expr, variables);
  return func.gradient(point);
};

/**
 * Compute the Hessian matrix of a function at a point
 * @param {string|Function} expr - The expression or function
 * @param {Array<string>} variables - The variable names
 * @param {Array<number>} point - The point at which to compute the Hessian
 * @returns {Array<Array<number>>} - The Hessian matrix
 */
autodiff.hessian = function (expr, variables, point) {
  const func = autodiff.createFunction(expr, variables);
  return func.hessian(point);
};

/**
 * Compute the Jacobian matrix of a vector-valued function at a point
 * @param {Array<string|Function>} exprs - The expressions or functions
 * @param {Array<string>} variables - The variable names
 * @param {Array<number>} point - The point at which to compute the Jacobian
 * @returns {Array<Array<number>>} - The Jacobian matrix
 */
autodiff.jacobian = function (exprs, variables, point) {
  const jacobian = [];

  for (const expr of exprs) {
    const func = autodiff.createFunction(expr, variables);
    jacobian.push(func.gradient(point));
  }

  return jacobian;
};

/**
 * Perform gradient descent optimization
 * @param {string|Function} expr - The objective function to minimize
 * @param {Array<string>} variables - The variable names
 * @param {Array<number>} initialPoint - The starting point
 * @param {Object} options - Optimization options
 * @returns {Object} - The optimization result
 */
autodiff.gradientDescent = function (expr, variables, initialPoint, options = {}) {
  const func = autodiff.createFunction(expr, variables);

  const {
    maxIterations = 1000,
    learningRate = 0.01,
    tolerance = 1e-6
  } = options;

  let point = [...initialPoint];
  let value = func.evaluate(point);
  let iteration = 0;

  while (iteration < maxIterations) {
    // Compute gradient
    const gradient = func.gradient(point);

    // Check convergence
    const gradientNorm = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));
    if (gradientNorm < tolerance) {
      break;
    }

    // Update point
    point = point.map((p, i) => p - learningRate * gradient[i]);

    // Evaluate function at new point
    const newValue = func.evaluate(point);

    // Check if function value decreased
    if (Math.abs(newValue - value) < tolerance) {
      break;
    }

    value = newValue;
    iteration++;
  }

  return {
    point,
    value,
    iterations: iteration,
    converged: iteration < maxIterations
  };
};

module.exports = autodiff;
