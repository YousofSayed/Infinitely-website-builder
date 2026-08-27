import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";

export const ShowIf = ({ condition, children }) => {
  if (!condition) return null;

  return typeof children === "function"
    ? children()
    : children;
};
// export const ShowIf = ({ children, condition }) => {
//   try {
//   return <>{Boolean(condition) && children}</>;
//   } catch (error) {
//     console.error(error.message);
//     return null;
//   }
// };
