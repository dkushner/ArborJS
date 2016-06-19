import _ from 'lodash';
import THREE from 'three';

export default class Turtle {
  constructor(transformers) {
    this.transformers = transformers;
  }

  consume(tape) {
    _.each(tape, (token) => {
      let transformer = this.transformers[token.symbol];
      if (transformer) {
        transformer.apply(this, token.parameters);
      }
    });

    return this.points;
  }
}

export class Turtle3D extends Turtle {
  constructor() {
    const transformers = {
      ["#"]: (r, g, b) => {
        this.color = new THREE.Color(r, g, b);
      },
      ["["]: () => {
        const { color, look, position } = this;
        this.stack.push({ color, look, position });
      },
      ["]"]: () => {
        const popped = this.stack.pop();
        this.color = popped.color;
        this.look = popped.look;
        this.position = popped.position;
      },
      ["!"]: (d) => {
        const offset = this.look.clone().multiplyScalar(d);
        this.position.add(offset);
        this.points.push({
          position: this.position.clone(),
          look: this.look.clone(),
          color: this.color.clone()
        });
      },
      ["@"]: (x, y, z) => {
        const euler = new THREE.Euler(x, y, z);
        this.look.applyEuler(euler);
      }
    };

    super(transformers);
    this.reset();
  }

  reset() {
    this.color = new THREE.Color(0xffffff);
    this.look = new THREE.Vector3(0, 0, 1);
    this.position = new THREE.Vector3();
    this.points = [{
      position: this.position.clone(),
      look: this.look.clone(),
      color: this.color.clone()
    }];
    this.stack = [];
  }
}
