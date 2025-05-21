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
    ${chalk.yellow('module')}           Create a new module
    ${chalk.yellow('controller')}       Create a new controller
    ${chalk.yellow('service')}          Create a new service
    ${chalk.yellow('test')}             Create a new test file
    ${chalk.yellow('api')}              Create a complete REST API
    ${chalk.yellow('rest-controller')}  Create a REST controller
    ${chalk.yellow('graphql')}          Create a GraphQL schema and resolver
  
  ${chalk.bold('Examples:')}
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

module.exports = make;
