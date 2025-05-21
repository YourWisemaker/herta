/**
 * Erudition Make Command
 * Scaffolding tool to generate boilerplate for different components
 * 
 * IMPORTANT: The createProject function COPIES ALL existing files and folders
 * instead of generating new ones, preserving the current project structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

/**
 * Generate component scaffolding based on type and name
 * @param {Array} args - Command line arguments
 */
function make(args) {
  const type = args[0]; // e.g., 'module', 'controller', 'project', etc.
  const name = args[1]; // e.g., 'QuantumPhysics', 'UserController', 'MyMathApp'

  if (!type || !name) {
    console.log(chalk.red('Error: Both type and name are required'));
    console.log(chalk.yellow(`Usage: herta erudition make <type> <name>`));
    console.log(chalk.yellow(`Example: herta erudition make module QuantumPhysics`));
    return;
  }

  // Convert to proper case formats
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const snakeName = toSnakeCase(name);

  try {
    switch (type.toLowerCase()) {
      case 'project':
        createProject(pascalName);
        break;
      case 'module':
        createModule(pascalName);
        break;
      case 'controller':
        createController(pascalName);
        break;
      case 'service':
        createService(pascalName);
        break;
      case 'test':
        createTest(pascalName);
        break;
      case 'api':
        createApi(pascalName);
        break;
      case 'rest-controller':
        createRestController(pascalName);
        break;
      case 'graphql':
        createGraphQL(pascalName);
        break;
      default:
        console.log(chalk.red(`Error: Unknown type '${type}'`));
        displayMakeHelp();
    }
  } catch (error) {
    console.error(chalk.red(`Error creating ${type}: ${error.message}`));
  }
}

/**
 * Create a new module file
 * @param {string} name - Module name in PascalCase
 */
function createModule(name) {
  const destDir = path.join(process.cwd(), 'src', 'advanced');
  const fileName = `${toSnakeCase(name)}.js`;
  const filePath = path.join(destDir, fileName);
  
  // Make sure the destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: Module '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateModuleContent(name);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ Module created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
  console.log(chalk.yellow(`\nNext steps:`));
  console.log(`  1. Import your module in the main index.js file:`);
  console.log(chalk.dim(`     const ${toCamelCase(name)} = require('./advanced/${toSnakeCase(name)}');`));
  console.log(`  2. Register it in your exports:`);
  console.log(chalk.dim(`     module.exports = { ..., ${toCamelCase(name)} };`));
}

/**
 * Create a new controller file
 * @param {string} name - Controller name in PascalCase
 */
