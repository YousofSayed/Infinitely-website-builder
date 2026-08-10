import { isNormal } from "@/helpers/functions";
import React, { useEffect } from "react";

export const useNormal = (callback, ...debs) => {
  return useEffect(
    () => {
      if (isNormal()) {
        callback();
      }
    },
    ...debs,
  );
};
