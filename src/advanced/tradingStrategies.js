/**
 * Trading Strategies module for herta.js
 * Provides implementations of quantitative trading strategies
 * for forex and cryptocurrency trading
 */

const statistics = require('../core/statistics');
const technicalAnalysis = require('./technicalAnalysis');

const tradingStrategies = {};

/**
 * Calculate optimal position size based on Kelly Criterion
 * @param {number} winRate - Probability of winning (0-1)
 * @param {number} winLossRatio - Ratio of average win to average loss
 * @param {number} capitalAmount - Total capital available
 * @param {number} maxRiskPercent - Maximum risk percentage (optional)
 * @returns {number} - Optimal position size
 */
tradingStrategies.kellyPositionSize = function(winRate, winLossRatio, capitalAmount, maxRiskPercent = 0.2) {
  // Kelly fraction = (p * b - q) / b
  // where p = probability of win, q = probability of loss (1-p), b = win/loss ratio
  const kellyFraction = (winRate * winLossRatio - (1 - winRate)) / winLossRatio;
  
  // Limit the maximum risk using the half-Kelly or specified max percentage
  const adjustedFraction = Math.min(kellyFraction, maxRiskPercent);
  
  // Return the position size (can't be negative)
  return Math.max(0, adjustedFraction * capitalAmount);
};

/**
 * Calculate optimal stop loss and take profit levels based on volatility
 * @param {number} entryPrice - Entry price of the position
 * @param {Array} prices - Historical price data
 * @param {number} atrMultiplier - Multiplier for ATR (Average True Range)
 * @param {number} riskRewardRatio - Desired risk-to-reward ratio
 * @returns {Object} - Stop loss and take profit prices
 */
tradingStrategies.volatilityBasedLevels = function(entryPrice, prices, atrMultiplier = 2, riskRewardRatio = 2) {
  if (prices.length < 15) {
    throw new Error('Insufficient historical data');
  }
  
  // Extract OHLC data
  const highPrices = prices.map(p => p.high || p);
  const lowPrices = prices.map(p => p.low || p);
  const closePrices = prices.map(p => p.close || p);
  
  // Calculate ATR
  const atr = technicalAnalysis.atr(highPrices, lowPrices, closePrices, 14).slice(-1)[0];
  
  // Calculate stop loss distance based on ATR
  const stopDistance = atr * atrMultiplier;
  
  // Calculate stop loss and take profit levels
  const isLong = true; // Assume long position for simplicity
  const stopLoss = isLong ? entryPrice - stopDistance : entryPrice + stopDistance;
  const takeProfit = isLong ? 
    entryPrice + (stopDistance * riskRewardRatio) : 
    entryPrice - (stopDistance * riskRewardRatio);
  
  return {
    entryPrice,
    stopLoss,
    takeProfit,
    riskAmount: Math.abs(entryPrice - stopLoss),
    rewardAmount: Math.abs(takeProfit - entryPrice)
  };
};

/**
 * Evaluate performance of a trading strategy based on historical data
 * @param {Array} trades - Array of trade objects with entry, exit, and type (long/short) properties
 * @param {number} initialCapital - Initial capital amount
 * @returns {Object} - Performance metrics
 */
