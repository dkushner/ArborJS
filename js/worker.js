import {Grammar} from './grammar';

let constants = [
  '#(r, g, b)',
  '@(x, y, z)',
  '!(d, t)',
  '[', ']'
];

let grammar = new Grammar(constants);
grammar.addRule('E(c)', '#(c/10, 0.0, c/20)!(20, 5)');
grammar.addRule('F(c)', 'F(c)E(c)');
grammar.addRule('R', '@(25, -45, 0)');
grammar.addRule('L', '@(-25, 45, 0)');
grammar.addRule('X(a)', 'F(a)L[[X(a-1)]RX(a-1)]RF(a)[RF(a)X(a-1)]LX(a-1)');

export function run() {
  onmessage = receive;
  postMessage(1);
}

function receive(event) {
  let data = event.data;
  switch (data.type) {
    case 'run': {
      grammar.scan(data.axiom, data.limit, (tok) => {
        postMessage(tok);
      });
    } break;
    default: break;
  }
}

