import _ from 'lodash';

export class Turtle {
  constructor(initial) {
    this.commands = {};
    this.stateStack = new StateStack(initial);
  }

  get state() {
    return this.stateStack;
  }

  consume(command) {
    let index = 0;

    while (index < command.length) {
      let peek = index + 1;
      let end = index;

      let symbol = command[index];
      let action = this.commands[symbol];
      let args = [];

      if (!action) {
        console.error("Failed to interpret symbol %s.", symbol);
      }

      if (command[peek] == '(') {
        end = command.indexOf(')', peek);
        args = command.substring(peek + 1, end).replace(/ /g, '').split(',');
      }

      args = _.map(args, (arg) => {
        return parseFloat(arg);
      });

      action.apply(this.state, args);
      index = end + 1;
    }
  }

  addCommand(symbol, action) {
    this.commands[symbol] = action;
  }
}

class StateStack {
  constructor(initial) {
    this.stack = [initial || {}];
  }

  put(key, val) {
    this.stack[0][key] = val;
  }

  get(key) {
    return this.stack[0][key];
  }

  push() {
    this.stack.unshift(_.clone(this.stack[0]));
  }

  pop() {
    if (this.stack.length == 1) {
      console.warning("Failed to pop stack. Reached initial state.");
      return null;
    } else {
      return this.stack.shift();
    }
  }
}


