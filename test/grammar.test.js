import Grammar from "../src/grammar";
import Rule from "../src/rule";
import { assert } from "chai";
import sinon from "sinon";

describe("Grammar", () => {
  describe("#constructor", () => {
    it("should create a new grammar instance", () => {
      let grammar = new Grammar();

      assert.isOk(grammar);
      assert.instanceOf(grammar, Grammar);
    });

    it("should accept predefined rulesets", () => {
      let grammar = new Grammar({
        'F': {
          parameters: ['x', 'y', 'z'], 
          production: (x, y, z) => `XF(${x - 1}, ${y + 5}, ${z % 26})`
        }
      });

      let result = grammar.evaluate('F(5, 3, 27)');
      assert.equal(result, 'XF(4, 8, 1)');
    });
  });

  describe("#addRule", () => {
    it("should support simple productions", () => {
      let grammar = new Grammar();
      grammar.addRule('F', 'FF');

      let result = grammar.evaluate('FF');

      assert.typeOf(result, 'string');
      assert.equal(result, 'FFFF');
    });

    it("should support parameterized productions", () => {
      let grammar = new Grammar();
      grammar.addRule('F', ['x', 'y', (x, y) => `G(${x + 1}, ${y - 1})`]);
      grammar.addRule('G', {
        parameters: ['x', 'y'],
        production: 'F(x, y)'
      });

      let result = grammar.evaluate('F(1, 2)', 2);

      assert.equal(result, 'F(2, 1)');
    });

    it("should support conditional productions", () => {
      let grammar = new Grammar();
      grammar.addRule('F', {
        parameters: ['x', 'y'],
        production: [{
          when: (x, y) => x > y,
          then: (x, y) => `F(${x + 1}, ${y - 1})`
        }, {
          when: (x, y) => x < y,
          then: (x, y) => `F(${x - 1}, ${y + 1})`
        }]
      });

      let result = grammar.evaluate('F(2, 1)F(1, 2)');

      assert.equal(result, 'F(3, 0)F(0, 3)');
    }); 

    it("should support stochastic productions", () => {
      sinon.stub(Math, 'random').returns(0.5);

      let grammar = new Grammar();
      grammar.addRule('F', {
        parameters: ['x', 'y'],
        production: [{
          chance: 0.3,
          then: (x, y) => `F(${x - 1}, ${y + 1})`
        }, {
          chance: 0.7, 
          then: (x, y) => `F(${x + 1}, ${y - 1})`
        }]
      });

      let result = grammar.evaluate('F(1, 2)');
      assert.equal(result, 'F(2, 1)');
    });
  });
});
