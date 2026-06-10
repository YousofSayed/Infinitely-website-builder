import { isFunction } from "lodash";
import React, { useEffect } from "react";

export const useOnline = (
  { defaultCallback = () => {}, online = () => {}, offline = () => {} },
  ...debs
) => {
  const onlineCallback = async () => {
    if (!(online && isFunction(online))) {
      throw new Error(`Online callback is empty`);
    }

    await online();
  };

  const offlineCallback = async () => {
    if (!(offline && isFunction(offline))) {
      throw new Error(`Online callback is empty`);
    }

    await offline();
  };

  useEffect(() => {
    isFunction(defaultCallback) && defaultCallback();
    window.addEventListener("online", onlineCallback);
    window.addEventListener("offline", offlineCallback);
    return () => {
      window.removeEventListener("online", onlineCallback);
      window.removeEventListener("offline", offlineCallback);
    };
  }, ...debs);
};
