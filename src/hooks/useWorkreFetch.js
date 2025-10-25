import React, { useEffect } from "react";

/**
 *
 * @param {Worker} worker
 */
export const useWorkreFetch = (worker) => {
  useEffect(() => {
    const callback = async (ev) => {
      if (ev.data.command === "fetchFromMain") {
        const res = await await fetch(
          ev.data.props.input,
          ev.data.props.init || {}
        );
        worker.postMessage({
          command: "fetchFromMain",
          props: {
            response: ev.data.props.type
              ? await res[ev.data.props.type]()
              : undefined,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            type: res.type,
            redirected: res.redirected,
            url: res.url,
          },
        });
      }
    };

    worker.addEventListener("message", callback);

    return () => {
      worker.removeEventListener("message", callback);
    };
  });
};

