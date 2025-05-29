#!/usr/bin/env node

/**
 * Herta.js CLI Tool - Erudition
 * The command-line interface for the Herta.js framework
 */

const { execErudition } = require('../commands/erudition');
const packageJson = require('../package.json'); // Moved here

// Display help information
function displayHelp() {
  console.log(`
  ╭─────────────────────────────────────────────────╮
  │                  HERTA.JS CLI                   │
  ╰─────────────────────────────────────────────────╯
  
  Usage: herta <command> [options]
  
  Available commands:
    erudition <subcommand>    Scaffolding and helper tools
    help                      Display this help message
  
  Erudition subcommands:
    make <type> <name>        Generate a new component
    analyze                   Analyze code or performance
    doc                       Generate documentation
    test                      Run tests with summaries
    explain                   Explain configuration options
  
  Examples:
    herta erudition make module QuantumPhysics
    herta erudition doc
  `);
}

// Process command-line arguments
const [,, cmd, ...args] = process.argv;

// Command dispatcher
switch (cmd) {
  case 'erudition':
    execErudition(args);
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    displayHelp();
    break;
  default:
    // Check if using flag format for a command (e.g. --version)
    if (cmd.startsWith('--') || cmd.startsWith('-')) {
      const flagName = cmd.replace(/^-+/, '');

      if (flagName === 'version' || flagName === 'v') {
        console.log(`Herta.js v${packageJson.version}`);
        process.exit(0); // Changed from return
      } else {
        displayHelp();
        process.exit(0); // Changed from return
      }
    }

    console.log(`Unknown command: ${cmd}`);
    console.log('Run "herta help" for a list of available commands.');
    break;
}
