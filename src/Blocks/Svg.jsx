import { toJSON } from "linkedom";
import { Icons } from "../components/Icons/Icons";
import { parseToHTML } from "../helpers/cocktail";
import {
  defineTraits,
  doActionAndPreventSaving,
  preventSelectNavigation,
} from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {string | HTMLElement} source
 * @param {DOMParserSupportedType} parseType
 */
function elToJSON(source, parseType) {
  const el =
    typeof source != "string"
      ? source
      : new DOMParser().parseFromString(source, parseType).body.children[0];
  console.log("from innre : ", source, el);

  const attributes = el.attributes
    ? Object.fromEntries(
        [...el.getAttributeNames()].map((attr) => [attr, el.getAttribute(attr)])
      )
    : {};
  const tagName = el.tagName.toLowerCase();
  const childs = [...el.children].map((child) => elToJSON(child, parseType));
  /**
   *
   * @param {HTMLElement} el
   * @param {keyof HTMLElementTagNameMap} tagName
   */
  const getParent = (el, tagName) => {
    const parent = el.parentElement;
    if (parent.tagName.toLowerCase() == "body") return null;
    if (
      parent &&
      parent.tagName &&
      parent.tagName.toLowerCase() == tagName.toLowerCase()
    ) {
      return parent;
    } else if (
      parent &&
      parent.tagName &&
      parent.tagName.toLowerCase() != tagName.toLowerCase()
    ) {
      return getParent(parent, tagName);
    } else {
      return null;
    }
  };
  const aboveParent = getParent(el, "svg");

  return {
    tagName,
    attributes,
    type: tagName == "svg" ? "svg" : aboveParent ? "svg-in" : "",
    components: childs,
  };
}

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const Svg = (editor) => {
  const parseSvg = (text = "") => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, "image/svg+xml");
    const svg = svgDoc.querySelector("svg");
    return svg;
  };
  // editor.getSelected().props().droppable
  // const icon = parseSvg(
  //   reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "black" }))
  // );
  // editor.Components.removeType("svg");
  // console.log(
  //   "JSON ",
  //   editor.Parser.parserHtml.parse(
  //     reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "black" })),
  //     undefined,
  //     { htmlType: "image/svg+xml" }
  //   )
  // );

  editor.Components.addType("inf-svg", {
    // extend:'svg',
    // extendView: true,

    isComponent: (el) => {
      if (!el.tagName) {
        // console.warn(`SVG Element Not Founded...!`);
        return;
      }
      // console.log(el);

      if (
        el.tagName.toLowerCase() == "infinitely-svg"
        // &&
        // el.parentElement.tagName.toLowerCase() != "infinitely-svg"
      ) {
        // console.log("JSON ", elToJSON(el.outerHTML,'text/html'));

        return {
          // type: "inf-svg",
          // tagName: "infinitely-svg",
          // Avoid setting components as outerHTML to prevent re-parsing
          components: elToJSON(el.outerHTML, "text/html"),
        };
      }
    },

    view: {
      onRender({ model }) {
        doActionAndPreventSaving(editor, () => {
          model.set({
            // draggable: false,
            droppable: false,
            resizable: true,
          });

          const child = model.components().models[0];
          if (!child) {
            console.warn(`No child in svg component`);
            return;
          }
        });

        // child.addClass("no-pointer");
        // model.setAttributes(
        //   { ...(child.getAttributes() || {} ),type: "svg-wrapper", },
        //   { avoidStore: true }
        // );
        // model.removeClass("no-pointer");
      },
    },
    model: {
      icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
      defaults: {
        name: "svg",
        icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
        tagName: "infinitely-svg",
        // // content:reactToStringMarkup(Icons.svg({ fill: "white" })),
        attributes: {
          // xmlns: "http://www.w3.org/2000/svg",
          //   ...Object.fromEntries(
          //     icon
          //       .getAttributeNames()
          //       .map((attr) => [attr, icon.getAttribute(attr)])
          //   ),
          // type: "svg-wrapper",
          // width: 40,
          // height: 40,
        },

        components: reactToStringMarkup(
          Icons.svg({ width: 40, height: 50, fill: "black" })
        ),

        traits: defineTraits([
          {
            name: "choose-svg",
            label: "Choose svg",
            placeholder: "Enter svg content",
            role: "handler",
            type: "media",
            mediaType: "svg",
            async callback({ editor, newValue, asset }) {
              const sle = editor.getSelected();
              // const type = sle?.props().type;
              if (!sle || !asset) return;

              // Read the SVG file content
              const textCmp = await asset.text();
              // const children = sle.components().models;
              sle.components(textCmp);
              // const newCmp = sle.replaceWith(textCmp)[0];
              // newCmp.set({ resizable: true });
              // preventSelectNavigation(editor, newCmp);
            },
          },
        ]),
      },
      // init() {
      //   // Listen for child component removal
      //   // this.listenTo(this.get("components"), "remove", this.onChildRemove);
      //   this.on("change:attributes", this.handleAttrChange);
      // },
      // handleAttrChange(model, attributes) {
      //   const child = this.components().models[0];
      //   const childEl = child.getEl();
      //   if (!child && !childEl) return;

      //   const newAttrs = { ...this.getAttributes(), ...attributes };
      //   delete newAttrs.id; // Avoid overwriting ID
      //   Object.entries(newAttrs).forEach(([key, value]) => {
      //     childEl.setAttribute(key, value);
      //   });
      // },
      // toHTML() {
      //   const child = this.components().models[0];
      //   const clone = child.getEl().cloneNode(true) ;
      //   clone.removeAttribute(`data-gjs-type`);
      //   console.log('From exporter : '  , clone , clone.outerHTML);

      //   return clone.outerHTML
      //   // child.toHTML({
      //   //   withProps: true,
      //   //   keepInlineStyle: true,
      //   //   attributes: this.getAttributes(),

      //   // });
      // },
    },
  });
};
