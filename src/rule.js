import _ from "lodash";
import * as Context from "./context";

export default class Rule {
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
