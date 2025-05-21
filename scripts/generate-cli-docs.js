#!/usr/bin/env node

/**
 * CLI Documentation Generator for Herta.js
 * Analyzes the commands directory and generates comprehensive documentation
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'cli');
const COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'erudition');
const README_PATH = path.join(__dirname, '..', 'README.md');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(chalk.cyan('Herta.js CLI Documentation Generator'));
console.log(chalk.dim('─'.repeat(50)));

// Read command files
const commandFiles = fs.readdirSync(COMMANDS_DIR)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${commandFiles.length} commands to document`);

// Extract command information
const commandDocs = commandFiles.map(file => {
  const name = path.basename(file, '.js');
  const filePath = path.join(COMMANDS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract description
  const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*Erudition\s+(.*?)\s*Command\s*\n\s*\*\s*(.*?)\s*\n/);
  const description = descriptionMatch ? descriptionMatch[2] : 'No description available';
  
  // Extract help text
  const helpMatch = content.match(/displayHelp\(\)\s*{\s*console\.log\(`([^`]*)`/s);
  const helpText = helpMatch ? helpMatch[1] : 'No help text available';
  
  // Extract supported options
  const optionsMatch = content.match(/parseOptions\([^)]*\)\s*{[^{]*{\s*([^}]*)\s*}/);
  let options = [];
  if (optionsMatch) {
    const optionsText = optionsMatch[1];
    const optionRegex = /(\w+):\s*(false|true|null|"[^"]*")/g;
    let match;
    while ((match = optionRegex.exec(optionsText)) !== null) {
      options.push({
        name: match[1],
        defaultValue: match[2]
      });
    }
  }
  
  return {
    name,
    description,
    helpText,
    options
  };
});

// Generate markdown documentation
const generateMarkdown = () => {
  let md = '# Herta.js CLI Documentation\n\n';
  md += 'This document provides detailed information about the Herta.js command-line interface.\n\n';
  md += '## Available Commands\n\n';
  
  commandDocs.forEach(cmd => {
    md += `### ${cmd.name}\n\n`;
    md += `${cmd.description}\n\n`;
    
    if (cmd.options.length > 0) {
      md += '#### Options\n\n';
      md += '| Option | Default | Description |\n';
      md += '|--------|---------|-------------|\n';
      cmd.options.forEach(opt => {
        md += `| --${opt.name} | ${opt.defaultValue} | |\n`;
      });
      md += '\n';
    }
    
    md += '#### Usage Examples\n\n';
    md += '```bash\n';
    md += `herta erudition ${cmd.name} [options]\n`;
    md += '```\n\n';
  });
  
  md += '## Full CLI Reference\n\n';
  md += 'See the [README.md](../README.md) for comprehensive examples and usage patterns.\n';
  
  return md;
};

// Save markdown documentation
const markdownOutput = generateMarkdown();
fs.writeFileSync(path.join(OUTPUT_DIR, 'cli-reference.md'), markdownOutput);

// Generate HTML documentation
const generateHTML = () => {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Herta.js CLI Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #0366d6; }
    h2 { 
      color: #24292e;
      margin-top: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }
    h3 { color: #24292e; }
    pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
    }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      padding: 0.2em 0.4em;
      font-size: 85%;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
      text-align: left;
    }
    th {
      background-color: #f6f8fa;
    }
    tr:nth-child(even) {
      background-color: #f6f8fa;
    }
  </style>
</head>
<body>
  <h1>Herta.js CLI Documentation</h1>
  <p>This document provides detailed information about the Herta.js command-line interface.</p>
  
  <h2>Available Commands</h2>
`;

  commandDocs.forEach(cmd => {
    html += `<h3>${cmd.name}</h3>`;
    html += `<p>${cmd.description}</p>`;
    
    if (cmd.options.length > 0) {
      html += '<h4>Options</h4>';
      html += '<table>';
      html += '<tr><th>Option</th><th>Default</th><th>Description</th></tr>';
      cmd.options.forEach(opt => {
        html += `<tr><td>--${opt.name}</td><td>${opt.defaultValue}</td><td></td></tr>`;
      });
      html += '</table>';
    }
    
    html += '<h4>Usage Examples</h4>';
    html += '<pre><code>herta erudition ' + cmd.name + ' [options]</code></pre>';
  });
  
  html += `
  <h2>Full CLI Reference</h2>
  <p>See the <a href="../README.md">README.md</a> for comprehensive examples and usage patterns.</p>
</body>
</html>`;
  
  return html;
};

// Save HTML documentation
const htmlOutput = generateHTML();
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlOutput);

// Create machine-readable JSON documentation for tooling
const jsonOutput = JSON.stringify(commandDocs, null, 2);
fs.writeFileSync(path.join(OUTPUT_DIR, 'cli-reference.json'), jsonOutput);

console.log(chalk.green('✓ CLI documentation generated successfully'));
console.log(chalk.dim(`- Markdown: ${path.join(OUTPUT_DIR, 'cli-reference.md')}`));
console.log(chalk.dim(`- HTML: ${path.join(OUTPUT_DIR, 'index.html')}`));
console.log(chalk.dim(`- JSON: ${path.join(OUTPUT_DIR, 'cli-reference.json')}`));
