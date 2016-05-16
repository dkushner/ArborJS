import _ from "lodash";
import Rule from "./rule";

const RESTRICTED = '()0123456789*+-/';

export { RESTRICTED };

export default class Grammar {
  constructor() {
    this.rules = {}
  }

  tokenize(source) {
    let tokens = [];

    // Sanitize source string of whitespace.
    source = source.replace(/ /g, "");

    for (let index = 0; index < source.length; index++) {
      let symbol = source[index];

      if (_.includes(RESTRICTED, symbol)) {
        throw new Error(`Source contains restricted symbol "${symbol}"; position ${index}.`);
      }

      let token = { symbol };

      if (source[index + 1] == "(") {
        let close = source.indexOf(")", index + 1);

        if (close == -1) {
          throw new Error(`Source "${source}" has unclosed parameter list.`);
        }

        token.parameters = source.substring(index + 2, close).split(",");
        index = close;
      }

      tokens.push(token);
    }

    return tokens;
  }

  interpret(source, limit) {
    let expanded = source;
    let tokens = [];

    limit = limit || 1;

    for (var level = 0; level < limit; level++) {
      tokens = this.tokenize(expanded);
      expanded = "";

      _.each(tokens, (token) => {
        let rule = this.rules[token.symbol];

        if (!rule) {
          throw new Error(`Unrecognized symbol ${token.symbol}.`);
        }

        expanded += rule.expand(token.parameters);
      });
    }

    // Tokenize the final source string and drop any non-terminal tokens.
    return this.tokenize(expanded);
  }

  scan(axiom, limit, cb, depth) {
    depth = depth || 0;

    if (depth == limit) {
      return;
    }

    let index = 0;
    while (index < axiom.length) {
      let symbol = axiom[index];

      let rule = this.rules[symbol];
      if (!rule) {
        throw new Error(`Unrecognized symbol ${token.symbol}.`);
      }

      // Check for an argument list and expand token to contain it.
      let peek = index + 1;
      let end = index;
      let args = [];

      if (axiom[peek] == '(') {
        let close = axiom.indexOf(')', peek);
        if (close == -1) {
          throw new Error(`Invalid argument list for symbol ${symbol}.`);
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

  addRule(pred, prod, conds) {
    let symbol = pred[0];

    if (_.includes(RESTRICTED, symbol)) {
      console.error("Predecessor %s uses restricted symbol %s.", pred, symbol);
      return;
    }

    if (_.includes(_.keys(this.terminals), symbol)) {
      console.error("Predecessor %s uses constant symbol %s.", pred, symbol);
      return;
    }

    this.rules[symbol] = new Rule(pred, prod, conds);
    return this;
  }
}
