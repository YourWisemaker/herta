/**
 * Game Theory module for herta.js
 * Provides tools for game-theoretic analysis and equilibrium finding
 */

import arithmetic from '../core/arithmetic.js';
import matrix from '../core/matrix.js';

const gameTheory = {};

/**
 * Find the Nash equilibrium for a 2-player zero-sum game using minimax
 * @param {Array} payoffMatrix - Payoff matrix for player 1 (player 2 gets negative)
 * @returns {Object} - Nash equilibrium strategies and value of the game
 */
gameTheory.zeroSumNashEquilibrium = function (payoffMatrix) {
  const rows = payoffMatrix.length;
  const cols = payoffMatrix[0].length;

  // Find the maximin strategy for player 1
  const rowMinValues = payoffMatrix.map((row) => Math.min(...row));
  const maximinValue = Math.max(...rowMinValues);
  const maximinIndices = rowMinValues
    .map((value, index) => (value === maximinValue ? index : -1))
    .filter((index) => index !== -1);

  // Find the minimax strategy for player 2
  const columnMaxValues = Array(cols).fill(0);
  for (let j = 0; j < cols; j++) {
    let colMax = -Infinity;
    for (let i = 0; i < rows; i++) {
      colMax = Math.max(colMax, payoffMatrix[i][j]);
    }
    columnMaxValues[j] = colMax;
  }

  const minimaxValue = Math.min(...columnMaxValues);
  const minimaxIndices = columnMaxValues
    .map((value, index) => (value === minimaxValue ? index : -1))
    .filter((index) => index !== -1);

  // Check if there's a pure strategy Nash equilibrium (saddle point)
  if (maximinValue === minimaxValue) {
    // Find the saddle point(s)
    const saddlePoints = [];
    for (const i of maximinIndices) {
      for (const j of minimaxIndices) {
        if (payoffMatrix[i][j] === maximinValue) {
          saddlePoints.push([i, j]);
        }
      }
    }

    if (saddlePoints.length > 0) {
      return {
        type: 'pure',
        equilibria: saddlePoints,
        value: maximinValue,
        player1Strategy: saddlePoints.map((point) => point[0]),
        player2Strategy: saddlePoints.map((point) => point[1])
      };
    }
  }

  // If no pure strategy equilibrium, solve for mixed strategy
  // Use linear programming to find the mixed Nash equilibrium
  try {
    return this._solveZeroSumMixed(payoffMatrix);
  } catch (e) {
    return {
      type: 'unknown',
      error: 'Could not determine mixed strategy equilibrium',
      message: e.message
    };
  }
};

/**
 * Solve for mixed strategy Nash equilibrium in a zero-sum game
 * @private
 * @param {Array} payoffMatrix - Payoff matrix
 * @returns {Object} - Mixed strategy Nash equilibrium
 */
