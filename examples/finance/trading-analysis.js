/**
 * Trading Analysis Example with Herta.js
 * Demonstrates technical analysis indicators and trading strategy evaluation
 */

const herta = require('../../src/index.js');

console.log('Herta.js Trading & Financial Analysis Example');
console.log('============================================\n');

// Sample price data (BTC/USD daily prices)
const btcPrices = [
  {
    date: '2023-01-01', open: 16500, high: 16800, low: 16400, close: 16600, volume: 12500
  },
  {
    date: '2023-01-02', open: 16600, high: 17000, low: 16550, close: 16900, volume: 14200
  },
  {
    date: '2023-01-03', open: 16900, high: 17100, low: 16800, close: 17050, volume: 15300
  },
  {
    date: '2023-01-04', open: 17050, high: 17200, low: 16900, close: 17100, volume: 13100
  },
  {
    date: '2023-01-05', open: 17100, high: 17300, low: 16950, close: 17250, volume: 15800
  },
  {
    date: '2023-01-06', open: 17250, high: 17400, low: 17100, close: 17350, volume: 16200
  },
  {
    date: '2023-01-07', open: 17350, high: 17500, low: 17200, close: 17450, volume: 14500
  },
  {
    date: '2023-01-08', open: 17450, high: 17600, low: 17300, close: 17550, volume: 13800
  },
  {
    date: '2023-01-09', open: 17550, high: 17700, low: 17400, close: 17650, volume: 15100
  },
  {
    date: '2023-01-10', open: 17650, high: 17800, low: 17500, close: 17750, volume: 16500
  },
  {
    date: '2023-01-11', open: 17750, high: 17900, low: 17600, close: 17850, volume: 17200
  },
  {
    date: '2023-01-12', open: 17850, high: 18000, low: 17700, close: 17950, volume: 18100
  },
  {
    date: '2023-01-13', open: 17950, high: 18100, low: 17800, close: 18050, volume: 17500
  },
  {
    date: '2023-01-14', open: 18050, high: 18200, low: 17900, close: 18150, volume: 16800
  },
  {
    date: '2023-01-15', open: 18150, high: 18300, low: 18000, close: 18250, volume: 17900
  },
  {
    date: '2023-01-16', open: 18250, high: 18400, low: 18100, close: 18350, volume: 18300
  },
  {
    date: '2023-01-17', open: 18350, high: 18500, low: 18200, close: 18450, volume: 19200
  },
  {
    date: '2023-01-18', open: 18450, high: 18600, low: 18300, close: 18550, volume: 20100
  },
  {
    date: '2023-01-19', open: 18550, high: 18700, low: 18400, close: 18650, volume: 21300
  },
  {
    date: '2023-01-20', open: 18650, high: 18800, low: 18500, close: 18750, volume: 22500
  },
  {
    date: '2023-01-21', open: 18750, high: 18900, low: 18600, close: 18000, volume: 25100
  }, // Price drop
  {
    date: '2023-01-22', open: 18000, high: 18200, low: 17800, close: 17900, volume: 23400
  },
  {
    date: '2023-01-23', open: 17900, high: 18000, low: 17700, close: 17800, volume: 19800
  },
  {
    date: '2023-01-24', open: 17800, high: 17900, low: 17600, close: 17700, volume: 18200
  },
  {
    date: '2023-01-25', open: 17700, high: 17800, low: 17500, close: 17900, volume: 17500
  }, // Starting to recover
  {
    date: '2023-01-26', open: 17900, high: 18000, low: 17800, close: 18100, volume: 18700
  },
  {
    date: '2023-01-27', open: 18100, high: 18300, low: 18000, close: 18250, volume: 19500
  },
  {
    date: '2023-01-28', open: 18250, high: 18400, low: 18100, close: 18350, volume: 20300
  },
  {
    date: '2023-01-29', open: 18350, high: 18500, low: 18200, close: 18450, volume: 21100
  },
  {
    date: '2023-01-30', open: 18450, high: 18600, low: 18300, close: 18550, volume: 22800
  }
];

// Extract close prices for indicators
const closePrices = btcPrices.map((bar) => bar.close);
const highPrices = btcPrices.map((bar) => bar.high);
const lowPrices = btcPrices.map((bar) => bar.low);
const volumes = btcPrices.map((bar) => bar.volume);

// Technical Analysis Section
console.log('Technical Analysis Indicators:');
console.log('------------------------------');

// 1. Calculate Simple Moving Average (SMA)
const sma20 = herta.technicalAnalysis.sma(closePrices, 10);
console.log('SMA (10-period):');
console.log(sma20.slice(-5).map((value) => value.toFixed(2)));

// 2. Calculate Relative Strength Index (RSI)
const rsi = herta.technicalAnalysis.rsi(closePrices, 14);
console.log('\nRSI (14-period):');
console.log(rsi.slice(-5).map((value) => value.toFixed(2)));

