import { Hook, Decode } from "https://esm.sh/console-feed@latest";

const sendToParent = (log) => {
  // const decoded = Decode(log);
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "CONSOLE_LOG",
        from:'editor',
        payload: {
          ...log,
        },
      },
      "*",
    );
  }
};

// Hook all future logs
Hook(window.console, (log) => sendToParent(log));

// Replay any logs that happened before this module loaded
if (window.__earlyLogs && window.__earlyLogs.length > 0) {
  window.__earlyLogs.forEach((entry) => {
    // Re-triggering them passes them through the new Hook
    console[entry.method].apply(console, entry.args);
  });
  window.__earlyLogs = []; // Clear buffer
}
