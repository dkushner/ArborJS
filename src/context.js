import _ from "lodash";

const BINARY_PATTERN = /(\w+)(\+|\-|\*|\/)(\w+)/g;

export default class Context {
  constructor(locals) {
    this.locals = locals || {};

    let symbols = _.escapeRegExp(Object.keys(this.locals).join(''));
    this.pattern = new RegExp(`[${symbols}]`);
  }

  consider(condition) {
    let op = condition.match(/(\=|\<|\>)/)[1];
    
    if (!op) {
      throw new Error(`Invalid conditional statement ${condition}. No operator.`);
    }

    let parts = condition.split(op);
    let rawLeft = this.evaluate(parts[0]);
    let rawRight = this.evaluate(parts[1]);
    let lhs = parseFloat(rawLeft);
    let rhs = parseFloat(rawRight);

    if (_.isNaN(lhs)) {
      throw new Error(`Unable to parse subexpression "${rawLeft}" of condition ${condition}.`);
    }

    if (_.isNaN(rhs)) {
      throw new Error(`Unable to parse subexpression "${rawRight}" of condition ${condition}.`);
    }

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

  interpolate(expression) {
    return _.replace(expression, this.pattern, (name, position, source) => {
      return this.locals[name];
    });
  }

  // Attempts to evaluate an arithmetic or constant expression.
  // The function first interpolates the expression, replacing any local
  // variables with their contextual value. It then evaluates any binary 
  // expressions present in the expression
  evaluate(expression) {
    let interpolated = this.interpolate(expression);

    // Then evaluate any binary operations present in the expression.
    let evaluated = _.replace(interpolated, BINARY_PATTERN, (expr, position, source) => {
      let parts = expr.match(BINARY_REGEX);
      let lhs = parseFloat(parts[1]);
      let op = parts[4];
      let rhs = parseFloat(parts[5]);

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
    }); 

    return evaluated;
  }
}
