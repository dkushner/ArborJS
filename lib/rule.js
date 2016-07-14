"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _mathjs = require("mathjs");

var _mathjs2 = _interopRequireDefault(_mathjs);

var _grammar = require("./grammar");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function buildConditional(definition, arglist) {
  var normalized = definition.map(function (conditional) {
    var normalized = _extends({}, conditional);

    switch (_typeof(conditional.when)) {
      case 'string':
        {
          (function () {
            var expression = _mathjs2.default.compile(conditional.when);
            normalized.when = function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              var context = args.reduce(function (map, argument, index) {
                map[arglist[index]] = argument;
                return map;
              }, {});
              return expression.eval(context);
            };
          })();
        }break;
      case 'function':
        break;
      case 'default':
        throw new Error("Invalid conditional type: " + _typeof(conditional.when) + ".");
    }

    switch (_typeof(conditional.then)) {
      case 'string':
        {
          normalized.then = buildProduction(conditional.then, arglist);
        }break;
      case 'function':
        break;
      case 'default':
        throw new Error("Invalid production type: " + _typeof(conditional.then) + ".");
    }

    return normalized;
  });

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    for (var i = 0; i < normalized.length; i++) {
      if (normalized[i].when.apply(null, args)) {
        return normalized[i].then.apply(null, args);
      }
    }
  };
}

function buildStochastic(definition, arglist) {
  var sumProbability = 0;

  var normalized = definition.map(function (conditional) {
    var normalized = _extends({}, conditional);
    sumProbability += conditional.chance;

    switch (_typeof(conditional.then)) {
      case 'string':
        {
          normalized.then = buildProduction(conditional.then, arglist);
        }break;
      case 'function':
        break;
      case 'default':
        throw new Error("Invalid production type: " + _typeof(conditional.then) + ".");
    }

    return normalized;
  }).sort(function (a, b) {
    return a.chance - b.chance;
  });

  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var roll = Math.random();
    for (var i = 0; i < normalized.length; i++) {
      if (roll <= normalized[i].chance / sumProbability) {
        return normalized[i].then.apply(null, args);
      }
    }
  };
}

function buildProduction(definition, arglist) {
  switch (typeof definition === "undefined" ? "undefined" : _typeof(definition)) {
    case 'string':
      {
        var _ret2 = function () {
          var groups = definition.replace(/[\s]/g, '').match(/\S(?:\(.+?\))?/g);

          if (!groups.length) {
            throw new Error("Definition contains no valid production.");
          }

          // Iterate over every function group creating an evaluator.
          var evaluators = groups.map(function (group) {
            var symbol = group[0];

            if (group.length === 1) {
              return function () {
                return symbol;
              };
            }

            // Map the argument list to
            var parameters = group.slice(2, group.length - 1).split(',');
            var expressions = _mathjs2.default.compile(parameters);

            return function (context) {
              var evaluated = expressions.map(function (expression) {
                return expression.eval(context);
              });
              return symbol + '(' + evaluated.join(', ') + ')';
            };
          });

          return {
            v: function v() {
              for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
              }

              var context = args.reduce(function (map, argument, index) {
                map[arglist[index]] = argument;
                return map;
              }, {});

              return evaluators.map(function (evaluator) {
                return evaluator(context);
              }).join('');
            }
          };
        }();

        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
      }break;
    case 'function':
      {
        return definition;
      }break;
    case 'object':
      {
        if (!Array.isArray(definition)) {
          throw new Error("Unrecognized rule definition: " + definition + ".");
        }

        var sample = definition[0];
        if (!!sample.when) {
          return buildConditional(definition, arglist);
        }

        if (!!sample.chance) {
          return buildStochastic(definition, arglist);
        }

        throw new Error("Unrecognized rule definition: " + definition + ".");
      }break;
    default:
      break;
  }
}

/**
 * Encapsulates a single production rule in a grammar.
 */

var Rule = function () {
  function Rule(definition) {
    _classCallCheck(this, Rule);

    this.parameters = [];

    if (Array.isArray(definition)) {
      this.evaluator = definition.pop();
      this.parameters = definition;
      return this;
    }

    var type = typeof definition === "undefined" ? "undefined" : _typeof(definition);
    switch (type) {
      case 'function':
        {
          this.evaluator = definition;
        }break;
      case 'string':
        {
          this.evaluator = function () {
            return definition;
          };
        }break;
      case 'object':
        {
          var parameters = definition.parameters;
          var production = definition.production;

          this.parameters = parameters || [];
          this.evaluator = buildProduction(production, this.parameters);
        }break;
    }
  }

  _createClass(Rule, [{
    key: "evaluate",
    value: function evaluate(args) {
      return this.evaluator.apply(null, args);
    }
  }]);

  return Rule;
}();

exports.default = Rule;