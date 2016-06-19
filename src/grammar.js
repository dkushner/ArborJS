import _ from "lodash";
import Rule from "./rule";

const RESTRICTED = '()0123456789*+-/';

export { RESTRICTED };

export default class Grammar {
  constructor() {
    this.rules = {}
  }

  /**
   * General purpose method for splitting a source string into tokens.
   *
   * @param {string} source The source string to tokenize.
   * @return {object[]} The list of tokens produced from the source string.
   */
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

  /**
   * Expands a source string into a set of tokens to a given depth.
   *
   * @param {string} source Source string to expand.
   * @param {?number} limit The maximum depth to expand.
   * @return {object[]} The resulting expanded token list.
   */
  interpret(source, limit = 1) {
    let expanded = _.map(this.tokenize(source), (token) => {
      token.parameters = _.map(token.parameters, (param) => {
        let number = parseFloat(param);
        if (!number) {
          throw new Error(`Source strings cannot contain symbol parameters.`);
        }

        return number;
      });
      return token;
    });

    let tokens = [];

    for (var level = 0; level < limit; level++) {
      tokens = [];

      _.each(expanded, (token) => {
        let rule = this.rules[token.symbol];

        if (!rule) {
          throw new Error(`Unrecognized symbol ${token.symbol}.`);
        }

        Array.prototype.push.apply(tokens, rule.expand(token.parameters));
      });

      expanded = tokens;
    }

    return tokens;
  }

  /**
   * Adds a simple rule to the grammar.
   *
   * @param {Rule} rule Rule to add to this grammar.
   */
  addRule(rule) {
    this.rules[rule.symbol] = rule;
    return rule;
  }
}