gameTheory._solveZeroSumMixed = function (payoffMatrix) {
  const rows = payoffMatrix.length;
  const cols = payoffMatrix[0].length;

  // Implement a simplified version of the simplex algorithm for zero-sum games
  // Note: For general linear programming, use optimization.linearProgramming

  // Step 1: Ensure all payoffs are positive
  // (add a constant if necessary)
  let minValue = Infinity;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      minValue = Math.min(minValue, payoffMatrix[i][j]);
    }
  }

  const adjustedMatrix = JSON.parse(JSON.stringify(payoffMatrix));
  const adjustment = minValue < 0 ? -minValue : 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      adjustedMatrix[i][j] += adjustment;
    }
  }

  // Step 2: Solve for Player 2's strategy using linear programming
  // min z = x₁ + x₂ + ... + xₙ
  // subject to:
  // A₁₁x₁ + A₂₁x₂ + ... + Aₙ₁xₙ ≥ 1
  // ...
  // A₁ₘx₁ + A₂ₘx₂ + ... + Aₙₘxₙ ≥ 1
  // x₁, x₂, ..., xₙ ≥ 0

  // Simplified solution using approximation
  let p2Strategy = Array(cols).fill(1 / cols); // Start with uniform distribution
  const iterations = 1000;
  const learningRate = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    // Calculate expected payoff for Player 1's pure strategies
    const expectedPayoffs = [];
    for (let i = 0; i < rows; i++) {
      let payoff = 0;
      for (let j = 0; j < cols; j++) {
        payoff += adjustedMatrix[i][j] * p2Strategy[j];
      }
      expectedPayoffs.push(payoff);
    }

    // Find Player 1's best response
    const maxPayoff = Math.max(...expectedPayoffs);
    const bestResponses = expectedPayoffs
      .map((value, index) => (value === maxPayoff ? index : -1))
      .filter((index) => index !== -1);

    // Update Player 2's strategy using gradient descent
    for (let j = 0; j < cols; j++) {
      let gradient = 0;
      for (const i of bestResponses) {
        gradient += adjustedMatrix[i][j] / bestResponses.length;
      }
      p2Strategy[j] = Math.max(0, p2Strategy[j] - learningRate * gradient);
    }

    // Normalize strategy
    const sum = p2Strategy.reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      p2Strategy = p2Strategy.map((val) => val / sum);
    } else {
      p2Strategy = Array(cols).fill(1 / cols);
    }
  }

  // Step 3: Calculate the value of the game and Player 1's strategy
  // Calculate expected payoff matrix
  const expectedPayoffs = [];
  for (let i = 0; i < rows; i++) {
    let payoff = 0;
    for (let j = 0; j < cols; j++) {
      payoff += adjustedMatrix[i][j] * p2Strategy[j];
    }
    expectedPayoffs.push(payoff);
  }

  // Find Player 1's best response
  const maxPayoff = Math.max(...expectedPayoffs);
  const bestResponses = expectedPayoffs
    .map((value, index) => (Math.abs(value - maxPayoff) < 1e-10 ? index : -1))
    .filter((index) => index !== -1);

  // Create Player 1's mixed strategy
  const p1Strategy = Array(rows).fill(0);
  for (const index of bestResponses) {
    p1Strategy[index] = 1 / bestResponses.length;
  }

  // Calculate the value of the game
  let gameValue = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      gameValue += payoffMatrix[i][j] * p1Strategy[i] * p2Strategy[j];
    }
  }

  return {
    type: 'mixed',
    player1Strategy: p1Strategy,
    player2Strategy: p2Strategy,
    value: gameValue
  };
};

/**
 * Calculate the expected payoff for a given strategy profile
 * @param {Array} player1Strategy - Mixed strategy for player 1
 * @param {Array} player2Strategy - Mixed strategy for player 2
 * @param {Array} payoffMatrix1 - Payoff matrix for player 1
 * @param {Array} [payoffMatrix2=null] - Payoff matrix for player 2 (null for zero-sum)
 * @returns {Array} - Expected payoffs [player1Payoff, player2Payoff]
 */
gameTheory.expectedPayoff = function (player1Strategy, player2Strategy, payoffMatrix1, payoffMatrix2 = null) {
  const rows = payoffMatrix1.length;
  const cols = payoffMatrix1[0].length;

  // Validate inputs
  if (player1Strategy.length !== rows || player2Strategy.length !== cols) {
    throw new Error('Strategy dimensions do not match payoff matrix');
  }

  if (payoffMatrix2 && (payoffMatrix2.length !== rows || payoffMatrix2[0].length !== cols)) {
    throw new Error('Player 2 payoff matrix dimensions do not match player 1 payoff matrix');
  }

  // Calculate player 1's expected payoff
  let player1Payoff = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      player1Payoff += player1Strategy[i] * player2Strategy[j] * payoffMatrix1[i][j];
    }
  }

  // Calculate player 2's expected payoff
  let player2Payoff;
  if (payoffMatrix2) {
    player2Payoff = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        player2Payoff += player1Strategy[i] * player2Strategy[j] * payoffMatrix2[i][j];
      }
    }
  } else {
    // Zero-sum game
    player2Payoff = -player1Payoff;
  }

  return [player1Payoff, player2Payoff];
};

/**
 * Find all pure strategy Nash equilibria in a bimatrix game
 * @param {Array} payoffMatrix1 - Payoff matrix for player 1
 * @param {Array} payoffMatrix2 - Payoff matrix for player 2
 * @returns {Array} - Array of Nash equilibrium strategy profiles
 */