function createController(name) {
  // Ensure the name ends with "Controller"
  const controllerName = name.endsWith('Controller') ? name : `${name}Controller`;
  const destDir = path.join(process.cwd(), 'src', 'controllers');
  const fileName = `${toSnakeCase(controllerName)}.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: Controller '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateControllerContent(controllerName);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ Controller created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new service file
 * @param {string} name - Service name in PascalCase
 */
function createService(name) {
  // Ensure the name ends with "Service"
  const serviceName = name.endsWith('Service') ? name : `${name}Service`;
  const destDir = path.join(process.cwd(), 'src', 'services');
  const fileName = `${toSnakeCase(serviceName)}.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: Service '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateServiceContent(serviceName);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ Service created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new test file
 * @param {string} name - Test name in PascalCase
 */
function createTest(name) {
  const destDir = path.join(process.cwd(), 'test');
  const fileName = `${toSnakeCase(name)}.spec.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: Test '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateTestContent(name);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ Test created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new API file
 * @param {string} name - API name in PascalCase
 */
function createApi(name) {
  const destDir = path.join(process.cwd(), 'src', 'api');
  const fileName = `${toSnakeCase(name)}.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: API '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateApiContent(name);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ API created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new REST controller file
 * @param {string} name - REST controller name in PascalCase
 */
function createRestController(name) {
  // Ensure the name ends with "Controller"
  const controllerName = name.endsWith('Controller') ? name : `${name}Controller`;
  const destDir = path.join(process.cwd(), 'src', 'controllers');
  const fileName = `${toSnakeCase(controllerName)}.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: REST Controller '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateRestControllerContent(controllerName);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ REST Controller created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new GraphQL schema and resolver file
 * @param {string} name - GraphQL schema name in PascalCase
 */
function createGraphQL(name) {
  const schemaDestDir = path.join(process.cwd(), 'src', 'api', 'graphql', 'schemas');
  const resolverDestDir = path.join(process.cwd(), 'src', 'api', 'graphql', 'resolvers');
  
  const schemaFileName = `${toSnakeCase(name)}.graphql.js`;
  const resolverFileName = `${toSnakeCase(name)}.resolver.js`;
  
  const schemaFilePath = path.join(schemaDestDir, schemaFileName);
  const resolverFilePath = path.join(resolverDestDir, resolverFileName);
  
  // Make sure the destination directories exist
  if (!fs.existsSync(schemaDestDir)) {
    fs.mkdirSync(schemaDestDir, { recursive: true });
  }
  
  if (!fs.existsSync(resolverDestDir)) {
    fs.mkdirSync(resolverDestDir, { recursive: true });
  }

  // Check if files already exist
  if (fs.existsSync(schemaFilePath)) {
    console.log(chalk.red(`Error: GraphQL Schema '${schemaFileName}' already exists in ${schemaDestDir}`));
    return;
  }
  
  if (fs.existsSync(resolverFilePath)) {
    console.log(chalk.red(`Error: GraphQL Resolver '${resolverFileName}' already exists in ${resolverDestDir}`));
    return;
  }

  const schemaContent = generateGraphQLSchemaContent(name);
  const resolverContent = generateGraphQLResolverContent(name);
  
  fs.writeFileSync(schemaFilePath, schemaContent);
  fs.writeFileSync(resolverFilePath, resolverContent);
  
  console.log(chalk.green(`✓ GraphQL Schema and Resolver created successfully!`));
  console.log(chalk.cyan(`  Schema: ${schemaFilePath}`));
  console.log(chalk.cyan(`  Resolver: ${resolverFilePath}`));
}

/**
 * Display help for make command
 */
function displayMakeHelp() {
  console.log(`
  ${chalk.bold.cyan('HERTA.JS MAKE COMMAND')}
  ${chalk.dim('Generate component scaffolding')}
  
  ${chalk.bold('Usage:')} 
    npx herta erudition make <type> <name>
  
  ${chalk.bold('Types:')}
    ${chalk.yellow('project')}           Create a new project by copying ALL existing files
    ${chalk.yellow('module')}            Create a new module
    ${chalk.yellow('controller')}        Create a new controller
    ${chalk.yellow('service')}           Create a new service
    ${chalk.yellow('api')}               Create a new API endpoint
    ${chalk.yellow('rest-controller')}   Create a RESTful controller
    ${chalk.yellow('graphql')}           Create GraphQL schema and resolver
    ${chalk.yellow('test')}              Create a test suite
  
  ${chalk.bold('Examples:')}
    npx herta erudition make project MyMathApp
    npx herta erudition make module QuantumPhysics
    npx herta erudition make controller UserController
  `);
}

/**
 * Create a new Herta.js project by copying ALL existing files
 * @param {string} name - Project name in PascalCase
 * @param {string} [targetPath] - Project path (optional)
 */
function createProject(name, targetPath) {
  const kebabName = toKebabCase(name);
  const projectPath = targetPath ? `${targetPath}/${kebabName}` : path.join(process.cwd(), kebabName);
  
  // Find the project root directory (where package.json is located)
  let currentPath = __dirname; // Start from the directory of this script
  while (currentPath !== '/' && !fs.existsSync(path.join(currentPath, 'package.json'))) {
    currentPath = path.dirname(currentPath);
  }
  
  // If we couldn't find package.json, try the current working directory as a fallback
  if (currentPath === '/' && !fs.existsSync(path.join(currentPath, 'package.json'))) {
    currentPath = process.cwd();
    console.log(chalk.yellow(`Could not find package.json in parent directories, using current directory: ${currentPath}`));
  }
  
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Error: Directory ${kebabName} already exists`));
    return;
  }
  
  console.log(chalk.cyan(`Creating project by copying ALL existing files: ${chalk.bold(kebabName)}...`));
  
  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true });

  // List of directories to copy
  const dirsToCreate = [
    'src',
    'test',
    'docs',
    'bin',
    'commands',
    'examples',
    'scripts',
    'templates',
    'public',
    'dist'
  ];
  
  // Create each directory
  dirsToCreate.forEach(dir => {
    const targetDir = path.join(projectPath, dir);
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  });
  
  // Copy all directories recursively
  console.log(chalk.cyan('Copying all files and directories...'));
  
  dirsToCreate.forEach(dir => {
    const sourceDir = path.join(currentPath, dir);
    const targetDir = path.join(projectPath, dir);
    
    if (fs.existsSync(sourceDir)) {
      try {
        console.log(chalk.green(`Copying directory: ${dir}`));
        // First remove the target directory
        execSync(`rm -rf "${targetDir}"`, { stdio: 'pipe' });
        // Then copy the entire source directory with its contents
        execSync(`cp -R "${sourceDir}" "${path.dirname(targetDir)}/"`, { stdio: 'pipe' });
        console.log(chalk.green(`✓ Successfully copied all files in ${dir}`));
      } catch (error) {
        console.log(chalk.red(`Error copying directory ${dir}: ${error.message}`));
      }
    }
  });
  
  // Copy important root files
  const rootFiles = [
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'webpack.config.js',
    'webpack.cli.config.js',
    'webpack.api.config.js',
    '.gitignore',
    '.npmrc',
    '.eslintrc.js',
    'swaggerDef.js',
    'jest.config.js',
    'server.js',
    'index.js',
    'setup.js',        // Ensure setup.js is copied
    'tsconfig.json',  // For TypeScript projects
    '.babelrc',       // Babel configuration if present
    '.prettierrc',    // Code formatting config
    '.editorconfig'   // Editor configuration
  ];
  
  rootFiles.forEach(file => {
    const sourceFile = path.join(currentPath, file);
    const targetFile = path.join(projectPath, file);
    
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(chalk.green(`Copied file: ${file}`));
      } catch (error) {
        console.log(chalk.yellow(`Warning: Could not copy ${file}: ${error.message}`));
      }
    }
  });
  
  // Special handling for package.json - make a direct copy first, then update only the name
  const packageJsonSource = path.join(currentPath, 'package.json');
  const packageJsonTarget = path.join(projectPath, 'package.json');
  
  if (fs.existsSync(packageJsonSource)) {
    try {
      // First make a direct copy to preserve ALL contents
      fs.copyFileSync(packageJsonSource, packageJsonTarget);
      console.log(chalk.green('✓ Copied package.json'));
      
      // Then update only the minimal required fields
      const packageJson = JSON.parse(fs.readFileSync(packageJsonTarget, 'utf8'));
      packageJson.name = kebabName;
      packageJson.description = `${name} - Built with Herta.js framework`;
      
      // Write it back with just those changes, preserving EVERYTHING else
      fs.writeFileSync(packageJsonTarget, JSON.stringify(packageJson, null, 2));
      console.log(chalk.green('✓ Updated package.json name while preserving all scripts and other settings'));
    } catch (error) {
      console.log(chalk.red(`Error updating package.json: ${error.message}`));
      return;
    }
  } else {
    console.log(chalk.red('Error: Could not find package.json in the source directory'));
    return;
  }
  
  // Verify critical files were copied successfully
  const criticalPaths = [
    path.join(projectPath, 'package.json'),
    path.join(projectPath, 'server.js'),
    path.join(projectPath, 'index.js'),
    path.join(projectPath, 'setup.js')
  ];
  
  // Check for important src files (like autodiff)
  const srcFiles = fs.readdirSync(path.join(currentPath, 'src'));
  console.log(chalk.cyan('\nVerifying critical source files...'));
  const missingFiles = [];
  
  criticalPaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      missingFiles.push(fileName);
      console.log(chalk.red(`Warning: ${fileName} was not copied!`));
    }
  });
  
  // Specifically check if src files exist in the target
  srcFiles.forEach(srcFile => {
    const sourceFile = path.join(currentPath, 'src', srcFile);
    const targetFile = path.join(projectPath, 'src', srcFile);
    
    // Only check files, not directories
    if (fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile()) {
      if (!fs.existsSync(targetFile)) {
        missingFiles.push(`src/${srcFile}`);
        console.log(chalk.red(`Warning: src/${srcFile} was not copied!`));
      } else {
        console.log(chalk.green(`✓ Verified src/${srcFile}`));
      }
    }
  });
  
  // If we're missing important files, attempt to copy them manually
  if (missingFiles.length > 0) {
    console.log(chalk.yellow('\nAttempting to manually copy missing files...'));
    missingFiles.forEach(fileName => {
      try {
        const dirName = path.dirname(fileName);
        const sourceFile = path.join(currentPath, fileName);
        const targetFile = path.join(projectPath, fileName);
        
        // Ensure the target directory exists
        if (dirName !== '.') {
          fs.mkdirSync(path.join(projectPath, dirName), { recursive: true });
        }
        
        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, targetFile);
          console.log(chalk.green(`✓ Successfully copied ${fileName}`));
        }
      } catch (error) {
        console.log(chalk.red(`Error copying ${fileName}: ${error.message}`));
      }
    });
  }
  
  console.log(chalk.green('\n✓ Successfully copied all project files and directories'));
  console.log(chalk.yellow(`\nInstalling dependencies...`));
  
  try {
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    console.log(chalk.green('✓ Dependencies installed successfully!'));
  } catch (error) {
    console.log(chalk.red(`Error installing dependencies: ${error.message}`));
    console.log(chalk.yellow('You may need to run npm install manually in the project directory.'));
  }
  
  console.log(chalk.green(`\n✓ Project ${chalk.bold(name)} created successfully at ${projectPath}!`));
  console.log(chalk.cyan('\nTo get started:'));
  console.log(chalk.yellow(`  cd ${kebabName}`));
  console.log(chalk.yellow('  npm start'));
}

