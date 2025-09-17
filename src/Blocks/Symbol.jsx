import { inf_symbol_Id_attribute } from "../constants/shared";
import { getInfinitelySymbolInfo } from "../helpers/functions";

/**
 * @param {import('grapesjs').Editor} editor
 */
export const Symbol = (editor) => {
  // Listen for ANY component added to the canvas
//   editor.on("component:add", (component) => {
//     const symbolInfo = getInfinitelySymbolInfo(component);
//     if(symbolInfo.isChild)return;
//     const attrs = component.getAttributes();

//     // Check if it has the symbol attribute
//     if (attrs?.[inf_symbol_Id_attribute]) {
//       enhanceSymbolComponent(component);
//     }
//   });
};

/**
 * Enhance component with Symbol behavior
 * @param {import('grapesjs').Component} component
 */
function enhanceSymbolComponent(component) {
  if (component.__symbolEnhanced) return; // Prevent duplicate binding
  component.__symbolEnhanced = true;

  console.log("✨ Symbol detected:", component.get("type"));

  // Listen to ANY changes in this component
  component.on("change:content", (model, options) => {
    console.log("🔄 Symbol components updated:", model.getAttributes(), options);
  });

   component.on("change:attributes", (model, options) => {
    console.log("🔄 Symbol components updated:", model.getAttributes(), options);
  });

  // Listen when children are added/removed
//   component.listenTo(component.components(), "add remove", (child) => {
//     console.log("🧩 Symbol child changed:", child);
//   });

  // Optionally mark it visually or internally
  component.addAttributes({ "data-symbol-enhanced": "true" });
}
