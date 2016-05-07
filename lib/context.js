"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function () {
  function Context(locals) {
    _classCallCheck(this, Context);

    this.locals = locals;
  }

  _createClass(Context, [{
    key: "consider",
    value: function consider(condition) {
      var clean = condition.replace(/ /g, '');
      if (!clean.length) {
        console.error("Empty condition expression.");
        return;
      }

      var op = condition.match(/(\=|\<|\>)/)[1];
      if (!op) {
        console.error("Invalid condition expression %s.", condition);
        return;
      }

      var parts = condition.split(op);
      var lhs = this.interpret(parts[0]);
      var rhs = this.interpret(parts[1]);

      switch (op) {
        case '=':
          {
            return lhs == rhs;
          }break;
        case '<':
          {
            return lhs < rhs;
          }break;
        case '>':
          {
            return lhs > rhs;
          }break;
        default:
          {
            return false;
          }break;
      }
    }

    // Evaluate an expression in the given context. Only three types of expressions
    // are permitted: local variable restatement, numeric constants and simple binary
    // arithmetic.

  }, {
    key: "interpret",
    value: function interpret(expression) {
      // Condense the expression.
      var clean = expression.replace(/ /g, '');
      if (!clean.length) {
        return null;
      }

      // Determine if this is an arithmetic expression.
      var arithmetic = BINARY_REGEX.test(clean);
      if (arithmetic) {
        var parts = expression.match(BINARY_REGEX);

        var lhs = this.interpret(parts[1]);
        var op = parts[4];
        var rhs = this.interpret(parts[5]);

        if (!lhs) {
          console.error("Unrecognized token %s in expression %s.", lhs, expression);
        }

        if (!rhs) {
          console.error("Unrecognized token %s in expression %s.", lhs, expression);
        }

        switch (op) {
          case '+':
            {
              return lhs + rhs;
            }break;
          case '-':
            {
              return lhs - rhs;
            }break;
          case '/':
            {
              return lhs / rhs;
            }break;
          case '*':
            {
              return lhs * rhs;
            }break;
          default:
            {
              return null;
            }break;
        }
      } else {
        var asNum = parseFloat(clean);
        if (!_lodash2.default.isNaN(asNum)) {
          return asNum;
        }

        asNum = parseFloat(this.locals[clean]);
        if (_lodash2.default.isNaN(asNum)) {
          console.error("Unknown variable reference %s.", clean);
          return;
        }
        return asNum;
      }
    }
  }]);

  return Context;
}();