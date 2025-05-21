# Herta.js

[![NPM](https://img.shields.io/npm/v/herta.svg)](https://www.npmjs.com/package/herta)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-green.svg)]()
[![Documentation](https://img.shields.io/badge/docs-in%20progress-yellow.svg)]()
[![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)]()
[![Node.js](https://img.shields.io/badge/runtime-Node.js-green.svg)]()
[![Contributors](https://img.shields.io/badge/contributors-1-orange.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()
[![Made With Love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red.svg)]()

An advanced mathematics framework for Node.js providing powerful tools for mathematical computation, symbolic mathematics, and scientific computing. Designed specifically for scientists, researchers, and advanced mathematical applications.

## Framework Architecture

Herta.js is organized in a modular, intuitive folder structure for better organization and easier navigation:

```
/src
├── core/        # Core mathematical operations
├── algebra/     # Algebraic operations
├── calculus/    # Calculus operations
├── discrete/    # Discrete mathematics (including graph theory)
├── statistics/  # Statistical operations
├── geometry/    # Geometric operations
├── optimization/# Optimization algorithms 
├── physics/     # Physics models and simulations
├── crypto/      # Cryptography algorithms
├── utils/       # Utility functions
├── applied/     # Applied mathematics
└── advanced/    # Advanced specialized modules
```

## Feature Highlights

### Units Conversion System
Complete system for converting between various units of measurement:

```javascript
// Convert between different length units
const meters = herta.utils.units.length(5, 'feet', 'meter');  // 1.524 meters
const miles = herta.utils.units.length(10, 'kilometer', 'mile');  // 6.21371 miles

// Temperature conversion
const fahrenheit = herta.utils.units.temperature(100, 'celsius', 'fahrenheit');  // 212°F

// Other unit types
const kilograms = herta.utils.units.mass(16, 'ounce', 'kilogram');  // 0.45359 kg
const seconds = herta.utils.units.time(2, 'hour', 'second');  // 7200 seconds
const sqMeters = herta.utils.units.area(1, 'acre', 'squareMeter');  // 4046.86 m²
const joules = herta.utils.units.energy(100, 'calorie', 'joule');  // 418.4 joules
```

### Advanced Fraction Operations
Full-featured fraction class with arithmetic and comparison methods:

```javascript
const { Fraction } = herta.core.fraction;

// Create fractions
const frac1 = new Fraction(3, 4);  // 3/4
const frac2 = new Fraction(2, 5);  // 2/5

// Arithmetic operations
const sum = frac1.add(frac2);              // 23/20
const difference = frac1.subtract(frac2);  // 7/20
const product = frac1.multiply(frac2);     // 6/20 (simplified to 3/10)
const quotient = frac1.divide(frac2);      // 15/8

// Comparison methods
frac1.equals(new Fraction(6, 8));         // true (both simplify to 3/4)
frac1.greaterThan(frac2);                 // true
frac2.lessThan(frac1);                    // true

// Conversions
frac1.toDecimal();                        // 0.75
frac1.toString();                         // "3/4"

// Create fractions from decimals
const frac3 = Fraction.fromDecimal(0.333333);  // Approximates to 1/3
```

### Random Number Generation
Enhanced random number generation with multiple probability distributions:

```javascript
// Basic random generation
const randomInteger = herta.utils.random.randomInt(1, 100);       // Random integer between 1-100
const randomDecimal = herta.utils.random.randomFloat(0, 1);       // Random float between 0-1
const randomTrueOrFalse = herta.utils.random.randomBoolean(0.7);  // 70% chance of true

// Random selections
const array = [10, 20, 30, 40, 50];
const randomElement = herta.utils.random.randomItem(array);       // Random item from array
const shuffledArray = herta.utils.random.shuffle(array);          // Randomly shuffled array

// Advanced distributions
const normalRandom = herta.utils.random.randomNormal(50, 10);      // Normal distribution (μ=50, σ=10)
const exponentialRandom = herta.utils.random.randomExponential(2); // Exponential distribution (λ=2)
const poissonRandom = herta.utils.random.randomPoisson(5);         // Poisson distribution (λ=5)

// Other utilities
const uuid = herta.utils.random.uuid();                           // Generate UUID v4
const randomHexColor = herta.utils.random.randomColor();           // Random hex color like #FF5733
```

### Mathematical Sequence Generators
Functions for generating mathematical sequences:

```javascript
// Common number sequences
const fibSeq = herta.utils.generators.fibonacci(10);          // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
const primeSeq = herta.utils.generators.primes(20);           // [2, 3, 5, 7, 11, 13, 17, 19]
const triangular = herta.utils.generators.triangularNumbers(7); // [1, 3, 6, 10, 15, 21, 28]
const squares = herta.utils.generators.squareNumbers(5);      // [1, 4, 9, 16, 25]

// Pattern-based sequences
const arithmetic = herta.utils.generators.arithmeticSequence(2, 3, 5);  // [2, 5, 8, 11, 14]
const geometric = herta.utils.generators.geometricSequence(1, 2, 6);    // [1, 2, 4, 8, 16, 32]

// Advanced mathematical sequences
const pascalTri = herta.utils.generators.pascalsTriangle(4);          // Triangle with 4 rows
const catalan = herta.utils.generators.catalanNumbers(6);             // [1, 1, 2, 5, 14, 42]
const collatz = herta.utils.generators.collatzSequence(12);           // [12, 6, 3, 10, 5, 16, 8, 4, 2, 1]
```

### Graph Theory Module
The graph module has been completely rewritten with enhanced functionality and performance:

```javascript
// Create a new graph (directed or undirected)
const graph = new herta.discrete.graph.Graph(true);  // directed graph

// Add vertices and weighted edges
graph.addVertex('A', { label: 'Start' });
graph.addVertex('B', { label: 'Checkpoint' });
graph.addVertex('C', { label: 'Junction' });
graph.addVertex('D', { label: 'Station' });
graph.addVertex('E', { label: 'End' });

graph.addEdge('A', 'B', { weight: 2 });
graph.addEdge('B', 'C', { weight: 1 });
graph.addEdge('C', 'D', { weight: 3 });
graph.addEdge('D', 'E', { weight: 1 });
graph.addEdge('A', 'E', { weight: 5 });

// Find shortest path using Dijkstra's algorithm
const shortestPath = graph.findShortestPath('A', 'E');
// Returns { path: ['A', 'B', 'C', 'D', 'E'], distance: 7 }

// Generate minimum spanning tree using Kruskal's algorithm
const mst = graph.minimumSpanningTreeKruskal();
// Returns a new Graph representing the MST

// Alternative: use Prim's algorithm
const mstPrim = graph.minimumSpanningTreePrim();

// Find all-pairs shortest paths using Floyd-Warshall algorithm
const distances = graph.floydWarshall();
// Returns distance matrix between all pairs of vertices

// Community detection using Louvain method
const communities = graph.detectCommunities();
// Returns array of communities (groups of vertices)

// Network analysis
const degreeCentrality = graph.degreeCentrality('C');
const betweennessCentrality = graph.betweennessCentrality();
const closenessCentrality = graph.closenessCentrality('A');

// Detect critical points in the network
const articulationPoints = graph.findArticulationPoints();
const bridges = graph.findBridges();

// For directed acyclic graphs (DAGs)
const sorted = graph.topologicalSort();
```

The graph module integrates seamlessly with other Herta.js features:

```javascript
// Analyze network data using the graph module and statistics
const networkDiameter = graph.diameter();
const avgPathLength = graph.averagePathLength();
const densityValue = graph.density();

// Generate graph visualizations (returns data for plotting)
const layout = graph.forceDirectedLayout();
```

## Features

### Core Mathematical Foundations
- **Pure Mathematics**: Arithmetic, algebra, calculus, and complex analysis
- **Symbolic Mathematics**: Integration, differentiation, and tensor calculus
- **Number Theory**: Prime factorization, modular arithmetic, Diophantine equations, and quadratic residues
- **Abstract Algebra**: Group theory, ring theory, field theory, and Galois theory

### Advanced Mathematics
- **Differential Geometry**: Riemannian metrics, curvature, geodesics, Lie derivatives, and parallel transport
- **Category Theory**: Categories, functors, natural transformations, and universal constructions
- **Algebraic Geometry**: Elliptic curves, toric varieties, blowups, and sheaf cohomology
- **Topology**: Persistent homology, manifold operations, Betti numbers, and simplicial complexes

### Scientific Computing
- **Numerical Methods**: ODEs, PDEs, spectral methods, and stochastic differential equations
- **Linear Algebra**: Large-scale matrix operations and eigenvalue computations
- **Optimization**: Gradient descent, genetic algorithms, simulated annealing, and constrained optimization
- **Signal Processing**: FFT, filter design, convolution, and wavelet transforms

### Physics and Dynamics
- **Quantum Mechanics**: State vectors, density matrices, quantum gates, and measurements
- **Chaos Theory**: Lyapunov exponents, fractals, bifurcation diagrams, and strange attractors
- **Fluid Dynamics**: Reynolds numbers, Navier-Stokes solvers, and flow analysis
- **Relativistic Physics**: Black hole physics, gravitational waves, and spacetime mathematics

### Computer Science
- **Graph Theory**: Network analysis, community detection, flow algorithms, and graph coloring
- **String Algorithms**: Pattern matching (KMP, Boyer-Moore), suffix arrays, and sequence alignment
- **Computer Vision**: Image processing, edge detection, feature matching, and segmentation
- **Machine Learning**: Neural networks, reinforcement learning, and deep learning primitives

### Applied Mathematics
- **Probability & Statistics**: Distributions, hypothesis testing, and Monte Carlo methods
- **Financial Mathematics**: Risk metrics, portfolio optimization, and trading strategies
- **Cryptography**: Encryption, zero-knowledge proofs, and cryptoeconomic models
- **Information Theory**: Entropy, coding theory, and data compression

## Getting Started

### Installation

**Create a new Herta.js project (recommended):**

```bash
# Using npm
npm install -g herta
herta erudition make project MyMathApp
cd my-math-app

# Or directly with npx
npx herta erudition make project MyMathApp
cd my-math-app
```

**Add to an existing project:**

```bash
# Using npm
npm install herta

# Using yarn
yarn add herta
```

### Project Structure

A typical Herta.js project has the following structure:

```
my-math-app/
├── node_modules/
├── src/
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── controllers/      # Route handlers
│   └── utils/            # Helper functions
├── test/                 # Test files
├── config.js             # Application configuration
├── herta.config.js       # Herta.js framework configuration
├── package.json
└── README.md
```

### Quick Start

```javascript
// app.js
const herta = require('herta');

// Initialize the framework
const app = herta.createApplication({
  // Configuration options
  debug: process.env.NODE_ENV !== 'production',
  modules: ['algebra', 'calculus', 'statistics']
});

// Use framework components
const matrix = app.core.matrix.create([[1, 2], [3, 4]]);
const determinant = matrix.determinant();

console.log(`Matrix determinant: ${determinant}`);

// Start the application
app.start();
```

## Herta Erudition CLI

Herta.js comes with a powerful command-line interface called "Erudition" that helps you scaffold, analyze, test, document, and understand the framework.

### CLI Usage

Once Herta.js is installed globally (see Installation section above), the CLI is automatically available. Or you can use it directly with npx from within your project:

```bash
npx herta erudition <command>
```

### Available Commands

#### `make` - Generate Code Components

Create boilerplate code for various components:

```bash
herta erudition make module MyModule           # Create a new module
herta erudition make controller DataController  # Create a new controller
herta erudition make service AnalysisService    # Create a new service
herta erudition make test QuantumModule         # Create a new test file
herta erudition make api UserManagement         # Create a complete REST API
herta erudition make rest-controller Products   # Create a REST controller
herta erudition make graphql BookSchema         # Create GraphQL schema and resolver
```

The `make` command generates proper file structure and boilerplate code with appropriate naming conventions (PascalCase, camelCase, snake_case) depending on the component type.

##### API Generator Options

The API generator creates fully-functional RESTful endpoints:

```bash
# Create a complete User Management API with all required files
herta erudition make api UserManagement --with-auth        # Include authentication
herta erudition make api DataAnalytics --with-validation   # Include validation
herta erudition make api SensorData --with-docs            # Include Swagger docs
```

##### REST Controller Options

```bash
# Generate specialized REST controllers
herta erudition make rest-controller Products --crud         # Basic CRUD operations
herta erudition make rest-controller Orders --with-relations # Include related resources
herta erudition make rest-controller Analytics --read-only   # Read-only endpoints
```

##### GraphQL Generator Options

```bash
# Generate GraphQL components
herta erudition make graphql BookSchema --with-resolvers    # Include resolvers
herta erudition make graphql UserSchema --with-mutations    # Include mutations
herta erudition make graphql OrderSchema --with-directives  # Include custom directives
```

#### `analyze` - Analyze Code Quality and Patterns

Perform static analysis on your code:

```bash
herta erudition analyze src/advanced/             # Default analysis (stats)
herta erudition analyze --complexity src/core/     # Analyze code complexity
herta erudition analyze --dependencies src/utils/  # Analyze module dependencies
herta erudition analyze --stats src/algorithms/    # Analyze code statistics
```

The `analyze` command examines your code and provides insights on complexity metrics, dependency graphs, and code statistics to help improve code quality.

#### `doc` - Generate Documentation

Automatically generate documentation from JSDoc comments:

```bash
herta erudition doc matrix                  # Generate docs for a specific component
herta erudition doc --all                    # Generate docs for all components
herta erudition doc --format html            # Generate in HTML format (default is markdown)
herta erudition doc --output custom-docs/    # Specify output directory
```

The `doc` command extracts JSDoc comments from your code and generates comprehensive documentation in markdown or HTML format.

#### `test` - Run Tests with Detailed Reporting

Execute tests with comprehensive reports:

```bash
herta erudition test core/matrix           # Run tests matching a specific pattern
herta erudition test --unit                 # Run only unit tests
herta erudition test --integration          # Run only integration tests
herta erudition test --coverage             # Generate test coverage report
herta erudition test --verbose              # Show detailed test output
```

The `test` command runs tests and provides detailed summaries of test results, including pass/fail counts, execution time, and coverage metrics.

#### `explain` - Get Plain English Explanations

Receive explanations of framework concepts in plain language:

```bash
herta erudition explain config                # Explain configuration options
herta erudition explain algorithms            # Explain general algorithms concepts
herta erudition explain eigenvalues           # Explain mathematical concepts
herta erudition explain --detailed quantum    # Get more detailed explanation
```

The `explain` command provides clear, plain-English explanations of Herta.js concepts, configuration options, and advanced mathematical and scientific topics. It's especially useful for understanding complex modules like Quantum Mechanics, Chaos Theory, and Number Theory.

#### `api` - Create and Manage APIs

Build and manage APIs powered by Herta.js:

```bash
herta erudition api create --name math-api --type rest     # Create a new REST API
herta erudition api add-endpoint calculus --module calculus  # Add module endpoint
herta erudition api generate-docs --format openapi          # Generate API docs
herta erudition api test --endpoint graph-analysis          # Test an endpoint
herta erudition api deploy --provider aws                   # Deploy the API
```

The `api` command helps you build APIs that leverage Herta.js's mathematical capabilities, enabling powerful computation services.

#### `web` - Web Development Tools

Create web applications and components with Herta.js:

```bash
herta erudition web create-app --name matrix-explorer    # Create a web app
herta erudition web add-component matrix-visualizer       # Add a component
herta erudition web build --optimize                      # Build for production
herta erudition web serve --port 3000                     # Start dev server
herta erudition web generate-ssr --framework next         # Add SSR support
```

The `web` command facilitates creating rich web applications that utilize Herta.js's mathematical modules for visualization, computation, and analysis.

### Additional CLI Functions

#### Global Options

All Erudition commands support these common options:

```bash
--help, -h        # Display command-specific help
--version, -v     # Display Erudition version information
--quiet, -q       # Reduce output verbosity
--json            # Output results in JSON format
--config <file>   # Use custom configuration file
```

#### Sub-command Details

##### Make Command Templates

The `make` command supports various templates for different component types:

```bash
herta erudition make module --functional MyModule    # Create a functional module
herta erudition make module --class MyModule         # Create a class-based module
herta erudition make test --unit MyTest              # Create a unit test
herta erudition make test --integration MyTest       # Create an integration test
herta erudition make test --performance MyTest       # Create a performance test
```

##### Analyze Command Options

The `analyze` command provides specialized analysis modes:

```bash
herta erudition analyze --complexity-threshold 10   # Flag methods over threshold
herta erudition analyze --visualize                  # Generate visual reports
herta erudition analyze --trends                     # Compare to historical data
herta erudition analyze --unused                     # Find unused code
```

##### Documentation Format Options

The `doc` command supports different output formats and templates:

```bash
herta erudition doc --format html --theme dark      # Dark themed HTML docs
herta erudition doc --format markdown --toc          # Markdown with table of contents
herta erudition doc --template custom-template.ejs   # Use custom template
herta erudition doc --diagrams                       # Include UML diagrams
```

##### Test Reporting Options

The `test` command has additional reporting capabilities:

```bash
herta erudition test --reporters mocha,junit        # Multiple report formats
herta erudition test --watch                         # Watch mode for auto-reruns
herta erudition test --parallel 4                    # Run tests in parallel
herta erudition test --snapshot                      # Run snapshot tests
herta erudition test --perf                          # Include performance benchmarks
```

##### Explain Command Topics

The `explain` command covers numerous specialized topics:

```bash
herta erudition explain architecture                # System architecture overview
herta erudition explain modules                      # Module system details
herta erudition explain patterns                     # Design patterns used
herta erudition explain best-practices               # Coding best practices
herta erudition explain api-stability                # API stability guarantees
```

### Module-Specific Commands

Erudition includes specialized commands for working with Herta.js's advanced mathematical modules:

#### Quantum Mechanics Helper

```bash
# Visualize quantum states and gates
herta erudition quantum visualize --state "[0.7071, 0.7071]" --output quantum-state.png
herta erudition quantum circuit --gates "H,X,CNOT" --qubits 2 --output circuit.svg

# Generate common quantum circuits
herta erudition quantum generate --type bell-state --qubits 2
herta erudition quantum generate --type qft --qubits 4

# Analyze quantum properties
herta erudition quantum analyze-entanglement --state "[0.7071, 0, 0, 0.7071]"
```

#### Graph Theory Utilities

```bash
# Generate and analyze graphs
herta erudition graph generate --type erdos-renyi --nodes 20 --probability 0.3
herta erudition graph generate --type scale-free --nodes 50 --output graph.json

# Analyze graph properties
herta erudition graph analyze --file graph.json --metrics "centrality,connectivity,communities"
herta erudition graph visualize --file graph.json --layout force-directed --output graph.svg
```

#### Optimization Playground

```bash
# Test optimization algorithms on standard problems
herta erudition optimize --algorithm gradient-descent --problem rosenbrock
herta erudition optimize --algorithm genetic --problem traveling-salesman --cities 15

# Benchmark optimization performance
herta erudition optimize benchmark --algorithms "gradient-descent,genetic,simulated-annealing" --problem sphere
```

#### Data Science Toolkit

```bash
# Statistical analysis and probability tools
herta erudition stats analyze --data data.csv --tests "normality,correlation,t-test"
herta erudition stats generate --distribution normal --params "0,1" --samples 1000 --output samples.csv

# Monte Carlo simulations
herta erudition stats monte-carlo --simulation coin-toss --trials 10000 --probability 0.5
```

#### Number Theory Explorer

```bash
# Prime number utilities
herta erudition number-theory primes --range "1,1000" --output primes.json
herta erudition number-theory factorize --number 12345678 --algorithm "pollard-rho"

# Explore number properties
herta erudition number-theory properties --number 42 --checks "prime,perfect,abundant,deficient"

# Modular arithmetic operations
herta erudition number-theory solve-congruence --equation "3x ≡ 5 (mod 7)"
herta erudition number-theory chinese-remainder --remainders "2,3,2" --moduli "3,5,7"
```

#### Fluid Dynamics Simulator

```bash
# Calculate fluid properties
herta erudition fluid reynolds --velocity 2 --diameter 0.05 --fluid water
herta erudition fluid pressure-drop --length 10 --diameter 0.05 --velocity 2 --roughness 0.0001

# Run fluid simulations
herta erudition fluid simulate --model "1d-advection" --domain-length 10 --nodes 100 --time-steps 1000
herta erudition fluid simulate --model "2d-incompressible" --resolution "100x100" --time 10 --output flow.mp4

# Visualize fluid results
herta erudition fluid visualize --data simulation.json --type "velocity-field" --output velocity.png
herta erudition fluid visualize --data simulation.json --type "pressure-contour" --output pressure.png
```

#### Computer Vision Toolkit

```bash
# Image processing operations
herta erudition vision process --input image.jpg --operations "grayscale,gaussian-blur:5,canny:30:100" --output processed.jpg
herta erudition vision histogram --input image.jpg --channel rgb --equalize --output histogram.png

# Feature detection and analysis
herta erudition vision detect-features --input image.jpg --algorithm "fast" --threshold 20 --output features.json
herta erudition vision match-features --image1 scene.jpg --image2 object.jpg --output matches.jpg

# Advanced computer vision operations
herta erudition vision segment --input image.jpg --algorithm "kmeans" --clusters 5 --output segmented.jpg
herta erudition vision detect-objects --input image.jpg --model "herta-detector" --confidence 0.7 --output detected.jpg
```

#### String Algorithms Workshop

```bash
# Pattern matching
herta erudition strings search --text file.txt --pattern "important text" --algorithm "kmp" --output matches.json
herta erudition strings multi-pattern --text file.txt --patterns patterns.txt --algorithm "aho-corasick" --output results.json

# String similarity and distance
herta erudition strings compare --string1 "kitten" --string2 "sitting" --metrics "levenshtein,lcs,similarity"
herta erudition strings cluster --input strings.txt --method "edit-distance" --threshold 3 --output clusters.json

# Suffix structures and compression
herta erudition strings build-suffix-array --text "banana" --output suffix-array.json
herta erudition strings compress --input file.txt --method "run-length" --output compressed.txt
```

#### Chaos Theory Explorer

```bash
# Generate fractal visualizations
herta erudition chaos fractal --type "mandelbrot" --bounds "-2:1:-1:1" --resolution "1000x1000" --output mandelbrot.png
herta erudition chaos julia --c "-0.7:0.27" --bounds "-2:2:-2:2" --resolution "1000x1000" --output julia.png

# Simulate chaotic systems
herta erudition chaos simulate --system "lorenz" --params "10,28,8/3" --duration 100 --output lorenz.json
herta erudition chaos simulate --system "logistic-map" --param 3.9 --iterations 1000 --output bifurcation.json

# Analyze chaotic properties
herta erudition chaos lyapunov --data timeseries.json --dimension 3 --delay 2 --output lyapunov.json
herta erudition chaos recurrence-plot --data timeseries.json --threshold 0.1 --output recurrence.png
```

#### Advanced Mathematics Explorer

```bash
# Differential Geometry operations
herta erudition differential-geometry manifold --dimension 2 --curvature constant --output sphere.json
herta erudition differential-geometry geodesic --manifold sphere.json --start "0,0" --end "pi/2,pi/2" --output geodesic.json

# Category Theory visualization
herta erudition category diagram --objects "A,B,C,D" --morphisms "f:A->B,g:B->C,h:A->D,i:D->C" --output diagram.svg
herta erudition category functor --source diagram1.json --target diagram2.json --output functor.json

# Complex Analysis tools
herta erudition complex-analysis contour-plot --function "z^2" --region "-2:2:-2:2" --resolution 500 --output contour.png
herta erudition complex-analysis laurent-series --function "1/(z^2-1)" --point 0 --terms 10
```

#### Cross-Domain Integration Tools

```bash
# Machine Learning with Herta modules
herta erudition ml train --algorithm "neural-network" --data dataset.csv --features "x,y,z" --target "output" --model-save model.json
herta erudition ml optimize-hyperparams --algorithm "svm" --data dataset.csv --param-grid params.json --output best-params.json

# Scientific computing pipelines
herta erudition pipeline create --name "data-analysis" --steps "load:data.csv,clean,normalize,analyze:correlation,visualize:heatmap" --output pipeline.json
herta erudition pipeline run --file pipeline.json --params params.json --output results/

# Interactive explorations
herta erudition explore --module quantum --interactive  # Opens an interactive jupyter-like notebook
herta erudition explore --module graph --dataset social-network.json --interactive
```

#### Developer Utilities

```bash
# Code quality and maintenance
herta erudition dev audit-dependencies --security --outdated
herta erudition dev lint --fix --style standard

# Performance profiling
herta erudition dev profile --function "matrix.multiply" --size "1000x1000" --iterations 10 --output profile.json
herta erudition dev benchmark --suite "matrix-operations" --compare-with v1.0.0 --output benchmark.html

# Versioning and publishing
herta erudition dev prepare-release --bump minor --changelog --tag
herta erudition dev publish --dry-run  # Verify everything before actual publish
```

#### API & Web Development

```bash
# API integration with mathematical modules
herta erudition api create --type rest --name mathematical-api
herta erudition api add-endpoint optimization --methods "POST,GET" --module optimization
herta erudition api add-endpoint quantum --methods "POST" --module quantum
herta erudition api add-endpoint graph-analysis --methods "POST,GET" --module graph

# Generate client libraries for mathematical APIs
herta erudition api client-gen --language javascript --output ./clients/js
herta erudition api client-gen --language python --output ./clients/python
herta erudition api client-gen --language typescript --with-types --output ./clients/ts

# Web component generation for visualization
herta erudition web component graph-visualizer --module graph --output ./components
herta erudition web component matrix-editor --module matrix --output ./components
herta erudition web component fractal-explorer --module chaos --output ./components

# Create interactive web dashboards for mathematical modules
herta erudition web dashboard optimization --algorithms "gradient-descent,genetic" --output ./dashboards
herta erudition web dashboard quantum --features "state-visualization,gate-simulation" --output ./dashboards
herta erudition web dashboard statistics --features "distribution-explorer,regression" --output ./dashboards
```

### Extending Erudition

You can create custom Erudition plugins by adding files to the `commands/erudition/plugins` directory:

```javascript
// commands/erudition/plugins/myPlugin.js
module.exports = function(args) {
  // Plugin implementation
  console.log('My custom plugin is running!');
};
```

Then use your plugin with:

```bash
herta erudition myPlugin [args]
```

## Basic Usage

```javascript
const herta = require('herta');

// Basic arithmetic and constants
console.log(herta.round(herta.e, 3));                // 2.718
console.log(herta.atan2(3, -3) / herta.pi);          // 0.75
console.log(herta.log(10000, 10));                   // 4
console.log(herta.sqrt(-4).toString());              // 2i

// Matrix operations
const matrix = [[-1, 2], [3, 1]];
console.log(herta.pow(matrix, 2));                   // [[7, 0], [0, 7]]
console.log(herta.det(matrix));                      // -7

// Expression evaluation
console.log(herta.evaluate('1.2 * (2 + 4.5)'));     // 7.8
console.log(herta.evaluate('12.7 cm to inch'));     // 5 inch
console.log(herta.evaluate('sin(45 deg) ^ 2'));     // 0.5
console.log(herta.evaluate('9 / 3 + 2i'));          // 3 + 2i

// Chaining operations
const result = herta.chain(3)
    .add(4)
    .multiply(2)
    .done();                                         // 14
console.log(result);
```

## Advanced Features

### Symbolic Integration

```javascript
// Advanced symbolic integration
const integral = herta.integrate('sin(x^2)', 'x');
console.log(integral);  // Complex symbolic result

// Definite integration
const definiteIntegral = herta.integrate('sin(x^2)', 'x', 0, 1);
console.log(definiteIntegral);  // Numerical approximation
```

### Differential Equations

```javascript
// Solving differential equations
const solution = herta.solveDifferentialEquation('dy/dx = y^2 + x', 'y', 'x');
console.log(solution);  // Symbolic solution

// Numerical solution with initial conditions
const numericalSolution = herta.solveODE('y\'=y^2+x', 'y', 'x', 0, 1, [0, 5]);
console.log(numericalSolution);  // Array of solution points
```

### Large-Scale Linear Algebra

```javascript
// Create a large sparse matrix
const sparseMatrix = herta.createSparseMatrix(1000, 1000);

// Efficient eigenvalue computation
const eigenvalues = herta.eigenvalues(sparseMatrix);
console.log(eigenvalues.length);  // 1000
```

### Tensor Calculus

```javascript
// Create tensors for General Relativity calculations
const metric = herta.createMetricTensor(4, 4);  // 4D spacetime metric

// Compute Christoffel symbols
const christoffel = herta.christoffelSymbols(metric);
console.log(christoffel);  // 3D tensor

// Compute Riemann curvature tensor
const riemann = herta.riemannTensor(metric);
console.log(riemann);  // 4D tensor
```

### Automatic Differentiation

```javascript
// Define a function for automatic differentiation
const f = herta.autodiff.createFunction('x^2 + sin(y) + z*x', ['x', 'y', 'z']);

// Compute gradient at a point
const gradient = f.gradient([2, Math.PI, 3]);
console.log(gradient);  // [7, 0, 2]

// Compute Hessian matrix
const hessian = f.hessian([2, Math.PI, 3]);
console.log(hessian);  // [[2, 0, 1], [0, -1, 0], [1, 0, 0]]
```

## Module Examples

### Advanced Algebra

```javascript
// Working with group theory
const elements = [0, 1, 2, 3, 4];  // Z5 elements
const operation = (a, b) => (a + b) % 5;  // Addition modulo 5

// Create a cyclic group
const Z5 = herta.advancedAlgebra.createCyclicGroup(5);

// Group operations
console.log(Z5.apply(2, 3));  // 0 (2+3 mod 5)
console.log(Z5.inverse(3));   // 2 (since 3+2=0 mod 5)
console.log(Z5.orderOf(2));   // 5

// Create a modular ring
const modRing = herta.advancedAlgebra.createModularRing(7);
console.log(modRing.power(3, -1));  // 5 (modular inverse of 3 mod 7)

// Polynomial operations
const F = herta.advancedAlgebra.createModularRing(5); // Field Z/5Z
const poly1 = herta.advancedAlgebra.createPolynomial([1, 0, 1], F); // x^2 + 1
const poly2 = herta.advancedAlgebra.createPolynomial([2, 1], F);    // x + 2
const product = poly1.multiply(poly2); // (x^2 + 1)(x + 2) = x^3 + 2x^2 + x + 2
```

### Reinforcement Learning

```javascript
// Create a GridWorld environment
const gridWorld = herta.reinforcementLearning.GridWorld(5, 5, {
  start: { x: 0, y: 0 },
  terminals: [
    { x: 4, y: 4, reward: 1 },  // Goal state with positive reward
    { x: 4, y: 0, reward: -1 }, // Negative reward state
  ],
  obstacles: [
    { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, // Wall
  ],
  defaultReward: -0.04, // Small penalty for each step
});

// Create a Q-learning agent
const agent = herta.reinforcementLearning.QLearning(gridWorld, {
  learningRate: 0.1,
  discountFactor: 0.9,
  epsilon: 0.2,
  epsilonDecay: 0.995,
});

// Train the agent
const trainingResults = agent.train(1000); // Train for 1000 episodes

// Get the learned policy
const policy = agent.getPolicy();
console.log(policy); // Maps states to optimal actions

// Multi-armed bandit example
const banditRewards = (armIndex) => {
  const means = [0.3, 0.5, 0.7, 0.9]; // Mean rewards for 4 arms
  return means[armIndex] + 0.1 * (Math.random() - 0.5); // Add noise
};

// Create a UCB bandit solver
const bandit = herta.reinforcementLearning.ucbBandit(banditRewards, 4);
const results = bandit.run(1000); // Run for 1000 steps
```

### Text Analysis

```javascript
// Basic text tokenization and processing
const text = "Natural language processing is fascinating. It has many applications in AI."
const tokens = herta.textAnalysis.tokenize(text);
console.log(tokens); // ['Natural', 'language', 'processing', ...]

// Sentence tokenization
const sentences = herta.textAnalysis.tokenize(text, 'sentence');
console.log(sentences); // ['Natural language processing is fascinating.', ...]

// TF-IDF calculation
const documents = [
  "This is a document about dogs.",
  "This document discusses cats and their behavior.",
  "Dogs and cats are popular pets."
];

const idf = herta.textAnalysis.inverseDocumentFrequency(documents);
const tfidf = herta.textAnalysis.tfidf(documents[0], idf);
console.log(tfidf); // { 'document': 0.1053..., 'dogs': 0.4054... }

// Sentiment analysis
const sentiment = herta.textAnalysis.analyzeSentiment("I love this product, it's amazing!");
console.log(sentiment); // { positive: 0.2, negative: 0, score: 0.2, magnitude: 0.2 }

// Create a text classifier
const classifier = herta.textAnalysis.createNaiveBayesClassifier();

// Train the classifier
classifier.train("This product is excellent", "positive");
classifier.train("I'm very happy with my purchase", "positive");
classifier.train("This doesn't work at all", "negative");
classifier.train("Poor quality and expensive", "negative");

// Classify new text
const result = classifier.classify("I'm happy with this product");
console.log(result.category); // 'positive'
```

### Cryptoeconomics

```javascript
// Create a tokenomics model for a cryptocurrency
const tokenModel = herta.cryptoeconomics.createTokenomicsModel({
  initialSupply: 100000000, // 100 million tokens
  inflationRate: 0.02, // 2% annual inflation
  stakingRewardRate: 0.05, // 5% annual staking rewards
  burnRate: 0.001, // 0.1% tokens burned per year
  distributionRatios: { 
    team: 0.15, 
    investors: 0.15, 
    community: 0.6, 
    reserves: 0.1 
  }
});

// Project supply after 10 years
const supplyProjection = tokenModel.projectSupply(10);
console.log(supplyProjection.finalSupply); // Future token supply

// Calculate staking rewards
const stakingRewards = tokenModel.calculateStakingRewards(1000000, 5);
console.log(stakingRewards); // Returns staking rewards over 5 years

// Create a bonding curve pricing model
const curve = herta.cryptoeconomics.createBondingCurve({
  curveType: 'linear',
  slope: 0.1,
  initialPrice: 1
});

// Calculate token price impact
const impact = curve.simulatePriceImpact(1000, true);
console.log(impact); // Shows price before and after 1000-token purchase
```

### Zero Knowledge Proofs

```javascript
// Create a range proof system
const rangeProver = herta.zeroKnowledgeProofs.rangeProof();

// Generate a proof that a value is within range [0, 1000]
const proof = rangeProver.prove(750, 1000);

// Verify the proof
const isValid = rangeProver.verify(proof, 1000);
console.log(isValid); // true - confirms value is in range without revealing it

// Set membership proof
const allowlist = ["address1", "address2", "address3"];
const membershipProof = herta.zeroKnowledgeProofs.setMembership(allowlist);

// Prove membership without revealing which element
const addressProof = membershipProof.proveInSet("address2");

// Verify membership
const isMember = membershipProof.verifyInSet(addressProof);
console.log(isMember); // true - confirms address is in the allowlist
```

### Language Model Math

```javascript
// Calculate self-attention scores in a transformer model
const queries = [[1, 0, 1], [0, 1, 0]]; // Query vectors
const keys = [[1, 1, 0], [0, 1, 1]];    // Key vectors

// Calculate attention weights
const attentionWeights = herta.languageModelMath.selfAttention(queries, keys);
console.log(attentionWeights); // Attention distribution

// Apply attention to values
const values = [[1, 2], [3, 4]]; // Value vectors
const attentionOutput = herta.languageModelMath.applyAttention(attentionWeights, values);

// Apply position encoding to embeddings
const embeddings = [[1, 2, 3, 4], [5, 6, 7, 8]];
const positionEncoded = herta.languageModelMath.positionEncoding(embeddings);

// Sample from a distribution using nucleus sampling (top-p)
const logits = [2.5, 1.2, 0.8, 0.3, -0.5]; // Raw model outputs
const sampledToken = herta.languageModelMath.nucleusSampling(logits, 0.9);
console.log(sampledToken); // Token ID selected by sampling
```

### Neural Networks

```javascript
// Create a feedforward neural network
const model = herta.neuralNetworks.feedForward(
  [784, 128, 64, 10], // Layer sizes (MNIST classification example)
  { activation: 'relu', outputActivation: 'softmax' }
);

// Forward pass
const input = [/* flattened image data */];
const prediction = model.forward([input]);

// Create a convolutional layer
const convLayer = herta.neuralNetworks.convLayer2d({
  inputChannels: 1,
  outputChannels: 16,
  kernelSize: 3,
  stride: 1,
  padding: 1,
  activation: 'relu'
});

// Create an LSTM layer
const lstm = herta.neuralNetworks.lstmLayer(100, 64, { returnSequences: true });

// Process a sequence through the LSTM
const sequence = [/* sequence of embedding vectors */];
const { output, hidden, cell } = lstm.forward([sequence]);
```

### Relativistic Astrophysics

```javascript
// Calculate the Schwarzschild radius of a black hole
const solarMass = 1.989e30; // kg
const blackHoleMass = 10 * solarMass; // 10 solar masses
const radius = herta.relativisticAstrophysics.schwarzschildRadius(blackHoleMass);
console.log(radius); // ~29.5 km

// Calculate gravitational time dilation
const distance = radius * 3; // 3 times the Schwarzschild radius
const timeDilation = herta.relativisticAstrophysics.gravitationalTimeDilation(
  blackHoleMass, 
  distance
);
console.log(timeDilation); // Time runs slower by this factor

// Calculate properties of a binary black hole merger
const mass1 = 30 * solarMass;
const mass2 = 25 * solarMass;
const separation = 1000000; // 1000 km

// Gravitational wave frequency
const freq = herta.relativisticAstrophysics.gravitationalWaveFrequency(
  mass1, 
  mass2, 
  separation
);

// Time until merger
const timeToMerge = herta.relativisticAstrophysics.timeToMerger(
  mass1,
  mass2,
  separation
);
console.log(timeToMerge); // Time in seconds until the black holes merge
```

### Technical Analysis

```javascript
// Calculate Simple Moving Average
const prices = [10.5, 11.2, 10.8, 11.5, 11.7, 12.1, 12.5, 12.0, 11.8, 12.2];
const sma = herta.technicalAnalysis.sma(prices, 5);
console.log(sma); // [11.14, 11.46, 11.72, 11.96, 12.12, 12.1]

// Calculate Relative Strength Index
const priceHistory = [45.34, 45.67, 46.12, 46.82, 46.45, 46.89, 47.23, 47.56, 47.32, 47.65, 48.12, 48.45, 48.23, 47.98];
const rsi = herta.technicalAnalysis.rsi(priceHistory, 14);
console.log(rsi); // Returns RSI values

// Calculate Bollinger Bands
const priceSeries = [26.10, 25.78, 26.01, 26.35, 26.57, 26.42, 26.35, 26.70, 26.89, 26.95, 27.12, 27.42, 27.67, 27.85];
const { upperBand, middleBand, lowerBand } = herta.technicalAnalysis.bollingerBands(priceSeries, 10, 2);
console.log('Upper Band:', upperBand);
console.log('Middle Band:', middleBand);
console.log('Lower Band:', lowerBand);

// Detect support and resistance with Pivot Points
const pivots = herta.technicalAnalysis.pivotPoints(27.85, 26.35, 27.45);
console.log('Pivot:', pivots.pivot);
console.log('Resistance 1:', pivots.resistance.r1);
console.log('Support 1:', pivots.support.s1);

// Calculate MACD
const { macdLine, signalLine, histogram } = herta.technicalAnalysis.macd(priceSeries);
console.log('MACD line:', macdLine);
console.log('Signal line:', signalLine);
console.log('Histogram:', histogram);
```

### Trading Strategies

```javascript
// Calculate optimal position size using Kelly Criterion
const winRate = 0.55; // 55% of trades are profitable
const winLossRatio = 1.5; // Average win is 1.5x the average loss
const capital = 10000; // $10,000 trading capital
const positionSize = herta.tradingStrategies.kellyPositionSize(winRate, winLossRatio, capital);
console.log('Optimal position size:', positionSize); // $1,666.67

// Calculate stop loss and take profit based on volatility
const priceData = [
  { high: 150.5, low: 149.2, close: 150.1 },
  { high: 151.2, low: 149.8, close: 151.0 },
  // ... more price history
];

const entryPrice = 151.5;
const levels = herta.tradingStrategies.volatilityBasedLevels(entryPrice, priceData, 2, 3);
console.log('Entry price:', levels.entryPrice);
console.log('Stop loss:', levels.stopLoss);
console.log('Take profit:', levels.takeProfit);

// Implement a trend following strategy
const btcPrices = [
  // Daily price data for Bitcoin
];

const signals = herta.tradingStrategies.trendFollowing(btcPrices, {
  shortPeriod: 10,
  longPeriod: 30,
  stopLossPercent: 0.05
});

console.log('Strategy signals:', signals);

// Evaluate trading performance
const trades = [
  { entryPrice: 10000, exitPrice: 10500, type: 'long', size: 0.1 },
  { entryPrice: 10500, exitPrice: 10300, type: 'short', size: 0.1 },
  { entryPrice: 10300, exitPrice: 11000, type: 'long', size: 0.15 }
];

const performance = herta.tradingStrategies.evaluatePerformance(trades, 5000);
console.log('Total return:', performance.totalReturns);
console.log('Sharpe ratio:', performance.sharpeRatio);
console.log('Win rate:', performance.winRate);
```

### Risk Management

```javascript
// Calculate Value at Risk (VaR) using historical simulation
const portfolioValue = 1000000; // $1 million portfolio
const returns = [-0.02, -0.015, -0.01, -0.005, 0, 0.005, 0.01, 0.015, 0.02]; // Historical returns
const var95 = herta.riskManagement.historicalVaR(returns, 0.95, portfolioValue);
console.log('95% VaR:', var95); // Amount you could lose with 95% confidence

// Calculate parametric Value at Risk
const mean = 0.001; // Mean daily return
const stdDev = 0.015; // Standard deviation of returns
const parametricVaR = herta.riskManagement.parametricVaR(mean, stdDev, 0.99, portfolioValue);
console.log('99% Parametric VaR:', parametricVaR);

// Calculate portfolio volatility
const weights = [0.4, 0.3, 0.2, 0.1]; // Asset allocation weights
const covarianceMatrix = [
  [0.04, 0.02, 0.01, 0.01],
  [0.02, 0.09, 0.01, 0.02],
  [0.01, 0.01, 0.16, 0.01],
  [0.01, 0.02, 0.01, 0.04]
];

const volatility = herta.riskManagement.portfolioVolatility(weights, covarianceMatrix);
console.log('Portfolio Volatility:', volatility);

// Calculate Sharpe Ratio
const expectedReturn = 0.12; // 12% annual expected return
const annualVolatility = 0.18; // 18% annual volatility
const riskFreeRate = 0.03; // 3% risk-free rate
const sharpeRatio = herta.riskManagement.sharpeRatio(expectedReturn, annualVolatility, riskFreeRate);
console.log('Sharpe Ratio:', sharpeRatio);

// Perform a stress test
const assetValues = [400000, 300000, 200000, 100000]; // Values of assets in portfolio
const stressShocks = [0.25, 0.15, 0.35, 0.10]; // Stress scenario percentage losses
const stressTest = herta.riskManagement.stressTest(assetValues, stressShocks);
console.log('Stressed Portfolio Value:', stressTest.stressedValue);
console.log('Total Impact:', stressTest.impactAmount);
console.log('Impact Percentage:', stressTest.impactPercent);
```

### Tabular Analysis

```javascript
// Analyze a dataset of sales transactions
const salesData = [
  { date: '2023-01-01', product: 'A', region: 'North', sales: 1200, units: 5, returns: 0 },
  { date: '2023-01-01', product: 'B', region: 'North', sales: 900, units: 3, returns: 1 },
  { date: '2023-01-02', product: 'A', region: 'South', sales: 1500, units: 6, returns: 0 },
  { date: '2023-01-02', product: 'B', region: 'East', sales: 1100, units: 4, returns: 0 },
  { date: '2023-01-03', product: 'C', region: 'West', sales: 1800, units: 7, returns: 2 },
  { date: '2023-01-03', product: 'A', region: 'East', sales: 2000, units: 8, returns: 1 },
  { date: '2023-01-04', product: 'B', region: 'West', sales: 1300, units: 5, returns: 0 },
  { date: '2023-01-04', product: 'C', region: 'North', sales: 950, units: 3, returns: 0 },
];

// Generate summary statistics for numeric columns
const summary = herta.tabularAnalysis.summarize(salesData);
console.log('Sales Summary:', summary.sales);
console.log('Units Summary:', summary.units);

// Calculate correlation matrix
const { correlationMatrix } = herta.tabularAnalysis.correlationMatrix(salesData);
console.log('Correlation between sales and units:', correlationMatrix.sales.units);

// Detect outliers
const outliers = herta.tabularAnalysis.detectOutliers(salesData, ['sales', 'units']);
console.log('Sales outliers:', outliers.sales);

// Group data by product and calculate aggregates
const salesByProduct = herta.tabularAnalysis.groupBy(salesData, 'product', {
  sales: 'sum',
  units: 'sum',
  avgSale: (values) => values.reduce((sum, val) => sum + val, 0) / values.length
});
console.log('Sales by Product:', salesByProduct);

// Normalize the sales data
const { data: normalizedData } = herta.tabularAnalysis.normalize(salesData, ['sales', 'units']);
console.log('Normalized Data:', normalizedData);

// One-hot encode categorical variables
const encodedData = herta.tabularAnalysis.oneHotEncode(salesData, ['region', 'product']);
console.log('Encoded Data (first row):', encodedData[0]);
```

## Herta Erudition CLI

Herta.js comes with a powerful CLI tool called "Erudition" that helps you scaffold, analyze, test, document, and understand the framework.

### Installation

The CLI is automatically available when you install herta:

```bash
npm install herta
```

After installation, you can access the CLI globally:

```bash
herta erudition <command> [options]
```

### Available Commands

#### Scaffolding with `make`

```bash
# Create a new module
herta erudition make module QuantumPhysics

# Create a new controller
herta erudition make controller UserController

# Create a new service
herta erudition make service DataService

# Create a new test
herta erudition make test Vector
```

#### Analyzing Code with `analyze`

```bash
# General analysis
herta erudition analyze

# Specific analysis types
herta erudition analyze --complexity
herta erudition analyze --dependencies
```

#### Generating Documentation with `doc`

```bash
# Document a specific module
herta erudition doc matrix

# Generate all documentation
herta erudition doc --all
```

#### Running Tests with `test`

```bash
# Run all tests
herta erudition test

# Run with coverage
herta erudition test --coverage

# Run specific tests
herta erudition test matrix.test.js
```

#### Understanding the Framework with `explain`

```bash
# Explain configuration options
herta erudition explain config

# Explain algorithms used
herta erudition explain algorithms

# Explain specific modules
herta erudition explain module:neuralNetworks
```

## Project Structure

```
herta/
├── bin/              # CLI tools
├── commands/         # CLI command implementations
│   └── erudition/    # Erudition CLI commands
├── src/
│   ├── core/         # Core mathematical functionality
│   ├── advanced/     # Advanced mathematical capabilities
│   ├── utils/        # Utility functions
│   └── index.js      # Main entry point
├── test/             # Test suite
└── examples/         # Usage examples
```

## Advanced Mathematical Capabilities

Herta.js offers a comprehensive suite of mathematical capabilities that set it apart from other frameworks:

1. **Advanced Symbolic Integration**: Solve complex integrals with sophisticated techniques
2. **Differential Equation Solving**: Analytical and numerical solutions for ODEs and PDEs
3. **Large-Scale Linear Algebra**: Optimized for high-performance numerical computing
4. **Symbolic Tensor Calculus**: Support for tensor operations used in physics
5. **Automatic Differentiation**: Compute gradients for machine learning applications
6. **Numerical Methods**: Advanced root-finding, optimization, and interpolation algorithms
7. **Statistical Analysis**: Comprehensive statistical functions for data analysis
8. **Quantum Computing**: Full quantum circuit simulation and quantum algorithm implementation
9. **Symbolic Computation**: Powerful symbolic mathematics for algebraic manipulation
10. **Scientific Mode**: Specialized functions for research with higher precision
11. **Optimization**: Gradient descent, Newton's method, linear programming, and particle swarm optimization
12. **Geometry**: Computational geometry, vector operations, coordinate transformations, and convex hull algorithms
13. **Signal Processing**: FFT implementations, window functions, filter design, convolution, and wavelet transforms
14. **Machine Learning**: Activation functions, loss functions, dimensionality reduction, and clustering algorithms
15. **Topology**: Topological space operations, homology groups, and simplicial complex generation
16. **Financial Mathematics**: Option pricing models, portfolio metrics, bond calculations, and risk analysis
17. **Discrete Mathematics**: Combinatorial functions, permutations, combinations, and recurrence relation solvers
18. **Dynamical Systems**: Iteration, bifurcation diagrams, fixed points, and fractal dimensions
19. **Group Theory**: Group operations, symmetry groups, representation theory, and algebraic structures
20. **Information Theory**: Shannon entropy, mutual information, channel capacity, and coding algorithms
21. **Game Theory**: Nash equilibria, Shapley values, evolutionary dynamics, and cooperative game solutions
22. **Algebraic Geometry**: Polynomial systems, varieties, Gröbner bases, and resultant calculations
23. **Differential Geometry**: Riemannian metrics, curvature tensors, Christoffel symbols, geodesic equations, Lie derivatives, holonomy calculations, and frame fields
24. **Category Theory**: Categories, functors, natural transformations, adjunctions, universal properties, limits, and colimits
25. **Complex Analysis**: Analytic functions, contour integration, residue theory, conformal mappings, and Laurent series expansion
26. **Group Theory**: Group operations, representations, automorphisms, crystallographic wallpaper groups, and quaternion groups
27. **Algebraic Geometry**: Varieties, Gröbner bases, elliptic curves with group law, toric varieties, blowups, and sheaf cohomology
28. **Numerical Methods**: Adaptive integration, Gaussian quadrature, Monte Carlo methods, finite difference PDE solvers, spectral methods, and stochastic differential equations
29. **Number Theory**: Advanced prime factorization with Pollard's rho, Diophantine equation solvers, Chinese remainder theorem, continued fractions, quadratic residues, Euler's totient function, and Möbius function
30. **Graph Theory**: Directed and undirected graph operations, minimum spanning trees, shortest paths, centrality measures, community detection, maximum flow, graph coloring, cycle detection, and topological sorting
31. **Topology**: Topological spaces, equivalence relations, homology groups, persistent homology, Betti numbers, manifold operations, and triangulations
32. **Group Theory**: Abstract groups, group homomorphisms, Cayley tables, matrix representations, crystallographic wallpaper groups, automorphisms, and quaternion groups
33. **Optimization**: Gradient descent, newton methods, genetic algorithms, simulated annealing, differential evolution, particle swarm optimization, and constrained optimization with COBYLA
34. **Chaos Theory**: Lyapunov exponents, fractal dimensions, bifurcation diagrams, Mandelbrot and Julia sets, Lorenz attractor, and recurrence plots
35. **Quantum Mechanics**: Quantum state vectors, density matrices, von Neumann entropy, common quantum gates, and tensor products
36. **Fluid Dynamics**: Reynolds number calculations, Navier-Stokes solvers, pressure drop, head loss, advection-diffusion equations, and Mach number
37. **String Algorithms**: Knuth-Morris-Pratt, Boyer-Moore, and Rabin-Karp pattern matching, suffix arrays, Levenshtein distance, and LCS
38. **Probability Theory**: Binomial, Poisson, normal, and exponential distributions, statistical tests, Monte Carlo integration, and regression analysis
39. **Computer Vision**: Image processing filters, edge detection, feature extraction, keypoint matching, Hough transforms, and image segmentation
25. **Cryptography**: Secure encryption, hashing, and cryptographic primitives
26. **Category Theory**: Category operations and functorial mappings
27. **Combinatorics**: Permutation, combination, and advanced counting techniques
28. **Time Series Analysis**: Tools for analyzing temporal data patterns
29. **Chaos Theory**: Fractal generation and chaotic system analysis

## Scientific Computing Features

Herta.js provides specialized features for scientific computing:

### Scientific Mode

```javascript
// Create a scientific instance with higher precision
const scientific = herta.scientific();

// Use Fourier transform capabilities
const signal = [1, 2, 3, 4, 5, 6, 7, 8];
const spectrum = scientific.fourier.dft(signal);
const reconstructed = scientific.fourier.idft(spectrum);
```

### Numerical and Advanced Methods

```javascript
// Root finding with Newton's method
const root = herta.numerical.roots.newton('x^2 - 4', 1);

// Solve differential equations
const solution = herta.numerical.ode.rk4('y - x', 0, 1, 10, 100);

// Optimization with gradient descent
const costFunction = (x) => x[0]**2 + x[1]**2;
const gradientFunction = (x) => [2*x[0], 2*x[1]];
const minimum = herta.optimization.gradientDescent(costFunction, gradientFunction, [1, 1]);

// Fast Fourier Transform for signal processing
const signal = [1, 2, 3, 4, 5, 6, 7, 8];
const spectrum = herta.signalProcessing.fft(signal);
const reconstructed = herta.signalProcessing.ifft(spectrum);

// Computational geometry
const points = [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]];
const convexHull = herta.geometry.convexHull(points);

// Machine learning with k-means clustering
const data = [[1, 2], [1, 4], [1, 0], [4, 2], [4, 4], [4, 0]];
const clusters = herta.machineLearning.kmeans(data, 2);

// Dynamical systems analysis
const logisticMap = x => 3.9 * x * (1 - x);
const orbit = herta.dynamicalSystems.iterate(logisticMap, 0.5, 100);
const lyapunov = herta.dynamicalSystems.lyapunovExponent(logisticMap, 0.5, 1000);

// Group theory operations
const cyclicGroup = herta.groupTheory.cyclicGroup(8);
const cayleyTable = herta.groupTheory.cayleyTable(cyclicGroup.elements, cyclicGroup.operation);
const quaternions = herta.groupTheory.quaternionGroup();
const representation = herta.groupTheory.createRepresentation(cyclicGroup.elements, cyclicGroup.operation, 
  element => [[Math.cos(2*Math.PI*element/8), -Math.sin(2*Math.PI*element/8)], 
              [Math.sin(2*Math.PI*element/8), Math.cos(2*Math.PI*element/8)]]);
const wallpaper = herta.groupTheory.wallpaperGroup('p4m');

// Information theory calculations
const probabilities = [0.5, 0.25, 0.125, 0.125];
const entropy = herta.informationTheory.entropy(probabilities);
const huffmanCode = herta.informationTheory.huffmanCoding(['A', 'B', 'C', 'D'], probabilities);

// Game theory analysis
const prisonersDilemma = [
  [[3, 3], [0, 5]],
  [[5, 0], [1, 1]]
];
const equilibria = herta.gameTheory.findPureNashEquilibria(prisonersDilemma[0], prisonersDilemma[1]);

// Algebraic geometry computations
const circle = herta.algebraicGeometry.polynomial({'x^2': 1, 'y^2': 1, '': -1}, ['x', 'y']);
const line = herta.algebraicGeometry.polynomial({'x': 1, 'y': 1, '': -1}, ['x', 'y']);
const intersections = herta.algebraicGeometry.curvesIntersection(circle, line);
const ellipticCurve = herta.algebraicGeometry.ellipticCurve(-3, 2); // y^2 = x^3 - 3x + 2
const P = [1, 0];
const Q = [2, 3];
const R = ellipticCurve.addPoints(P, Q); // Point addition on elliptic curve
const toricRays = [[1,0], [0,1], [-1,0], [0,-1]];
const toricCones = [[0,1], [1,2], [2,3], [3,0]];
const toricVariety = herta.algebraicGeometry.toricVariety(toricRays, toricCones);

// Advanced numerical methods
const integral = herta.numerical.integrate.adaptiveSimpson(x => Math.sin(x) * Math.exp(-x), 0, 10);
const mcIntegral = herta.numerical.integrate.monteCarlo(function(x, y) { 
  return Math.sin(x) * Math.cos(y); 
}, [0, 0], [Math.PI, Math.PI], 10000);

// PDE solution using finite differences
const heat2d = herta.numerical.pde.heat2d(
  (x, y) => Math.exp(-(x*x + y*y)), // Initial temperature
  (x, y, t) => 0, // Boundary condition
  -2, 2, -2, 2, 0.5, 0.1, 0.1, 0.001, 0.5
);

// Solve stochastic differential equation (geometric Brownian motion)
const gbm = herta.numerical.sde.eulerMaruyama(
  (x, t) => 0.1 * x, // Drift term
  (x, t) => 0.2 * x, // Diffusion term
  1.0, // Initial value
  0, 1, 0.01, 5 // From t=0 to t=1 with 5 sample paths
);

// Advanced number theory operations
const primes = herta.numberTheory.generatePrimes(1000);
const largeNumberFactors = herta.numberTheory.fastFactorize(987654321);
const phi = herta.numberTheory.eulerTotient(120); // Euler's totient function

// Solving a Diophantine equation: 5x + 7y = 31
const dioSolution = herta.numberTheory.solveDiophantine(5, 7, 31);

// Chinese remainder theorem solving system of congruences
const crSolution = herta.numberTheory.chineseRemainderTheorem([2, 3, 2], [3, 5, 7]);

// Converting a fraction to continued fraction
const contFrac = herta.numberTheory.toContinuedFraction(415, 93); // 4.462...
const convergents = herta.numberTheory.continuedFractionConvergents(contFrac);

// Generating primitive Pythagorean triples
const pythTriples = herta.numberTheory.primitivePythagoreanTriples(100);

// Differential geometry calculations
const sphereMetric = [[1, 0], [0, Math.sin(u)*Math.sin(u)]];
const christoffel = herta.differentialGeometry.christoffelSymbols(sphereMetric, ['u', 'v']);
const gaussianCurv = herta.differentialGeometry.ricciScalar(sphereMetric, ['u', 'v']);
const geodesicPath = herta.differentialGeometry.geodesic(sphereMetric, [0, 0], [Math.PI/2, Math.PI/2]);
const frame = herta.differentialGeometry.createFrameField(sphereMetric, ['u', 'v']);
const transportedVector = herta.differentialGeometry.parallelTransport(sphereMetric, [1, 0], geodesicPath);

// Category theory structures
const setCategory = herta.categoryTheory.createCategory(['A', 'B'], {
  'A->B': { domain: 'A', codomain: 'B', compose: f => f }
});
const functorF = herta.categoryTheory.createFunctor(setCategory, setCategory, 
  obj => obj, morphism => morphism);

// Complex analysis
const z = herta.complexAnalysis.complex(3, 4);
const w = z.exp();
const mobius = herta.complexAnalysis.conformalMappings.mobius(
  herta.complexAnalysis.complex(1, 0),
  herta.complexAnalysis.complex(0, 1),
  herta.complexAnalysis.complex(0, 0),
  herta.complexAnalysis.complex(1, 0)
);

// Topological data analysis
const simplicialComplex = herta.topology.simplicialComplex([[0, 1], [1, 2], [2, 0]]);

// Financial mathematics
const optionPrice = herta.financialMath.blackScholes('call', 100, 100, 0.05, 0.2, 1);

// Discrete mathematics
const combinations = herta.discreteMath.combinations([1, 2, 3, 4, 5], 3);
```

### Statistical Analysis

```javascript
// Descriptive statistics
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const mean = herta.statistics.descriptive.mean(data);
const stdDev = herta.statistics.descriptive.standardDeviation(data);

// Hypothesis testing
const tTest = herta.statistics.hypothesis.tTest(data, 5);

// Time series analysis
const movingAvg = herta.statistics.timeSeries.movingAverage(data, 3);

// Bayesian inference
const posterior = herta.statistics.bayesian.posteriorDistribution(prior, likelihood, data);
```

### Quantum Computing

```javascript
// Create a quantum register with 3 qubits
const qreg = herta.quantum.register.create(3);

// Apply quantum gates to create a GHZ state
const ghz = herta.quantum.circuit.createGHZ(qreg);

// Apply quantum gates
const hadamardState = herta.quantum.gates.hadamard(qreg, 0);
const cnotState = herta.quantum.gates.cnot(hadamardState, 0, 1);
const toffoliState = herta.quantum.gates.toffoli(cnotState, 0, 1, 2);

// Run Shor's algorithm for integer factorization
const factors = herta.quantum.algorithms.shor(15);

// Run Grover's search algorithm
const database = [0, 1, 2, 3, 4, 5, 6, 7];
const searchResult = herta.quantum.algorithms.grover(database, x => x === 3);

// Quantum Fourier Transform
const qft = herta.quantum.transforms.qft(qreg);

// Measure the quantum state
const measurement = herta.quantum.measurement.measure(qreg);
```

### Symbolic Computation

```javascript
// Symbolic differentiation
const derivative = herta.symbolic.calculus.diff('x^2 + 2*x + 1', 'x');

// Symbolic integration
const integral = herta.symbolic.calculus.integrate('x^2', 'x');

// Solve equations symbolically
const solution = herta.symbolic.solve.equations('x^2 - 4 = 0', 'x');

// Number theory operations
const primes = herta.numberTheory.generatePrimes(1000);
const factors = herta.numberTheory.factorize(120);
const fastFactors = herta.numberTheory.fastFactorize(987654321); // Using Pollard's rho algorithm
const gcd = herta.numberTheory.gcd(48, 18);
const [d, x, y] = herta.numberTheory.extendedGcd(17, 23); // 17x + 23y = 1
const phi = herta.numberTheory.eulerTotient(36); // φ(36) = 12

// Solving a Diophantine equation: 5x + 7y = 31
const solution = herta.numberTheory.solveDiophantine(5, 7, 31);
console.log(solution.particular); // {x: -2, y: 6}

// Chinese remainder theorem
const crt = herta.numberTheory.chineseRemainderTheorem([2, 3, 2], [3, 5, 7]); // x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)

// Continued fractions
const contFrac = herta.numberTheory.toContinuedFraction(415, 93); // [4, 2, 6, 7]
const convergents = herta.numberTheory.continuedFractionConvergents(contFrac); // Approximations converging to 415/93

// Finding quadratic residues modulo a prime
const qResidues = herta.numberTheory.quadraticResidues(11); // [0, 1, 3, 4, 5, 9]

// Graph theory operations
// Create a directed graph
const directedGraph = herta.graph.create({ directed: true, weighted: true });
directedGraph.addEdge('A', 'B', 5);
directedGraph.addEdge('B', 'C', 3);
directedGraph.addEdge('A', 'C', 10);

// Find shortest paths from A to all other vertices
const paths = herta.graph.algorithms.dijkstra(directedGraph, 'A');
console.log(paths.distances); // {A: 0, B: 5, C: 8}

// Calculate centrality measures
const centrality = herta.graph.algorithms.centrality(directedGraph);
console.log(centrality.betweenness); // Betweenness centrality for each vertex

// Create an undirected graph for a social network
const socialGraph = herta.graph.create({ directed: false });
socialGraph.addEdge('Alice', 'Bob');
socialGraph.addEdge('Bob', 'Charlie');
socialGraph.addEdge('Charlie', 'David');
socialGraph.addEdge('David', 'Alice');
socialGraph.addEdge('Alice', 'Eve');
socialGraph.addEdge('Eve', 'Charlie');

// Detect communities in the network
const communities = herta.graph.advanced.communityDetectionLouvain(socialGraph);
console.log(communities.assignments); // Community assignment for each person

// Find critical nodes (articulation points) in the network
const cutVertices = herta.graph.advanced.articulationPoints(socialGraph);

// Color the graph efficiently
const coloring = herta.graph.advanced.colorGraph(socialGraph);

// Group theory operations
const dihedral8 = herta.groupTheory.dihedralGroup(4); // D4 group
const isGroup = herta.groupTheory.isGroup(dihedral8.elements, dihedral8.operation);
const cayleyTable = herta.groupTheory.cayleyTable(dihedral8.elements, dihedral8.operation);

// Create a wallpaper group (crystallographic plane group)
const p6m = herta.groupTheory.wallpaperGroup('p6m');
const pattern = p6m.generatePattern((x, y) => ({ type: 'hexagon', center: [x, y] }), -5, 5, -5, 5);

// Create a matrix representation of a group
const quaternions = herta.groupTheory.quaternionGroup();
const qRepresentation = herta.groupTheory.createRepresentation(
  quaternions.elements,
  quaternions.operation,
  (q) => q.matrix // Each quaternion has a 2x2 complex matrix representation
);

// Topology operations
const torus = herta.topology.manifold('torus', 2);
console.log(torus.eulerCharacteristic);  // 0
console.log(torus.fundamentalGroup);     // Z × Z

// Compute Betti numbers of a simplicial complex
const torusComplex = herta.topology.triangulateManifold('torus', 20);
const betti = herta.topology.betti(torusComplex);  // [1, 2, 1] for a torus

// Persistent homology for data analysis
const points = [[0,0], [1,0], [0,1], [1,1], [0.5, 0.5]]; // Point cloud
const distFn = (a, b) => Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2); // Euclidean distance
const vr = herta.topology.vietorisRipsComplex(points, distFn, 2.0, 20);
const ph = herta.topology.persistentHomology(vr);
const barcodes = herta.topology.persistenceBarcodes(ph);

// Optimization examples

// Gradient descent for function minimization
const costFunction = (x) => x[0]**2 + x[1]**2; // Simple quadratic function
const gradientFunction = (x) => [2*x[0], 2*x[1]]; // Gradient of the cost function
const result = herta.optimization.gradientDescent(costFunction, gradientFunction, [10, 10]);

// Simulated annealing for traveling salesman problem
const cities = [[0,0], [1,2], [3,1], [5,2], [6,0], [4,-2], [2,-1]];
const tspCost = (route) => {
  let cost = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const city1 = cities[route[i]];
    const city2 = cities[route[i+1]];
    cost += Math.sqrt((city1[0]-city2[0])**2 + (city1[1]-city2[1])**2);
  }
  // Add distance back to start
  const lastCity = cities[route[route.length-1]];
  const firstCity = cities[route[0]];
  cost += Math.sqrt((lastCity[0]-firstCity[0])**2 + (lastCity[1]-firstCity[1])**2);
  return cost;
};

const neighborFn = (route) => {
  // Create a neighbor by swapping two cities
  const newRoute = [...route];
  const i = Math.floor(Math.random() * route.length);
  let j = Math.floor(Math.random() * route.length);
  while (j === i) j = Math.floor(Math.random() * route.length);
  [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
  return newRoute;
};

const tspResult = herta.optimization.simulatedAnnealing(
  tspCost, 
  neighborFn, 
  [0, 1, 2, 3, 4, 5, 6], // Initial route visiting cities in order
  {initialTemperature: 100, coolingRate: 0.95}
);

// Genetic algorithm for binary optimization
const createBinaryIndividual = () => Array.from({length: 20}, () => Math.random() > 0.5 ? 1 : 0);
const binaryCrossover = (parent1, parent2) => {
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
  const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)];
  return [child1, child2];
};
const binaryMutate = (individual) => {
  const mutated = [...individual];
  const position = Math.floor(Math.random() * mutated.length);
  mutated[position] = 1 - mutated[position]; // Flip the bit
  return mutated;
};
const binaryFitness = (individual) => individual.reduce((sum, bit) => sum + bit, 0); // Count 1's

const gaResult = herta.optimization.geneticAlgorithm(
  binaryFitness,
  createBinaryIndividual,
  binaryCrossover,
  binaryMutate,
  {populationSize: 50, maxGenerations: 100}
);

// Chaos Theory examples

// Calculate Lyapunov exponent for the logistic map
const logisticMap = (x) => 3.9 * x * (1 - x);
const lyapunov = herta.chaosTheory.lyapunovExponent(logisticMap, 0.5, {iterations: 5000});
console.log(`Lyapunov exponent: ${lyapunov}`); // Positive for chaotic behavior

// Generate bifurcation diagram for logistic map
const bifurcationPoints = herta.chaosTheory.bifurcationDiagram(
  (x, r) => r * x * (1 - x),  // Logistic map with parameter r
  {rStart: 2.8, rEnd: 4.0, rSteps: 500, iterations: 300}
);

// Generate Mandelbrot set
const mandelbrotData = herta.chaosTheory.mandelbrotSet({
  width: 500, 
  height: 500, 
  xMin: -2.0, 
  xMax: 1.0, 
  maxIterations: 1000
});

// Plot Lorenz attractor
const lorenzTrajectory = herta.chaosTheory.lorenzAttractor({
  sigma: 10,
  rho: 28,
  beta: 8/3,
  dt: 0.01,
  duration: 50
});

// Calculate fractal dimension using box counting method
const isMandelbrotSet = (x, y) => {
  let zx = 0, zy = 0;
  for (let i = 0; i < 100; i++) {
    const zx2 = zx * zx, zy2 = zy * zy;
    if (zx2 + zy2 > 4) return false;
    zy = 2 * zx * zy + y;
    zx = zx2 - zy2 + x;
  }
  return true;
};

const fractalDimension = herta.chaosTheory.boxCountingDimension(
  isMandelbrotSet,
  {xMin: -2.0, xMax: 1.0, yMin: -1.5, yMax: 1.5},
  {minBoxSize: 0.01, maxBoxSize: 0.5}
);

// Quantum Mechanics examples

// Create a quantum state (|0⟩ + |1⟩)/√2
const superposition = herta.quantumMechanics.createState([
  1/Math.sqrt(2),
  1/Math.sqrt(2)
]);

// Apply Hadamard gate
const hadamardState = herta.quantumMechanics.applyGate(
  superposition, 
  herta.quantumMechanics.gates.H
);

// Create a bell state (entangled state)
const qubit0 = herta.quantumMechanics.createState([1, 0]); // |0⟩
const hadamard0 = herta.quantumMechanics.applyGate(qubit0, herta.quantumMechanics.gates.H);
const bellState = herta.quantumMechanics.applyGate(
  herta.quantumMechanics.tensorProduct(hadamard0, qubit0),
  herta.quantumMechanics.gates.CNOT
);

// Fluid Dynamics examples

// Calculate Reynolds number for water in a pipe
const density = 997; // kg/m^3 (water)
const velocity = 2.5; // m/s
const diameter = 0.05; // 5 cm pipe
const viscosity = 0.001; // kg/(m·s) (water at 20°C)
const reynolds = herta.fluidDynamics.reynoldsNumber(density, velocity, diameter, viscosity);
console.log(`Reynolds number: ${reynolds}`);

// Calculate pressure drop in a pipe
const frictionFactor = 0.02; // Darcy friction factor
const pipeLength = 10; // meters
const pressureDrop = herta.fluidDynamics.pressureDrop(
  frictionFactor, pipeLength, diameter, density, velocity
);
console.log(`Pressure drop: ${pressureDrop} Pa`);

// Simulate 1D advection-diffusion of a heat pulse
const initialTemp = Array(100).fill(0);
// Create a temperature pulse in the middle
for (let i = 40; i < 60; i++) initialTemp[i] = 100;
const diffusionResult = herta.fluidDynamics.diffusion1D(
  initialTemp, 0.01, 0.1, 0.001, 1.0
);

// String Algorithms examples

// Calculate Levenshtein distance between two strings
const distance = herta.stringAlgorithms.levenshteinDistance("kitten", "sitting");
console.log(`Edit distance: ${distance}`); // 3

// Find the longest common subsequence
const lcs = herta.stringAlgorithms.longestCommonSubsequence(
  "ABCDEFGHIJ", "ACDEGHIJK"
);
console.log(`LCS: ${lcs}`); // "ACDEGHIJ"

// Find pattern matches using KMP algorithm
const text = "ABABDABACDABABCABAB";
const pattern = "ABABC";
const matches = herta.stringAlgorithms.kmpSearch(text, pattern);
console.log(`Pattern found at indices: ${matches}`); // [10]

// Compress using run-length encoding
const compressed = herta.stringAlgorithms.runLengthEncode("AAABBBCCCDAA");
console.log(`Compressed: ${compressed}`); // "A3B3C3DA2"

// Probability Theory examples

// Calculate binomial probability
const prob = herta.probabilityTheory.binomialPMF(8, 12, 0.6);
console.log(`P(X=8 | n=12, p=0.6) = ${prob.toFixed(4)}`);

// Generate normal random samples
const samples = herta.probabilityTheory.normalRandom(1000, 5, 2);
const stats = herta.probabilityTheory.sampleStatistics(samples);
console.log(`Sample mean: ${stats.mean.toFixed(2)}, stdDev: ${stats.stdDev.toFixed(2)}`);

// Perform hypothesis testing
const testData = [5.2, 5.4, 4.9, 6.1, 5.5, 5.8, 5.3, 5.7];
const testResult = herta.probabilityTheory.tTest(testData, 5.0);
console.log(`t-statistic: ${testResult.statistic.toFixed(2)}, p-value: ${testResult.pValue.toFixed(4)}`);

// Simple linear regression
const xData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const yData = [2, 3.5, 5, 6.2, 7.8, 8.5, 10, 11.2, 12.8, 13.5];
const regression = herta.probabilityTheory.linearRegression(xData, yData);
console.log(`Slope: ${regression.slope.toFixed(2)}, Intercept: ${regression.intercept.toFixed(2)}, R²: ${regression.rSquared.toFixed(2)}`);

// Computer Vision examples

// Convert RGB image to grayscale
const rgbImage = Array(100).fill().map(() => Array(100).fill().map(() => [120, 80, 200]));
const grayscale = herta.computerVision.rgbToGrayscale(rgbImage);

// Detect edges using Canny edge detector
const blurred = herta.computerVision.gaussianBlur(grayscale, 1.5);
const edges = herta.computerVision.cannyEdgeDetection(blurred, 30, 100);

// Detect keypoints for feature matching
const { keypoints, descriptors } = herta.computerVision.detectKeypoints(grayscale);
console.log(`Detected ${keypoints.length} keypoints`);

// Segment an image using K-means clustering
const segmentation = herta.computerVision.segmentImage(rgbImage, 5);
console.log(`Image segmented into 5 color clusters`);
```

## Specialized Modules

Herta.js includes several specialized modules for advanced mathematical and scientific computing. Here are examples of some particularly powerful modules:

### Optimization Module

```javascript
// Classical optimization
const result = herta.optimization.gradientDescent({
  objective: (x) => Math.pow(x[0], 2) + Math.pow(x[1], 2),
  gradient: (x) => [2 * x[0], 2 * x[1]],
  initialParams: [10, 10],
  learningRate: 0.1,
  maxIterations: 100
});

// Metaheuristic optimization
const geneticResult = herta.optimization.geneticAlgorithm({
  fitnessFunction: (chromosome) => -Math.pow(chromosome[0], 2) - Math.pow(chromosome[1], 2),
  chromosomeLength: 2,
  populationSize: 50,
  generations: 100
});

// Linear programming with simplex method
const lpResult = herta.optimization.simplexMethod({
  objective: [3, 4], // Maximize 3x + 4y
  constraints: [
    [1, 2],  // x + 2y ≤ 14
    [3, -1], // 3x - y ≤ 0
    [1, -1]  // x - y ≤ 2
  ],
  rhs: [14, 0, 2],
  maximize: true
});
```

### Graph Theory Module

```javascript
const graph = herta.graph.createUndirectedGraph();

// Add vertices and edges
['A', 'B', 'C', 'D', 'E'].forEach(v => graph.addVertex(v));
graph.addEdge('A', 'B', { weight: 2 });
graph.addEdge('B', 'C', { weight: 1 });
graph.addEdge('C', 'D', { weight: 3 });
graph.addEdge('D', 'E', { weight: 1 });
graph.addEdge('A', 'E', { weight: 5 });

// Find shortest path
const path = herta.graph.shortestPath(graph, 'A', 'D');
console.log(path.vertices, path.distance);

// Find minimum spanning tree
const mst = herta.graph.minimumSpanningTree(graph, 'kruskal');

// Calculate centrality measures
const degreeCentrality = herta.graph.degreeCentrality(graph);
const betweennessCentrality = herta.graph.betweennessCentrality(graph);

// Detect communities
const communities = herta.graph.communityDetection(graph, 'louvain');
```

### Number Theory Module

```javascript
// Fast prime factorization
const factors = herta.numberTheory.primeFactorize(12345678);

// Extended Euclidean Algorithm
const { gcd, x, y } = herta.numberTheory.extendedGCD(123, 456);
// This gives Bézout coefficients x, y such that: x*123 + y*456 = gcd

// Chinese Remainder Theorem
const solution = herta.numberTheory.chineseRemainderTheorem([3, 4, 5], [5, 7, 9]);
// Finds x such that: x ≡ 3 (mod 5), x ≡ 4 (mod 7), x ≡ 5 (mod 9)

// Euler's Totient Function
const totient = herta.numberTheory.eulerTotient(60);

// Generate primitive Pythagorean triples
const triples = herta.numberTheory.primitivePythagoreanTriples(100);
```

### String Algorithms Module

```javascript
// Pattern matching algorithms
const text = "This is a test string for pattern matching";
const pattern = "pattern";

const kmpMatches = herta.stringAlgorithms.kmpSearch(text, pattern);
const boyerMooreMatches = herta.stringAlgorithms.boyerMooreSearch(text, pattern);
const rabinKarpMatches = herta.stringAlgorithms.rabinKarpSearch(text, pattern);

// String similarity and distance
const str1 = "kitten";
const str2 = "sitting";
const editDistance = herta.stringAlgorithms.levenshteinDistance(str1, str2);
const lcs = herta.stringAlgorithms.longestCommonSubsequence(str1, str2);
const similarity = herta.stringAlgorithms.stringSimilarity(str1, str2);

// Suffix arrays
const suffixArray = herta.stringAlgorithms.buildSuffixArray("banana");
const longestRepeated = herta.stringAlgorithms.longestRepeatedSubstring("banana");

// String compression
const compressed = herta.stringAlgorithms.runLengthEncode("aaabbbcccaaabbbaaabbbcccaaa");
```

### Quantum Mechanics Module

```javascript
// Create quantum states
const state = herta.quantum.createState([1/Math.sqrt(2), 1/Math.sqrt(2)]);

// Apply quantum gates
const xGateState = herta.quantum.applyGate('X', herta.quantum.createState([1, 0]));
const hadamardState = herta.quantum.applyGate('H', herta.quantum.createState([1, 0]));

// Apply custom rotation
const rotatedState = herta.quantum.applyRotation(
  herta.quantum.createState([1, 0]), 
  Math.PI/2, 
  [0, 0, 1]
);

// Tensor product of quantum states
const combinedState = herta.quantum.tensorProduct(
  herta.quantum.createState([1, 0]),
  herta.quantum.createState([0, 1])
);

// Quantum measurements and entropy
const bellState = herta.quantum.createState([1/Math.sqrt(2), 0, 0, 1/Math.sqrt(2)]);
const entropy = herta.quantum.vonNeumannEntropy(bellState);
```

### Computer Vision Module

```javascript
// Image processing fundamentals
const grayscale = herta.computerVision.rgbToGrayscale(image);
const blurred = herta.computerVision.gaussianBlur(grayscale, 5, 1.4);
const equalized = herta.computerVision.histogramEqualization(grayscale);

// Edge detection
const sobelEdges = herta.computerVision.sobelEdgeDetection(grayscale);
const cannyEdges = herta.computerVision.cannyEdgeDetection(grayscale, 30, 100);

// Feature detection and matching
const corners = herta.computerVision.fastCornerDetection(grayscale, 20, 0.8);
const keypoints = herta.computerVision.detectKeypoints(grayscale);
const descriptors = herta.computerVision.computeDescriptors(grayscale, keypoints);
const matches = herta.computerVision.matchFeatures(descriptors1, descriptors2, 0.7);

// Advanced algorithms
const circles = herta.computerVision.houghCircleDetection(grayscale, 10, 30);
const segments = herta.computerVision.kmeansSegmentation(image, 5);
```

### Probability Theory Module

```javascript
// Probability distributions
const binomialPmf = herta.probabilityTheory.binomial.pmf(10, 0.5, 6);
const binomialCdf = herta.probabilityTheory.binomial.cdf(10, 0.5, 6);
const poissonPmf = herta.probabilityTheory.poisson.pmf(3, 4);
const normalPdf = herta.probabilityTheory.normal.pdf(0, 1, 0.5);

// Random sampling
const normalSamples = herta.probabilityTheory.normal.sample(0, 1, 100);
const exponentialSamples = herta.probabilityTheory.exponential.sample(0.5, 50);

// Hypothesis testing
const tTestResult = herta.probabilityTheory.tTest(sample1, sample2);
console.log(`p-value: ${tTestResult.pValue}, t-statistic: ${tTestResult.tStat}`);

// Monte Carlo integration
const integral = herta.probabilityTheory.monteCarloIntegration(
  (x) => Math.sin(x) * Math.exp(-x*x/2), 
  0, Math.PI, 
  10000
);
```

### Fluid Dynamics Module

```javascript
// Basic fluid properties calculations
const reynoldsNumber = herta.fluidDynamics.reynoldsNumber({
  velocity: 2,     // m/s
  diameter: 0.05,  // m
  density: 1000,   // kg/m^3
  viscosity: 0.001 // Pa·s
});

// Calculate friction factor using Colebrook-White equation
const frictionFactor = herta.fluidDynamics.colebrookWhite({
  reynoldsNumber: 100000,
  relativeRoughness: 0.0001
});

// Calculate pressure drop in a pipe
const pressureDrop = herta.fluidDynamics.pressureDrop({
  frictionFactor: 0.02,
  length: 10,       // m
  diameter: 0.05,   // m
  density: 1000,    // kg/m^3
  velocity: 2       // m/s
});

// 1D fluid simulation
const simulation = herta.fluidDynamics.createAdvectionDiffusionSolver({
  length: 10,        // domain length
  nodes: 100,        // number of grid points
  diffusivity: 0.01, // diffusion coefficient
  velocity: 0.5      // advection velocity
});

// Run simulation for 100 time steps
const results = simulation.solve(initialCondition, 100);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
