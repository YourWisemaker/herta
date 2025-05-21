/**
 * Reinforcement Learning module for herta.js
 * Provides implementations of fundamental RL algorithms and environments
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');
const machineLearning = require('./machineLearning');

const reinforcementLearning = {};

/**
 * Multi-armed bandit problem solver using epsilon-greedy strategy
 * @param {Function} armPulls - Function that returns reward when pulling an arm
 * @param {number} numArms - Number of arms in the bandit
 * @param {Object} options - Algorithm options
 * @returns {Object} - Bandit solver object
 */
reinforcementLearning.epsilonGreedyBandit = function(armPulls, numArms, options = {}) {
  const epsilon = options.epsilon || 0.1;
  const initialValue = options.initialValue || 0;
  
  const actionValues = Array(numArms).fill(initialValue);
  const actionCounts = Array(numArms).fill(0);
  
  return {
    actionValues,
    actionCounts,
    totalReward: 0,
    
    // Select an action based on epsilon-greedy policy
    selectAction: function() {
      // Explore with probability epsilon
      if (Math.random() < epsilon) {
        return Math.floor(Math.random() * numArms);
      }
      
      // Exploit with probability 1-epsilon (choose best arm)
      let bestAction = 0;
      let bestValue = actionValues[0];
      
      for (let i = 1; i < numArms; i++) {
        if (actionValues[i] > bestValue) {
          bestValue = actionValues[i];
          bestAction = i;
        }
      }
      
      return bestAction;
    },
    
    // Take a step (select action, get reward, update values)
    step: function() {
      const action = this.selectAction();
      const reward = armPulls(action);
      
      // Update action values using incremental average
      actionCounts[action]++;
      const stepSize = 1 / actionCounts[action];
      actionValues[action] += stepSize * (reward - actionValues[action]);
      
      this.totalReward += reward;
      
      return {
        action,
        reward,
        actionValues: [...actionValues],
        totalReward: this.totalReward
      };
    },
    
    // Run for multiple steps
    run: function(numSteps) {
      const history = [];
      
      for (let i = 0; i < numSteps; i++) {
        history.push(this.step());
      }
      
      return history;
    }
  };
};

/**
 * UCB (Upper Confidence Bound) bandit algorithm
 * @param {Function} armPulls - Function that returns reward when pulling an arm
 * @param {number} numArms - Number of arms in the bandit
 * @param {Object} options - Algorithm options
 * @returns {Object} - UCB bandit solver object
 */
reinforcementLearning.ucbBandit = function(armPulls, numArms, options = {}) {
  const c = options.confidenceLevel || 2;
  const initialValue = options.initialValue || 0;
  
  const actionValues = Array(numArms).fill(initialValue);
  const actionCounts = Array(numArms).fill(0);
  let totalSteps = 0;
  
  return {
    actionValues,
    actionCounts,
    totalReward: 0,
    
    // Select an action based on UCB policy
    selectAction: function() {
      // First, try all actions at least once
      for (let i = 0; i < numArms; i++) {
        if (actionCounts[i] === 0) {
          return i;
        }
      }
      
      // Calculate UCB values for each action
      const ucbValues = actionValues.map((value, index) => {
        const uncertainty = c * Math.sqrt(Math.log(totalSteps) / actionCounts[index]);
        return value + uncertainty;
      });
      
      // Select action with highest UCB value
      let bestAction = 0;
      let bestValue = ucbValues[0];
      
      for (let i = 1; i < numArms; i++) {
        if (ucbValues[i] > bestValue) {
          bestValue = ucbValues[i];
          bestAction = i;
        }
      }
      
      return bestAction;
    },
    
    // Take a step (select action, get reward, update values)
    step: function() {
      totalSteps++;
      const action = this.selectAction();
      const reward = armPulls(action);
      
      // Update action values using incremental average
      actionCounts[action]++;
      const stepSize = 1 / actionCounts[action];
      actionValues[action] += stepSize * (reward - actionValues[action]);
      
      this.totalReward += reward;
      
      return {
        action,
        reward,
        actionValues: [...actionValues],
        totalReward: this.totalReward
      };
    },
    
    // Run for multiple steps
    run: function(numSteps) {
      const history = [];
      
      for (let i = 0; i < numSteps; i++) {
        history.push(this.step());
      }
      
      return history;
    }
  };
};

/**
 * Create a GridWorld environment for RL
 * @param {number} width - Width of the grid
 * @param {number} height - Height of the grid
 * @param {Object} options - Environment options
 * @returns {Object} - GridWorld environment
 */
