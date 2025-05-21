/**
 * Geometry module for herta.js
 * Provides computational geometry functions and operations
 */

const arithmetic = require('../core/arithmetic');
const matrix = require('../core/matrix');

const geometry = {};

/**
 * Calculate the Euclidean distance between two points in n-dimensional space
 * @param {Array} point1 - First point coordinates
 * @param {Array} point2 - Second point coordinates
 * @returns {number} - Euclidean distance
 */
geometry.distance = function(point1, point2) {
  if (point1.length !== point2.length) {
    throw new Error('Points must have the same dimensions');
  }
  
  let sumSquares = 0;
  for (let i = 0; i < point1.length; i++) {
    sumSquares += Math.pow(point2[i] - point1[i], 2);
  }
  
  return Math.sqrt(sumSquares);
};

/**
 * Calculate the Manhattan distance between two points
 * @param {Array} point1 - First point coordinates
 * @param {Array} point2 - Second point coordinates
 * @returns {number} - Manhattan distance
 */
geometry.manhattanDistance = function(point1, point2) {
  if (point1.length !== point2.length) {
    throw new Error('Points must have the same dimensions');
  }
  
  let distance = 0;
  for (let i = 0; i < point1.length; i++) {
    distance += Math.abs(point2[i] - point1[i]);
  }
  
  return distance;
};

/**
 * Calculate the Chebyshev distance between two points
 * @param {Array} point1 - First point coordinates
 * @param {Array} point2 - Second point coordinates
 * @returns {number} - Chebyshev distance
 */
geometry.chebyshevDistance = function(point1, point2) {
  if (point1.length !== point2.length) {
    throw new Error('Points must have the same dimensions');
  }
  
  let maxDistance = 0;
  for (let i = 0; i < point1.length; i++) {
    const distance = Math.abs(point2[i] - point1[i]);
    if (distance > maxDistance) {
      maxDistance = distance;
    }
  }
  
  return maxDistance;
};

/**
 * Create a 2D rotation matrix
 * @param {number} angle - Rotation angle in radians
 * @returns {Array} - 2x2 rotation matrix
 */
geometry.rotationMatrix2D = function(angle) {
  return [
    [Math.cos(angle), -Math.sin(angle)],
    [Math.sin(angle), Math.cos(angle)]
  ];
};

/**
 * Create a 3D rotation matrix around the X axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array} - 3x3 rotation matrix
 */
geometry.rotationMatrixX = function(angle) {
  return [
    [1, 0, 0],
    [0, Math.cos(angle), -Math.sin(angle)],
    [0, Math.sin(angle), Math.cos(angle)]
  ];
};

/**
 * Create a 3D rotation matrix around the Y axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array} - 3x3 rotation matrix
 */
geometry.rotationMatrixY = function(angle) {
  return [
    [Math.cos(angle), 0, Math.sin(angle)],
    [0, 1, 0],
    [-Math.sin(angle), 0, Math.cos(angle)]
  ];
};

/**
 * Create a 3D rotation matrix around the Z axis
 * @param {number} angle - Rotation angle in radians
 * @returns {Array} - 3x3 rotation matrix
 */
geometry.rotationMatrixZ = function(angle) {
  return [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1]
  ];
};

/**
 * Compute the angle between two vectors
 * @param {Array} vector1 - First vector
 * @param {Array} vector2 - Second vector
 * @returns {number} - Angle in radians
 */
geometry.angle = function(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
  }
  
  // Calculate magnitudes
  let mag1 = 0, mag2 = 0;
  for (let i = 0; i < vector1.length; i++) {
    mag1 += vector1[i] * vector1[i];
    mag2 += vector2[i] * vector2[i];
  }
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  // Calculate angle using dot product formula
  return Math.acos(dotProduct / (mag1 * mag2));
};

/**
 * Calculate the cross product of two 3D vectors
 * @param {Array} vector1 - First 3D vector
 * @param {Array} vector2 - Second 3D vector
 * @returns {Array} - Resulting cross product vector
 */
geometry.crossProduct = function(vector1, vector2) {
  if (vector1.length !== 3 || vector2.length !== 3) {
    throw new Error('Cross product is defined for 3D vectors only');
  }
  
  return [
    vector1[1] * vector2[2] - vector1[2] * vector2[1],
    vector1[2] * vector2[0] - vector1[0] * vector2[2],
    vector1[0] * vector2[1] - vector1[1] * vector2[0]
  ];
};

