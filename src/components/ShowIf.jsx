import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";

export const ShowIf = ({ children, condition }) => {
  if (condition) return <>{children}</>;
  return null;
};
