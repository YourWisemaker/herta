/**
 * Financial Mathematics module for herta.js
 * Provides models and calculations for financial applications
 */

const arithmetic = require('../core/arithmetic');
const statistics = require('../advanced/statistics');

const financialMath = {};

/**
 * Calculate future value of a present amount using compound interest
 * @param {number} principal - Initial investment amount
 * @param {number} rate - Annual interest rate (as a decimal)
 * @param {number} time - Time period in years
 * @param {number} [frequency=1] - Compounding frequency per year
 * @returns {number} - Future value
 */
financialMath.futureValue = function(principal, rate, time, frequency = 1) {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
};

/**
 * Calculate present value of a future amount using compound interest
 * @param {number} futureValue - Future value
 * @param {number} rate - Annual interest rate (as a decimal)
 * @param {number} time - Time period in years
 * @param {number} [frequency=1] - Compounding frequency per year
 * @returns {number} - Present value
 */
financialMath.presentValue = function(futureValue, rate, time, frequency = 1) {
  return futureValue / Math.pow(1 + rate / frequency, frequency * time);
};

/**
 * Calculate continuous compounding future value
 * @param {number} principal - Initial investment amount
 * @param {number} rate - Annual interest rate (as a decimal)
 * @param {number} time - Time period in years
 * @returns {number} - Future value
 */
financialMath.continuousCompounding = function(principal, rate, time) {
  return principal * Math.exp(rate * time);
};

/**
 * Calculate present value of an annuity (series of equal payments)
 * @param {number} payment - Periodic payment amount
 * @param {number} rate - Periodic interest rate (as a decimal)
 * @param {number} periods - Number of periods
 * @param {boolean} [dueAtBeginning=false] - Whether payments are made at the beginning of periods
 * @returns {number} - Present value of the annuity
 */
financialMath.annuityPresentValue = function(payment, rate, periods, dueAtBeginning = false) {
  if (Math.abs(rate) < 1e-10) {
    return payment * periods;
  }
  
  const pvifa = (1 - 1 / Math.pow(1 + rate, periods)) / rate;
  return payment * pvifa * (dueAtBeginning ? (1 + rate) : 1);
};

/**
 * Calculate future value of an annuity (series of equal payments)
 * @param {number} payment - Periodic payment amount
 * @param {number} rate - Periodic interest rate (as a decimal)
 * @param {number} periods - Number of periods
 * @param {boolean} [dueAtBeginning=false] - Whether payments are made at the beginning of periods
 * @returns {number} - Future value of the annuity
 */
financialMath.annuityFutureValue = function(payment, rate, periods, dueAtBeginning = false) {
  if (Math.abs(rate) < 1e-10) {
    return payment * periods;
  }
  
  const fvifa = (Math.pow(1 + rate, periods) - 1) / rate;
  return payment * fvifa * (dueAtBeginning ? (1 + rate) : 1);
};

/**
 * Calculate payment for an annuity given present or future value
 * @param {number} presentValue - Present value of the annuity (0 if using futureValue)
 * @param {number} futureValue - Future value of the annuity (0 if using presentValue)
 * @param {number} rate - Periodic interest rate (as a decimal)
 * @param {number} periods - Number of periods
 * @param {boolean} [dueAtBeginning=false] - Whether payments are made at the beginning of periods
 * @returns {number} - Periodic payment amount
 */
financialMath.annuityPayment = function(presentValue, futureValue, rate, periods, dueAtBeginning = false) {
  if (Math.abs(rate) < 1e-10) {
    return (presentValue + futureValue) / periods;
  }
  
  const pvifa = (1 - 1 / Math.pow(1 + rate, periods)) / rate;
  const fvifa = (Math.pow(1 + rate, periods) - 1) / rate;
  
  const payment = (presentValue + futureValue / Math.pow(1 + rate, periods)) / 
                 (pvifa * (dueAtBeginning ? (1 + rate) : 1));
  
  return payment;
};

/**
 * Calculate Net Present Value (NPV) of a series of cash flows
 * @param {number} rate - Discount rate (as a decimal)
 * @param {Array} cashFlows - Series of cash flows (negative for outflows, positive for inflows)
 * @returns {number} - Net Present Value
 */
