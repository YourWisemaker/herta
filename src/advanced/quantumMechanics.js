/**
 * Quantum Mechanics module for herta.js
 * Provides tools for quantum state manipulation and quantum mechanical calculations
 */

const Decimal = require('decimal.js');
const matrix = require('../core/matrix');
const complex = require('../core/complex');

const quantumMechanics = {};

/**
 * Create a quantum state vector (pure state)
 * @param {Array} amplitudes - Complex amplitudes of the state
 * @returns {Object} - Normalized quantum state
 */
quantumMechanics.createState = function (amplitudes) {
  // Ensure proper normalization
  const norm = Math.sqrt(amplitudes.reduce((sum, amp) => {
    const magnitude = typeof amp === 'number'
      ? amp ** 2
      : amp.re ** 2 + amp.im ** 2;
    return sum + magnitude;
  }, 0));

  const normalizedAmplitudes = amplitudes.map((amp) => {
    if (typeof amp === 'number') {
      return amp / norm;
    }
    return {
      re: amp.re / norm,
      im: amp.im / norm
    };
  });

  return {
    dimension: amplitudes.length,
    amplitudes: normalizedAmplitudes,

    // Inner product with another state
    innerProduct(otherState) {
      if (this.dimension !== otherState.dimension) {
        throw new Error('States must have the same dimension');
      }

      const result = { re: 0, im: 0 };

      for (let i = 0; i < this.dimension; i++) {
        const a = typeof this.amplitudes[i] === 'number'
          ? { re: this.amplitudes[i], im: 0 }
          : this.amplitudes[i];

        const b = typeof otherState.amplitudes[i] === 'number'
          ? { re: otherState.amplitudes[i], im: 0 }
          : otherState.amplitudes[i];

        // (a.re + i*a.im) * (b.re - i*b.im) = (a.re*b.re + a.im*b.im) + i*(a.im*b.re - a.re*b.im)
        result.re += a.re * b.re + a.im * b.im;
        result.im += a.im * b.re - a.re * b.im;
      }

      return result;
    },

    // Expectation value of an operator
    expectation(operator) {
      if (this.dimension !== operator.length || this.dimension !== operator[0].length) {
        throw new Error('Operator dimensions must match state dimension');
      }

      // Calculate |ψ⟩⟨ψ| (density matrix for pure state)
      const densityMatrix = [];
      for (let i = 0; i < this.dimension; i++) {
        densityMatrix[i] = [];
        for (let j = 0; j < this.dimension; j++) {
          const a = typeof this.amplitudes[i] === 'number'
            ? { re: this.amplitudes[i], im: 0 }
            : this.amplitudes[i];

          const b = typeof this.amplitudes[j] === 'number'
            ? { re: this.amplitudes[j], im: 0 }
            : this.amplitudes[j];

          // a * b* (complex multiplication with conjugate of b)
          densityMatrix[i][j] = {
            re: a.re * b.re + a.im * b.im,
            im: a.im * b.re - a.re * b.im
          };
        }
      }

      // Trace(ρ*O) = Trace(|ψ⟩⟨ψ|*O)
      const result = { re: 0, im: 0 };
      for (let i = 0; i < this.dimension; i++) {
        for (let j = 0; j < this.dimension; j++) {
          const opElement = typeof operator[i][j] === 'number'
            ? { re: operator[i][j], im: 0 }
            : operator[i][j];

          // Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
          const product = {
            re: densityMatrix[j][i].re * opElement.re - densityMatrix[j][i].im * opElement.im,
            im: densityMatrix[j][i].re * opElement.im + densityMatrix[j][i].im * opElement.re
          };

          result.re += product.re;
          result.im += product.im;
        }
      }

      return result;
    }
  };
};

/**
 * Create a density matrix (mixed state)
 * @param {Array} states - Array of quantum states
 * @param {Array} probabilities - Classical probabilities for each state
 * @returns {Array} - Density matrix
 */
