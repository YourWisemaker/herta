/**
 * Tabular Data Analysis module for herta.js
 * Provides functions for analyzing and manipulating tabular data
 * commonly used in data science and business intelligence
 */

const statistics = require('../core/statistics');
const matrix = require('../core/matrix');

const tabularAnalysis = {};

/**
 * Create a summary of a dataset with descriptive statistics for each numeric column
 * @param {Array} data - Array of objects representing tabular data
 * @param {Array} [numericColumns] - Optional array of column names to analyze (defaults to all numeric columns)
 * @returns {Object} - Summary statistics for each column
 */
tabularAnalysis.summarize = function (data, numericColumns = null) {
  if (!data || !data.length || !data[0]) {
    throw new Error('Invalid data format');
  }

  // If numeric columns not specified, detect them automatically
  if (!numericColumns) {
    numericColumns = [];
    for (const key in data[0]) {
      if (typeof data[0][key] === 'number') {
        numericColumns.push(key);
      }
    }
  }

  const summary = {};

  for (const column of numericColumns) {
    // Extract column values
    const values = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && !isNaN(val));

    if (values.length === 0) {
      summary[column] = {
        count: 0,
        missing: data.length,
        numeric: false
      };
      continue;
    }

    // Sort values for percentile calculations
    const sortedValues = [...values].sort((a, b) => a - b);

    // Calculate basic statistics
    const count = values.length;
    const missing = data.length - count;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Calculate variance and standard deviation
    let sumSquaredDiff = 0;
    for (const val of values) {
      sumSquaredDiff += (val - mean) ** 2;
    }
    const variance = sumSquaredDiff / count;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const p25 = this._percentile(sortedValues, 0.25);
    const median = this._percentile(sortedValues, 0.5);
    const p75 = this._percentile(sortedValues, 0.75);

    // Store statistics
    summary[column] = {
      count,
      missing,
      numeric: true,
      min,
      max,
      sum,
      mean,
      median,
      variance,
      stdDev,
      p25,
      p75,
      iqr: p75 - p25
    };
  }

  return summary;
};

/**
 * Find correlation matrix between numeric columns in the dataset
 * @param {Array} data - Array of objects representing tabular data
 * @param {Array} [columns] - Optional array of column names to include (defaults to all numeric columns)
 * @param {string} [method='pearson'] - Correlation method: 'pearson' or 'spearman'
 * @returns {Object} - Correlation matrix and column names
 */
tabularAnalysis.correlationMatrix = function (data, columns = null, method = 'pearson') {
  if (!data || !data.length) {
    throw new Error('Invalid data format');
  }

  // If columns not specified, detect numeric columns automatically
  if (!columns) {
    columns = [];
    for (const key in data[0]) {
      if (typeof data[0][key] === 'number') {
        columns.push(key);
      }
    }
  }

  // Extract column data
  const columnData = {};
  for (const column of columns) {
    columnData[column] = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && !isNaN(val));
  }

  // Initialize correlation matrix
  const correlationMatrix = {};
  for (const col1 of columns) {
    correlationMatrix[col1] = {};

    for (const col2 of columns) {
      if (col1 === col2) {
        correlationMatrix[col1][col2] = 1; // Perfect correlation with self
        continue;
      }

      // Get common values (handle missing data)
      const values1 = [];
      const values2 = [];

      for (let i = 0; i < data.length; i++) {
        const val1 = data[i][col1];
        const val2 = data[i][col2];

        if (val1 !== null && val1 !== undefined && !isNaN(val1)
            && val2 !== null && val2 !== undefined && !isNaN(val2)) {
          values1.push(val1);
          values2.push(val2);
        }
      }

      // Calculate correlation
      if (method === 'pearson') {
        correlationMatrix[col1][col2] = this._pearsonCorrelation(values1, values2);
      } else if (method === 'spearman') {
        correlationMatrix[col1][col2] = this._spearmanCorrelation(values1, values2);
      } else {
        throw new Error(`Unsupported correlation method: ${method}`);
      }
    }
  }

  return {
    columns,
    correlationMatrix
  };
};

/**
 * Detect outliers in a dataset using the IQR method
 * @param {Array} data - Array of objects representing tabular data
 * @param {Array} [columns] - Optional array of column names to analyze (defaults to all numeric columns)
 * @param {number} [threshold=1.5] - IQR multiplier for outlier detection (typically 1.5)
 * @returns {Object} - Outliers for each column with their indices and values
 */
