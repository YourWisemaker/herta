/**
 * Math module index for herta.js
 * Exports all mathematical modules for easy access
 */

import differential from './differential.js';
import symbolic from './symbolic.js';
import probability from './probability.js';

// Math module
const math = {
  differential,
  symbolic,
  probability
};

export default math;
