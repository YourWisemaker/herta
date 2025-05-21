/**
 * Language Model Mathematics module for herta.js
 * Provides mathematical tools for analyzing, designing, and evaluating
 * large language models and transformer architectures
 */

const matrix = require('../core/matrix');
const statistics = require('../core/statistics');
const machineLearning = require('./machineLearning');

const languageModelMath = {};

/**
 * Calculate self-attention scores in transformer models
 * @param {Array} queries - Query vectors Q
 * @param {Array} keys - Key vectors K
 * @param {number} scalingFactor - Optional scaling factor (typically 1/sqrt(d_k))
 * @returns {Array} - Attention scores matrix
 */
languageModelMath.selfAttention = function (queries, keys, scalingFactor = null) {
  // Default scaling factor is 1/sqrt(d_k) where d_k is key dimension
  if (scalingFactor === null) {
    const keyDimension = keys[0].length;
    scalingFactor = 1 / Math.sqrt(keyDimension);
  }

  // Calculate attention scores: scaled dot product of Q and K^T
  const scores = matrix.multiply(queries, matrix.transpose(keys));

  // Apply scaling factor
  const scaledScores = matrix.multiply(scores, scalingFactor);

  // Apply softmax along the last dimension
  const attentionWeights = [];
  for (let i = 0; i < scaledScores.length; i++) {
    attentionWeights.push(machineLearning.softmax(scaledScores[i]));
  }

  return attentionWeights;
};

/**
 * Apply attention weights to values in transformer attention mechanism
 * @param {Array} attentionWeights - Attention weights matrix
 * @param {Array} values - Value vectors V
 * @returns {Array} - Output of attention mechanism
 */
languageModelMath.applyAttention = function (attentionWeights, values) {
  // Apply attention weights to values: attention_weights @ V
  return matrix.multiply(attentionWeights, values);
};

/**
 * Calculate multi-head attention
 * @param {Array} queries - Query vectors Q
 * @param {Array} keys - Key vectors K
 * @param {Array} values - Value vectors V
 * @param {Array} weights - Projection weights for each head
 * @returns {Array} - Concatenated multi-head attention output
 */
languageModelMath.multiHeadAttention = function (queries, keys, values, weights) {
  const numHeads = weights.length;
  const headOutputs = [];

  for (let h = 0; h < numHeads; h++) {
    const {
      wq, wk, wv, wo
    } = weights[h];

    // Project inputs to each head
    const q = matrix.multiply(queries, wq);
    const k = matrix.multiply(keys, wk);
    const v = matrix.multiply(values, wv);

    // Calculate attention
    const attentionWeights = this.selfAttention(q, k);
    const attentionOutput = this.applyAttention(attentionWeights, v);

    // Project output
    const headOutput = matrix.multiply(attentionOutput, wo);
    headOutputs.push(headOutput);
  }

  // Concatenate outputs from all heads
  // In a real implementation, we would reshape and concat along feature dimension
  // Here we'll just flatten the arrays
  const result = [];
  for (let i = 0; i < headOutputs[0].length; i++) {
    const concatenated = [];
    for (let h = 0; h < numHeads; h++) {
      concatenated.push(...headOutputs[h][i]);
    }
    result.push(concatenated);
  }

  return result;
};

/**
 * Apply layer normalization
 * @param {Array} x - Input tensor
 * @param {number} epsilon - Small constant for numerical stability
 * @returns {Array} - Normalized tensor
 */
languageModelMath.layerNorm = function (x, epsilon = 1e-5) {
  const normalized = [];

  for (let i = 0; i < x.length; i++) {
    const xi = x[i];

    // Calculate mean and variance
    const mean = xi.reduce((sum, val) => sum + val, 0) / xi.length;

    const variance = xi.reduce((sum, val) => sum + (val - mean) ** 2, 0) / xi.length;

    // Normalize
    const xNorm = xi.map((val) => (val - mean) / Math.sqrt(variance + epsilon));

    normalized.push(xNorm);
  }

  return normalized;
};