gameTheory.findPureNashEquilibria = function (payoffMatrix1, payoffMatrix2) {
  const rows = payoffMatrix1.length;
  const cols = payoffMatrix1[0].length;

  if (payoffMatrix2.length !== rows || payoffMatrix2[0].length !== cols) {
    throw new Error('Payoff matrices must have the same dimensions');
  }

  const equilibria = [];

  // For each strategy profile (i,j), check if it's a Nash equilibrium
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let isNash = true;

      // Check if player 1 can deviate
      for (let i2 = 0; i2 < rows; i2++) {
        if (i2 !== i && payoffMatrix1[i2][j] > payoffMatrix1[i][j]) {
          isNash = false;
          break;
        }
      }

      if (!isNash) continue;

      // Check if player 2 can deviate
      for (let j2 = 0; j2 < cols; j2++) {
        if (j2 !== j && payoffMatrix2[i][j2] > payoffMatrix2[i][j]) {
          isNash = false;
          break;
        }
      }

      if (isNash) {
        equilibria.push({
          profile: [i, j],
          payoffs: [payoffMatrix1[i][j], payoffMatrix2[i][j]]
        });
      }
    }
  }

  return equilibria;
};

/**
 * Find approximate mixed strategy Nash equilibrium using iterative algorithm
 * @param {Array} payoffMatrix1 - Payoff matrix for player 1
 * @param {Array} payoffMatrix2 - Payoff matrix for player 2
 * @param {Object} [options={}] - Options for the algorithm
 * @returns {Object} - Approximate Nash equilibrium
 */
gameTheory.findMixedNashEquilibrium = function (payoffMatrix1, payoffMatrix2, options = {}) {
  const rows = payoffMatrix1.length;
  const cols = payoffMatrix1[0].length;

  const maxIterations = options.maxIterations || 10000;
  const tolerance = options.tolerance || 1e-6;
  const learningRate = options.learningRate || 0.01;

  // Initialize mixed strategies (uniform distribution)
  let p1Strategy = Array(rows).fill(1 / rows);
  let p2Strategy = Array(cols).fill(1 / cols);

  // Fictitious play algorithm
  const p1History = Array(rows).fill(0);
  const p2History = Array(cols).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Player 1's best response
    const p1Payoffs = Array(rows).fill(0);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        p1Payoffs[i] += payoffMatrix1[i][j] * p2Strategy[j];
      }
    }

    const p1BestResponse = p1Payoffs.indexOf(Math.max(...p1Payoffs));
    p1History[p1BestResponse]++;

    // Player 2's best response
    const p2Payoffs = Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        p2Payoffs[j] += payoffMatrix2[i][j] * p1Strategy[i];
      }
    }

    const p2BestResponse = p2Payoffs.indexOf(Math.max(...p2Payoffs));
    p2History[p2BestResponse]++;

    // Update mixed strategies based on history (empirical frequencies)
    const p1Total = p1History.reduce((acc, val) => acc + val, 0);
    const p2Total = p2History.reduce((acc, val) => acc + val, 0);

    const newP1Strategy = p1History.map((val) => val / p1Total);
    const newP2Strategy = p2History.map((val) => val / p2Total);

    // Check convergence
    let p1Change = 0;
    let p2Change = 0;

    for (let i = 0; i < rows; i++) {
      p1Change += Math.abs(newP1Strategy[i] - p1Strategy[i]);
    }

    for (let j = 0; j < cols; j++) {
      p2Change += Math.abs(newP2Strategy[j] - p2Strategy[j]);
    }

    p1Strategy = newP1Strategy;
    p2Strategy = newP2Strategy;

    if (p1Change < tolerance && p2Change < tolerance) {
      break;
    }
  }

  // Calculate the payoffs
  const payoffs = this.expectedPayoff(p1Strategy, p2Strategy, payoffMatrix1, payoffMatrix2);

  return {
    player1Strategy: p1Strategy,
    player2Strategy: p2Strategy,
    payoffs
  };
};

/**
 * Convert a game to its normal form
 * @param {Array} strategies1 - Array of strategies for player 1
 * @param {Array} strategies2 - Array of strategies for player 2
 * @param {Function} utility1 - Utility function for player 1
 * @param {Function} utility2 - Utility function for player 2
 * @returns {Object} - Normal form representation of the game
 */
