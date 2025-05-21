/**
 * Tests for the Graph Theory module in Herta.js
 */

const { assert, herta } = require('../setup');

describe('Graph Theory Module', () => {
  // Graph creation and properties
  describe('Graph Creation and Properties', () => {
    it('should create an undirected graph correctly', () => {
      const graph = herta.graph.createUndirectedGraph();
      
      // Add vertices and edges
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      
      // Check graph properties
      assert.strictEqual(graph.vertexCount(), 3, 'Vertex count incorrect');
      assert.strictEqual(graph.edgeCount(), 2, 'Edge count incorrect');
      assert.strictEqual(graph.isDirected(), false, 'Graph should be undirected');
      
      // Check adjacency
      assert.strictEqual(graph.hasEdge('A', 'B'), true, 'Edge A-B should exist');
      assert.strictEqual(graph.hasEdge('B', 'A'), true, 'Edge B-A should exist (undirected)');
      assert.strictEqual(graph.hasEdge('A', 'C'), false, 'Edge A-C should not exist');
    });
    
    it('should create a directed graph correctly', () => {
      const graph = herta.graph.createDirectedGraph();
      
      // Add vertices and edges
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');
      
      // Check graph properties
      assert.strictEqual(graph.vertexCount(), 3, 'Vertex count incorrect');
      assert.strictEqual(graph.edgeCount(), 2, 'Edge count incorrect');
      assert.strictEqual(graph.isDirected(), true, 'Graph should be directed');
      
      // Check adjacency
      assert.strictEqual(graph.hasEdge('A', 'B'), true, 'Edge A->B should exist');
      assert.strictEqual(graph.hasEdge('B', 'A'), false, 'Edge B->A should not exist (directed)');
    });
    
    it('should support weighted edges with metadata', () => {
      const graph = herta.graph.createUndirectedGraph();
      
      graph.addVertex('A');
      graph.addVertex('B');
      
      // Add weighted edge
      graph.addEdge('A', 'B', { weight: 5, type: 'road' });
      
      // Check edge properties
      const edge = graph.getEdge('A', 'B');
      assert.strictEqual(edge.weight, 5, 'Edge weight incorrect');
      assert.strictEqual(edge.type, 'road', 'Edge metadata incorrect');
    });
  });
  
  // Graph algorithms
  describe('Graph Algorithms', () => {
    let graph;
    
    beforeEach(() => {
      // Create a test graph for algorithms
      graph = herta.graph.createUndirectedGraph();
      
      // Add vertices
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(v => graph.addVertex(v));
      
      // Add edges with weights
      graph.addEdge('A', 'B', { weight: 2 });
      graph.addEdge('A', 'C', { weight: 3 });
      graph.addEdge('B', 'C', { weight: 1 });
      graph.addEdge('B', 'D', { weight: 4 });
      graph.addEdge('C', 'E', { weight: 5 });
      graph.addEdge('D', 'E', { weight: 2 });
      graph.addEdge('D', 'F', { weight: 1 });
      graph.addEdge('E', 'F', { weight: 3 });
    });
    
    it('should find shortest path using Dijkstra\'s algorithm', () => {
      const path = herta.graph.shortestPath(graph, 'A', 'F');
      
      // Expected path: A -> B -> D -> F with total weight 7
      assert.deepStrictEqual(path.vertices, ['A', 'B', 'D', 'F'], 'Shortest path vertices incorrect');
      assert.strictEqual(path.distance, 7, 'Shortest path distance incorrect');
    });
    
    it('should find minimum spanning tree using Kruskal\'s algorithm', () => {
      const mst = herta.graph.minimumSpanningTree(graph, 'kruskal');
      
      // Expected MST should have 5 edges with total weight 8
      assert.strictEqual(mst.edgeCount(), 5, 'MST should have 5 edges');
      
      // Calculate total weight of MST
      let totalWeight = 0;
      mst.getEdges().forEach(e => totalWeight += e.weight);
      
      assert.strictEqual(totalWeight, 8, 'MST total weight incorrect');
    });
    
    it('should find minimum spanning tree using Prim\'s algorithm', () => {
      const mst = herta.graph.minimumSpanningTree(graph, 'prim');
      
      // Expected MST should have 5 edges with total weight 8
      assert.strictEqual(mst.edgeCount(), 5, 'MST should have 5 edges');
      
      // Calculate total weight of MST
      let totalWeight = 0;
      mst.getEdges().forEach(e => totalWeight += e.weight);
      
      assert.strictEqual(totalWeight, 8, 'MST total weight incorrect');
    });
    
    it('should calculate all-pairs shortest paths using Floyd-Warshall', () => {
      const distances = herta.graph.floydWarshall(graph);
      
      // Check some specific distances
      assert.strictEqual(distances['A']['F'], 7, 'Distance A to F incorrect');
      assert.strictEqual(distances['C']['F'], 8, 'Distance C to F incorrect');
      assert.strictEqual(distances['E']['A'], 7, 'Distance E to A incorrect');
    });
  });
  
  // Advanced network analysis
  describe('Advanced Network Analysis', () => {
    let graph;
    
    beforeEach(() => {
      // Create a test graph for centrality measures
      graph = herta.graph.createUndirectedGraph();
      
      // Create a small social network
      ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'].forEach(v => graph.addVertex(v));
      
      // Add friendship connections
      graph.addEdge('Alice', 'Bob');
      graph.addEdge('Alice', 'Charlie');
      graph.addEdge('Bob', 'Charlie');
      graph.addEdge('Bob', 'David');
      graph.addEdge('Charlie', 'David');
      graph.addEdge('Charlie', 'Eve');
      graph.addEdge('David', 'Eve');
      graph.addEdge('Eve', 'Frank');
    });
    
    it('should calculate degree centrality correctly', () => {
      const centrality = herta.graph.degreeCentrality(graph);
      
      // Charlie has the most connections (4)
      assert.strictEqual(centrality['Charlie'], 4, 'Charlie\'s degree centrality incorrect');
      
      // Frank has only one connection
      assert.strictEqual(centrality['Frank'], 1, 'Frank\'s degree centrality incorrect');
    });
    
    it('should calculate betweenness centrality correctly', () => {
      const centrality = herta.graph.betweennessCentrality(graph);
      
      // Nodes in the middle of the network should have higher betweenness
      assert(centrality['Charlie'] > centrality['Frank'], 'Charlie should have higher betweenness than Frank');
      assert(centrality['Eve'] > centrality['Alice'], 'Eve should have higher betweenness than Alice');
    });
    
    it('should detect communities using Louvain method', () => {
      const communities = herta.graph.communityDetection(graph, 'louvain');
      
      // Should detect some communities (exact number depends on implementation)
      assert(communities.length > 0, 'Should detect at least one community');
      
      // Each vertex should belong to exactly one community
      const assignedVertices = communities.flat();
      assert.strictEqual(assignedVertices.length, graph.vertexCount(), 'Each vertex should be assigned to a community');
    });
    
    it('should find articulation points correctly', () => {
      // Create a graph with a clear articulation point
      const artGraph = herta.graph.createUndirectedGraph();
      
      // Add vertices
      ['A', 'B', 'C', 'D', 'E'].forEach(v => artGraph.addVertex(v));
      
      // Create a structure where C is an articulation point
      artGraph.addEdge('A', 'B');
      artGraph.addEdge('B', 'C');
      artGraph.addEdge('C', 'D');
      artGraph.addEdge('D', 'E');
      
      const artPoints = herta.graph.articulationPoints(artGraph);
      
      // B and C should be articulation points
      assert(artPoints.includes('B'), 'B should be an articulation point');
      assert(artPoints.includes('C'), 'C should be an articulation point');
      assert(!artPoints.includes('A'), 'A should not be an articulation point');
    });
    
    it('should perform topological sort on a DAG', () => {
      // Create a directed acyclic graph
      const dag = herta.graph.createDirectedGraph();
      
      // Add vertices
      ['A', 'B', 'C', 'D', 'E'].forEach(v => dag.addVertex(v));
      
      // Add directed edges
      dag.addEdge('A', 'B');
      dag.addEdge('A', 'C');
      dag.addEdge('B', 'D');
      dag.addEdge('C', 'D');
      dag.addEdge('D', 'E');
      
      const sortedOrder = herta.graph.topologicalSort(dag);
      
      // Check that the order respects edge directions
      // A should come before B and C
      assert(sortedOrder.indexOf('A') < sortedOrder.indexOf('B'), 'A should come before B in topological order');
      assert(sortedOrder.indexOf('A') < sortedOrder.indexOf('C'), 'A should come before C in topological order');
      
      // Both B and C should come before D
      assert(sortedOrder.indexOf('B') < sortedOrder.indexOf('D'), 'B should come before D in topological order');
      assert(sortedOrder.indexOf('C') < sortedOrder.indexOf('D'), 'C should come before D in topological order');
      
      // D should come before E
      assert(sortedOrder.indexOf('D') < sortedOrder.indexOf('E'), 'D should come before E in topological order');
    });
  });
});
