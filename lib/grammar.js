"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _rule = require("./rule");

var _rule2 = _interopRequireDefault(_rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Grammar = function () {
  function Grammar(definitions) {
    var _this = this;

    _classCallCheck(this, Grammar);

    this.rules = {};

    if (definitions) {
      Object.keys(definitions).forEach(function (key) {
        _this.addRule(key, definitions[key]);
      });
    }
  }

  _createClass(Grammar, [{
    key: "addRule",
    value: function addRule(symbol, definition) {
      var groups = symbol.replace(/[\s]/g, '').match(/\S(?:\(.+?\))?/g);
      if (!groups || groups.length > 1) {
        throw new Error("Symbol " + symbol + " is invalid.");
      }

      var predecessor = groups[0];
      if (predecessor.length === 1) {
        this.rules[predecessor] = !!definition ? new _rule2.default(definition) : new _rule2.default(predecessor);

        return this;
      }

      var parameters = predecessor.slice(2, predecessor.length - 1).split(',');
      if (!definition) {
        this.rules[predecessor[0]] = new _rule2.default({ parameters: parameters, production: predecessor });
        return this;
      }

      if (Array.isArray(definition)) {
        var evaluator = definition.pop();
        this.rules[predecessor[0]] = new _rule2.default([].concat(_toConsumableArray(parameters), [evaluator]));
        return this;
      }

      switch (typeof definition === "undefined" ? "undefined" : _typeof(definition)) {
        case 'object':
          definition.parameters = parameters;
          this.rules[predecessor[0]] = new _rule2.default(definition);
          break;
        case 'string':
        case 'function':
          this.rules[predecessor[0]] = new _rule2.default({ parameters: parameters, production: definition });
          break;
        default:
          break;
      }

      return this;
    }
  }, {
    key: "evaluate",
    value: function evaluate(axiom) {
      var _this2 = this;

      var depth = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      var source = axiom;

      for (var i = 0; i < depth; i++) {
        var tokens = this.tokenize(source);

        var evaluated = tokens.map(function (token) {
          var rule = _this2.rules[token.symbol];

          if (!rule) {
            var arglist = token.parameters.length ? '(' + token.parameters.join(', ') + ')' : '';

            return token.symbol + arglist;
          } else {
            return rule.evaluate(token.parameters);
          }
        });

        source = evaluated.join('');
        console.log(source);
      }

      return source;
    }
  }, {
    key: "tokenize",
    value: function tokenize(source) {
      var groups = source.replace(/\s/g, '').match(/\S(?:\(.+?\))?/g);

      return groups.map(function (group) {
        if (group.length === 1) {
          return { symbol: group, parameters: [] };
        }

        var parameters = group.slice(2, group.length - 1).split(',').map(function (arg) {
          return parseFloat(arg) || arg;
        });

        return { symbol: group[0], parameters: parameters };
      });
    }
  }]);

  return Grammar;
}();

exports.default = Grammar;