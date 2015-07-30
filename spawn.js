importScripts('jspm_packages/system.js',
              'config.js');

System.baseURL = './';
System.import('arborjs/worker').catch(function(err) {
  console.error('Error during worker import: ', err);
}).then(function(w) {
  return w.run();
}).catch(function(err) {
  console.error('Error while bootstrapping worker: ', err);
});
