import _ from "lodash";

const RESTRICTED = '()0123456789*+-/';
const BINARY_REGEX = /^\s*(([-]?[0-9]*\.?[0-9]+)|(\w))(\+|\-|\*|\/)(([-]?[0-9]*\.?[0-9]+)|(\w))$/;

export class Grammar {
  constructor(constants) {
    // Set up constants for this grammar. Constants cannot be expanded but they
    // may have parameters.
    this.constants = _.reduce(constants, (m, constant) => {
      let symbol = constant[0];
      if (_.contains(RESTRICTED, symbol)) {
        console.error("Constant symbol %s uses restricted character.");
      }

      m[symbol] = new Rule(constant);
      return m;
    }, {});
    this.rules = {}; 
  }

  scan(axiom, limit, cb, depth) {
    depth = depth || 0;

    if (depth == limit) {
      return;
    }

    let index = 0;
    while (index < axiom.length) {
      let symbol = axiom[index];

      let rule = this.constants[symbol] || this.rules[symbol];
      if (!rule) {
        console.error("Unrecognized symbol %s.", symbol);
        return;
      }

      // Check for an argument list and expand token to contain it.
      let peek = index + 1;
      let end = index;
      let args = [];

      if (axiom[peek] == '(') {
        let close = axiom.indexOf(')', peek);
        if (close == -1) {
          console.error("Invalid argument list for symbol %s.", symbol);
          return;
        }

        args = axiom.substring(peek + 1, close).replace(/ /g, '').split(',');
        end = close;
      } 

      // Have the rule evaluate itself with the given parameters.
      let token = axiom.substring(index, end + 1);
      let production = rule.evaluate(args);
      if (production == token) {
        cb(production);
      } else {
        this.scan(production, limit, cb, depth + 1);
      }
      index = end + 1;
    } 
  }

  // Expand an axiomatic expression using the grammar's ruleset and returning
  // the expanded string of terminals. 
  expand(axiom, limit, depth) {
    depth = depth || 0;

    if (depth == limit) {
      return '';
    }

    let result = '';
    let index = 0;
    while (index < axiom.length) {
      let symbol = axiom[index];

      let rule = this.constants[symbol] || this.rules[symbol];
      if (!rule) {
        console.error("Unrecognized symbol %s.", symbol);
        return;
      }

      // Check for an argument list and expand token to contain it.
      let peek = index + 1;
      let end = index;
      let args = [];

      if (axiom[peek] == '(') {
        let close = axiom.indexOf(')', peek);
        if (close == -1) {
          console.error("Invalid argument list for symbol %s.", symbol);
          return;
        }

        args = axiom.substring(peek + 1, close).replace(/ /g, '').split(',');
        end = close;
      } 

      // Have the rule evaluate itself with the given parameters.
      let token = axiom.substring(index, end + 1);
      let production = rule.evaluate(args);
      if (production == token) {
        result = result + production;
      } else {
        result = result + this.expand(production, limit, depth + 1);
      }
      index = end + 1;
    } 
    return result;
  }

  addRule(pred, prod, conds) {
    let symbol = pred[0];

    if (_.contains(RESTRICTED, symbol)) {
      console.error("Predecessor %s uses restricted symbol %s.", pred, symbol);
      return;
    }

    if (_.contains(_.keys(this.constants), symbol)) {
      console.error("Predecessor %s uses constant symbol %s.", pred, symbol);
      return;
    }

    this.rules[symbol] = new Rule(pred, prod, conds);
    return this.rules[symbol];
  }

  getRule(symbol) {
    return this.rules[symbol] || null;
  }
}

class Rule {
  constructor(pred, prod, conds) {
    this.predecessor = pred;
    this.symbol = pred[0];
    this.arguments = [];

    // Check predecessor for arguments list.
    if (pred[1] == '(') {
      let close = pred.indexOf(')', 1);
      if (close == -1) {
        console.error("Predecessor %s has malformed argument list.", pred);
        return;
      }

      this.arguments = pred.substring(2, close).replace(/ /g, '').split(',');
    }

    if (_.isObject(prod)) {
      this.production = pred;
      this.conditionals = prod;
    } else {
      this.production = prod;
      this.conditionals = conds;
    }
  }

  addProduction(value, condition) {
    if (!condition) {
      this.production = value;
    } else {
      this.conditionals[condition] = value;
    }
  }

  evaluate(arglist) {
    // Check to ensure the argument list length matches the expected number of
    // arguments for this module.
    if (arglist.length != this.arguments.length) {
      console.error("Invalid argument list %O for symbol %s.", arglist, this.symbol);
    }

    // Create a parsing context for this production.
    let args = _.reduce(this.arguments, (m, name, idx) => {
      m[name] = arglist[idx];
      return m;
    }, {});
    let context = new Context(args);

    // Determine which raw production string should be generated.
    let condProd = _.reduce(this.conditionals, (m, prod, cond) => {
      if (!m.value && context.consider(cond)) {
        m.value = prod;
      }
      return m;
    }, { value: null }).value;

    let raw = condProd || this.production || this.predecessor;

    // Perform variable substitution and evaluation on each argument list
    // appearing in the production string.
    return raw.replace(/\([^\(]+\)/g, (params) => {
      return '(' + params.replace(/[\(\)]/g, '').split(',').map((expr) => {
        return context.interpret(expr);
      }).join(', ') + ')';
    });
  }
}

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
