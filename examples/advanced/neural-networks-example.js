/**
 * Neural Networks Example with Herta.js
 * Demonstrates creating, training, and using neural network models
 */

const herta = require('../../src/index.js');

console.log('Herta.js Neural Networks Example');
console.log('================================\n');

// Create a simple dataset for binary classification
function generateData(n = 100) {
  const data = [];
  for (let i = 0; i < n; i++) {
    // Create two features
    const x1 = Math.random() * 2 - 1;
    const x2 = Math.random() * 2 - 1;
    
    // Label: 1 if x1^2 + x2^2 < 0.5, otherwise 0
    const label = (x1 * x1 + x2 * x2) < 0.5 ? 1 : 0;
    
    data.push({ input: [x1, x2], output: [label] });
  }
  return data;
}

// Generate training and testing data
const trainingData = generateData(200);
const testingData = generateData(50);

// Create a feedforward neural network
console.log('Creating a feedforward neural network...');
const model = herta.neuralNetworks.feedForward(
  [2, 8, 4, 1], // Layer sizes: 2 inputs, 2 hidden layers (8 and 4 neurons), 1 output
  { 
    activation: 'relu',      // ReLU activation for hidden layers
    outputActivation: 'sigmoid', // Sigmoid for output layer (binary classification)
    learningRate: 0.01
  }
);

// Train the model
console.log('Training the neural network...');
const trainResults = model.train(trainingData, {
  epochs: 100,
  batchSize: 10,
  onEpochComplete: (epoch, error) => {
    if (epoch % 10 === 0) {
      console.log(`Epoch ${epoch}: error = ${error.toFixed(4)}`);
    }
  }
});

// Test the model
console.log('\nTesting the neural network...');
let correct = 0;
testingData.forEach(sample => {
  const prediction = model.forward(sample.input);
  const predictedClass = prediction[0] > 0.5 ? 1 : 0;
  const actualClass = sample.output[0];
  
  if (predictedClass === actualClass) {
    correct++;
  }
});

console.log(`Accuracy: ${(correct / testingData.length * 100).toFixed(2)}%`);

// Visualize a few predictions
console.log('\nSample predictions:');
for (let i = 0; i < 5; i++) {
  const sample = testingData[i];
  const prediction = model.forward(sample.input);
  console.log(`Input: [${sample.input.map(x => x.toFixed(2)).join(', ')}]`);
  console.log(`Actual: ${sample.output[0]}, Predicted: ${prediction[0].toFixed(4)} (Class: ${prediction[0] > 0.5 ? 1 : 0})`);
  console.log();
}

// Create a convolutional layer for image processing
console.log('Creating a convolutional layer...');
const convLayer = herta.neuralNetworks.convLayer2d({
  inputChannels: 1,
  outputChannels: 16,
  kernelSize: 3,
  stride: 1,
  padding: 1,
  activation: 'relu'
});

// Create a mock 8x8 grayscale image
const mockImage = Array(8).fill().map(() => Array(8).fill().map(() => Math.random()));
console.log('Mock image (8x8):');
mockImage.forEach(row => {
  console.log(row.map(x => x.toFixed(2)).join(' '));
});

// Process the image through the convolutional layer
console.log('\nApplying convolution...');
const { output: convOutput } = convLayer.forward([mockImage]);
console.log(`Convolution output shape: ${convOutput.length}x${convOutput[0].length}x${convOutput[0][0].length}`);

console.log('\nNeural Networks example completed successfully!');
