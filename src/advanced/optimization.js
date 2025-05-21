/**
 * Optimization module for herta.js
 * Provides various optimization algorithms and techniques
 */

const Decimal = require('decimal.js');
const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const optimization = {};

/**
 * Gradient descent optimization algorithm
 * @param {Function} costFunction - Cost function to minimize f(x)
 * @param {Function} gradientFunction - Gradient of the cost function ∇f(x)
 * @param {Array} initialPoint - Starting point for optimization
 * @param {Object} options - Optimization options
 * @param {number} [options.learningRate=0.01] - Step size for gradient descent
 * @param {number} [options.maxIterations=1000] - Maximum number of iterations
 * @param {number} [options.tolerance=1e-6] - Convergence tolerance
 * @returns {Object} - Result containing optimized point and convergence info
 */
optimization.gradientDescent = function(costFunction, gradientFunction, initialPoint, options = {}) {
  const learningRate = options.learningRate || 0.01;
  const maxIterations = options.maxIterations || 1000;
  const tolerance = options.tolerance || 1e-6;
  
  let currentPoint = [...initialPoint];
  let iteration = 0;
  let currentCost = costFunction(currentPoint);
  let converged = false;
  const costs = [currentCost];
  
  while (iteration < maxIterations && !converged) {
    const gradient = gradientFunction(currentPoint);
    
    // Update point: x = x - learningRate * gradient
    const newPoint = currentPoint.map((xi, i) => xi - learningRate * gradient[i]);
    const newCost = costFunction(newPoint);
    costs.push(newCost);
    
    // Check convergence
    const improvement = Math.abs(currentCost - newCost);
    if (improvement < tolerance) {
      converged = true;
    }
    
    currentPoint = newPoint;
    currentCost = newCost;
    iteration++;
  }
  
  return {
    point: currentPoint,
    value: currentCost,
    iterations: iteration,
    converged: converged,
    costs: costs
  };
};

/**
 * Stochastic gradient descent with momentum
 * @param {Function} costFunction - Cost function that takes point and data index
 * @param {Function} gradientFunction - Gradient function that takes point and data index
 * @param {Array} initialPoint - Starting point
 * @param {number} dataSize - Size of the dataset
 * @param {Object} options - Optimization options
 * @returns {Object} - Optimization result
 */
