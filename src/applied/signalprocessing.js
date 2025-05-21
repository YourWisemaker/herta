/**
 * Signal Processing module for herta.js
 * Provides Fourier transforms, filters, and signal processing algorithms
 */

const Complex = require('complex.js');
const complex = require('../core/complex');
const matrix = require('../core/matrix');

const signalProcessing = {};

/**
 * Fast Fourier Transform (FFT) implementation using Cooley-Tukey algorithm
 * @param {Array} signal - Input signal (real or complex values)
 * @param {boolean} [inverse=false] - Whether to compute inverse FFT
 * @returns {Array} - Complex spectrum
 */
signalProcessing.fft = function (signal, inverse = false) {
  // Ensure signal length is power of 2
  const n = signal.length;
  if (n & (n - 1)) {
    throw new Error('FFT requires signal length to be a power of 2');
  }

  // Convert input to complex numbers if they aren't already
  const complexSignal = signal.map((val) => {
    if (val instanceof Complex) {
      return val;
    } if (typeof val === 'object' && 're' in val && 'im' in val) {
      return new Complex(val.re, val.im);
    }
    return new Complex(val, 0);
  });

  // Recursive FFT implementation
  function fftRecursive(x) {
    const N = x.length;

    // Base case
    if (N === 1) return [x[0]];

    // Split into even and odd indices
    const even = [];
    const odd = [];
    for (let i = 0; i < N; i += 2) {
      even.push(x[i]);
      if (i + 1 < N) {
        odd.push(x[i + 1]);
      }
    }

    // Recursive FFT on each half
    const evenFFT = fftRecursive(even);
    const oddFFT = fftRecursive(odd);

    // Combine results
    const result = new Array(N);
    for (let k = 0; k < N / 2; k++) {
      const angle = (inverse ? 2 : -2) * Math.PI * k / N;
      const t = new Complex(Math.cos(angle), Math.sin(angle)).mul(oddFFT[k]);
      result[k] = evenFFT[k].add(t);
      result[k + N / 2] = evenFFT[k].sub(t);
    }

    return result;
  }

  // Compute FFT
  let result = fftRecursive(complexSignal);

  // Scale if inverse
  if (inverse) {
    result = result.map((x) => x.div(n));
  }

  return result;
};

/**
 * Inverse Fast Fourier Transform
 * @param {Array} spectrum - Input spectrum (complex values)
 * @returns {Array} - Reconstructed signal
 */
signalProcessing.ifft = function (spectrum) {
  return this.fft(spectrum, true);
};

/**
 * Discrete Fourier Transform (DFT) - slower but works with any length
 * @param {Array} signal - Input signal
 * @param {boolean} [inverse=false] - Whether to compute inverse DFT
 * @returns {Array} - Complex spectrum
 */
signalProcessing.dft = function (signal, inverse = false) {
  const N = signal.length;
  const result = new Array(N);

  // Convert input to complex numbers if needed
  const complexSignal = signal.map((val) => {
    if (val instanceof Complex) {
      return val;
    } if (typeof val === 'object' && 're' in val && 'im' in val) {
      return new Complex(val.re, val.im);
    }
    return new Complex(val, 0);
  });

  for (let k = 0; k < N; k++) {
    result[k] = new Complex(0, 0);
    for (let n = 0; n < N; n++) {
      const angle = (inverse ? 2 : -2) * Math.PI * k * n / N;
      const expTerm = new Complex(Math.cos(angle), Math.sin(angle));
      result[k] = result[k].add(complexSignal[n].mul(expTerm));
    }

    // Scale if inverse
    if (inverse) {
      result[k] = result[k].div(N);
    }
  }

  return result;
};

/**
 * Inverse Discrete Fourier Transform
 * @param {Array} spectrum - Input spectrum (complex values)
 * @returns {Array} - Reconstructed signal
 */
signalProcessing.idft = function (spectrum) {
  return this.dft(spectrum, true);
};