financialMath.npv = function(rate, cashFlows) {
  let npv = 0;
  
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i);
  }
  
  return npv;
};

/**
 * Calculate Internal Rate of Return (IRR) for a series of cash flows
 * Uses Newton-Raphson method
 * @param {Array} cashFlows - Series of cash flows (negative for outflows, positive for inflows)
 * @param {Object} [options] - Calculation options
 * @returns {number} - Internal Rate of Return
 */
financialMath.irr = function(cashFlows, options = {}) {
  const maxIterations = options.maxIterations || 100;
  const tolerance = options.tolerance || 1e-10;
  let guess = options.guess || 0.1;
  
  // Function to calculate NPV
  const calculateNPV = rate => {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i);
    }
    return npv;
  };
  
  // Function to calculate derivative of NPV
  const calculateNPVDerivative = rate => {
    let derivative = 0;
    for (let i = 1; i < cashFlows.length; i++) {
      derivative -= i * cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return derivative;
  };
  
  // Newton-Raphson method
  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(guess);
    if (Math.abs(npv) < tolerance) {
      return guess;
    }
    
    const derivative = calculateNPVDerivative(guess);
    if (Math.abs(derivative) < 1e-10) {
      break; // Avoid division by near-zero
    }
    
    guess = guess - npv / derivative;
    
    // Bounds check
    if (guess <= -1) {
      guess = -0.9999;
    }
  }
  
  // If no convergence, try bisection method as fallback
  let low = -0.999;
  let high = 1;
  const lowNPV = calculateNPV(low);
  const highNPV = calculateNPV(high);
  
  if (lowNPV * highNPV > 0) {
    // No solution in the range
    return NaN;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const midNPV = calculateNPV(mid);
    
    if (Math.abs(midNPV) < tolerance) {
      return mid;
    }
    
    if (midNPV * lowNPV < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  return (low + high) / 2;
};

/**
 * Calculate Modified Internal Rate of Return (MIRR)
 * @param {Array} cashFlows - Series of cash flows
 * @param {number} financeRate - Rate for negative cash flows
 * @param {number} reinvestRate - Rate for positive cash flows
 * @returns {number} - Modified Internal Rate of Return
 */
financialMath.mirr = function(cashFlows, financeRate, reinvestRate) {
  let negativeFlows = 0;
  let positiveFlows = 0;
  const n = cashFlows.length - 1;
  
  for (let i = 0; i <= n; i++) {
    if (cashFlows[i] < 0) {
      negativeFlows += cashFlows[i] * Math.pow(1 + financeRate, -i);
    } else {
      positiveFlows += cashFlows[i] * Math.pow(1 + reinvestRate, n - i);
    }
  }
  
  // Convert negative flows to positive for calculation
  negativeFlows = -negativeFlows;
  
  if (negativeFlows <= 0 || positiveFlows <= 0) {
    return NaN; // MIRR not defined
  }
  
  return Math.pow(positiveFlows / negativeFlows, 1 / n) - 1;
};

/**
 * Calculate loan amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate (as a decimal)
 * @param {number} periods - Number of payment periods
 * @param {number} [frequency=12] - Payment frequency per year
 * @returns {Object} - Amortization schedule and summary
 */
financialMath.amortizationSchedule = function(principal, rate, periods, frequency = 12) {
  const periodicRate = rate / frequency;
  const payment = principal * periodicRate / (1 - Math.pow(1 + periodicRate, -periods));
  
  const schedule = [];
  let remainingBalance = principal;
  let totalInterest = 0;
  
  for (let i = 1; i <= periods; i++) {
    const interest = remainingBalance * periodicRate;
    const principalPaid = payment - interest;
    
    remainingBalance -= principalPaid;
    totalInterest += interest;
    
    schedule.push({
      period: i,
      payment: payment,
      principal: principalPaid,
      interest: interest,
      totalInterest: totalInterest,
      balance: Math.max(0, remainingBalance)
    });
  }
  
  return {
    schedule: schedule,
    summary: {
      loanAmount: principal,
      payment: payment,
      totalPayments: payment * periods,
      totalInterest: totalInterest
    }
  };
};

/**
 * Black-Scholes option pricing model
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current underlying price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (as a decimal)
 * @param {number} v - Volatility (as a decimal)
 * @param {number} T - Time to expiration (in years)
 * @returns {Object} - Option price and Greeks
 */
financialMath.blackScholes = function(type, S, K, r, v, T) {
  // Standard normal CDF
  function normCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
  }
  
  // Standard normal PDF
  function normPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }
  
  const d1 = (Math.log(S / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  const d2 = d1 - v * Math.sqrt(T);
  
  let price, delta, gamma, theta, vega, rho;
  
  if (type.toLowerCase() === 'call') {
    price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
    delta = normCDF(d1);
    rho = K * T * Math.exp(-r * T) * normCDF(d2) / 100;
    theta = (-S * v * normPDF(d1) / (2 * Math.sqrt(T)) - 
             r * K * Math.exp(-r * T) * normCDF(d2)) / 365;
  } else if (type.toLowerCase() === 'put') {
    price = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
    delta = normCDF(d1) - 1;
    rho = -K * T * Math.exp(-r * T) * normCDF(-d2) / 100;
    theta = (-S * v * normPDF(d1) / (2 * Math.sqrt(T)) + 
             r * K * Math.exp(-r * T) * normCDF(-d2)) / 365;
  } else {
    throw new Error('Option type must be "call" or "put"');
  }
  
  gamma = normPDF(d1) / (S * v * Math.sqrt(T));
  vega = S * Math.sqrt(T) * normPDF(d1) / 100;
  
  return {
    price: price,
    delta: delta,
    gamma: gamma,
    theta: theta,
    vega: vega,
    rho: rho
  };
};

/**
 * Binomial option pricing model
 * @param {string} type - Option type ('call' or 'put')
 * @param {number} S - Current underlying price
 * @param {number} K - Strike price
 * @param {number} r - Risk-free interest rate (as a decimal)
 * @param {number} v - Volatility (as a decimal)
 * @param {number} T - Time to expiration (in years)
 * @param {number} [steps=50] - Number of time steps
 * @returns {number} - Option price
 */
financialMath.binomialOptionPricing = function(type, S, K, r, v, T, steps = 50) {
  const dt = T / steps;
  const u = Math.exp(v * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(r * dt) - d) / (u - d);
  
  // Create price tree
  const prices = new Array(steps + 1);
  for (let i = 0; i <= steps; i++) {
    prices[i] = S * Math.pow(u, i) * Math.pow(d, steps - i);
  }
  
  // Calculate option values at expiration
  let optionValues = new Array(steps + 1);
  if (type.toLowerCase() === 'call') {
    for (let i = 0; i <= steps; i++) {
      optionValues[i] = Math.max(0, prices[i] - K);
    }
  } else if (type.toLowerCase() === 'put') {
    for (let i = 0; i <= steps; i++) {
      optionValues[i] = Math.max(0, K - prices[i]);
    }
  } else {
    throw new Error('Option type must be "call" or "put"');
  }
  
  // Work backwards through the tree
  for (let j = steps - 1; j >= 0; j--) {
    for (let i = 0; i <= j; i++) {
      optionValues[i] = Math.exp(-r * dt) * (p * optionValues[i + 1] + (1 - p) * optionValues[i]);
    }
  }
  
  return optionValues[0];
};

/**
 * Calculate Sharpe Ratio for a portfolio or asset
 * @param {number} portfolioReturn - Annualized portfolio return
 * @param {number} riskFreeRate - Annualized risk-free return
 * @param {number} portfolioStdDev - Annualized standard deviation of portfolio returns
 * @returns {number} - Sharpe Ratio
 */
financialMath.sharpeRatio = function(portfolioReturn, riskFreeRate, portfolioStdDev) {
  return (portfolioReturn - riskFreeRate) / portfolioStdDev;
};

/**
 * Calculate the beta of an asset relative to a benchmark
 * @param {Array} assetReturns - Array of asset returns
 * @param {Array} benchmarkReturns - Array of benchmark returns
 * @returns {number} - Beta value
 */
financialMath.beta = function(assetReturns, benchmarkReturns) {
  if (assetReturns.length !== benchmarkReturns.length) {
    throw new Error('Asset and benchmark return series must have the same length');
  }
  
  const n = assetReturns.length;
  
  // Calculate means
  let assetMean = 0;
  let benchmarkMean = 0;
  
  for (let i = 0; i < n; i++) {
    assetMean += assetReturns[i] / n;
    benchmarkMean += benchmarkReturns[i] / n;
  }
  
  // Calculate covariance and benchmark variance
  let covariance = 0;
  let benchmarkVariance = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (assetReturns[i] - assetMean) * (benchmarkReturns[i] - benchmarkMean) / n;
    benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkMean, 2) / n;
  }
  
  return covariance / benchmarkVariance;
};

