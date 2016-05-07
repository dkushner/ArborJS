
/**
 * Commands are simple instructions emitted by the L-system interpreter and received by one
 * or many turtles that then act on the instruction. It is comprised of nothing more than a
 * verb and an optional set of real parameters.
 */

export const FORWARD = 0x1;
export const BACK = 0x2;
export const PUSH = 0x3
export const POP = 0x4;
export const ROTATE = 0x5;
export const COLOR = 0x6;
export const SCALE = 0x7;
