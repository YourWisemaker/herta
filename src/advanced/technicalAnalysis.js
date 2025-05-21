/**
 * Technical Analysis module for herta.js
 * Provides mathematical functions for technical analysis indicators and patterns
 * used in forex and cryptocurrency trading
 */

const statistics = require('../core/statistics');
const arithmetic = require('../core/arithmetic');

const technicalAnalysis = {};

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} prices - Array of price data
 * @param {number} period - Period for the moving average
 * @returns {Array} - Simple Moving Average values
 */
technicalAnalysis.sma = function(prices, period) {
  if (period <= 0 || period > prices.length) {
    throw new Error(`Invalid period: ${period}`);
  }
  
  const result = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} prices - Array of price data
 * @param {number} period - Period for the moving average
 * @returns {Array} - Exponential Moving Average values
 */
technicalAnalysis.ema = function(prices, period) {
  if (period <= 0 || period > prices.length) {
    throw new Error(`Invalid period: ${period}`);
  }
  
  const k = 2 / (period + 1);
  const result = [prices[0]];
  
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  
  return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} prices - Array of price data
 * @param {number} period - Period for RSI calculation (typically 14)
 * @returns {Array} - RSI values
 */
technicalAnalysis.rsi = function(prices, period = 14) {
  if (period <= 0 || period >= prices.length) {
    throw new Error(`Invalid period: ${period}`);
  }
  
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // Calculate average gains and losses
  const avgGains = [];
  const avgLosses = [];
  
  // First average is simple average
  let gainSum = 0;
  let lossSum = 0;
  
  for (let i = 0; i < period; i++) {
    gainSum += gains[i];
    lossSum += losses[i];
  }
  
  avgGains.push(gainSum / period);
  avgLosses.push(lossSum / period);
  
  // Subsequent averages use smoothing formula
  for (let i = period; i < gains.length; i++) {
    avgGains.push((avgGains[avgGains.length - 1] * (period - 1) + gains[i]) / period);
    avgLosses.push((avgLosses[avgLosses.length - 1] * (period - 1) + losses[i]) / period);
  }
  
  // Calculate RS and RSI
  const rsi = [];
  
  for (let i = 0; i < avgGains.length; i++) {
    if (avgLosses[i] === 0) {
      rsi.push(100);
    } else {
      const rs = avgGains[i] / avgLosses[i];
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
};

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param {Array} prices - Array of price data
 * @param {number} fastPeriod - Fast EMA period (typically 12)
 * @param {number} slowPeriod - Slow EMA period (typically 26)
 * @param {number} signalPeriod - Signal EMA period (typically 9)
 * @returns {Object} - MACD line, signal line, and histogram
 */
technicalAnalysis.macd = function(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (slowPeriod <= fastPeriod || prices.length <= slowPeriod) {
    throw new Error('Invalid MACD parameters');
  }
  
  // Calculate fast and slow EMAs
  const fastEMA = this.ema(prices, fastPeriod);
  const slowEMA = this.ema(prices, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine = [];
  
  // Align MACD line with the slow EMA (which starts later)
  const diff = slowPeriod - fastPeriod;
  for (let i = 0; i < fastEMA.length - diff; i++) {
    macdLine.push(fastEMA[i + diff] - slowEMA[i]);
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = this.ema(macdLine, signalPeriod);
  
  // Calculate histogram (MACD line - signal line)
  const histogram = [];
  
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalPeriod - 1] - signalLine[i]);
  }
  
  return {
    macdLine,
    signalLine,
    histogram
  };
};

/**
 * Calculate Bollinger Bands
 * @param {Array} prices - Array of price data
 * @param {number} period - Period for moving average (typically 20)
 * @param {number} stdDevMultiplier - Multiplier for standard deviation (typically 2)
 * @returns {Object} - Upper band, middle band (SMA), and lower band
 */
technicalAnalysis.bollingerBands = function(prices, period = 20, stdDevMultiplier = 2) {
  if (period <= 0 || period >= prices.length) {
    throw new Error(`Invalid period: ${period}`);
  }
  
  const middleBand = this.sma(prices, period);
  const upperBand = [];
  const lowerBand = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    // Calculate standard deviation for the period
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Math.pow(prices[i - j] - middleBand[i - (period - 1)], 2);
    }
    const stdDev = Math.sqrt(sum / period);
    
    // Calculate upper and lower bands
    upperBand.push(middleBand[i - (period - 1)] + stdDevMultiplier * stdDev);
    lowerBand.push(middleBand[i - (period - 1)] - stdDevMultiplier * stdDev);
  }
  
  return {
    upperBand,
    middleBand,
    lowerBand
  };
};

