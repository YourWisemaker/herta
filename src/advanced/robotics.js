/**
 * Robotics module for herta.js
 * Provides algorithms for robot kinematics, dynamics, path planning, and control
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const robotics = {};

/**
 * Calculate forward kinematics for an n-link robot arm
 * @param {Array} linkLengths - Array of link lengths
 * @param {Array} jointAngles - Array of joint angles in radians
 * @returns {Object} - End effector position and orientation
 */
robotics.forwardKinematics = function(linkLengths, jointAngles) {
  if (linkLengths.length !== jointAngles.length) {
    throw new Error('Number of links must match number of joint angles');
  }
  
  const n = linkLengths.length;
  
  // Initialize position and orientation
  let x = 0, y = 0;
  let theta = 0;
  
  // Calculate cumulative position
  for (let i = 0; i < n; i++) {
    theta += jointAngles[i];
    x += linkLengths[i] * Math.cos(theta);
    y += linkLengths[i] * Math.sin(theta);
  }
  
  return { x, y, theta };
};

/**
 * Calculate inverse kinematics for a 2-link robot arm (analytical solution)
 * @param {Array} linkLengths - Array of link lengths [l1, l2]
 * @param {Object} targetPosition - Target position {x, y}
 * @returns {Array} - Possible joint angle configurations [[theta1, theta2], ...]
 */
robotics.inverseKinematics2Link = function(linkLengths, targetPosition) {
  const l1 = linkLengths[0];
  const l2 = linkLengths[1];
  const { x, y } = targetPosition;
  
  const targetDistance = Math.sqrt(x*x + y*y);
  
  // Check if target is reachable
  if (targetDistance > l1 + l2) {
    throw new Error('Target position is outside the robot workspace');
  }
  
  if (targetDistance < Math.abs(l1 - l2)) {
    throw new Error('Target position is inside the unreachable area');
  }
  
  // Calculate theta2 using law of cosines
  const cosTheta2 = (x*x + y*y - l1*l1 - l2*l2) / (2 * l1 * l2);
  const sinTheta2 = Math.sqrt(1 - cosTheta2*cosTheta2);
  
  // Two possible solutions for theta2 (elbow up/down)
  const theta2_1 = Math.atan2(sinTheta2, cosTheta2);
  const theta2_2 = Math.atan2(-sinTheta2, cosTheta2);
  
  // Calculate corresponding theta1 values
  const k1 = l1 + l2 * cosTheta2_1;
  const k2 = l2 * sinTheta2_1;
  const theta1_1 = Math.atan2(y, x) - Math.atan2(k2, k1);
  
  const k3 = l1 + l2 * cosTheta2_2;
  const k4 = l2 * sinTheta2_2;
  const theta1_2 = Math.atan2(y, x) - Math.atan2(k4, k3);
  
  return [
    [theta1_1, theta2_1],
    [theta1_2, theta2_2]
  ];
};

/**
 * Calculate Jacobian matrix for an n-link planar robot arm
 * @param {Array} linkLengths - Array of link lengths
 * @param {Array} jointAngles - Array of joint angles in radians
 * @returns {Array} - Jacobian matrix
 */
robotics.jacobian = function(linkLengths, jointAngles) {
  const n = linkLengths.length;
  const jacobian = Array(2).fill().map(() => Array(n).fill(0));
  
  for (let j = 0; j < n; j++) {
    let x = 0, y = 0;
    let theta = 0;
    
    // Calculate position up to joint j
    for (let i = 0; i <= j; i++) {
      theta += jointAngles[i];
    }
    
    // Calculate remaining links
    for (let i = j; i < n; i++) {
      x += linkLengths[i] * Math.cos(theta);
      y += linkLengths[i] * Math.sin(theta);
      
      if (i < n - 1) {
        theta += jointAngles[i + 1];
      }
    }
    
    // Derivatives with respect to joint j
    jacobian[0][j] = -y; // dx/dtheta_j
    jacobian[1][j] = x;  // dy/dtheta_j
  }
  
  return jacobian;
};

/**
 * Solve inverse kinematics using Jacobian pseudoinverse
 * @param {Array} linkLengths - Array of link lengths
 * @param {Array} initialJointAngles - Initial joint angles
 * @param {Object} targetPosition - Target position {x, y}
 * @param {Object} options - Solver options
 * @returns {Array} - Solved joint angles
 */