// Utility functions for case conversion

/**
 * Convert string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
    .replace(/\s+|-|_/g, '');
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => index === 0 ? letter.toLowerCase() : letter.toUpperCase())
    .replace(/\s+|-|_/g, '');
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Template generator functions (implementation will be added as needed)
 */
function generateModuleContent(name) {
  // Using array join method to avoid syntax highlighting issues with comments in template strings
  return [
    `/**`,
    ` * ${name} Module`,
    ` * Advanced mathematical operations for Herta.js`,
    ` */`,
    ``,
    `// Module implementation`,
    `const ${toCamelCase(name)} = {`,
    `  // Add your methods here`,
    `  `,
    `  /**`,
    `   * Example method`,
    `   * @param {number} x - First parameter`,
    `   * @param {number} y - Second parameter`,
    `   * @returns {number} - Result`,
    `   */`,
    `  calculate(x, y) {`,
    `    return x * y;`,
    `  }`,
    `};`,
    ``,
    `module.exports = ${toCamelCase(name)};`
  ].join('\n');
}

function generateControllerContent(name) {
  // Using array join method to avoid syntax highlighting issues with comments in template strings
  return [
    `/**`,
    ` * ${name}`,
    ` * Controller for handling application logic`,
    ` */`,
    ``,
    `class ${name} {`,
    `  /**`,
    `   * Constructor`,
    `   */`,
    `  constructor() {`,
    `    // Initialize controller`,
    `  }`,
    `  `,
    `  /**`,
    `   * Example method`,
    `   * @param {Object} req - Request object`,
    `   * @param {Object} res - Response object`,
    `   */`,
    `  async handleRequest(req, res) {`,
    `    try {`,
    `      // Implementation`,
    `      return { success: true, data: 'Response data' };`,
    `    } catch (error) {`,
    `      return { success: false, error: error.message };`,
    `    }`,
    `  }`,
    `}`,
    ``,
    `module.exports = new ${name}();`
  ].join('\n');
}

