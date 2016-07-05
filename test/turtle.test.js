import Rule from "../src/rule";
import Grammar from "../src/grammar";
import { assert } from "chai";
import { Turtle3D } from "../src/turtle";

describe("Turtle3D", () => {
  describe("#consume", () => {
    it("should generate a point attribute set", () => {
      let turtle = new Turtle3D();

      let grammar = new Grammar();
      grammar.addRule(new Rule("!(d)"));
      grammar.addRule(new Rule("#(r, g, b)"));
      grammar.addRule(new Rule("@(x, y, z)"));
      grammar.addRule(new Rule("["));
      grammar.addRule(new Rule("]"));
      grammar.addRule(new Rule("F(x)", "#(x, x, x)@(0, 90, 0)!(x)F(x)"));

      let result = grammar.interpret("F(255)", 3);
      let points = turtle.consume(result);

      assert.isArray(points);
      assert.lengthOf(points, 4);
    });
  });
});
