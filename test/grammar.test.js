import Grammar from "../src/grammar.js";
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
      grammar.addRule("F(a, b)", "F(a + 1, b * 3)#(a - b)");

      let source = grammar.interpret("F(5, 1)", 1);

      assert.equal(source, "F(6,3)#(4)");
    });
  });
});