function generateServiceContent(name) {
  // Implementation will be similar to controller content
  return [
    `/**`,
    ` * ${name}`,
    ` * Service for business logic`,
    ` */`,
    ``,
    `class ${name} {`,
    `  /**`,
    `   * Constructor`,
    `   */`,
    `  constructor() {`,
    `    // Initialize service`,
    `  }`,
    `  `,
    `  /**`,
    `   * Example method`,
    `   * @param {Object} data - Input data`,
    `   * @returns {Object} - Result`,
    `   */`,
    `  async process(data) {`,
    `    try {`,
    `      // Implementation`,
    `      return { success: true, result: 'Processed data' };`,
    `    } catch (error) {`,
    `      return { success: false, error: error.message };`,
    `    }`,
    `  }`,
    `}`,
    ``,
    `module.exports = new ${name}();`
  ].join('\n');
}

function generateTestContent(name) {
  return [
    `/**`,
    ` * Test Suite for ${name}`,
    ` */`,
    ``,
    `const assert = require('assert');`,
    `// Import module to test`,
    `// const ${toCamelCase(name)} = require('../path/to/${toSnakeCase(name)}');`,
    ``,
    `describe('${name} Tests', () => {`,
    `  before(() => {`,
    `    // Setup test environment`,
    `  });`,
    ``,
    `  after(() => {`,
    `    // Clean up test environment`,
    `  });`,
    ``,
    `  it('should pass a basic test', () => {`,
    `    // Test implementation`,
    `    assert.strictEqual(true, true);`,
    `  });`,
    ``,
    `  it('should handle error conditions', () => {`,
    `    // Test error handling`,
    `    assert.throws(() => {`,
    `      throw new Error('Test error');`,
    `    }, /Test error/);`,
    `  });`,
    `});`
  ].join('\n');
}