gameTheory.toNormalForm = function (strategies1, strategies2, utility1, utility2) {
  const rows = strategies1.length;
  const cols = strategies2.length;

  const payoffMatrix1 = Array(rows).fill().map(() => Array(cols).fill(0));
  const payoffMatrix2 = Array(rows).fill().map(() => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      payoffMatrix1[i][j] = utility1(strategies1[i], strategies2[j]);
      payoffMatrix2[i][j] = utility2(strategies1[i], strategies2[j]);
    }
  }

  return {
    strategies1,
    strategies2,
    payoffMatrix1,
    payoffMatrix2
  };
};

/**
 * Find the Pareto optimal outcomes in a game
 * @param {Array} payoffMatrix1 - Payoff matrix for player 1
 * @param {Array} payoffMatrix2 - Payoff matrix for player 2
 * @returns {Array} - Array of Pareto optimal outcomes
 */
gameTheory.paretoOptimal = function (payoffMatrix1, payoffMatrix2) {
  const rows = payoffMatrix1.length;
  const cols = payoffMatrix1[0].length;

  if (payoffMatrix2.length !== rows || payoffMatrix2[0].length !== cols) {
    throw new Error('Payoff matrices must have the same dimensions');
  }

  const paretoOptimal = [];

  // Check each strategy profile
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const current = [payoffMatrix1[i][j], payoffMatrix2[i][j]];
      let isParetoOptimal = true;

      // Check if any other outcome Pareto dominates this one
      outer: for (let i2 = 0; i2 < rows; i2++) {
        for (let j2 = 0; j2 < cols; j2++) {
          if (i2 === i && j2 === j) continue;

          const other = [payoffMatrix1[i2][j2], payoffMatrix2[i2][j2]];

          // Check if other weakly dominates current
          if (other[0] >= current[0] && other[1] >= current[1]
              && (other[0] > current[0] || other[1] > current[1])) {
            isParetoOptimal = false;
            break outer;
          }
        }
      }

      if (isParetoOptimal) {
        paretoOptimal.push({
          profile: [i, j],
          payoffs: current
        });
      }
    }
  }

  return paretoOptimal;
};

/**
 * Calculate the social welfare of an outcome
 * @param {Array} outcome - Payoffs for each player
 * @param {string} [type='utilitarian'] - Type of social welfare ('utilitarian' or 'egalitarian')
 * @returns {number} - Social welfare measure
 */
gameTheory.socialWelfare = function (outcome, type = 'utilitarian') {
  if (type === 'utilitarian') {
    // Sum of utilities
    return outcome.reduce((acc, val) => acc + val, 0);
  } if (type === 'egalitarian') {
    // Minimum utility
    return Math.min(...outcome);
  }
  throw new Error('Unknown social welfare type');
};

/**
 * Calculate the price of anarchy
 * @param {Array} payoffMatrix1 - Payoff matrix for player 1
 * @param {Array} payoffMatrix2 - Payoff matrix for player 2
 * @param {string} [welfareType='utilitarian'] - Type of social welfare
 * @returns {number} - Price of anarchy
 */
gameTheory.priceOfAnarchy = function (payoffMatrix1, payoffMatrix2, welfareType = 'utilitarian') {
  const rows = payoffMatrix1.length;
  const cols = payoffMatrix1[0].length;

  // Find all Nash equilibria
  const equilibria = this.findPureNashEquilibria(payoffMatrix1, payoffMatrix2);

  if (equilibria.length === 0) {
    return 'No pure Nash equilibria found';
  }

  // Find the social optimum
  let optimalWelfare = -Infinity;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const welfare = this.socialWelfare([payoffMatrix1[i][j], payoffMatrix2[i][j]], welfareType);
      optimalWelfare = Math.max(optimalWelfare, welfare);
    }
  }

  // Find the worst Nash equilibrium
  let worstEqWelfare = Infinity;

  for (const eq of equilibria) {
    const welfare = this.socialWelfare(eq.payoffs, welfareType);
    worstEqWelfare = Math.min(worstEqWelfare, welfare);
  }

  // Price of Anarchy = Optimal Welfare / Worst Equilibrium Welfare
  return optimalWelfare / worstEqWelfare;
};

/**
 * Implement a basic cooperative game solution: the Shapley value
 * @param {Function} v - Characteristic function v(coalition)
 * @param {Array} players - Array of player identifiers
 * @returns {Object} - Shapley value for each player
 */
