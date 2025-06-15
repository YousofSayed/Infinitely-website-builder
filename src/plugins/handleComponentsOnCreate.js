/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const handleComponentsOnCreate = (editor) => {
  editor.on("component:create", (cmp) => {
    console.log("from component creator : ", cmp, cmp?.getEl?.());
    handler(editor, cmp, "iframe", "iframe");
  });
};

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @param {import('grapesjs').Component} component
 * @param {string} tagName
 * @param {string} type
 * @returns
 */
function handler(editor, component, tagName = "", type = "") {
  if (!component || !type) {
    console.warn("No el type founded");
    return;
  }
  const parent = component.parent();
  const index = component.index();
  if (

    component.tagName.toLowerCase() == tagName &&
    parent.get('type') != type &&
    component.get('type') != type 

    // component.components().models[0].get("tagName").toLowerCase() == tagName &&
    // component.get("type") != type &&
    // (parent.tagName.toLowerCase() == "section" &&
    // !Boolean(parent.get('type') != type))
  ) {
    // Replace standalone iframe with custom iframe component
component.removeAttributes('data-gjs-type' , {avoidStore:true,})
    const attributes = {
      ...component.getAttributes(),
      class: "w-fit h-fit inline-block",
      //   "data-gjs-type": "iframe",
    };


    // Create new custom iframe component
    const newComponent = {
      type: "video",
      attributes,
    };

    // Move new component to the same position
    // parent.append(newComponent, { at: index });
    component.replaceWith(newComponent);
    // Remove the original iframe
    component.remove();
  }
}