/**
 * Create a window function
 * @param {string} type - Window type ('rectangular', 'hamming', 'hanning', 'blackman', 'kaiser')
 * @param {number} length - Window length
 * @param {number} [param] - Additional parameter for some window types (e.g., beta for Kaiser)
 * @returns {Array} - Window function values
 */
signalProcessing.window = function (type, length, param) {
  const window = new Array(length);

  switch (type.toLowerCase()) {
    case 'rectangular':
      for (let i = 0; i < length; i++) {
        window[i] = 1;
      }
      break;

    case 'hamming':
      for (let i = 0; i < length; i++) {
        window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1));
      }
      break;

    case 'hanning':
      for (let i = 0; i < length; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
      }
      break;

    case 'blackman':
      for (let i = 0; i < length; i++) {
        window[i] = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1))
                    + 0.08 * Math.cos(4 * Math.PI * i / (length - 1));
      }
      break;

    case 'kaiser':
      const beta = param || 3;

      // Bessel function I0
      function besselI0(x) {
        let sum = 1;
        let term = 1;

        for (let i = 1; i <= 20; i++) {
          term *= (x / (2 * i)) ** 2;
          sum += term;
          if (term < 1e-10) break;
        }

        return sum;
      }

      for (let i = 0; i < length; i++) {
        const x = (2 * i / (length - 1)) - 1; // Map to [-1, 1]
        window[i] = besselI0(beta * Math.sqrt(1 - x * x)) / besselI0(beta);
      }
      break;

    default:
      throw new Error(`Unknown window type: ${type}`);
  }

  return window;
};

/**
 * Apply a window to a signal
 * @param {Array} signal - Input signal
 * @param {string|Array} window - Window type or window values
 * @param {number} [param] - Additional window parameter
 * @returns {Array} - Windowed signal
 */
signalProcessing.applyWindow = function (signal, window, param) {
  const N = signal.length;
  let windowValues;

  if (typeof window === 'string') {
    windowValues = this.window(window, N, param);
  } else if (Array.isArray(window)) {
    windowValues = window;
  } else {
    throw new Error('Window must be a string or array');
  }

  if (windowValues.length !== N) {
    throw new Error('Window length must match signal length');
  }

  // Apply window
  return signal.map((val, i) => {
    if (val instanceof Complex) {
      return val.mul(windowValues[i]);
    }
    return val * windowValues[i];
  });
};

/**
 * Design FIR filter using window method
 * @param {string} type - Filter type ('lowpass', 'highpass', 'bandpass', 'bandstop')
 * @param {number} order - Filter order
 * @param {Array} cutoff - Cutoff frequency or frequencies normalized to [0, 1]
 * @param {string} [windowType='hamming'] - Window function type
 * @returns {Array} - Filter coefficients
 */
signalProcessing.firFilter = function (type, order, cutoff, windowType = 'hamming') {
  if (order % 2 === 0) {
    order++; // Ensure odd filter order
  }

  const n = (order - 1) / 2;
  const h = new Array(order);

  // Generate ideal impulse response
  for (let i = 0; i < order; i++) {
    const m = i - n;
    if (m === 0) {
      switch (type.toLowerCase()) {
        case 'lowpass':
          h[i] = 2 * cutoff[0];
          break;
        case 'highpass':
          h[i] = 1 - 2 * cutoff[0];
          break;
        case 'bandpass':
          h[i] = 2 * (cutoff[1] - cutoff[0]);
          break;
        case 'bandstop':
          h[i] = 1 - 2 * (cutoff[1] - cutoff[0]);
          break;
        default:
          throw new Error(`Unknown filter type: ${type}`);
      }
    } else {
      switch (type.toLowerCase()) {
        case 'lowpass':
          h[i] = Math.sin(2 * Math.PI * cutoff[0] * m) / (Math.PI * m);
          break;
        case 'highpass':
          h[i] = -Math.sin(2 * Math.PI * cutoff[0] * m) / (Math.PI * m);
          break;
        case 'bandpass':
          h[i] = (
            Math.sin(2 * Math.PI * cutoff[1] * m)
            - Math.sin(2 * Math.PI * cutoff[0] * m)
          ) / (Math.PI * m);
          break;
        case 'bandstop':
          h[i] = (
            Math.sin(2 * Math.PI * cutoff[0] * m)
            - Math.sin(2 * Math.PI * cutoff[1] * m)
          ) / (Math.PI * m);
          break;
      }
    }
  }

  // Apply window
  const windowValues = this.window(windowType, order);
  return h.map((val, i) => val * windowValues[i]);
};

