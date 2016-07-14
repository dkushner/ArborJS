import _ from "lodash";
import math from "mathjs";
import { RESTRICTED } from "./grammar";

function buildConditional(definition, arglist) {
  const normalized = definition.map((conditional) => {
    const normalized = {...conditional};

    switch (typeof conditional.when) {
      case 'string': {
        const expression = math.compile(conditional.when);
        normalized.when = (...args) => {
          const context = args.reduce((map, argument, index) => {
            map[arglist[index]] = argument;
            return map;
          }, {});
          return expression.eval(context);
        };
      } break;
      case 'function': 
        break;
      case 'default': 
        throw new Error(`Invalid conditional type: ${typeof conditional.when}.`);
    }

    switch (typeof conditional.then) {
      case 'string': {
        normalized.then = buildProduction(conditional.then, arglist);
      } break;
      case 'function':
        break;
      case 'default': 
        throw new Error(`Invalid production type: ${typeof conditional.then}.`);
    }

    return normalized;
  });

  return (...args) => {
    for (let i = 0; i < normalized.length; i++) {
      if (normalized[i].when.apply(null, args)) {
        return normalized[i].then.apply(null, args);
      }
    }
  };
}

function buildStochastic(definition, arglist) {
  let sumProbability = 0;

  const normalized = definition.map((conditional) => {
    const normalized = {...conditional};
    sumProbability += conditional.chance;

    switch (typeof conditional.then) {
      case 'string': {
        normalized.then = buildProduction(conditional.then, arglist);
      } break;
      case 'function':
        break;
      case 'default': 
        throw new Error(`Invalid production type: ${typeof conditional.then}.`);
    }

    return normalized;
  }).sort((a, b) => a.chance - b.chance);

  return (...args) => {
    const roll = Math.random();
    for (let i = 0; i < normalized.length; i++) {
      if (roll <= (normalized[i].chance / sumProbability)) {
        return normalized[i].then.apply(null, args);
      }
    }
  };
}

function buildProduction(definition, arglist) {
  switch (typeof definition) {
    case 'string': {
      const groups = definition.replace(/[\s]/g, '').match(/\S(?:\(.+?\))?/g);
      
      if (!groups.length) {
        throw new Error(`Definition contains no valid production.`);
      }

      // Iterate over every function group creating an evaluator.
      const evaluators = groups.map((group) => {
        const symbol = group[0];

        if (group.length === 1) {
          return () => symbol;
        }

        // Map the argument list to 
        const parameters = group.slice(2, group.length - 1).split(',');
        const expressions = math.compile(parameters);

        return (context) => {
          const evaluated = expressions.map(expression => expression.eval(context));
          return symbol + '(' + evaluated.join(', ') + ')';
        };
      });

      return (...args) => {
        const context = args.reduce((map, argument, index) => {
          map[arglist[index]] = argument;
          return map;
        }, {});

        return evaluators.map(evaluator => evaluator(context)).join('');
      };
    } break;
    case 'function': {
      return definition;
    } break;
    case 'object': {
      if (!Array.isArray(definition)) {
        throw new Error(`Unrecognized rule definition: ${definition}.`);
      }

      const sample = definition[0];
      if (!!sample.when) {
        return buildConditional(definition, arglist);
      } 

      if (!!sample.chance) {
        return buildStochastic(definition, arglist);
      }

      throw new Error(`Unrecognized rule definition: ${definition}.`);
    } break;
    default: break;
  } 
}

/**
 * Encapsulates a single production rule in a grammar.
 */
export default class Rule {
  constructor(definition) {
    this.parameters = [];

    if (Array.isArray(definition)) {
      this.evaluator = definition.pop();
      this.parameters = definition;
      return this;
    } 

    const type = typeof definition;
    switch (type) {
      case 'function': {
        this.evaluator = definition;
      } break;
      case 'string': {
        this.evaluator = () => definition;
      } break;
      case 'object': {
        const { parameters, production } = definition;
        this.parameters = parameters || [];
        this.evaluator = buildProduction(production, this.parameters);
      } break;
    }
  }

  evaluate(args) {
    return this.evaluator.apply(null, args);
  }
}