tradingStrategies.evaluatePerformance = function(trades, initialCapital = 10000) {
  if (!trades.length) {
    throw new Error('No trades provided for evaluation');
  }
  
  let capital = initialCapital;
  let highWaterMark = initialCapital;
  let maxDrawdown = 0;
  let winCount = 0;
  let lossCount = 0;
  const returns = [];
  
  // Process each trade
  for (const trade of trades) {
    const entryPrice = trade.entryPrice;
    const exitPrice = trade.exitPrice;
    const size = trade.size || 1; // Position size (units/contracts)
    const isLong = trade.type === 'long';
    
    // Calculate profit/loss
    const pnl = isLong ? 
      (exitPrice - entryPrice) * size : 
      (entryPrice - exitPrice) * size;
    
    // Update capital
    capital += pnl;
    
    // Update high water mark and max drawdown
    if (capital > highWaterMark) {
      highWaterMark = capital;
    } else {
      const drawdown = (highWaterMark - capital) / highWaterMark;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Update win/loss count
    if (pnl > 0) {
      winCount++;
    } else if (pnl < 0) {
      lossCount++;
    }
    
    // Calculate return for this trade
    returns.push(pnl / initialCapital);
  }
  
  // Calculate performance metrics
  const totalReturns = (capital - initialCapital) / initialCapital;
  const winRate = winCount / trades.length;
  
  // Calculate Sharpe Ratio (assuming annual and risk-free rate of 0)
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDevReturn = Math.sqrt(
    returns.reduce((sum, value) => sum + Math.pow(value - meanReturn, 2), 0) / returns.length
  );
  const sharpeRatio = meanReturn / stdDevReturn * Math.sqrt(252); // Annualized
  
  return {
    finalCapital: capital,
    totalReturns,
    totalPnL: capital - initialCapital,
    maxDrawdown,
    winRate,
    winCount,
    lossCount,
    tradeCount: trades.length,
    sharpeRatio
  };
};

/**
 * Trend Following strategy implementation
 * @param {Array} prices - Historical price array
 * @param {Object} params - Strategy parameters
 * @returns {Array} - Array of trade signals
 */
tradingStrategies.trendFollowing = function(prices, params = {}) {
  const { 
    shortPeriod = 20, 
    longPeriod = 50,
    stopLossPercent = 0.02
  } = params;
  
  if (prices.length < longPeriod + 10) {
    throw new Error('Insufficient historical data');
  }
  
  const closePrices = prices.map(p => p.close || p);
  
  // Calculate moving averages
  const shortMA = technicalAnalysis.sma(closePrices, shortPeriod);
  const longMA = technicalAnalysis.sma(closePrices, longPeriod);
  
  // Align data (longMA will be shorter)
  const diff = shortPeriod - longPeriod;
  const shortMAAligned = shortMA.slice(Math.abs(diff));
  const longMAAligned = longMA;
  
  // Generate signals
  const signals = [];
  let position = null;
  
  for (let i = 1; i < longMAAligned.length; i++) {
    const crossingUp = shortMAAligned[i - 1] <= longMAAligned[i - 1] && 
                      shortMAAligned[i] > longMAAligned[i];
                      
    const crossingDown = shortMAAligned[i - 1] >= longMAAligned[i - 1] && 
                        shortMAAligned[i] < longMAAligned[i];
    
    // Calculate actual price index
    const priceIndex = i + longPeriod - 1;
    const currentPrice = closePrices[priceIndex];
    
    // Check stop loss if in position
    if (position) {
      const stopLossHit = position.type === 'long' 
        ? currentPrice < position.entryPrice * (1 - stopLossPercent)
        : currentPrice > position.entryPrice * (1 + stopLossPercent);
        
      if (stopLossHit) {
        signals.push({
          type: 'exit',
          reason: 'stop_loss',
          price: currentPrice,
          time: priceIndex,
          position: position.type
        });
        position = null;
        continue;
      }
    }
    
    // Entry signals
    if (!position && crossingUp) {
      position = {
        type: 'long',
        entryPrice: currentPrice,
        entryTime: priceIndex
      };
      
      signals.push({
        type: 'entry',
        direction: 'long',
        price: currentPrice,
        time: priceIndex
      });
    } 
    else if (!position && crossingDown) {
      position = {
        type: 'short',
        entryPrice: currentPrice,
        entryTime: priceIndex
      };
      
      signals.push({
        type: 'entry',
        direction: 'short',
        price: currentPrice,
        time: priceIndex
      });
    }
    // Exit signals
    else if (position && position.type === 'long' && crossingDown) {
      signals.push({
        type: 'exit',
        reason: 'signal',
        price: currentPrice,
        time: priceIndex,
        position: 'long'
      });
      position = null;
    }
    else if (position && position.type === 'short' && crossingUp) {
      signals.push({
        type: 'exit',
        reason: 'signal',
        price: currentPrice,
        time: priceIndex,
        position: 'short'
      });
      position = null;
    }
  }
  
  return signals;
};

/**
 * Mean Reversion strategy implementation
 * @param {Array} prices - Historical price array
 * @param {Object} params - Strategy parameters
 * @returns {Array} - Array of trade signals
 */
tradingStrategies.meanReversion = function(prices, params = {}) {
  const { 
    lookbackPeriod = 20,
    entryThreshold = 2.0,
    exitThreshold = 0.5,
    maxHoldingDays = 10
  } = params;
  
  if (prices.length < lookbackPeriod + 10) {
    throw new Error('Insufficient historical data');
  }
  
  const closePrices = prices.map(p => p.close || p);
  
  // Calculate Bollinger Bands
  const { upperBand, middleBand, lowerBand } = 
    technicalAnalysis.bollingerBands(closePrices, lookbackPeriod, entryThreshold);
  
  // Generate signals
  const signals = [];
  let position = null;
  
  for (let i = 0; i < upperBand.length; i++) {
    // Calculate actual price index
    const priceIndex = i + lookbackPeriod - 1;
    const currentPrice = closePrices[priceIndex];
    
    // Check if we've held a position too long
    if (position && (priceIndex - position.entryTime) >= maxHoldingDays) {
      signals.push({
        type: 'exit',
        reason: 'time_limit',
        price: currentPrice,
        time: priceIndex,
        position: position.type
      });
      position = null;
    }
    
    // Entry signals
    if (!position && currentPrice > upperBand[i]) {
      // Price above upper band - enter short
      position = {
        type: 'short',
        entryPrice: currentPrice,
        entryTime: priceIndex,
        middleBandAtEntry: middleBand[i]
      };
      
      signals.push({
        type: 'entry',
        direction: 'short',
        price: currentPrice,
        time: priceIndex
      });
    } 
    else if (!position && currentPrice < lowerBand[i]) {
      // Price below lower band - enter long
      position = {
        type: 'long',
        entryPrice: currentPrice,
        entryTime: priceIndex,
        middleBandAtEntry: middleBand[i]
      };
      
      signals.push({
        type: 'entry',
        direction: 'long',
        price: currentPrice,
        time: priceIndex
      });
    }
    // Exit signals
    else if (position && position.type === 'short' && 
             currentPrice <= position.middleBandAtEntry) {
      signals.push({
        type: 'exit',
        reason: 'target',
        price: currentPrice,
        time: priceIndex,
        position: 'short'
      });
      position = null;
    }
    else if (position && position.type === 'long' && 
             currentPrice >= position.middleBandAtEntry) {
      signals.push({
        type: 'exit',
        reason: 'target',
        price: currentPrice,
        time: priceIndex,
        position: 'long'
      });
      position = null;
    }
  }
  
  return signals;
};

/**
 * Pair Trading strategy implementation
 * @param {Array} pricesA - Historical price array for first asset
 * @param {Array} pricesB - Historical price array for second asset
 * @param {Object} params - Strategy parameters
 * @returns {Array} - Array of trade signals
 */
tradingStrategies.pairTrading = function(pricesA, pricesB, params = {}) {
  const { 
    lookbackPeriod = 30,
    entryThreshold = 2.0,
    exitThreshold = 0.5
  } = params;
  
  if (pricesA.length !== pricesB.length || pricesA.length < lookbackPeriod + 10) {
    throw new Error('Invalid price data for pair trading');
  }
  
  const closePricesA = pricesA.map(p => p.close || p);
  const closePricesB = pricesB.map(p => p.close || p);
  
  // Calculate price ratio
  const priceRatio = closePricesA.map((price, i) => price / closePricesB[i]);
  
  // Calculate z-score of the ratio
  const zScores = [];
  for (let i = lookbackPeriod - 1; i < priceRatio.length; i++) {
    const ratioWindow = priceRatio.slice(i - lookbackPeriod + 1, i + 1);
    const mean = ratioWindow.reduce((sum, val) => sum + val, 0) / lookbackPeriod;
    const stdDev = Math.sqrt(
      ratioWindow.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / lookbackPeriod
    );
    
    zScores.push((priceRatio[i] - mean) / (stdDev || 1)); // Avoid division by zero
  }
  
  // Generate signals
  const signals = [];
  let position = null;
  
  for (let i = 0; i < zScores.length; i++) {
    const priceIndex = i + lookbackPeriod - 1;
    const currentZScore = zScores[i];
    
    // Entry signals
    if (!position && currentZScore > entryThreshold) {
      // Ratio is too high - short A, long B
      position = {
        type: 'divergence',
        direction: 'ratio_short',
        entryZScore: currentZScore,
        entryTime: priceIndex
      };
      
      signals.push({
        type: 'entry',
        direction: 'ratio_short',
        priceA: closePricesA[priceIndex],
        priceB: closePricesB[priceIndex],
        ratio: priceRatio[priceIndex],
        zScore: currentZScore,
        time: priceIndex
      });
    } 
    else if (!position && currentZScore < -entryThreshold) {
      // Ratio is too low - long A, short B
      position = {
        type: 'divergence',
        direction: 'ratio_long',
        entryZScore: currentZScore,
        entryTime: priceIndex
      };
      
      signals.push({
        type: 'entry',
        direction: 'ratio_long',
        priceA: closePricesA[priceIndex],
        priceB: closePricesB[priceIndex],
        ratio: priceRatio[priceIndex],
        zScore: currentZScore,
        time: priceIndex
      });
    }
    // Exit signals
    else if (position && position.direction === 'ratio_short' && 
             currentZScore <= exitThreshold) {
      signals.push({
        type: 'exit',
        reason: 'convergence',
        priceA: closePricesA[priceIndex],
        priceB: closePricesB[priceIndex],
        ratio: priceRatio[priceIndex],
        zScore: currentZScore,
        time: priceIndex,
        position: 'ratio_short'
      });
      position = null;
    }
    else if (position && position.direction === 'ratio_long' && 
             currentZScore >= -exitThreshold) {
      signals.push({
        type: 'exit',
        reason: 'convergence',
        priceA: closePricesA[priceIndex],
        priceB: closePricesB[priceIndex],
        ratio: priceRatio[priceIndex],
        zScore: currentZScore,
        time: priceIndex,
        position: 'ratio_long'
      });
      position = null;
    }
  }
  
  return signals;
};

module.exports = tradingStrategies;