reinforcementLearning.GridWorld = function(width, height, options = {}) {
  const defaultReward = options.defaultReward || -0.1;
  const terminals = options.terminals || []; // Array of {x, y, reward} objects
  const obstacles = options.obstacles || []; // Array of {x, y} positions
  
  return {
    width,
    height,
    terminals,
    obstacles,
    agentPosition: options.start || { x: 0, y: 0 },
    
    // Get valid actions at current position
    getValidActions: function() {
      const { x, y } = this.agentPosition;
      const actions = [];
      
      // Check up
      if (y > 0 && !this.isObstacle(x, y - 1)) {
        actions.push('up');
      }
      
      // Check down
      if (y < height - 1 && !this.isObstacle(x, y + 1)) {
        actions.push('down');
      }
      
      // Check left
      if (x > 0 && !this.isObstacle(x - 1, y)) {
        actions.push('left');
      }
      
      // Check right
      if (x < width - 1 && !this.isObstacle(x + 1, y)) {
        actions.push('right');
      }
      
      return actions;
    },
    
    // Check if position is an obstacle
    isObstacle: function(x, y) {
      return obstacles.some(obs => obs.x === x && obs.y === y);
    },
    
    // Check if position is a terminal state
    isTerminal: function(x, y) {
      return terminals.some(term => term.x === x && term.y === y);
    },
    
    // Get reward for a position
    getReward: function(x, y) {
      const terminal = terminals.find(term => term.x === x && term.y === y);
      return terminal ? terminal.reward : defaultReward;
    },
    
    // Take a step in the environment
    step: function(action) {
      const { x, y } = this.agentPosition;
      let newX = x;
      let newY = y;
      
      switch (action) {
        case 'up':
          newY = Math.max(0, y - 1);
          break;
        case 'down':
          newY = Math.min(height - 1, y + 1);
          break;
        case 'left':
          newX = Math.max(0, x - 1);
          break;
        case 'right':
          newX = Math.min(width - 1, x + 1);
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }
      
      // Don't move if hitting an obstacle
      if (this.isObstacle(newX, newY)) {
        newX = x;
        newY = y;
      }
      
      const reward = this.getReward(newX, newY);
      const done = this.isTerminal(newX, newY);
      
      this.agentPosition = { x: newX, y: newY };
      
      return {
        state: { x: newX, y: newY },
        reward,
        done
      };
    },
    
    // Reset environment to initial state
    reset: function() {
      this.agentPosition = options.start || { x: 0, y: 0 };
      return this.agentPosition;
    }
  };
};

/**
 * Q-Learning algorithm
 * @param {Object} environment - Environment with step and reset methods
 * @param {Object} options - Algorithm options
 * @returns {Object} - Q-learning agent
 */
