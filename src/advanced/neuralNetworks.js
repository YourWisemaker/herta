/**
 * Neural Networks module for herta.js
 * Provides implementations of modern neural network architectures,
 * training algorithms, and evaluation metrics
 */

const matrix = require('../core/matrix');
const machineLearning = require('./machineLearning');

const neuralNetworks = {};

/**
 * Create a fully connected (dense) layer
 * @param {number} inputSize - Size of input features
 * @param {number} outputSize - Size of output features
 * @param {Object} options - Additional options
 * @returns {Object} - Dense layer object
 */
neuralNetworks.denseLayer = function (inputSize, outputSize, options = {}) {
  const {
    activation = 'relu',
    useBias = true,
    weightInit = 'xavier'
  } = options;

  // Initialize weights
  let weights;
  if (weightInit === 'xavier') {
    // Xavier/Glorot initialization
    const scale = Math.sqrt(2 / (inputSize + outputSize));
    weights = matrix.random([inputSize, outputSize], -scale, scale);
  } else if (weightInit === 'he') {
    // He initialization (better for ReLU)
    const scale = Math.sqrt(2 / inputSize);
    weights = matrix.random([inputSize, outputSize], -scale, scale);
  } else {
    // Simple uniform initialization
    weights = matrix.random([inputSize, outputSize], -0.1, 0.1);
  }

  // Initialize biases
  const bias = useBias ? new Array(outputSize).fill(0) : null;

  // Get activation function
  const activationFn = getActivationFunction(activation);

  return {
    type: 'dense',
    weights,
    bias,
    inputSize,
    outputSize,
    activation,

    // Forward pass
    forward(input) {
      // Input shape validation
      if (input[0].length !== inputSize) {
        throw new Error(`Input size mismatch: expected ${inputSize}, got ${input[0].length}`);
      }

      // Linear transformation: Y = X * W + b
      let output = matrix.multiply(input, weights);

      // Add bias if used
      if (useBias) {
        output = output.map((row) => row.map((val, j) => val + bias[j]));
      }

      // Apply activation function
      if (activationFn) {
        output = activationFn.forward(output);
      }

      return output;
    },

    // Update layer parameters (for training)
    update(newWeights, newBias) {
      if (newWeights) {
        weights = newWeights;
      }

      if (newBias && useBias) {
        bias = newBias;
      }
    },

    // Get parameters for optimization
    getParameters() {
      return {
        weights,
        bias
      };
    }
  };
};

/**
 * Create a convolutional layer for 2D data
 * @param {Object} options - Layer configuration
 * @returns {Object} - Convolutional layer object
 */
neuralNetworks.convLayer2d = function (options = {}) {
  const {
    inputChannels,
    outputChannels,
    kernelSize = 3,
    stride = 1,
    padding = 0,
    activation = 'relu',
    useBias = true
  } = options;

  // Initialize weights (4D: [outputChannels, inputChannels, kernelSize, kernelSize])
  const scale = Math.sqrt(2 / (inputChannels * kernelSize * kernelSize));
  const kernels = Array(outputChannels).fill().map(() => Array(inputChannels).fill().map(() => matrix.random([kernelSize, kernelSize], -scale, scale)));

  // Initialize biases
  const bias = useBias ? new Array(outputChannels).fill(0) : null;

  // Get activation function
  const activationFn = getActivationFunction(activation);

  return {
    type: 'conv2d',
    kernels,
    bias,
    inputChannels,
    outputChannels,
    kernelSize,
    stride,
    padding,
    activation,

    // Forward pass (simplified 2D convolution)
    forward(input) {
      // Input shape: [batchSize, inputChannels, height, width]
      const batchSize = input.length;
      const inputHeight = input[0][0].length;
      const inputWidth = input[0][0][0].length;

      // Calculate output dimensions
      const outputHeight = Math.floor((inputHeight + 2 * padding - kernelSize) / stride) + 1;
      const outputWidth = Math.floor((inputWidth + 2 * padding - kernelSize) / stride) + 1;

      // Initialize output
      const output = Array(batchSize).fill().map(() => Array(outputChannels).fill().map(() => Array(outputHeight).fill().map(() => new Array(outputWidth).fill(0))));

      // Apply padding to input if needed
      const paddedInput = input;
      if (padding > 0) {
        // Implementation of padding would go here
        // For simplicity, assuming no padding in this example
      }

      // Perform convolution
      for (let b = 0; b < batchSize; b++) {
        for (let oc = 0; oc < outputChannels; oc++) {
          for (let oh = 0; oh < outputHeight; oh++) {
            for (let ow = 0; ow < outputWidth; ow++) {
              let sum = 0;

              // Convolve at this position
              for (let ic = 0; ic < inputChannels; ic++) {
                for (let kh = 0; kh < kernelSize; kh++) {
                  for (let kw = 0; kw < kernelSize; kw++) {
                    const ih = oh * stride + kh - padding;
                    const iw = ow * stride + kw - padding;

                    // Skip if outside input bounds
                    if (ih >= 0 && ih < inputHeight && iw >= 0 && iw < inputWidth) {
                      sum += paddedInput[b][ic][ih][iw] * kernels[oc][ic][kh][kw];
                    }
                  }
                }
              }

              // Add bias if used
              if (useBias) {
                sum += bias[oc];
              }

              output[b][oc][oh][ow] = sum;
            }
          }
        }
      }

      // Apply activation function
      if (activationFn) {
        // Apply activation to each channel
        for (let b = 0; b < batchSize; b++) {
          for (let oc = 0; oc < outputChannels; oc++) {
            output[b][oc] = activationFn.forward(output[b][oc]);
          }
        }
      }

      return output;
    },

    // Update layer parameters
    update(newKernels, newBias) {
      if (newKernels) {
        kernels = newKernels;
      }

      if (newBias && useBias) {
        bias = newBias;
      }
    },

    // Get parameters for optimization
    getParameters() {
      return {
        kernels,
        bias
      };
    }
  };
};