quantumMechanics.createDensityMatrix = function (states, probabilities) {
  if (states.length !== probabilities.length) {
    throw new Error('Number of states must match number of probabilities');
  }

  const { dimension } = states[0];

  // Initialize density matrix with zeros
  const densityMatrix = Array(dimension).fill().map(() => Array(dimension).fill().map(() => ({ re: 0, im: 0 })));

  // Sum over all pure states with their classical probabilities
  for (let k = 0; k < states.length; k++) {
    const state = states[k];
    const prob = probabilities[k];

    if (state.dimension !== dimension) {
      throw new Error('All states must have the same dimension');
    }

    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        const a = typeof state.amplitudes[i] === 'number'
          ? { re: state.amplitudes[i], im: 0 }
          : state.amplitudes[i];

        const b = typeof state.amplitudes[j] === 'number'
          ? { re: state.amplitudes[j], im: 0 }
          : state.amplitudes[j];

        // a * b* (complex multiplication with conjugate of b)
        const product = {
          re: a.re * b.re + a.im * b.im,
          im: a.im * b.re - a.re * b.im
        };

        densityMatrix[i][j].re += prob * product.re;
        densityMatrix[i][j].im += prob * product.im;
      }
    }
  }

  return densityMatrix;
};

/**
 * Calculate the von Neumann entropy of a density matrix
 * @param {Array} densityMatrix - Density matrix of a quantum state
 * @returns {number} - von Neumann entropy S(ρ) = -Tr(ρ ln ρ)
 */
quantumMechanics.vonNeumannEntropy = function (densityMatrix) {
  const dimension = densityMatrix.length;

  // Calculate eigenvalues of the density matrix
  // This is a simplified approach. For a proper implementation,
  // we would need more robust eigenvalue calculation
  const eigenvalues = quantumMechanics.findEigenvalues(densityMatrix);

  // Calculate entropy: S(ρ) = -∑ λᵢ ln λᵢ
  let entropy = 0;
  for (const eigenvalue of eigenvalues) {
    if (eigenvalue > 1e-10) { // Avoid ln(0)
      entropy -= eigenvalue * Math.log(eigenvalue);
    }
  }

  return entropy;
};

/**
 * A simplified method to find eigenvalues
 * For real production use, we'd implement more robust algorithms
 * @param {Array} matrix - Square matrix
 * @returns {Array} - Approximate eigenvalues
 */
quantumMechanics.findEigenvalues = function (matrix) {
  // This is a placeholder for a proper eigenvalue calculation
  // For simplicity, we're returning a dummy implementation
  // A real implementation would use QR algorithm or similar methods

  const dimension = matrix.length;

  // For 2x2 matrices, we can use the characteristic polynomial
  if (dimension === 2) {
    const a = matrix[0][0].re;
    const b = matrix[0][1].re;
    const c = matrix[1][0].re;
    const d = matrix[1][1].re;

    const trace = a + d;
    const det = a * d - b * c;

    const discriminant = Math.sqrt(trace * trace - 4 * det);
    return [
      (trace + discriminant) / 2,
      (trace - discriminant) / 2
    ];
  }

  // For simplicity, in higher dimensions we're just returning the diagonal elements
  // This is NOT accurate for general matrices, just a placeholder
  return matrix.map((row, i) => {
    const diag = matrix[i][i];
    return typeof diag === 'number' ? diag : diag.re;
  });
};

/**
 * Apply a quantum gate to a state
 * @param {Object} state - Quantum state
 * @param {Array} gate - Quantum gate as a matrix
 * @returns {Object} - New quantum state after gate application
 */
quantumMechanics.applyGate = function (state, gate) {
  const { dimension } = state;
  if (gate.length !== dimension || gate[0].length !== dimension) {
    throw new Error('Gate dimensions must match state dimension');
  }

  const newAmplitudes = [];

  for (let i = 0; i < dimension; i++) {
    const newAmp = { re: 0, im: 0 };

    for (let j = 0; j < dimension; j++) {
      const gateElement = typeof gate[i][j] === 'number'
        ? { re: gate[i][j], im: 0 }
        : gate[i][j];

      const stateAmp = typeof state.amplitudes[j] === 'number'
        ? { re: state.amplitudes[j], im: 0 }
        : state.amplitudes[j];

      // Complex multiplication
      newAmp.re += gateElement.re * stateAmp.re - gateElement.im * stateAmp.im;
      newAmp.im += gateElement.re * stateAmp.im + gateElement.im * stateAmp.re;
    }

    newAmplitudes.push(newAmp);
  }

  return quantumMechanics.createState(newAmplitudes);
};

/**
 * Common quantum gates
 */
