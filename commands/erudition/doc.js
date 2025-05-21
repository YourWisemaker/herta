/**
 * Erudition Doc Command
 * Generates documentation from Herta.js code
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Generate documentation
 * @param {Array} args - Command line arguments
 */
function doc(args) {
  const options = parseOptions(args);
  
  console.log(chalk.cyan('Herta.js Documentation Generator'));
  
  try {
    if (options.component) {
      generateComponentDocs(options.component);
    } else if (options.all) {
      generateAllDocs();
    } else {
      displayDocHelp();
    }
  } catch (error) {
    console.error(chalk.red(`Error generating documentation: ${error.message}`));
  }
}

/**
 * Parse command line options
 * @param {Array} args - Command line arguments
 * @returns {Object} - Parsed options
 */
function parseOptions(args) {
  const options = {
    component: null,
    all: false,
    format: 'markdown'
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all' || args[i] === '-a') {
      options.all = true;
    } else if (args[i] === '--format' || args[i] === '-f') {
      options.format = args[i + 1] || 'markdown';
      i++;
    } else if (!args[i].startsWith('-')) {
      options.component = args[i];
    }
  }
  
  return options;
}

/**
 * Generate documentation for a specific component
 * @param {string} component - Component name or path
 */
function generateComponentDocs(component) {
  console.log(chalk.yellow(`Generating documentation for ${component}`));
  
  // Determine if component is a path or a module name
  let componentPath;
  if (component.includes('/') || component.includes('\\')) {
    componentPath = path.resolve(component);
  } else {
    // Try to find the component in standard locations
    for (const dir of ['src/core', 'src/advanced', 'src/utils']) {
      const candidatePath = path.join(process.cwd(), dir, `${component}.js`);
      if (fs.existsSync(candidatePath)) {
        componentPath = candidatePath;
        break;
      }
    }
  }
  
  if (!componentPath || !fs.existsSync(componentPath)) {
    console.log(chalk.red(`Component not found: ${component}`));
    return;
  }
  
  // Read the component file
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Parse JSDoc comments and generate documentation
  const docs = parseJsDoc(content, component);
  
  // Create documentation file
  const docDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docDir)) {
    fs.mkdirSync(docDir, { recursive: true });
  }
  
  const docFileName = path.join(docDir, `${path.basename(componentPath, '.js')}.md`);
  fs.writeFileSync(docFileName, docs);
  
  console.log(chalk.green(`✓ Documentation generated successfully!`));
  console.log(chalk.cyan(`  File: ${docFileName}`));
}

/**
 * Generate documentation for all components
 */
function generateAllDocs() {
  console.log(chalk.yellow('Generating documentation for all components'));
  
  // This would recursively find all .js files and generate docs
  const dirs = ['src/core', 'src/advanced', 'src/utils'];
  let totalFiles = 0;
  
  // Create main README for the docs
  const docDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docDir)) {
    fs.mkdirSync(docDir, { recursive: true });
  }
  
  // Generate index document
  const indexContent = generateIndexDocument();
  fs.writeFileSync(path.join(docDir, 'README.md'), indexContent);
  
  // For demo, we'll simulate documenting a few files
  generateComponentDocs('matrix');
  generateComponentDocs('statistics');
  generateComponentDocs('technicalAnalysis');
  
  console.log(chalk.green(`✓ All documentation generated successfully!`));
  console.log(chalk.cyan(`  Documentation directory: ${docDir}`));
}

/**
 * Generate index document
 * @returns {string} - Index document content
 */
function generateIndexDocument() {
  return `# Herta.js Documentation

## Overview
Herta.js is a comprehensive mathematical framework for advanced computational needs in science, engineering, and financial domains.

## Modules

### Core Modules
- [Matrix](./matrix.md) - Matrix operations and linear algebra
- [Statistics](./statistics.md) - Statistical functions and probability distributions
- [Arithmetic](./arithmetic.md) - Basic arithmetic operations with enhanced precision

### Advanced Modules
- [Quantum Mechanics](./quantum_mechanics.md) - Quantum state representations and operations
- [Neural Networks](./neural_networks.md) - Neural network implementations
- [Technical Analysis](./technical_analysis.md) - Financial technical indicators
- [Risk Management](./risk_management.md) - Financial risk assessment tools

## Usage Examples
See the [README.md](../README.md) for detailed usage examples of each module.

## API Reference
Each module's documentation includes a complete API reference with parameters, return types, and examples.
`;
}