/**
 * Create a recurrent (RNN) layer
 * @param {number} inputSize - Size of input features
 * @param {number} hiddenSize - Size of hidden state
 * @param {Object} options - Additional options
 * @returns {Object} - RNN layer object
 */
neuralNetworks.rnnLayer = function (inputSize, hiddenSize, options = {}) {
  const {
    activation = 'tanh',
    returnSequences = false,
    useBias = true
  } = options;

  // Initialize weights
  const wxh = matrix.random([inputSize, hiddenSize], -0.1, 0.1); // Input to hidden
  const whh = matrix.random([hiddenSize, hiddenSize], -0.1, 0.1); // Hidden to hidden

  // Initialize biases
  const bh = useBias ? new Array(hiddenSize).fill(0) : null;

  // Get activation function
  const activationFn = getActivationFunction(activation);

  return {
    type: 'rnn',
    wxh,
    whh,
    bh,
    inputSize,
    hiddenSize,
    activation,
    returnSequences,

    // Forward pass
    forward(input, initialHidden = null) {
      // Input shape: [batchSize, sequenceLength, inputSize]
      const batchSize = input.length;
      const seqLength = input[0].length;

      // Initialize hidden state if not provided
      let hidden = initialHidden;
      if (!hidden) {
        hidden = Array(batchSize).fill().map(() => new Array(hiddenSize).fill(0));
      }

      // Store all hidden states if returning sequences
      const allHidden = returnSequences ? [hidden] : null;

      // Process sequence
      for (let t = 0; t < seqLength; t++) {
        // Extract inputs at this time step
        const xt = input.map((batch) => batch[t]);

        // Calculate new hidden state: h_t = activation(W_xh * x_t + W_hh * h_{t-1} + b_h)
        const xh = matrix.multiply(xt, wxh);
        const hh = matrix.multiply(hidden, whh);

        // Add the transformed inputs, previous hidden state, and bias
        hidden = xh.map((row, i) => row.map((val, j) => val + hh[i][j] + (useBias ? bh[j] : 0)));

        // Apply activation
        if (activationFn) {
          hidden = activationFn.forward(hidden);
        }

        // Store if returning sequences
        if (returnSequences) {
          allHidden.push(hidden);
        }
      }

      return returnSequences ? allHidden : hidden;
    },

    // Update layer parameters
    update(newWxh, newWhh, newBh) {
      if (newWxh) wxh = newWxh;
      if (newWhh) whh = newWhh;
      if (newBh && useBias) bh = newBh;
    },

    // Get parameters for optimization
    getParameters() {
      return {
        wxh,
        whh,
        bh
      };
    }
  };
};

/**
 * Long Short-Term Memory (LSTM) layer
 * @param {number} inputSize - Size of input features
 * @param {number} hiddenSize - Size of hidden state
 * @param {Object} options - Additional options
 * @returns {Object} - LSTM layer object
 */