/**
 * Apply FIR filter to a signal
 * @param {Array} signal - Input signal
 * @param {Array} filter - Filter coefficients
 * @returns {Array} - Filtered signal
 */
signalProcessing.filter = function (signal, filter) {
  const N = signal.length;
  const M = filter.length;
  const result = new Array(N);

  for (let n = 0; n < N; n++) {
    result[n] = 0;
    for (let k = 0; k < M; k++) {
      if (n - k >= 0) {
        if (signal[n - k] instanceof Complex) {
          result[n] = (result[n] instanceof Complex
            ? result[n] : new Complex(result[n], 0))
            .add(signal[n - k].mul(filter[k]));
        } else {
          result[n] += signal[n - k] * filter[k];
        }
      }
    }
  }

  return result;
};

/**
 * Convolve two signals
 * @param {Array} signal1 - First signal
 * @param {Array} signal2 - Second signal
 * @param {string} [mode='full'] - Convolution mode ('full', 'same', 'valid')
 * @returns {Array} - Convolution result
 */
signalProcessing.convolve = function (signal1, signal2, mode = 'full') {
  const M = signal1.length;
  const N = signal2.length;
  const resultLength = M + N - 1;
  const result = new Array(resultLength).fill(0);

  // Calculate full convolution
  for (let n = 0; n < resultLength; n++) {
    for (let k = 0; k < N; k++) {
      if (n - k >= 0 && n - k < M) {
        if (signal1[n - k] instanceof Complex || signal2[k] instanceof Complex) {
          const s1 = signal1[n - k] instanceof Complex
            ? signal1[n - k] : new Complex(signal1[n - k], 0);
          const s2 = signal2[k] instanceof Complex
            ? signal2[k] : new Complex(signal2[k], 0);

          result[n] = result[n] instanceof Complex
            ? result[n].add(s1.mul(s2))
            : new Complex(result[n], 0).add(s1.mul(s2));
        } else {
          result[n] += signal1[n - k] * signal2[k];
        }
      }
    }
  }

  // Adjust according to mode
  if (mode === 'same') {
    const startIdx = Math.floor((N - 1) / 2);
    return result.slice(startIdx, startIdx + M);
  } if (mode === 'valid') {
    return result.slice(N - 1, M);
  }

  return result;
};

/**
 * Calculate the Power Spectral Density of a signal
 * @param {Array} signal - Input signal
 * @param {Object} [options] - Options for PSD calculation
 * @returns {Array} - Power Spectral Density
 */
signalProcessing.psd = function (signal, options = {}) {
  const { windowType = 'hamming', nfft = signal.length } = options;

  // Apply window
  const windowedSignal = this.applyWindow(signal, windowType);

  // Zero padding if needed
  let paddedSignal = windowedSignal;
  if (nfft > signal.length) {
    paddedSignal = [...windowedSignal, ...new Array(nfft - signal.length).fill(0)];
  }

  // Calculate FFT
  const spectrum = this.fft(paddedSignal);

  // Calculate power (magnitude squared)
  return spectrum.map((x) => x.abs() * x.abs());
};

/**
 * Calculate the Short-Time Fourier Transform (STFT)
 * @param {Array} signal - Input signal
 * @param {Object} [options] - STFT options
 * @returns {Array} - 2D array with STFT results
 */