/**
 * Calculate the dot product of two vectors
 * @param {Array} vector1 - First vector
 * @param {Array} vector2 - Second vector
 * @returns {number} - Dot product result
 */
geometry.dotProduct = function(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let result = 0;
  for (let i = 0; i < vector1.length; i++) {
    result += vector1[i] * vector2[i];
  }
  
  return result;
};

/**
 * Convert from Cartesian to Polar coordinates (2D)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} - [r, theta] in polar form
 */
geometry.cartesianToPolar = function(x, y) {
  const r = Math.sqrt(x*x + y*y);
  const theta = Math.atan2(y, x);
  return [r, theta];
};

/**
 * Convert from Polar to Cartesian coordinates (2D)
 * @param {number} r - Radius
 * @param {number} theta - Angle in radians
 * @returns {Array} - [x, y] in cartesian form
 */
geometry.polarToCartesian = function(r, theta) {
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  return [x, y];
};

/**
 * Convert from Cartesian to Spherical coordinates (3D)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {Array} - [r, theta, phi] in spherical form
 */
geometry.cartesianToSpherical = function(x, y, z) {
  const r = Math.sqrt(x*x + y*y + z*z);
  const theta = Math.atan2(y, x);
  const phi = Math.acos(z / r);
  return [r, theta, phi];
};

/**
 * Convert from Spherical to Cartesian coordinates (3D)
 * @param {number} r - Radius
 * @param {number} theta - Azimuthal angle in radians
 * @param {number} phi - Polar angle in radians
 * @returns {Array} - [x, y, z] in cartesian form
 */
geometry.sphericalToCartesian = function(r, theta, phi) {
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return [x, y, z];
};

/**
 * Calculate the area of a triangle using Heron's formula
 * @param {number} a - First side length
 * @param {number} b - Second side length
 * @param {number} c - Third side length
 * @returns {number} - Area of the triangle
 */
geometry.triangleArea = function(a, b, c) {
  const s = (a + b + c) / 2; // Semi-perimeter
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
};

/**
 * Calculate the area of a triangle given its vertices
 * @param {Array} p1 - First vertex coordinates [x, y]
 * @param {Array} p2 - Second vertex coordinates [x, y]
 * @param {Array} p3 - Third vertex coordinates [x, y]
 * @returns {number} - Area of the triangle
 */
geometry.triangleAreaFromVertices = function(p1, p2, p3) {
  return 0.5 * Math.abs(
    (p1[0] * (p2[1] - p3[1])) +
    (p2[0] * (p3[1] - p1[1])) +
    (p3[0] * (p1[1] - p2[1]))
  );
};

/**
 * Check if a point is inside a polygon
 * @param {Array} point - Point coordinates [x, y]
 * @param {Array} polygon - Array of polygon vertices [[x1, y1], [x2, y2], ...]
 * @returns {boolean} - True if the point is inside the polygon
 */
geometry.isPointInPolygon = function(point, polygon) {
  const x = point[0], y = point[1];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
};

/**
 * Calculate the convex hull of a set of points using Graham scan algorithm
 * @param {Array} points - Array of points [[x1, y1], [x2, y2], ...]
 * @returns {Array} - Array of points forming the convex hull
 */
