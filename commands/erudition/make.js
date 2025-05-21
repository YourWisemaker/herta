/**
 * Erudition Make Command
 * Scaffolding tool to generate boilerplate for different components
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Generate component scaffolding based on type and name
 * @param {Array} args - Command line arguments
 */
function make(args) {
  const type = args[0]; // e.g., 'module', 'controller', etc.
  const name = args[1]; // e.g., 'QuantumPhysics', 'UserController'

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
        console.log(chalk.red(`Unknown component type: ${type}`));
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
  const fileName = `${toSnakeCase(name)}.test.js`;
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
  console.log(chalk.yellow(`\nRun the test with:`));
  console.log(chalk.dim(`  herta erudition test ${fileName}`));
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
  const destDir = path.join(process.cwd(), 'src', 'controllers');
  const fileName = `${toSnakeCase(name)}.js`;
  const filePath = path.join(destDir, fileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(chalk.red(`Error: REST controller '${fileName}' already exists in ${destDir}`));
    return;
  }

  const fileContent = generateRestControllerContent(name);
  fs.writeFileSync(filePath, fileContent);
  
  console.log(chalk.green(`✓ REST controller created successfully!`));
  console.log(chalk.cyan(`  File: ${filePath}`));
}

/**
 * Create a new GraphQL schema and resolver file
 * @param {string} name - GraphQL schema name in PascalCase
 */
function createGraphQL(name) {
  const destDir = path.join(process.cwd(), 'src', 'graphql');
  const schemaFileName = `${toSnakeCase(name)}.schema.js`;
  const resolverFileName = `${toSnakeCase(name)}.resolver.js`;
  const schemaFilePath = path.join(destDir, schemaFileName);
  const resolverFilePath = path.join(destDir, resolverFileName);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(schemaFilePath) || fs.existsSync(resolverFilePath)) {
    console.log(chalk.red(`Error: GraphQL schema or resolver '${name}' already exists in ${destDir}`));
    return;
  }

  const schemaFileContent = generateGraphQLSchemaContent(name);
  const resolverFileContent = generateGraphQLResolverContent(name);
  fs.writeFileSync(schemaFilePath, schemaFileContent);
  fs.writeFileSync(resolverFilePath, resolverFileContent);
  
  console.log(chalk.green(`✓ GraphQL schema and resolver created successfully!`));
  console.log(chalk.cyan(`  Schema file: ${schemaFilePath}`));
  console.log(chalk.cyan(`  Resolver file: ${resolverFilePath}`));
}

/**
 * Display help for make command
 */
function displayMakeHelp() {
  console.log(`
  ${chalk.bold.cyan('HERTA.JS MAKE')}
  ${chalk.dim('Generate component scaffolding for Herta.js')}
  
  ${chalk.bold('Usage:')} 
    herta erudition make <type> <n>
  
  ${chalk.bold('Types:')}
    ${chalk.yellow('project')}          Create a new Herta.js project
    ${chalk.yellow('module')}           Create a new module
    ${chalk.yellow('controller')}       Create a new controller
    ${chalk.yellow('service')}          Create a new service
    ${chalk.yellow('test')}             Create a new test file
    ${chalk.yellow('api')}              Create a complete REST API
    ${chalk.yellow('rest-controller')}  Create a REST controller
    ${chalk.yellow('graphql')}          Create a GraphQL schema and resolver
  
  ${chalk.bold('Examples:')}
    ${chalk.cyan('herta erudition make project MyMathApp')}   ${chalk.dim('# Create a new Herta.js project')}
    herta erudition make module QuantumPhysics
    herta erudition make controller DataController
    herta erudition make service AnalysisService
    herta erudition make test QuantumTest
    herta erudition make api UserManagement
    herta erudition make rest-controller Products
    herta erudition make graphql BookSchema
  `);
}

// Template generators
function generateModuleContent(name) {
  const camelName = toCamelCase(name);
  
  return `/**
 * ${name} module for herta.js
 * Provides mathematical functions for ${camelName} operations
 */

const arithmetic = require('../core/arithmetic');
const statistics = require('../core/statistics');

const ${camelName} = {};

/**
 * Description of first function
 * @param {type} param - Parameter description
 * @returns {type} - Return value description
 */
${camelName}.firstFunction = function(param) {
  // Implementation
  return param;
};

/**
 * Description of second function
 * @param {type} param - Parameter description
 * @returns {type} - Return value description
 */
${camelName}.secondFunction = function(param) {
  // Implementation
  return param;
};

module.exports = ${camelName};`;
}

function generateControllerContent(name) {
  return `/**
 * ${name}
 * Controller for handling related operations
 */

class ${name} {
  /**
   * Initialize controller
   */
  constructor() {
    // Initialize controller
  }

  /**
   * Handle main operation
   * @param {Object} params - Operation parameters
   * @returns {Object} - Operation result
   */
  handleOperation(params) {
    // Implementation
    return { success: true, data: params };
  }
}

module.exports = ${name};`;
}

function generateServiceContent(name) {
  return `/**
 * ${name}
 * Service for providing business logic
 */

class ${name} {
  /**
   * Initialize service
   */
  constructor() {
    // Initialize service
  }

  /**
   * Process data
   * @param {Object} data - Data to process
   * @returns {Object} - Processed data
   */
  processData(data) {
    // Implementation
    return { processed: data };
  }
}

module.exports = ${name};`;
}

function generateTestContent(name) {
  const camelName = toCamelCase(name);
  
  return `/**
 * Tests for ${name} module
 */

const assert = require('assert');
const ${camelName} = require('../src/advanced/${toSnakeCase(name)}');

describe('${name} Module', () => {
  before(() => {
    // Setup before tests
  });

  it('should correctly execute firstFunction', () => {
    const result = ${camelName}.firstFunction('test');
    assert.strictEqual(result, 'test');
  });

  it('should correctly execute secondFunction', () => {
    const result = ${camelName}.secondFunction('test');
    assert.strictEqual(result, 'test');
  });

  after(() => {
    // Cleanup after tests
  });
});`;
}

// Helper functions for case conversion
function toPascalCase(str) {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toUpperCase());
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Generate API content
 * @param {string} name - API name in PascalCase
 * @returns {string} - Content for the API file
 */
function generateApiContent(name) {
  const camelName = toCamelCase(name);
  return `/**
 * ${name} API
 * Complete REST API implementation with Express router
 */

const express = require('express');
const router = express.Router();
const herta = require('herta');
const ${camelName}Controller = require('../controllers/${toSnakeCase(name)}_controller');

/**
 * Configure ${name} API routes
 */
function setup${name}Api() {
  // GET all ${camelName}s
  router.get('/${toSnakeCase(name)}s', ${camelName}Controller.getAll);

  // GET single ${camelName} by ID
  router.get('/${toSnakeCase(name)}s/:id', ${camelName}Controller.getById);

  // POST new ${camelName}
  router.post('/${toSnakeCase(name)}s', ${camelName}Controller.create);

  // PUT/update existing ${camelName}
  router.put('/${toSnakeCase(name)}s/:id', ${camelName}Controller.update);

  // DELETE ${camelName}
  router.delete('/${toSnakeCase(name)}s/:id', ${camelName}Controller.delete);

  // Additional specialized endpoints
  router.get('/${toSnakeCase(name)}s/search', ${camelName}Controller.search);
  router.post('/${toSnakeCase(name)}s/:id/process', ${camelName}Controller.process);

  return router;
}

module.exports = setup${name}Api;
`;
}

/**
 * Generate REST controller content
 * @param {string} name - Controller name in PascalCase
 * @returns {string} - Content for the REST controller file
 */
function generateRestControllerContent(name) {
  const camelName = toCamelCase(name);
  return `/**
 * ${name} REST Controller
 * Handles HTTP requests for ${name} resources
 */

const herta = require('herta');

/**
 * ${name} controller with REST endpoints
 */
const ${camelName}Controller = {
  /**
   * Get all ${camelName}s
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAll: async (req, res) => {
    try {
      // Example: Apply filters from query parameters
      const filters = req.query;
      
      // Example: Use herta's data processing capabilities
      const results = await herta.data.find('${toSnakeCase(name)}s', filters);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get ${camelName} by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await herta.data.findById('${toSnakeCase(name)}s', id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: '${name} not found'
        });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Create new ${camelName}
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  create: async (req, res) => {
    try {
      const ${camelName}Data = req.body;
      
      // Validate input using herta validation
      const validationResult = herta.validation.validate(${camelName}Data, {
        // Define validation schema here
      });
      
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          errors: validationResult.errors
        });
      }
      
      const result = await herta.data.create('${toSnakeCase(name)}s', ${camelName}Data);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update ${camelName} by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const ${camelName}Data = req.body;
      
      const updated = await herta.data.update('${toSnakeCase(name)}s', id, ${camelName}Data);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: '${name} not found'
        });
      }
      
      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Delete ${camelName} by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await herta.data.delete('${toSnakeCase(name)}s', id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: '${name} not found'
        });
      }
      
      res.json({
        success: true,
        message: '${name} deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Search ${camelName}s by criteria
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  search: async (req, res) => {
    try {
      const query = req.query.q || '';
      const results = await herta.data.search('${toSnakeCase(name)}s', query);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Process ${camelName} data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  process: async (req, res) => {
    try {
      const id = req.params.id;
      const ${camelName} = await herta.data.findById('${toSnakeCase(name)}s', id);
      
      if (!${camelName}) {
        return res.status(404).json({
          success: false,
          error: '${name} not found'
        });
      }
      
      // Example: Process data using specialized Herta modules
      const processedData = herta.advanced.processData(${camelName});
      
      res.json({
        success: true,
        data: processedData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = ${camelName}Controller;
`;
}

