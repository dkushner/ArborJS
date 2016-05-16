import Context from "../src/context.js";
import _ from "lodash";
import { assert } from "chai";

describe("Context", () => {
  describe("#consider", () => {
    it("should correctly evaluate valid statements", () => {
      let context = new Context({
        a: 5,
        b: 3,
        c: 9.0,
        d: 5
      });

      assert(context.consider("a = a"));
      assert(context.consider("a = 5"));
      assert(context.consider("a = 5.0"));
      assert(context.consider("a > b"));
      assert(context.consider("a = d"));
      assert(context.consider("a = d"));
      assert(context.consider("a = d"));
      assert(context.consider("d < c"));
    });
  });

  describe("#evaluate", () => {
  });
});
