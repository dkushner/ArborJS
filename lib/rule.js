"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _context = require("./context");

var Context = _interopRequireWildcard(_context);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rule = function () {
  function Rule(pred, prod, conds) {
    _classCallCheck(this, Rule);

    this.predecessor = pred;
    this.symbol = pred[0];
    this.arguments = [];

    // Check predecessor for arguments list.
    if (pred[1] == '(') {
      var close = pred.indexOf(')', 1);
      if (close == -1) {
        console.error("Predecessor %s has malformed argument list.", pred);
        return;
      }

      this.arguments = pred.substring(2, close).replace(/ /g, '').split(',');
    }

    if (_lodash2.default.isObject(prod)) {
      this.production = pred;
      this.conditionals = prod;
    } else {
      this.production = prod;
      this.conditionals = conds;
    }
  }

  _createClass(Rule, [{
    key: "addProduction",
    value: function addProduction(value, condition) {
      if (!condition) {
        this.production = value;
      } else {
        this.conditionals[condition] = value;
      }
    }
  }, {
    key: "evaluate",
    value: function evaluate(arglist) {
      // Check to ensure the argument list length matches the expected number of
      // arguments for this module.
      if (arglist.length != this.arguments.length) {
        console.error("Invalid argument list %O for symbol %s.", arglist, this.symbol);
      }

      // Create a parsing context for this production.
      var args = _lodash2.default.reduce(this.arguments, function (m, name, idx) {
        m[name] = arglist[idx];
        return m;
      }, {});
      var context = new Context(args);

      // Determine which raw production string should be generated.
      var condProd = _lodash2.default.reduce(this.conditionals, function (m, prod, cond) {
        if (!m.value && context.consider(cond)) {
          m.value = prod;
        }
        return m;
      }, { value: null }).value;

      var raw = condProd || this.production || this.predecessor;

      // Perform variable substitution and evaluation on each argument list
      // appearing in the production string.
      return raw.replace(/\([^\(]+\)/g, function (params) {
        return '(' + params.replace(/[\(\)]/g, '').split(',').map(function (expr) {
          return context.interpret(expr);
        }).join(', ') + ')';
      });
    }
  }]);

  return Rule;
}();

exports.default = Rule;