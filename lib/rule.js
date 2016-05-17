"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _grammar = require("./grammar");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Encapsulates a single production rule in a grammar.
 */

var Rule = function () {
  /**
   * Creates a new rule instance.
   *
   * @param {string} predicate Rule predicate that expands into a production when interpreted.
   * @param {?string} production The default production of this rule. If none is provided, the identity
   * production is assumed.
   * @return {Rule} A new rule instance.
   */

  function Rule(predecessor, production) {
    var _this = this;

    _classCallCheck(this, Rule);

    this.predecessor = predecessor.replace(/ /g, '');
    this.symbol = this.predecessor[0];
    this.parameters = [];

    if (this.predecessor[1] == '(') {
      var close = this.predecessor.indexOf(')', 1);

      if (close == -1) {
        throw new Error("Predecessor " + this.predecessor + " has unclosed parameter list.");
      }

      this.parameters = _lodash2.default.map(this.predecessor.substring(2, close).replace(/ /g, '').split(','), function (param) {
        if (param.length != 1 || _lodash2.default.includes(_grammar.RESTRICTED, param)) {
          throw new Error("Predecessor " + _this.predecessor + " has illegal parameter '" + param + "'.");
        }

        return param;
      });
    }

    // Parse the production to validate that all variable references are valid
    // and to create resolvers for each set of virtual productions.
    production = production ? production.replace(/ /g, '') : this.predecessor;

    var virtuals = [];
    for (var index = 0; index < this.production.length; index++) {
      var symbol = source[index];

      if (_lodash2.default.includes(_grammar.RESTRICTED, symbol)) {
        throw new Error("Production " + production + " contains restricted symbol \"" + symbol + "\"; position " + index + ".");
      }

      var virtual = { symbol: symbol };

      if (source[index + 1] == "(") {
        var _close = source.indexOf(")", index + 1);

        if (_close == -1) {
          throw new Error("Production " + production + " has unclosed parameter list.");
        }

        var parameters = source.substring(index + 2, _close).split(",");
        virtual.parameters = _lodash2.default.map(parameters, this.virtualize);
      }

      virtuals.push(virtual);
    }

    this.virtuals = virtuals;
    this.conditionals = [];
  }

  /**
   * Virtualizes simple expressions for repeated evaluation.
   * 
   * @param {!string} expression The simple expression to virtualize. 
   * @return {function(ctx: Object)} Function that evaluates the expression for a provided context.
   */


  _createClass(Rule, [{
    key: "virtualize",
    value: function virtualize(expression) {
      var _this2 = this;

      var numeric = parseFloat(expression);
      if (!_lodash2.default.isNaN(numeric)) {
        return function () {
          return numeric;
        };
      }

      if (expression.length == 1 && _lodash2.default.includes(this.parameters, expression)) {
        return function (ctx) {
          return ctx[expression];
        };
      }

      var comp = expression.match(/(\=|\<|\>)/)[1];
      if (comp) {
        var _ret = function () {
          var operands = expression.split(comp);
          var lhs = _this2.virtualize(operands[0]);
          var rhs = _this2.virtualize(operands[1]);

          if (!lhs || !rhs) {
            throw new Error("Conditional \"" + expression + "\" contains invalid number of operands.");
          }

          switch (comp) {
            case "=":
              return {
                v: function v(ctx) {
                  return lhs(ctx) == rhs(ctx);
                }
              };
            case ">":
              return {
                v: function v(ctx) {
                  return lhs(ctx) > rhs(ctx);
                }
              };
            case "<":
              return {
                v: function v(ctx) {
                  return lhs(ctx) < rhs(ctx);
                }
              };
          }
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
      }

      var op = expression.match(/(\+|\*|\-|\/)/)[1];
      if (op) {
        var _ret2 = function () {
          var operands = expression.split(op);
          var lhs = _this2.virtualize(operands[0]);
          var rhs = _this2.virtualize(operands[1]);

          if (!lhs || !rhs) {
            throw new Error("Binary operation \"" + expression + "\" contains invalid number of operands.");
          }

          switch (op) {
            case "+":
              return {
                v: function v(ctx) {
                  return lhs(ctx) + rhs(ctx);
                }
              };
            case "-":
              return {
                v: function v(ctx) {
                  return lhs(ctx) - rhs(ctx);
                }
              };
            case "*":
              return {
                v: function v(ctx) {
                  return lhs(ctx) * rhs(ctx);
                }
              };
            case "/":
              return {
                v: function v(ctx) {
                  return lhs(ctx) / rhs(ctx);
                }
              };
          }
        }();

        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
      }
    }

    /**
     * Adds a condition production to the rule. Returns target rule and may be chained.
     *
     * @param {string} condition Conditional expression to evaluate.
     * @param {string} production Production emitted when conditional expression is true.
     * @return {Rule} The rule to which the conditional production was added.
     */

  }, {
    key: "addCondition",
    value: function addCondition(condition, production) {
      var virtuals = [];
      for (var index = 0; index < this.production.length; index++) {
        var symbol = source[index];

        if (_lodash2.default.includes(_grammar.RESTRICTED, symbol)) {
          throw new Error("Production " + production + " contains restricted symbol \"" + symbol + "\"; position " + index + ".");
        }

        var virtual = { symbol: symbol };

        if (source[index + 1] == "(") {
          var close = source.indexOf(")", index + 1);

          if (close == -1) {
            throw new Error("Production " + production + " has unclosed parameter list.");
          }

          var parameters = source.substring(index + 2, close).split(",");
          virtual.parameters = _lodash2.default.map(parameters, this.virtualize);
        }

        virtuals.push(virtual);
      }

      this.conditionals.push({
        given: this.virtualize(condition),
        produce: virtuals
      });

      return this;
    }

    /**
     * Given an ordered argument list, returns an ordered array of tokens produced by the the rule.
     *
     * @param {number[]} arglist Numeric arguments to bind to predecessor parameters.
     * @return {Object[]} List of generated tokens containing a symbol and evaluated parameters.
     */

  }, {
    key: "evaluate",
    value: function evaluate(arglist) {
      var _this3 = this;

      if (arglist.length != this.parameters.length) {
        throw new Error("Expected argument list of length " + this.parameters.length + " but found " + arglist.length + ".");
      }

      var locals = _lodash2.default.reduce(arglist, function (memo, arg, index) {
        var param = _this3.parameters[index];
        memo[param] = arg;
        return memo;
      }, {});

      if (!this.production && _lodash2.default.isEmpty(this.conditions)) {
        return "";
      }

      var result = this.production;
      if (!_lodash2.default.isEmpty(this.conditions)) {
        for (var cond in this.conditions) {
          if (context.consider(cond)) {
            result = this.conditions[cond];
            break;
          }
        }
      }

      return context.evaluate(result);
    }
  }]);

  return Rule;
}();

exports.default = Rule;