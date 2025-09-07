import { isFunction } from "lodash";
import { parse } from "../helpers/cocktail";
import { getMediaBreakpoint } from "../helpers/functions";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const initTraitsOnRender = (editor) => {
  editor.on(
    "component:create",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      const traits = model.getTraits();
      const attrs = model.getAttributes();
      for (const trait of traits) {
        // const parsedVal = parse(trait.attributes.value);
        // const finalValue = parsedVal ? parsedVal : trait.attributes.value;
        // trait.attributes.value = finalValue;
        if (
          attrs[trait.attributes.name] &&
          trait.attributes.role == "attribute"
        ) {
          trait.set("value", attrs[trait.attributes.name]);
          trait.attributes.value = attrs[trait.attributes.name];
          // console.log(
          //   "attr name : ",
          //   attrs[trait.attributes.name],
          //   trait.attributes.name
          // );
        }

        if (trait.attributes.role == "hadnler") {
          trait.set("value", attrs[trait.attributes.name]);
          model.removeAttributes([trait.attributes.name], { avoidStore: true });
        }

        !attrs[trait.attributes.name] &&
          model.removeAttributes([trait.attributes.name], { avoidStore: true });


        //Handling init callback
        trait.attributes?.init &&
          isFunction(trait.attributes?.init) &&
          trait.attributes?.init({
            editor,
            trait: trait.attributes,
            model,
            mediaBreakPoint:getMediaBreakpoint(editor)
          });
      }
      console.log("autoplay traits : ", traits);
    }
  );
};
