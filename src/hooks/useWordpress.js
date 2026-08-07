import { isWordpress } from "@/helpers/functions";
import React, { useEffect } from "react";

export const useWordpress = (callback, ...debs) => {
  return useEffect(
    () => {
      if (isWordpress()) {
        callback();
      }
    },
    ...debs,
  );
};
