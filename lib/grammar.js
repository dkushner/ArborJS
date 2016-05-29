"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RESTRICTED = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _rule = require("./rule");

var _rule2 = _interopRequireDefault(_rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RESTRICTED = '()0123456789*+-/';

exports.RESTRICTED = RESTRICTED;

var Grammar = function () {
  function Grammar() {
    _classCallCheck(this, Grammar);

    this.rules = {};
  }

  _createClass(Grammar, [{
    key: "tokenize",
    value: function tokenize(source) {
      var tokens = [];

      // Sanitize source string of whitespace.
      source = source.replace(/ /g, "");

      for (var index = 0; index < source.length; index++) {
        var symbol = source[index];

        if (_lodash2.default.includes(RESTRICTED, symbol)) {
          throw new Error("Source contains restricted symbol \"" + symbol + "\"; position " + index + ".");
        }

        var token = { symbol: symbol };

        if (source[index + 1] == "(") {
          var close = source.indexOf(")", index + 1);

          if (close == -1) {
            throw new Error("Source \"" + source + "\" has unclosed parameter list.");
          }

          token.parameters = source.substring(index + 2, close).split(",");
          index = close;
        }

        tokens.push(token);
      }

      return tokens;
    }
  }, {
    key: "interpret",
    value: function interpret(source, limit) {
      var _this = this;

      var expanded = source;
      var tokens = [];

      limit = limit || 1;

      for (var level = 0; level < limit; level++) {
        tokens = this.tokenize(expanded);
        expanded = "";

        _lodash2.default.each(tokens, function (token) {
          var rule = _this.rules[token.symbol];

          if (!rule) {
            throw new Error("Unrecognized symbol " + token.symbol + ".");
          }

          expanded += rule.evaluate(token.parameters);
        });
      }

      // Tokenize the final source string and drop any non-terminal tokens.
      return this.tokenize(expanded);
    }

    /**
     * Adds a simple rule to the grammar.
     *
     * @param {string} predicate Rule predicate that expands into a production when interpreted.
     * @param {?string} production The default production of this rule. If none is provided, the identity
     * production is assumed.
     * @return {Rule} The rule that was added to the grammar.
     */

  }, {
    key: "addRule",
    value: function addRule(predicate, production) {
      var rule = new _rule2.default(predicate, production);
      this.rules[rule.symbol] = rule;
      return rule;
    }
  }]);

  return Grammar;
}();

exports.default = Grammar;