neuralNetworks.lstmLayer = function (inputSize, hiddenSize, options = {}) {
  const {
    returnSequences = false,
    useBias = true
  } = options;

  // Initialize weights for the four gates (input, forget, cell, output)
  const weightScale = Math.sqrt(1 / (inputSize + hiddenSize));

  // Input gate
  const wxi = matrix.random([inputSize, hiddenSize], -weightScale, weightScale);
  const whi = matrix.random([hiddenSize, hiddenSize], -weightScale, weightScale);
  const bi = useBias ? new Array(hiddenSize).fill(0) : null;

  // Forget gate
  const wxf = matrix.random([inputSize, hiddenSize], -weightScale, weightScale);
  const whf = matrix.random([hiddenSize, hiddenSize], -weightScale, weightScale);
  const bf = useBias ? new Array(hiddenSize).fill(1) : null; // Initialize with 1 to avoid forgetting everything

  // Cell gate
  const wxc = matrix.random([inputSize, hiddenSize], -weightScale, weightScale);
  const whc = matrix.random([hiddenSize, hiddenSize], -weightScale, weightScale);
  const bc = useBias ? new Array(hiddenSize).fill(0) : null;

  // Output gate
  const wxo = matrix.random([inputSize, hiddenSize], -weightScale, weightScale);
  const who = matrix.random([hiddenSize, hiddenSize], -weightScale, weightScale);
  const bo = useBias ? new Array(hiddenSize).fill(0) : null;

  return {
    type: 'lstm',
    inputSize,
    hiddenSize,
    returnSequences,

    // Forward pass
    forward(input, initialHidden = null, initialCell = null) {
      // Input shape: [batchSize, sequenceLength, inputSize]
      const batchSize = input.length;
      const seqLength = input[0].length;

      // Initialize hidden and cell states if not provided
      let hidden = initialHidden;
      let cell = initialCell;

      if (!hidden) {
        hidden = Array(batchSize).fill().map(() => new Array(hiddenSize).fill(0));
      }

      if (!cell) {
        cell = Array(batchSize).fill().map(() => new Array(hiddenSize).fill(0));
      }

      // Store all hidden states if returning sequences
      const allHidden = returnSequences ? [hidden] : null;

      // Process sequence
      for (let t = 0; t < seqLength; t++) {
        // Extract inputs at this time step
        const xt = input.map((batch) => batch[t]);

        // Input gate
        const xi = matrix.multiply(xt, wxi);
        const hi = matrix.multiply(hidden, whi);
        const i = xi.map((row, i) => row.map((val, j) => machineLearning.sigmoid(val + hi[i][j] + (useBias ? bi[j] : 0))));

        // Forget gate
        const xf = matrix.multiply(xt, wxf);
        const hf = matrix.multiply(hidden, whf);
        const f = xf.map((row, i) => row.map((val, j) => machineLearning.sigmoid(val + hf[i][j] + (useBias ? bf[j] : 0))));

        // Cell gate
        const xc = matrix.multiply(xt, wxc);
        const hc = matrix.multiply(hidden, whc);
        const cHat = xc.map((row, i) => row.map((val, j) => Math.tanh(val + hc[i][j] + (useBias ? bc[j] : 0))));

        // Update cell state
        cell = cell.map((row, i) => row.map((val, j) => f[i][j] * val + i[i][j] * cHat[i][j]));

        // Output gate
        const xo = matrix.multiply(xt, wxo);
        const ho = matrix.multiply(hidden, who);
        const o = xo.map((row, i) => row.map((val, j) => machineLearning.sigmoid(val + ho[i][j] + (useBias ? bo[j] : 0))));

        // Update hidden state
        hidden = cell.map((row, i) => row.map((val, j) => o[i][j] * Math.tanh(val)));

        // Store if returning sequences
        if (returnSequences) {
          allHidden.push(hidden);
        }
      }

      return {
        output: returnSequences ? allHidden : hidden,
        hidden,
        cell
      };
    },

    // Get parameters for optimization
    getParameters() {
      return {
        wxi,
        whi,
        bi,
        wxf,
        whf,
        bf,
        wxc,
        whc,
        bc,
        wxo,
        who,
        bo
      };
    }
  };
};

/**
 * Create a simple feed-forward neural network
 * @param {Array} layerSizes - Array of layer sizes, including input and output
 * @param {Object} options - Network options
 * @returns {Object} - Neural network object
 */