quantumMechanics.gates = {
  // Pauli-X (NOT) gate
  X: [
    [0, 1],
    [1, 0]
  ],

  // Pauli-Y gate
  Y: [
    [0, { re: 0, im: -1 }],
    [{ re: 0, im: 1 }, 0]
  ],

  // Pauli-Z gate
  Z: [
    [1, 0],
    [0, -1]
  ],

  // Hadamard gate
  H: [
    [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
    [1 / Math.sqrt(2), -1 / Math.sqrt(2)]
  ],

  // Phase gate (S gate)
  S: [
    [1, 0],
    [0, { re: 0, im: 1 }]
  ],

  // π/8 gate (T gate)
  T: [
    [1, 0],
    [0, { re: Math.cos(Math.PI / 4), im: Math.sin(Math.PI / 4) }]
  ],

  // CNOT gate (2-qubit)
  CNOT: [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
  ]
};

/**
 * Create rotation gates
 */
quantumMechanics.rotationGate = function (axis, theta) {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);

  switch (axis.toLowerCase()) {
    case 'x':
      return [
        [cos, { re: 0, im: -sin }],
        [{ re: 0, im: -sin }, cos]
      ];
    case 'y':
      return [
        [cos, -sin],
        [sin, cos]
      ];
    case 'z':
      return [
        [{ re: cos, im: -sin }, 0],
        [0, { re: cos, im: sin }]
      ];
    default:
      throw new Error('Axis must be x, y, or z');
  }
};

/**
 * Create a controlled version of a gate
 * @param {Array} gate - Single-qubit gate to control
 * @returns {Array} - Controlled version of the gate
 */
quantumMechanics.controlledGate = function (gate) {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, gate[0][0], gate[0][1]],
    [0, 0, gate[1][0], gate[1][1]]
  ];
};

/**
 * Calculate the tensor product of two quantum states
 * @param {Object} state1 - First quantum state
 * @param {Object} state2 - Second quantum state
 * @returns {Object} - Combined quantum state
 */
quantumMechanics.tensorProduct = function (state1, state2) {
  const newDimension = state1.dimension * state2.dimension;
  const newAmplitudes = [];

  for (let i = 0; i < state1.dimension; i++) {
    for (let j = 0; j < state2.dimension; j++) {
      const amp1 = typeof state1.amplitudes[i] === 'number'
        ? { re: state1.amplitudes[i], im: 0 }
        : state1.amplitudes[i];

      const amp2 = typeof state2.amplitudes[j] === 'number'
        ? { re: state2.amplitudes[j], im: 0 }
        : state2.amplitudes[j];

      // Complex multiplication
      newAmplitudes.push({
        re: amp1.re * amp2.re - amp1.im * amp2.im,
        im: amp1.re * amp2.im + amp1.im * amp2.re
      });
    }
  }

  return quantumMechanics.createState(newAmplitudes);
};

/**
 * Calculate the tensor product of two matrices (gates)
 * @param {Array} matrix1 - First matrix
 * @param {Array} matrix2 - Second matrix
 * @returns {Array} - Tensor product matrix
 */
quantumMechanics.tensorProductMatrix = function (matrix1, matrix2) {
  const rows1 = matrix1.length;
  const cols1 = matrix1[0].length;
  const rows2 = matrix2.length;
  const cols2 = matrix2[0].length;

  const result = Array(rows1 * rows2).fill().map(() => Array(cols1 * cols2).fill().map(() => ({ re: 0, im: 0 })));

  for (let i1 = 0; i1 < rows1; i1++) {
    for (let j1 = 0; j1 < cols1; j1++) {
      for (let i2 = 0; i2 < rows2; i2++) {
        for (let j2 = 0; j2 < cols2; j2++) {
          const element1 = typeof matrix1[i1][j1] === 'number'
            ? { re: matrix1[i1][j1], im: 0 }
            : matrix1[i1][j1];

          const element2 = typeof matrix2[i2][j2] === 'number'
            ? { re: matrix2[i2][j2], im: 0 }
            : matrix2[i2][j2];

          // Complex multiplication
          result[i1 * rows2 + i2][j1 * cols2 + j2] = {
            re: element1.re * element2.re - element1.im * element2.im,
            im: element1.re * element2.im + element1.im * element2.re
          };
        }
      }
    }
  }

  return result;
};

