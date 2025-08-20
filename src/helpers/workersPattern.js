export function doWorkerPattern(commands) {
  self.addEventListener("message", async (ev) => {
    const { command, props } = ev.data;
    console.log(`Infinitly worker event got it : ${command}`);
    if (!command) return;
    commands[command](props);
  });

  self.addEventListener("error", (ev) => {
    console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
  });
  self.addEventListener("unhandledrejection", (ev) => {
    console.error("Worker unhandled rejection:", ev.reason);
  }); 
}
