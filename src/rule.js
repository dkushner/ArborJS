import _ from "lodash";
import Context from "./context";
import { RESTRICTED } from "./grammar";

export default class Rule {
  constructor(pred, prod) {
    this.predecessor = pred.replace(/ /g, '');
    this.symbol = pred[0];
    this.production = "";
    this.parameters = [];

    // Check predecessor for arguments list.
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
  }

  addProduction(value, condition) {
    if (!_.isString(value)) {
      throw new Error(`Invalid type for production. Expected string, received ${typeof value}.`);
    }

    if (!condition) {
      this.production = value.replace(/ /g, '');
      return this;
    } 

    if (!_.isString(condition)) {
      throw new Error(`Invalid type for condition. Expected string, received ${typeof condition}.`);
    }

    let normalized = condition.replace(/ /g, '');
    let operations = normalized.match(/(\=|\<|\>)/);

    if (!operations || operations.length != 2) {
      throw new Error(`Invalid conditional statement '${condition}'.`);
    }

    let op = operations[1];
    let operands = normalized.split(op);

    _.each(operands, (operand) => {
      let numeric = parseFloat(operand);
      if (!_.isNaN(numeric)) return;

      if (operand.length != 1 || !_.includes(this.parameters, operand)) {
        throw new Error(`Invalid operand '${operand}' in conditional statement '${condition}'.`);
      }
    });

    if (_.isEmpty(this.conditions)) {
      this.conditions = { [normalized]: value.replace(/ /g, '') };
    } else {
      this.conditions[normalized] = value.replace(/ /g, '');
    }

    return this;
  }

  expand(arglist) {
    if (arglist.length != this.parameters.length) {
      throw new Error(`Expected argument list of length ${this.parameters.length} but found ${arglist.length}.`);
    }

    let locals = _.reduce(arglist, (memo, arg, index) => {
      let param = this.parameters[index];
      let value = parseFloat(arg);

      if (_.isNaN(value)) {
        throw new Error(`Value of parameter '${param}' is of incorrect type '${typeof arg}'.`);
      }

      memo[param] = arg;
      return memo;
    }, {});

    // Create a new context for expression evaluation.
    let context = new Context(locals);

    if (!this.production && _.isEmpty(this.conditions)) {
      return "";
    }

    let result = this.production;
    if (!_.isEmpty(this.conditions)) {
      for (let cond in this.conditions) {
        if (context.consider(cond)) {
          result = this.conditions[cond];
          break;
        }
      }
    }

    return context.evaluate(result);
  }
}
