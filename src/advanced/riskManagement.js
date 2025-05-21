/**
 * Risk Management module for herta.js
 * Provides mathematical functions for financial risk assessment and management
 * used in banking, investment, and portfolio management
 */

const statistics = require('../core/statistics');
const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const riskManagement = {};

/**
 * Calculate Value at Risk (VaR) using historical simulation method
 * @param {Array} returns - Array of historical returns
 * @param {number} confidenceLevel - Confidence level (0-1), typically 0.95 or 0.99
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} horizon - Time horizon in days
 * @returns {number} - Value at Risk
 */
riskManagement.historicalVaR = function(returns, confidenceLevel, portfolioValue, horizon = 1) {
  if (!returns.length || confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Invalid inputs for VaR calculation');
  }
  
  // Sort returns in ascending order (from worst to best)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Find the percentile corresponding to the confidence level
  const index = Math.floor(sortedReturns.length * (1 - confidenceLevel));
  const percentile = sortedReturns[Math.max(0, index)];
  
  // Calculate VaR (absolute loss amount)
  const var_value = -percentile * portfolioValue * Math.sqrt(horizon);
  
  return Math.max(0, var_value); // VaR should be non-negative
};

/**
 * Calculate Value at Risk (VaR) using parametric (variance-covariance) method
 * @param {number} mean - Mean of returns
 * @param {number} stdDev - Standard deviation of returns
 * @param {number} confidenceLevel - Confidence level (0-1), typically 0.95 or 0.99
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} horizon - Time horizon in days
 * @returns {number} - Value at Risk
 */
riskManagement.parametricVaR = function(mean, stdDev, confidenceLevel, portfolioValue, horizon = 1) {
  if (confidenceLevel <= 0 || confidenceLevel >= 1 || stdDev < 0) {
    throw new Error('Invalid inputs for VaR calculation');
  }
  
  // Z-score for the confidence level
  const z = this._getZScore(confidenceLevel);
  
  // Calculate VaR: portfolio value * (mean - z * stdDev) * sqrt(horizon)
  // Typically mean is ignored for short horizons (set to 0)
  const var_value = portfolioValue * (-mean + z * stdDev) * Math.sqrt(horizon);
  
  return Math.max(0, var_value); // VaR should be non-negative
};

/**
 * Calculate Conditional Value at Risk (CVaR) / Expected Shortfall (ES)
 * @param {Array} returns - Array of historical returns
 * @param {number} confidenceLevel - Confidence level (0-1), typically 0.95 or 0.99
 * @param {number} portfolioValue - Current portfolio value
 * @returns {number} - Conditional Value at Risk
 */
riskManagement.conditionalVaR = function(returns, confidenceLevel, portfolioValue) {
  if (!returns.length || confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error('Invalid inputs for CVaR calculation');
  }
  
  // Sort returns in ascending order (from worst to best)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Find the cutoff index for VaR
  const cutoffIndex = Math.floor(sortedReturns.length * (1 - confidenceLevel));
  
  // Calculate average of returns beyond VaR (the tail losses)
  let tailSum = 0;
  for (let i = 0; i < cutoffIndex; i++) {
    tailSum += sortedReturns[i];
  }
  
  const expectedShortfall = cutoffIndex > 0 ? tailSum / cutoffIndex : sortedReturns[0];
  
  // Calculate CVaR (absolute loss amount)
  return -expectedShortfall * portfolioValue;
};

/**
 * Calculate portfolio volatility given asset weights and covariance matrix
 * @param {Array} weights - Array of asset weights in the portfolio
 * @param {Array} covarianceMatrix - Covariance matrix of asset returns
 * @returns {number} - Portfolio volatility (standard deviation)
 */
riskManagement.portfolioVolatility = function(weights, covarianceMatrix) {
  if (weights.length !== covarianceMatrix.length) {
    throw new Error('Dimensions mismatch between weights and covariance matrix');
  }
  
  // Calculate w^T * Σ * w
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * covarianceMatrix[i][j] * weights[j];
    }
  }
  
  return Math.sqrt(variance);
};

/**
 * Calculate Sharpe Ratio for a portfolio or asset
 * @param {number} expectedReturn - Expected portfolio return (annualized)
 * @param {number} volatility - Portfolio volatility/standard deviation (annualized)
 * @param {number} riskFreeRate - Risk-free rate (annualized)
 * @returns {number} - Sharpe Ratio
 */
riskManagement.sharpeRatio = function(expectedReturn, volatility, riskFreeRate = 0) {
  if (volatility <= 0) {
    throw new Error('Volatility must be positive');
  }
  
  return (expectedReturn - riskFreeRate) / volatility;
};

