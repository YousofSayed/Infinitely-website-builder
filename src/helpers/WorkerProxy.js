
export class WorkerProxy {
  /**
   *
   * @param {string | URL} scriptURL
   * @param {WorkerOptions | undefined} options
   */
  constructor(scriptURL, options = {}) {
    this.scriptURL = scriptURL;
    this.options = options;
    this.worker = new Worker(scriptURL, options);
    this.savedListeners = [];
  }

  postMessage(...args) {
    this.worker.postMessage(...args);
  }

  terminate() {
    this.worker.terminate();
  }

  addEventListener(type, listener, options) {
    this.savedListeners.push({ type, listener, options });
    this.worker.addEventListener(type, listener, options);
  }

  removeEventListener(type, listener, options) {
    const i = this.savedListeners.findIndex(
      (l) => l.type === type && l.listener === listener && l.options === options
    );
    if (i !== -1) this.savedListeners.splice(i, 1);
    this.worker.removeEventListener(type, listener, options);
  }

  // re-init worker & rebind listeners
  reInit(callback = (workerProxy) => {}) {
    this.worker.terminate();
    this.worker = new Worker(this.scriptURL, this.options);

    this.savedListeners.forEach(({ type, listener, options }) => {
      this.worker.addEventListener(type, listener, options);
    });

    console.log('saved listeners : ' , this.savedListeners);
    

    callback(this);
  }
}
