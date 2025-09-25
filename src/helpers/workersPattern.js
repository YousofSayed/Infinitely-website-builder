export function doWorkerPattern(commands) {
  self.addEventListener("message", async (ev) => {
    let { command, props } = ev.data;
    if(!commands[command]){
      console.warn(`${command} is not in commands list!`);
      
      return;
    }
    console.log(`Infinitly worker event got it : ${command}`);
    if (!command) return;
    await commands[command](props);
    props = null;
    
  });

  self.addEventListener("error", (ev) => {
    console.error(`From Worker : ${ev.error} , with line : ${ev.lineno}`);
  });
  self.addEventListener("unhandledrejection", (ev) => {
    console.error("Worker unhandled rejection:", ev.reason);
  }); 
}
