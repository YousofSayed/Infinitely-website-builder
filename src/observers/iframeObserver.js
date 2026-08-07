// FIXME: unresolved import - handleIframeDragEls is not defined anywhere in this codebase snapshot - needs manual attention
import { handleIframeDragEls } from "@/helpers/iframeFunctions";

/**
 * 
 * @param {HTMLBodyElement} body 
 * @returns 
 */
export const iframeObsever = (body) => {
  return new MutationObserver((entries) => {
    entries.forEach((entry) => {
      handleIframeDragEls(entry , body);
    });
    console.log(entries);
  });
};
