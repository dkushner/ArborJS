import { Turtle3D } from "../src/turtle";
import Grammar from "../src/grammar";
import { assert } from "chai";
import sinon from "sinon";

describe("Turtle3D", () => {
  describe("#constructor", () => {
    it("should create a new turtle instance", () => {
      let turtle = new Turtle3D();

      assert.isOk(turtle);
      assert.instanceOf(turtle, Turtle3D);
    });
  });

  describe("#consume", () => {
    it("should consume tokenize strings and produce pointlists", () => {
      let grammar = new Grammar();
      grammar.addRule("F(x, y)", "#(x, y, x)!(x)X(x + 1, y + 1)");
      grammar.addRule("X(x, y)", "F(x % 16, y % 16)");

      const result = grammar.evaluate("F(0, 0)", 255);
      const tokens = grammar.tokenize(result);

      const turtle = new Turtle3D();
      const points = turtle.consume(tokens);
    });
  });
});

