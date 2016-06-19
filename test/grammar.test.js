import Grammar from "../src/grammar";
import Rule from "../src/rule";
import _ from "lodash";
import { assert } from "chai";

describe("Grammar", () => {
  describe("#tokenize", () => {
    it("should produce a token sequence from valid source", () => {
      let grammar = new Grammar();
      let tokens = grammar.tokenize("F(a, b)#(a + 5, 3 - 1, n / 6)");

      assert.isArray(tokens);
      assert.lengthOf(tokens, 2);
      assert.equal(tokens[0].symbol, "F");
      assert.lengthOf(tokens[0].parameters, 2);
      assert.equal(tokens[1].symbol, "#");
      assert.lengthOf(tokens[1].parameters, 3);
    });
  });

  describe("#interpret", () => {
    it("should expand a valid source string", () => {
      let grammar = new Grammar();
      let rule = new Rule("F(a, b)", "F(a + 1, b * 3)#(a - b)");
      grammar.addRule(rule);

      let result = grammar.interpret("F(5, 1)", 1);

      assert.isArray(result);
      assert.lengthOf(result, 2);

      let first = result[0];
      assert.equal('F', first.symbol);
      assert.lengthOf(first.parameters, 2);
      assert.equal(6, first.parameters[0]);
      assert.equal(3, first.parameters[1]);
    });
    
    it("should correctly interpret literal zero values", () => {
      let grammar = new Grammar();
      let rule = new Rule("F(x)", "F(x - 1)F(x + 1)");
      grammar.addRule(rule);

      let result = grammar.interpret("F(0)", 1);
      assert.isArray(result);
      assert.lengthOf(result, 2);

      let first = result[0];
      assert.equal('F', first.symbol);
      assert.lengthOf(first.parameters, 1);
      assert.equal(-1, first.parameters[0]);

      let second = result[1];
      assert.equal('F', second.symbol);
      assert.lengthOf(second.parameters, 1);
      assert.equal(1, second.parameters[0]);
    });
  });
});
