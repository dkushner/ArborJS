import _ from "lodash";

class Context {
  constructor(locals) {
    this.locals = locals;
  }

  consider(condition) {
    let clean = condition.replace(/ /g, '');
    if (!clean.length) {
      console.error("Empty condition expression.");
      return;
    }

    let op = condition.match(/(\=|\<|\>)/)[1];
    if (!op) {
      console.error("Invalid condition expression %s.", condition);
      return;
    }

    let parts = condition.split(op);
    let lhs = this.interpret(parts[0]);
    let rhs = this.interpret(parts[1]);

    switch (op) {
      case '=': {
        return lhs == rhs;
      } break;
      case '<': {
        return lhs < rhs;
      } break;
      case '>': {
        return lhs > rhs;
      } break;
      default: {
        return false;
      } break;
    }
  }

  // Evaluate an expression in the given context. Only three types of expressions
  // are permitted: local variable restatement, numeric constants and simple binary 
  // arithmetic.
  interpret(expression) {
    // Condense the expression.
    let clean = expression.replace(/ /g, '');
    if (!clean.length) {
      return null;
    }

    // Determine if this is an arithmetic expression.
    let arithmetic = BINARY_REGEX.test(clean);
    if (arithmetic) {
      let parts = expression.match(BINARY_REGEX);

      let lhs = this.interpret(parts[1]);
      let op = parts[4];
      let rhs = this.interpret(parts[5]);

      if (!lhs) {
        console.error("Unrecognized token %s in expression %s.", lhs, expression);
      }

      if (!rhs) {
        console.error("Unrecognized token %s in expression %s.", lhs, expression);
      }

      switch (op) {
        case '+': {
          return lhs + rhs;
        } break;
        case '-': { 
          return lhs - rhs;
        } break;
        case '/': {
          return lhs / rhs;
        } break;
        case '*': {
          return lhs * rhs;
        } break;
        default: {
          return null;
        } break;
      }
    } else {
      let asNum = parseFloat(clean);
      if (!_.isNaN(asNum)) {
        return asNum;
      }

      asNum = parseFloat(this.locals[clean]);
      if (_.isNaN(asNum)) {
        console.error("Unknown variable reference %s.", clean);
        return;
      }
      return asNum;
    }
  }
}
