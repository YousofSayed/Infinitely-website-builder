export class WorkerProxy {
  /**
   * @param {string|URL} scriptURL
   * @param {WorkerOptions=} options
   * @param {{ reinitDelay?: number, mergeByCommand?: boolean }=} opts
   */
  constructor(scriptURL, options = {}, opts = {}) {
    this.scriptURL = scriptURL;
    this.options = options;

    // tuning
    this.reinitDelay = typeof opts.reinitDelay === "number" ? opts.reinitDelay : 200; // ms
    this.mergeByCommand = opts.mergeByCommand ?? true;

    // worker(s) bookkeeping
    this.worker = new Worker(scriptURL, options);
    this._activeWorkers = new Set([this.worker]); // includes current + not-yet-terminated old workers
    this.savedListeners = []; // {type, listener, options}

    // keep "last message" per merge key (default key = command)
    this._lastMessageByKey = new Map();

    // protect from overlapping reInits
    this._reinitRunning = false;
  }

  /**
   * postMessage(message, { mergeKey })
   * - by default messages are sent immediately to current worker.
   * - if mergeByCommand=true and message.command exists, we remember the last message per command
   *   so reInit can replay the latest state to the new worker.
   */
  postMessage(message, opts = {}) {
    const { mergeKey = null } = opts;

    // determine merge key
    let key = null;
    if (mergeKey) key = mergeKey;
    else if (this.mergeByCommand && message && typeof message === "object" && message.command)
      key = message.command;

    if (key) {
      // keep only the most recent message for this key
      this._lastMessageByKey.set(key, message);
    }

    // send immediately to current worker for responsiveness
    try {
      this.worker.postMessage(message);
    } catch (e) {
      // if postMessage throws for any reason, still keep the last message for replay
      console.warn("WorkerProxy: postMessage failed:", e);
    }
  }

  addEventListener(type, listener, options) {
    this.savedListeners.push({ type, listener, options });
    // bind listener to all current active workers (current + old ones still alive)
    for (const w of this._activeWorkers) {
      try { w.addEventListener(type, listener, options); } catch (e) {}
    }
  }

  removeEventListener(type, listener, options) {
    const idx = this.savedListeners.findIndex(
      (l) => l.type === type && l.listener === listener && l.options === options
    );
    if (idx !== -1) this.savedListeners.splice(idx, 1);

    // remove from all active workers
    for (const w of this._activeWorkers) {
      try { w.removeEventListener(type, listener, options); } catch (e) {}
    }
  }

  /**
   * Hot-swap reInit:
   * - create new worker and bind listeners
   * - replay latest messages (one-per-command / merge key)
   * - schedule termination of old worker after reinitDelay
   */
  reInit(callback = (proxy) => {}) {
    if (this._reinitRunning) {
      // allow multiple rapid reInit calls: queue them by just returning early
      // the running reInit already replaced the worker.
      try { callback(this); } catch (e) {}
      return;
    }
    this._reinitRunning = true;

    const oldWorker = this.worker;
    const newWorker = new Worker(this.scriptURL, this.options);

    // add new worker to active set BEFORE swapping so listeners removal still covers it
    this._activeWorkers.add(newWorker);

    // bind saved listeners to new worker
    for (const { type, listener, options } of this.savedListeners) {
      try { newWorker.addEventListener(type, listener, options); } catch (e) {}
    }

    // swap current worker reference to the new worker
    this.worker = newWorker;

    // Immediately replay latest messages (one per key) into the new worker.
    // This is the crucial step: we ensure the new worker has the latest full-state update.
    for (const msg of this._lastMessageByKey.values()) {
      try { newWorker.postMessage(msg); } catch (e) {}
    }

    // schedule termination of the old worker after a short delay to allow any in-flight old messages to be processed
    setTimeout(() => {
      try {
        oldWorker.terminate();
      } catch (e) {}
      this._activeWorkers.delete(oldWorker);
    }, this.reinitDelay);

    // done
    this._reinitRunning = false;
    try { callback(this); } catch (e) {}
  }

  terminate() {
    for (const w of Array.from(this._activeWorkers)) {
      try { w.terminate(); } catch (e) {}
      this._activeWorkers.delete(w);
    }
  }
}