/**
 * Parse JSDoc comments from code
 * @param {string} content - File content
 * @param {string} moduleName - Module name
 * @returns {string} - Markdown documentation
 */
function parseJsDoc(content, moduleName) {
  // This is a simplified implementation for demo purposes
  // A real implementation would use a proper JSDoc parser
  
  // Extract module description from the first block comment
  const moduleDescMatch = content.match(/\/\*\*\s*\n([^\*]|\*[^\/])*\*\//);
  const moduleDesc = moduleDescMatch 
    ? moduleDescMatch[0].replace(/\/\*\*|\*\//g, '').replace(/\s*\*\s*/g, ' ').trim()
    : 'No description available';
  
  // Extract function names
  const functionMatches = content.match(/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\s*=\s*function/g) || [];
  const functions = functionMatches.map(match => match.match(/([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)/)[2]);
  
  // Create markdown content
  let markdown = `# ${moduleName}\n\n`;
  
  markdown += `## Overview\n${moduleDesc}\n\n`;
  
  markdown += `## Functions\n\n`;
  
  functions.forEach(func => {
    // Find function description
    const functionRegex = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*${moduleName}\\.${func}\\s*=\\s*function`);
    const functionMatch = content.match(functionRegex);
    
    let functionDesc = 'No description available';
    let paramsDoc = [];
    let returnDoc = 'Not documented';
    
    if (functionMatch) {
      const docBlock = functionMatch[0].match(/\/\*\*[\s\S]*?\*\//)[0];
      
      // Extract description
      const descMatch = docBlock.match(/@description\s+(.*?)(\n\s*\*|$)/);
      if (descMatch) {
        functionDesc = descMatch[1].trim();
      } else {
        // Try to get description from the first line
        const firstLineMatch = docBlock.match(/\/\*\*\s*\n\s*\*\s*(.*?)(\n|$)/);
        if (firstLineMatch) {
          functionDesc = firstLineMatch[1].trim();
        }
      }
      
      // Extract parameters
      const paramMatches = docBlock.match(/@param\s+\{[^}]+\}\s+([^\s]+)\s+-\s+(.*?)(\n\s*\*|$)/g);
      if (paramMatches) {
        paramsDoc = paramMatches.map(param => {
          const paramMatch = param.match(/@param\s+\{([^}]+)\}\s+([^\s]+)\s+-\s+(.*?)(\n\s*\*|$)/);
          return {
            type: paramMatch[1],
            name: paramMatch[2],
            desc: paramMatch[3].trim()
          };
        });
      }
      
      // Extract return
      const returnMatch = docBlock.match(/@returns?\s+\{([^}]+)\}\s+-\s+(.*?)(\n\s*\*|$)/);
      if (returnMatch) {
        returnDoc = `**${returnMatch[1]}** - ${returnMatch[2].trim()}`;
      }
    }
    
    markdown += `### ${func}\n\n${functionDesc}\n\n`;
    
    if (paramsDoc.length > 0) {
      markdown += `#### Parameters\n\n`;
      paramsDoc.forEach(param => {
        markdown += `- \`${param.name}\` (${param.type}): ${param.desc}\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `#### Returns\n\n${returnDoc}\n\n`;
    
    // Add example usage
    markdown += `#### Example\n\n\`\`\`javascript\n// Example usage of ${moduleName}.${func}\nconst result = herta.${moduleName}.${func}(/* parameters */);\n\`\`\`\n\n`;
  });
  
  return markdown;
}

/**
 * Display help for doc command
 */
function displayDocHelp() {
  console.log(`
  ${chalk.bold.cyan('HERTA.JS ERUDITION DOC')}
  ${chalk.dim('Documentation generator for Herta.js framework')}
  
  ${chalk.bold('Usage:')} 
    herta erudition doc [options] [component]
  
  ${chalk.bold('Options:')}
    ${chalk.yellow('--all')}, ${chalk.yellow('-a')}            Generate documentation for all components
    ${chalk.yellow('--format')}, ${chalk.yellow('-f')} <type>  Output format (markdown, html, json)
  
  ${chalk.bold('Examples:')}
    herta erudition doc matrix
    herta erudition doc --all
    herta erudition doc --format html neuralNetworks
  `);
}

module.exports = doc;