function generateApiContent(name) {
  return [
    `/**`,
    ` * ${name} API`,
    ` * RESTful API endpoints`,
    ` */`,
    ``,
    `const express = require('express');`,
    `const router = express.Router();`,
    ``,
    `/**`,
    ` * @swagger`,
    ` * /api/${toKebabCase(name)}:`,
    ` *   get:`,
    ` *     summary: Get data`,
    ` *     description: Retrieve data`,
    ` *     responses:`,
    ` *       200:`,
    ` *         description: Successful operation`,
    ` */`,
    `router.get('/', async (req, res) => {`,
    `  try {`,
    `    // Implementation`,
    `    res.json({ success: true, data: 'Response data' });`,
    `  } catch (error) {`,
    `    res.status(500).json({ success: false, error: error.message });`,
    `  }`,
    `});`,
    ``,
    `/**`,
    ` * @swagger`,
    ` * /api/${toKebabCase(name)}:`,
    ` *   post:`,
    ` *     summary: Create new data`,
    ` *     description: Create new data entry`,
    ` *     responses:`,
    ` *       200:`,
    ` *         description: Successful operation`,
    ` */`,
    `router.post('/', async (req, res) => {`,
    `  try {`,
    `    // Implementation`,
    `    res.json({ success: true, data: 'Data created successfully' });`,
    `  } catch (error) {`,
    `    res.status(500).json({ success: false, error: error.message });`,
    `  }`,
    `});`,
    ``,
    `module.exports = router;`
  ].join('\n');
}