gameTheory.shapleyValue = function (v, players) {
  const n = players.length;
  const result = {};

  // Initialize Shapley values
  for (const player of players) {
    result[player] = 0;
  }

  // Helper function to generate all permutations
  function permutations(arr) {
    if (arr.length <= 1) return [arr];

    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const remainingPerms = permutations(remaining);

      for (const perm of remainingPerms) {
        result.push([current, ...perm]);
      }
    }

    return result;
  }

  // Generate all player permutations
  const allPermutations = permutations(players);

  // For each permutation, calculate marginal contributions
  for (const perm of allPermutations) {
    const coalition = [];
    let prevValue = 0;

    for (const player of perm) {
      coalition.push(player);
      const currentValue = v(coalition);
      const marginalContribution = currentValue - prevValue;

      result[player] += marginalContribution;
      prevValue = currentValue;
    }
  }

  // Average over all permutations
  for (const player of players) {
    result[player] /= allPermutations.length;
  }

  return result;
};

/**
 * Implement the Banzhaf power index for voting games
 * @param {Function} v - Characteristic function v(coalition) (usually 0 or 1)
 * @param {Array} players - Array of player identifiers
 * @returns {Object} - Banzhaf power index for each player
 */
gameTheory.banzhafIndex = function (v, players) {
  const n = players.length;
  const result = {};

  // Initialize power indices
  for (const player of players) {
    result[player] = 0;
  }

  // Generate all subsets of players (the power set)
  const powerSet = [[]];
  for (const player of players) {
    const newSets = [];
    for (const set of powerSet) {
      newSets.push([...set, player]);
    }
    powerSet.push(...newSets);
  }

  // Count critical players in each winning coalition
  for (const coalition of powerSet) {
    // Skip empty coalition
    if (coalition.length === 0) continue;

    // Check if coalition is winning
    if (v(coalition) === 1) {
      // Check each player in the coalition
      for (const player of coalition) {
        // Remove player from coalition
        const coalitionWithoutPlayer = coalition.filter((p) => p !== player);

        // If coalition becomes losing, player is critical
        if (v(coalitionWithoutPlayer) === 0) {
          result[player]++;
        }
      }
    }
  }

  // Normalize
  const total = Object.values(result).reduce((a, b) => a + b, 0);
  for (const player of players) {
    result[player] /= total;
  }

  return result;
};

/**
 * Implement a basic evolutionary game dynamics simulation
 * @param {Array} payoffMatrix - Payoff matrix for all strategies
 * @param {Array} initialPopulation - Initial population proportions
 * @param {number} iterations - Number of iterations
 * @param {number} [mutationRate=0.01] - Rate of random strategy mutation
 * @returns {Object} - Time series of population dynamics
 */
gameTheory.replicatorDynamics = function (payoffMatrix, initialPopulation, iterations, mutationRate = 0.01) {
  const strategies = initialPopulation.length;
  const population = [...initialPopulation];
  const timeSeries = [population.map((x) => x)];

  for (let t = 0; t < iterations; t++) {
    // Calculate fitness for each strategy
    const fitness = Array(strategies).fill(0);

    for (let i = 0; i < strategies; i++) {
      for (let j = 0; j < strategies; j++) {
        fitness[i] += payoffMatrix[i][j] * population[j];
      }
    }

    // Calculate average fitness
    const avgFitness = fitness.reduce((avg, f, i) => avg + f * population[i], 0);

    // Update population proportions
    const newPopulation = Array(strategies).fill(0);

    for (let i = 0; i < strategies; i++) {
      // Replicator equation
      newPopulation[i] = population[i] * (fitness[i] / avgFitness);

      // Add mutation
      if (mutationRate > 0) {
        const mutationOut = population[i] * mutationRate;
        const mutationIn = (1 - population[i]) * mutationRate / (strategies - 1);
        newPopulation[i] = newPopulation[i] * (1 - mutationRate) + mutationIn;
      }
    }

    // Normalize
    const sum = newPopulation.reduce((a, b) => a + b, 0);
    for (let i = 0; i < strategies; i++) {
      population[i] = newPopulation[i] / sum;
    }

    timeSeries.push(population.map((x) => x));
  }

  return {
    timeSeries,
    finalPopulation: population
  };
};

export default gameTheory;
