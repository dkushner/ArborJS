"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grammar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RESTRICTED = '()0123456789*+-/';
var BINARY_REGEX = /^\s*(([-]?[0-9]*\.?[0-9]+)|(\w))(\+|\-|\*|\/)(([-]?[0-9]*\.?[0-9]+)|(\w))$/;

var Grammar = exports.Grammar = function () {
  function Grammar(constants) {
    _classCallCheck(this, Grammar);

    // Set up constants for this grammar. Constants cannot be expanded but they
    // may have parameters.
    this.constants = _lodash2.default.reduce(constants, function (m, command, constant) {
      var symbol = constant[0];
      if (_lodash2.default.contains(RESTRICTED, symbol)) {
        console.error("Constant symbol %s uses restricted character.");
      }

      m[symbol] = new Rule(constant);
      return m;
    }, {});
    this.rules = {};
  }

  _createClass(Grammar, [{
    key: "scan",
    value: function scan(axiom, limit, cb, depth) {
      depth = depth || 0;

      if (depth == limit) {
        return;
      }

      var index = 0;
      while (index < axiom.length) {
        var symbol = axiom[index];

        var rule = this.constants[symbol] || this.rules[symbol];
        if (!rule) {
          console.error("Unrecognized symbol %s.", symbol);
          return;
        }

        // Check for an argument list and expand token to contain it.
        var peek = index + 1;
        var end = index;
        var args = [];

        if (axiom[peek] == '(') {
          var close = axiom.indexOf(')', peek);
          if (close == -1) {
            console.error("Invalid argument list for symbol %s.", symbol);
            return;
          }

          args = axiom.substring(peek + 1, close).replace(/ /g, '').split(',');
          end = close;
        }

        // Have the rule evaluate itself with the given parameters.
        var token = axiom.substring(index, end + 1);
        var production = rule.evaluate(args);
        if (production == token) {
          cb(production);
        } else {
          this.scan(production, limit, cb, depth + 1);
        }
        index = end + 1;
      }
    }

    // Expand an axiomatic expression using the grammar's ruleset and returning
    // the expanded string of terminals.

  }, {
    key: "expand",
    value: function expand(axiom, limit, depth) {
      depth = depth || 0;

      if (depth == limit) {
        return '';
      }

      var result = '';
      var index = 0;
      while (index < axiom.length) {
        var symbol = axiom[index];

        var rule = this.constants[symbol] || this.rules[symbol];
        if (!rule) {
          console.error("Unrecognized symbol %s.", symbol);
          return;
        }

        // Check for an argument list and expand token to contain it.
        var peek = index + 1;
        var end = index;
        var args = [];

        if (axiom[peek] == '(') {
          var close = axiom.indexOf(')', peek);
          if (close == -1) {
            console.error("Invalid argument list for symbol %s.", symbol);
            return;
          }

          args = axiom.substring(peek + 1, close).replace(/ /g, '').split(',');
          end = close;
        }

        // Have the rule evaluate itself with the given parameters.
        var token = axiom.substring(index, end + 1);
        var production = rule.evaluate(args);
        if (production == token) {
          result = result + production;
        } else {
          result = result + this.expand(production, limit, depth + 1);
        }
        index = end + 1;
      }
      return result;
    }
  }, {
    key: "addRule",
    value: function addRule(pred, prod, conds) {
      var symbol = pred[0];

      if (_lodash2.default.contains(RESTRICTED, symbol)) {
        console.error("Predecessor %s uses restricted symbol %s.", pred, symbol);
        return;
      }

      if (_lodash2.default.contains(_lodash2.default.keys(this.constants), symbol)) {
        console.error("Predecessor %s uses constant symbol %s.", pred, symbol);
        return;
      }

      this.rules[symbol] = new Rule(pred, prod, conds);
      return this.rules[symbol];
    }
  }, {
    key: "getRule",
    value: function getRule(symbol) {
      return this.rules[symbol] || null;
    }
  }]);

  return Grammar;
}();