optimization.sgdWithMomentum = function(costFunction, gradientFunction, initialPoint, dataSize, options = {}) {
  const learningRate = options.learningRate || 0.01;
  const momentum = options.momentum || 0.9;
  const maxIterations = options.maxIterations || 1000;
  const batchSize = options.batchSize || 32;
  
  let currentPoint = [...initialPoint];
  let velocity = Array(currentPoint.length).fill(0);
  const costs = [];
  
  for (let epoch = 0; epoch < maxIterations; epoch++) {
    // Shuffle data indices
    const indices = Array.from({length: dataSize}, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Process in mini-batches
    for (let i = 0; i < dataSize; i += batchSize) {
      const batchIndices = indices.slice(i, i + batchSize);
      const batchGradients = [];
      
      // Compute gradients for batch
      for (const idx of batchIndices) {
        batchGradients.push(gradientFunction(currentPoint, idx));
      }
      
      // Average gradients
      const avgGradient = batchGradients.reduce((acc, g) => {
        return acc.map((v, i) => v + g[i] / batchGradients.length);
      }, Array(currentPoint.length).fill(0));
      
      // Update with momentum
      velocity = velocity.map((v, i) => momentum * v - learningRate * avgGradient[i]);
      currentPoint = currentPoint.map((p, i) => p + velocity[i]);
    }
    
    costs.push(costFunction(currentPoint));
  }
  
  return {
    point: currentPoint,
    value: costFunction(currentPoint),
    iterations: maxIterations,
    costs: costs
  };
};

/**
 * Newton's method for optimization
 * @param {Function} costFunction - Cost function to minimize
 * @param {Function} gradientFunction - Gradient of the cost function
 * @param {Function} hessianFunction - Hessian (matrix of second derivatives)
 * @param {Array} initialPoint - Starting point
 * @param {Object} options - Optimization options
 * @returns {Object} - Optimization result
 */
optimization.newtonMethod = function(costFunction, gradientFunction, hessianFunction, initialPoint, options = {}) {
  const maxIterations = options.maxIterations || 100;
  const tolerance = options.tolerance || 1e-6;
  
  let currentPoint = [...initialPoint];
  let iteration = 0;
  let converged = false;
  const costs = [];
  
  while (iteration < maxIterations && !converged) {
    const gradient = gradientFunction(currentPoint);
    const hessian = hessianFunction(currentPoint);
    
    // Calculate step: dx = -H^(-1) * gradient
    const hessianInverse = matrix.inverse(hessian);
    const step = matrix.multiply(hessianInverse, gradient.map(g => -g));
    
    // Update: x = x + dx
    const newPoint = currentPoint.map((x, i) => x + step[i]);
    
    const currentCost = costFunction(currentPoint);
    const newCost = costFunction(newPoint);
    costs.push(newCost);
    
    // Check convergence
    const improvement = Math.abs(currentCost - newCost);
    if (improvement < tolerance) {
      converged = true;
    }
    
    currentPoint = newPoint;
    iteration++;
  }
  
  return {
    point: currentPoint,
    value: costFunction(currentPoint),
    iterations: iteration,
    converged: converged,
    costs: costs
  };
};

/**
 * Implement linear programming using Simplex method
 * @param {Array} objectiveCoefficients - Coefficients of the objective function to maximize
 * @param {Array} constraints - Array of constraint objects {coefficients, limit, type}
 * @param {Object} options - Optimization options
 * @returns {Object} - Optimization result
 */
optimization.linearProgramming = function(objectiveCoefficients, constraints, options = {}) {
  // Note: This is a simplified version of the Simplex algorithm
  // A full implementation would be more complex
  
  const maxIterations = options.maxIterations || 1000;
  const n = objectiveCoefficients.length; // Number of variables
  const m = constraints.length; // Number of constraints
  
  // Create tableau
  const tableau = [];
  
  // Objective function row (negative for maximization problem)
  const objectiveRow = [0, ...objectiveCoefficients.map(c => -c)];
  for (let i = 0; i < m; i++) {
    objectiveRow.push(0);
  }
  tableau.push(objectiveRow);
  
  // Constraint rows
  for (let i = 0; i < m; i++) {
    const row = [constraints[i].limit];
    for (let j = 0; j < n; j++) {
      row.push(constraints[i].coefficients[j]);
    }
    
    // Add slack variables
    for (let j = 0; j < m; j++) {
      row.push(i === j ? 1 : 0);
    }
    
    tableau.push(row);
  }
  
  // Perform simplex iterations
  let iteration = 0;
  while (iteration < maxIterations) {
    // Find the pivot column (most negative coefficient in objective row)
    let pivotCol = -1;
    let minCoeff = 0;
    for (let j = 1; j < tableau[0].length; j++) {
      if (tableau[0][j] < minCoeff) {
        minCoeff = tableau[0][j];
        pivotCol = j;
      }
    }
    
    // If no negative coefficients, we're done
    if (pivotCol === -1) break;
    
    // Find pivot row (minimum ratio test)
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 1; i < tableau.length; i++) {
      if (tableau[i][pivotCol] > 0) {
        const ratio = tableau[i][0] / tableau[i][pivotCol];
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }
    
    // If no suitable pivot found, problem is unbounded
    if (pivotRow === -1) {
      return { status: 'unbounded' };
    }
    
    // Pivot operation
    const pivotValue = tableau[pivotRow][pivotCol];
    
    // Scale pivot row
    for (let j = 0; j < tableau[pivotRow].length; j++) {
      tableau[pivotRow][j] /= pivotValue;
    }
    
    // Update other rows
    for (let i = 0; i < tableau.length; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        for (let j = 0; j < tableau[i].length; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }
    
    iteration++;
  }
  
  // Extract solution
  const solution = Array(n).fill(0);
  const basicVars = Array(m).fill(-1);
  
  // Identify basic variables
  for (let j = 1; j <= n; j++) {
    let basicVarRow = -1;
    let count = 0;
    
    for (let i = 1; i < tableau.length; i++) {
      if (Math.abs(tableau[i][j] - 1) < 1e-10) {
        count++;
        basicVarRow = i;
      } else if (Math.abs(tableau[i][j]) > 1e-10) {
        count++;
      }
    }
    
    if (count === 1 && basicVarRow !== -1) {
      basicVars[basicVarRow - 1] = j - 1;
      solution[j - 1] = tableau[basicVarRow][0];
    }
  }
  
  return {
    status: 'optimal',
    solution: solution,
    objectiveValue: -tableau[0][0],
    tableau: tableau
  };
};

/**
 * Particle Swarm Optimization (PSO)
 * @param {Function} costFunction - Function to optimize
 * @param {Array} bounds - Bounds for each dimension [[min1, max1], [min2, max2], ...]
 * @param {Object} options - PSO options
 * @returns {Object} - Optimization result
 */
optimization.particleSwarm = function(costFunction, bounds, options = {}) {
  const numParticles = options.numParticles || 30;
  const dimensions = bounds.length;
  const maxIterations = options.maxIterations || 100;
  const inertiaWeight = options.inertiaWeight || 0.7;
  const cognitiveWeight = options.cognitiveWeight || 1.5;
  const socialWeight = options.socialWeight || 1.5;
  
  // Initialize particles
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    // Random position within bounds
    const position = bounds.map(([min, max]) => min + Math.random() * (max - min));
    // Random velocity
    const velocity = bounds.map(([min, max]) => (Math.random() - 0.5) * (max - min) * 0.1);
    // Best position for this particle is initially its starting position
    const personalBest = [...position];
    const personalBestValue = costFunction(position);
    
    particles.push({
      position,
      velocity,
      personalBest,
      personalBestValue
    });
  }
  
  // Track global best
  let globalBest = [...particles[0].personalBest];
  let globalBestValue = particles[0].personalBestValue;
  
  for (let i = 1; i < particles.length; i++) {
    if (particles[i].personalBestValue < globalBestValue) {
      globalBestValue = particles[i].personalBestValue;
      globalBest = [...particles[i].personalBest];
    }
  }
  
  // Main PSO loop
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    for (let i = 0; i < numParticles; i++) {
      const particle = particles[i];
      
      // Update velocity
      for (let d = 0; d < dimensions; d++) {
        // Cognitive component (personal best)
        const cognitive = cognitiveWeight * Math.random() * (particle.personalBest[d] - particle.position[d]);
        // Social component (global best)
        const social = socialWeight * Math.random() * (globalBest[d] - particle.position[d]);
        // Update velocity with inertia
        particle.velocity[d] = inertiaWeight * particle.velocity[d] + cognitive + social;
      }
      
      // Update position
      for (let d = 0; d < dimensions; d++) {
        particle.position[d] += particle.velocity[d];
        // Bound check
        particle.position[d] = Math.max(bounds[d][0], Math.min(bounds[d][1], particle.position[d]));
      }
      
      // Evaluate new position
      const value = costFunction(particle.position);
      
      // Update personal best
      if (value < particle.personalBestValue) {
        particle.personalBestValue = value;
        particle.personalBest = [...particle.position];
        
        // Update global best
        if (value < globalBestValue) {
          globalBestValue = value;
          globalBest = [...particle.position];
        }
      }
    }
  }
  
  return {
    solution: globalBest,
    value: globalBestValue
  };
};

