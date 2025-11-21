import { parse } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const FilterButton = ({ editor }) => { 
  editor.Components.addType("filter-button", {
    extend: "button",
    model: {
      defaults: {
        name: "Filter Button",
        traits: defineTraits([
          {
            name: "filter-name",
            role: "attribute",
            label: "Filter name",
            placeholder: "Enter Filter Name",
            showCallback: () => Boolean(window.isLoop),
            callback({ model, oldValue, newValue }) {
              const filterValue =
                model.getTrait("filter-value")?.attributes?.value || "";
              const eventTarget = "v-on:click";
              const oldAttr = model.getAttributes()[eventTarget];
              oldAttr &&
                model.addAttributes({
                  [eventTarget]: `${oldAttr.replaceAll(
                    `${oldValue}=${filterValue}`,
                    ""
                  )} ${newValue}=${filterValue}`,
                });

              !oldAttr &&
                model.addAttributes({
                  [eventTarget]: `${newValue}=${filterValue}`,
                });
            },
          },

          {
            name: "filter-value",
            role: "attribute",
            label: "Filter value",
            placeholder: "Enter Filter Value",
            showCallback: () => Boolean(window.isLoop),
            callback({ model, oldValue, newValue }) {
              const filterValue = newValue;
              const filterName = model.getTrait("filter-name")?.attributes?.value || "";
              if(!filterName)return;

              const eventTarget = "v-on:click";
              const oldAttr = model.getAttributes()[eventTarget];
              oldAttr &&
                model.addAttributes({
                  [eventTarget]: `${oldAttr.replaceAll(
                    `${filterName}=${oldValue == '_' ? `null` : parse(oldValue)||`\`${oldValue}\``}`,
                    ""
                  )} ${filterName}=${filterValue == '_' ? `null` :parse(filterValue)||`\`${filterValue}\``}`,
                });

              !oldAttr &&
                model.addAttributes({
                  [eventTarget]: `${filterName}=${filterValue}`,
                });
            },
          },
        ]),
      },
    },
  });
};
