/**
 * Computer Vision module for herta.js
 * Provides image processing and computer vision algorithms
 */

const matrix = require('../core/matrix');
const arithmetic = require('../core/arithmetic');

const computerVision = {};

/**
 * Convert RGB image to grayscale using weighted method
 * @param {Array} image - 3D array [height][width][3] with RGB values (0-255)
 * @returns {Array} - 2D array [height][width] with grayscale values (0-255)
 */
computerVision.rgbToGrayscale = function(image) {
  const height = image.length;
  const width = image[0].length;
  
  const result = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Use standard weighted method: 0.299R + 0.587G + 0.114B
      result[y][x] = Math.round(
        0.299 * image[y][x][0] + 
        0.587 * image[y][x][1] + 
        0.114 * image[y][x][2]
      );
    }
  }
  
  return result;
};

/**
 * Apply Gaussian blur to an image
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @param {number} sigma - Standard deviation of Gaussian kernel
 * @param {number} kernelSize - Size of kernel (odd number)
 * @returns {Array} - Blurred image
 */
computerVision.gaussianBlur = function(image, sigma = 1.0, kernelSize = 5) {
  if (kernelSize % 2 === 0) {
    kernelSize++; // Ensure odd kernel size
  }
  
  const height = image.length;
  const width = image[0].length;
  const radius = Math.floor(kernelSize / 2);
  
  // Create Gaussian kernel
  const kernel = Array(kernelSize).fill().map(() => Array(kernelSize).fill(0));
  let kernelSum = 0;
  
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const exponent = -(x*x + y*y) / (2 * sigma * sigma);
      const value = Math.exp(exponent) / (2 * Math.PI * sigma * sigma);
      kernel[y + radius][x + radius] = value;
      kernelSum += value;
    }
  }
  
  // Normalize kernel
  for (let y = 0; y < kernelSize; y++) {
    for (let x = 0; x < kernelSize; x++) {
      kernel[y][x] /= kernelSum;
    }
  }
  
  // Apply convolution
  const result = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const pixelY = Math.min(height - 1, Math.max(0, y + ky));
          const pixelX = Math.min(width - 1, Math.max(0, x + kx));
          sum += image[pixelY][pixelX] * kernel[ky + radius][kx + radius];
        }
      }
      
      result[y][x] = Math.round(sum);
    }
  }
  
  return result;
};

/**
 * Apply Sobel edge detection to an image
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @returns {Object} - Edge magnitude and direction
 */
computerVision.sobelEdgeDetection = function(image) {
  const height = image.length;
  const width = image[0].length;
  
  // Sobel kernels
  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  
  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];
  
  const gradientX = Array(height).fill().map(() => Array(width).fill(0));
  const gradientY = Array(height).fill().map(() => Array(width).fill(0));
  const magnitude = Array(height).fill().map(() => Array(width).fill(0));
  const direction = Array(height).fill().map(() => Array(width).fill(0));
  
  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = image[y + ky][x + kx];
          sumX += pixel * kernelX[ky + 1][kx + 1];
          sumY += pixel * kernelY[ky + 1][kx + 1];
        }
      }
      
      gradientX[y][x] = sumX;
      gradientY[y][x] = sumY;
      magnitude[y][x] = Math.sqrt(sumX * sumX + sumY * sumY);
      direction[y][x] = Math.atan2(sumY, sumX);
    }
  }
  
  return { gradientX, gradientY, magnitude, direction };
};

/**
 * Apply Canny edge detection to an image
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @param {number} lowThreshold - Lower threshold for hysteresis
 * @param {number} highThreshold - Upper threshold for hysteresis
 * @returns {Array} - Binary edge image
 */