/**
 * Apply position encoding to token embeddings
 * @param {Array} embeddings - Token embeddings
 * @param {string} method - Encoding method ('sinusoidal' or 'learned')
 * @param {Array} learnedPositions - Learned position embeddings (if method is 'learned')
 * @returns {Array} - Embeddings with position encoding
 */
languageModelMath.positionEncoding = function (embeddings, method = 'sinusoidal', learnedPositions = null) {
  const sequenceLength = embeddings.length;
  const embeddingDim = embeddings[0].length;
  const result = [];

  if (method === 'sinusoidal') {
    // Sinusoidal position encoding from "Attention Is All You Need"
    for (let pos = 0; pos < sequenceLength; pos++) {
      const positionVector = new Array(embeddingDim).fill(0);

      for (let i = 0; i < embeddingDim; i += 2) {
        const freq = 1 / 10000 ** (i / embeddingDim);

        if (i < embeddingDim) {
          positionVector[i] = Math.sin(pos * freq);
        }

        if (i + 1 < embeddingDim) {
          positionVector[i + 1] = Math.cos(pos * freq);
        }
      }

      // Add position encoding to token embedding
      result.push(embeddings[pos].map((val, idx) => val + positionVector[idx]));
    }
  } else if (method === 'learned' && learnedPositions) {
    // Apply learned position embeddings
    for (let pos = 0; pos < sequenceLength; pos++) {
      if (pos >= learnedPositions.length) {
        throw new Error('Not enough learned position vectors');
      }

      result.push(embeddings[pos].map((val, idx) => val + learnedPositions[pos][idx]));
    }
  } else {
    throw new Error('Invalid position encoding method or missing learned positions');
  }

  return result;
};

/**
 * Create causal (triangular) attention mask for decoder self-attention
 * @param {number} sequenceLength - Length of the sequence
 * @returns {Array} - Causal mask where future positions are masked
 */
languageModelMath.createCausalMask = function (sequenceLength) {
  const mask = [];

  for (let i = 0; i < sequenceLength; i++) {
    const row = new Array(sequenceLength).fill(0);

    // Set mask to 1 for valid positions (current and previous positions)
    for (let j = 0; j <= i; j++) {
      row[j] = 1;
    }

    mask.push(row);
  }

  return mask;
};

/**
 * Apply attention mask to attention scores
 * @param {Array} scores - Attention scores
 * @param {Array} mask - Attention mask (1 for keep, 0 for mask)
 * @param {number} maskValue - Value to replace masked positions with
 * @returns {Array} - Masked attention scores
 */
languageModelMath.applyAttentionMask = function (scores, mask, maskValue = -1e9) {
  const maskedScores = [];

  for (let i = 0; i < scores.length; i++) {
    const row = [];

    for (let j = 0; j < scores[i].length; j++) {
      if (mask[i][j] === 0) {
        row.push(maskValue);
      } else {
        row.push(scores[i][j]);
      }
    }

    maskedScores.push(row);
  }

  return maskedScores;
};

/**
 * Calculate perplexity for language model evaluation
 * @param {Array} logProbs - Log probabilities of the true tokens
 * @returns {number} - Perplexity score
 */
languageModelMath.perplexity = function (logProbs) {
  const sumLogProbs = logProbs.reduce((sum, val) => sum + val, 0);
  const avgNegLogProb = -sumLogProbs / logProbs.length;

  return Math.exp(avgNegLogProb);
};

/**
 * Calculate cross-entropy loss for language modeling
 * @param {Array} logits - Model logits (unnormalized predictions)
 * @param {Array} targets - Target token indices
 * @returns {number} - Cross-entropy loss
 */
languageModelMath.crossEntropyLoss = function (logits, targets) {
  let totalLoss = 0;

  for (let i = 0; i < targets.length; i++) {
    const targetIdx = targets[i];

    // Apply softmax to get probabilities
    const probs = machineLearning.softmax(logits[i]);

    // Calculate negative log likelihood of the target token
    const nll = -Math.log(probs[targetIdx] + 1e-10); // Add small epsilon to prevent log(0)

    totalLoss += nll;
  }

  return totalLoss / targets.length;
};

