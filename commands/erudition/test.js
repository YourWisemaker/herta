/**
 * Erudition Test Command
 * Runs tests and provides detailed summaries of test results
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Remove the Jest test from this file

/**
 * Run tests with detailed reporting
 * @param {Array} args - Command line arguments
 */
function test(args) {
  const options = parseOptions(args);

  console.log(chalk.cyan('Herta.js Test Runner'));

  try {
    if (options.pattern) {
      runSpecificTests(options.pattern, options);
    } else if (options.unit) {
      runUnitTests(options);
    } else if (options.integration) {
      runIntegrationTests(options);
    } else {
      runAllTests(options);
    }
  } catch (error) {
    console.error(chalk.red(`Error running tests: ${error.message}`));
  }
}

/**
 * Parse command line options
 * @param {Array} args - Command line arguments
 * @returns {Object} - Parsed options
 */
function parseOptions(args) {
  const options = {
    pattern: null,
    unit: false,
    integration: false,
    verbose: false,
    coverage: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--unit' || args[i] === '-u') {
      options.unit = true;
    } else if (args[i] === '--integration' || args[i] === '-i') {
      options.integration = true;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    } else if (args[i] === '--coverage' || args[i] === '-c') {
      options.coverage = true;
    } else if (!args[i].startsWith('-')) {
      options.pattern = args[i];
    }
  }

  return options;
}

/**
 * Run specific tests matching a pattern
 * @param {string} pattern - Test pattern to match
 * @param {Object} options - Test options
 */
function runSpecificTests(pattern, options) {
  console.log(chalk.yellow(`Running tests matching pattern: ${pattern}`));

  // Determine test command based on options
  const testCommand = buildTestCommand(pattern, options);

  // Run tests
  try {
    const output = execSync(testCommand, { encoding: 'utf8' });
    const results = parseTestResults(output);
    displayTestSummary(results);
  } catch (error) {
    // Tests may fail but we still want to see the output
    const results = parseTestResults(error.stdout);
    displayTestSummary(results);
    process.exit(1);
  }
}

/**
 * Run all unit tests
 * @param {Object} options - Test options
 */
function runUnitTests(options) {
  console.log(chalk.yellow('Running unit tests'));
  runSpecificTests('test/unit', options);
}

/**
 * Run all integration tests
 * @param {Object} options - Test options
 */
function runIntegrationTests(options) {
  console.log(chalk.yellow('Running integration tests'));
  runSpecificTests('test/integration', options);
}

/**
 * Run all tests
 * @param {Object} options - Test options
 */
function runAllTests(options) {
  console.log(chalk.yellow('Running all tests'));
  runSpecificTests('test', options);
}

/**
 * Build test command based on options
 * @param {string} pattern - Test pattern to match
 * @param {Object} options - Test options
 * @returns {string} - Test command
 */
function buildTestCommand(pattern, options) {
  // This is a simple example - in a real implementation this would be more sophisticated
  // and would use the appropriate test runner (mocha, jest, etc.)
  let command = 'npx mocha';

  if (options.coverage) {
    command = `npx nyc ${command}`;
  }

  command += ` "${pattern}"`;

  if (options.verbose) {
    command += ' --verbose';
  }

  return command;
}

/**
 * Parse test results from output
 * @param {string} output - Test output
 * @returns {Object} - Parsed test results
 */
function parseTestResults(output) {
  // This is a simplified parser for demonstration
  // A real implementation would parse actual mocha/jest output

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    coverage: null,
    failedTests: []
  };

  // Look for patterns in the output
  const passedMatch = output.match(/(\d+) passing/);
  if (passedMatch) {
    results.passed = parseInt(passedMatch[1], 10);
  }

  const failedMatch = output.match(/(\d+) failing/);
  if (failedMatch) {
    results.failed = parseInt(failedMatch[1], 10);
  }

  const skippedMatch = output.match(/(\d+) pending/);
  if (skippedMatch) {
    results.skipped = parseInt(skippedMatch[1], 10);
  }

  const durationMatch = output.match(/finished in ([\d\.]+)(ms|s)/);
  if (durationMatch) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2];
    results.duration = unit === 's' ? value : value / 1000;
  }

  // Extract failed test info
  const failureMatches = output.match(/\d\) (.+?):/g);
  if (failureMatches) {
    results.failedTests = failureMatches.map((match) => match.replace(/\d\) /, '').replace(/:$/, ''));
  }

  // Extract coverage if present
  const coverageMatch = output.match(/All files[^\n]+?([^\s]+)%/);
  if (coverageMatch) {
    results.coverage = parseFloat(coverageMatch[1]);
  }

  return results;
}

/**
 * Display test summary
 * @param {Object} results - Test results
 */
function displayTestSummary(results) {
  console.log(`\n${chalk.bold('Test Summary')}`);
  console.log('═════════════\n');

  const total = results.passed + results.failed + results.skipped;

  console.log(`Total tests: ${chalk.bold(total)}`);
  console.log(`Passed:      ${chalk.green.bold(results.passed)}`);

  if (results.failed > 0) {
    console.log(`Failed:      ${chalk.red.bold(results.failed)}`);
  } else {
    console.log(`Failed:      ${chalk.bold(results.failed)}`);
  }

  if (results.skipped > 0) {
    console.log(`Skipped:     ${chalk.yellow.bold(results.skipped)}`);
  } else {
    console.log(`Skipped:     ${chalk.bold(results.skipped)}`);
  }

  console.log(`Duration:    ${chalk.bold(results.duration.toFixed(2))} seconds`);

  if (results.coverage !== null) {
    const coverageColor = results.coverage >= 80 ? chalk.green
      : results.coverage >= 60 ? chalk.yellow : chalk.red;
    console.log(`Coverage:    ${coverageColor.bold(`${results.coverage.toFixed(2)}%`)}`);
  }

  if (results.failed > 0) {
    console.log(`\n${chalk.red.bold('Failed Tests:')}`);
    results.failedTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${chalk.red(test)}`);
    });
  }

  if (results.failed === 0 && results.skipped === 0) {
    console.log(`\n${chalk.green.bold('✓ All tests passed!')}`);
  } else if (results.failed === 0) {
    console.log(`\n${chalk.green.bold('✓ All executed tests passed!')}${chalk.yellow(' (some skipped)')}`);
  }
}

/**
 * Display help for test command
 */
function displayTestHelp() {
  console.log(`
  ${chalk.bold.cyan('HERTA.JS ERUDITION TEST')}
  ${chalk.dim('Test runner with detailed reporting')}
  
  ${chalk.bold('Usage:')} 
    herta erudition test [options] [pattern]
  
  ${chalk.bold('Options:')}
    ${chalk.yellow('--unit')}, ${chalk.yellow('-u')}       Run only unit tests
    ${chalk.yellow('--integration')}, ${chalk.yellow('-i')} Run only integration tests
    ${chalk.yellow('--verbose')}, ${chalk.yellow('-v')}     Show verbose output
    ${chalk.yellow('--coverage')}, ${chalk.yellow('-c')}    Calculate code coverage
  
  ${chalk.bold('Examples:')}
    herta erudition test
    herta erudition test matrix.test.js
    herta erudition test --unit --coverage
  `);
}

module.exports = test;