computerVision.cannyEdgeDetection = function(image, lowThreshold = 50, highThreshold = 100) {
  const height = image.length;
  const width = image[0].length;
  
  // Step 1: Apply Gaussian blur
  const blurred = this.gaussianBlur(image, 1.0, 5);
  
  // Step 2: Find intensity gradients
  const { magnitude, direction } = this.sobelEdgeDetection(blurred);
  
  // Step 3: Non-maximum suppression
  const suppressed = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Convert angle to degrees and get positive value
      let angle = direction[y][x] * 180 / Math.PI;
      if (angle < 0) angle += 180;
      
      // Round angle to 0, 45, 90, or 135 degrees
      const theta = Math.round(angle / 45) * 45;
      
      let neighbor1, neighbor2;
      
      // Check neighboring pixels along gradient direction
      if (theta === 0 || theta === 180) {
        neighbor1 = magnitude[y][x - 1];
        neighbor2 = magnitude[y][x + 1];
      } else if (theta === 45 || theta === 225) {
        neighbor1 = magnitude[y + 1][x - 1];
        neighbor2 = magnitude[y - 1][x + 1];
      } else if (theta === 90 || theta === 270) {
        neighbor1 = magnitude[y - 1][x];
        neighbor2 = magnitude[y + 1][x];
      } else { // theta === 135 || theta === 315
        neighbor1 = magnitude[y - 1][x - 1];
        neighbor2 = magnitude[y + 1][x + 1];
      }
      
      // Keep edge if current pixel is maximum
      if (magnitude[y][x] >= neighbor1 && magnitude[y][x] >= neighbor2) {
        suppressed[y][x] = magnitude[y][x];
      }
    }
  }
  
  // Step 4: Double threshold and hysteresis
  const result = Array(height).fill().map(() => Array(width).fill(0));
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (suppressed[y][x] >= highThreshold) {
        // Strong edge
        result[y][x] = 255;
      } else if (suppressed[y][x] >= lowThreshold) {
        // Weak edge - check if connected to strong edge
        let isConnected = false;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (ky === 0 && kx === 0) continue;
            
            if (suppressed[y + ky][x + kx] >= highThreshold) {
              isConnected = true;
              break;
            }
          }
          if (isConnected) break;
        }
        
        if (isConnected) {
          result[y][x] = 255;
        }
      }
    }
  }
  
  return result;
};

/**
 * Apply histogram equalization to enhance contrast
 * @param {Array} image - 2D array [height][width] with grayscale values (0-255)
 * @returns {Array} - Enhanced image
 */
computerVision.histogramEqualization = function(image) {
  const height = image.length;
  const width = image[0].length;
  const totalPixels = height * width;
  
  // Calculate histogram
  const histogram = Array(256).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      histogram[image[y][x]]++;
    }
  }
  
  // Calculate cumulative distribution function
  const cdf = Array(256).fill(0);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }
  
  // Normalize CDF
  const cdfMin = cdf.find(value => value > 0);
  const lookupTable = Array(256).fill(0);
  for (let i = 0; i < 256; i++) {
    lookupTable[i] = Math.round(
      ((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255
    );
  }
  
  // Apply equalization
  const result = Array(height).fill().map(() => Array(width).fill(0));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result[y][x] = lookupTable[image[y][x]];
    }
  }
  
  return result;
};

/**
 * Detect FAST corners in an image
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @param {number} threshold - Intensity difference threshold
 * @param {number} n - Minimum number of consecutive pixels (8-12)
 * @returns {Array} - List of corner points [x, y]
 */
computerVision.fastCornerDetection = function(image, threshold = 20, n = 9) {
  const height = image.length;
  const width = image[0].length;
  const corners = [];
  
  // Bresenham circle with radius 3 (16 points)
  const circle = [
    [0, 3], [1, 3], [2, 2], [3, 1],
    [3, 0], [3, -1], [2, -2], [1, -3],
    [0, -3], [-1, -3], [-2, -2], [-3, -1],
    [-3, 0], [-3, 1], [-2, 2], [-1, 3]
  ];
  
  for (let y = 3; y < height - 3; y++) {
    for (let x = 3; x < width - 3; x++) {
      const centerValue = image[y][x];
      
      // Fast test: check pixels 1, 5, 9, 13 (at right, bottom, left, top)
      const test1 = Math.abs(image[y][x+3] - centerValue) > threshold;
      const test5 = Math.abs(image[y+3][x] - centerValue) > threshold;
      const test9 = Math.abs(image[y][x-3] - centerValue) > threshold;
      const test13 = Math.abs(image[y-3][x] - centerValue) > threshold;
      
      if ((test1 && test5) || (test5 && test9) || (test9 && test13) || (test13 && test1)) {
        // Check all 16 pixels on the circle
        let count = 0;
        let consecutive = 0;
        let maxConsecutive = 0;
        let isLighter = false;
        
        for (let i = 0; i < 16; i++) {
          const [dx, dy] = circle[i];
          const pixelValue = image[y + dy][x + dx];
          
          if (Math.abs(pixelValue - centerValue) > threshold) {
            // Check if pixel is consistently lighter or darker
            const currentLighter = pixelValue > centerValue;
            
            if (count === 0) {
              isLighter = currentLighter;
              count = 1;
              consecutive = 1;
            } else if (currentLighter === isLighter) {
              count++;
              consecutive++;
            } else {
              consecutive = 0;
            }
            
            maxConsecutive = Math.max(maxConsecutive, consecutive);
          } else {
            consecutive = 0;
          }
        }
        
        // Check for consecutive pixels at the wrap-around
        if (count > 0) {
          for (let i = 0; i < 16 && consecutive > 0; i++) {
            const [dx, dy] = circle[i];
            const pixelValue = image[y + dy][x + dx];
            
            if (Math.abs(pixelValue - centerValue) > threshold &&
                ((pixelValue > centerValue) === isLighter)) {
              consecutive++;
            } else {
              break;
            }
          }
        }
        
        maxConsecutive = Math.max(maxConsecutive, consecutive);
        
        if (maxConsecutive >= n) {
          corners.push([x, y]);
        }
      }
    }
  }
  
  return corners;
};

