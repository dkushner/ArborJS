System.config({
  "baseURL": "./",
  "defaultJSExtensions": true,
  "transpiler": "traceur",
  "paths": {
    "arborjs/*": "js/*.js",
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  }
});

System.config({
  "meta": {
    "github:mrdoob/three.js@master/build/three": {
      "format": "global",
      "exports": "THREE"
    }
  }
});

System.config({
  "map": {
    "OrbitControls": "github:mrdoob/three.js@master/examples/js/controls/OrbitControls.js",
    "THREE": "github:mrdoob/three.js@master/build/three",
    "jcubic/jquery.terminal": "github:jcubic/jquery.terminal@0.8.8",
    "jquery": "github:components/jquery@2.1.4",
    "lodash": "npm:lodash@3.10.0",
    "terminal": "github:jcubic/jquery.terminal@0.8.8/js/jquery.terminal-0.8.8",
    "three": "github:mrdoob/three.js@master",
    "threestrap": "github:unconed/threestrap@0.0.9",
    "traceur": "github:jmcriffey/bower-traceur@0.0.90",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.90",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:unconed/threestrap@0.0.9": {
      "three": "github:mrdoob/three.js@master"
    },
    "npm:lodash@3.10.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