function generateRestControllerContent(name) {
  return [
    `/**`,
    ` * ${name}`,
    ` * REST controller for API endpoints`,
    ` */`,
    ``,
    `const express = require('express');`,
    `const router = express.Router();`,
    ``,
    `/**`,
    ` * @swagger`,
    ` * /api/${toKebabCase(name.replace('Controller', ''))}:`,
    ` *   get:`,
    ` *     summary: Get all items`,
    ` *     description: Retrieves all items`,
    ` *     responses:`,
    ` *       200:`,
    ` *         description: Successful operation`,
    ` */`,
    `router.get('/', async (req, res) => {`,
    `  try {`,
    `    // Implementation for GET all`,
    `    res.json({ success: true, data: [] });`,
    `  } catch (error) {`,
    `    res.status(500).json({ success: false, error: error.message });`,
    `  }`,
    `});`,
    ``,
    `/**`,
    ` * @swagger`,
    ` * /api/${toKebabCase(name.replace('Controller', ''))}/:id:`,
    ` *   get:`,
    ` *     summary: Get item by ID`,
    ` *     description: Retrieves a specific item by ID`,
    ` *     parameters:`,
    ` *       - in: path`,
    ` *         name: id`,
    ` *         required: true`,
    ` *         schema:`,
    ` *           type: string`,
    ` *     responses:`,
    ` *       200:`,
    ` *         description: Successful operation`,
    ` *       404:`,
    ` *         description: Item not found`,
    ` */`,
    `router.get('/:id', async (req, res) => {`,
    `  try {`,
    `    const { id } = req.params;`,
    `    // Implementation for GET by ID`,
    `    res.json({ success: true, data: { id } });`,
    `  } catch (error) {`,
    `    res.status(500).json({ success: false, error: error.message });`,
    `  }`,
    `});`,
    ``,
    `module.exports = router;`
  ].join('\n');
}

function generateGraphQLSchemaContent(name) {
  return [
    `/**`,
    ` * ${name} GraphQL Schema`,
    ` */`,
    ``,
    `const { gql } = require('apollo-server-express');`,
    ``,
    `const ${name}Schema = gql\``,
    `  type ${name} {`,
    `    id: ID!`,
    `    name: String!`,
    `    description: String`,
    `    createdAt: String!`,
    `    updatedAt: String!`,
    `  }`,
    ``,
    `  extend type Query {`,
    `    get${name}(id: ID!): ${name}`,
    `    getAll${name}s: [${name}!]!`,
    `  }`,
    ``,
    `  extend type Mutation {`,
    `    create${name}(name: String!, description: String): ${name}!`,
    `    update${name}(id: ID!, name: String, description: String): ${name}!`,
    `    delete${name}(id: ID!): Boolean!`,
    `  }`,
    `\`;`,
    ``,
    `module.exports = ${name}Schema;`
  ].join('\n');
}

function generateGraphQLResolverContent(name) {
  return [
    `/**`,
    ` * ${name} GraphQL Resolvers`,
    ` */`,
    ``,
    `const ${name}Resolvers = {`,
    `  Query: {`,
    `    /**`,
    `     * Get ${name} by ID`,
    `     * @param {Object} _ - Parent resolver`,
    `     * @param {Object} args - Query arguments`,
    `     * @returns {Object} - ${name} object`,
    `     */`,
    `    async get${name}(_, { id }) {`,
    `      try {`,
    `        // Implementation`,
    `        return {`,
    `          id,`,
    `          name: 'Example',`,
    `          description: 'Example description',`,
    `          createdAt: new Date().toISOString(),`,
    `          updatedAt: new Date().toISOString()`,
    `        };`,
    `      } catch (error) {`,
    `        throw new Error(\`Failed to get ${name}: \${error.message}\`);`,
    `      }`,
    `    }`,
    `  }`,
    `};`,
    ``,
    `module.exports = ${name}Resolvers;`
  ].join('\n');
}

module.exports = make;
