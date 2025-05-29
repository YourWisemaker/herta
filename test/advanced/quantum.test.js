/**
 * Tests for the Quantum Mechanics module in Herta.js
 */

const {
  assert, assertApproxEqual, assertArrayApproxEqual, assertMatrixApproxEqual, herta
} = require('../setup');

describe('Quantum Mechanics Module', () => {
  // Quantum state tests
  describe('Quantum State Operations', () => {
    it('should create a valid quantum state vector', () => {
      // Create a normalized state |0⟩ + |1⟩ / √2
      const state = herta.quantum.createState([1 / Math.sqrt(2), 1 / Math.sqrt(2)]);

      // Test normalization
      const norm = Math.sqrt(state[0] ** 2 + state[1] ** 2);
      assertApproxEqual(norm, 1, 'State should be normalized');

      // Test values
      assertApproxEqual(state[0], 1 / Math.sqrt(2), 'First amplitude incorrect');
      assertApproxEqual(state[1], 1 / Math.sqrt(2), 'Second amplitude incorrect');
    });

    it('should automatically normalize a state vector', () => {
      // Create with non-normalized amplitudes
      const state = herta.quantum.createState([1, 1]);

      // Test normalization
      const norm = Math.sqrt(state[0] ** 2 + state[1] ** 2);
      assertApproxEqual(norm, 1, 'State should be normalized');

      // Test values
      assertApproxEqual(state[0], 1 / Math.sqrt(2), 'First amplitude incorrect');
      assertApproxEqual(state[1], 1 / Math.sqrt(2), 'Second amplitude incorrect');
    });

    it('should calculate inner product correctly', () => {
      const state1 = herta.quantum.createState([1, 0]); // |0⟩
      const state2 = herta.quantum.createState([0, 1]); // |1⟩
      const state3 = herta.quantum.createState([1 / Math.sqrt(2), 1 / Math.sqrt(2)]); // |+⟩

      // Orthogonal states
      const innerProduct1 = herta.quantum.innerProduct(state1, state2);
      assertApproxEqual(innerProduct1, 0, 'Inner product of orthogonal states should be 0');

      // Non-orthogonal states
      const innerProduct2 = herta.quantum.innerProduct(state1, state3);
      assertApproxEqual(innerProduct2, 1 / Math.sqrt(2), 'Inner product calculated incorrectly');
    });
  });

  // Quantum gate tests
  describe('Quantum Gates', () => {
    it('should apply Pauli-X gate correctly', () => {
      const state = herta.quantum.createState([1, 0]); // |0⟩
      const result = herta.quantum.applyGate('X', state);

      // |0⟩ through X gate should give |1⟩
      assertArrayApproxEqual(result, [0, 1], 'Pauli-X gate applied incorrectly');
    });

    it('should apply Hadamard gate correctly', () => {
      const state = herta.quantum.createState([1, 0]); // |0⟩
      const result = herta.quantum.applyGate('H', state);

      // |0⟩ through H gate should give |+⟩ = (|0⟩ + |1⟩)/√2
      assertArrayApproxEqual(result, [1 / Math.sqrt(2), 1 / Math.sqrt(2)], 'Hadamard gate applied incorrectly');
    });

    it('should apply custom rotation gate correctly', () => {
      const state = herta.quantum.createState([1, 0]); // |0⟩
      const angle = Math.PI / 2; // 90 degrees rotation
      const axis = [0, 0, 1]; // Z-axis

      const result = herta.quantum.applyRotation(state, angle, axis);

      // Rotation around Z by π/2 on |0⟩ should give (|0⟩ + i|1⟩)/√2
      assertApproxEqual(result[0], 1 / Math.sqrt(2), 'Real part of rotation incorrect');
      assertApproxEqual(result[1], 1 / Math.sqrt(2), 'Imaginary part of rotation incorrect');
    });

    it('should implement tensor product correctly', () => {
      const state1 = herta.quantum.createState([1, 0]); // |0⟩
      const state2 = herta.quantum.createState([0, 1]); // |1⟩

      const tensorState = herta.quantum.tensorProduct(state1, state2);

      // |0⟩⊗|1⟩ = |01⟩ = [0, 1, 0, 0]
      assertArrayApproxEqual(tensorState, [0, 1, 0, 0], 'Tensor product calculated incorrectly');
    });
  });

  // Quantum algorithm tests
  describe('Quantum Algorithms', () => {
    it('should implement Quantum Fourier Transform correctly for 2 qubits', () => {
      // Start with |00⟩ state
      const state = [1, 0, 0, 0];

      // Apply QFT
      const result = herta.quantum.qft(state, 2); // 2 qubits

      // QFT on |00⟩ should give equal superposition
      const expected = [0.5, 0.5, 0.5, 0.5];
      assertArrayApproxEqual(result, expected, 'QFT implemented incorrectly');
    });

    it('should implement phase estimation correctly', () => {
      // Simple phase estimation test with known phase
      const phase = 0.25; // θ = 1/4
      const precision = 2; // Use 2 qubits for precision

      // Create unitary with this phase
      const unitary = (state) =>
        // This represents the U|ψ⟩ = e^(2πiθ)|ψ⟩ operation
        // Using the complex number as {re: cos, im: sin} instead of direct 1i syntax
        state.map((amp) => {
          // e^(ix) = cos(x) + i*sin(x)
          const angle = 2 * Math.PI * phase;
          return {
            re: (typeof amp === 'number' ? amp : amp.re) * Math.cos(angle),
            im: (typeof amp === 'number' ? amp : amp.re) * Math.sin(angle)
          };
        });
      const estimatedPhase = herta.quantum.phaseEstimation(unitary, precision);

      // Should estimate phase close to 0.25
      assertApproxEqual(estimatedPhase, phase, 'Phase estimation incorrect', 0.1);
    });
  });

  // Quantum information tests
  describe('Quantum Information Theory', () => {
    it('should calculate Von Neumann entropy correctly', () => {
      // Pure state has zero entropy
      const pureState = herta.quantum.createState([1, 0]);
      const pureEntropy = herta.quantum.vonNeumannEntropy(pureState);
      assertApproxEqual(pureEntropy, 0, 'Pure state entropy should be zero');

      // Maximally mixed state has entropy of log(d)
      const mixedState = herta.quantum.createDensityMatrix([[0.5, 0], [0, 0.5]]);
      const mixedEntropy = herta.quantum.vonNeumannEntropy(mixedState);
      assertApproxEqual(mixedEntropy, Math.log2(2), 'Mixed state entropy incorrect');
    });

    it('should compute partial trace correctly', () => {
      // Create a Bell state density matrix
      const bellState = herta.quantum.createState([1 / Math.sqrt(2), 0, 0, 1 / Math.sqrt(2)]);
      const bellDensity = herta.quantum.stateToDensity(bellState);

      // Partial trace over second qubit
      const reducedDensity = herta.quantum.partialTrace(bellDensity, [0], [2, 2]);

      // Should be maximally mixed state for first qubit
      const expected = [[0.5, 0], [0, 0.5]];
      assertMatrixApproxEqual(reducedDensity, expected, 'Partial trace calculated incorrectly');
    });
  });
});
