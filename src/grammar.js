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

        expanded += rule.evaluate(token.parameters);
      });
    }

    return this.tokenize(expanded);
  }

  /**
   * Adds a simple rule to the grammar.
   *
   * @param {string} predicate Rule predicate that expands into a production when interpreted.
   * @param {?string} production The default production of this rule. If none is provided, the identity
   * production is assumed.
   * @return {Rule} The rule that was added to the grammar.
   */
  addRule(predicate, production) {
    let rule = new Rule(predicate, production);
    this.rules[rule.symbol] = rule;
    return rule;
  }
}
