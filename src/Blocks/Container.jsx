import { editorIcons } from "../components/Icons/editorIcons";
import { tagNames } from "../constants/hsValues";
import { selectTagName } from "../constants/traits";
import { defineTraits } from "../helpers/functions";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Container = ({ editor }) => {
  editor.Components.addType("container", {
    view: {
      // onRender({ model }) {
      //   model.set({
      //     droppable: true,
      //     draggable: true,
      //   });
      // },
    },
    model: {
      defaults: {
        resizable: true,
        draggable: true,
        droppable: true,
        icon: editorIcons.container({ width: 20, height: 20, fill: "white" }),
        tagName: "section",
        attributes: {
          class: "inf-container p-10 drop",
        },
        // components: [{ type: "drop-area" }],
        traits: defineTraits([selectTagName]),
        // components:html`Insert Dynamic Text`
      },
    },
  });
};
