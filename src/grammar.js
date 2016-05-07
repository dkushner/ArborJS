import _ from "lodash";

const RESTRICTED = '()0123456789*+-/';
const BINARY_REGEX = /^\s*(([-]?[0-9]*\.?[0-9]+)|(\w))(\+|\-|\*|\/)(([-]?[0-9]*\.?[0-9]+)|(\w))$/;

export class Grammar {
  constructor(constants) {
    // Set up constants for this grammar. Constants cannot be expanded but they
    // may have parameters.
    this.constants = _.reduce(constants, (m, command, constant) => {
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
