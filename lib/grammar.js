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

  /**
   * General purpose method for splitting a source string into tokens.
   *
   * @param {string} source The source string to tokenize.
   * @return {object[]} The list of tokens produced from the source string.
   */


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

    /**
     * Expands a source string into a set of tokens to a given depth.
     *
     * @param {string} source Source string to expand.
     * @param {?number} limit The maximum depth to expand.
     * @return {object[]} The resulting expanded token list.
     */

  }, {
    key: "interpret",
    value: function interpret(source) {
      var _this = this;

      var limit = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      var expanded = _lodash2.default.map(this.tokenize(source), function (token) {
        token.parameters = _lodash2.default.map(token.parameters, function (param) {
          var number = parseFloat(param);
          if (!number) {
            throw new Error("Source strings cannot contain symbol parameters.");
          }

          return number;
        });
        return token;
      });

      var tokens = [];

      for (var level = 0; level < limit; level++) {
        tokens = [];

        _lodash2.default.each(expanded, function (token) {
          var rule = _this.rules[token.symbol];

          if (!rule) {
            throw new Error("Unrecognized symbol " + token.symbol + ".");
          }

          Array.prototype.push.apply(tokens, rule.expand(token.parameters));
        });

        expanded = tokens;
      }

      return tokens;
    }

    /**
     * Adds a simple rule to the grammar.
     *
     * @param {Rule} rule Rule to add to this grammar.
     */

  }, {
    key: "addRule",
    value: function addRule(rule) {
      this.rules[rule.symbol] = rule;
      return rule;
    }
  }]);

  return Grammar;
}();

exports.default = Grammar;