/**
 * Calculate partial trace of a density matrix
 * @param {Array} densityMatrix - Density matrix of a bipartite system
 * @param {number} dimA - Dimension of subsystem A
 * @param {number} dimB - Dimension of subsystem B
 * @param {string} traceOver - Which subsystem to trace over ('A' or 'B')
 * @returns {Array} - Reduced density matrix
 */
quantumMechanics.partialTrace = function (densityMatrix, dimA, dimB, traceOver) {
  if (densityMatrix.length !== dimA * dimB) {
    throw new Error('Density matrix dimensions do not match product dimensions');
  }

  if (traceOver === 'A') {
    // Trace over system A
    const reducedDensity = Array(dimB).fill().map(() => Array(dimB).fill().map(() => ({ re: 0, im: 0 })));

    for (let i = 0; i < dimB; i++) {
      for (let j = 0; j < dimB; j++) {
        for (let k = 0; k < dimA; k++) {
          const element = densityMatrix[k * dimB + i][k * dimB + j];
          reducedDensity[i][j].re += element.re;
          reducedDensity[i][j].im += element.im;
        }
      }
    }

    return reducedDensity;
  } if (traceOver === 'B') {
    // Trace over system B
    const reducedDensity = Array(dimA).fill().map(() => Array(dimA).fill().map(() => ({ re: 0, im: 0 })));

    for (let i = 0; i < dimA; i++) {
      for (let j = 0; j < dimA; j++) {
        for (let k = 0; k < dimB; k++) {
          const element = densityMatrix[i * dimB + k][j * dimB + k];
          reducedDensity[i][j].re += element.re;
          reducedDensity[i][j].im += element.im;
        }
      }
    }

    return reducedDensity;
  }
  throw new Error('traceOver must be either "A" or "B"');
};

/**
 * Quantum Fourier Transform implementation
 * @param {Object} state - Quantum state to transform
 * @returns {Object} - Transformed state
 */
quantumMechanics.qft = function (state) {
  const n = Math.log2(state.dimension);
  if (n % 1 !== 0) {
    throw new Error('State dimension must be a power of 2');
  }

  // Create QFT matrix
  const omega = 2 * Math.PI / state.dimension;
  const qftMatrix = [];

  for (let i = 0; i < state.dimension; i++) {
    qftMatrix[i] = [];
    for (let j = 0; j < state.dimension; j++) {
      const phase = omega * i * j;
      qftMatrix[i][j] = {
        re: Math.cos(phase) / Math.sqrt(state.dimension),
        im: Math.sin(phase) / Math.sqrt(state.dimension)
      };
    }
  }

  return quantumMechanics.applyGate(state, qftMatrix);
};

/**
 * Quantum phase estimation algorithm
 * @param {Function} unitaryGate - Unitary operator whose eigenvalue we want to estimate
 * @param {Object} eigenstate - Approximate eigenstate of the unitary operator
 * @param {number} precision - Number of qubits to use for phase estimation
 * @returns {number} - Estimated phase (eigenvalue's phase)
 */
quantumMechanics.phaseEstimation = function (unitaryGate, eigenstate, precision) {
  // This is a simplified implementation
  // A full implementation would require a full quantum circuit simulation

  // Create initial state |0...0⟩ ⊗ |ψ⟩
  const zeroState = quantumMechanics.createState(Array(2 ** precision).fill(0).map((_, i) => (i === 0 ? 1 : 0)));
  const initialState = quantumMechanics.tensorProduct(zeroState, eigenstate);

  // Apply Hadamard to all qubits in the first register
  let currentState = initialState;
  for (let i = 0; i < precision; i++) {
    // Apply Hadamard to qubit i
    const hadamardOnQubit = []; // This would be the matrix for H on qubit i
    currentState = quantumMechanics.applyGate(currentState, hadamardOnQubit);
  }

  // Apply controlled-U^(2^j) operations
  for (let j = 0; j < precision; j++) {
    // Apply controlled-U^(2^j) with control qubit j
    const controlledU = []; // This would be the matrix for controlled-U^(2^j)
    currentState = quantumMechanics.applyGate(currentState, controlledU);
  }

  // Apply inverse QFT to the first register
  currentState = quantumMechanics.applyGate(currentState, []);

  // Measure the first register to get the phase estimate
  // This is a simplification - we'd actually need to simulate measurement
  return 0.5; // Placeholder return value
};

module.exports = quantumMechanics;