robotics.inverseKinematicsJacobian = function(linkLengths, initialJointAngles, targetPosition, options = {}) {
  const maxIterations = options.maxIterations || 1000;
  const tolerance = options.tolerance || 0.001;
  const alpha = options.alpha || 0.1; // Step size
  
  let jointAngles = [...initialJointAngles];
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Calculate current position
    const current = this.forwardKinematics(linkLengths, jointAngles);
    
    // Calculate error
    const dx = targetPosition.x - current.x;
    const dy = targetPosition.y - current.y;
    const error = Math.sqrt(dx*dx + dy*dy);
    
    // Check convergence
    if (error < tolerance) {
      return jointAngles;
    }
    
    // Calculate Jacobian
    const J = this.jacobian(linkLengths, jointAngles);
    
    // Calculate pseudo-inverse of Jacobian (J^T * (J * J^T)^-1)
    const JJT = [
      [J[0][0]*J[0][0] + J[0][1]*J[0][1], J[0][0]*J[1][0] + J[0][1]*J[1][1]],
      [J[1][0]*J[0][0] + J[1][1]*J[0][1], J[1][0]*J[1][0] + J[1][1]*J[1][1]]
    ];
    
    const det = JJT[0][0]*JJT[1][1] - JJT[0][1]*JJT[1][0];
    const invJJT = [
      [JJT[1][1]/det, -JJT[0][1]/det],
      [-JJT[1][0]/det, JJT[0][0]/det]
    ];
    
    const JInv = [
      [J[0][0]*invJJT[0][0] + J[1][0]*invJJT[0][1], J[0][1]*invJJT[0][0] + J[1][1]*invJJT[0][1]],
      [J[0][0]*invJJT[1][0] + J[1][0]*invJJT[1][1], J[0][1]*invJJT[1][0] + J[1][1]*invJJT[1][1]]
    ];
    
    // Update joint angles
    jointAngles = jointAngles.map((angle, i) => {
      const dTheta = alpha * (JInv[i][0] * dx + JInv[i][1] * dy);
      return angle + dTheta;
    });
  }
  
  throw new Error('Inverse kinematics did not converge');
};

/**
 * Generate a trajectory in joint space
 * @param {Array} startAngles - Starting joint angles
 * @param {Array} endAngles - Ending joint angles
 * @param {number} duration - Duration of the trajectory in seconds
 * @param {number} timeStep - Time step for discretization
 * @returns {Array} - Array of joint angle configurations
 */
robotics.jointTrajectory = function(startAngles, endAngles, duration, timeStep) {
  if (startAngles.length !== endAngles.length) {
    throw new Error('Start and end configurations must have the same dimensions');
  }
  
  const n = startAngles.length;
  const steps = Math.ceil(duration / timeStep);
  const trajectory = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // Normalized time [0, 1]
    
    // Cubic polynomial: a*t^3 + b*t^2 + c*t + d
    // With boundary conditions: f(0)=0, f(1)=1, f'(0)=0, f'(1)=0
    const s = 3*t*t - 2*t*t*t; // Normalized position
    
    const joints = startAngles.map((start, j) => {
      return start + s * (endAngles[j] - start);
    });
    
    trajectory.push(joints);
  }
  
  return trajectory;
};

/**
 * Plan a path using Rapidly-exploring Random Tree (RRT)
 * @param {Function} isValidState - Function that checks if a state is valid
 * @param {Array} start - Start state
 * @param {Array} goal - Goal state
 * @param {Object} bounds - State space bounds {min: [...], max: [...]}
 * @param {Object} options - Planning options
 * @returns {Array} - Planned path from start to goal
 */
robotics.rrtPathPlanning = function(isValidState, start, goal, bounds, options = {}) {
  const maxIterations = options.maxIterations || 1000;
  const stepSize = options.stepSize || 0.1;
  const goalBias = options.goalBias || 0.1;
  const dimension = start.length;
  
  // Tree structure: node = {state, parent}
  const tree = [{ state: start, parent: null }];
  
  for (let i = 0; i < maxIterations; i++) {
    // Generate random state (with goal bias)
    let randomState;
    if (Math.random() < goalBias) {
      randomState = [...goal];
    } else {
      randomState = Array(dimension).fill().map((_, j) => {
        return bounds.min[j] + Math.random() * (bounds.max[j] - bounds.min[j]);
      });
    }
    
    // Find nearest node in the tree
    let nearestIdx = 0;
    let minDist = Infinity;
    
    for (let j = 0; j < tree.length; j++) {
      const dist = this.euclideanDistance(tree[j].state, randomState);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = j;
      }
    }
    
    // Extend tree towards random state
    const nearestNode = tree[nearestIdx];
    const newState = this.extendTowards(nearestNode.state, randomState, stepSize);
    
    // Check if new state is valid
    if (isValidState(newState)) {
      tree.push({ state: newState, parent: nearestIdx });
      
      // Check if goal is reached
      const distToGoal = this.euclideanDistance(newState, goal);
      if (distToGoal < stepSize) {
        // Construct path by following parent links
        const path = [goal];
        let currentIdx = tree.length - 1;
        
        while (currentIdx !== 0) {
          path.unshift(tree[currentIdx].state);
          currentIdx = tree[currentIdx].parent;
        }
        
        path.unshift(start);
        return path;
      }
    }
  }
  
  throw new Error('Path planning failed to reach the goal');
};

/**
 * Helper function to calculate Euclidean distance between states
 * @param {Array} state1 - First state
 * @param {Array} state2 - Second state
 * @returns {number} - Euclidean distance
 */
