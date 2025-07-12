import { stringify } from "../helpers/cocktail";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const handleComponentsOnCreate = (editor) => {
  /**
   * @type {import('grapesjs').Component[]}
   */
  let cmpsWillRemoved = [];

  // editor.on("component:create", (cmp) => {
  //   console.log("from component creator : ", cmp, cmp?.getEl?.());
  //   handler(editor, cmp, "iframe", "media");
  //   handler(editor, cmp, "video", "media");
  //   handler(editor, cmp, "audio", "media");
  // });

  editor.on('component:add',(cmp)=>{
    // const removedCmp = cmpsWillRemoved.find(rCmp => rCmp == cmp);
    // const index = cmpsWillRemoved.findIndex(rCmp => rCmp == cmp)
    // removedCmp && removedCmp.remove()
    // index != -1 && cmpsWillRemoved.splice(index , 0);
    // console.log('componet added...................');
    
handler(editor, cmp, "iframe", "media");
    handler(editor, cmp, "video", "media");
    handler(editor, cmp, "audio", "media");

  });

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
    // console.log('handllllerrrrr');
    
    const parent = component.parent();
    const index = component.index();
    const cmpTagName = component.tagName.toLowerCase();
    const cmpType = component.get("type");

    if (
      cmpTagName == tagName &&
      parent.get("type") != type &&
      cmpType != type

      // component.components().models[0].get("tagName").toLowerCase() == tagName &&
      // component.get("type") != type &&
      // (parent.tagName.toLowerCase() == "section" &&
      // !Boolean(parent.get('type') != type))
    ) {
      // Replace standalone iframe with custom iframe component

      component.removeAttributes("data-gjs-type", { avoidStore: true });
      const cmpAttributes = component.getAttributes();
      const iframeSrc =
        tagName == "iframe" ? { "iframe-src": cmpAttributes.src } : {};
      const videoAndAudioSrc =
        tagName == "video" || tagName == "audio"
          ? { "choose-file": cmpAttributes.src }
          : {};

      const attributes = {
        ...cmpAttributes,
        type: cmpTagName,

        // ...iframeSrc,
        // ...videoAndAudioSrc,
        // "access-media": false,
        // "media-attributes": stringify({ ...cmpAttributes }),
        // class: "w-fit h-fit inline-block",
        //   "data-gjs-type": "iframe",
      };

      // Create new custom iframe component
      const newComponent = {
        type: type,
        attributes,
        components: {
          tagName: cmpTagName,
          attributes: {
            ...cmpAttributes,
            // class: "w-full h-full no-pointer block",
            // style :`width:100%; height:100%; pointer-events:none; display:block;`,
            controls: true,
          },
        },
      };

      // Move new component to the same position
      // parent.append(newComponent, { at: index });
      const newCmp = component.replaceWith(newComponent)[0];

      // cmpsWillRemoved.push(component);
      /**
       *
       * @param {import('grapesjs').Component} cmp
       */
      const remover = (cmp) => {
        if (!cmp.getEl?.()) {
          remover(cmp);
          return;
        }
        cmp.remove;
      };
      // remover(component);
      // editor.re
      // Remove the original iframe
      component.remove();
    }
  }

  
};
