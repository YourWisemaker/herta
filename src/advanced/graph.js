/**
 * graph.js
 * Advanced graph theory operations and network analysis for Herta.js
 */

/**
 * Create a new graph
 * @param {Object} options - Graph creation options
 * @param {Boolean} options.directed - Whether the graph is directed (default: false)
 * @param {Boolean} options.weighted - Whether the graph is weighted (default: true)
 * @returns {Object} - A new graph object
 */
function create(options = {}) {
  const { directed = false, weighted = true } = options;
  
  return {
    vertices: new Set(),
    edges: new Map(),
    directed: directed,
    weighted: weighted,
    // Store metadata about vertices (like labels, coordinates, etc.)
    vertexProperties: new Map(),
    // Store metadata about edges
    edgeProperties: new Map(),
    
    /**
     * Add a vertex to the graph
     * @param {*} vertex - The vertex to add
     * @param {Object} properties - Optional properties for the vertex
     */
    addVertex(vertex, properties = {}) {
      this.vertices.add(vertex);
      if (!this.edges.has(vertex)) {
        this.edges.set(vertex, new Map());
      }
      this.vertexProperties.set(vertex, properties);
    },
    
    /**
     * Add an edge between two vertices
     * @param {*} source - Source vertex
     * @param {*} target - Target vertex
     * @param {Number} weight - Edge weight (default: 1)
     * @param {Object} properties - Optional properties for the edge
     */
    addEdge(source, target, weight = 1, properties = {}) {
      this.addVertex(source);
      this.addVertex(target);
      
      this.edges.get(source).set(target, weight);
      
      // For undirected graphs, add the reverse edge
      if (!this.directed) {
        this.edges.get(target).set(source, weight);
      }
      
      // Store edge properties
      const edgeKey = `${source}-${target}`;
      this.edgeProperties.set(edgeKey, properties);
      
      if (!this.directed) {
        const reverseEdgeKey = `${target}-${source}`;
        this.edgeProperties.set(reverseEdgeKey, properties);
      }
    },
    
    /**
     * Remove a vertex from the graph
     * @param {*} vertex - The vertex to remove
     */
    removeVertex(vertex) {
      if (!this.vertices.has(vertex)) return;
      
      // Remove all edges connected to this vertex
      this.edges.delete(vertex);
      this.vertices.delete(vertex);
      this.vertexProperties.delete(vertex);
      
      // Remove edges where this vertex is the target
      for (const [source, targets] of this.edges.entries()) {
        if (targets.has(vertex)) {
          targets.delete(vertex);
          const edgeKey = `${source}-${vertex}`;
          this.edgeProperties.delete(edgeKey);
        }
      }
    },
    
    /**
     * Remove an edge from the graph
     * @param {*} source - Source vertex
     * @param {*} target - Target vertex
     */
    removeEdge(source, target) {
      if (!this.edges.has(source)) return;
      
      this.edges.get(source).delete(target);
      const edgeKey = `${source}-${target}`;
      this.edgeProperties.delete(edgeKey);
      
      // For undirected graphs, remove the reverse edge
      if (!this.directed && this.edges.has(target)) {
        this.edges.get(target).delete(source);
        const reverseEdgeKey = `${target}-${source}`;
        this.edgeProperties.delete(reverseEdgeKey);
      }
    },
    
    /**
     * Get all vertices in the graph
     * @returns {Array} - Array of vertices
     */
    getVertices() {
      return Array.from(this.vertices);
    },
    
    /**
     * Get all edges in the graph as [source, target, weight] arrays
     * @returns {Array} - Array of edges
     */
    getEdges() {
      const edges = [];
      for (const [source, targets] of this.edges.entries()) {
        for (const [target, weight] of targets.entries()) {
          // For undirected graphs, only include each edge once
          if (this.directed || source < target) {
            edges.push([source, target, weight]);
          }
        }
      }
      return edges;
    },
    
    /**
     * Get all neighbors of a vertex
     * @param {*} vertex - The vertex to get neighbors for
     * @returns {Array} - Array of neighboring vertices
     */
    getNeighbors(vertex) {
      if (!this.edges.has(vertex)) return [];
      return Array.from(this.edges.get(vertex).keys());
    },
    
    /**
     * Get all in-neighbors of a vertex (vertices that have edges pointing to this vertex)
     * @param {*} vertex - The vertex to get in-neighbors for
     * @returns {Array} - Array of in-neighboring vertices
     */
    getInNeighbors(vertex) {
      if (!this.directed) return this.getNeighbors(vertex);
      
      const inNeighbors = [];
      for (const [source, targets] of this.edges.entries()) {
        if (targets.has(vertex)) {
          inNeighbors.push(source);
        }
      }
      return inNeighbors;
    },
    
    /**
     * Get the weight of an edge
     * @param {*} source - Source vertex
     * @param {*} target - Target vertex
     * @returns {Number} - Edge weight or Infinity if edge doesn't exist
     */
    getWeight(source, target) {
      if (!this.edges.has(source) || !this.edges.get(source).has(target)) {
        return Infinity;
      }
      return this.edges.get(source).get(target);
    },
    
    /**
     * Get the degree of a vertex (number of connected edges)
     * @param {*} vertex - The vertex to get degree for
     * @returns {Number} - Vertex degree
     */
    getDegree(vertex) {
      if (!this.edges.has(vertex)) return 0;
      return this.edges.get(vertex).size;
    },
    
    /**
     * Get the in-degree of a vertex (number of incoming edges)
     * @param {*} vertex - The vertex to get in-degree for
     * @returns {Number} - Vertex in-degree
     */
    getInDegree(vertex) {
      if (!this.directed) return this.getDegree(vertex);
      return this.getInNeighbors(vertex).length;
    },
    
    /**
     * Get the out-degree of a vertex (number of outgoing edges)
     * @param {*} vertex - The vertex to get out-degree for
     * @returns {Number} - Vertex out-degree
     */
    getOutDegree(vertex) {
      if (!this.directed) return this.getDegree(vertex);
      if (!this.edges.has(vertex)) return 0;
      return this.edges.get(vertex).size;
    },
    
    /**
     * Check if two vertices are adjacent (have an edge between them)
     * @param {*} source - Source vertex
     * @param {*} target - Target vertex
     * @returns {Boolean} - True if vertices are adjacent
     */
    isAdjacent(source, target) {
      if (!this.edges.has(source)) return false;
      return this.edges.get(source).has(target);
    },
    
    /**
     * Create a deep copy of the graph
     * @returns {Object} - A new graph with the same structure
     */
    clone() {
      const newGraph = create({ directed: this.directed, weighted: this.weighted });
      
      // Clone vertices with properties
      for (const vertex of this.vertices) {
        newGraph.addVertex(vertex, {...this.vertexProperties.get(vertex)});
      }
      
      // Clone edges with weights and properties
      for (const [source, targets] of this.edges.entries()) {
        for (const [target, weight] of targets.entries()) {
          // For undirected graphs, only add each edge once
          if (this.directed || source < target) {
            const edgeKey = `${source}-${target}`;
            const properties = this.edgeProperties.has(edgeKey) ? 
              {...this.edgeProperties.get(edgeKey)} : {};
            newGraph.addEdge(source, target, weight, properties);
          }
        }
      }
      
      return newGraph;
    },
    
    /**
     * Get the number of vertices in the graph
     * @returns {Number} - Number of vertices
     */
    vertexCount() {
      return this.vertices.size;
    },
    
    /**
     * Get the number of edges in the graph
     * @returns {Number} - Number of edges
     */
    edgeCount() {
      let count = 0;
      for (const targets of this.edges.values()) {
        count += targets.size;
      }
      
      // For undirected graphs, each edge is counted twice
      return this.directed ? count : count / 2;
    },
    
    /**
     * Check if the graph is connected (there's a path between any two vertices)
     * @returns {Boolean} - True if the graph is connected
     */
    isConnected() {
      if (this.vertices.size === 0) return true;
      const start = this.getVertices()[0];
      const visited = algorithms.bfs(this, start);
      return visited.length === this.vertices.size;
    },
    
    /**
     * Get a representation of the graph as an adjacency matrix
     * @returns {Object} - Adjacency matrix and vertex mapping
     */
    toAdjacencyMatrix() {
      const vertices = this.getVertices();
      const n = vertices.length;
      const matrix = Array(n).fill().map(() => Array(n).fill(Infinity));
      const vertexToIndex = new Map();
      
      // Create mapping from vertices to matrix indices
      vertices.forEach((vertex, i) => {
        vertexToIndex.set(vertex, i);
        matrix[i][i] = 0; // Distance to self is 0
      });
      
      // Fill the matrix with edge weights
      for (const [source, targets] of this.edges.entries()) {
        const i = vertexToIndex.get(source);
        for (const [target, weight] of targets.entries()) {
          const j = vertexToIndex.get(target);
          matrix[i][j] = weight;
        }
      }
      
      return { matrix, vertexToIndex };
    },
    
    /**
     * Get a representation of the graph as an adjacency list
     * @returns {Object} - Adjacency list representation
     */
    toAdjacencyList() {
      const adjList = {};
      
      for (const vertex of this.vertices) {
        adjList[vertex] = [];
        if (this.edges.has(vertex)) {
          for (const [neighbor, weight] of this.edges.get(vertex).entries()) {
            adjList[vertex].push({ vertex: neighbor, weight });
          }
        }
      }
      
      return adjList;
    }
  };
}