reinforcementLearning.QLearning = function(environment, options = {}) {
  const alpha = options.learningRate || 0.1;
  const gamma = options.discountFactor || 0.99;
  const epsilon = options.epsilon || 0.1;
  const epsilonDecay = options.epsilonDecay || 1.0;
  const minEpsilon = options.minEpsilon || 0.01;
  
  // Initialize Q-table
  const qTable = {};
  
  // Utility function to get state key
  const getStateKey = (state) => `${state.x},${state.y}`;
  
  // Get all possible actions
  const allActions = ['up', 'down', 'left', 'right'];
  
  // Initialize Q-values for a state
  const initializeState = (state) => {
    const stateKey = getStateKey(state);
    if (!qTable[stateKey]) {
      qTable[stateKey] = {};
      allActions.forEach(action => {
        qTable[stateKey][action] = 0;
      });
    }
  };
  
  return {
    qTable,
    currentEpsilon: epsilon,
    
    // Choose action using epsilon-greedy policy
    chooseAction: function(state) {
      const stateKey = getStateKey(state);
      initializeState(state);
      
      // Get valid actions
      const validActions = environment.getValidActions();
      
      // Explore: choose random action
      if (Math.random() < this.currentEpsilon) {
        const randomIndex = Math.floor(Math.random() * validActions.length);
        return validActions[randomIndex];
      }
      
      // Exploit: choose best action
      let bestAction = validActions[0];
      let bestValue = qTable[stateKey][bestAction] || 0;
      
      for (let i = 1; i < validActions.length; i++) {
        const action = validActions[i];
        const value = qTable[stateKey][action] || 0;
        
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      return bestAction;
    },
    
    // Update Q-value for a state-action pair
    update: function(state, action, reward, nextState) {
      const stateKey = getStateKey(state);
      const nextStateKey = getStateKey(nextState);
      
      initializeState(state);
      initializeState(nextState);
      
      // Get maximum Q-value for next state
      let maxNextQ = -Infinity;
      allActions.forEach(a => {
        if (qTable[nextStateKey][a] > maxNextQ) {
          maxNextQ = qTable[nextStateKey][a];
        }
      });
      
      // Q-learning update rule
      const currentQ = qTable[stateKey][action];
      const tdTarget = reward + gamma * maxNextQ;
      qTable[stateKey][action] = currentQ + alpha * (tdTarget - currentQ);
    },
    
    // Decay epsilon
    decayEpsilon: function() {
      this.currentEpsilon = Math.max(
        minEpsilon,
        this.currentEpsilon * epsilonDecay
      );
    },
    
    // Train for one episode
    trainEpisode: function(maxSteps = 1000) {
      let state = environment.reset();
      let totalReward = 0;
      let steps = 0;
      
      while (steps < maxSteps) {
        const action = this.chooseAction(state);
        const { state: nextState, reward, done } = environment.step(action);
        
        this.update(state, action, reward, nextState);
        
        totalReward += reward;
        state = nextState;
        steps++;
        
        if (done) break;
      }
      
      this.decayEpsilon();
      
      return {
        steps,
        totalReward
      };
    },
    
    // Train for multiple episodes
    train: function(numEpisodes, maxSteps = 1000) {
      const history = [];
      
      for (let i = 0; i < numEpisodes; i++) {
        const result = this.trainEpisode(maxSteps);
        history.push({
          episode: i + 1,
          steps: result.steps,
          totalReward: result.totalReward,
          epsilon: this.currentEpsilon
        });
      }
      
      return history;
    },
    
    // Get the optimal policy from Q-table
    getPolicy: function() {
      const policy = {};
      
      for (const stateKey in qTable) {
        let bestAction = null;
        let bestValue = -Infinity;
        
        for (const action in qTable[stateKey]) {
          const value = qTable[stateKey][action];
          
          if (value > bestValue) {
            bestValue = value;
            bestAction = action;
          }
        }
        
        policy[stateKey] = bestAction;
      }
      
      return policy;
    },
    
    // Get the optimal value function from Q-table
    getValueFunction: function() {
      const valueFunction = {};
      
      for (const stateKey in qTable) {
        let maxValue = -Infinity;
        
        for (const action in qTable[stateKey]) {
          const value = qTable[stateKey][action];
          
          if (value > maxValue) {
            maxValue = value;
          }
        }
        
        valueFunction[stateKey] = maxValue;
      }
      
      return valueFunction;
    }
  };
};

/**
 * SARSA algorithm
 * @param {Object} environment - Environment with step and reset methods
 * @param {Object} options - Algorithm options
 * @returns {Object} - SARSA agent
 */
reinforcementLearning.SARSA = function(environment, options = {}) {
  const alpha = options.learningRate || 0.1;
  const gamma = options.discountFactor || 0.99;
  const epsilon = options.epsilon || 0.1;
  const epsilonDecay = options.epsilonDecay || 1.0;
  const minEpsilon = options.minEpsilon || 0.01;
  
  // Initialize Q-table
  const qTable = {};
  
  // Utility function to get state key
  const getStateKey = (state) => `${state.x},${state.y}`;
  
  // Get all possible actions
  const allActions = ['up', 'down', 'left', 'right'];
  
  // Initialize Q-values for a state
  const initializeState = (state) => {
    const stateKey = getStateKey(state);
    if (!qTable[stateKey]) {
      qTable[stateKey] = {};
      allActions.forEach(action => {
        qTable[stateKey][action] = 0;
      });
    }
  };
  
  return {
    qTable,
    currentEpsilon: epsilon,
    
    // Choose action using epsilon-greedy policy
    chooseAction: function(state) {
      const stateKey = getStateKey(state);
      initializeState(state);
      
      // Get valid actions
      const validActions = environment.getValidActions();
      
      // Explore: choose random action
      if (Math.random() < this.currentEpsilon) {
        const randomIndex = Math.floor(Math.random() * validActions.length);
        return validActions[randomIndex];
      }
      
      // Exploit: choose best action
      let bestAction = validActions[0];
      let bestValue = qTable[stateKey][bestAction] || 0;
      
      for (let i = 1; i < validActions.length; i++) {
        const action = validActions[i];
        const value = qTable[stateKey][action] || 0;
        
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      return bestAction;
    },
    
    // Update Q-value for a state-action pair using SARSA update rule
    update: function(state, action, reward, nextState, nextAction) {
      const stateKey = getStateKey(state);
      const nextStateKey = getStateKey(nextState);
      
      initializeState(state);
      initializeState(nextState);
      
      // SARSA update rule (uses the actual next action instead of max)
      const currentQ = qTable[stateKey][action];
      const nextQ = qTable[nextStateKey][nextAction];
      
      qTable[stateKey][action] = currentQ + alpha * (reward + gamma * nextQ - currentQ);
    },
    
    // Decay epsilon
    decayEpsilon: function() {
      this.currentEpsilon = Math.max(
        minEpsilon,
        this.currentEpsilon * epsilonDecay
      );
    },
    
    // Train for one episode
    trainEpisode: function(maxSteps = 1000) {
      let state = environment.reset();
      let action = this.chooseAction(state);
      let totalReward = 0;
      let steps = 0;
      
      while (steps < maxSteps) {
        const { state: nextState, reward, done } = environment.step(action);
        const nextAction = this.chooseAction(nextState);
        
        this.update(state, action, reward, nextState, nextAction);
        
        totalReward += reward;
        state = nextState;
        action = nextAction;
        steps++;
        
        if (done) break;
      }
      
      this.decayEpsilon();
      
      return {
        steps,
        totalReward
      };
    },
    
    // Train for multiple episodes
    train: function(numEpisodes, maxSteps = 1000) {
      const history = [];
      
      for (let i = 0; i < numEpisodes; i++) {
        const result = this.trainEpisode(maxSteps);
        history.push({
          episode: i + 1,
          steps: result.steps,
          totalReward: result.totalReward,
          epsilon: this.currentEpsilon
        });
      }
      
      return history;
    },
    
    // Get the optimal policy from Q-table
    getPolicy: function() {
      const policy = {};
      
      for (const stateKey in qTable) {
        let bestAction = null;
        let bestValue = -Infinity;
        
        for (const action in qTable[stateKey]) {
          const value = qTable[stateKey][action];
          
          if (value > bestValue) {
            bestValue = value;
            bestAction = action;
          }
        }
        
        policy[stateKey] = bestAction;
      }
      
      return policy;
    },
    
    // Get the optimal value function from Q-table
    getValueFunction: function() {
      const valueFunction = {};
      
      for (const stateKey in qTable) {
        let maxValue = -Infinity;
        
        for (const action in qTable[stateKey]) {
          const value = qTable[stateKey][action];
          
          if (value > maxValue) {
            maxValue = value;
          }
        }
        
        valueFunction[stateKey] = maxValue;
      }
      
      return valueFunction;
    }
  };
};

/**
 * Monte Carlo policy evaluation for episodic environments
 * @param {Object} environment - Environment with step and reset methods
 * @param {Function} policy - Policy function that maps states to actions
 * @param {Object} options - Algorithm options
 * @returns {Object} - Monte Carlo agent
 */
reinforcementLearning.monteCarloEvaluation = function(environment, policy, options = {}) {
  const gamma = options.discountFactor || 0.99;
  
  // State-value function
  const valueFunction = {};
  // State visit counts
  const stateVisits = {};
  
  // Utility function to get state key
  const getStateKey = (state) => `${state.x},${state.y}`;
  
  return {
    valueFunction,
    stateVisits,
    
    // Run a single episode and collect returns
    runEpisode: function(maxSteps = 1000) {
      const trajectory = [];
      let state = environment.reset();
      let steps = 0;
      
      while (steps < maxSteps) {
        const stateKey = getStateKey(state);
        const action = policy(state);
        const { state: nextState, reward, done } = environment.step(action);
        
        trajectory.push({
          state: stateKey,
          action,
          reward
        });
        
        state = nextState;
        steps++;
        
        if (done) break;
      }
      
      return trajectory;
    },
    
    // Update value function using the first-visit Monte Carlo method
    updateValueFunction: function(trajectory) {
      const statesVisited = new Set();
      
      // Calculate returns for each step
      let G = 0;
      for (let t = trajectory.length - 1; t >= 0; t--) {
        const { state, reward } = trajectory[t];
        
        G = gamma * G + reward;
        
        // First-visit Monte Carlo
        if (!statesVisited.has(state)) {
          statesVisited.add(state);
          
          stateVisits[state] = (stateVisits[state] || 0) + 1;
          
          // Incremental update of value function
          valueFunction[state] = (valueFunction[state] || 0) + 
            (1 / stateVisits[state]) * (G - (valueFunction[state] || 0));
        }
      }
    },
    
    // Evaluate policy over multiple episodes
    evaluate: function(numEpisodes, maxSteps = 1000) {
      for (let i = 0; i < numEpisodes; i++) {
        const trajectory = this.runEpisode(maxSteps);
        this.updateValueFunction(trajectory);
      }
      
      return this.valueFunction;
    }
  };
};

/**
 * Deep Q-Network (DQN) implementation
 * @param {Object} environment - Environment with step and reset methods
 * @param {Object} options - Algorithm options
 * @returns {Object} - DQN agent
 */
reinforcementLearning.DQN = function(environment, options = {}) {
  throw new Error('DQN implementation requires a neural network library and is not available in the current version');
};

module.exports = reinforcementLearning;
