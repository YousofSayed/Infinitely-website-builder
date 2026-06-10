export function doWorkerPattern(commands) {
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
      console.log('res from worker : ' , res);
      
      self.postMessage({
        _send_worker_id:ev.data?._send_worker_id || undefined, 
        command,
        props: {
          done: true,
          res,
        },
      });
      props = null;
    } catch (error) {
      self.postMessage({
        _send_worker_id:ev.data?._send_worker_id || undefined, 
        command,
        props: {
          done: false,
          res: null,
        },
      });

      throw new Error(error);
    }
  });

  self.addEventListener("error", (ev) => {
    console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
  });
  self.addEventListener("unhandledrejection", (ev) => {
    console.error("Worker unhandled rejection:", ev.reason);
  });
}
