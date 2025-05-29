/**
 * Herta.js REST API Router
 * Provides REST endpoints for Herta.js mathematical capabilities
 */

import express from 'express';
const router = express.Router();
import herta from '../../index.js'; // Added .js extension

// Core mathematics endpoints
/**
 * @swagger
 * /core/evaluate:
 *   post:
 *     tags:
 *       - Core
 *     summary: Evaluate a mathematical expression
 *     description: Parses and evaluates a mathematical expression string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expression
 *             properties:
 *               expression:
 *                 type: string
 *                 example: "2 * sin(45 deg) + 5"
 *     responses:
 *       200:
 *         description: Expression evaluation result
 */
router.post('/core/evaluate', (req, res) => {
  try {
    const { expression } = req.body;
    const result = herta.evaluate(expression);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Matrix operations endpoints
/**
 * @swagger
 * /matrix/multiply:
 *   post:
 *     tags:
 *       - Matrix
 *     summary: Multiply two matrices
 *     description: Multiplies matrix A by matrix B
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matrixA
 *               - matrixB
 *             properties:
 *               matrixA:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *               matrixB:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       200:
 *         description: Matrix multiplication result
 */
router.post('/matrix/multiply', (req, res) => {
  try {
    const { matrixA, matrixB } = req.body;
    const result = herta.multiply(matrixA, matrixB);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /matrix/determinant:
 *   post:
 *     tags:
 *       - Matrix
 *     summary: Calculate matrix determinant
 *     description: Calculates the determinant of a square matrix
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matrix
 *             properties:
 *               matrix:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       200:
 *         description: Determinant calculation result
 */
router.post('/matrix/determinant', (req, res) => {
  try {
    const { matrix } = req.body;
    const result = herta.det(matrix);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Specialized modules endpoints - Optimization
/**
 * @swagger
 * /optimization/gradient-descent:
 *   post:
 *     tags:
 *       - Optimization
 *     summary: Run gradient descent optimization
 *     description: Performs gradient descent optimization on a given objective function
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - objective
 *               - gradient
 *               - initialParams
 *             properties:
 *               objective:
 *                 type: string
 *                 example: "(x) => Math.pow(x[0], 2) + Math.pow(x[1], 2)"
 *               gradient:
 *                 type: string
 *                 example: "(x) => [2 * x[0], 2 * x[1]]"
 *               initialParams:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [10, 10]
 *               learningRate:
 *                 type: number
 *                 example: 0.1
 *               maxIterations:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Optimization results
 */
router.post('/optimization/gradient-descent', (req, res) => {
  try {
    const { objective, gradient, initialParams, learningRate, maxIterations } = req.body;
    
    // Safety check - convert strings to functions if needed
    const objFn = typeof objective === 'string' ? eval(objective) : objective;
    const gradFn = typeof gradient === 'string' ? eval(gradient) : gradient;
    
    const result = herta.optimization.gradientDescent({
      objective: objFn,
      gradient: gradFn,
      initialParams,
      learningRate,
      maxIterations
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Quantum mechanics module endpoints
/**
 * @swagger
 * /quantum/state:
 *   post:
 *     tags:
 *       - Quantum
 *     summary: Create and manipulate quantum states
 *     description: Creates quantum states and applies quantum operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amplitudes
 *             properties:
 *               amplitudes:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: number
 *                     - type: object
 *                       properties:
 *                         re:
 *                           type: number
 *                         im:
 *                           type: number
 *                 example: [0.7071, 0.7071]
 *               gate:
 *                 type: string
 *                 enum: [H, X, Y, Z, CNOT]
 *                 example: "H"
 *     responses:
 *       200:
 *         description: Resulting quantum state
 */
router.post('/quantum/state', (req, res) => {
  try {
    const { amplitudes, gate } = req.body;
    let state = herta.quantum.createState(amplitudes);
    
    if (gate) {
      state = herta.quantum.applyGate(gate, state);
    }
    
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// More module endpoints can be added here...

export default router;
