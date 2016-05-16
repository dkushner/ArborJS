import Rule from "../src/rule.js";
import _ from "lodash";
import { assert } from "chai";

describe("Rule", () => {
  describe("#constructor", () => {
    it("should accept simple predecessors", () => {
      let rule = new Rule("F");
      assert.isOk(rule);
      assert.instanceOf(rule, Rule);
      assert.lengthOf(rule.parameters, 0);
      assert.equal(rule.symbol, "F");
    });

    it("should reject empty parameterized predecessors", () => {
      let test = () => {
        new Rule("F()");
      };

      assert.throws(test, Error, /has illegal parameter ''/);
    });

    it("should accept parameterized predecessors", () => {
      let rule = new Rule("F(a, b, c)");

      assert.isOk(rule);
      assert.instanceOf(rule, Rule);
      assert.lengthOf(rule.parameters, 3);
      assert.equal(rule.production, "");
      assert(_.isEqual(rule.parameters, ['a', 'b', 'c']));
    });

    it("should reject invalid parameter lists", () => {
      let first = () => {
        new Rule("F(ab, c)");
      };

      let second = () => {
        new Rule("F(a, b");
      };

      assert.throws(first, Error, /has illegal parameter 'ab'/);
      assert.throws(second, Error, /has unclosed parameter list/);
    });
  });

  describe("#addProduction", () => {
    it("should accept simple productions", () => {
      let rule = new Rule("F(a, b, c)").addProduction("NN");

      assert.isOk(rule);
      assert.instanceOf(rule, Rule);
      assert.equal(rule.production, "NN");
    });

    it("should accept conditional productions", () => {
      let rule = new Rule("F(a, b, c)").addProduction("NN", "a > b");

      assert.isOk(rule);
      assert.instanceOf(rule, Rule);
      assert.equal(rule.production, "");
      assert.property(rule.conditions, "a>b");
      assert.propertyVal(rule.conditions, "a>b", "NN");
    });

    it("should reject invalid conditonal statements", () => {
      let one = () => {
        new Rule("F(a, b, c)").addProduction("NN", "5.0 > d");
      };

      let two = () => {
        new Rule("F").addProduction("NN", "5.0 > d");
      };

      let three = () => {
        new Rule("F").addProduction("NN", "abc > d");
      };

      let four = () => {
        new Rule("F").addProduction("NN", "abc");
      };

      let five = () => {
        new Rule("F").addProduction("NN", {});
      };

      assert.throws(one, Error, "Invalid operand 'd' in conditional statement '5.0 > d'.");
      assert.throws(two, Error, "Invalid operand 'd' in conditional statement '5.0 > d'.");
      assert.throws(three, Error, "Invalid operand 'abc' in conditional statement 'abc > d'.");
      assert.throws(four, Error, "Invalid conditional statement 'abc'.");
      assert.throws(five, Error, "Invalid type for condition. Expected string, received object.");
    });
  });

  describe("#expand", () => {
    it("should reject invalid argument lists", () => {
      let one = () => {
        let rule = new Rule("F");
        rule.expand([1, 2, 3]);
      };

      let two = () => {
        let rule = new Rule("F(a, b, c)");
        rule.expand([1]);
      };

      let three = () => {
        let rule = new Rule("F(a, b, c)");
        rule.expand([1, "fail", 5.0]);
      };

      assert.throws(one, Error, "Expected argument list of length 0 but found 3.");
      assert.throws(two, Error, "Expected argument list of length 3 but found 1.");
      assert.throws(three, Error, "Value of parameter 'b' is of incorrect type 'string'.");
    });
  });
});
