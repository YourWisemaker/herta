/**
 * Herta Erudition CLI Demo
 * This script demonstrates how to programmatically interact with the Erudition CLI
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Herta.js Erudition CLI Demo');
console.log('===========================\n');

// Helper function to run CLI commands and display output
function runEruditionCommand(command) {
  console.log(`> herta erudition ${command}\n`);
  try {
    const output = execSync(`node ${path.join(__dirname, '../../bin/herta.js')} erudition ${command}`, {
      encoding: 'utf8'
    });
    console.log(output);
    return output;
  } catch (error) {
    console.error('Error executing command:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return null;
  }
}

// 1. Demonstrate the help command
console.log('Demonstrating help command:');
console.log('-------------------------');
runEruditionCommand('help');

// 2. Create a temporary module for demonstration
console.log('\nCreating a demo module:');
console.log('---------------------');
const demoModuleName = `DemoModule${Math.floor(Math.random() * 1000)}`;
runEruditionCommand(`make module ${demoModuleName}`);

// Check if the module was created
const modulePath = path.join(__dirname, '../../src/advanced', `${demoModuleName.toLowerCase()}.js`);
if (fs.existsSync(modulePath)) {
  console.log(`\nSuccess! Module created at: ${modulePath}`);

  // Display the generated module content
  console.log('\nGenerated module content:');
  console.log('-----------------------');
  const moduleContent = fs.readFileSync(modulePath, 'utf8');
  console.log(moduleContent);
} else {
  console.log('\nModule creation failed or the path is different from expected.');
}

// 3. Generate documentation for the module
console.log('\nGenerating documentation:');
console.log('------------------------');
runEruditionCommand(`doc ${demoModuleName.toLowerCase()}`);

// Check if documentation was generated
const docPath = path.join(__dirname, '../../docs', `${demoModuleName.toLowerCase()}.md`);
if (fs.existsSync(docPath)) {
  console.log(`\nSuccess! Documentation created at: ${docPath}`);

  // Display the generated documentation
  console.log('\nGenerated documentation:');
  console.log('------------------------');
  const docContent = fs.readFileSync(docPath, 'utf8');
  console.log(docContent);
} else {
  console.log('\nDocumentation generation failed or the path is different from expected.');
}

// 4. Demonstrate the explain command
console.log('\nDemonstrating explain command:');
console.log('----------------------------');
runEruditionCommand('explain algorithms');

// 5. Clean up demo files (optional)
console.log('\nCleaning up demo files:');
console.log('---------------------');
try {
  if (fs.existsSync(modulePath)) {
    fs.unlinkSync(modulePath);
    console.log(`Removed ${modulePath}`);
  }

  if (fs.existsSync(docPath)) {
    fs.unlinkSync(docPath);
    console.log(`Removed ${docPath}`);
  }

  console.log('\nCleanup completed successfully.');
} catch (error) {
  console.error('Error during cleanup:', error.message);
}

console.log('\nErudition CLI demo completed!');