signalProcessing.stft = function (signal, options = {}) {
  const {
    windowType = 'hamming',
    windowSize = 256,
    hopSize = windowSize / 2,
    nfft = windowSize
  } = options;

  const window = this.window(windowType, windowSize);
  const numFrames = Math.floor((signal.length - windowSize) / hopSize) + 1;
  const result = new Array(numFrames);

  for (let i = 0; i < numFrames; i++) {
    const frameStart = Math.floor(i * hopSize);
    const frame = signal.slice(frameStart, frameStart + windowSize);

    // Apply window
    const windowedFrame = frame.map((val, j) => val * window[j]);

    // Zero padding if needed
    let paddedFrame = windowedFrame;
    if (nfft > windowSize) {
      paddedFrame = [...windowedFrame, ...new Array(nfft - windowSize).fill(0)];
    }

    // Calculate FFT
    const spectrum = this.fft(paddedFrame);
    result[i] = spectrum;
  }

  return result;
};

/**
 * Calculate the inverse Short-Time Fourier Transform (iSTFT)
 * @param {Array} stft - STFT matrix
 * @param {Object} [options] - iSTFT options
 * @returns {Array} - Reconstructed signal
 */
signalProcessing.istft = function (stft, options = {}) {
  const {
    windowType = 'hamming',
    windowSize = 256,
    hopSize = windowSize / 2,
    nfft = windowSize
  } = options;

  const window = this.window(windowType, windowSize);
  const numFrames = stft.length;
  const expectedSignalLength = (numFrames - 1) * hopSize + windowSize;
  const result = new Array(expectedSignalLength).fill(0);

  // Overlap-add synthesis
  for (let i = 0; i < numFrames; i++) {
    // Inverse FFT
    const frameSpectrum = stft[i];
    const reconstructedFrame = this.ifft(frameSpectrum);

    // Get real part for the actual signal
    const frameReal = reconstructedFrame.map((x) => x.re);

    // Apply window again for synthesis
    const windowedFrame = frameReal.slice(0, windowSize).map((val, j) => val * window[j]);

    // Overlap-add
    const frameStart = Math.floor(i * hopSize);
    for (let j = 0; j < windowSize; j++) {
      if (frameStart + j < expectedSignalLength) {
        result[frameStart + j] += windowedFrame[j];
      }
    }
  }

  return result;
};

/**
 * Implement Discrete Wavelet Transform
 * @param {Array} signal - Input signal
 * @param {string} wavelet - Wavelet type (e.g., 'haar', 'db4')
 * @param {number} [level=1] - Decomposition level
 * @returns {Object} - Wavelet coefficients
 */
signalProcessing.dwt = function (signal, wavelet = 'haar', level = 1) {
  // Define wavelet filters
  const filters = {
    haar: {
      dec: {
        low: [0.7071067811865475, 0.7071067811865475],
        high: [-0.7071067811865475, 0.7071067811865475]
      },
      rec: {
        low: [0.7071067811865475, 0.7071067811865475],
        high: [0.7071067811865475, -0.7071067811865475]
      }
    },
    db4: {
      dec: {
        low: [-0.010597401784997278, 0.032883011666982945, 0.030841381835986965, -0.18703481171888114, -0.02798376941698385, 0.6308807679295904, 0.7148465705525415, 0.23037781330885523],
        high: [-0.23037781330885523, 0.7148465705525415, -0.6308807679295904, -0.02798376941698385, 0.18703481171888114, 0.030841381835986965, -0.032883011666982945, -0.010597401784997278]
      },
      rec: {
        low: [0.23037781330885523, 0.7148465705525415, 0.6308807679295904, -0.02798376941698385, -0.18703481171888114, 0.030841381835986965, 0.032883011666982945, -0.010597401784997278],
        high: [-0.010597401784997278, -0.032883011666982945, 0.030841381835986965, 0.18703481171888114, -0.02798376941698385, -0.6308807679295904, 0.7148465705525415, -0.23037781330885523]
      }
    }
  };

  if (!filters[wavelet]) {
    throw new Error(`Wavelet type '${wavelet}' not supported`);
  }

  const filter = filters[wavelet].dec;

  // Helper for filtering and downsampling
  function filterAndDownsample(signal, filter) {
    const N = signal.length;
    const M = filter.length;
    const result = new Array(Math.floor(N / 2));

    for (let i = 0; i < Math.floor(N / 2); i++) {
      result[i] = 0;
      for (let j = 0; j < M; j++) {
        const signalIdx = 2 * i + j;
        if (signalIdx < N) {
          result[i] += signal[signalIdx] * filter[M - 1 - j];
        }
      }
    }

    return result;
  }

  // Process through wavelet levels
  let approx = [...signal];
  const coeffs = {
    approximation: null,
    details: []
  };

  for (let i = 0; i < level; i++) {
    // Low-pass filter for approximation coefficients
    const newApprox = filterAndDownsample(approx, filter.low);

    // High-pass filter for detail coefficients
    const detail = filterAndDownsample(approx, filter.high);

    // Store detail coefficients
    coeffs.details.unshift(detail);

    // Update approximation for next level
    approx = newApprox;

    // If we've reached the longest possible level, break
    if (approx.length <= filter.low.length) {
      break;
    }
  }

  // Store final approximation
  coeffs.approximation = approx;

  return coeffs;
};