/**
 * Generate GraphQL schema content
 * @param {string} name - Schema name in PascalCase
 * @returns {string} - Content for the GraphQL schema file
 */
function generateGraphQLSchemaContent(name) {
  return `/**
 * ${name} GraphQL Schema
 */

const { gql } = require('apollo-server-express');

const ${name}Schema = gql\`
  # ${name} type definition
  type ${name} {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
    # Add more fields as needed
  }

  # Input type for creating ${name}
  input Create${name}Input {
    name: String!
    description: String
    # Add more fields as needed
  }

  # Input type for updating ${name}
  input Update${name}Input {
    name: String
    description: String
    # Add more fields as needed
  }

  # Extension for Query type
  extend type Query {
    # Get all ${name}s
    get${name}s: [${name}!]!
    
    # Get a single ${name} by ID
    get${name}(id: ID!): ${name}
  }

  # Extension for Mutation type
  extend type Mutation {
    # Create a new ${name}
    create${name}(input: Create${name}Input!): ${name}!
    
    # Update an existing ${name}
    update${name}(id: ID!, input: Update${name}Input!): ${name}!
    
    # Delete a ${name}
    delete${name}(id: ID!): Boolean!
  }
\`;

module.exports = ${name}Schema;
`;
}

/**
 * Generate GraphQL resolver content
 * @param {string} name - Resolver name in PascalCase
 * @returns {string} - Content for the GraphQL resolver file
 */
function generateGraphQLResolverContent(name) {
  const camelName = toCamelCase(name);
  return `/**
 * ${name} GraphQL Resolvers
 */

const herta = require('herta');

const ${name}Resolvers = {
  Query: {
    /**
     * Get all ${camelName}s
     */
    get${name}s: async () => {
      try {
        return await herta.data.find('${toSnakeCase(name)}s');
      } catch (error) {
        throw new Error(\`Failed to get ${camelName}s: \${error.message}\`);
      }
    },
    
    /**
     * Get a single ${camelName} by ID
     */
    get${name}: async (_, { id }) => {
      try {
        const ${camelName} = await herta.data.findById('${toSnakeCase(name)}s', id);
        if (!${camelName}) {
          throw new Error('${name} not found');
        }
        return ${camelName};
      } catch (error) {
        throw new Error(\`Failed to get ${camelName}: \${error.message}\`);
      }
    }
  },
  
  Mutation: {
    /**
     * Create a new ${camelName}
     */
    create${name}: async (_, { input }) => {
      try {
        // Validate input using herta validation
        const validationResult = herta.validation.validate(input, {
          // Define validation schema here
        });
        
        if (!validationResult.valid) {
          throw new Error(\`Validation failed: \${JSON.stringify(validationResult.errors)}\`);
        }
        
        return await herta.data.create('${toSnakeCase(name)}s', input);
      } catch (error) {
        throw new Error(\`Failed to create ${camelName}: \${error.message}\`);
      }
    },
    
    /**
     * Update an existing ${camelName}
     */
    update${name}: async (_, { id, input }) => {
      try {
        const updated = await herta.data.update('${toSnakeCase(name)}s', id, input);
        
        if (!updated) {
          throw new Error('${name} not found');
        }
        
        return updated;
      } catch (error) {
        throw new Error(\`Failed to update ${camelName}: \${error.message}\`);
      }
    },
    
    /**
     * Delete a ${camelName}
     */
    delete${name}: async (_, { id }) => {
      try {
        const deleted = await herta.data.delete('${toSnakeCase(name)}s', id);
        
        if (!deleted) {
          throw new Error('${name} not found');
        }
        
        return true;
      } catch (error) {
        throw new Error(\`Failed to delete ${camelName}: \${error.message}\`);
      }
    }
  }
};

module.exports = ${name}Resolvers;
`;
}

/**
 * Create a new Herta.js project by copying existing files
 * @param {string} name - Project name in PascalCase
 * @param {string} targetPath - Project path
 */
