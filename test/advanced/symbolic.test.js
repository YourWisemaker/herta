/**
 * Tests for the Symbolic module in Herta.js
 */
const { assert, herta } = require('../setup');

describe('Symbolic Module', () => {
  describe('parse and toString', () => {
    it('should parse an expression and convert it back to string', () => {
      const exprStr = 'x ^ 2 + 2 * x + 1';
      const parsedExpr = herta.symbolic.parse(exprStr);
      assert.ok(parsedExpr !== null, 'Parsed expression should not be null');
      assert.strictEqual(typeof parsedExpr, 'object', 'Parsed expression should be an object');
      assert.strictEqual(parsedExpr.toString(), exprStr);
    });
  });

  describe('simplify', () => {
    it('should simplify an expression', () => {
      const expr = herta.symbolic.parse('x + x + x');
      const simplified = herta.symbolic.simplify(expr);
      assert.strictEqual(simplified.toString(), '3 * x');
    });

    it('should simplify a more complex expression', () => {
      const expr = herta.symbolic.parse('2 * x + 3 * x - x');
      const simplified = herta.symbolic.simplify(expr);
      // mathjs might simplify to '4 * x'
      assert.strictEqual(simplified.toString(), '4 * x');
    });
  });

  describe('differentiate', () => {
    it('should differentiate a simple polynomial', () => {
      const expr = herta.symbolic.parse('x^2 + 2*x + 1');
      const derivative = herta.symbolic.differentiate(expr, 'x');
      assert.strictEqual(derivative.toString(), '2 * (x + 1)');
    });

    it('should differentiate with respect to another variable', () => {
      const expr = herta.symbolic.parse('y^3 + y*x');
      const derivative = herta.symbolic.differentiate(expr, 'y');
      assert.strictEqual(derivative.toString(), '3 * y ^ 2 + x');
    });
  });

  describe('evaluate', () => {
    it('should evaluate an expression with a scope', () => {
      const expr = herta.symbolic.parse('x^2 + y');
      const result = herta.symbolic.evaluate(expr, { x: 3, y: 5 });
      assert.strictEqual(result, 14);
    });

    it('should evaluate a node directly', () => {
        const expr = herta.symbolic.parse('a * b');
        // Test direct .evaluate() method on the node
        const result = expr.evaluate({ a: 4, b: 5 });
        assert.strictEqual(result, 20);
    });
  });
});
