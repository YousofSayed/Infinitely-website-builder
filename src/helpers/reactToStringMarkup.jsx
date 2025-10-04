import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

export const reactToStringMarkup = (component) => {
  const el = document.createElement("div");
  const root = createRoot(el);
  
  flushSync(() => {
    root.render(component);
  });
  
  const stringMarkup = el.innerHTML;
  root.unmount(); // cleanup React fibers & event listeners

  return stringMarkup;
};
