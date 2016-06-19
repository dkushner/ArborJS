import Rule from "../src/rule";
import Grammar from "../src/grammar";
import { Turtle3D } from "../src/turtle";

describe("Turtle3D", () => {
  describe("#consume", () => {
    it("should generate a point set", () => {
      let turtle = new Turtle3D();

      let grammar = new Grammar();
      grammar.addRule(new Rule("!(d)"));
      grammar.addRule(new Rule("#(r, g, b)"));
      grammar.addRule(new Rule("@(x, y, z)"));
      grammar.addRule(new Rule("["));
      grammar.addRule(new Rule("]"));
      grammar.addRule(new Rule("F(x)", "#(x, x, x)@(0, 90, 0)!(x)F(x - 1)"));

      let result = grammar.interpret("F(255)", 250);
      let points = turtle.consume(result);
      console.log(points);
    });
  });
});
