import { Icons } from "../components/Icons/Icons";
import { html } from "../helpers/bridge";
import { defineTraits, doActionAndPreventSaving, getProjectSettings } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const SplineScene = ({ editor }) => {
  editor.Components.addType("spline-viewer", {
    isComponent: (el) => {
      if (
        el.tagName === "SPLINE-VIEWER" &&
        el.parentElement?.tagName.toLowerCase() !== "spline-wrapper"
        //  &&
        // el.parentElement.getAttribute("type") != "spline-wrapper"
      ) {
        console.log(el, el.parentElement, el.tagName, el.parentElement.tagName);
        // return {
        //   type:'spline-viewer'
        // }
        // return {
        //   type: "spline-viewer",
        //   // tagName: `spline-wrapper`,

        //   // attributes: el.attributes
        //   //   ? Object.fromEntries(
        //   //       [...el.attributes , {name:'class' , value:'m-h-60'}].map((attr) => [attr.name, attr.value])
        //   //     )
        //   //   : {class:'m-h-60'},
        // };
        return {
          type: "spline-viewer",
          tagName: "spline-wrapper",
          // Avoid setting components as outerHTML to prevent re-parsing
          components: [
            {
              // type: "spline-viewer-inner", // Define a separate type for the inner element
              tagName: "spline-viewer",
              attributes: el.attributes
                ? Object.fromEntries(
                    [...el.attributes].map((attr) => [attr.name, attr.value])
                  )
                : {},
            },
          ],
        };
      } else if (el.tagName === "SPLINE-WRAPPER") {
        return true;
      }
    },
    view: {
      onRender({ model }) {
        // model.set(
        //   {
        //     // draggable: false,
        //     droppable: false,
        //     // selectable: false,
        //     // resizable:true
        //   },
        //   {
        //     avoidStore: true, skipWatcherUpdates: true, avoidTransform: true
        //   }
        //   // undefined,
        //   // {
        //   //   avoidStore: true,
        //   //   skipWatcherUpdates: true,
        //   //   avoidTransformers: true,
        //   // }
        // );

        const child = model.components().models[0];
        if (!child) {
          console.warn(`No child in spline viewer component`);
          return;
        }

        const attrs = { ...(child.getAttributes() || {}) }
        delete attrs['droppable'];
        delete attrs['draggable'];
        doActionAndPreventSaving(editor, (ed) => {
          child.addClass("no-pointer");
          model.setAttributes(
            attrs,
            {
              avoidStore: true,
              // skipWatcherUpdates: true,
              // avoidTransformers: true,
              // noEvent: true,
            }
          );
          model.removeClass("no-pointer");
        });

        editor.clearDirtyCount();

        const {projectSettings} = getProjectSettings();
        !projectSettings.enable_spline_viewer && this.el.classList.add('enable-spline') 
        !projectSettings.enable_spline_viewer && this.el.classList.remove('drop')
         
      },
    },
    model: {
      defaults: {
        droppable: false,
        icon: reactToStringMarkup(Icons.spline({ strokeColor: "white" })),
        tagName: `spline-wrapper`,
        name: "Spline",
        components: [{ tagName: "spline-viewer" , droppable:false}],
        attributes: {
          // class: "p-10 min-h-60",
          type: "spline-wrapper",
        },
        traits: defineTraits([
          {
            name: "url",
            label: "Url",
            role: "attribute",
            type: "media",
            ext: "splinecode",
            callback({ editor, newValue }) {
              // editor.getSelected().
            },
          },
        ]),
      },
      init() {
        // Listen for child component removal
        // this.listenTo(this.get("components"), "remove", this.onChildRemove);
        this.on("change:attributes", this.handleAttrChange);
      },
      handleAttrChange(model, attributes) {
        // timeout && clearTimeout(timeout);
        // timeout = setTimeout(() => {
        const child = this.components().models[0];
        const childEl = child.getEl();
        if (!child && !childEl) return;

        const newAttrs = { ...this.getAttributes(), ...attributes };
        delete newAttrs.id; // Avoid overwriting ID
        Object.entries(newAttrs).forEach(([key, value]) => {
          childEl.setAttribute(key, value);
        });
        editor.clearDirtyCount();
      },
      toHTML() {
        const child = this.components().models[0];
        return child.toHTML({
          withProps: true,
          keepInlineStyle: true,
          attributes: this.getAttributes(),
        });
      },
    },
  });

  // editor.Components.addType("spline-viewer-inner", {
  //   isComponent: (el) => {
  //     if (el.tagName === "SPLINE-VIEWER") {
  //       return { type: "spline-viewer-inner" };
  //     }
  //   },
  //   model: {
  //     defaults: {
  //       tagName: "spline-viewer",
  //       draggable: false,
  //       droppable: false,
  //     },
  //   },
  // });
};