/**
 * Calculate Average True Range (ATR)
 * @param {Array} highPrices - Array of high prices
 * @param {Array} lowPrices - Array of low prices
 * @param {Array} closePrices - Array of closing prices
 * @param {number} period - Period for ATR calculation (typically 14)
 * @returns {Array} - ATR values
 */
technicalAnalysis.atr = function(highPrices, lowPrices, closePrices, period = 14) {
  if (period <= 0 || highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
    throw new Error('Invalid inputs for ATR calculation');
  }
  
  // Calculate true ranges
  const trueRanges = [highPrices[0] - lowPrices[0]]; // Initial TR is just the range
  
  for (let i = 1; i < highPrices.length; i++) {
    const tr1 = highPrices[i] - lowPrices[i]; // Current high - current low
    const tr2 = Math.abs(highPrices[i] - closePrices[i - 1]); // Current high - previous close
    const tr3 = Math.abs(lowPrices[i] - closePrices[i - 1]); // Current low - previous close
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate ATR using Wilder's smoothing method
  const atr = [trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period];
  
  for (let i = period; i < trueRanges.length; i++) {
    atr.push((atr[atr.length - 1] * (period - 1) + trueRanges[i]) / period);
  }
  
  return atr;
};

/**
 * Calculate Stochastic Oscillator
 * @param {Array} highPrices - Array of high prices
 * @param {Array} lowPrices - Array of low prices
 * @param {Array} closePrices - Array of closing prices
 * @param {number} kPeriod - %K period (typically 14)
 * @param {number} dPeriod - %D period (typically 3)
 * @returns {Object} - %K and %D values
 */
technicalAnalysis.stochasticOscillator = function(highPrices, lowPrices, closePrices, kPeriod = 14, dPeriod = 3) {
  if (kPeriod <= 0 || dPeriod <= 0 || highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
    throw new Error('Invalid inputs for Stochastic Oscillator calculation');
  }
  
  const kValues = [];
  
  // Calculate %K values
  for (let i = kPeriod - 1; i < closePrices.length; i++) {
    // Find highest high and lowest low in the period
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    
    for (let j = 0; j < kPeriod; j++) {
      highestHigh = Math.max(highestHigh, highPrices[i - j]);
      lowestLow = Math.min(lowestLow, lowPrices[i - j]);
    }
    
    // Calculate %K: (Current Close - Lowest Low) / (Highest High - Lowest Low) * 100
    if (highestHigh === lowestLow) {
      kValues.push(50); // If price doesn't change, default to middle value
    } else {
      kValues.push(((closePrices[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
    }
  }
  
  // Calculate %D values (SMA of %K)
  const dValues = this.sma(kValues, dPeriod);
  
  return {
    k: kValues,
    d: dValues
  };
};

/**
 * Calculate Fibonacci Retracement levels
 * @param {number} high - High price of the trend
 * @param {number} low - Low price of the trend
 * @returns {Object} - Fibonacci retracement levels
 */
technicalAnalysis.fibonacciRetracement = function(high, low) {
  if (high <= low) {
    throw new Error('High price must be greater than low price');
  }
  
  const diff = high - low;
  
  return {
    level0: high,                    // 0% retracement (high)
    level236: high - 0.236 * diff,   // 23.6% retracement
    level382: high - 0.382 * diff,   // 38.2% retracement
    level500: high - 0.5 * diff,     // 50% retracement
    level618: high - 0.618 * diff,   // 61.8% retracement
    level786: high - 0.786 * diff,   // 78.6% retracement
    level1000: low                   // 100% retracement (low)
  };
};

/**
 * Calculate Ichimoku Cloud components
 * @param {Array} highPrices - Array of high prices
 * @param {Array} lowPrices - Array of low prices
 * @param {Array} closePrices - Array of closing prices
 * @param {number} tenkanPeriod - Tenkan-sen period (typically 9)
 * @param {number} kijunPeriod - Kijun-sen period (typically 26)
 * @param {number} senkouBPeriod - Senkou Span B period (typically 52)
 * @returns {Object} - Ichimoku Cloud components
 */
technicalAnalysis.ichimokuCloud = function(highPrices, lowPrices, closePrices, tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52) {
  if (highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
    throw new Error('Input arrays must have the same length');
  }
  
  // Tenkan-sen (Conversion Line): (highest high + lowest low) / 2 for tenkanPeriod
  const tenkanSen = [];
  for (let i = tenkanPeriod - 1; i < highPrices.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    
    for (let j = 0; j < tenkanPeriod; j++) {
      highestHigh = Math.max(highestHigh, highPrices[i - j]);
      lowestLow = Math.min(lowestLow, lowPrices[i - j]);
    }
    
    tenkanSen.push((highestHigh + lowestLow) / 2);
  }
  
  // Kijun-sen (Base Line): (highest high + lowest low) / 2 for kijunPeriod
  const kijunSen = [];
  for (let i = kijunPeriod - 1; i < highPrices.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    
    for (let j = 0; j < kijunPeriod; j++) {
      highestHigh = Math.max(highestHigh, highPrices[i - j]);
      lowestLow = Math.min(lowestLow, lowPrices[i - j]);
    }
    
    kijunSen.push((highestHigh + lowestLow) / 2);
  }
  
  // Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2, shifted forward kijunPeriod bars
  const senkouSpanA = [];
  const minTenkanKijunLength = Math.min(tenkanSen.length, kijunSen.length);
  
  for (let i = 0; i < minTenkanKijunLength; i++) {
    senkouSpanA.push((tenkanSen[i] + kijunSen[i]) / 2);
  }
  
  // Senkou Span B (Leading Span B): (highest high + lowest low) / 2 for senkouBPeriod, shifted forward kijunPeriod bars
  const senkouSpanB = [];
  for (let i = senkouBPeriod - 1; i < highPrices.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    
    for (let j = 0; j < senkouBPeriod; j++) {
      highestHigh = Math.max(highestHigh, highPrices[i - j]);
      lowestLow = Math.min(lowestLow, lowPrices[i - j]);
    }
    
    senkouSpanB.push((highestHigh + lowestLow) / 2);
  }
  
  // Chikou Span (Lagging Span): Current closing price, shifted backwards by kijunPeriod bars
  const chikouSpan = [...closePrices];
  
  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB,
    chikouSpan
  };
};

/**
 * Detect support and resistance levels using Pivot Points
 * @param {number} high - High price of the period
 * @param {number} low - Low price of the period
 * @param {number} close - Closing price of the period
 * @returns {Object} - Pivot point, support levels, and resistance levels
 */
technicalAnalysis.pivotPoints = function(high, low, close) {
  // Calculate pivot point
  const pivot = (high + low + close) / 3;
  
  // Calculate support levels
  const s1 = 2 * pivot - high;
  const s2 = pivot - (high - low);
  const s3 = low - 2 * (high - pivot);
  
  // Calculate resistance levels
  const r1 = 2 * pivot - low;
  const r2 = pivot + (high - low);
  const r3 = high + 2 * (pivot - low);
  
  return {
    pivot,
    resistance: { r1, r2, r3 },
    support: { s1, s2, s3 }
  };
};

/**
 * Calculate On-Balance Volume (OBV)
 * @param {Array} closePrices - Array of closing prices
 * @param {Array} volumes - Array of volume data
 * @returns {Array} - OBV values
 */
technicalAnalysis.obv = function(closePrices, volumes) {
  if (closePrices.length !== volumes.length) {
    throw new Error('Price and volume arrays must have the same length');
  }
  
  const obv = [volumes[0]]; // Initial OBV is just the first volume
  
  for (let i = 1; i < closePrices.length; i++) {
    if (closePrices[i] > closePrices[i - 1]) {
      // Price up, add volume
      obv.push(obv[obv.length - 1] + volumes[i]);
    } else if (closePrices[i] < closePrices[i - 1]) {
      // Price down, subtract volume
      obv.push(obv[obv.length - 1] - volumes[i]);
    } else {
      // Price unchanged, OBV unchanged
      obv.push(obv[obv.length - 1]);
    }
  }
  
  return obv;
};

/**
 * Calculate Parabolic SAR (Stop and Reverse)
 * @param {Array} highPrices - Array of high prices
 * @param {Array} lowPrices - Array of low prices
 * @param {number} initialAF - Initial acceleration factor (typically 0.02)
 * @param {number} maxAF - Maximum acceleration factor (typically 0.2)
 * @returns {Array} - Parabolic SAR values
 */
technicalAnalysis.parabolicSar = function(highPrices, lowPrices, initialAF = 0.02, maxAF = 0.2) {
  if (highPrices.length !== lowPrices.length || highPrices.length < 2) {
    throw new Error('Invalid inputs for Parabolic SAR calculation');
  }
  
  const sar = [];
  let isUptrend = true; // Initial trend (assume uptrend)
  let ep = highPrices[0]; // Extreme point
  let af = initialAF; // Acceleration factor
  
  // Start with second bar as PSAR needs a prior bar
  sar.push(lowPrices[0]); // Initial SAR is the first low (for uptrend)
  
  for (let i = 1; i < highPrices.length; i++) {
    // Calculate current SAR
    const prevSar = sar[sar.length - 1];
    let currentSar = prevSar + af * (ep - prevSar);
    
    // Ensure SAR doesn't penetrate the previous two candles
    if (isUptrend) {
      currentSar = Math.min(currentSar, lowPrices[i - 1], i >= 2 ? lowPrices[i - 2] : lowPrices[i - 1]);
    } else {
      currentSar = Math.max(currentSar, highPrices[i - 1], i >= 2 ? highPrices[i - 2] : highPrices[i - 1]);
    }
    
    // Check for trend reversal
    if ((isUptrend && currentSar > lowPrices[i]) || (!isUptrend && currentSar < highPrices[i])) {
      // Trend reversal
      isUptrend = !isUptrend;
      currentSar = isUptrend ? Math.min(lowPrices[i - 1], lowPrices[i]) : Math.max(highPrices[i - 1], highPrices[i]);
      ep = isUptrend ? highPrices[i] : lowPrices[i];
      af = initialAF;
    } else {
      // No reversal
      if (isUptrend) {
        if (highPrices[i] > ep) {
          ep = highPrices[i];
          af = Math.min(af + initialAF, maxAF); // Increment AF
        }
      } else {
        if (lowPrices[i] < ep) {
          ep = lowPrices[i];
          af = Math.min(af + initialAF, maxAF); // Increment AF
        }
      }
    }
    
    sar.push(currentSar);
  }
  
  return sar;
};

/**
 * Detect Double Top pattern
 * @param {Array} prices - Array of price data
 * @param {number} tolerance - Percentage tolerance for top equality (e.g., 0.02 for 2%)
 * @returns {Array} - Array of indices where double tops occur
 */
technicalAnalysis.detectDoubleTop = function(prices, tolerance = 0.02) {
  const peaks = [];
  const doubleTops = [];
  
  // Find local peaks (price is higher than both neighbors)
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
      peaks.push(i);
    }
  }
  
  // Look for pairs of peaks with similar heights and a valley between
  for (let i = 0; i < peaks.length - 1; i++) {
    const peak1 = peaks[i];
    const peak1Price = prices[peak1];
    
    for (let j = i + 1; j < peaks.length; j++) {
      const peak2 = peaks[j];
      const peak2Price = prices[peak2];
      
      // Check if peaks are similar in height
      const priceDiff = Math.abs(peak1Price - peak2Price) / peak1Price;
      
      if (priceDiff <= tolerance) {
        // Find lowest price between the peaks
        let valley = Infinity;
        let valleyIndex = -1;
        
        for (let k = peak1 + 1; k < peak2; k++) {
          if (prices[k] < valley) {
            valley = prices[k];
            valleyIndex = k;
          }
        }
        
        // Check if valley is significantly lower than peaks
        const valleyDepth1 = (peak1Price - valley) / peak1Price;
        const valleyDepth2 = (peak2Price - valley) / peak2Price;
        
        if (valleyDepth1 > 0.05 && valleyDepth2 > 0.05) {
          doubleTops.push({
            peak1Index: peak1,
            peak2Index: peak2,
            valleyIndex,
            peak1Price,
            peak2Price,
            valleyPrice: valley
          });
        }
      }
    }
  }
  
  return doubleTops;
};

module.exports = technicalAnalysis;
