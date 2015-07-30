import _ from 'lodash';
import THREE from 'THREE';
import {Grammar, Rule} from './grammar';
import OrbitControls from 'OrbitControls';
import $ from 'jquery';
import {Turtle} from './turtle';
import {Proxy} from './proxy';
import * as ts from 'threestrap';

let proxy = new Proxy('spawn.js');

const MAX_POINTS = 20000;

export function run() {
  console.info('Starting the simulation...');

  // Bootstrap the THREE.js scene.
  let three = THREE.Bootstrap({
    plugins: ['core', 'stats', 'controls', 'fullscreen'],
    controls: {
      klass: THREE.OrbitControls
    },
    camera: {
      near: 0.1,
      far: 1e20
    },
    fullscreen: {
      key: 'f'
    }
  });
  three.camera.position.set(500, 500, 500);
  three.camera.lookAt(new THREE.Vector3());
  
  // Create a new cursor object that will behave like our turtle.
  let cursor = new THREE.Object3D();
  three.scene.add(cursor);

  let points = 0;
  let geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(MAX_POINTS * 3);
  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addDrawCall(0, 0, 0);

  let colors = new Float32Array(MAX_POINTS * 3);
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.addDrawCall(0, 0, 0);

  let material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    linewidth: 2
  });

  let line = new THREE.Line(geometry, material, THREE.LinePieces);
  three.scene.add(line);

  let helper = new THREE.AxisHelper(50);
  three.scene.add(helper);

  let turtle = new Turtle({ 
    position: cursor.position.clone(),
    rotation: cursor.rotation.clone()
  });

  turtle.addCommand('#', function(r, g, b) {
    this.put('color', new THREE.Color(r, g, b));
  });

  turtle.addCommand('@', function(x, y, z) {
    cursor.rotateX(x);
    cursor.rotateY(y);
    cursor.rotateZ(z);
    this.put('rotation', cursor.rotation.clone());
  });

  turtle.addCommand('!', function(d, t) {
    let color = this.get('color');

    let posArr = geometry.attributes.position.array;
    posArr[points * 3] = this.get('position').x;
    posArr[(points * 3) + 1] = this.get('position').y;
    posArr[(points * 3) + 2] = this.get('position').z;

    let colArr = geometry.attributes.color.array;
    colArr[points * 3] = this.get('color').r;
    colArr[(points * 3)] = this.get('color').g;
    colArr[(points * 3)] = this.get('color').b;
    points++;

    cursor.translateZ(d);
    this.put('position', cursor.position.clone());

    posArr[points * 3] = this.get('position').x;
    posArr[(points * 3) + 1] = this.get('position').y;
    posArr[(points * 3) + 2] = this.get('position').z;

    colArr[points * 3] = this.get('color').r;
    colArr[(points * 3)] = this.get('color').g;
    colArr[(points * 3)] = this.get('color').b;
    points++;
    console.log(points);

    geometry.drawcalls[0].count = points;
    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.attributes.color.needsUpdate = true;
  });

  turtle.addCommand('[', function() {
    this.push();
  });

  turtle.addCommand(']', function() {
    this.pop();
    cursor.position.copy(this.get('position'));
    cursor.rotation.copy(this.get('rotation'));
  });

  proxy.run().then(function(w) {
    w.onmessage = (evt) => {
      if (points < MAX_POINTS) {
        turtle.consume(evt.data);
      }
    };

    w.postMessage({
      type: 'run',
      axiom: 'X(10)',
      limit: 10
    });
  });

  three.on('update', function() {
    let t = three.Time.now;
  });
}
