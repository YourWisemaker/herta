const { assert, herta } = require('../setup'); // Assuming setup provides 'assert'

describe('Core Calculus Module', () => {
  describe('integrate', () => {
    it('should numerically integrate f(x) = x^2 from 0 to 3', () => {
      const f = (x) => x * x;
      const result = herta.calculus.integrate(f, 'x', 0, 3, { intervals: 1000 });
      const expected = 9;
      assert.ok(Math.abs(result - expected) < 1e-4, `Expected ~${expected}, got ${result}`);
    });

    it('should numerically integrate f(x) = 5 from 1 to 4', () => {
      const f = (x) => 5;
      const result = herta.calculus.integrate(f, 'x', 1, 4, { intervals: 100 });
      const expected = 15;
      assert.ok(Math.abs(result - expected) < 1e-4, `Expected ~${expected}, got ${result}`);
    });
  });
});