/**
 * Graph algorithms and metrics
 */
const algorithms = {
  /**
   * Dijkstra's shortest path algorithm
   * @param {Object} graph - The graph to traverse
   * @param {*} start - Starting vertex
   * @param {*} end - Ending vertex (optional, if not provided computes paths to all vertices)
   * @returns {Object} - Object with distances and paths
   */
  dijkstra(graph, start, end) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(graph.getVertices());
    
    // Initialize distances
    for (const vertex of unvisited) {
      distances.set(vertex, vertex === start ? 0 : Infinity);
    }
    
    while (unvisited.size > 0) {
      // Find vertex with minimum distance
      let current = null;
      let minDistance = Infinity;
      
      for (const vertex of unvisited) {
        const distance = distances.get(vertex);
        if (distance < minDistance) {
          minDistance = distance;
          current = vertex;
        }
      }
      
      // No more paths exist
      if (current === null || distances.get(current) === Infinity) break;
      
      // Reached the end and we're only looking for a specific end
      if (end !== undefined && current === end) break;
      
      // Remove current from unvisited
      unvisited.delete(current);
      
      // Update distances to neighbors
      for (const neighbor of graph.getNeighbors(current)) {
        const alt = distances.get(current) + graph.getWeight(current, neighbor);
        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
        }
      }
    }
    
    // If we're looking for a path to a specific end, reconstruct it
    if (end !== undefined) {
      const path = [];
      let current = end;
      
      if (previous.has(end) || current === start) {
        while (current !== undefined) {
          path.unshift(current);
          current = previous.get(current);
        }
      }
      
      return {
        distance: distances.get(end),
        path: path
      };
    }
    
    // Otherwise return all distances and paths
    const paths = {};
    for (const vertex of graph.getVertices()) {
      if (vertex === start || !previous.has(vertex)) {
        paths[vertex] = vertex === start ? [start] : [];
        continue;
      }
      
      const path = [];
      let current = vertex;
      while (current !== undefined) {
        path.unshift(current);
        current = previous.get(current);
      }
      paths[vertex] = path;
    }
    
    return {
      distances: Object.fromEntries(distances),
      paths: paths
    };
  },
  
  /**
   * Floyd-Warshall algorithm for all-pairs shortest paths
   * @param {Object} graph - The graph to analyze
   * @returns {Object} - Distance matrix and path reconstruction information
   */
  floydWarshall(graph) {
    const { matrix, vertexToIndex } = graph.toAdjacencyMatrix();
    const n = matrix.length;
    const next = Array(n).fill().map(() => Array(n).fill(null));
    
    // Initialize next matrix for path reconstruction
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && matrix[i][j] < Infinity) {
          next[i][j] = j;
        }
      }
    }
    
    // Main Floyd-Warshall algorithm
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][k] + matrix[k][j] < matrix[i][j]) {
            matrix[i][j] = matrix[i][k] + matrix[k][j];
            next[i][j] = next[i][k];
          }
        }
      }
    }
    
    // Convert back to vertex representation
    const indexToVertex = new Map();
    for (const [vertex, index] of vertexToIndex.entries()) {
      indexToVertex.set(index, vertex);
    }
    
    // Create helper function to reconstruct paths
    function getPath(i, j) {
      if (next[i][j] === null) return [];
      
      const path = [indexToVertex.get(i)];
      let current = i;
      
      while (current !== j) {
        current = next[current][j];
        path.push(indexToVertex.get(current));
      }
      
      return path;
    }
    
    return {
      distances: matrix,
      getPath,
      vertexToIndex,
      indexToVertex
    };
  },
  
  /**
   * Breadth-first search
   * @param {Object} graph - The graph to traverse
   * @param {*} start - Starting vertex
   * @returns {Array} - Vertices in BFS order
   */
  bfs(graph, start) {
    const visited = new Set([start]);
    const queue = [start];
    const result = [];
    
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);
      
      for (const neighbor of graph.getNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    
    return result;
  },
  
  /**
   * Depth-first search
   * @param {Object} graph - The graph to traverse
   * @param {*} start - Starting vertex
   * @param {Function} onVisit - Optional callback when visiting a vertex
   * @param {Function} onExploreFinish - Optional callback when exploration of a vertex finishes
   * @returns {Object} - Object with results and discovery/finish times
   */
  dfs(graph, start, onVisit, onExploreFinish) {
    const visited = new Set();
    const result = [];
    const discoveryTime = new Map();
    const finishTime = new Map();
    let time = 0;
    
    function dfsVisit(vertex) {
      visited.add(vertex);
      time++;
      discoveryTime.set(vertex, time);
      result.push(vertex);
      
      if (onVisit) onVisit(vertex, time);
      
      for (const neighbor of graph.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          dfsVisit(neighbor);
        }
      }
      
      time++;
      finishTime.set(vertex, time);
      if (onExploreFinish) onExploreFinish(vertex, time);
    }
    
    dfsVisit(start);
    
    return {
      visited: result,
      discoveryTime: Object.fromEntries(discoveryTime),
      finishTime: Object.fromEntries(finishTime)
    };
  },
  
  /**
   * Run DFS on entire graph, including disconnected components
   * @param {Object} graph - The graph to traverse
   * @param {Function} onVisit - Optional callback when visiting a vertex
   * @param {Function} onExploreFinish - Optional callback when exploration of a vertex finishes
   * @returns {Object} - DFS results including forest structure
   */
  dfsForest(graph, onVisit, onExploreFinish) {
    const visited = new Set();
    const forest = [];
    const discoveryTime = new Map();
    const finishTime = new Map();
    let time = 0;
    
    function dfsVisit(vertex, tree) {
      visited.add(vertex);
      time++;
      discoveryTime.set(vertex, time);
      tree.push(vertex);
      
      if (onVisit) onVisit(vertex, time);
      
      for (const neighbor of graph.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          dfsVisit(neighbor, tree);
        }
      }
      
      time++;
      finishTime.set(vertex, time);
      if (onExploreFinish) onExploreFinish(vertex, time);
    }
    
    // Visit all vertices, creating a new tree for each unvisited vertex
    for (const vertex of graph.getVertices()) {
      if (!visited.has(vertex)) {
        const tree = [];
        dfsVisit(vertex, tree);
        forest.push(tree);
      }
    }
    
    return {
      forest,
      discoveryTime: Object.fromEntries(discoveryTime),
      finishTime: Object.fromEntries(finishTime)
    };
  },
  
  /**
   * Prim's algorithm for minimum spanning tree
   * @param {Object} graph - The graph to analyze
   * @param {*} start - Starting vertex (optional)
   * @returns {Object} - Minimum spanning tree as a graph object
   */
  minimumSpanningTreePrim(graph, start) {
    if (graph.getVertices().length === 0) return create();
    
    const vertices = graph.getVertices();
    start = start || vertices[0];
    
    const mst = create({ directed: false, weighted: true });
    const visited = new Set([start]);
    const edges = [];
    
    // Add all edges from start to priority queue
    for (const neighbor of graph.getNeighbors(start)) {
      edges.push([start, neighbor, graph.getWeight(start, neighbor)]);
    }
    
    // Sort edges by weight
    edges.sort((a, b) => a[2] - b[2]);
    
    // Add start to MST
    mst.addVertex(start);
    
    while (edges.length > 0 && visited.size < vertices.length) {
      // Get edge with minimum weight
      const [source, target, weight] = edges.shift();
      
      // Skip if target already visited
      if (visited.has(target)) continue;
      
      // Add target to visited set
      visited.add(target);
      
      // Add edge to MST
      mst.addVertex(target);
      mst.addEdge(source, target, weight);
      
      // Add all edges from target to priority queue
      for (const neighbor of graph.getNeighbors(target)) {
        if (!visited.has(neighbor)) {
          edges.push([target, neighbor, graph.getWeight(target, neighbor)]);
        }
      }
      
      // Re-sort edges by weight
      edges.sort((a, b) => a[2] - b[2]);
    }
    
    return mst;
  },
  
  /**
   * Kruskal's algorithm for minimum spanning tree
   * @param {Object} graph - The graph to analyze
   * @returns {Object} - Minimum spanning tree as a graph object
   */
  minimumSpanningTreeKruskal(graph) {
    const mst = create({ directed: false, weighted: true });
    const vertices = graph.getVertices();
    
    // Add all vertices to MST
    for (const vertex of vertices) {
      mst.addVertex(vertex);
    }
    
    // Get all edges and sort by weight
    const edges = graph.getEdges().sort((a, b) => a[2] - b[2]);
    
    // Disjoint-set data structure for cycle detection
    const parent = new Map();
    const rank = new Map();
    
    // Initialize disjoint-set
    for (const vertex of vertices) {
      parent.set(vertex, vertex);
      rank.set(vertex, 0);
    }
    
    // Find root of a set
    function find(x) {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x))); // Path compression
      }
      return parent.get(x);
    }
    
    // Union two sets
    function union(x, y) {
      const rootX = find(x);
      const rootY = find(y);
      
      if (rootX === rootY) return;
      
      // Union by rank
      if (rank.get(rootX) < rank.get(rootY)) {
        parent.set(rootX, rootY);
      } else if (rank.get(rootX) > rank.get(rootY)) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rank.get(rootX) + 1);
      }
    }
    
    // Process edges in ascending order of weight
    for (const [source, target, weight] of edges) {
      // Check if adding this edge creates a cycle
      if (find(source) !== find(target)) {
        mst.addEdge(source, target, weight);
        union(source, target);
      }
    }
    
    return mst;
  },
  
  /**
   * Calculate centrality measures for the graph
   * @param {Object} graph - The graph to analyze
   * @returns {Object} - Various centrality measures
   */
  centrality(graph) {
    const vertices = graph.getVertices();
    const n = vertices.length;
    
    // Degree centrality
    const degreeCentrality = {};
    for (const vertex of vertices) {
      degreeCentrality[vertex] = graph.getDegree(vertex) / (n - 1);
    }
    
    // Closeness centrality
    const closenessCentrality = {};
    for (const vertex of vertices) {
      const { distances } = this.dijkstra(graph, vertex);
      let sum = 0;
      let reachableCount = 0;
      
      for (const target of vertices) {
        if (vertex !== target) {
          const dist = distances[target];
          if (dist !== Infinity) {
            sum += dist;
            reachableCount++;
          }
        }
      }
      
      // Normalize the result
      closenessCentrality[vertex] = reachableCount > 0 ? reachableCount / ((n - 1) * sum) : 0;
    }
    
    // Betweenness centrality (simplified version)
    const betweennessCentrality = {};
    for (const vertex of vertices) {
      betweennessCentrality[vertex] = 0;
    }
    
    // For each pair of vertices, calculate shortest paths
    for (const source of vertices) {
      const { paths } = this.dijkstra(graph, source);
      
      for (const target of vertices) {
        if (source !== target) {
          const path = paths[target];
          
          // For each intermediate vertex in the path
          for (let i = 1; i < path.length - 1; i++) {
            const intermediate = path[i];
            betweennessCentrality[intermediate] += 1;
          }
        }
      }
    }
    
    // Normalize betweenness scores
    const normFactor = (n - 1) * (n - 2);
    for (const vertex of vertices) {
      betweennessCentrality[vertex] /= normFactor;
    }
    
    // Eigenvector centrality (power iteration method)
    const eigenCentrality = {};
    const maxIterations = 100;
    const tolerance = 1e-6;
    
    // Initialize with equal values
    for (const vertex of vertices) {
      eigenCentrality[vertex] = 1 / n;
    }
    
    let converged = false;
    let iteration = 0;
    
    while (!converged && iteration < maxIterations) {
      const newCentrality = {};
      let norm = 0;
      
      // Update centrality scores
      for (const vertex of vertices) {
        newCentrality[vertex] = 0;
        
        for (const neighbor of graph.getNeighbors(vertex)) {
          newCentrality[vertex] += eigenCentrality[neighbor];
        }
        
        norm += newCentrality[vertex] * newCentrality[vertex];
      }
      
      // Normalize to prevent overflow
      norm = Math.sqrt(norm);
      for (const vertex of vertices) {
        newCentrality[vertex] /= norm;
      }
      
      // Check convergence
      let diff = 0;
      for (const vertex of vertices) {
        diff += Math.abs(newCentrality[vertex] - eigenCentrality[vertex]);
      }
      
      converged = diff < tolerance;
      
      // Update centrality values
      for (const vertex of vertices) {
        eigenCentrality[vertex] = newCentrality[vertex];
      }
      
      iteration++;
    }
    
    return {
      degree: degreeCentrality,
      closeness: closenessCentrality,
      betweenness: betweennessCentrality,
      eigenvector: eigenCentrality
    };
  },
  
  /**
   * Calculate clustering coefficient for a vertex or the entire graph
   * @param {Object} graph - The graph to analyze
   * @param {*} vertex - Optional vertex to calculate coefficient for
   * @returns {Number|Object} - Clustering coefficient or object with coefficients
   */
  clusteringCoefficient(graph, vertex) {
    // Function to calculate local clustering coefficient
    function localCoefficient(v) {
      const neighbors = graph.getNeighbors(v);
      const k = neighbors.length;
      
      if (k < 2) return 0; // No triangle possible with less than 2 neighbors
      
      let triangles = 0;
      
      // Check every pair of neighbors for a connection
      for (let i = 0; i < k; i++) {
        for (let j = i + 1; j < k; j++) {
          if (graph.isAdjacent(neighbors[i], neighbors[j])) {
            triangles++;
          }
        }
      }
      
      // Return the ratio of connected triplets to possible triplets
      return (2 * triangles) / (k * (k - 1));
    }
    
    // Calculate for a single vertex
    if (vertex !== undefined) {
      return localCoefficient(vertex);
    }
    
    // Calculate for all vertices
    const coefficients = {};
    let sum = 0;
    
    for (const v of graph.getVertices()) {
      coefficients[v] = localCoefficient(v);
      sum += coefficients[v];
    }
    
    // Add global coefficient
    coefficients.global = sum / graph.vertexCount();
    
    return coefficients;
  }
};