/**
 * Implement Inverse Discrete Wavelet Transform
 * @param {Object} coeffs - Wavelet coefficients
 * @param {string} wavelet - Wavelet type (e.g., 'haar', 'db4')
 * @returns {Array} - Reconstructed signal
 */
signalProcessing.idwt = function (coeffs, wavelet = 'haar') {
  // Define wavelet filters
  const filters = {
    haar: {
      dec: {
        low: [0.7071067811865475, 0.7071067811865475],
        high: [-0.7071067811865475, 0.7071067811865475]
      },
      rec: {
        low: [0.7071067811865475, 0.7071067811865475],
        high: [0.7071067811865475, -0.7071067811865475]
      }
    },
    db4: {
      dec: {
        low: [-0.010597401784997278, 0.032883011666982945, 0.030841381835986965, -0.18703481171888114, -0.02798376941698385, 0.6308807679295904, 0.7148465705525415, 0.23037781330885523],
        high: [-0.23037781330885523, 0.7148465705525415, -0.6308807679295904, -0.02798376941698385, 0.18703481171888114, 0.030841381835986965, -0.032883011666982945, -0.010597401784997278]
      },
      rec: {
        low: [0.23037781330885523, 0.7148465705525415, 0.6308807679295904, -0.02798376941698385, -0.18703481171888114, 0.030841381835986965, 0.032883011666982945, -0.010597401784997278],
        high: [-0.010597401784997278, -0.032883011666982945, 0.030841381835986965, 0.18703481171888114, -0.02798376941698385, -0.6308807679295904, 0.7148465705525415, -0.23037781330885523]
      }
    }
  };

  if (!filters[wavelet]) {
    throw new Error(`Wavelet type '${wavelet}' not supported`);
  }

  const filter = filters[wavelet].rec;

  // Helper for upsampling and filtering
  function upsampleAndFilter(signal, filter) {
    const N = signal.length;
    const M = filter.length;
    const result = new Array(N * 2).fill(0);

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        const resultIdx = 2 * i + j;
        result[resultIdx] += signal[i] * filter[j];
      }
    }

    return result;
  }

  // Reconstruct from wavelet coefficients
  let result = [...coeffs.approximation];

  for (let i = 0; i < coeffs.details.length; i++) {
    // Upsample and filter approximation coefficients
    const upApprox = upsampleAndFilter(result, filter.low);

    // Upsample and filter detail coefficients
    const upDetail = upsampleAndFilter(coeffs.details[i], filter.high);

    // Ensure both arrays are the same length
    const minLength = Math.min(upApprox.length, upDetail.length);

    // Combine approximation and detail
    result = new Array(minLength);
    for (let j = 0; j < minLength; j++) {
      result[j] = upApprox[j] + upDetail[j];
    }
  }

  return result;
};

module.exports = signalProcessing;
