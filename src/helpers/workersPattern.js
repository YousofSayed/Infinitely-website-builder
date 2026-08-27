export function doWorkerPattern(commands) {
  // Put this at the VERY TOP of your Worker file
  const originalFetch = self.fetch;

  self.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (!response.ok) {
      // ⚠️ CRITICAL: We must allow 400 to pass through.
      // Your `wp_per_page_get_looper` function uses 400 status codes
      // to detect the end of pagination. If we throw here, pagination breaks.
      if (response.status !== 400) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

        // Try to extract the WP error message
        try {
          const errorData = await response.clone().json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch (e) {
          // Response wasn't JSON (e.g., standard server 401 HTML page)
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error; // This immediately breaks wp_get_option and bubbles to your worker catch block
      }
    }

    return response;
  };

  // ... continue with your imports and doWorkerPattern(wpCommands)

  self.addEventListener("message", async (ev) => {
    let { command, props } = ev.data;
    if (!commands[command]) {
      console.warn(`${command} is not in commands list!`);

      return;
    }
    if (!command) return;
    console.log(`Infinitly worker event got it : ${command}`);
    try {
      const res = await commands[command](props);
      console.log("res from worker : ", command, res);

      self.postMessage({
        _send_worker_id: ev.data?._send_worker_id || undefined,
        command,
        props: {
          done: true,
          res,
        },
      });
      props = null;
    } catch (error) {
      self.postMessage({
        _send_worker_id: ev.data?._send_worker_id || undefined,
        command,
        props: {
          done: false,
          error: {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
          },
        },
      });

      // throw new Error(error);
    }
  });

  self.addEventListener("error", (ev) => {
    console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
  });
  // self.addEventListener("unhandledrejection", (ev) => {
  //   console.error("Worker unhandled rejection:", ev.reason);
  // });
}