/**
 * Simulated Annealing optimization algorithm
 * @param {Function} costFunction - Function to minimize
 * @param {Function} neighborFunction - Function that generates a neighboring solution
 * @param {Array} initialSolution - Starting solution
 * @param {Object} options - Annealing options
 * @returns {Object} - Optimization result
 */
optimization.simulatedAnnealing = function(costFunction, neighborFunction, initialSolution, options = {}) {
  const maxIterations = options.maxIterations || 1000;
  const initialTemperature = options.initialTemperature || 100;
  const coolingRate = options.coolingRate || 0.95;
  const minTemperature = options.minTemperature || 1e-6;
  
  let currentSolution = [...initialSolution];
  let currentCost = costFunction(currentSolution);
  let bestSolution = [...currentSolution];
  let bestCost = currentCost;
  let temperature = initialTemperature;
  
  const costs = [currentCost];
  const temperatures = [initialTemperature];
  
  for (let i = 0; i < maxIterations && temperature > minTemperature; i++) {
    // Generate neighbor solution
    const newSolution = neighborFunction(currentSolution, temperature);
    const newCost = costFunction(newSolution);
    
    // Calculate acceptance probability
    let acceptanceProbability = 1;
    if (newCost > currentCost) {
      acceptanceProbability = Math.exp((currentCost - newCost) / temperature);
    }
    
    // Accept or reject new solution
    if (Math.random() < acceptanceProbability) {
      currentSolution = [...newSolution];
      currentCost = newCost;
      
      // Update best solution if needed
      if (newCost < bestCost) {
        bestSolution = [...newSolution];
        bestCost = newCost;
      }
    }
    
    // Cool down
    temperature *= coolingRate;
    temperatures.push(temperature);
    costs.push(currentCost);
  }
  
  return {
    solution: bestSolution,
    cost: bestCost,
    history: {
      costs: costs,
      temperatures: temperatures
    }
  };
};