neuralNetworks.feedForward = function (layerSizes, options = {}) {
  const {
    activation = 'relu',
    outputActivation = 'linear',
    weightInit = 'xavier'
  } = options;

  // Create layers
  const layers = [];

  for (let i = 0; i < layerSizes.length - 1; i++) {
    const inputSize = layerSizes[i];
    const outputSize = layerSizes[i + 1];
    const isOutputLayer = i === layerSizes.length - 2;

    layers.push(neuralNetworks.denseLayer(
      inputSize,
      outputSize,
      {
        activation: isOutputLayer ? outputActivation : activation,
        weightInit
      }
    ));
  }

  return {
    layers,

    // Forward pass through the entire network
    forward(input) {
      let output = input;

      for (const layer of layers) {
        output = layer.forward(output);
      }

      return output;
    },

    // Get all network parameters
    getParameters() {
      return layers.map((layer) => layer.getParameters());
    }
  };
};

/**
 * Create a simple CNN for image classification
 * @param {Object} inputShape - Shape of input images [channels, height, width]
 * @param {number} numClasses - Number of output classes
 * @returns {Object} - CNN object
 */
neuralNetworks.simpleCNN = function (inputShape, numClasses) {
  const [channels, height, width] = inputShape;

  // Create convolutional layers
  const conv1 = neuralNetworks.convLayer2d({
    inputChannels: channels,
    outputChannels: 32,
    kernelSize: 3,
    activation: 'relu'
  });

  const conv2 = neuralNetworks.convLayer2d({
    inputChannels: 32,
    outputChannels: 64,
    kernelSize: 3,
    activation: 'relu'
  });

  // Calculate dimensions after convolutions
  const convHeight = height - 4; // After two 3x3 convs with no padding
  const convWidth = width - 4;
  const flattenSize = 64 * convHeight * convWidth;

  // Create dense layers
  const dense1 = neuralNetworks.denseLayer(flattenSize, 128, { activation: 'relu' });
  const output = neuralNetworks.denseLayer(128, numClasses, { activation: 'softmax' });

  return {
    // Forward pass
    forward(input) {
      let x = conv1.forward(input);
      x = conv2.forward(x);

      // Flatten the output
      const flattenedOutput = x.map((sample) => {
        const flattened = [];
        for (const channel of sample) {
          for (const row of channel) {
            for (const val of row) {
              flattened.push(val);
            }
          }
        }
        return flattened;
      });

      x = dense1.forward(flattenedOutput);
      return output.forward(x);
    }
  };
};

/**
 * Create a transformer encoder layer
 * @param {number} modelDim - Model dimension (d_model)
 * @param {number} numHeads - Number of attention heads
 * @param {number} ffnDim - Feed-forward network dimension
 * @returns {Object} - Transformer encoder layer
 */
neuralNetworks.transformerEncoderLayer = function (modelDim, numHeads, ffnDim) {
  // Create multi-head attention
  const mha = {
    // In a real implementation, this would be a full multi-head attention module
    forward(input) {
      // Simplified implementation for brevity
      return input;
    }
  };

  // Create feed-forward network
  const ffn = neuralNetworks.feedForward(
    [modelDim, ffnDim, modelDim],
    { activation: 'relu' }
  );

  return {
    forward(input, mask = null) {
      // Multi-head attention with residual connection and layer normalization
      const attOutput = mha.forward(input, mask);
      const addNorm1 = matrix.add(input, attOutput);
      const layerNorm1 = addNorm1; // Layer normalization would be applied here

      // Feed-forward network with residual connection and layer normalization
      const ffnOutput = ffn.forward(layerNorm1);
      const addNorm2 = matrix.add(layerNorm1, ffnOutput);
      const layerNorm2 = addNorm2; // Layer normalization would be applied here

      return layerNorm2;
    }
  };
};

/**
 * Simple implementation of a neural network optimizer
 * @param {Object} network - Neural network to optimize
 * @param {Object} options - Optimizer options
 * @returns {Object} - Optimizer object
 */
