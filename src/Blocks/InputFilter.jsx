import React from "react";
import { defineTraits } from "../helpers/functions";
import { selectInputType } from "../constants/traits";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const InputFilter = ({ editor }) => {
  editor.Components.addType("looper-input-filter", {
    extend: "input",

    model: {
      init() {
        this.addTrait(editor.Components.getType("input"));
      },
      defaults: {
        name: "Filter Input",
        traits: defineTraits([
          { ...selectInputType },
          {
            name: "input-filter-name",
            label: "Filter Name",
            placeholder: "Enter Filter Name",
            role: "attribute",
            showCallback: () => Boolean(window.isLoop),
            callback({ editor, oldValue, newValue, model }) {
              if (newValue) {
                model.addAttributes({
                  "v-model": newValue,
                });
              } else {
                model.removeAttributes(["v-model"]);
              }
            },
          },
        ]),
      },
    },
  });
};