/**
 * Apply top-k sampling for text generation
 * @param {Array} logits - Unnormalized logits for next token
 * @param {number} k - Number of top tokens to sample from
 * @returns {number} - Sampled token index
 */
languageModelMath.topKSampling = function (logits, k) {
  // Convert logits to probabilities
  const probs = machineLearning.softmax(logits);

  // Create (index, probability) pairs
  const indexProbPairs = probs.map((p, idx) => [idx, p]);

  // Sort by probability in descending order
  indexProbPairs.sort((a, b) => b[1] - a[1]);

  // Take top k items
  const topK = indexProbPairs.slice(0, k);

  // Normalize probabilities of top k items
  const sumProbs = topK.reduce((sum, pair) => sum + pair[1], 0);
  const normalizedTopK = topK.map((pair) => [pair[0], pair[1] / sumProbs]);

  // Sample from the normalized distribution
  const r = Math.random();
  let cumulativeProb = 0;

  for (const [idx, prob] of normalizedTopK) {
    cumulativeProb += prob;
    if (r <= cumulativeProb) {
      return idx;
    }
  }

  // Fallback in case of numerical issues
  return normalizedTopK[0][0];
};

/**
 * Apply nucleus (top-p) sampling for text generation
 * @param {Array} logits - Unnormalized logits for next token
 * @param {number} p - Probability threshold (typically 0.9)
 * @returns {number} - Sampled token index
 */
languageModelMath.nucleusSampling = function (logits, p = 0.9) {
  // Convert logits to probabilities
  const probs = machineLearning.softmax(logits);

  // Create (index, probability) pairs
  const indexProbPairs = probs.map((p, idx) => [idx, p]);

  // Sort by probability in descending order
  indexProbPairs.sort((a, b) => b[1] - a[1]);

  // Find the smallest set of tokens whose cumulative probability exceeds p
  let cumulativeProb = 0;
  const selectedIndices = [];

  for (const [idx, prob] of indexProbPairs) {
    selectedIndices.push(idx);
    cumulativeProb += prob;

    if (cumulativeProb >= p) {
      break;
    }
  }

  // Create a distribution limited to the selected tokens
  const selectedProbs = [];
  let sumSelectedProbs = 0;

  for (const idx of selectedIndices) {
    selectedProbs.push([idx, probs[idx]]);
    sumSelectedProbs += probs[idx];
  }

  // Normalize
  const normalizedProbs = selectedProbs.map((pair) => [pair[0], pair[1] / sumSelectedProbs]);

  // Sample from the normalized distribution
  const r = Math.random();
  let cumProb = 0;

  for (const [idx, prob] of normalizedProbs) {
    cumProb += prob;
    if (r <= cumProb) {
      return idx;
    }
  }

  // Fallback in case of numerical issues
  return selectedIndices[0];
};

/**
 * Beam search for sequence generation
 * @param {Function} scoreNextToken - Function that returns logits for the next token given a sequence
 * @param {Array} initialTokens - Initial token sequence
 * @param {number} beamWidth - Beam width
 * @param {number} maxLength - Maximum sequence length
 * @param {number} endTokenId - Token ID that indicates the end of a sequence
 * @returns {Array} - Best sequence after beam search
 */
languageModelMath.beamSearch = function (
  scoreNextToken,
  initialTokens,
  beamWidth = 3,
  maxLength = 20,
  endTokenId = 0
) {
  // Initial beam with just the seed sequence
  let beams = [
    {
      tokens: [...initialTokens],
      score: 0,
      finished: false
    }
  ];

  for (let step = 0; step < maxLength; step++) {
    const candidates = [];

    // For each beam, generate possible extensions
    for (const beam of beams) {
      if (beam.finished) {
        // Keep finished beams
        candidates.push(beam);
        continue;
      }

      // Get logits for the next token
      const logits = scoreNextToken(beam.tokens);

      // Convert to log probabilities
      const logProbs = machineLearning.softmax(logits).map((p) => Math.log(p + 1e-10));

      // Get top k extensions
      const indexLogProbPairs = logProbs.map((lp, idx) => [idx, lp]);

      // Sort by log probability
      indexLogProbPairs.sort((a, b) => b[1] - a[1]);

      // Take top beamWidth extensions
      const topK = indexLogProbPairs.slice(0, beamWidth);

      // Add each extension as a candidate
      for (const [tokenId, logProb] of topK) {
        const newTokens = [...beam.tokens, tokenId];
        const newScore = beam.score + logProb;
        const newFinished = tokenId === endTokenId;

        candidates.push({
          tokens: newTokens,
          score: newScore,
          finished: newFinished
        });
      }
    }

    // Sort candidates by score and keep top beamWidth
    candidates.sort((a, b) => b.score - a.score);
    beams = candidates.slice(0, beamWidth);

    // Check if all beams are finished
    if (beams.every((beam) => beam.finished)) {
      break;
    }
  }

  // Return the highest scoring beam
  return beams[0].tokens;
};