neuralNetworks.optimizer = function (network, options = {}) {
  const {
    learningRate = 0.01,
    type = 'sgd'
  } = options;

  // Get initial parameters
  const parameters = network.getParameters();

  // Initialize momentum if using momentum-based optimizer
  let momentum = null;
  if (type === 'momentum' || type === 'adam') {
    momentum = parameters.map((layerParams) => {
      const layerMomentum = {};
      for (const paramName in layerParams) {
        layerMomentum[paramName] = Array.isArray(layerParams[paramName][0])
          ? layerParams[paramName].map((row) => row.map(() => 0))
          : new Array(layerParams[paramName].length).fill(0);
      }
      return layerMomentum;
    });
  }

  return {
    // Update parameters based on gradients
    step(gradients) {
      for (let i = 0; i < parameters.length; i++) {
        const layerParams = parameters[i];
        const layerGrads = gradients[i];

        for (const paramName in layerParams) {
          const param = layerParams[paramName];
          const grad = layerGrads[paramName];

          if (type === 'sgd') {
            // Stochastic gradient descent
            if (Array.isArray(param[0])) {
              // 2D parameters (weights)
              for (let i = 0; i < param.length; i++) {
                for (let j = 0; j < param[i].length; j++) {
                  param[i][j] -= learningRate * grad[i][j];
                }
              }
            } else {
              // 1D parameters (biases)
              for (let i = 0; i < param.length; i++) {
                param[i] -= learningRate * grad[i];
              }
            }
          } else if (type === 'momentum') {
            // Momentum update
            const m = momentum[i][paramName];
            const beta = 0.9; // Momentum factor

            if (Array.isArray(param[0])) {
              for (let i = 0; i < param.length; i++) {
                for (let j = 0; j < param[i].length; j++) {
                  m[i][j] = beta * m[i][j] + (1 - beta) * grad[i][j];
                  param[i][j] -= learningRate * m[i][j];
                }
              }
            } else {
              for (let i = 0; i < param.length; i++) {
                m[i] = beta * m[i] + (1 - beta) * grad[i];
                param[i] -= learningRate * m[i];
              }
            }
          }
          // Other optimizers (Adam, RMSProp, etc.) would be implemented here
        }
      }
    }
  };
};

/**
 * Helper function to get activation function
 * @param {string} name - Name of the activation function
 * @returns {Object} - Activation function object
 */
function getActivationFunction(name) {
  const functions = {
    relu: {
      forward: (x) => {
        if (Array.isArray(x[0])) {
          return x.map((row) => row.map((v) => Math.max(0, v)));
        }
        return x.map((v) => Math.max(0, v));
      }
    },
    sigmoid: {
      forward: (x) => {
        if (Array.isArray(x[0])) {
          return x.map((row) => row.map((v) => 1 / (1 + Math.exp(-v))));
        }
        return x.map((v) => 1 / (1 + Math.exp(-v)));
      }
    },
    tanh: {
      forward: (x) => {
        if (Array.isArray(x[0])) {
          return x.map((row) => row.map(Math.tanh));
        }
        return x.map(Math.tanh);
      }
    },
    softmax: {
      forward: (x) => {
        if (Array.isArray(x[0])) {
          return x.map(machineLearning.softmax);
        }
        return machineLearning.softmax(x);
      }
    },
    linear: {
      forward: (x) => x // Identity function
    }
  };

  return functions[name] || null;
}

/**
 * Save a trained neural network to a JSON structure
 * @param {Object} network - Neural network to save
 * @returns {Object} - JSON representation of the network
 */
neuralNetworks.saveNetwork = function (network) {
  const layersData = network.layers.map((layer) => {
    const params = layer.getParameters();
    return {
      type: layer.type,
      params,
      config: {
        inputSize: layer.inputSize,
        outputSize: layer.outputSize,
        activation: layer.activation
      }
    };
  });

  return {
    layers: layersData
  };
};

/**
 * Load a neural network from a JSON structure
 * @param {Object} data - JSON representation of the network
 * @returns {Object} - Reconstructed neural network
 */
neuralNetworks.loadNetwork = function (data) {
  const layers = data.layers.map((layerData) => {
    const { type, params, config } = layerData;

    if (type === 'dense') {
      const layer = neuralNetworks.denseLayer(
        config.inputSize,
        config.outputSize,
        { activation: config.activation }
      );

      layer.update(params.weights, params.bias);
      return layer;
    }

    // Add other layer types as needed
    return null;
  });

  return {
    layers,

    forward(input) {
      let output = input;

      for (const layer of layers) {
        output = layer.forward(output);
      }

      return output;
    },

    getParameters() {
      return layers.map((layer) => layer.getParameters());
    }
  };
};

module.exports = neuralNetworks;
