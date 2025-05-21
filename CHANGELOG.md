# Changelog

All notable changes to the Herta.js framework will be documented in this file.

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