/**
 * Calculate Value at Risk (VaR) for a portfolio
 * @param {Array} returns - Historical returns
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} [timePeriod=1] - Time period (in days)
 * @returns {number} - Value at Risk
 */
financialMath.valueAtRisk = function(returns, confidenceLevel, portfolioValue, timePeriod = 1) {
  // Sort returns in ascending order
  const sortedReturns = [...returns].sort((a, b) => a - b);
  
  // Find the return at the specified confidence level
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  const valueAtRiskPercent = -sortedReturns[index];
  
  // Scale to the specified time period
  const scaledVaR = valueAtRiskPercent * Math.sqrt(timePeriod);
  
  return portfolioValue * scaledVaR;
};

/**
 * Calculate duration of a bond
 * @param {number} couponRate - Annual coupon rate (as a decimal)
 * @param {number} marketRate - Market interest rate (as a decimal)
 * @param {number} faceValue - Face value of the bond
 * @param {number} timeToMaturity - Time to maturity (in years)
 * @param {number} [frequency=2] - Coupon payment frequency per year
 * @returns {Object} - Duration and modified duration
 */
financialMath.bondDuration = function(couponRate, marketRate, faceValue, timeToMaturity, frequency = 2) {
  const periodicRate = marketRate / frequency;
  const periodicCoupon = (couponRate * faceValue) / frequency;
  const periods = timeToMaturity * frequency;
  
  let presentValue = 0;
  let weightedTime = 0;
  
  for (let i = 1; i <= periods; i++) {
    const t = i / frequency;
    const discountFactor = Math.pow(1 + periodicRate, -i);
    const cashFlow = periodicCoupon;
    
    presentValue += cashFlow * discountFactor;
    weightedTime += t * cashFlow * discountFactor;
  }
  
  // Add face value at maturity
  presentValue += faceValue * Math.pow(1 + periodicRate, -periods);
  weightedTime += timeToMaturity * faceValue * Math.pow(1 + periodicRate, -periods);
  
  const macaulayDuration = weightedTime / presentValue;
  const modifiedDuration = macaulayDuration / (1 + periodicRate);
  
  return {
    macaulayDuration: macaulayDuration,
    modifiedDuration: modifiedDuration,
    presentValue: presentValue
  };
};

