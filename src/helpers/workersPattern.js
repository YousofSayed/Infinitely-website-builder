export function doWorkerPattern(commands) {
  self.addEventListener("message", async (ev) => {
    const { command, props } = ev.data;
    if(!commands[command]){
      console.warn(`${command} is not in commands list!`);
      
      return;
    }
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
