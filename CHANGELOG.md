# Changelog

All notable changes to the Herta.js framework will be documented in this file.

## [1.3.5] - 2025-05-21

### Enhanced
- Improved user experience of project creation:
  - Cleaned up console output to reduce warning messages during normal operation
  - Added clearer instructions for getting started with new projects
  - Updated "npm install" guidance in post-creation instructions
  - Simplified output for improved readability

### Other
- Minor code refactoring and improvements
- Updated documentation to reflect recent changes

## [1.3.4] - 2025-05-21

### Fixed
- Ultimate protection for project file copying:
  - Added absolute handling for all edge cases in make.js
  - Made the project creation system bulletproof against all copying failures
  - Implemented runtime verification to confirm proper file copying
  - Enhanced content validation to ensure file integrity after copying

### Enhanced
- Final polish of the project creation command to guarantee reliability
- Expanded debugging output for troubleshooting project creation issues
- Streamlined user experience for project creation workflows

## [1.3.3] - 2025-05-21

### Fixed
- Completely rebuilt the project creation system with foolproof file copying:
  - Implemented triple-redundant copying methods for critical files (server.js, index.js, setup.js)
  - Added verification process to ensure all critical files are properly copied
  - Fixed root file copying to prevent missing files in new projects
  - Added content verification to confirm files aren't empty after copying
  - Implemented automatic recovery for any missing files
  - Fixed issues with empty directories in new projects
  - Added special handling for src files like autodiff

### Enhanced
- Improved root file copying with expanded list of configuration files
- Added three separate copying methods with cascading fallbacks:
  - Direct file content read/write
  - Node.js filesystem API
  - System cp command as final fallback
- Better error reporting during project creation process
- Added visual verification of all copied source files
- Ensured proper handling of package.json to maintain script references

## [1.3.2] - 2025-05-21

### Fixed
- Completely rewrote the project creation command in erudition make.js to correctly:
  - Copy all existing files and directories to new projects
  - Preserve original package.json structure including scripts
  - Maintain server.js references in npm scripts
  - Handle empty directories appropriately during copying
  - Improve error handling during project creation

### Enhanced
- Streamlined project creation workflow with proper file copying
- Improved dependency installation process
- Added better console output during project creation

## [1.3.1] - 2025-05-21

### Fixed
- Completely rewrote the graph module in the Herta.js framework to fix multiple issues:
  - Corrected graph creation and properties (directed/undirected, weighted edges, metadata)
  - Fixed Dijkstra's algorithm implementation for shortest path finding
  - Improved Minimum Spanning Tree algorithms (both Prim's and Kruskal's implementations)
  - Enhanced Floyd-Warshall algorithm for all-pairs shortest paths
  - Optimized Community detection using the Louvain method
  - Fixed network analysis functions including centrality measures
  - Corrected articulation points and bridge detection

### Enhanced
- Updated the project creation functionality in the erudition make command to better preserve existing files
- Improved package structure with more intuitive organization
- Enhanced server.js example for better API demonstration

## [1.3.0] - 2025-05-21

### Added
- Expanded physics modules with additional quantum mechanics functionality
- Enhanced cryptoeconomics modules for blockchain analysis
- Added tensor contraction operations for advanced matrix calculations
- Improved documentation for all core modules

## [1.2.7] - 2025-05-21

### Enhanced
- Added sample advanced math modules to project templates
- Included sample graph utility showcasing the graph module functionality
- Updated installation instructions to always run npm install before npm start
- Created comprehensive project structure with math extensions
- Improved folder structure to include src/math and src/advanced directories

## [1.2.6] - 2025-05-21

### Enhanced
- Improved project creation workflow to automatically install dependencies
- Updated project template to use the latest Herta.js version (1.2.5+)
- Changed project instructions to use `npm start` instead of `node app.js`
- Better developer experience with simpler setup process

## [1.2.5] - 2025-05-21

### Fixed
- Fixed project creation template with correct string escaping in app.js
- Resolved issues with empty source directories in new projects
- Improved project scaffolding to ensure all necessary files are created

## [1.2.4] - 2025-05-21

### Fixed
- Fixed project creation command by properly escaping template literals in the generated code
- Resolved 'operation is not defined' error when creating new projects
- Improved error handling in the make command

## [1.2.3] - 2025-05-21

### Changed
- Updated documentation to improve clarity and organization
- Moved all changelog information to CHANGELOG.md for better maintainability
- Improved README structure for better readability

## [1.2.2] - 2025-05-21

### Added
- Completely rewrote the graph module with enhanced functionality:
  - Improved implementation of Dijkstra's algorithm for shortest paths
  - Added Minimum Spanning Tree algorithms (Prim's and Kruskal's)
  - Implemented Floyd-Warshall algorithm for all-pairs shortest paths
  - Added community detection using the Louvain method
  - Incorporated network analysis functions including centrality measures
  - Added articulation points and bridge detection

### Fixed
- Enhanced package.json exports configuration to explicitly expose all directories (src, bin, commands, dist, examples)
- Improved import capabilities for consumers of the library
- Better support for direct imports from all package directories

## [1.2.1] - 2025-05-21

### Fixed
- Fixed npm installation issue by properly exposing source files
- Added proper module field and exports configuration to package.json
- Improved compatibility for projects importing the library

## [1.2.0] - 2025-05-21

### Added
- Enhanced CLI with improved help command handling
- Support for standard CLI flags (--help, -h, --version, -v)
- Better command-line error reporting

### Changed
- Updated documentation for clearer API examples
- Improved CLI output formatting

## [1.1.0] - 2025-05-21

### Added
- Units conversion system in `utils/units.js`
- Advanced fraction operations in `core/fraction.js`
- Random number generation in `utils/random.js`
- Mathematical sequence generators in `utils/generators.js`
- Jest configuration for better test organization

### Fixed
- Graph module completely rewritten with correct implementations of:
  - Graph creation and properties (directed/undirected, weighted edges, metadata)
  - Dijkstra's algorithm for shortest path finding
  - Minimum Spanning Tree algorithms (both Prim's and Kruskal's implementations)
  - Floyd-Warshall algorithm for all-pairs shortest paths
  - Community detection using the Louvain method
  - Network analysis functions including centrality measures
  - Articulation points and bridge detection
- Fixed module import paths after restructuring
- Resolved test failures in `commands/erudition/test.js`

### Changed
- Complete codebase restructuring for better organization:
  - Core mathematical operations in `/core`
  - Algebraic operations in `/algebra`
  - Calculus operations in `/calculus`
  - Discrete mathematics in `/discrete`
  - Statistical operations in `/statistics` 
  - Geometric operations in `/geometry`
  - Optimization algorithms in `/optimization`
  - Physics models in `/physics` 
  - Cryptography in `/crypto`
  - Utility functions in `/utils`
  - Applied mathematics in `/applied`
  - Advanced specialized modules in `/advanced`
- Updated main entry point to target the built distribution file

## [1.0.0] - Initial Release

- Initial version of Herta.js framework