/**
 * Genetic Algorithm optimization
 * @param {Function} fitnessFunction - Function that evaluates fitness of a solution (higher is better)
 * @param {Function} createIndividual - Function that creates a random individual
 * @param {Function} crossover - Function that performs crossover between two parents
 * @param {Function} mutate - Function that mutates an individual
 * @param {Object} options - Genetic algorithm options
 * @returns {Object} - Optimization result
 */
optimization.geneticAlgorithm = function(fitnessFunction, createIndividual, crossover, mutate, options = {}) {
  const populationSize = options.populationSize || 100;
  const maxGenerations = options.maxGenerations || 100;
  const crossoverRate = options.crossoverRate || 0.8;
  const mutationRate = options.mutationRate || 0.1;
  const elitism = options.elitism || true;
  const tournamentSize = options.tournamentSize || 5;
  
  // Initialize population
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(createIndividual());
  }
  
  // Evaluate initial population
  let fitnesses = population.map(individual => fitnessFunction(individual));
  
  // Track best solution over generations
  let bestIndividual = [...population[fitnesses.indexOf(Math.max(...fitnesses))]];
  let bestFitness = Math.max(...fitnesses);
  
  const fitnessHistory = [bestFitness];
  
  // Generational loop
  for (let generation = 0; generation < maxGenerations; generation++) {
    const newPopulation = [];
    
    // Elitism: preserve best individual
    if (elitism) {
      newPopulation.push([...bestIndividual]);
    }
    
    // Create new individuals until we fill the population
    while (newPopulation.length < populationSize) {
      // Tournament selection for parents
      const parent1 = tournamentSelect(population, fitnesses, tournamentSize);
      const parent2 = tournamentSelect(population, fitnesses, tournamentSize);
      
      // Crossover
      let child1, child2;
      if (Math.random() < crossoverRate) {
        [child1, child2] = crossover(parent1, parent2);
      } else {
        child1 = [...parent1];
        child2 = [...parent2];
      }
      
      // Mutation
      if (Math.random() < mutationRate) {
        child1 = mutate(child1);
      }
      if (Math.random() < mutationRate) {
        child2 = mutate(child2);
      }
      
      newPopulation.push(child1);
      if (newPopulation.length < populationSize) {
        newPopulation.push(child2);
      }
    }
    
    // Replace population
    population = newPopulation;
    
    // Evaluate new population
    fitnesses = population.map(individual => fitnessFunction(individual));
    
    // Update best solution
    const genBestIndex = fitnesses.indexOf(Math.max(...fitnesses));
    if (fitnesses[genBestIndex] > bestFitness) {
      bestIndividual = [...population[genBestIndex]];
      bestFitness = fitnesses[genBestIndex];
    }
    
    fitnessHistory.push(bestFitness);
  }
  
  return {
    solution: bestIndividual,
    fitness: bestFitness,
    fitnessHistory: fitnessHistory
  };
  
  // Helper function for tournament selection
  function tournamentSelect(population, fitnesses, tournamentSize) {
    const indices = [];
    for (let i = 0; i < tournamentSize; i++) {
      indices.push(Math.floor(Math.random() * population.length));
    }
    
    let bestIndex = indices[0];
    for (let i = 1; i < indices.length; i++) {
      if (fitnesses[indices[i]] > fitnesses[bestIndex]) {
        bestIndex = indices[i];
      }
    }
    
    return population[bestIndex];
  }
};

/**
 * Differential Evolution optimization algorithm
 * @param {Function} costFunction - Function to minimize
 * @param {Array} bounds - Bounds for each dimension [[min1, max1], [min2, max2], ...]
 * @param {Object} options - DE options
 * @returns {Object} - Optimization result
 */
