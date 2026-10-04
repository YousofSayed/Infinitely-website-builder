import { useEffect, useRef } from "react";
import { Decode, Hook, Unhook } from "console-feed";
import { consoleLogs, consoleLogsNotification } from "@/helpers/atoms";
import { useRecoilState } from "recoil";

export const useConsoleFeed = (target, source, onLog) => {
  const onLogRef = useRef(onLog);
  const [logs, setLogs] = useRecoilState(consoleLogs);
  const [logsNotification, setLogsNotification] = useRecoilState(
    consoleLogsNotification,
  );
  // useEffect(() => {
  //   onLogRef.current = onLog;
  // }, [onLog]);

  useEffect(() => {
    const callback = (event) => {
      // Always validate origin in production
      if (event.data?.type === "CONSOLE_LOG") {
        // The payload from esm.sh is ready to be rendered immediately
        const decoded = Decode(event.data.payload);
        setLogs((prev) => [
          ...prev,
          {
            ...decoded,
            source: event.data?.from,
            timestamp: Date.now(),
            id: decoded.id || crypto.randomUUID(),
          },
        ]);

        setLogsNotification(true);
      }
    };

    window.addEventListener("message", callback);

    return () => {
      window.removeEventListener("message", callback);
      
    };
  }, []);

  useEffect(() => {
    // const win = target?.current?.contentWindow || target?.current || target;
    // if (!win || !win.console) return;

    const win = target;

    if (!win?.console) {
      // alert('no console');
      return
    };

    // alert('yes console');

    let isHooked = false;

    const hookedConsole = Hook(
      win.console,
      (log) => {
        // log is already serialized by Hook(..., true)
        const decoded = Decode(log);

        setLogsNotification(true);

        return setLogs((logs) => [
          ...logs,
          {
            ...decoded,
            id: log.id || crypto.randomUUID(),
            source: source,
            timestamp: Date.now(),
          },
        ]);
      },
      true,
      10000,
    );

    return () => Unhook(hookedConsole);
  }, [target, source]);
};