/**
 * Calculate Sortino Ratio using downside deviation instead of standard deviation
 * @param {number} expectedReturn - Expected portfolio return (annualized)
 * @param {Array} returns - Array of historical returns
 * @param {number} riskFreeRate - Risk-free rate (annualized)
 * @param {number} targetReturn - Minimum acceptable return (default = risk-free rate)
 * @returns {number} - Sortino Ratio
 */
riskManagement.sortinoRatio = function(expectedReturn, returns, riskFreeRate = 0, targetReturn = null) {
  if (!returns.length) {
    throw new Error('Empty returns array');
  }
  
  // If target return is not specified, use risk-free rate
  const target = targetReturn !== null ? targetReturn : riskFreeRate;
  
  // Calculate downside returns (below target)
  const downsideReturns = returns
    .filter(r => r < target)
    .map(r => Math.pow(r - target, 2));
  
  // Calculate downside deviation
  const downsideDeviation = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((sum, val) => sum + val, 0) / downsideReturns.length)
    : 0;
  
  // Handle case where there are no returns below target
  if (downsideDeviation === 0) {
    return Number.POSITIVE_INFINITY; // Perfect Sortino ratio
  }
  
  return (expectedReturn - riskFreeRate) / downsideDeviation;
};

/**
 * Calculate Maximum Drawdown from a price or portfolio value series
 * @param {Array} values - Array of prices or portfolio values
 * @returns {Object} - Maximum drawdown information
 */
riskManagement.maximumDrawdown = function(values) {
  if (!values.length) {
    throw new Error('Empty values array');
  }
  
  let maxValue = values[0];
  let maxDrawdown = 0;
  let maxDrawdownStart = 0;
  let maxDrawdownEnd = 0;
  let currentDrawdownStart = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > maxValue) {
      maxValue = values[i];
      currentDrawdownStart = i;
    }
    
    const drawdown = (maxValue - values[i]) / maxValue;
    
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownStart = currentDrawdownStart;
      maxDrawdownEnd = i;
    }
  }
  
  return {
    maxDrawdown,
    maxDrawdownStart,
    maxDrawdownEnd,
    drawdownPeriod: maxDrawdownEnd - maxDrawdownStart
  };
};

/**
 * Calculate Beta (β) of an asset or portfolio relative to a benchmark
 * @param {Array} assetReturns - Array of asset/portfolio returns
 * @param {Array} benchmarkReturns - Array of benchmark returns
 * @returns {number} - Beta coefficient
 */
riskManagement.beta = function(assetReturns, benchmarkReturns) {
  if (assetReturns.length !== benchmarkReturns.length || assetReturns.length === 0) {
    throw new Error('Return arrays must have the same non-zero length');
  }
  
  // Calculate covariance between asset and benchmark
  let sumProduct = 0;
  let assetMean = 0;
  let benchmarkMean = 0;
  
  // Calculate means
  for (let i = 0; i < assetReturns.length; i++) {
    assetMean += assetReturns[i];
    benchmarkMean += benchmarkReturns[i];
  }
  assetMean /= assetReturns.length;
  benchmarkMean /= benchmarkReturns.length;
  
  // Calculate covariance and benchmark variance
  let covariance = 0;
  let benchmarkVariance = 0;
  
  for (let i = 0; i < assetReturns.length; i++) {
    const assetDeviation = assetReturns[i] - assetMean;
    const benchmarkDeviation = benchmarkReturns[i] - benchmarkMean;
    
    covariance += assetDeviation * benchmarkDeviation;
    benchmarkVariance += benchmarkDeviation * benchmarkDeviation;
  }
  
  covariance /= assetReturns.length;
  benchmarkVariance /= benchmarkReturns.length;
  
  // Handle case where benchmark has zero variance
  if (benchmarkVariance === 0) {
    return 0; // Beta is 0 when benchmark has no volatility
  }
  
  return covariance / benchmarkVariance;
};

/**
 * Calculate Treynor Ratio
 * @param {number} expectedReturn - Expected portfolio return (annualized)
 * @param {number} beta - Portfolio beta relative to the market
 * @param {number} riskFreeRate - Risk-free rate (annualized)
 * @returns {number} - Treynor Ratio
 */
riskManagement.treynorRatio = function(expectedReturn, beta, riskFreeRate = 0) {
  if (beta === 0) {
    return Number.POSITIVE_INFINITY; // Undefined Treynor ratio
  }
  
  return (expectedReturn - riskFreeRate) / Math.abs(beta);
};

/**
 * Calculate Jensen's Alpha
 * @param {number} portfolioReturn - Portfolio return (annualized)
 * @param {number} beta - Portfolio beta relative to the market
 * @param {number} marketReturn - Market return (annualized)
 * @param {number} riskFreeRate - Risk-free rate (annualized)
 * @returns {number} - Jensen's Alpha
 */