/**
 * Calculate BLEU score for machine translation evaluation
 * @param {string} candidate - Candidate translation
 * @param {Array} references - Reference translations
 * @param {number} maxNGramOrder - Maximum n-gram order to consider
 * @returns {number} - BLEU score
 */
languageModelMath.bleuScore = function (candidate, references, maxNGramOrder = 4) {
  // Tokenize
  const candidateTokens = candidate.split(/\s+/);
  const referenceTokens = references.map((ref) => ref.split(/\s+/));

  // Calculate modified precision for each n-gram order
  const precisions = [];

  for (let n = 1; n <= maxNGramOrder; n++) {
    // Count n-grams in candidate
    const candidateNGrams = {};
    for (let i = 0; i <= candidateTokens.length - n; i++) {
      const ngram = candidateTokens.slice(i, i + n).join(' ');
      candidateNGrams[ngram] = (candidateNGrams[ngram] || 0) + 1;
    }

    // Count maximum reference n-grams
    const maxRefNGrams = {};
    for (const refTokens of referenceTokens) {
      const refNGrams = {};
      for (let i = 0; i <= refTokens.length - n; i++) {
        const ngram = refTokens.slice(i, i + n).join(' ');
        refNGrams[ngram] = (refNGrams[ngram] || 0) + 1;
      }

      // Update max counts
      for (const ngram in refNGrams) {
        maxRefNGrams[ngram] = Math.max(maxRefNGrams[ngram] || 0, refNGrams[ngram]);
      }
    }

    // Calculate clipped counts
    let clippedCount = 0;
    let totalCount = 0;

    for (const ngram in candidateNGrams) {
      const count = candidateNGrams[ngram];
      const clippedNGramCount = Math.min(count, maxRefNGrams[ngram] || 0);

      clippedCount += clippedNGramCount;
      totalCount += count;
    }

    // Precision for this n-gram order
    precisions.push(totalCount === 0 ? 0 : clippedCount / totalCount);
  }

  // Calculate brevity penalty
  const candidateLength = candidateTokens.length;

  // Find closest reference length
  let closestRefLength = referenceTokens[0].length;
  let closestDiff = Math.abs(candidateLength - closestRefLength);

  for (let i = 1; i < referenceTokens.length; i++) {
    const diff = Math.abs(candidateLength - referenceTokens[i].length);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestRefLength = referenceTokens[i].length;
    }
  }

  // Brevity penalty
  const bp = candidateLength >= closestRefLength ? 1 : Math.exp(1 - closestRefLength / candidateLength);

  // Calculate final BLEU score
  const avgLogPrecision = precisions.reduce((sum, p) => sum + (Math.log(p || 1e-10) / maxNGramOrder), 0);

  return bp * Math.exp(avgLogPrecision);
};

/**
 * Create a sinusoidal rotary positional embedding (RoPE)
 * @param {number} dim - Embedding dimension
 * @param {number} maxSequenceLength - Maximum sequence length
 * @param {number} base - Base for frequency calculation
 * @returns {Array} - Rotation matrices for each position
 */
