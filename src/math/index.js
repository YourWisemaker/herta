/**
 * Math module index for herta.js
 * Exports all mathematical modules for easy access
 */

const differential = require('./differential');
const symbolic = require('./symbolic');
const probability = require('./probability');

// Math module
const math = {
  differential,
  symbolic,
  probability
};

module.exports = math;