function createProject(name, targetPath) {
  const { execSync } = require('child_process');
  const kebabName = toKebabCase(name);
  const projectPath = targetPath ? `${targetPath}/${kebabName}` : path.join(process.cwd(), kebabName);
  const currentPath = process.cwd();
  
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Error: Directory ${kebabName} already exists`));
    return;
  }
  
  console.log(chalk.cyan(`Creating project by copying existing files: ${chalk.bold(kebabName)}...`));
  
  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true});
  
  console.log(chalk.cyan('Copying existing project structure...'));
  
  // Create and copy necessary directories
  const dirs = [
    'src',
    'test',
    'docs',
    'bin',
    'commands',
    'examples',
    'scripts',
    'templates',
    'public'
  ];
  
  dirs.forEach(dir => {
    const sourcePath = path.join(currentPath, dir);
    const targetPath = path.join(projectPath, dir);
    
    if (fs.existsSync(sourcePath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      
      // Copy directory contents
      try {
        execSync(`cp -r "${sourcePath}"/* "${targetPath}"/`, { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow(`Note: Some files in ${dir} may not have been copied.`));
      }
    }
  });
  
  console.log(chalk.cyan('Copying all modules and files from core Herta.js package...'));
  
  // Determine the path to the main Herta.js directory
  let hertaRootPath;
  let packagePath;
  
  try {
    // First attempt: try to find using npm's package.json location
    let npmRoot = path.resolve(__dirname, '..', '..');
    const npmPackageJsonPath = path.join(npmRoot, 'package.json');
    
    if (fs.existsSync(npmPackageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(npmPackageJsonPath, 'utf8'));
        if (packageJson.name === 'herta') {
          console.log(chalk.cyan(`Found Herta.js package at: ${npmRoot}`));
          hertaRootPath = npmRoot;
        }
      } catch (err) {
        console.log(chalk.yellow(`Warning: Error reading package.json: ${err.message}`));
      }
    }
    
    // Second attempt: if running from npx or installed package
    if (!hertaRootPath) {
      try {
        packagePath = require.resolve('herta/package.json');
        hertaRootPath = path.dirname(packagePath);
        console.log(chalk.cyan(`Found Herta.js package using require.resolve at: ${hertaRootPath}`));
      } catch (err) {
        console.log(chalk.yellow(`Warning: Could not resolve herta/package.json: ${err.message}`));
      }
    }
    
    // Third attempt: try going up from current file location
    if (!hertaRootPath) {
      hertaRootPath = path.join(__dirname, '..', '..');
      console.log(chalk.cyan(`Using relative path for Herta.js package: ${hertaRootPath}`));
    }
  } catch (error) {
    console.log(chalk.yellow(`Warning during path resolution: ${error.message}`));
    // Last resort fallback
    hertaRootPath = path.join(__dirname, '..', '..');
  }
  
  // Verify the path exists and contains expected files
  if (!fs.existsSync(hertaRootPath)) {
    console.log(chalk.red(`Error: Could not find Herta.js root directory at ${hertaRootPath}`));
    return;
  }
  
  // Check if this is a valid Herta.js package by looking for key directories
  const srcPath = path.join(hertaRootPath, 'src');
  if (!fs.existsSync(srcPath)) {
    console.log(chalk.red(`Error: Found Herta.js directory at ${hertaRootPath}, but it doesn't contain the expected 'src' folder.`));
    console.log(chalk.red(`This might be due to an npm installation structure difference.`));
    
    // In this case, we'll manually create basic files instead of copying
    console.log(chalk.yellow(`Falling back to creating basic project files instead of copying...`));
    
    // Create a flag so we don't try copying later
    const invalidHertaPath = true;
    return invalidHertaPath;
  }
  
  console.log(chalk.green(`✓ Successfully located Herta.js package at: ${hertaRootPath}`));
  
  // Directories to copy from Herta.js
  const dirsToCopy = [
    'src',
    'bin',
    'commands',
    'docs',
    'examples',
    'test'
  ];
  
  // Copy each directory to the new project
  for (const dir of dirsToCopy) {
    const sourceDir = path.join(hertaRootPath, dir);
    const destDir = path.join(projectPath, dir);
    
    if (fs.existsSync(sourceDir)) {
      console.log(chalk.cyan(`Copying ${dir} directory...`));
      fs.mkdirSync(destDir, { recursive: true });
      try {
        copyDirRecursive(sourceDir, destDir);
      } catch (error) {
        console.log(chalk.yellow(`Warning: Error copying ${dir}: ${error.message}`));
      }
    }
  }
  
  // Function to recursively copy a directory
  function copyDirRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
  
  // Create the src directory and copy modules
  const projectSrcPath = path.join(projectPath, 'src');
  fs.mkdirSync(projectSrcPath, { recursive: true });

  // Copy specific files that aren't in directories
  const filesToCopy = [
    'package.json',
    'README.md',
    'LICENSE',
    'webpack.config.js',
    '.gitignore',
    '.npmrc',
    '.eslintrc.js',
    'swaggerDef.js'
  ];

  console.log(chalk.cyan('Copying configuration files...'));
  filesToCopy.forEach(file => {
    const sourceFile = path.join(currentPath, file);
    const targetFile = path.join(projectPath, file);
    
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(chalk.green(`Copied: ${file}`));
      } catch (error) {
        console.log(chalk.yellow(`Warning: Could not copy ${file}: ${error.message}`));
      }
    }
  });

  // Check if package.json exists and update it with the new project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow(`Updating package.json with project-specific information...`));
    
    try {
      // Read the copied package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Update with project-specific information
      packageJson.name = kebabName;
      packageJson.version = '0.1.0';
      packageJson.description = `${name} application built with Herta.js`;
      
      // Write the updated package.json
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2)
      );
      console.log(chalk.green('Updated package.json with new project name'));
    } catch (error) {
      console.log(chalk.yellow(`Warning: Could not update package.json: ${error.message}`));
      // If we can't modify package.json, create a new one
      fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        generatePackageJsonContent(name, kebabName)
      );
    }
  } else {
    console.log(chalk.yellow(`Warning: No package.json found. Creating a new one...`));
    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      generatePackageJsonContent(name, kebabName)
    );
  }
  
  console.log(chalk.yellow(`\nInstalling dependencies...`));
  try {
    process.chdir(projectPath);
    execSync('npm install express body-parser dotenv jest supertest', { stdio: 'inherit' });
    console.log(chalk.green(`✓ Dependencies installed successfully!`));
  } catch (error) {
    console.log(chalk.red(`Error installing dependencies:`));
    console.log(chalk.red(error.message));
    console.log(chalk.yellow(`Please run 'npm install' manually in the project directory.`));
  }
  
  console.log(chalk.green(`\n✓ Project created successfully!`));
  console.log(`  Location: ${chalk.yellow(projectPath)}`);
  console.log(`  All Herta.js mathematical modules are included directly in your project!`);
  console.log(`\nNext steps:`);
  console.log(`  1. ${chalk.yellow(`cd ${kebabName}`)}`);
  if (process.cwd() !== projectPath) {
    console.log(`  2. ${chalk.yellow('npm install')}      ${chalk.dim('# Ensure all dependencies are properly installed')}`);
  }
  console.log(`  ${process.cwd() === projectPath ? '2' : '3'}. ${chalk.yellow('npm start')}         ${chalk.dim('# Start your application')}`);
}

/**
 * Convert string to kebab-case
 * @param {string} str - Input string
 * @returns {string} - Kebab-case string
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Generate project configuration content
 * @param {string} name - Project name
 * @returns {string} - Configuration file content
 */
function generateProjectConfigContent(name) {
  return `/**
 * ${name} Configuration
 * Main application configuration
 */

module.exports = {
  // Application settings
  appName: '${name}',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',
  
  // Math engine configuration
  math: {
    precision: 64,
    roundingMode: 'HALF_UP',
    useSymbolic: true
  },
  
  // Performance settings
  performance: {
    cacheResults: true,
    maxCacheSize: 1000,
    useWorkers: true,
    maxWorkers: 4
  }
};
`;
}

/**
 * Generate Herta.js framework configuration content
 * @param {string} name - Project name
 * @returns {string} - Herta configuration file content
 */
function generateHertaConfigContent(name) {
  return `/**
 * Herta.js Framework Configuration
 * ${name} project
 */

module.exports = {
  // Modules to load
  modules: [
    'core',
    'algebra',
    'calculus',
    'statistics',
    'discrete',
    'utils'
  ],
  
  // Module-specific configuration
  moduleConfig: {
    core: {
      // Core module settings
      extendPrototypes: false,
      matrixDefaultSize: 4
    },
    statistics: {
      // Statistics module settings
      defaultDistribution: 'normal',
      randomSeed: null // Set to number for deterministic randomness
    }
  },
  
  // Plugin configuration
  plugins: [
    // Add any Herta.js plugins here
  ]
};
`;
}

/**
 * Generate package.json content
 * @param {string} name - Project name
 * @param {string} kebabName - Project name in kebab-case
 * @returns {string} - package.json content
 */
function generatePackageJsonContent(name, kebabName) {
  return `{
  "name": "${kebabName}",
  "version": "1.0.0",
  "description": "${name} - Built with Herta.js Mathematical Framework",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "herta": "^1.2.5"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "eslint": "^8.38.0"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "license": "MIT"
}
`;
}

/**
 * Generate app.js content
 * @param {string} name - Project name
 * @returns {string} - app.js content
 */
function generateAppJsContent(name) {
  return `/**
 * ${name}
 * Main application entry point
 */

const herta = require('herta');
const config = require('./config');

// Load app-specific modules
const calculatorService = require('./src/services/calculator');

// Initialize the Herta.js framework
const app = herta.createApplication({
  debug: config.debug,
  modules: require('./herta.config').modules
});

// Quick demo
console.log('\n' + '='.repeat(50));
console.log(config.appName + ' Application');
console.log('='.repeat(50));

// Matrix example
const matrix = app.core.matrix.create([[1, 2], [3, 4]]);
console.log('\nMatrix operations:');
console.log('Matrix:', matrix.toString());
console.log('Determinant:', matrix.determinant());
console.log('Inverse:', matrix.inverse().toString());

// Calculator service example
console.log('\nCalculator service:');
const result = calculatorService.calculate({
  operation: 'quadratic',
  a: 1,
  b: -3,
  c: 2
});
console.log('Quadratic equation solution:', result);

console.log('\n' + '='.repeat(50));
console.log('Application running successfully!');
console.log('='.repeat(50) + '\n');

// In real applications, you might want to expose HTTP endpoints
// or start other services here

module.exports = app;
`;
}

/**
 * Generate README.md content
 * @param {string} name - Project name
 * @param {string} kebabName - Project name in kebab-case
 * @returns {string} - README.md content
 */
function generateReadmeContent(name, kebabName) {
  return `# ${name}

${name} is a mathematical application built using the Herta.js framework.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

For development with auto-reload:

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Project Structure

\`\`\`
${kebabName}/
├── src/
│   ├── models/        # Data models
│   ├── services/      # Business logic
│   ├── controllers/   # Route handlers
│   └── utils/         # Helper functions
├── test/              # Test files
├── config.js          # Application configuration
├── herta.config.js    # Herta.js framework configuration
├── app.js             # Main entry point
└── package.json
\`\`\`
`;
}

/**
 * Generate sample model content
 * @param {string} name - Project name
 * @returns {string} - Sample model content
 */
function generateSampleModelContent(name) {
  return `/**
 * Sample Model
 * ${name} Project
 */

class SampleModel {
  constructor(data = {}) {
    this.id = data.id || Math.floor(Math.random() * 10000);
    this.name = data.name || 'Sample';
    this.value = data.value || 0;
    this.createdAt = data.createdAt || new Date();
  }
  
  // Serialize to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      createdAt: this.createdAt
    };
  }
  
  // Create from JSON
  static fromJSON(json) {
    return new SampleModel(json);
  }
}

module.exports = SampleModel;
`;
}

/**
 * Generate sample service content
 * @param {string} name - Project name
 * @returns {string} - Sample service content
 */
function generateSampleServiceContent(name) {
  return `/**
 * Calculator Service
 * ${name} Project
 */

const herta = require('herta');

const calculatorService = {
  /**
   * Perform mathematical operations
   * @param {Object} params - Operation parameters
   * @returns {*} - Result of the operation
   */
  calculate(params) {
    const { operation } = params;
    
    switch (operation) {
      case 'add':
        return params.a + params.b;
        
      case 'subtract':
        return params.a - params.b;
        
      case 'multiply':
        return params.a * params.b;
        
      case 'divide':
        if (params.b === 0) throw new Error('Division by zero');
        return params.a / params.b;
        
      case 'quadratic':
        return this.solveQuadratic(params.a, params.b, params.c);
        
      default:
        throw new Error(\`Unknown operation: \${operation}\`);
    }
  },
  
  /**
   * Solve quadratic equation ax² + bx + c = 0
   * @param {number} a - Coefficient of x²
   * @param {number} b - Coefficient of x
   * @param {number} c - Constant term
   * @returns {Object} - Solutions of the equation
   */
  solveQuadratic(a, b, c) {
    if (a === 0) throw new Error('Not a quadratic equation');
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
      // Complex solutions
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
      
      return {
        x1: \`\${realPart} + \${imagPart}i\`,
        x2: \`\${realPart} - \${imagPart}i\`,
        discriminant
      };
    } else {
      // Real solutions
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      
      return { x1, x2, discriminant };
    }
  }
};

module.exports = calculatorService;
`;
}

/**
 * Generate sample test content
 * @param {string} name - Project name
 * @returns {string} - Sample test content
 */
function generateSampleTestContent(name) {
  return `/**
 * Calculator Service Tests
 * ${name} Project
 */

const calculatorService = require('../src/services/calculator');

describe('Calculator Service', () => {
  describe('Basic operations', () => {
    test('should add two numbers', () => {
      const result = calculatorService.calculate({ operation: 'add', a: 2, b: 3 });
      expect(result).toBe(5);
    });
    
    test('should subtract two numbers', () => {
      const result = calculatorService.calculate({ operation: 'subtract', a: 5, b: 3 });
      expect(result).toBe(2);
    });
    
    test('should multiply two numbers', () => {
      const result = calculatorService.calculate({ operation: 'multiply', a: 2, b: 3 });
      expect(result).toBe(6);
    });
    
    test('should divide two numbers', () => {
      const result = calculatorService.calculate({ operation: 'divide', a: 6, b: 3 });
      expect(result).toBe(2);
    });
    
    test('should throw an error when dividing by zero', () => {
      expect(() => {
        calculatorService.calculate({ operation: 'divide', a: 6, b: 0 });
      }).toThrow('Division by zero');
    });
  });
  
  describe('Quadratic equation solver', () => {
    test('should solve quadratic equation with two real roots', () => {
      const result = calculatorService.calculate({ 
        operation: 'quadratic', 
        a: 1, 
        b: -3, 
        c: 2 
      });
      
      expect(result.x1).toBe(2);
      expect(result.x2).toBe(1);
      expect(result.discriminant).toBe(1);
    });
    
    test('should solve quadratic equation with one real root', () => {
      const result = calculatorService.calculate({ 
        operation: 'quadratic', 
        a: 1, 
        b: -2, 
        c: 1 
      });
      
      expect(result.x1).toBe(1);
      expect(result.x2).toBe(1);
      expect(result.discriminant).toBe(0);
    });
    
    test('should solve quadratic equation with complex roots', () => {
      const result = calculatorService.calculate({ 
        operation: 'quadratic', 
        a: 1, 
        b: 0, 
        c: 1 
      });
      
      expect(result.discriminant).toBe(-4);
      expect(result.x1).toContain('i');
      expect(result.x2).toContain('i');
    });
  });
});
`;
}

/**
 * Generate sample graph utility content
 * @param {string} name - Project name
 * @returns {string} - Graph utility content
 */
function generateGraphUtilContent(name) {
  return `/**
 * Graph Utility Module
 * ${name} Project
 * 
 * This module provides graph-based algorithms and data structures
 * using the Herta.js graph implementation.
 */

const herta = require('herta');

/**
 * GraphUtility class provides graph operations for the application
 */
class GraphUtility {
  /**
   * Create a new graph instance
   * @param {boolean} directed - Whether the graph is directed
   * @returns {Object} - Graph instance
   */
  static createGraph(directed = false) {
    return herta.discrete.graph.createGraph({ directed });
  }

  /**
   * Find shortest path between two nodes using Dijkstra's algorithm
   * @param {Object} graph - Graph instance
   * @param {string|number} start - Start node
   * @param {string|number} end - End node
   * @returns {Array} - Path of nodes
   */
  static findShortestPath(graph, start, end) {
    return herta.discrete.graph.dijkstra(graph, start, end);
  }

  /**
   * Find minimum spanning tree using Kruskal's algorithm
   * @param {Object} graph - Graph instance
   * @returns {Object} - Minimum spanning tree
   */
  static findMST(graph) {
    return herta.discrete.graph.kruskalMST(graph);
  }

  /**
   * Detect communities in the graph using Louvain method
   * @param {Object} graph - Graph instance
   * @returns {Object} - Community structure
   */
  static detectCommunities(graph) {
    return herta.discrete.graph.communityDetection(graph);
  }

  /**
   * Create a sample network
   * @returns {Object} - Sample network graph
   */
  static createSampleNetwork() {
    const graph = this.createGraph(false);
    
    // Add nodes
    graph.addNode('A', { type: 'source' });
    graph.addNode('B', { type: 'router' });
    graph.addNode('C', { type: 'router' });
    graph.addNode('D', { type: 'router' });
    graph.addNode('E', { type: 'destination' });
    
    // Add edges with weights
    graph.addEdge('A', 'B', { weight: 1 });
    graph.addEdge('A', 'C', { weight: 3 });
    graph.addEdge('B', 'C', { weight: 1 });
    graph.addEdge('B', 'D', { weight: 4 });
    graph.addEdge('C', 'D', { weight: 1 });
    graph.addEdge('D', 'E', { weight: 2 });
    graph.addEdge('C', 'E', { weight: 6 });
    
    return graph;
  }
}

module.exports = GraphUtility;
`;
}

/**
 * Generate advanced math content
 * @param {string} name - Project name
 * @returns {string} - Advanced math content
 */
function generateAdvancedMathContent(name) {
  return `/**
 * Advanced Math Extensions
 * ${name} Project
 * 
 * This module provides advanced mathematical algorithms that extend the
 * core Herta.js functionality for project-specific needs.
 */

const herta = require('herta');

/**
 * MathExtensions class provides advanced mathematical operations
 */
class MathExtensions {
  /**
   * Compute the discrete Fourier transform
   * @param {Array<number>} signal - Input signal
   * @returns {Array<Object>} - Complex DFT result
   */
  static discreteFourierTransform(signal) {
    const N = signal.length;
    const result = [];
    
    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const phi = (2 * Math.PI * k * n) / N;
        real += signal[n] * Math.cos(phi);
        imag -= signal[n] * Math.sin(phi);
      }
      
      real /= N;
      imag /= N;
      
      result.push({ real, imag });
    }
    
    return result;
  }

  /**
   * Perform numerical integration using Simpson's rule
   * @param {Function} func - Function to integrate
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @param {number} n - Number of intervals (must be even)
   * @returns {number} - Approximation of the integral
   */
  static simpsonIntegration(func, a, b, n = 100) {
    if (n % 2 !== 0) n++; // Ensure n is even
    
    const h = (b - a) / n;
    let sum = func(a) + func(b);
    
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const coefficient = i % 2 === 0 ? 2 : 4;
      sum += coefficient * func(x);
    }
    
    return (h / 3) * sum;
  }

  /**
   * Find eigenvalues and eigenvectors of a matrix
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {Object} - Eigenvalues and eigenvectors
   */
  static findEigenvalues(matrix) {
    // Use Herta's matrix operations
    const matrixObj = herta.core.matrix.create(matrix);
    return herta.algebra.eigenvalues(matrixObj);
  }

  /**
   * Perform LU decomposition of a matrix
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {Object} - L and U matrices
   */
  static luDecomposition(matrix) {
    const matrixObj = herta.core.matrix.create(matrix);
    return herta.algebra.luDecomposition(matrixObj);
  }
}

module.exports = MathExtensions;
`;
}

/**
 * Generate database configuration content
 * @param {string} name - Project name
 * @returns {string} - Database configuration content
 */
function generateDatabaseConfigContent(name) {
  return `/**
 * Database Configuration
 * ${name} Project
 */

module.exports = {
  // Default database configuration
  default: 'sqlite',
  
  // Database connections
  connections: {
    // SQLite configuration
    sqlite: {
      driver: 'sqlite',
      database: './database/herta.sqlite',
      prefix: ''
    },
    
    // MySQL configuration
    mysql: {
      driver: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_DATABASE || '${toSnakeCase(name)}',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      prefix: ''
    },
    
    // In-memory database for testing
    memory: {
      driver: 'sqlite',
      database: ':memory:',
      prefix: ''
    }
  }
};
`;
}

/**
 * Generate application configuration content
 * @param {string} name - Project name
 * @returns {string} - Application configuration content
 */
function generateAppConfigContent(name) {
  return `/**
 * Application Configuration
 * ${name} Project
 */

module.exports = {
  // Application information
  name: '${name}',
  version: '1.0.0',
  
  // Environment settings
  env: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',
  
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: './logs/app.log'
  },
  
  // Math engine configuration
  math: {
    precision: 64,
    roundingMode: 'HALF_UP',
    useSymbolic: true
  },
  
  // Performance settings
  performance: {
    cacheResults: true,
    maxCacheSize: 1000,
    useWorkers: true,
    maxWorkers: 4
  }
};
`;
}

/**
 * Generate routes content
 * @param {string} name - Project name
 * @returns {string} - Routes content
 */
function generateRoutesContent(name) {
  return `/**
 * Application Routes
 * ${name} Project
 */

const express = require('express');
const MathController = require('../controllers/MathController');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${name} API' });
});

// Math calculation routes
router.post('/calculate', validationMiddleware.validateCalculation, MathController.calculate);
router.post('/matrix', MathController.matrixOperation);
router.post('/graph', MathController.graphOperation);
router.post('/statistics', MathController.statisticalAnalysis);

// Load API routes
router.use('/api/math', require('../api/routes/math'));

module.exports = router;
`;
}

/**
 * Generate validation middleware content
 * @param {string} name - Project name
 * @returns {string} - Validation middleware content
 */
function generateValidationMiddlewareContent(name) {
  return `/**
 * Validation Middleware
 * ${name} Project
 */

const validationMiddleware = {
  /**
   * Validate calculation request
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  validateCalculation(req, res, next) {
    const { operation } = req.body;
    
    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required'
      });
    }
    
    // Validate based on operation type
    switch (operation) {
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        if (typeof req.body.a !== 'number' || typeof req.body.b !== 'number') {
          return res.status(400).json({
            success: false,
            error: 'Parameters a and b must be numbers'
          });
        }
        if (operation === 'divide' && req.body.b === 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot divide by zero'
          });
        }
        break;
        
      case 'quadratic':
        if (typeof req.body.a !== 'number' || 
            typeof req.body.b !== 'number' || 
            typeof req.body.c !== 'number') {
          return res.status(400).json({
            success: false,
            error: 'Parameters a, b, and c must be numbers'
          });
        }
        if (req.body.a === 0) {
          return res.status(400).json({
            success: false,
            error: 'Parameter a cannot be zero for a quadratic equation'
          });
        }
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: \`Unknown operation: \${operation}\`
        });
    }
    
    next();
  }
};

module.exports = validationMiddleware;
`;
}

/**
 * Generate view content
 * @param {string} name - Project name
 * @returns {string} - View content
 */
function generateViewContent(name) {
  return `/**
 * View Renderer
 * ${name} Project
 */

/**
 * Simple template engine
 * @param {string} template - Template string
 * @param {Object} data - Data to inject into template
 * @returns {string} - Compiled HTML
 */
function renderTemplate(template, data = {}) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const keys = key.split('.');
    let value = data;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        return '';
      }
    }
    
    return value;
  });
}

/**
 * Main index template
 * @param {Object} data - Data for the template
 * @returns {string} - Rendered HTML
 */
function indexTemplate(data) {
  const template = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1>{{title}}</h1>
  </header>
  
  <main>
    <div class="container">
      <div class="card">
        <h2>Mathematical Operations</h2>
        <div class="calculator">
          <div class="form-group">
            <label for="operation">Operation</label>
            <select id="operation">
              <option value="add">Addition</option>
              <option value="subtract">Subtraction</option>
              <option value="multiply">Multiplication</option>
              <option value="divide">Division</option>
              <option value="quadratic">Quadratic Equation</option>
            </select>
          </div>
          
          <div id="standard-inputs">
            <div class="form-group">
              <label for="a">Value A</label>
              <input type="number" id="a" value="0">
            </div>
            <div class="form-group">
              <label for="b">Value B</label>
              <input type="number" id="b" value="0">
            </div>
          </div>
          
          <div id="quadratic-inputs" style="display: none;">
            <div class="form-group">
              <label for="c">Value C</label>
              <input type="number" id="c" value="0">
            </div>
            <p class="equation">ax² + bx + c = 0</p>
          </div>
          
          <button id="calculate">Calculate</button>
        </div>
        
        <div class="result">
          <h3>Result</h3>
          <div id="result-value">-</div>
        </div>
      </div>
      
      <div class="card">
        <h2>Matrix Operations</h2>
        <!-- Matrix UI will be added here -->
      </div>
      
      <div class="card">
        <h2>Graph Operations</h2>
        <!-- Graph UI will be added here -->
      </div>
    </div>
  </main>
  
  <footer>
    <p>&copy; {{year}} {{title}} - Built with Herta.js</p>
  </footer>
  
  <script src="/js/app.js"></script>
</body>
</html>\`;

  return renderTemplate(template, data);
}

module.exports = {
  renderTemplate,
  indexTemplate
};
`;
}

/**
 * Generate API route content
 * @param {string} name - Project name
 * @returns {string} - API route content
 */
function generateApiRouteContent(name) {
  return `/**
 * Math API Routes
 * ${name} Project
 */

const express = require('express');
const MathApiController = require('../controllers/MathApiController');

const router = express.Router();

// API endpoints
router.post('/calculate', MathApiController.calculate);
router.post('/matrix', MathApiController.matrix);
router.post('/graph', MathApiController.graph);
router.post('/statistics', MathApiController.statistics);
router.post('/optimization', MathApiController.optimization);

// Advanced endpoints
router.post('/machine-learning', MathApiController.machineLearning);
router.post('/signal-processing', MathApiController.signalProcessing);

module.exports = router;
`;
}

/**
 * Generate API controller content
 * @param {string} name - Project name
 * @returns {string} - API controller content
 */
function generateApiControllerContent(name) {
  return `/**
 * Math API Controller
 * ${name} Project
 */

const calculatorService = require('../../services/calculator');
const MatrixUtil = require('../../math/algebra/matrix');
const GraphUtil = require('../../math/discrete/graph');
const StatisticsUtil = require('../../math/statistics/descriptive');
const OptimizationUtil = require('../../advanced/optimization/gradientDescent');
const MachineLearningUtil = require('../../advanced/machine-learning/regression');

const MathApiController = {
  /**
   * Handle basic calculations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  calculate(req, res) {
    try {
      const result = calculatorService.calculate(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle matrix operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  matrix(req, res) {
    try {
      const { operation, matrix, matrix2 } = req.body;
      let result;
      
      // Matrix operations
      switch (operation) {
        case 'determinant':
          result = MatrixUtil.determinant(matrix);
          break;
        case 'inverse':
          result = MatrixUtil.inverse(matrix);
          break;
        case 'eigenvalues':
          result = MatrixUtil.eigenvalues(matrix);
          break;
        default:
          throw new Error(\`Unknown matrix operation: \${operation}\`);
      }
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle graph operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  graph(req, res) {
    try {
      const { operation, graph } = req.body;
      let result;
      
      // Graph operations
      switch (operation) {
        case 'shortestPath':
          result = GraphUtil.findShortestPath(graph, req.body.start, req.body.end);
          break;
        case 'mst':
          result = GraphUtil.findMST(graph);
          break;
        default:
          throw new Error(\`Unknown graph operation: \${operation}\`);
      }
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle statistical operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  statistics(req, res) {
    try {
      const { operation, data } = req.body;
      let result;
      
      // Statistical operations
      switch (operation) {
        case 'descriptive':
          result = StatisticsUtil.descriptiveStats(data);
          break;
        case 'correlation':
          result = StatisticsUtil.correlation(data.x, data.y);
          break;
        default:
          throw new Error(\`Unknown statistical operation: \${operation}\`);
      }
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle optimization operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  optimization(req, res) {
    try {
      const { operation, data } = req.body;
      let result;
      
      // Optimization operations
      switch (operation) {
        case 'gradientDescent':
          result = OptimizationUtil.gradientDescent(data.f, data.initial, data.learningRate, data.iterations);
          break;
        default:
          throw new Error(\`Unknown optimization operation: \${operation}\`);
      }
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle machine learning operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  machineLearning(req, res) {
    try {
      const { operation, data } = req.body;
      let result;
      
      // Machine learning operations
      switch (operation) {
        case 'linearRegression':
          result = MachineLearningUtil.linearRegression(data.x, data.y);
          break;
        default:
          throw new Error(\`Unknown machine learning operation: \${operation}\`);
      }
      
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle signal processing operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  signalProcessing(req, res) {
    try {
      const { operation, signal } = req.body;
      let result;
      
      // Signal processing operations (to be implemented)
      res.status(501).json({ success: false, error: 'Signal processing not implemented yet' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

module.exports = MathApiController;
`;
}

/**
 * Generate Math Controller content
 * @param {string} name - Project name
 * @returns {string} - Math Controller content
 */
function generateMathControllerContent(name) {
  return `/**
 * Math Controller
 * ${name} Project
 */

const calculatorService = require('../services/calculator');
const GraphUtility = require('../math/discrete/graph');
const MatrixUtil = require('../math/algebra/matrix');
const StatisticsUtil = require('../math/statistics/descriptive');

const MathController = {
  /**
   * Handle general calculations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  calculate(req, res) {
    try {
      const result = calculatorService.calculate(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle matrix operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  matrixOperation(req, res) {
    try {
      const { operation, matrix, matrix2 } = req.body;
      let result;

      switch (operation) {
        case 'determinant':
          result = MatrixUtil.determinant(matrix);
          break;
        case 'inverse':
          result = MatrixUtil.inverse(matrix);
          break;
        case 'multiply':
          result = MatrixUtil.multiply(matrix, matrix2);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unknown matrix operation'
          });
      }

      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle graph operations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  graphOperation(req, res) {
    try {
      const { operation, graph, start, end } = req.body;
      let result;

      // Create graph from input data
      const graphObj = GraphUtility.createGraph();
      if (graph.nodes) {
        graph.nodes.forEach(node => graphObj.addNode(node.id, node.data));
      }
      if (graph.edges) {
        graph.edges.forEach(edge => {
          graphObj.addEdge(edge.source, edge.target, edge.data);
        });
      }

      switch (operation) {
        case 'shortestPath':
          result = GraphUtility.findShortestPath(graphObj, start, end);
          break;
        case 'mst':
          result = GraphUtility.findMST(graphObj);
          break;
        case 'communities':
          result = GraphUtility.detectCommunities(graphObj);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unknown graph operation'
          });
      }

      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * Handle statistical analysis
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  statisticalAnalysis(req, res) {
    try {
      const { operation, data } = req.body;
      let result;

      switch (operation) {
        case 'descriptive':
          result = StatisticsUtil.descriptiveStats(data);
          break;
        case 'correlation':
          result = StatisticsUtil.correlation(data.x, data.y);
          break;
        case 'regression':
          result = StatisticsUtil.linearRegression(data.x, data.y);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unknown statistical operation'
          });
      }

      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

module.exports = MathController;
`;
}

/**
 * Generate matrix content
 * @param {string} name - Project name
 * @returns {string} - Matrix content
 */
function generateMatrixContent(name) {
  return `/**
 * Matrix Utility
 * ${name} Project
 *
 * A comprehensive matrix operations utility that extends the core matrix functionality
 * from Herta.js with application-specific matrix operations.
 */

const herta = require('herta');

/**
 * Matrix utility class providing matrix operations
 */
class MatrixUtil {
  /**
   * Create a matrix
   * @param {Array<Array<number>>} data - Matrix data
   * @returns {Object} - Matrix object
   */
  static create(data) {
    return herta.core.matrix.create(data);
  }

  /**
   * Calculate determinant of a matrix
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {number} - Determinant value
   */
  static determinant(matrix) {
    const matrixObj = this.create(matrix);
    return matrixObj.determinant();
  }

  /**
   * Calculate inverse of a matrix
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {Array<Array<number>>} - Inverse matrix
   */
  static inverse(matrix) {
    const matrixObj = this.create(matrix);
    const inverseObj = matrixObj.inverse();
    return inverseObj.toArray();
  }

  /**
   * Multiply two matrices
   * @param {Array<Array<number>>} matrixA - First matrix
   * @param {Array<Array<number>>} matrixB - Second matrix
   * @returns {Array<Array<number>>} - Result matrix
   */
  static multiply(matrixA, matrixB) {
    const matrixObjA = this.create(matrixA);
    const matrixObjB = this.create(matrixB);
    const resultObj = matrixObjA.multiply(matrixObjB);
    return resultObj.toArray();
  }

  /**
   * Calculate eigenvalues of a matrix
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {Array<number>} - Eigenvalues
   */
  static eigenvalues(matrix) {
    const matrixObj = this.create(matrix);
    return herta.algebra.eigenvalues(matrixObj);
  }

  /**
   * Perform LU decomposition
   * @param {Array<Array<number>>} matrix - Input matrix
   * @returns {Object} - L and U matrices
   */
  static luDecomposition(matrix) {
    const matrixObj = this.create(matrix);
    const { L, U } = herta.algebra.luDecomposition(matrixObj);
    return {
      L: L.toArray(),
      U: U.toArray()
    };
  }

  /**
   * Create an identity matrix of given size
   * @param {number} size - Matrix size
   * @returns {Array<Array<number>>} - Identity matrix
   */
  static identity(size) {
    const result = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(i === j ? 1 : 0);
      }
      result.push(row);
    }
    return result;
  }
}

module.exports = MatrixUtil;
`;
}

/**
 * Generate statistics content
 * @param {string} name - Project name
 * @returns {string} - Statistics content
 */
function generateStatisticsContent(name) {
  return `/**
 * Statistics Utility
 * ${name} Project
 *
 * Advanced statistical analysis tools for data processing and analysis
 */

const herta = require('herta');

/**
 * Statistics utility class providing statistical methods
 */
class StatisticsUtil {
  /**
   * Calculate descriptive statistics for a dataset
   * @param {Array<number>} data - Input data array
   * @returns {Object} - Descriptive statistics
   */
  static descriptiveStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }
    
    const n = data.length;
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    
    // Calculate variance and standard deviation
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Sort data for median and percentiles
    const sortedData = [...data].sort((a, b) => a - b);
    const median = n % 2 === 0 ? 
      (sortedData[n/2 - 1] + sortedData[n/2]) / 2 : 
      sortedData[Math.floor(n/2)];
    
    // Min and max
    const min = sortedData[0];
    const max = sortedData[n - 1];
    
    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sortedData[q1Index];
    const q3 = sortedData[q3Index];
    const iqr = q3 - q1;
    
    return {
      n,
      mean,
      median,
      variance,
      stdDev,
      min,
      max,
      range: max - min,
      q1,
      q3,
      iqr
    };
  }

  /**
   * Calculate correlation between two datasets
   * @param {Array<number>} x - First dataset
   * @param {Array<number>} y - Second dataset
   * @returns {number} - Pearson correlation coefficient
   */
  static correlation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('Inputs must be arrays of equal length');
    }
    
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((acc, val) => acc + val, 0) / n;
    const yMean = y.reduce((acc, val) => acc + val, 0) / n;
    
    // Calculate covariance and variances
    let covariance = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      covariance += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    covariance /= n;
    xVariance /= n;
    yVariance /= n;
    
    // Calculate correlation coefficient
    const correlation = covariance / (Math.sqrt(xVariance) * Math.sqrt(yVariance));
    
    return correlation;
  }

  /**
   * Perform linear regression
   * @param {Array<number>} x - Independent variable values
   * @param {Array<number>} y - Dependent variable values
   * @returns {Object} - Regression parameters
   */
  static linearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('Inputs must be arrays of equal length');
    }
    
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((acc, val) => acc + val, 0) / n;
    const yMean = y.reduce((acc, val) => acc + val, 0) / n;
    
    // Calculate slope (m) and y-intercept (b) for y = mx + b
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      numerator += xDiff * (y[i] - yMean);
      denominator += xDiff * xDiff;
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Calculate R-squared
    let ssResidual = 0;
    let ssTotal = 0;
    
    for (let i = 0; i < n; i++) {
      const yPredicted = slope * x[i] + intercept;
      ssResidual += Math.pow(y[i] - yPredicted, 2);
      ssTotal += Math.pow(y[i] - yMean, 2);
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return {
      slope,
      intercept,
      rSquared,
      equation: \`y = \${slope.toFixed(4)}x + \${intercept.toFixed(4)}\`,
      predict: (xValue) => slope * xValue + intercept
    };
  }
}

module.exports = StatisticsUtil;
`;
}

/**
 * Generate optimization content
 * @param {string} name - Project name
 * @returns {string} - Optimization content
 */
function generateOptimizationContent(name) {
  return `/**
 * Gradient Descent Optimization
 * ${name} Project
 *
 * Implementation of gradient descent optimization algorithm for function minimization
 */

const herta = require('herta');

/**
 * Optimization utility class providing optimization algorithms
 */
class GradientDescentOptimizer {
  /**
   * Compute numerical gradient of a function
   * @param {Function} func - Function to differentiate
   * @param {Array<number>} point - Point at which to compute gradient
   * @param {number} eps - Epsilon for numerical differentiation
   * @returns {Array<number>} - Gradient vector
   */
  static numericalGradient(func, point, eps = 1e-6) {
    const gradient = [];
    const n = point.length;
    
    // Value at the current point
    const f0 = func(point);
    
    for (let i = 0; i < n; i++) {
      // Create a perturbed point
      const point1 = [...point];
      point1[i] += eps;
      
      // Compute partial derivative
      const f1 = func(point1);
      gradient.push((f1 - f0) / eps);
    }
    
    return gradient;
  }

  /**
   * Implement gradient descent optimization
   * @param {Function} func - Function to minimize
   * @param {Array<number>} initial - Initial point
   * @param {number} learningRate - Learning rate
   * @param {number} iterations - Maximum number of iterations
   * @param {number} tolerance - Convergence tolerance
   * @returns {Object} - Optimization result
   */
  static gradientDescent(func, initial, learningRate = 0.01, iterations = 1000, tolerance = 1e-6) {
    let current = [...initial];
    let currentValue = func(current);
    const trajectory = [{ point: [...current], value: currentValue }];
    
    for (let i = 0; i < iterations; i++) {
      // Compute gradient
      const gradient = this.numericalGradient(func, current);
      
      // Check if gradient is small (converged)
      const gradientMagnitude = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));
      if (gradientMagnitude < tolerance) {
        break;
      }
      
      // Update point
      const next = current.map((xi, i) => xi - learningRate * gradient[i]);
      const nextValue = func(next);
      
      // Record trajectory
      trajectory.push({ point: [...next], value: nextValue });
      
      // Check if function value improved
      if (Math.abs(nextValue - currentValue) < tolerance) {
        current = next;
        currentValue = nextValue;
        break;
      }
      
      current = next;
      currentValue = nextValue;
    }
    
    return {
      minimum: current,
      value: currentValue,
      trajectory,
      iterations: trajectory.length - 1
    };
  }
}

module.exports = GradientDescentOptimizer;
`;
}

/**
 * Generate machine learning content
 * @param {string} name - Project name
 * @returns {string} - Machine learning content
 */
function generateMachineLearningContent(name) {
  return `/**
 * Regression Models
 * ${name} Project
 *
 * Implementation of regression models for machine learning tasks
 */

const herta = require('herta');

/**
 * Regression utility class providing regression models
 */
class RegressionModels {
  /**
   * Perform linear regression
   * @param {Array<number>} x - Independent variable values
   * @param {Array<number>} y - Dependent variable values
   * @returns {Object} - Linear regression model
   */
  static linearRegression(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('Inputs must be arrays of equal length');
    }
    
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((acc, val) => acc + val, 0) / n;
    const yMean = y.reduce((acc, val) => acc + val, 0) / n;
    
    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      numerator += xDiff * (y[i] - yMean);
      denominator += xDiff * xDiff;
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    // Create prediction function
    const predict = (xValue) => slope * xValue + intercept;
    
    // Calculate R-squared
    let ssTotal = 0;
    let ssResidual = 0;
    
    for (let i = 0; i < n; i++) {
      const yPredicted = predict(x[i]);
      ssResidual += Math.pow(y[i] - yPredicted, 2);
      ssTotal += Math.pow(y[i] - yMean, 2);
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return {
      coefficients: { slope, intercept },
      predict,
      rSquared,
      equation: \`y = \${slope.toFixed(4)}x + \${intercept.toFixed(4)}\`
    };
  }

  /**
   * Perform polynomial regression
   * @param {Array<number>} x - Independent variable values
   * @param {Array<number>} y - Dependent variable values
   * @param {number} degree - Degree of polynomial
   * @returns {Object} - Polynomial regression model
   */
  static polynomialRegression(x, y, degree = 2) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('Inputs must be arrays of equal length');
    }
    
    const n = x.length;
    
    // Prepare design matrix
    const X = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j <= degree; j++) {
        row.push(Math.pow(x[i], j));
      }
      X.push(row);
    }
    
    // Convert to matrix objects
    const matrixX = herta.core.matrix.create(X);
    const matrixY = herta.core.matrix.create(y.map(val => [val]));
    
    // Calculate coefficients using normal equation: (X^T * X)^(-1) * X^T * y
    const xTranspose = matrixX.transpose();
    const xTx = xTranspose.multiply(matrixX);
    const xTxInv = xTx.inverse();
    const xTy = xTranspose.multiply(matrixY);
    const coefficients = xTxInv.multiply(xTy).toArray().map(row => row[0]);
    
    // Create prediction function
    const predict = (xValue) => {
      let result = 0;
      for (let j = 0; j <= degree; j++) {
        result += coefficients[j] * Math.pow(xValue, j);
      }
      return result;
    };
    
    // Calculate R-squared
    const yMean = y.reduce((acc, val) => acc + val, 0) / n;
    let ssTotal = 0;
    let ssResidual = 0;
    
    for (let i = 0; i < n; i++) {
      const yPredicted = predict(x[i]);
      ssResidual += Math.pow(y[i] - yPredicted, 2);
      ssTotal += Math.pow(y[i] - yMean, 2);
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    // Generate equation string
    let equation = 'y = ';
    for (let j = 0; j <= degree; j++) {
      if (j === 0) {
        equation += coefficients[j].toFixed(4);
      } else if (j === 1) {
        equation += \` + \${coefficients[j].toFixed(4)}x\`;
      } else {
        equation += \` + \${coefficients[j].toFixed(4)}x^\${j}\`;
      }
    }
    
    return {
      coefficients,
      predict,
      rSquared,
      equation
    };
  }
}

module.exports = RegressionModels;
`;
}

/**
 * Generate matrix test content
 * @param {string} name - Project name
 * @returns {string} - Matrix test content
 */
function generateMatrixTestContent(name) {
  return `/**
 * Matrix Utility Tests
 * ${name} Project
 */

const MatrixUtil = require('../../src/math/algebra/matrix');

describe('MatrixUtil', () => {
  describe('create', () => {
    test('should create a valid matrix object', () => {
      const data = [[1, 2], [3, 4]];
      const matrix = MatrixUtil.create(data);
      expect(matrix).toBeDefined();
      expect(matrix.toArray()).toEqual(data);
    });
  });

  describe('determinant', () => {
    test('should calculate determinant correctly for 2x2 matrix', () => {
      const matrix = [[1, 2], [3, 4]];
      const det = MatrixUtil.determinant(matrix);
      expect(det).toBe(-2);
    });

    test('should calculate determinant correctly for 3x3 matrix', () => {
      const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const det = MatrixUtil.determinant(matrix);
      expect(det).toBeCloseTo(0);
    });
  });

  describe('inverse', () => {
    test('should calculate inverse correctly for invertible matrix', () => {
      const matrix = [[4, 7], [2, 6]];
      const inverse = MatrixUtil.inverse(matrix);
      
      // Expected inverse of [[4, 7], [2, 6]] is [[0.6, -0.7], [-0.2, 0.4]]
      expect(inverse[0][0]).toBeCloseTo(0.6);
      expect(inverse[0][1]).toBeCloseTo(-0.7);
      expect(inverse[1][0]).toBeCloseTo(-0.2);
      expect(inverse[1][1]).toBeCloseTo(0.4);
    });
  });

  describe('multiply', () => {
    test('should multiply matrices correctly', () => {
      const matrixA = [[1, 2], [3, 4]];
      const matrixB = [[5, 6], [7, 8]];
      const result = MatrixUtil.multiply(matrixA, matrixB);
      
      // Expected result: [[19, 22], [43, 50]]
      expect(result).toEqual([[19, 22], [43, 50]]);
    });
  });
});
`;
}

/**
 * Generate public JS content
 * @param {string} name - Project name
 * @returns {string} - Public JS content
 */
function generatePublicJsContent(name) {
  return `/**
 * Main JavaScript File
 * ${name} Project
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get form elements
  const operationSelect = document.getElementById('operation');
  const standardInputs = document.getElementById('standard-inputs');
  const quadraticInputs = document.getElementById('quadratic-inputs');
  const aInput = document.getElementById('a');
  const bInput = document.getElementById('b');
  const cInput = document.getElementById('c');
  const calculateButton = document.getElementById('calculate');
  const resultValue = document.getElementById('result-value');
  
  // Add event listener for operation type change
  operationSelect.addEventListener('change', () => {
    const operation = operationSelect.value;
    
    if (operation === 'quadratic') {
      standardInputs.style.display = 'block';
      quadraticInputs.style.display = 'block';
    } else {
      standardInputs.style.display = 'block';
      quadraticInputs.style.display = 'none';
    }
  });
  
  // Add event listener for calculate button
  calculateButton.addEventListener('click', async () => {
    const operation = operationSelect.value;
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    
    let payload = { operation, a, b };
    
    if (operation === 'quadratic') {
      const c = parseFloat(cInput.value);
      payload.c = c;
    }
    
    try {
      // Call the API
      const response = await fetch('/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Display result
        if (operation === 'quadratic') {
          resultValue.textContent = JSON.stringify(data.result, null, 2);
        } else {
          resultValue.textContent = data.result;
        }
      } else {
        resultValue.textContent = \`Error: \${data.error}\`;
      }
    } catch (error) {
      resultValue.textContent = \`Error: \${error.message}\`;
    }
  });
});
`;
}

/**
 * Generate style content
 * @param {string} name - Project name
 * @returns {string} - Style content
 */
function generateStyleContent(name) {
  return `/**
 * Main CSS Styles
 * ${name} Project
 */

:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #f8f9fa;
  --text-color: #333;
  --border-color: #ddd;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
}

header {
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  padding: 1rem 0;
  box-shadow: var(--shadow);
}

h1 {
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

h2 {
  color: var(--primary-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
  margin-top: 0;
}

.calculator {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

.result {
  background-color: #f1f1f1;
  padding: 1rem;
  border-radius: 4px;
}

.result h3 {
  margin-top: 0;
  color: var(--primary-color);
}

#result-value {
  font-family: monospace;
  white-space: pre-wrap;
}

.equation {
  font-style: italic;
  color: #666;
}

footer {
  text-align: center;
  padding: 1rem 0;
  margin-top: 2rem;
  background-color: #f1f1f1;
  border-top: 1px solid var(--border-color);
}
`;
}

/**
 * Generate documentation content
 * @param {string} name - Project name
 * @returns {string} - Documentation content
 */
function generateDocContent(name) {
  return `# ${name} - Getting Started

## Introduction

Welcome to ${name}, a powerful mathematical application built with the Herta.js framework. This guide will help you get started with the application and provide an overview of its features and capabilities.

## Installation

To run this application, you need Node.js installed on your system. If you don't have it installed, you can download it from [nodejs.org](https://nodejs.org/).

Once you have Node.js installed, follow these steps:

1. Open a terminal in the project directory
2. Install dependencies by running: npm install
3. Start the application by running: npm start

## Project Structure

The project follows a modular structure:

- **/src**: Contains the source code
  - **/models**: Data models
  - **/services**: Business logic
  - **/controllers**: Route handlers
  - **/math**: Mathematical utilities
  - **/advanced**: Advanced mathematical algorithms
- **/test**: Unit and integration tests
- **/public**: Static assets
- **/docs**: Documentation

## Features

### Basic Calculations

The application provides basic arithmetic operations:
- Addition
- Subtraction
- Multiplication
- Division
- Quadratic equation solving

### Matrix Operations

Matrices can be manipulated through:
- Matrix creation
- Determinant calculation
- Matrix inversion
- Matrix multiplication
- Eigenvalue computation

### Graph Theory

Graph algorithms include:
- Shortest path finding using Dijkstra's algorithm
- Minimum spanning tree using Kruskal's algorithm
- Community detection

### Statistical Analysis

Statistical tools include:
- Descriptive statistics (mean, median, standard deviation)
- Correlation analysis
- Linear regression

## API Reference

The application exposes RESTful APIs for mathematical operations.

### Calculate Endpoint

**POST /calculate**

Example request body:
{
  "operation": "add",
  "a": 5,
  "b": 3
}

Example response:
{
  "success": true,
  "result": 8
}

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
`;
}

/**
 * Generate build script content
 * @param {string} name - Project name
 * @returns {string} - Build script content
 */
function generateBuildScriptContent(name) {
  return `/**
 * Build Script
 * ${name} Project
 *
 * This script handles the build process for the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build process...');

// Create build directory if it doesn't exist
const buildDir = path.resolve(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Directories to copy
const dirsToCopy = ['public', 'src'];

// Copy directories to build folder
dirsToCopy.forEach(dir => {
  const srcDir = path.resolve(__dirname, '..', dir);
  const destDir = path.resolve(buildDir, dir);
  
  if (fs.existsSync(srcDir)) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    console.log(\`Copying \${dir} to build directory...\`);
    execSync(\`cp -R \${srcDir}/* \${destDir}\`);
  }
});

// Copy configuration files
const configFiles = ['package.json', 'app.js', 'config.js', 'herta.config.js'];

configFiles.forEach(file => {
  const srcFile = path.resolve(__dirname, '..', file);
  const destFile = path.resolve(buildDir, file);
  
  if (fs.existsSync(srcFile)) {
    console.log(\`Copying \${file} to build directory...\`);
    fs.copyFileSync(srcFile, destFile);
  }
});

console.log('Build completed successfully!');
`;
}

/**
 * Generate integration content
 * @param {string} name - Project name
 * @returns {string} - Integration content
 */
function generateIntegrationContent(name) {
  return `/**
 * Integration Utility
 * ${name} Project
 *
 * Advanced numerical integration methods for scientific and engineering applications
 */

const herta = require('herta');

/**
 * Integration utility class providing numerical integration methods
 */
class IntegrationUtil {
  /**
   * Perform numerical integration using the trapezoidal rule
   * @param {Function} func - Function to integrate
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @param {number} n - Number of intervals
   * @returns {number} - Approximation of the integral
   */
  static trapezoidal(func, a, b, n = 100) {
    const h = (b - a) / n;
    let result = (func(a) + func(b)) / 2;
    
    for (let i = 1; i < n; i++) {
      result += func(a + i * h);
    }
    
    return result * h;
  }

  /**
   * Perform numerical integration using Simpson's rule
   * @param {Function} func - Function to integrate
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @param {number} n - Number of intervals (must be even)
   * @returns {number} - Approximation of the integral
   */
  static simpson(func, a, b, n = 100) {
    if (n % 2 !== 0) n++; // Ensure n is even
    
    const h = (b - a) / n;
    let result = func(a) + func(b);
    
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const coefficient = i % 2 === 0 ? 2 : 4;
      result += coefficient * func(x);
    }
    
    return (h / 3) * result;
  }

  /**
   * Perform integration for a predefined function
   * @param {string} functionType - Type of function to integrate
   * @param {number} a - Lower bound
   * @param {number} b - Upper bound
   * @returns {number} - Result of integration
   */
  static integratePredefined(functionType, a, b) {
    let func;
    
    switch (functionType) {
      case 'linear':
        func = x => x;
        break;
      case 'quadratic':
        func = x => x * x;
        break;
      case 'cubic':
        func = x => x * x * x;
        break;
      case 'sin':
        func = Math.sin;
        break;
      case 'exp':
        func = Math.exp;
        break;
      default:
        throw new Error(\`Unknown function type: \${functionType}\`);
    }
    
    return this.simpson(func, a, b, 1000);
  }
}

module.exports = IntegrationUtil;
`;
}

/**
 * Generate .gitignore content
 * @returns {string} - .gitignore content
 */
function generateGitignoreContent() {
  return `# Dependency directories
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Build output
build/
dist/

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
Thumbs.db

# SQLite database files
*.sqlite
*.sqlite3

# Testing coverage
coverage/

# Temporary files
*.log
*.tmp
temp/
`;
}

/**
 * Generate .npmrc content
 * @returns {string} - .npmrc content
 */
function generateNpmrcContent() {
  return `package-lock=true
save-exact=true
`;
}

/**
 * Generate auth middleware content
 * @param {string} name - Project name
 * @returns {string} - Auth middleware content
 */
function generateAuthMiddlewareContent(name) {
  return `/**
 * Authentication Middleware
 * ${name} Project
 */

const authMiddleware = {
  /**
   * Check if user is authenticated
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  authenticate(req, res, next) {
    // Example authentication logic
    // In a real application, you would validate a token/session
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Simple API key validation example (for demonstration purposes)
    if (apiKey !== process.env.API_KEY && apiKey !== 'test-key') {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // Add user info to request object
    req.user = {
      authenticated: true,
      // Additional user information could be added here
    };
    
    next();
  },
  
  /**
   * Check if user has admin role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  requireAdmin(req, res, next) {
    // This middleware should be used after the authenticate middleware
    if (!req.user || !req.user.authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check for admin role (example)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Administrator privileges required'
      });
    }
    
    next();
  }
};

module.exports = authMiddleware;
`;
}

/**
 * Generate web route content
 * @param {string} name - Project name
 * @returns {string} - Web route content
 */
function generateWebRouteContent(name) {
  return `/**
 * Web Routes
 * ${name} Project
 */

const express = require('express');
const MathController = require('../controllers/MathController');

const router = express.Router();

// Define routes
router.get('/', MathController.index);
router.get('/about', MathController.about);
router.get('/calculator', MathController.calculatorPage);
router.post('/calculate', MathController.calculate);

module.exports = router;
`;
}

/**
 * Generate route config content
 * @param {string} name - Project name
 * @returns {string} - Route config content
 */
function generateRouteConfigContent(name) {
  return `/**
 * Routes Configuration
 * ${name} Project
 */

module.exports = {
  // API prefix
  apiPrefix: '/api',
  
  // API version
  apiVersion: 'v1',
  
  // CORS configuration
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  },
  
  // Rate limiting configuration
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  },
  
  // Route groups
  groups: {
    web: {
      prefix: '/',
      middleware: ['logger']
    },
    api: {
      prefix: '/api/v1',
      middleware: ['logger', 'apiAuth']
    },
    admin: {
      prefix: '/admin',
      middleware: ['logger', 'webAuth', 'adminAuth']
    }
  }
};
`;
}

/**
 * Generate API test content
 * @param {string} name - Project name
 * @returns {string} - API test content
 */
function generateApiTestContent(name) {
  return `/**
 * API Integration Tests
 * ${name} Project
 */

const request = require('supertest');
const app = require('../../app');

describe('Math API', () => {
  describe('POST /api/v1/calculate', () => {
    test('should perform addition correctly', async () => {
      const response = await request(app)
        .post('/api/v1/calculate')
        .send({ operation: 'add', a: 5, b: 3 })
        .set('Accept', 'application/json')
        .set('X-API-Key', 'test-key');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result', 8);
    });

    test('should perform subtraction correctly', async () => {
      const response = await request(app)
        .post('/api/v1/calculate')
        .send({ operation: 'subtract', a: 5, b: 3 })
        .set('Accept', 'application/json')
        .set('X-API-Key', 'test-key');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result', 2);
    });

    test('should handle division by zero', async () => {
      const response = await request(app)
        .post('/api/v1/calculate')
        .send({ operation: 'divide', a: 5, b: 0 })
        .set('Accept', 'application/json')
        .set('X-API-Key', 'test-key');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/calculate')
        .send({ operation: 'add', a: 5, b: 3 })
        .set('Accept', 'application/json');
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/matrix', () => {
    test('should calculate determinant correctly', async () => {
      const matrix = [[1, 2], [3, 4]];
      const response = await request(app)
        .post('/api/v1/matrix')
        .send({ operation: 'determinant', matrix })
        .set('Accept', 'application/json')
        .set('X-API-Key', 'test-key');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result', -2);
    });
  });
});
`;
}

/**
 * Generate graph content
 * @param {string} name - Project name
 * @returns {string} - Graph content
 */
function generateGraphContent(name) {
  return `/**
 * Graph Utility
 * ${name} Project
 *
 * Advanced graph algorithms for network analysis and optimization
 */

const herta = require('herta');

/**
 * Graph utility class providing graph algorithms
 */
class GraphUtil {
  /**
   * Create a new graph
   * @param {Array<Array<number>>|Object} data - Adjacency matrix or adjacency list
   * @param {boolean} isDirected - Whether the graph is directed
   * @returns {Object} - Graph object
   */
  static createGraph(data, isDirected = false) {
    if (Array.isArray(data)) {
      return this.fromAdjacencyMatrix(data, isDirected);
    } else {
      return this.fromAdjacencyList(data, isDirected);
    }
  }

  /**
   * Create graph from adjacency matrix
   * @param {Array<Array<number>>} matrix - Adjacency matrix
   * @param {boolean} isDirected - Whether the graph is directed
   * @returns {Object} - Graph as adjacency list
   */
  static fromAdjacencyMatrix(matrix, isDirected = false) {
    const graph = {};
    const n = matrix.length;
    
    for (let i = 0; i < n; i++) {
      graph[i] = [];
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] !== 0) {
          graph[i].push({ node: j, weight: matrix[i][j] });
        }
      }
    }
    
    return { adjacencyList: graph, isDirected };
  }

  /**
   * Create graph from adjacency list
   * @param {Object} adjacencyList - Adjacency list
   * @param {boolean} isDirected - Whether the graph is directed
   * @returns {Object} - Graph object
   */
  static fromAdjacencyList(adjacencyList, isDirected = false) {
    return { adjacencyList, isDirected };
  }

  /**
   * Find the shortest path using Dijkstra's algorithm
   * @param {Object} graph - Graph object
   * @param {number|string} start - Start node
   * @param {number|string} end - End node
   * @returns {Object} - Shortest path and distance
   */
  static findShortestPath(graph, start, end) {
    const { adjacencyList } = graph;
    const distances = {};
    const previous = {};
    const nodes = new Set();
    
    // Initialize data structures
    for (const node in adjacencyList) {
      distances[node] = node === start ? 0 : Infinity;
      previous[node] = null;
      nodes.add(node);
    }
    
    while (nodes.size > 0) {
      // Find node with minimum distance
      let minNode = null;
      let minDistance = Infinity;
      
      for (const node of nodes) {
        if (distances[node] < minDistance) {
          minNode = node;
          minDistance = distances[node];
        }
      }
      
      // No path found or reached end
      if (minNode === null || minNode === end) break;
      
      nodes.delete(minNode);
      
      // Update neighbors
      for (const { node: neighbor, weight } of adjacencyList[minNode]) {
        if (!nodes.has(neighbor)) continue;
        
        const alt = distances[minNode] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = minNode;
        }
      }
    }
    
    // Reconstruct path
    const path = [];
    let current = end;
    
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
    
    return {
      path: path[0] === start ? path : [],
      distance: distances[end]
    };
  }

  /**
   * Find minimum spanning tree using Kruskal's algorithm
   * @param {Object} graph - Graph object
   * @returns {Array} - Edges in the MST
   */
  static findMST(graph) {
    const { adjacencyList, isDirected } = graph;
    if (isDirected) {
      throw new Error('MST is only defined for undirected graphs');
    }
    
    // Create edge list
    const edges = [];
    for (const u in adjacencyList) {
      for (const { node: v, weight } of adjacencyList[u]) {
        // Avoid duplicate edges in undirected graph
        if (parseInt(u) < parseInt(v)) {
          edges.push({ u, v, weight });
        }
      }
    }
    
    // Sort edges by weight
    edges.sort((a, b) => a.weight - b.weight);
    
    // Union-Find data structure
    const parent = {};
    for (const node in adjacencyList) {
      parent[node] = node;
    }
    
    function find(node) {
      if (parent[node] !== node) {
        parent[node] = find(parent[node]);
      }
      return parent[node];
    }
    
    function union(u, v) {
      parent[find(u)] = find(v);
    }
    
    // Kruskal's algorithm
    const mst = [];
    for (const { u, v, weight } of edges) {
      if (find(u) !== find(v)) {
        mst.push({ u, v, weight });
        union(u, v);
      }
    }
    
    return mst;
  }
}

module.exports = GraphUtil;
`;
}

module.exports = make;