// More specialized graph algorithms
const advanced = {
  /**
   * Detect communities in a graph using the Louvain method
   * @param {Object} graph - The graph to analyze
   * @param {Number} resolution - Resolution parameter (higher values lead to smaller communities)
   * @returns {Object} - Community assignments and modularity score
   */
  communityDetectionLouvain(graph, resolution = 1.0) {
    // Initialize each vertex in its own community
    const vertices = graph.getVertices();
    let communities = {};
    let vertexToCommunity = {};
    
    for (const vertex of vertices) {
      communities[vertex] = [vertex];
      vertexToCommunity[vertex] = vertex;
    }
    
    // Calculate initial modularity
    function modularity() {
      const m = graph.edgeCount() * 2; // Total edge weight (each edge counted twice for undirected)
      let q = 0;
      
      for (const [community, members] of Object.entries(communities)) {
        for (const v1 of members) {
          for (const v2 of members) {
            const actual = graph.isAdjacent(v1, v2) ? graph.getWeight(v1, v2) : 0;
            const expected = graph.getDegree(v1) * graph.getDegree(v2) / m;
            q += (actual - resolution * expected);
          }
        }
      }
      
      return q / m;
    }
    
    let currentModularity = modularity();
    let improvement = true;
    
    // Phase 1: Optimize modularity by moving vertices between communities
    while (improvement) {
      improvement = false;
      
      for (const vertex of vertices) {
        const currentCommunity = vertexToCommunity[vertex];
        const neighborCommunities = new Set();
        
        // Find all neighboring communities
        for (const neighbor of graph.getNeighbors(vertex)) {
          neighborCommunities.add(vertexToCommunity[neighbor]);
        }
        
        // Try moving to each neighboring community
        let bestGain = 0;
        let bestCommunity = currentCommunity;
        
        for (const community of neighborCommunities) {
          if (community === currentCommunity) continue;
          
          // Move vertex to this community temporarily
          communities[currentCommunity] = communities[currentCommunity].filter(v => v !== vertex);
          communities[community].push(vertex);
          vertexToCommunity[vertex] = community;
          
          // Calculate new modularity
          const newModularity = modularity();
          const gain = newModularity - currentModularity;
          
          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = community;
          }
          
          // Move back to original community
          communities[community] = communities[community].filter(v => v !== vertex);
          communities[currentCommunity].push(vertex);
          vertexToCommunity[vertex] = currentCommunity;
        }
        
        // If there's a positive gain, make the move permanent
        if (bestGain > 0 && bestCommunity !== currentCommunity) {
          communities[currentCommunity] = communities[currentCommunity].filter(v => v !== vertex);
          communities[bestCommunity].push(vertex);
          vertexToCommunity[vertex] = bestCommunity;
          currentModularity += bestGain;
          improvement = true;
        }
      }
    }
    
    // Phase 2: Create a new graph where communities are vertices
    // This would normally be performed to continue the algorithm hierarchically,
    // but we'll skip that for simplicity and just return the first level communities
    
    // Clean up empty communities
    for (const community of Object.keys(communities)) {
      if (communities[community].length === 0) {
        delete communities[community];
      }
    }
    
    // Renumber communities for cleaner output
    const communityMapping = {};
    const result = {
      communities: {},
      assignments: {},
      modularity: currentModularity
    };
    
    let idx = 0;
    for (const [oldId, members] of Object.entries(communities)) {
      communityMapping[oldId] = idx;
      result.communities[idx] = [...members];
      for (const member of members) {
        result.assignments[member] = idx;
      }
      idx++;
    }
    
    return result;
  },
  
  /**
   * Detect strongly connected components in a directed graph using Kosaraju's algorithm
   * @param {Object} graph - The directed graph to analyze
   * @returns {Array} - Array of strongly connected components (each component is an array of vertices)
   */
  stronglyConnectedComponents(graph) {
    if (!graph.directed) {
      throw new Error('This algorithm is only applicable to directed graphs');
    }
    
    const vertices = graph.getVertices();
    const visited = new Set();
    const finishOrder = [];
    const components = [];
    
    // First DFS to order vertices by finish time
    function dfs1(vertex) {
      visited.add(vertex);
      
      for (const neighbor of graph.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          dfs1(neighbor);
        }
      }
      
      finishOrder.push(vertex);
    }
    
    // Second DFS on the transpose graph
    function dfs2(vertex, component) {
      visited.add(vertex);
      component.push(vertex);
      
      for (const neighbor of graph.getInNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          dfs2(neighbor, component);
        }
      }
    }
    
    // Run first DFS
    for (const vertex of vertices) {
      if (!visited.has(vertex)) {
        dfs1(vertex);
      }
    }
    
    // Reset visited set for second pass
    visited.clear();
    
    // Run second DFS in reverse order of finish time
    for (let i = finishOrder.length - 1; i >= 0; i--) {
      const vertex = finishOrder[i];
      if (!visited.has(vertex)) {
        const component = [];
        dfs2(vertex, component);
        components.push(component);
      }
    }
    
    return components;
  },
  
  /**
   * Find articulation points (cut vertices) in an undirected graph
   * @param {Object} graph - The undirected graph to analyze
   * @returns {Array} - Array of articulation points
   */
  articulationPoints(graph) {
    if (graph.directed) {
      throw new Error('This algorithm is only applicable to undirected graphs');
    }
    
    const vertices = graph.getVertices();
    const visited = new Set();
    const disc = {}; // Discovery time
    const low = {};  // Earliest visited vertex reachable from subtree
    const parent = {};
    const artPoints = new Set();
    let time = 0;
    
    function dfs(u) {
      visited.add(u);
      disc[u] = low[u] = ++time;
      let children = 0;
      
      for (const v of graph.getNeighbors(u)) {
        if (!visited.has(v)) {
          children++;
          parent[v] = u;
          
          dfs(v);
          
          low[u] = Math.min(low[u], low[v]);
          
          // u is an articulation point if
          // (1) u is root and has at least two children
          if (parent[u] === undefined && children > 1) {
            artPoints.add(u);
          }
          
          // (2) u is not root and the lowest vertex in the subtree of v is not
          // reachable from any ancestor of u
          if (parent[u] !== undefined && low[v] >= disc[u]) {
            artPoints.add(u);
          }
        } else if (v !== parent[u]) {
          // Back edge: update low value of u
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    }
    
    // Call DFS for each unvisited vertex
    for (const vertex of vertices) {
      if (!visited.has(vertex)) {
        dfs(vertex);
      }
    }
    
    return Array.from(artPoints);
  },
  
  /**
   * Find bridges (cut edges) in an undirected graph
   * @param {Object} graph - The undirected graph to analyze
   * @returns {Array} - Array of bridges as [u, v] pairs
   */
  bridges(graph) {
    if (graph.directed) {
      throw new Error('This algorithm is only applicable to undirected graphs');
    }
    
    const vertices = graph.getVertices();
    const visited = new Set();
    const disc = {}; // Discovery time
    const low = {};  // Earliest visited vertex reachable from subtree
    const parent = {};
    const bridges = [];
    let time = 0;
    
    function dfs(u) {
      visited.add(u);
      disc[u] = low[u] = ++time;
      
      for (const v of graph.getNeighbors(u)) {
        if (!visited.has(v)) {
          parent[v] = u;
          
          dfs(v);
          
          low[u] = Math.min(low[u], low[v]);
          
          // If the lowest vertex in the subtree of v is below v in the DFS tree,
          // then u-v is a bridge
          if (low[v] > disc[u]) {
            bridges.push([u, v]);
          }
        } else if (v !== parent[u]) {
          // Back edge: update low value of u
          low[u] = Math.min(low[u], disc[v]);
        }
      }
    }
    
    // Call DFS for each unvisited vertex
    for (const vertex of vertices) {
      if (!visited.has(vertex)) {
        dfs(vertex);
      }
    }
    
    return bridges;
  },
  
  /**
   * Topological sort of a directed acyclic graph (DAG)
   * @param {Object} graph - The directed acyclic graph to sort
   * @returns {Array} - Topologically sorted vertices or null if graph has cycles
   */
  topologicalSort(graph) {
    if (!graph.directed) {
      throw new Error('Topological sort is only applicable to directed graphs');
    }
    
    const vertices = graph.getVertices();
    const visited = new Set();
    const temp = new Set();  // For cycle detection
    const order = [];
    let hasCycle = false;
    
    function visit(vertex) {
      if (temp.has(vertex)) {
        // Cycle detected
        hasCycle = true;
        return;
      }
      
      if (visited.has(vertex)) return;
      
      temp.add(vertex);
      
      for (const neighbor of graph.getNeighbors(vertex)) {
        visit(neighbor);
      }
      
      temp.delete(vertex);
      visited.add(vertex);
      order.unshift(vertex); // Add to front
    }
    
    for (const vertex of vertices) {
      if (!visited.has(vertex) && !hasCycle) {
        visit(vertex);
      }
    }
    
    return hasCycle ? null : order;
  },
  
  /**
   * Ford-Fulkerson algorithm for maximum flow problem
   * @param {Object} graph - The directed graph to analyze
   * @param {*} source - Source vertex
   * @param {*} sink - Sink vertex
   * @returns {Object} - Maximum flow value and flow for each edge
   */
  maxFlow(graph, source, sink) {
    if (!graph.directed) {
      throw new Error('Max flow is only applicable to directed graphs');
    }
    
    // Create residual graph
    const residual = graph.clone();
    
    // Add reverse edges with zero capacity
    for (const [u, v, w] of graph.getEdges()) {
      if (!residual.isAdjacent(v, u)) {
        residual.addEdge(v, u, 0);
      }
    }
    
    // Initialize flow
    const flow = {};
    for (const [u, v] of residual.getEdges()) {
      flow[`${u}-${v}`] = 0;
    }
    
    // Function to find an augmenting path using BFS
    function findPath() {
      const visited = new Set();
      const queue = [source];
      const parent = {};
      
      visited.add(source);
      
      while (queue.length > 0 && !visited.has(sink)) {
        const u = queue.shift();
        
        for (const v of residual.getNeighbors(u)) {
          const capacity = residual.getWeight(u, v);
          
          if (!visited.has(v) && capacity > 0) {
            parent[v] = u;
            visited.add(v);
            queue.push(v);
            
            if (v === sink) break;
          }
        }
      }
      
      if (!visited.has(sink)) return null;
      
      // Reconstruct path
      const path = [];
      let current = sink;
      
      while (current !== source) {
        path.unshift([parent[current], current]);
        current = parent[current];
      }
      
      return path;
    }
    
    // Find augmenting paths and update flow
    let path;
    let maxFlowValue = 0;
    
    while ((path = findPath()) !== null) {
      // Find minimum capacity along the path
      let minCapacity = Infinity;
      
      for (const [u, v] of path) {
        minCapacity = Math.min(minCapacity, residual.getWeight(u, v));
      }
      
      // Update residual capacities and flow
      for (const [u, v] of path) {
        // Update forward edge
        const forwardCap = residual.getWeight(u, v) - minCapacity;
        residual.edges.get(u).set(v, forwardCap);
        
        // Update reverse edge
        const reverseCap = residual.getWeight(v, u) + minCapacity;
        residual.edges.get(v).set(u, reverseCap);
        
        // Update flow
        const edgeKey = `${u}-${v}`;
        const reverseKey = `${v}-${u}`;
        
        if (flow[edgeKey] !== undefined) {
          flow[edgeKey] = (flow[edgeKey] || 0) + minCapacity;
        }
        
        if (flow[reverseKey] !== undefined) {
          flow[reverseKey] = Math.max(0, (flow[reverseKey] || 0) - minCapacity);
        }
      }
      
      maxFlowValue += minCapacity;
    }
    
    // Filter flow to include only original edges
    const originalFlow = {};
    for (const [u, v, w] of graph.getEdges()) {
      originalFlow[`${u}-${v}`] = flow[`${u}-${v}`] || 0;
    }
    
    return {
      maxFlow: maxFlowValue,
      flow: originalFlow
    };
  },
  
  /**
   * Graph coloring algorithm using greedy approach
   * @param {Object} graph - The graph to color
   * @returns {Object} - Vertex to color mapping and number of colors used
   */
  colorGraph(graph) {
    const vertices = graph.getVertices();
    const coloring = {};
    
    for (const vertex of vertices) {
      // Get colors of neighbors
      const neighborColors = new Set();
      for (const neighbor of graph.getNeighbors(vertex)) {
        if (coloring[neighbor] !== undefined) {
          neighborColors.add(coloring[neighbor]);
        }
      }
      
      // Find smallest available color
      let color = 0;
      while (neighborColors.has(color)) {
        color++;
      }
      
      coloring[vertex] = color;
    }
    
    // Count number of colors used
    const numColors = Math.max(...Object.values(coloring)) + 1;
    
    return {
      coloring,
      numColors
    };
  },
  
  /**
   * Detect cycles in a graph
   * @param {Object} graph - The graph to analyze
   * @returns {Object} - Whether a cycle exists and an example cycle if found
   */
  detectCycle(graph) {
    if (graph.directed) {
      // For directed graphs
      const vertices = graph.getVertices();
      const visited = new Set();
      const recStack = new Set(); // For tracking the recursion stack
      let cycleFound = false;
      let cyclePath = [];
      
      function dfs(vertex, path) {
        visited.add(vertex);
        recStack.add(vertex);
        path.push(vertex);
        
        for (const neighbor of graph.getNeighbors(vertex)) {
          if (!visited.has(neighbor)) {
            if (dfs(neighbor, [...path])) {
              return true;
            }
          } else if (recStack.has(neighbor)) {
            // Cycle found
            cycleFound = true;
            
            // Extract the cycle from the path
            const start = path.indexOf(neighbor);
            cyclePath = path.slice(start);
            return true;
          }
        }
        
        recStack.delete(vertex);
        return false;
      }
      
      for (const vertex of vertices) {
        if (!visited.has(vertex)) {
          if (dfs(vertex, [])) break;
        }
      }
      
      return {
        hasCycle: cycleFound,
        cycle: cyclePath
      };
    } else {
      // For undirected graphs
      const vertices = graph.getVertices();
      const visited = new Set();
      let cycleFound = false;
      let cyclePath = [];
      
      function dfs(vertex, parent, path) {
        visited.add(vertex);
        path.push(vertex);
        
        for (const neighbor of graph.getNeighbors(vertex)) {
          // Skip the vertex we just came from
          if (neighbor === parent) continue;
          
          if (!visited.has(neighbor)) {
            if (dfs(neighbor, vertex, [...path])) {
              return true;
            }
          } else {
            // Cycle found
            cycleFound = true;
            
            // Extract the cycle from the path
            const start = path.indexOf(neighbor);
            cyclePath = path.slice(start);
            return true;
          }
        }
        
        return false;
      }
      
      for (const vertex of vertices) {
        if (!visited.has(vertex)) {
          if (dfs(vertex, null, [])) break;
        }
      }
      
      return {
        hasCycle: cycleFound,
        cycle: cyclePath
      };
    }
  },
  
  /**
   * Find the shortest path that visits all vertices (approximation of TSP)
   * @param {Object} graph - The complete graph to analyze
   * @param {*} start - Starting vertex (optional)
   * @returns {Object} - Approximate solution to TSP
   */
  approximateTSP(graph, start) {
    const vertices = graph.getVertices();
    if (vertices.length === 0) return { path: [], cost: 0 };
    
    start = start || vertices[0];
    
    // Build MST from start vertex
    const mst = algorithms.minimumSpanningTreePrim(graph, start);
    
    // Perform preorder traversal of MST
    const visited = new Set();
    const path = [];
    
    function dfsPreorder(vertex) {
      visited.add(vertex);
      path.push(vertex);
      
      for (const neighbor of mst.getNeighbors(vertex)) {
        if (!visited.has(neighbor)) {
          dfsPreorder(neighbor);
        }
      }
    }
    
    dfsPreorder(start);
    
    // Add the starting vertex to complete the cycle
    path.push(start);
    
    // Calculate total cost
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      cost += graph.getWeight(path[i], path[i + 1]);
    }
    
    return {
      path,
      cost
    };
  }
};

// Functions for test compatibility
function createUndirectedGraph() {
  return create({ directed: false });
}

function createDirectedGraph() {
  return create({ directed: true });
}

module.exports = {
  create,
  algorithms,
  advanced,
  createUndirectedGraph,
  createDirectedGraph
};