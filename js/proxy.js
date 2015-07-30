export class Proxy {
  constructor(script) {
    this.script = script;
    this.worker = null;
  }

  run() {
    if (!this.script) {
      this.worker = self;
      return Promise.resolve(self);
    }

    if (!this.worker) {
      return new Promise(function(resolve, reject) {
        let forked = new Worker(this.script);
        forked.addEventListener('message', function(event) {
          forked.removeEventListener('message', this);
          resolve(forked);
        }, false);
      }.bind(this)).then(function(forked) {
        this.worker = forked;
        return forked;
      }.bind(this));
    } else {
      return Promise.resolve(this.worker);
    }
  }

  send(data, shared) {
    return this.run().then(function(worker) {
      worker.postMessage(data, shared);
    });
  }
}