// 3. Calculate Bollinger Bands
const { upperBand, middleBand, lowerBand } = herta.technicalAnalysis.bollingerBands(closePrices, 20, 2);
console.log('\nBollinger Bands (20-period, 2 std dev):');
console.log('Upper Band:', upperBand.slice(-3).map((value) => value.toFixed(2)));
console.log('Middle Band:', middleBand.slice(-3).map((value) => value.toFixed(2)));
console.log('Lower Band:', lowerBand.slice(-3).map((value) => value.toFixed(2)));

// 4. Calculate MACD
const macdResult = herta.technicalAnalysis.macd(closePrices);
console.log('\nMACD:');
console.log('MACD Line:', macdResult.macdLine.slice(-3).map((value) => value.toFixed(2)));
console.log('Signal Line:', macdResult.signalLine.slice(-3).map((value) => value.toFixed(2)));
console.log('Histogram:', macdResult.histogram.slice(-3).map((value) => value.toFixed(2)));

// Trading Strategies Section
console.log('\n\nTrading Strategies:');
console.log('------------------');

// 1. Implement a Simple Moving Average Crossover Strategy
console.log('SMA Crossover Strategy:');
const shortSMA = herta.technicalAnalysis.sma(closePrices, 5);
const longSMA = herta.technicalAnalysis.sma(closePrices, 10);

// Align the SMAs (they have different lengths)
const shortSMAAligned = shortSMA.slice(5);
const longSMAAligned = longSMA;

// Find crossover signals
const signals = [];
for (let i = 1; i < longSMAAligned.length; i++) {
  // Bullish crossover (short SMA crosses above long SMA)
  if (shortSMAAligned[i - 1] <= longSMAAligned[i - 1] && shortSMAAligned[i] > longSMAAligned[i]) {
    signals.push({
      type: 'buy',
      index: i + 10, // Adjust for the original data index
      price: closePrices[i + 10]
    });
  }
  // Bearish crossover (short SMA crosses below long SMA)
  else if (shortSMAAligned[i - 1] >= longSMAAligned[i - 1] && shortSMAAligned[i] < longSMAAligned[i]) {
    signals.push({
      type: 'sell',
      index: i + 10, // Adjust for the original data index
      price: closePrices[i + 10]
    });
  }
}

// Display signals
console.log('Strategy signals:');
signals.forEach((signal) => {
  console.log(`${signal.type.toUpperCase()} at index ${signal.index}, price: $${signal.price}`);
});

// 2. Implement a trend following strategy using the herta.tradingStrategies module
console.log('\nTrend Following Strategy:');
const trendSignals = herta.tradingStrategies.trendFollowing(btcPrices, {
  shortPeriod: 10,
  longPeriod: 20,
  stopLossPercent: 0.05
});

console.log('Trend following signals:', trendSignals.length);
trendSignals.slice(0, 3).forEach((signal) => {
  console.log(`${signal.type} ${signal.direction || ''} at price $${signal.price}`);
});

// 3. Calculate optimal position size based on risk management
console.log('\nRisk Management:');
const portfolioValue = 100000; // $100,000
const winRate = 0.55; // 55% win rate
const winLossRatio = 1.8; // Average win is 1.8x the average loss

const positionSize = herta.tradingStrategies.kellyPositionSize(winRate, winLossRatio, portfolioValue);
console.log(`Optimal position size (Kelly Criterion): $${positionSize.toFixed(2)}`);

// 4. Calculate Value at Risk (VaR)
const historicalReturns = [];
for (let i = 1; i < closePrices.length; i++) {
  historicalReturns.push((closePrices[i] - closePrices[i - 1]) / closePrices[i - 1]);
}

const var95 = herta.riskManagement.historicalVaR(historicalReturns, 0.95, portfolioValue);
console.log(`95% 1-day Value at Risk: $${var95.toFixed(2)}`);

// 5. Stress test based on historical worst day
const assetValues = [portfolioValue * 0.7, portfolioValue * 0.3]; // 70% in BTC, 30% in cash
const stressShocks = [0.20, 0.0]; // 20% drop in BTC, 0% drop in cash

const stressTest = herta.riskManagement.stressTest(assetValues, stressShocks);
console.log('Stress test (20% Bitcoin crash):');
console.log(`- Initial portfolio value: $${stressTest.initialValue.toFixed(2)}`);
console.log(`- Stressed portfolio value: $${stressTest.stressedValue.toFixed(2)}`);
console.log(`- Impact: $${stressTest.impactAmount.toFixed(2)} (${(stressTest.impactPercent * 100).toFixed(2)}%)`);

console.log('\nTrading & Financial Analysis example completed successfully!');
