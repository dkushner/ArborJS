"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _grammar = require("./grammar");

var _grammar2 = _interopRequireDefault(_grammar);

var _rule = require("./rule");

var _rule2 = _interopRequireDefault(_rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ArborJS = {
  Grammar: _grammar2.default,
  Rule: _rule2.default
};

exports.default = ArborJS;