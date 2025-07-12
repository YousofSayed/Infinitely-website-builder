import { Icons } from "../components/Icons/Icons";
import { parseToHTML } from "../helpers/cocktail";
import { defineTraits, preventSelectNavigation } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

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
  const icon = parseSvg(
    reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "white" }))
  );
  // editor.Components.removeType("svg");

  editor.Components.addType("svg", {
    // extend:'svg',
    // extendView: true,

    isComponent: (el) => el.tagName && el.tagName.toLowerCase() == "svg",
    view: {
      onRender({ el, model }) {
        el.querySelectorAll(`*`).forEach(el=>{
          el.style.pointerEvents = 'none';
        })
        model.set({
          draggable:true,
          droppable:false,
          
        })
      },
    },
    model: {
      defaults: {
       
        icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
        tagName: "svg",
        // // content:reactToStringMarkup(Icons.svg({ fill: "white" })),
        // attributes: {
        //   xmlns: "http://www.w3.org/2000/svg",
        //   //   ...Object.fromEntries(
        //   //     icon
        //   //       .getAttributeNames()
        //   //       .map((attr) => [attr, icon.getAttribute(attr)])
        //   //   ),
        //   width: 40,
        //   height: 40,
        // },

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
              const type = sle?.props().type;
              if (!sle || !asset || type !== "svg") return;

              // Read the SVG file content
              const textCmp = await asset.text();

              // // Parse SVG content with correct namespace
              // const parser = new DOMParser();
              // const svgDoc = parser.parseFromString(textCmp, "image/svg+xml");
              // const svg = svgDoc.querySelector("svg");

              // if (!svg) {
              //   console.error("No valid SVG found in the file.");
              //   return;
              // }

              // // Ensure SVG has the correct namespace
              // svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

              // Replace the selected component with the new SVG
              const newCmp = sle.replaceWith(textCmp)[0];
              newCmp.set({ resizable: true });
              preventSelectNavigation(editor, newCmp);
              // sle.set(
              //   {
              //     content: svg.innerHTML,
              //   },
              //   undefined,
              //   { avoidStore: true }
              // );

              //   console.log("New component:", newCmp, textCmp);
              // sle.removeAttributes(["data-gjs-content"]);
              //   preventSelectNavigation(editor, newCmp);
            },
          },
        ]),
      },
    },
  });
};