robotics.euclideanDistance = function(state1, state2) {
  return Math.sqrt(
    state1.reduce((sum, val, i) => sum + Math.pow(val - state2[i], 2), 0)
  );
};

/**
 * Helper function to extend a state towards a target
 * @param {Array} from - Starting state
 * @param {Array} to - Target state
 * @param {number} stepSize - Maximum step size
 * @returns {Array} - New state
 */
robotics.extendTowards = function(from, to, stepSize) {
  const distance = this.euclideanDistance(from, to);
  
  if (distance <= stepSize) {
    return [...to];
  }
  
  const ratio = stepSize / distance;
  return from.map((val, i) => val + (to[i] - val) * ratio);
};

/**
 * Calculate dynamics using the recursive Newton-Euler algorithm
 * @param {Array} linkLengths - Array of link lengths
 * @param {Array} linkMasses - Array of link masses
 * @param {Array} jointAngles - Array of joint angles
 * @param {Array} jointVelocities - Array of joint velocities
 * @param {Array} jointAccelerations - Array of joint accelerations
 * @param {Object} options - Additional options
 * @returns {Array} - Joint torques
 */
robotics.inverseDynamics = function(linkLengths, linkMasses, jointAngles, jointVelocities, jointAccelerations, options = {}) {
  const gravity = options.gravity || 9.81;
  const n = linkLengths.length;
  
  // Simple model: point masses at the end of each link
  const torques = Array(n).fill(0);
  
  for (let i = 0; i < n; i++) {
    // Calculate distance to each mass from joint i
    for (let j = i; j < n; j++) {
      let distance = 0;
      for (let k = i; k <= j; k++) {
        distance += linkLengths[k];
      }
      
      // Calculate torque contribution
      // T = m * g * d * sin(θ) + m * d * α
      const angle = jointAngles.slice(i, j+1).reduce((sum, val) => sum + val, 0);
      const gravitationalTorque = linkMasses[j] * gravity * distance * Math.sin(angle);
      const inertialTorque = linkMasses[j] * distance * jointAccelerations[i];
      
      torques[i] += gravitationalTorque + inertialTorque;
    }
  }
  
  return torques;
};

/**
 * Implement a PID controller for robot joint control
 * @param {Array} setpoints - Desired joint angles
 * @param {Array} currentAngles - Current joint angles
 * @param {Array} integralErrors - Accumulated errors (state)
 * @param {Array} previousErrors - Previous errors (state)
 * @param {Object} gains - PID gains {kp, ki, kd}
 * @param {number} dt - Time step
 * @returns {Object} - Control outputs and updated state
 */
robotics.pidController = function(setpoints, currentAngles, integralErrors, previousErrors, gains, dt) {
  const { kp, ki, kd } = gains;
  const n = setpoints.length;
  
  const outputs = Array(n).fill(0);
  const newIntegralErrors = [...integralErrors];
  const newPreviousErrors = Array(n).fill(0);
  
  for (let i = 0; i < n; i++) {
    const error = setpoints[i] - currentAngles[i];
    newIntegralErrors[i] += error * dt;
    const derivativeError = (error - previousErrors[i]) / dt;
    
    outputs[i] = kp * error + ki * newIntegralErrors[i] + kd * derivativeError;
    newPreviousErrors[i] = error;
  }
  
  return {
    outputs,
    integralErrors: newIntegralErrors,
    previousErrors: newPreviousErrors
  };
};

/**
 * Calculate the Denavit-Hartenberg transformation matrix
 * @param {Object} dh - DH parameters {theta, d, a, alpha}
 * @returns {Array} - 4x4 transformation matrix
 */
robotics.dhTransform = function(dh) {
  const { theta, d, a, alpha } = dh;
  
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosAlpha = Math.cos(alpha);
  const sinAlpha = Math.sin(alpha);
  
  return [
    [cosTheta, -sinTheta * cosAlpha, sinTheta * sinAlpha, a * cosTheta],
    [sinTheta, cosTheta * cosAlpha, -cosTheta * sinAlpha, a * sinTheta],
    [0, sinAlpha, cosAlpha, d],
    [0, 0, 0, 1]
  ];
};

/**
 * Multiply 4x4 transformation matrices
 * @param {Array} A - First 4x4 matrix
 * @param {Array} B - Second 4x4 matrix
 * @returns {Array} - Result of A * B
 */
robotics.multiplyTransforms = function(A, B) {
  const C = Array(4).fill().map(() => Array(4).fill(0));
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  
  return C;
};

/**
 * Forward kinematics using Denavit-Hartenberg parameters
 * @param {Array} dhParams - Array of DH parameters for each joint
 * @returns {Array} - Transformation matrix from base to end effector
 */
robotics.forwardKinematicsDH = function(dhParams) {
  let T = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  
  for (const dh of dhParams) {
    const Ti = this.dhTransform(dh);
    T = this.multiplyTransforms(T, Ti);
  }
  
  return T;
};

module.exports = robotics;
