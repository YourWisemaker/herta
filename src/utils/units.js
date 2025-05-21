/**
 * units.js
 * Unit conversion utilities for Herta.js
 */

// Metric prefixes with their corresponding powers of 10
const metricPrefixes = {
  yotta: 1e24,
  zetta: 1e21,
  exa: 1e18,
  peta: 1e15,
  tera: 1e12,
  giga: 1e9,
  mega: 1e6,
  kilo: 1e3,
  hecto: 1e2,
  deca: 1e1,
  base: 1,
  deci: 1e-1,
  centi: 1e-2,
  milli: 1e-3,
  micro: 1e-6,
  nano: 1e-9,
  pico: 1e-12,
  femto: 1e-15,
  atto: 1e-18,
  zepto: 1e-21,
  yocto: 1e-24
};

// Length units (in meters)
const lengthUnits = {
  meter: 1,
  kilometer: 1000,
  centimeter: 0.01,
  millimeter: 0.001,
  micrometer: 1e-6,
  nanometer: 1e-9,
  inch: 0.0254,
  foot: 0.3048,
  yard: 0.9144,
  mile: 1609.344,
  nauticalMile: 1852
};

// Mass units (in kg)
const massUnits = {
  kilogram: 1,
  gram: 0.001,
  milligram: 1e-6,
  metricTon: 1000,
  pound: 0.45359237,
  ounce: 0.028349523125,
  ton: 907.18474
};

// Time units (in seconds)
const timeUnits = {
  second: 1,
  millisecond: 0.001,
  microsecond: 1e-6,
  nanosecond: 1e-9,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2629746, // Average month (365.2425 days / 12)
  year: 31556952, // Julian year (365.25 days)
  decade: 315569520,
  century: 3155695200
};

// Temperature units (conversion functions)
const temperatureConversions = {
  celsiusToKelvin: (celsius) => celsius + 273.15,
  kelvinToCelsius: (kelvin) => kelvin - 273.15,
  celsiusToFahrenheit: (celsius) => celsius * 9/5 + 32,
  fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
  kelvinToFahrenheit: (kelvin) => kelvin * 9/5 - 459.67,
  fahrenheitToKelvin: (fahrenheit) => (fahrenheit + 459.67) * 5/9
};

// Area units (in square meters)
const areaUnits = {
  squareMeter: 1,
  squareKilometer: 1e6,
  squareCentimeter: 1e-4,
  squareMillimeter: 1e-6,
  squareInch: 0.00064516,
  squareFoot: 0.09290304,
  squareYard: 0.83612736,
  squareMile: 2589988.110336,
  acre: 4046.8564224,
  hectare: 10000
};

// Volume units (in cubic meters)
const volumeUnits = {
  cubicMeter: 1,
  liter: 0.001,
  milliliter: 1e-6,
  cubicCentimeter: 1e-6,
  cubicInch: 1.6387064e-5,
  cubicFoot: 0.028316846592,
  cubicYard: 0.764554857984,
  gallon: 0.003785411784, // US gallon
  quart: 0.000946352946, // US quart
  pint: 0.000473176473, // US pint
  cup: 0.000236588236, // US cup
  fluidOunce: 2.95735e-5, // US fluid ounce
  tablespoon: 1.47868e-5, // US tablespoon
  teaspoon: 4.92892e-6 // US teaspoon
};

// Energy units (in joules)
const energyUnits = {
  joule: 1,
  kilojoule: 1000,
  calorie: 4.184,
  kilocalorie: 4184,
  watthour: 3600,
  kilowatthour: 3600000,
  electronvolt: 1.602176634e-19,
  britishThermalUnit: 1055.06,
  footPound: 1.355818
};

// Power units (in watts)
const powerUnits = {
  watt: 1,
  kilowatt: 1000,
  megawatt: 1e6,
  horsepower: 745.7,
  footPoundPerSecond: 1.355818
};

// Pressure units (in pascals)
const pressureUnits = {
  pascal: 1,
  kilopascal: 1000,
  megapascal: 1e6,
  bar: 1e5,
  atmosphere: 101325,
  psi: 6894.76,
  torr: 133.322,
  mmHg: 133.322
};

// Speed units (in meters per second)
const speedUnits = {
  meterPerSecond: 1,
  kilometerPerHour: 0.277778,
  milePerHour: 0.44704,
  knot: 0.514444,
  footPerSecond: 0.3048
};

/**
 * Convert value from one unit to another
 * @param {Number} value - Value to convert
 * @param {String} fromUnit - Source unit
 * @param {String} toUnit - Target unit
 * @param {Object} unitType - Unit conversion object
 * @returns {Number} - Converted value
 */
function convertUnit(value, fromUnit, toUnit, unitType) {
  if (!unitType[fromUnit]) {
    throw new Error(`Unknown source unit: ${fromUnit}`);
  }
  
  if (!unitType[toUnit]) {
    throw new Error(`Unknown target unit: ${toUnit}`);
  }
  
  return value * unitType[fromUnit] / unitType[toUnit];
}

/**
 * Convert temperature between different units
 * @param {Number} value - Temperature value to convert
 * @param {String} fromUnit - Source unit ('celsius', 'fahrenheit', or 'kelvin')
 * @param {String} toUnit - Target unit ('celsius', 'fahrenheit', or 'kelvin')
 * @returns {Number} - Converted temperature
 */
function convertTemperature(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  
  // Convert to Kelvin as intermediate step
  let kelvinValue;
  if (fromUnit === 'celsius') {
    kelvinValue = temperatureConversions.celsiusToKelvin(value);
  } else if (fromUnit === 'fahrenheit') {
    kelvinValue = temperatureConversions.fahrenheitToKelvin(value);
  } else if (fromUnit === 'kelvin') {
    kelvinValue = value;
  } else {
    throw new Error(`Unknown temperature unit: ${fromUnit}`);
  }
  
  // Convert from Kelvin to target unit
  if (toUnit === 'celsius') {
    return temperatureConversions.kelvinToCelsius(kelvinValue);
  } else if (toUnit === 'fahrenheit') {
    return temperatureConversions.kelvinToFahrenheit(kelvinValue);
  } else if (toUnit === 'kelvin') {
    return kelvinValue;
  } else {
    throw new Error(`Unknown temperature unit: ${toUnit}`);
  }
}

// Main unit conversion function
const units = {
  // Length conversion
  length: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, lengthUnits),
  
  // Mass conversion
  mass: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, massUnits),
  
  // Time conversion
  time: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, timeUnits),
  
  // Temperature conversion
  temperature: (value, fromUnit, toUnit) => convertTemperature(value, fromUnit, toUnit),
  
  // Area conversion
  area: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, areaUnits),
  
  // Volume conversion
  volume: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, volumeUnits),
  
  // Energy conversion
  energy: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, energyUnits),
  
  // Power conversion
  power: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, powerUnits),
  
  // Pressure conversion
  pressure: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, pressureUnits),
  
  // Speed conversion
  speed: (value, fromUnit, toUnit) => convertUnit(value, fromUnit, toUnit, speedUnits)
};

module.exports = units;