tabularAnalysis.detectOutliers = function (data, columns = null, threshold = 1.5) {
  if (!data || !data.length) {
    throw new Error('Invalid data format');
  }

  // Get summary statistics
  const summary = this.summarize(data, columns);

  const outliers = {};

  // For each numeric column, identify outliers
  for (const column in summary) {
    if (!summary[column].numeric) continue;

    const { p25, p75, iqr } = summary[column];
    const lowerBound = p25 - threshold * iqr;
    const upperBound = p75 + threshold * iqr;

    const columnOutliers = [];

    for (let i = 0; i < data.length; i++) {
      const value = data[i][column];

      if (value !== null && value !== undefined && !isNaN(value)) {
        if (value < lowerBound || value > upperBound) {
          columnOutliers.push({
            index: i,
            value,
            isLow: value < lowerBound,
            isHigh: value > upperBound
          });
        }
      }
    }

    outliers[column] = {
      count: columnOutliers.length,
      percentage: (columnOutliers.length / data.length) * 100,
      bounds: { lower: lowerBound, upper: upperBound },
      items: columnOutliers
    };
  }

  return outliers;
};

/**
 * Transform categorical variables to numeric using one-hot encoding
 * @param {Array} data - Array of objects representing tabular data
 * @param {Array} categoricalColumns - Array of column names to encode
 * @returns {Array} - Transformed dataset with one-hot encoded columns
 */
tabularAnalysis.oneHotEncode = function (data, categoricalColumns) {
  if (!data || !data.length || !categoricalColumns || !categoricalColumns.length) {
    throw new Error('Invalid inputs');
  }

  // Create a copy of the data
  const transformedData = JSON.parse(JSON.stringify(data));

  // For each categorical column
  for (const column of categoricalColumns) {
    // Get unique values (categories)
    const categories = new Set();
    for (const row of data) {
      if (row[column] !== null && row[column] !== undefined) {
        categories.add(String(row[column]));
      }
    }

    // Create new columns for each category
    for (const category of categories) {
      const newColumn = `${column}_${category}`;

      for (const row of transformedData) {
        row[newColumn] = row[column] !== null && row[column] !== undefined
                         && String(row[column]) === category ? 1 : 0;
      }
    }

    // Optionally, remove the original column
    for (const row of transformedData) {
      delete row[column];
    }
  }

  return transformedData;
};

/**
 * Group data by a column and calculate aggregates
 * @param {Array} data - Array of objects representing tabular data
 * @param {string} groupByColumn - Column to group by
 * @param {Object} aggregations - Object mapping column names to aggregate functions
 * @returns {Array} - Grouped and aggregated data
 */
tabularAnalysis.groupBy = function (data, groupByColumn, aggregations) {
  if (!data || !data.length) {
    throw new Error('Invalid data format');
  }

  // Create groups
  const groups = {};

  for (const row of data) {
    const groupKey = row[groupByColumn];

    if (groupKey === null || groupKey === undefined) continue;

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(row);
  }

  // Calculate aggregations for each group
  const result = [];

  for (const groupKey in groups) {
    const groupData = groups[groupKey];
    const aggregatedRow = { [groupByColumn]: groupKey };

    for (const column in aggregations) {
      const aggFunc = aggregations[column];

      if (typeof aggFunc === 'function') {
        // Custom aggregation function
        aggregatedRow[column] = aggFunc(groupData.map((row) => row[column]));
      } else if (typeof aggFunc === 'string') {
        // Built-in aggregation function
        switch (aggFunc.toLowerCase()) {
          case 'sum':
            aggregatedRow[column] = groupData.reduce((sum, row) => sum + (row[column] || 0), 0);
            break;
          case 'avg':
          case 'mean':
            const values = groupData.map((row) => row[column]).filter((v) => v !== null && v !== undefined && !isNaN(v));
            aggregatedRow[column] = values.length
              ? values.reduce((sum, val) => sum + val, 0) / values.length : null;
            break;
          case 'min':
            aggregatedRow[column] = Math.min(...groupData.map((row) => row[column])
              .filter((v) => v !== null && v !== undefined && !isNaN(v)));
            break;
          case 'max':
            aggregatedRow[column] = Math.max(...groupData.map((row) => row[column])
              .filter((v) => v !== null && v !== undefined && !isNaN(v)));
            break;
          case 'count':
            aggregatedRow[column] = groupData.length;
            break;
          default:
            throw new Error(`Unsupported aggregation function: ${aggFunc}`);
        }
      }
    }

    result.push(aggregatedRow);
  }

  return result;
};

/**
 * Normalize numeric columns in the dataset
 * @param {Array} data - Array of objects representing tabular data
 * @param {Array} columns - Array of column names to normalize
 * @param {string} [method='minmax'] - Normalization method: 'minmax', 'zscore', or 'maxabs'
 * @returns {Object} - Normalized data and normalization parameters
 */