/**
 * Detect and compute SIFT-like keypoints and descriptors
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @returns {Object} - Keypoints and descriptors
 */
computerVision.detectKeypoints = function(image) {
  const height = image.length;
  const width = image[0].length;
  
  // Create image pyramid (simplified)
  const octaves = 3;
  const pyramid = [image];
  
  for (let i = 1; i < octaves; i++) {
    const prevImage = pyramid[i - 1];
    const h = Math.floor(prevImage.length / 2);
    const w = Math.floor(prevImage[0].length / 2);
    const downsampled = Array(h).fill().map(() => Array(w).fill(0));
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        downsampled[y][x] = prevImage[y*2][x*2];
      }
    }
    
    pyramid.push(downsampled);
  }
  
  // Detect corners in each level
  const keypoints = [];
  const descriptors = [];
  
  for (let octave = 0; octave < octaves; octave++) {
    const scale = Math.pow(2, octave);
    const octaveImage = pyramid[octave];
    const blurred = this.gaussianBlur(octaveImage, 1.5);
    const corners = this.fastCornerDetection(blurred, 20, 9);
    
    // Compute simple descriptor for each corner
    for (const [x, y] of corners) {
      // Skip points too close to the border
      if (x < 8 || y < 8 || x >= octaveImage[0].length - 8 || y >= octaveImage.length - 8) {
        continue;
      }
      
      // Extract 16x16 patch around keypoint
      const descriptor = [];
      for (let py = -8; py < 8; py += 4) {
        for (let px = -8; px < 8; px += 4) {
          // Calculate 4x4 histogram of gradients
          let sum = 0;
          for (let sy = 0; sy < 4; sy++) {
            for (let sx = 0; sx < 4; sx++) {
              sum += octaveImage[y + py + sy][x + px + sx];
            }
          }
          descriptor.push(sum / 16);
        }
      }
      
      // Normalize descriptor
      const norm = Math.sqrt(descriptor.reduce((s, v) => s + v*v, 0));
      const normalizedDescriptor = descriptor.map(v => v / (norm + 1e-7));
      
      keypoints.push({
        x: x * scale,
        y: y * scale,
        octave
      });
      
      descriptors.push(normalizedDescriptor);
    }
  }
  
  return { keypoints, descriptors };
};

/**
 * Match keypoints between two images using descriptors
 * @param {Array} descriptors1 - Descriptors from first image
 * @param {Array} descriptors2 - Descriptors from second image
 * @param {number} threshold - Distance threshold for matches
 * @returns {Array} - Array of match indices [idx1, idx2]
 */
computerVision.matchKeypoints = function(descriptors1, descriptors2, threshold = 0.7) {
  const matches = [];
  
  for (let i = 0; i < descriptors1.length; i++) {
    const desc1 = descriptors1[i];
    
    // Find two best matches
    let bestDist = Infinity;
    let secondBestDist = Infinity;
    let bestIdx = -1;
    
    for (let j = 0; j < descriptors2.length; j++) {
      const desc2 = descriptors2[j];
      
      // Calculate Euclidean distance between descriptors
      let dist = 0;
      for (let k = 0; k < desc1.length; k++) {
        dist += Math.pow(desc1[k] - desc2[k], 2);
      }
      dist = Math.sqrt(dist);
      
      if (dist < bestDist) {
        secondBestDist = bestDist;
        bestDist = dist;
        bestIdx = j;
      } else if (dist < secondBestDist) {
        secondBestDist = dist;
      }
    }
    
    // Apply ratio test (Lowe's ratio)
    if (bestDist < secondBestDist * threshold) {
      matches.push([i, bestIdx]);
    }
  }
  
  return matches;
};

