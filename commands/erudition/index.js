/**
 * Erudition Command Handler
 * Main entry point for all erudition-related commands
 */

const make = require('./make');
const analyze = require('./analyze');
const doc = require('./doc');
const test = require('./test');
const explain = require('./explain');
const chalk = require('chalk'); // We'll need to add this to dependencies

/**
 * Execute the appropriate erudition subcommand
 * @param {Array} args - Command line arguments
 */
function execErudition(args) {
  const subcommand = args[0];

  if (!subcommand) {
    displayEruditionHelp();
    return;
  }

  switch (subcommand) {
    case 'make':
      make(args.slice(1));
      break;
    case 'analyze':
      analyze(args.slice(1));
      break;
    case 'doc':
      doc(args.slice(1));
      break;
    case 'test':
      test(args.slice(1));
      break;
    case 'explain':
      explain(args.slice(1));
      break;
    case 'help':
      displayEruditionHelp();
      break;
    default:
      console.log(chalk.red(`Unknown erudition subcommand: ${subcommand}`));
      displayEruditionHelp();
  }
}

/**
 * Display help information for erudition command
 */
function displayEruditionHelp() {
  console.log(`
  ${chalk.bold.cyan('HERTA.JS ERUDITION')}
  ${chalk.dim('The smart CLI assistant for Herta.js framework')}
  
  ${chalk.bold('Usage:')} 
    herta erudition <subcommand> [options]
  
  ${chalk.bold('Subcommands:')}
    ${chalk.yellow('make')} <type> <name>     Generate component scaffolding
    ${chalk.yellow('analyze')} [path]         Analyze code quality or performance
    ${chalk.yellow('doc')} [component]        Generate documentation
    ${chalk.yellow('test')} [pattern]         Run tests with detailed reports
    ${chalk.yellow('explain')} <topic>        Explain framework concepts in plain English
    ${chalk.yellow('help')}                   Display this help message
  
  ${chalk.bold('Examples:')}
    herta erudition make module QuantumPhysics
    herta erudition doc --all
    herta erudition analyze src/advanced
    herta erudition test --unit
    herta erudition explain config
  `);
}

module.exports = { execErudition };
