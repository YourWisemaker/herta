#!/usr/bin/env node

/**
 * Herta.js CLI Tool - Erudition
 * The command-line interface for the Herta.js framework
 */

const { execErudition } = require('../commands/erudition');

// Process command-line arguments
const [,, cmd, ...args] = process.argv;

// Command dispatcher
switch (cmd) {
  case 'erudition':
    execErudition(args);
    break;
  case 'help':
  case undefined:
    displayHelp();
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    console.log('Run "herta help" for a list of available commands.');
    break;
}

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