riskManagement.jensensAlpha = function(portfolioReturn, beta, marketReturn, riskFreeRate = 0) {
  // Jensen's Alpha = Portfolio Return - [Risk Free Rate + Beta * (Market Return - Risk Free Rate)]
  return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
};

/**
 * Calculate portfolio diversification ratio
 * @param {Array} weights - Array of asset weights in the portfolio
 * @param {Array} covarianceMatrix - Covariance matrix of asset returns
 * @returns {number} - Diversification ratio (higher is more diversified)
 */
riskManagement.diversificationRatio = function(weights, covarianceMatrix) {
  if (weights.length !== covarianceMatrix.length) {
    throw new Error('Dimensions mismatch between weights and covariance matrix');
  }
  
  // Calculate weighted sum of individual volatilities
  let weightedVolSum = 0;
  for (let i = 0; i < weights.length; i++) {
    weightedVolSum += weights[i] * Math.sqrt(covarianceMatrix[i][i]);
  }
  
  // Calculate portfolio volatility
  const portfolioVol = this.portfolioVolatility(weights, covarianceMatrix);
  
  return weightedVolSum / portfolioVol;
};

/**
 * Calculate stress test impact on portfolio
 * @param {Array} assetValues - Array of asset values in the portfolio
 * @param {Array} stressShocks - Array of stress shock percentages for each asset
 * @returns {Object} - Stress test results
 */
riskManagement.stressTest = function(assetValues, stressShocks) {
  if (assetValues.length !== stressShocks.length) {
    throw new Error('Dimensions mismatch between asset values and stress shocks');
  }
  
  const initialValue = assetValues.reduce((sum, val) => sum + val, 0);
  const stressedValues = assetValues.map((value, i) => value * (1 - stressShocks[i]));
  const stressedTotal = stressedValues.reduce((sum, val) => sum + val, 0);
  const impactAmount = initialValue - stressedTotal;
  const impactPercent = impactAmount / initialValue;
  
  return {
    initialValue,
    stressedValue: stressedTotal,
    impactAmount,
    impactPercent,
    assetLosses: assetValues.map((value, i) => value * stressShocks[i])
  };
};

/**
 * Calculate optimal portfolio weights according to the Minimum Variance Portfolio
 * @param {Array} covarianceMatrix - Covariance matrix of asset returns
 * @returns {Array} - Optimal weights for minimum variance
 */
riskManagement.minimumVarianceWeights = function(covarianceMatrix) {
  const n = covarianceMatrix.length;
  
  // Create a vector of ones
  const ones = Array(n).fill(1);
  
  // Calculate the inverse of the covariance matrix
  const invCov = this._matrixInverse(covarianceMatrix);
  
  // Calculate optimal weights: (Σ^-1 * 1) / (1^T * Σ^-1 * 1)
  const numerator = this._matrixVectorMultiply(invCov, ones);
  
  // Calculate denominator: 1^T * Σ^-1 * 1
  const denominator = this._vectorDotProduct(ones, numerator);
  
  return numerator.map(w => w / denominator);
};

// Helper method to get Z-score for a confidence level
riskManagement._getZScore = function(confidence) {
  // This is a simple approximation of the inverse normal CDF
  // For 95% confidence, z ≈ 1.645
  // For 99% confidence, z ≈ 2.326
  if (confidence === 0.95) return 1.645;
  if (confidence === 0.99) return 2.326;
  
  // Approximation for other confidence levels
  const alpha = 1 - confidence;
  const y = Math.sqrt(-2 * Math.log(alpha / 2));
  return y - (2.515517 + 0.802853 * y + 0.010328 * y * y) / 
             (1 + 1.432788 * y + 0.189269 * y * y + 0.001308 * y * y * y);
};

// Matrix helper functions
riskManagement._matrixInverse = function(matrix) {
  // For simplicity, using a direct implementation for 2x2 matrix
  // For larger matrices, this should use a library or more robust algorithm
  const n = matrix.length;
  
  if (n === 1) {
    return [[1 / matrix[0][0]]];
  } else if (n === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is singular or nearly singular');
    }
    
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  } else {
    // For larger matrices, use a more robust method or library
    throw new Error('Matrix inversion for dimensions > 2 not implemented. Use external library.');
  }
};

riskManagement._matrixVectorMultiply = function(matrix, vector) {
  const result = [];
  
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }
  
  return result;
};

riskManagement._vectorDotProduct = function(vector1, vector2) {
  let result = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    result += vector1[i] * vector2[i];
  }
  
  return result;
};

module.exports = riskManagement;