/**
 * Detect Hough circles in an image
 * @param {Array} image - 2D array [height][width] with grayscale values
 * @param {number} minRadius - Minimum circle radius
 * @param {number} maxRadius - Maximum circle radius
 * @param {number} threshold - Accumulator threshold
 * @returns {Array} - Array of detected circles [x, y, radius]
 */
computerVision.houghCircles = function(image, minRadius = 10, maxRadius = 50, threshold = 30) {
  const height = image.length;
  const width = image[0].length;
  
  // Detect edges
  const edges = this.cannyEdgeDetection(image);
  
  // Hough transform for circles
  // For each edge point and each possible radius, vote in the accumulator
  
  // Create 3D accumulator array (x, y, radius)
  const radiusRange = maxRadius - minRadius + 1;
  const accumulator = Array(height).fill().map(() => 
    Array(width).fill().map(() => 
      Array(radiusRange).fill(0)
    )
  );
  
  // Vote in accumulator
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y][x] > 0) {
        for (let r = 0; r < radiusRange; r++) {
          const radius = minRadius + r;
          
          // Vote in a full circle
          for (let theta = 0; theta < 360; theta += 5) {
            const radian = theta * Math.PI / 180;
            const centerX = Math.round(x - radius * Math.cos(radian));
            const centerY = Math.round(y - radius * Math.sin(radian));
            
            if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
              accumulator[centerY][centerX][r]++;
            }
          }
        }
      }
    }
  }
  
  // Find peaks in accumulator
  const circles = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let r = 0; r < radiusRange; r++) {
        if (accumulator[y][x][r] > threshold) {
          // Non-maximum suppression (simplified)
          let isMax = true;
          
          for (let ny = Math.max(0, y - 5); ny <= Math.min(height - 1, y + 5) && isMax; ny++) {
            for (let nx = Math.max(0, x - 5); nx <= Math.min(width - 1, x + 5) && isMax; nx++) {
              for (let nr = Math.max(0, r - 2); nr <= Math.min(radiusRange - 1, r + 2) && isMax; nr++) {
                if (accumulator[ny][nx][nr] > accumulator[y][x][r]) {
                  isMax = false;
                }
              }
            }
          }
          
          if (isMax) {
            circles.push([x, y, minRadius + r]);
          }
        }
      }
    }
  }
  
  return circles;
};

/**
 * Apply K-means clustering for image segmentation
 * @param {Array} image - 3D array [height][width][3] with RGB values
 * @param {number} k - Number of clusters/segments
 * @returns {Object} - Segmented image and cluster centers
 */
computerVision.segmentImage = function(image, k = 5) {
  const height = image.length;
  const width = image[0].length;
  
  // Flatten image into array of pixels
  const pixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels.push([image[y][x][0], image[y][x][1], image[y][x][2]]);
    }
  }
  
  // Initialize k cluster centers randomly
  const centers = [];
  const usedIndices = new Set();
  
  while (centers.length < k) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      centers.push([...pixels[idx]]);
    }
  }
  
  // K-means clustering
  const maxIterations = 10;
  let iterations = 0;
  let changed = true;
  
  const assignments = Array(pixels.length).fill(0);
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Assign each pixel to nearest center
    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      let minDist = Infinity;
      let minIdx = 0;
      
      for (let j = 0; j < k; j++) {
        const center = centers[j];
        const dist = Math.sqrt(
          Math.pow(pixel[0] - center[0], 2) +
          Math.pow(pixel[1] - center[1], 2) +
          Math.pow(pixel[2] - center[2], 2)
        );
        
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      
      if (assignments[i] !== minIdx) {
        assignments[i] = minIdx;
        changed = true;
      }
    }
    
    // Update centers
    const counts = Array(k).fill(0);
    const newCenters = Array(k).fill().map(() => [0, 0, 0]);
    
    for (let i = 0; i < pixels.length; i++) {
      const cluster = assignments[i];
      const pixel = pixels[i];
      
      counts[cluster]++;
      newCenters[cluster][0] += pixel[0];
      newCenters[cluster][1] += pixel[1];
      newCenters[cluster][2] += pixel[2];
    }
    
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centers[j][0] = newCenters[j][0] / counts[j];
        centers[j][1] = newCenters[j][1] / counts[j];
        centers[j][2] = newCenters[j][2] / counts[j];
      }
    }
  }
  
  // Create segmented image
  const segmented = Array(height).fill().map(() => 
    Array(width).fill().map(() => [0, 0, 0])
  );
  
  let idx = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cluster = assignments[idx++];
      segmented[y][x] = [...centers[cluster]].map(Math.round);
    }
  }
  
  return { segmented, centers };
};

module.exports = computerVision;
