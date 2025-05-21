/**
 * Optimization Module Examples
 * Demonstrates various optimization techniques available in Herta.js
 */

const herta = require('../../src/index.js');
const { optimization } = herta;

console.log('Herta.js Optimization Examples');
console.log('==============================\n');

// Simple function to optimize: f(x,y) = (x-2)^2 + (y-3)^2 + 1
// Minimum at (2,3) with value 1
const objectiveFunction = (params) => {
  const x = params[0];
  const y = params[1];
  return Math.pow(x - 2, 2) + Math.pow(y - 3, 2) + 1;
};

// Gradient of the objective function: ∇f(x,y) = [2(x-2), 2(y-3)]
const gradientFunction = (params) => {
  const x = params[0];
  const y = params[1];
  return [2 * (x - 2), 2 * (y - 3)];
};

// 1. Gradient Descent
console.log('1. Gradient Descent');
console.log('------------------');
console.log('Minimizing f(x,y) = (x-2)^2 + (y-3)^2 + 1');
console.log('Starting from (0,0)');

const gdResult = optimization.gradientDescent({
  objective: objectiveFunction,
  gradient: gradientFunction,
  initialParams: [0, 0],
  learningRate: 0.1,
  maxIterations: 100,
  tolerance: 1e-6
});

console.log('Solution:', gdResult.params);
console.log('Objective value:', gdResult.value);
console.log('Iterations:', gdResult.iterations);
console.log('Convergence:', gdResult.converged ? 'Yes' : 'No');
console.log();

// 2. Newton's Method
console.log('2. Newton\'s Method');
console.log('-----------------');
console.log('Minimizing the same function using Newton\'s method');

// Hessian matrix for the function: H(x,y) = [[2, 0], [0, 2]]
const hessianFunction = () => {
  return [
    [2, 0],
    [0, 2]
  ];
};

const newtonResult = optimization.newtonsMethod({
  objective: objectiveFunction,
  gradient: gradientFunction,
  hessian: hessianFunction,
  initialParams: [0, 0],
  maxIterations: 10
});

console.log('Solution:', newtonResult.params);
console.log('Objective value:', newtonResult.value);
console.log('Iterations:', newtonResult.iterations);
console.log('Convergence:', newtonResult.converged ? 'Yes' : 'No');
console.log();

// 3. Simulated Annealing for a complex problem
console.log('3. Simulated Annealing');
console.log('---------------------');
console.log('Solving a more complex problem with multiple local minima');

// A function with multiple local minima
const complexFunction = (params) => {
  const x = params[0];
  const y = params[1];
  return Math.sin(x) * Math.cos(y) + 0.05 * (x*x + y*y);
};

const saResult = optimization.simulatedAnnealing({
  objective: complexFunction,
  initialParams: [2, 2],
  initialTemperature: 1000,
  coolingRate: 0.95,
  maxIterations: 1000
});

console.log('Solution:', saResult.params);
console.log('Objective value:', saResult.value);
console.log('Iterations:', saResult.iterations);
console.log();

// 4. Genetic Algorithm for a discrete problem
console.log('4. Genetic Algorithm');
console.log('-------------------');
console.log('Solving the knapsack problem with genetic algorithm');

// Knapsack problem: items with values and weights, maximize value while respecting weight constraint
const items = [
  { value: 10, weight: 5 },
  { value: 40, weight: 4 },
  { value: 30, weight: 6 },
  { value: 50, weight: 3 },
  { value: 15, weight: 2 },
  { value: 25, weight: 8 },
  { value: 20, weight: 7 }
];
const knapsackCapacity = 15;

// Fitness function for the knapsack problem
const knapsackFitness = (chromosome) => {
  let totalValue = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < chromosome.length; i++) {
    if (chromosome[i]) {
      totalValue += items[i].value;
      totalWeight += items[i].weight;
    }
  }
  
  // Penalty for exceeding weight capacity
  if (totalWeight > knapsackCapacity) {
    return 0; // Invalid solution
  }
  
  return totalValue;
};

const gaResult = optimization.geneticAlgorithm({
  fitnessFunction: knapsackFitness,
  chromosomeLength: items.length,
  populationSize: 50,
  generations: 100,
  crossoverRate: 0.8,
  mutationRate: 0.1
});

console.log('Best chromosome:', gaResult.bestChromosome);
console.log('Selected items:');
gaResult.bestChromosome.forEach((selected, i) => {
  if (selected) {
    console.log(`  Item ${i+1}: Value=${items[i].value}, Weight=${items[i].weight}`);
  }
});

let totalValue = 0;
let totalWeight = 0;
gaResult.bestChromosome.forEach((selected, i) => {
  if (selected) {
    totalValue += items[i].value;
    totalWeight += items[i].weight;
  }
});

console.log('Total value:', totalValue);
console.log('Total weight:', totalWeight);
console.log('Weight capacity:', knapsackCapacity);
console.log();

// 5. Particle Swarm Optimization
console.log('5. Particle Swarm Optimization');
console.log('-----------------------------');
console.log('Minimizing a complex function with PSO');

// Use Rastrigin function as a complex multimodal optimization problem
const rastriginFunction = (params) => {
  const n = params.length;
  let sum = 10 * n;
  
  for (let i = 0; i < n; i++) {
    sum += params[i] * params[i] - 10 * Math.cos(2 * Math.PI * params[i]);
  }
  
  return sum;
};

const psoResult = optimization.particleSwarmOptimization({
  objective: rastriginFunction,
  dimensions: 2,
  bounds: [[-5.12, 5.12], [-5.12, 5.12]],
  particleCount: 30,
  maxIterations: 100
});

console.log('Solution:', psoResult.bestPosition);
console.log('Objective value:', psoResult.bestFitness);
console.log('Iterations:', psoResult.iterations);
console.log();

// 6. Linear Programming with Simplex Method
console.log('6. Linear Programming with Simplex Method');
console.log('---------------------------------------');
console.log('Solving a simple linear programming problem');

// Maximize z = 3x + 4y subject to:
// x + 2y ≤ 14
// 3x - y ≤ 0
// x - y ≤ 2
// x, y ≥ 0

const objectiveCoefficients = [3, 4]; // Coefficients of objective function to maximize
const constraintMatrix = [
  [1, 2],   // Coefficients for first constraint: x + 2y ≤ 14
  [3, -1],  // Coefficients for second constraint: 3x - y ≤ 0 
  [1, -1]   // Coefficients for third constraint: x - y ≤ 2
];
const constraintValues = [14, 0, 2]; // Right-hand side of constraints

const lpResult = optimization.simplexMethod({
  objective: objectiveCoefficients,
  constraints: constraintMatrix,
  rhs: constraintValues,
  maximize: true
});

console.log('Optimal solution:', lpResult.solution);
console.log('Optimal value:', lpResult.objectiveValue);
console.log('Binding constraints:', lpResult.bindingConstraints);
console.log();

console.log('Herta.js Optimization module demonstration completed!');
