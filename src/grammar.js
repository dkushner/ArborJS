import _ from "lodash";
import Rule from "./rule";

export default class Grammar {
  constructor(definitions) { 
    this.rules = {};

    if (definitions) {
      Object.keys(definitions).forEach((key) => {
        this.addRule(key, definitions[key]);
      });
    }
  }

  addRule(symbol, definition) {
    const groups = symbol.replace(/[\s]/g, '').match(/\S(?:\(.+?\))?/g);
    if (!groups || groups.length > 1) {
      throw new Error(`Symbol ${symbol} is invalid.`);
    }

    const predecessor = groups[0];
    if (predecessor.length === 1) {
      this.rules[predecessor] = (!!definition) ? new Rule(definition) : 
        new Rule(predecessor);

      return this;
    } 

    const parameters = predecessor.slice(2, predecessor.length - 1).split(',');
    if (!definition) {
      this.rules[predecessor[0]] = new Rule({ parameters, production: predecessor });
      return this;
    }

    if (Array.isArray(definition)) {
      const evaluator = definition.pop();
      this.rules[predecessor[0]] = new Rule([...parameters, evaluator]);
      return this;
    }

    switch (typeof definition) {
      case 'object': 
        definition.parameters = parameters;
        this.rules[predecessor[0]] = new Rule(definition);
        break;
      case 'string':
      case 'function':
        this.rules[predecessor[0]] = new Rule({ parameters, production: definition })
        break;
      default: break;
    }

    return this;
  }

  evaluate(axiom, depth = 1) {
    let source = axiom;

    for (let i = 0; i < depth; i++) {
      const tokens = this.tokenize(source);

      const evaluated = tokens.map((token) => {
        const rule = this.rules[token.symbol];

        if (!rule) {
          const arglist = (token.parameters.length) ? 
            '(' + token.parameters.join(', ') + ')' : '';

          return token.symbol + arglist;
        } else {
          return rule.evaluate(token.parameters);
        }
      });

      source = evaluated.join('');
    }

    return source;
  }

  tokenize(source) {
    const groups = source.replace(/\s/g, '').match(/\S(?:\(.+?\))?/g);

    return groups.map((group) => {
      if (group.length === 1) {
        return { symbol: group, parameters: [] };
      }

      const parameters = group.slice(2, group.length - 1).split(',').map(arg => {
        return parseFloat(arg) || arg;
      });

      return { symbol: group[0], parameters };
    });
  }
}