/**
 * Calculate bond convexity
 * @param {number} couponRate - Annual coupon rate (as a decimal)
 * @param {number} marketRate - Market interest rate (as a decimal)
 * @param {number} faceValue - Face value of the bond
 * @param {number} timeToMaturity - Time to maturity (in years)
 * @param {number} [frequency=2] - Coupon payment frequency per year
 * @returns {number} - Bond convexity
 */
financialMath.bondConvexity = function(couponRate, marketRate, faceValue, timeToMaturity, frequency = 2) {
  const periodicRate = marketRate / frequency;
  const periodicCoupon = (couponRate * faceValue) / frequency;
  const periods = timeToMaturity * frequency;
  
  let presentValue = 0;
  let convexitySum = 0;
  
  for (let i = 1; i <= periods; i++) {
    const t = i / frequency;
    const discountFactor = Math.pow(1 + periodicRate, -i);
    const cashFlow = periodicCoupon;
    
    presentValue += cashFlow * discountFactor;
    convexitySum += t * (t + 1) * cashFlow * discountFactor;
  }
  
  // Add face value at maturity
  presentValue += faceValue * Math.pow(1 + periodicRate, -periods);
  convexitySum += timeToMaturity * (timeToMaturity + 1) * faceValue * Math.pow(1 + periodicRate, -periods);
  
  const convexity = convexitySum / (presentValue * Math.pow(1 + periodicRate, 2));
  
  return convexity;
};

module.exports = financialMath;