optimization.differentialEvolution = function(costFunction, bounds, options = {}) {
  const populationSize = options.populationSize || 10 * bounds.length; // Default: 10*dimension
  const maxGenerations = options.maxGenerations || 1000;
  const F = options.scalingFactor || 0.8; // Differential weight
  const CR = options.crossoverRate || 0.9; // Crossover probability
  
  // Initialize population within bounds
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    const individual = bounds.map(([min, max]) => min + Math.random() * (max - min));
    population.push(individual);
  }
  
  // Evaluate initial population
  let costs = population.map(individual => costFunction(individual));
  
  // Track best solution
  let bestIndex = costs.indexOf(Math.min(...costs));
  let bestSolution = [...population[bestIndex]];
  let bestCost = costs[bestIndex];
  
  const costHistory = [bestCost];
  
  // Generation loop
  for (let generation = 0; generation < maxGenerations; generation++) {
    // Create new population
    const newPopulation = [];
    const newCosts = [];
    
    for (let i = 0; i < populationSize; i++) {
      // Select three random distinct individuals different from current
      const [a, b, c] = selectThreeIndices(populationSize, i);
      
      // Create mutant vector through differential mutation
      const mutant = population[a].map((x, j) => 
        x + F * (population[b][j] - population[c][j])
      );
      
      // Ensure mutant is within bounds
      for (let j = 0; j < mutant.length; j++) {
        if (mutant[j] < bounds[j][0]) mutant[j] = bounds[j][0];
        if (mutant[j] > bounds[j][1]) mutant[j] = bounds[j][1];
      }
      
      // Crossover: create trial vector
      const trial = [];
      const jRand = Math.floor(Math.random() * bounds.length); // Ensure at least one parameter is inherited
      
      for (let j = 0; j < bounds.length; j++) {
        if (Math.random() < CR || j === jRand) {
          trial.push(mutant[j]);
        } else {
          trial.push(population[i][j]);
        }
      }
      
      // Selection: compare trial with current individual
      const trialCost = costFunction(trial);
      
      if (trialCost <= costs[i]) {
        newPopulation.push(trial);
        newCosts.push(trialCost);
        
        // Update best solution if needed
        if (trialCost < bestCost) {
          bestSolution = [...trial];
          bestCost = trialCost;
        }
      } else {
        newPopulation.push([...population[i]]);
        newCosts.push(costs[i]);
      }
    }
    
    population = newPopulation;
    costs = newCosts;
    costHistory.push(bestCost);
  }
  
  return {
    solution: bestSolution,
    cost: bestCost,
    costHistory: costHistory
  };
  
  // Helper function to select three random distinct indices
  function selectThreeIndices(populationSize, exclude) {
    const indices = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * populationSize);
      if (idx !== exclude && !indices.includes(idx)) {
        indices.push(idx);
      }
    }
    return indices;
  }
};

/**
 * COBYLA (Constrained Optimization By Linear Approximation) algorithm
 * @param {Function} objective - Objective function to minimize
 * @param {Array} constraints - Array of constraint functions, each should return <= 0 for feasible points
 * @param {Array} initialPoint - Starting point
 * @param {Object} options - COBYLA options
 * @returns {Object} - Optimization result
 */
optimization.cobyla = function(objective, constraints, initialPoint, options = {}) {
  const maxIterations = options.maxIterations || 1000;
  const rhoBeg = options.rhoBeg || 1.0; // Initial trust region radius
  const rhoEnd = options.rhoEnd || 1e-6; // Final trust region radius
  const constraintPenalty = options.constraintPenalty || 1000.0;
  
  // Combine objective and constraints into a single function
  function merit(x) {
    let value = objective(x);
    
    // Apply penalty for constraint violations
    for (const constraint of constraints) {
      const violation = constraint(x);
      if (violation > 0) {
        value += constraintPenalty * violation;
      }
    }
    
    return value;
  }
  
  // Implement simplified COBYLA algorithm
  // (For a full implementation, we would need a more complex trust region method)
  let x = [...initialPoint];
  let rho = rhoBeg;
  const n = x.length;
  
  const costs = [merit(x)];
  let iteration = 0;
  
  while (iteration < maxIterations && rho >= rhoEnd) {
    let improved = false;
    
    // Try perturbations in each direction
    for (let i = 0; i < n; i++) {
      // Current point
      const currentValue = merit(x);
      
      // Try positive perturbation
      const xPlus = [...x];
      xPlus[i] += rho;
      const valuePlus = merit(xPlus);
      
      // Try negative perturbation
      const xMinus = [...x];
      xMinus[i] -= rho;
      const valueMinus = merit(xMinus);
      
      // Update if improved
      if (valuePlus < currentValue || valueMinus < currentValue) {
        if (valuePlus < valueMinus) {
          x = xPlus;
        } else {
          x = xMinus;
        }
        improved = true;
        break; // We found an improvement, move to next iteration
      }
    }
    
    // If no improvement, reduce trust region
    if (!improved) {
      rho *= 0.5;
    }
    
    costs.push(merit(x));
    iteration++;
  }
  
  return {
    solution: x,
    cost: objective(x),
    iterations: iteration,
    isFeasible: constraints.every(c => c(x) <= 0),
    costHistory: costs
  };
};

module.exports = optimization;