tabularAnalysis.normalize = function (data, columns, method = 'minmax') {
  if (!data || !data.length || !columns || !columns.length) {
    throw new Error('Invalid inputs');
  }

  // Create a deep copy of the data
  const normalizedData = JSON.parse(JSON.stringify(data));
  const params = {};

  for (const column of columns) {
    // Extract column values
    const values = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && !isNaN(val));

    if (values.length === 0) continue;

    if (method === 'minmax') {
      // Min-Max scaling: (x - min) / (max - min)
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      params[column] = { min, max };

      if (range === 0) {
        // Handle constant values
        for (const row of normalizedData) {
          if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
            row[column] = 0.5; // Midpoint when all values are equal
          }
        }
      } else {
        for (const row of normalizedData) {
          if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
            row[column] = (row[column] - min) / range;
          }
        }
      }
    } else if (method === 'zscore') {
      // Z-score normalization: (x - mean) / std
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      let sumSquaredDiff = 0;
      for (const val of values) {
        sumSquaredDiff += (val - mean) ** 2;
      }
      const std = Math.sqrt(sumSquaredDiff / values.length);

      params[column] = { mean, std };

      if (std === 0) {
        // Handle constant values
        for (const row of normalizedData) {
          if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
            row[column] = 0; // Z-score is 0 when all values are equal
          }
        }
      } else {
        for (const row of normalizedData) {
          if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
            row[column] = (row[column] - mean) / std;
          }
        }
      }
    } else if (method === 'maxabs') {
      // Max-Abs scaling: x / max(|x|)
      const maxAbs = Math.max(...values.map((v) => Math.abs(v)));

      params[column] = { maxAbs };

      if (maxAbs === 0) {
        // Handle all zeros
        continue; // No change needed
      } else {
        for (const row of normalizedData) {
          if (row[column] !== null && row[column] !== undefined && !isNaN(row[column])) {
            row[column] = row[column] / maxAbs;
          }
        }
      }
    } else {
      throw new Error(`Unsupported normalization method: ${method}`);
    }
  }

  return {
    data: normalizedData,
    params
  };
};

/**
 * Calculate the percentile of a sorted numeric array
 * @private
 * @param {Array} sortedArray - Sorted array of numeric values
 * @param {number} p - Percentile to calculate (0-1)
 * @returns {number} - Value at the specified percentile
 */
tabularAnalysis._percentile = function (sortedArray, p) {
  if (sortedArray.length === 0) return 0;
  if (sortedArray.length === 1) return sortedArray[0];

  const index = p * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sortedArray[lower];

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
};

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @private
 * @param {Array} x - First array of numeric values
 * @param {Array} y - Second array of numeric values
 * @returns {number} - Pearson correlation coefficient
 */
tabularAnalysis._pearsonCorrelation = function (x, y) {
  if (x.length !== y.length || x.length === 0) {
    return NaN;
  }

  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;

  // Calculate correlation
  let numerator = 0;
  let xSumSquared = 0;
  let ySumSquared = 0;

  for (let i = 0; i < x.length; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;

    numerator += xDiff * yDiff;
    xSumSquared += xDiff * xDiff;
    ySumSquared += yDiff * yDiff;
  }

  const denominator = Math.sqrt(xSumSquared * ySumSquared);

  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate Spearman correlation coefficient between two arrays
 * @private
 * @param {Array} x - First array of numeric values
 * @param {Array} y - Second array of numeric values
 * @returns {number} - Spearman correlation coefficient
 */
tabularAnalysis._spearmanCorrelation = function (x, y) {
  if (x.length !== y.length || x.length === 0) {
    return NaN;
  }

  // Convert to ranks
  const xRanked = this._calculateRanks(x);
  const yRanked = this._calculateRanks(y);

  // Use Pearson correlation on the ranks
  return this._pearsonCorrelation(xRanked, yRanked);
};

/**
 * Calculate ranks for an array (for Spearman correlation)
 * @private
 * @param {Array} array - Array of numeric values
 * @returns {Array} - Array of ranks
 */
tabularAnalysis._calculateRanks = function (array) {
  // Create array of [value, index] pairs
  const pairs = array.map((value, index) => ({ value, index }));

  // Sort by value
  pairs.sort((a, b) => a.value - b.value);

  // Calculate ranks, handling ties
  const ranks = new Array(array.length);
  let i = 0;

  while (i < pairs.length) {
    const { value } = pairs[i];
    let j = i + 1;

    // Find all elements with the same value
    while (j < pairs.length && pairs[j].value === value) {
      j++;
    }

    // Calculate the average rank for tied elements
    const rank = (i + j - 1) / 2 + 1;

    // Assign the rank to all tied elements
    for (let k = i; k < j; k++) {
      ranks[pairs[k].index] = rank;
    }

    i = j;
  }

  return ranks;
};

module.exports = tabularAnalysis;
