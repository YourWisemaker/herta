/**
 * Tabular Data Analysis Example with Herta.js
 * Demonstrates data summarization, transformation, and analysis
 */

const herta = require('../../src/index.js');

console.log('Herta.js Tabular Data Analysis Example');
console.log('======================================\n');

// Sample dataset: Sales data by region, product, and date
const salesData = [
  {
    date: '2023-01-01', region: 'North', product: 'Widget A', sales: 1200, units: 42, returns: 2
  },
  {
    date: '2023-01-01', region: 'South', product: 'Widget A', sales: 900, units: 31, returns: 1
  },
  {
    date: '2023-01-01', region: 'East', product: 'Widget B', sales: 1500, units: 45, returns: 3
  },
  {
    date: '2023-01-01', region: 'West', product: 'Widget C', sales: 800, units: 24, returns: 0
  },
  {
    date: '2023-01-02', region: 'North', product: 'Widget A', sales: 1100, units: 38, returns: 1
  },
  {
    date: '2023-01-02', region: 'South', product: 'Widget B', sales: 1350, units: 40, returns: 2
  },
  {
    date: '2023-01-02', region: 'East', product: 'Widget A', sales: 950, units: 33, returns: 0
  },
  {
    date: '2023-01-02', region: 'West', product: 'Widget C', sales: 1700, units: 52, returns: 4
  },
  {
    date: '2023-01-03', region: 'North', product: 'Widget B', sales: 1400, units: 42, returns: 1
  },
  {
    date: '2023-01-03', region: 'South', product: 'Widget C', sales: 1600, units: 48, returns: 2
  },
  {
    date: '2023-01-03', region: 'East', product: 'Widget A', sales: 1050, units: 36, returns: 1
  },
  {
    date: '2023-01-03', region: 'West', product: 'Widget B', sales: 1750, units: 53, returns: 3
  },
  {
    date: '2023-01-04', region: 'North', product: 'Widget C', sales: 950, units: 29, returns: 0
  },
  {
    date: '2023-01-04', region: 'South', product: 'Widget A', sales: 1150, units: 39, returns: 1
  },
  {
    date: '2023-01-04', region: 'East', product: 'Widget B', sales: 1850, units: 56, returns: 2
  },
  {
    date: '2023-01-04', region: 'West', product: 'Widget A', sales: 1250, units: 43, returns: 1
  },
  {
    date: '2023-01-05', region: 'North', product: 'Widget B', sales: 1300, units: 39, returns: 1
  },
  {
    date: '2023-01-05', region: 'South', product: 'Widget C', sales: 1450, units: 44, returns: 2
  },
  {
    date: '2023-01-05', region: 'East', product: 'Widget A', sales: 1100, units: 38, returns: 1
  },
  {
    date: '2023-01-05', region: 'West', product: 'Widget B', sales: 2100, units: 63, returns: 4
  }
];

// 1. Generate summary statistics
console.log('Data Summary:');
console.log('-------------');
const summary = herta.tabularAnalysis.summarize(salesData);

console.log('Sales summary:');
console.log(`Count: ${summary.sales.count}`);
console.log(`Min: $${summary.sales.min}`);
console.log(`Max: $${summary.sales.max}`);
console.log(`Mean: $${summary.sales.mean.toFixed(2)}`);
console.log(`Median: $${summary.sales.median.toFixed(2)}`);
console.log(`Standard Deviation: $${summary.sales.stdDev.toFixed(2)}`);

console.log('\nUnits summary:');
console.log(`Count: ${summary.units.count}`);
console.log(`Min: ${summary.units.min}`);
console.log(`Max: ${summary.units.max}`);
console.log(`Mean: ${summary.units.mean.toFixed(2)}`);
console.log(`Median: ${summary.units.median.toFixed(2)}`);
console.log(`Standard Deviation: ${summary.units.stdDev.toFixed(2)}`);