geometry.convexHull = function(points) {
  if (points.length <= 3) return points;
  
  // Find the point with the lowest y-coordinate
  let lowestPoint = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i][1] < lowestPoint[1] || 
        (points[i][1] === lowestPoint[1] && points[i][0] < lowestPoint[0])) {
      lowestPoint = points[i];
    }
  }
  
  // Sort points by polar angle with respect to the lowest point
  const sortedPoints = points.slice().sort((a, b) => {
    if (a === lowestPoint) return -1;
    if (b === lowestPoint) return 1;
    
    const angleA = Math.atan2(a[1] - lowestPoint[1], a[0] - lowestPoint[0]);
    const angleB = Math.atan2(b[1] - lowestPoint[1], b[0] - lowestPoint[0]);
    
    if (angleA === angleB) {
      // If angles are the same, sort by distance from lowestPoint
      const distA = Math.pow(a[0] - lowestPoint[0], 2) + Math.pow(a[1] - lowestPoint[1], 2);
      const distB = Math.pow(b[0] - lowestPoint[0], 2) + Math.pow(b[1] - lowestPoint[1], 2);
      return distA - distB;
    }
    
    return angleA - angleB;
  });
  
  // Helper function to determine if we make a left turn
  function isLeftTurn(p1, p2, p3) {
    return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]) > 0;
  }
  
  // Build the convex hull
  const hull = [sortedPoints[0], sortedPoints[1]];
  
  for (let i = 2; i < sortedPoints.length; i++) {
    while (hull.length > 1 && !isLeftTurn(hull[hull.length - 2], hull[hull.length - 1], sortedPoints[i])) {
      hull.pop();
    }
    hull.push(sortedPoints[i]);
  }
  
  return hull;
};

/**
 * Calculate the minimum enclosing circle of a set of points
 * @param {Array} points - Array of points [[x1, y1], [x2, y2], ...]
 * @returns {Object} - Circle object with center and radius
 */
geometry.minimumEnclosingCircle = function(points) {
  if (points.length === 0) return { center: [0, 0], radius: 0 };
  if (points.length === 1) return { center: points[0], radius: 0 };
  
  // Helper function to check if a circle contains all points
  function isValidCircle(circle, points) {
    for (const point of points) {
      const distance = Math.sqrt(
        Math.pow(point[0] - circle.center[0], 2) + 
        Math.pow(point[1] - circle.center[1], 2)
      );
      if (distance > circle.radius + 1e-10) return false;
    }
    return true;
  }
  
  // Helper function to find circle from three points
  function circleFromThreePoints(p1, p2, p3) {
    const a = p1[0] * (p2[1] - p3[1]) - p1[1] * (p2[0] - p3[0]) + p2[0] * p3[1] - p3[0] * p2[1];
    const b = (p1[0] * p1[0] + p1[1] * p1[1]) * (p3[1] - p2[1]) +
              (p2[0] * p2[0] + p2[1] * p2[1]) * (p1[1] - p3[1]) +
              (p3[0] * p3[0] + p3[1] * p3[1]) * (p2[1] - p1[1]);
    const c = (p1[0] * p1[0] + p1[1] * p1[1]) * (p2[0] - p3[0]) +
              (p2[0] * p2[0] + p2[1] * p2[1]) * (p3[0] - p1[0]) +
              (p3[0] * p3[0] + p3[1] * p3[1]) * (p1[0] - p2[0]);
    
    const x = -b / (2 * a);
    const y = -c / (2 * a);
    const center = [x, y];
    
    const radius = Math.sqrt(
      Math.pow(center[0] - p1[0], 2) + 
      Math.pow(center[1] - p1[1], 2)
    );
    
    return { center, radius };
  }
  
  // Trivial cases
  if (points.length === 2) {
    const center = [
      (points[0][0] + points[1][0]) / 2,
      (points[0][1] + points[1][1]) / 2
    ];
    const radius = Math.sqrt(
      Math.pow(points[0][0] - center[0], 2) + 
      Math.pow(points[0][1] - center[1], 2)
    );
    return { center, radius };
  }
  
  // Try all possible combinations of three points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        try {
          const circle = circleFromThreePoints(points[i], points[j], points[k]);
          if (isValidCircle(circle, points)) {
            return circle;
          }
        } catch (e) {
          // Points might be collinear, continue
        }
      }
    }
  }
  
  // Fallback using diameter
  let maxDistance = 0;
  let farthestPair = [0, 1];
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = Math.sqrt(
        Math.pow(points[i][0] - points[j][0], 2) + 
        Math.pow(points[i][1] - points[j][1], 2)
      );
      
      if (distance > maxDistance) {
        maxDistance = distance;
        farthestPair = [i, j];
      }
    }
  }
  
  const center = [
    (points[farthestPair[0]][0] + points[farthestPair[1]][0]) / 2,
    (points[farthestPair[0]][1] + points[farthestPair[1]][1]) / 2
  ];
  
  return {
    center,
    radius: maxDistance / 2
  };
};

module.exports = geometry;