languageModelMath.createRotaryEmbedding = function (dim, maxSequenceLength, base = 10000) {
  const rotaryEmbeddings = [];

  for (let pos = 0; pos < maxSequenceLength; pos++) {
    const rotations = [];

    for (let i = 0; i < dim; i += 2) {
      const theta = pos / base ** (i / dim);

      // Create 2D rotation matrix
      const rotationMatrix = [
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)]
      ];

      rotations.push(rotationMatrix);
    }

    rotaryEmbeddings.push(rotations);
  }

  return rotaryEmbeddings;
};

/**
 * Apply rotary positional embeddings to queries and keys
 * @param {Array} x - Input tensor (queries or keys)
 * @param {Array} rotaryEmbeddings - Rotary embeddings
 * @returns {Array} - Tensor with rotary encoding applied
 */
languageModelMath.applyRotaryEmbedding = function (x, rotaryEmbeddings) {
  const result = [];

  for (let i = 0; i < x.length; i++) {
    const pos = i % rotaryEmbeddings.length;
    const rotations = rotaryEmbeddings[pos];
    const embedding = x[i];
    const rotated = new Array(embedding.length).fill(0);

    // Apply each 2D rotation to pairs of features
    for (let j = 0; j < embedding.length; j += 2) {
      if (j + 1 >= embedding.length) continue;

      const rotationIdx = (j / 2) % rotations.length;
      const rotationMatrix = rotations[rotationIdx];

      const x1 = embedding[j];
      const x2 = embedding[j + 1];

      rotated[j] = rotationMatrix[0][0] * x1 + rotationMatrix[0][1] * x2;
      rotated[j + 1] = rotationMatrix[1][0] * x1 + rotationMatrix[1][1] * x2;
    }

    result.push(rotated);
  }

  return result;
};

/**
 * Flash attention - an efficient attention implementation
 * @param {Array} queries - Query vectors
 * @param {Array} keys - Key vectors
 * @param {Array} values - Value vectors
 * @param {number} blockSize - Block size for tiling
 * @returns {Array} - Output of attention mechanism
 */
languageModelMath.flashAttention = function (queries, keys, values, blockSize = 32) {
  const seqLen = queries.length;
  const head_dim = queries[0].length;
  const scaling = 1 / Math.sqrt(head_dim);

  // Simplified flash attention that processes the data in blocks
  // Real flash attention uses a more complex tiling strategy and in-place updates

  const output = new Array(seqLen).fill(0).map(() => new Array(head_dim).fill(0));
  const logsumexp = new Array(seqLen).fill(-Infinity);

  // Process in blocks to simulate memory-efficient attention
  for (let blockStart = 0; blockStart < seqLen; blockStart += blockSize) {
    const blockEnd = Math.min(blockStart + blockSize, seqLen);

    for (let i = 0; i < seqLen; i++) {
      let rowMax = -Infinity;
      const expValues = new Array(blockEnd - blockStart).fill(0);

      // Find max value for numerical stability
      for (let j = blockStart; j < blockEnd; j++) {
        const score = matrix.dot(queries[i], keys[j]) * scaling;
        rowMax = Math.max(rowMax, score);
      }

      // Calculate exp values with improved numerical stability
      let expSum = 0;
      for (let j = blockStart; j < blockEnd; j++) {
        const score = matrix.dot(queries[i], keys[j]) * scaling;
        const expScore = Math.exp(score - rowMax);
        expValues[j - blockStart] = expScore;
        expSum += expScore;
      }

      // Adjust for previous blocks (if any)
      const oldMax = logsumexp[i];
      const newMax = Math.max(oldMax, rowMax);
      let normalizer;

      if (oldMax === -Infinity) {
        normalizer = expSum;
      } else {
        normalizer = Math.exp(oldMax - newMax) + expSum;
      }

      logsumexp[i] = newMax + Math.log(normalizer);

      // Update output
      const scale = Math.exp(rowMax - logsumexp[i]);
      for (let j = blockStart; j < blockEnd; j++) {
        const weight = expValues[j - blockStart] * scale;
        for (let d = 0; d < head_dim; d++) {
          output[i][d] += weight * values[j][d];
        }
      }
    }
  }

  return output;
};

