import _ from "lodash";
import { RESTRICTED } from "./grammar";

/**
 * Encapsulates a single production rule in a grammar.
 */
export default class Rule {
  /**
   * Creates a new rule instance.
   *
   * @param {string} predicate Rule predicate that expands into a production when interpreted.
   * @param {?string} production The default production of this rule. If none is provided, the identity
   * production is assumed.
   * @return {Rule} A new rule instance.
   */
  constructor(predecessor, production) {
    this.predecessor = predecessor.replace(/ /g, '');
    this.symbol = this.predecessor[0];
    this.parameters = [];

    if (this.predecessor[1] == '(') {
      let close = this.predecessor.indexOf(')', 1);

      if (close == -1) {
        throw new Error(`Predecessor ${this.predecessor} has unclosed parameter list.`);
      }

      this.parameters = _.map(this.predecessor.substring(2, close).replace(/ /g, '').split(','), (param) => {
        if (param.length != 1 || _.includes(RESTRICTED, param)) {
          throw new Error(`Predecessor ${this.predecessor} has illegal parameter '${param}'.`);
        }
        
        return param;
      });
    }

    // Parse the production to validate that all variable references are valid
    // and to create resolvers for each set of virtual productions.
    production = (production) ? production.replace(/ /g, '') : this.predecessor;

    let virtuals = [];
    for (let index = 0; index < production.length; index++) {
      let symbol = production[index];

      if (_.includes(RESTRICTED, symbol)) {
        throw new Error(`Production ${production} contains restricted symbol "${symbol}"; position ${index}.`);
      }

      let virtual = { symbol };

      if (production[index + 1] == "(") {
        let close = production.indexOf(")", index + 1);

        if (close == -1) {
          throw new Error(`Production ${production} has unclosed parameter list.`);
        }

        let parameters = production.substring(index + 2, close).split(",");
        virtual.parameters = parameters.map(this.virtualize, this);
        index = close;
      }

      virtuals.push(virtual);
    }

    this.production = virtuals;
    this.conditionals = [];
  }

  /**
   * Virtualizes simple expressions for repeated evaluation.
   * 
   * @param {!string} expression The simple expression to virtualize. 
   * @return {function(ctx: Object)} Function that evaluates the expression for a provided context.
   */
  virtualize(expression) {
    let numeric = parseFloat(expression);
    if (!_.isNaN(numeric)) {
      return () => { return numeric };
    }

    if (expression.length == 1 && _.includes(this.parameters, expression)) {
      return (ctx) => { return ctx[expression]; }
    }

    let comparison = expression.match(/(\=|\<|\>)/);
    if (comparison) {
      let op = comparison[1];
      let operands = expression.split(op);
      let lhs = this.virtualize(operands[0]);
      let rhs = this.virtualize(operands[1]);

      if (!lhs || !rhs) {
        throw new Error(`Conditional "${expression}" contains invalid number of operands.`);
      }

      switch (comp) {
        case "=":
          return (ctx) => { return lhs(ctx) == rhs(ctx) };
        case ">":
          return (ctx) => { return lhs(ctx) > rhs(ctx) };
        case "<":
          return (ctx) => { return lhs(ctx) < rhs(ctx) };
      }
    }

    let arithmetic = expression.match(/(\+|\*|\-|\/)/);
    if (arithmetic) {
      let op = arithmetic[1];
      let operands = expression.split(op);
      let lhs = this.virtualize(operands[0]);
      let rhs = this.virtualize(operands[1]);

      if (!lhs || !rhs) {
        throw new Error(`Binary operation "${expression}" contains invalid number of operands.`);
      }

      switch (op) {
        case "+":
          return (ctx) => { return lhs(ctx) + rhs(ctx) };
        case "-":
          return (ctx) => { return lhs(ctx) - rhs(ctx) };
        case "*":
          return (ctx) => { return lhs(ctx) * rhs(ctx) };
        case "/":
          return (ctx) => { return lhs(ctx) / rhs(ctx) };
      }
    }
  }

  /**
   * Adds a condition production to the rule. Returns target rule and may be chained.
   *
   * @param {string} condition Conditional expression to evaluate.
   * @param {string} production Production emitted when conditional expression is true.
   * @return {Rule} The rule to which the conditional production was added.
   */
  addCondition(condition, production) {
    production = production.replace(/ /g, '');

    let virtuals = [];
    for (let index = 0; index < production.length; index++) {
      let symbol = production[index];

      if (_.includes(RESTRICTED, symbol)) {
        throw new Error(`Production ${production} contains restricted symbol "${symbol}"; position ${index}.`);
      }

      let virtual = { symbol };

      if (production[index + 1] == "(") {
        let close = production.indexOf(")", index + 1);

        if (close == -1) {
          throw new Error(`Production ${production} has unclosed parameter list.`);
        }

        let parameters = production.substring(index + 2, close).split(",");
        virtual.parameters = _.map(parameters, this.virtualize, this);
        index = close;
      }

      virtuals.push(virtual);
    }

    this.conditionals.push({
      given: this.virtualize(condition),
      produce: virtuals
    });

    return this;
  }

  /**
   * Given an ordered argument list, returns an ordered array of tokens produced by the the rule.
   *
   * @param {number[]} arglist Numeric arguments to bind to predecessor parameters.
   * @return {Object[]} List of generated tokens containing a symbol and evaluated parameters.
   */
  expand(arglist) {
    if (arglist.length != this.parameters.length) {
      throw new Error(`Expected argument list of length ${this.parameters.length} but found ${arglist.length}.`);
    }

    let locals = _.reduce(arglist, (memo, arg, index) => {
      let param = this.parameters[index];
      memo[param] = arg;
      return memo;
    }, {});

    if (!_.isEmpty(this.conditionals)) {
      for (let cond in this.conditionals) {
        if (cond.given(locals)) {
          return _.map(cond.produce, (token) => {
            const parameters = _.map(token.parameters, (param) => {
              return param(locals);
            });

            return { ...token, parameters }; 
          });
        }
      }
    }

    return _.map(this.production, (token) => {
      const parameters = _.map(token.parameters, (param) => {
        return param(locals);
      });

      return { ...token, parameters };
    });
  }
}

