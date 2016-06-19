import Rule from "../src/rule";
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
      assert(_.isEqual(rule.parameters, ['a', 'b', 'c']));
      assert.lengthOf(rule.production, 1);
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

      assert.throws(one, Error, "Expected argument list of length 0 but found 3.");
      assert.throws(two, Error, "Expected argument list of length 3 but found 1.");
    });
  });
});
