window["vCatch"] = new WeakMap();

const vCatch = (ctx) => {
  const el = ctx.el;

  // v-catch="true"
  let enabled = true;

  if (ctx.exp) {
    try {
      enabled = Boolean(ctx.get());
    } catch (error) {
      enabled = false;
    }
  }

  if (!enabled) {
    return;
  }

  const handler = (event) => {
    let error = event.error;

    if (!error) {
      error = new Error(
        event.message || "Unknown JavaScript error"
      );
    }

    const info = {
      error,

      // The element containing v-catch
      catchEl: el,

      // Original error event
      event,

      // Error information
      name: error.name,
      message: error.message,
      stack: error.stack || "",

      // Source location if available
      line: null,
      column: null,
      source: null,

      // Try to get the actual element that generated the event
      target: event.target,

      // HTML of the catch element
      html: el.outerHTML,
    };

    if (error.stack) {
      const match = error.stack.match(
        /(?:https?:\/\/|file:\/\/|\/)[^\s)]+:(\d+):(\d+)/
      );

      if (match) {
        info.line = Number(match[1]);
        info.column = Number(match[2]);
        info.source = match[0];
      }
    }

    console.error(
      "[v-catch]",
      info
    );

    // Dispatch a custom event so you can handle it
    // with Petite Vue itself:
    //
    // @catch="..."
    //
    // or from normal JS.
    el.dispatchEvent(
      new CustomEvent("catch", {
        bubbles: false,
        detail: info,
      })
    );
  };

  /*
   * Capture errors from anything inside this element.
   */
  el.addEventListener(
    "error",
    handler,
    true
  );

  /*
   * Store state.
   */
  window["vCatch"].set(el, {
    handler,
  });

  console.log(
    "v-catch activated:",
    el
  );

  return () => {
    const state = window["vCatch"].get(el);

    if (state) {
      el.removeEventListener(
        "error",
        state.handler,
        true
      );

      window["vCatch"].delete(el);
    }

    console.log(
      "v-catch destroyed:",
      el
    );
  };
};