// 2. Calculate correlation matrix
console.log('\nCorrelation Analysis:');
console.log('--------------------');
const { correlationMatrix } = herta.tabularAnalysis.correlationMatrix(salesData);

console.log('Correlation matrix:');
console.log(`Sales-Units correlation: ${correlationMatrix.sales.units.toFixed(4)}`);
console.log(`Sales-Returns correlation: ${correlationMatrix.sales.returns.toFixed(4)}`);
console.log(`Units-Returns correlation: ${correlationMatrix.units.returns.toFixed(4)}`);

// 3. Detect outliers
console.log('\nOutlier Detection:');
console.log('----------------');
const outliers = herta.tabularAnalysis.detectOutliers(salesData, ['sales', 'units', 'returns']);

console.log('Sales outliers:');
if (outliers.sales.count > 0) {
  console.log(`Found ${outliers.sales.count} outliers (${outliers.sales.percentage.toFixed(2)}% of data)`);
  console.log(`Outlier bounds: $${outliers.sales.bounds.lower.toFixed(2)} to $${outliers.sales.bounds.upper.toFixed(2)}`);
  outliers.sales.items.forEach((item) => {
    console.log(`Row ${item.index}: $${item.value} (${item.isHigh ? 'high' : 'low'} outlier)`);
  });
} else {
  console.log('No outliers found in sales data');
}

// 4. Group data by product and calculate aggregates
console.log('\nGroup By Analysis:');
console.log('----------------');
const salesByProduct = herta.tabularAnalysis.groupBy(salesData, 'product', {
  totalSales: 'sum',
  avgSales: 'mean',
  totalUnits: 'sum',
  returnRate: (values) => {
    const totalReturns = values.reduce((sum, val) => sum + val, 0);
    const totalUnits = values.reduce((sum, val) => sum + val, 0);
    return totalReturns / totalUnits;
  }
});

console.log('Sales by Product:');
salesByProduct.forEach((group) => {
  console.log(`\nProduct: ${group.product}`);
  console.log(`Total Sales: $${group.totalSales.toFixed(2)}`);
  console.log(`Average Sales: $${group.avgSales.toFixed(2)}`);
  console.log(`Total Units: ${group.totalUnits}`);
  console.log(`Return Rate: ${(group.returnRate * 100).toFixed(2)}%`);
});

// 5. Normalize the sales data
console.log('\nData Normalization:');
console.log('------------------');
const { data: normalizedData, params } = herta.tabularAnalysis.normalize(salesData, ['sales', 'units'], 'minmax');

console.log('Normalization parameters:');
console.log(`Sales min: $${params.sales.min}, max: $${params.sales.max}`);
console.log(`Units min: ${params.units.min}, max: ${params.units.max}`);

console.log('\nSample of normalized data:');
normalizedData.slice(0, 3).forEach((row, index) => {
  console.log(`Row ${index}:`);
  console.log(`  Original sales: $${salesData[index].sales}, Normalized: ${row.sales.toFixed(4)}`);
  console.log(`  Original units: ${salesData[index].units}, Normalized: ${row.units.toFixed(4)}`);
});

// 6. One-hot encode categorical variables
console.log('\nOne-Hot Encoding:');
console.log('----------------');
const encodedData = herta.tabularAnalysis.oneHotEncode(salesData, ['region', 'product']);

console.log('Sample of encoded data (first row):');
const firstRow = encodedData[0];
console.log('Original region:', salesData[0].region);
Object.keys(firstRow).filter((k) => k.startsWith('region_')).forEach((key) => {
  console.log(`  ${key}: ${firstRow[key]}`);
});

console.log('Original product:', salesData[0].product);
Object.keys(firstRow).filter((k) => k.startsWith('product_')).forEach((key) => {
  console.log(`  ${key}: ${firstRow[key]}`);
});

console.log('\nTabular Data Analysis example completed successfully!');
