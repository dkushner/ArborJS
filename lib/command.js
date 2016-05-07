"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Commands are simple instructions emitted by the L-system interpreter and received by one
 * or many turtles that then act on the instruction. It is comprised of nothing more than a
 * verb and an optional set of real parameters.
 */

var FORWARD = exports.FORWARD = 0x1;
var BACK = exports.BACK = 0x2;
var PUSH = exports.PUSH = 0x3;
var POP = exports.POP = 0x4;
var ROTATE = exports.ROTATE = 0x5;
var COLOR = exports.COLOR = 0x6;
var SCALE = exports.SCALE = 0x7;