/**
 * Calculate token-level BPE (Byte Pair Encoding) merges for tokenization
 * @param {string} text - Input text
 * @param {number} numMerges - Number of merge operations to perform
 * @returns {Object} - BPE vocabulary and merge operations
 */
languageModelMath.bytePairEncoding = function (text, numMerges) {
  // Initialize with character-level vocabulary
  let tokens = text.split('').map((c) => c);

  // Count pairs
  const countPairs = (tokens) => {
    const pairCounts = {};

    for (let i = 0; i < tokens.length - 1; i++) {
      const pair = `${tokens[i]},${tokens[i + 1]}`;
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }

    return pairCounts;
  };

  // Perform merge operations
  const mergeOperations = [];
  const vocabulary = new Set(tokens);

  for (let i = 0; i < numMerges; i++) {
    const pairCounts = countPairs(tokens);

    // Find most frequent pair
    let bestPair = null;
    let maxCount = 0;

    for (const pair in pairCounts) {
      if (pairCounts[pair] > maxCount) {
        maxCount = pairCounts[pair];
        bestPair = pair;
      }
    }

    if (!bestPair) break;

    // Split pair into original tokens
    const [first, second] = bestPair.split(',');
    const newToken = first + second;

    // Add to vocabulary and record merge operation
    vocabulary.add(newToken);
    mergeOperations.push([first, second, newToken]);

    // Apply the merge
    const newTokens = [];
    for (let j = 0; j < tokens.length; j++) {
      if (j < tokens.length - 1 && tokens[j] === first && tokens[j + 1] === second) {
        newTokens.push(newToken);
        j++; // Skip the next token
      } else {
        newTokens.push(tokens[j]);
      }
    }

    tokens = newTokens;
  }

  return {
    vocabulary: Array.from(vocabulary),
    mergeOperations,
    encode(text) {
      // Simple encoding function using the learned merges
      let tokens = text.split('');

      // Apply merges in order
      for (const [first, second, merged] of mergeOperations) {
        const newTokens = [];
        for (let i = 0; i < tokens.length; i++) {
          if (i < tokens.length - 1 && tokens[i] === first && tokens[i + 1] === second) {
            newTokens.push(merged);
            i++; // Skip the next token
          } else {
            newTokens.push(tokens[i]);
          }
        }
        tokens = newTokens;
      }

      return tokens;
    }
  };
};

/**
 * Calculate Kullback-Leibler divergence between two distributions
 * @param {Array} p - First probability distribution
 * @param {Array} q - Second probability distribution
 * @returns {number} - KL divergence
 */
languageModelMath.klDivergence = function (p, q) {
  if (p.length !== q.length) {
    throw new Error('Distributions must have the same length');
  }

  let divergence = 0;

  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0) {
      // Avoid log(0)
      const qi = Math.max(q[i], 1e-10);
      divergence += p[i] * Math.log(p[i] / qi);
    }
  }

  return divergence;
};

/**
 * Calculate metrics for language model evaluation
 * @param {Array} predictions - Model predictions (token IDs)
 * @param {Array} targets - Target token IDs
 * @param {Object} vocabSize - Size of the vocabulary
 * @returns {Object} - Evaluation metrics
 */
languageModelMath.evaluateLanguageModel = function (predictions, targets, vocabSize) {
  // Calculate accuracy
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i] === targets[i]) {
      correct++;
    }
  }
  const accuracy = correct / predictions.length;

  // Calculate perplexity
  let crossEntropy = 0;
  for (let i = 0; i < predictions.length; i++) {
    // One-hot encode the target
    const target = new Array(vocabSize).fill(0);
    target[targets[i]] = 1;

    // Convert prediction to probability distribution
    const prediction = new Array(vocabSize).fill(0);
    prediction[predictions[i]] = 1;

    // Calculate cross-entropy loss
    crossEntropy -= Math.log(prediction[targets[i]] || 1e-10);
  }

  const avgCrossEntropy = crossEntropy / predictions.length;
  const perplexity = Math.exp(avgCrossEntropy);

  return {
    accuracy,
    perplexity,
    crossEntropy: avgCrossEntropy
  };
};

module.exports = languageModelMath;
