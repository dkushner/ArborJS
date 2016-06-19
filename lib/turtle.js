'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Turtle3D = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Turtle = function () {
  function Turtle(transformers) {
    _classCallCheck(this, Turtle);

    this.transformers = transformers;
  }

  _createClass(Turtle, [{
    key: 'consume',
    value: function consume(tape) {
      var _this = this;

      _lodash2.default.each(tape, function (token) {
        var transformer = _this.transformers[token.symbol];
        if (transformer) {
          transformer.apply(_this, token.parameters);
        }
      });

      return this.points;
    }
  }]);

  return Turtle;
}();

exports.default = Turtle;

var Turtle3D = exports.Turtle3D = function (_Turtle) {
  _inherits(Turtle3D, _Turtle);

  function Turtle3D() {
    var _transformers;

    _classCallCheck(this, Turtle3D);

    var transformers = (_transformers = {}, _defineProperty(_transformers, "#", function _(r, g, b) {
      _this2.color = new _three2.default.Color(r, g, b);
    }), _defineProperty(_transformers, "[", function _() {
      var color = _this2.color;
      var look = _this2.look;
      var position = _this2.position;

      _this2.stack.push({ color: color, look: look, position: position });
    }), _defineProperty(_transformers, "]", function _() {
      var popped = _this2.stack.pop();
      _this2.color = popped.color;
      _this2.look = popped.look;
      _this2.position = popped.position;
    }), _defineProperty(_transformers, "!", function _(d) {
      var offset = _this2.look.clone().multiplyScalar(d);
      _this2.position.add(offset);
      _this2.points.push({
        position: _this2.position.clone(),
        look: _this2.look.clone(),
        color: _this2.color.clone()
      });
    }), _defineProperty(_transformers, "@", function _(x, y, z) {
      var euler = new _three2.default.Euler(x, y, z);
      _this2.look.applyEuler(euler);
    }), _transformers);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Turtle3D).call(this, transformers));

    _this2.reset();
    return _this2;
  }

  _createClass(Turtle3D, [{
    key: 'reset',
    value: function reset() {
      this.color = new _three2.default.Color(0xffffff);
      this.look = new _three2.default.Vector3(0, 0, 1);
      this.position = new _three2.default.Vector3();
      this.points = [{
        position: this.position.clone(),
        look: this.look.clone(),
        color: this.color.clone()
      }];
      this.stack = [];
    }
  }]);

  return Turtle3D;
}(Turtle);