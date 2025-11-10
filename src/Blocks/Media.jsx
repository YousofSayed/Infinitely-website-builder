import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons/Icons";
import { defaultAttributeNames, tagNames } from "../constants/hsValues";
import { media_types } from "../constants/shared";
import { html, parse } from "../helpers/cocktail";
import {
  defineTraits,
  doActionAndPreventSaving,
  preventSelectNavigation,
} from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 * @returns
 */
export const Media = ({ editor }) => {
  editor.Components.removeType("iframe");
  editor.Components.removeType("video");
  editor.Components.removeType("audio");
  let timeout;

  editor.Components.addType("media", {
    isComponent: (el) => {
      // console.log(el, el.tagName);
      if (!el.tagName) return;
      if (el.tagName.toLowerCase() == "infinitely-media") return true;
      if (
        media_types.includes(el.tagName.toLowerCase()) &&
        el.parentElement.tagName.toLowerCase() != "infinitely-media"
      ) {
        console.log("it is media");

        return {
          type: "media",
          tagName: "infinitely-media",
          components: {
            tagName: el.tagName,
            attributes: Object.fromEntries(
              el
                .getAttributeNames()
                .map((attr) => [attr, el.getAttribute(attr)])
            ),
          },
        };
      }
    },
    view: {
      events: {
        click: "onClick",
      },

      // onAttrUpdate() {
      //   const attributes = this.model.getAttributes();
      //   const traitsNames = ["choose-file", "iframe-src", "access-media" , 'id'];
      //   traitsNames.forEach((name) => {
      //     delete attributes[name];
      //   });
      //   // delete attributes[]
      //   const child =   this.model
      //     .components().models[0]

      //    child.addAttributes({...attributes , class : [...new Set([...child.getClasses() , ...(attributes.class.split(' ') || [])])].join(' ')});
      //    console.log('attributes : updated',);

      // },
      onRender({ el, model, editor }) {
        try {
          doActionAndPreventSaving(editor, (ed) => {
            const typeTraitVal = model.getTrait("type").attributes.value;
            // const iframeSrc = model.getTrait("iframe-src").attributes.value;
            // const choosedFile = model.getTrait("choose-file").attributes.value;
            // const mediaAttributes = parse(
            //   model.getTrait("media-attributes").attributes.value || {}
            // );
            // const mediaAttributes = model.getTrait('media-attributes').attributes.value;
            const child = model.components().models[0];

            // const childELl = child.getEl();
            // childELl.style.pointerEvents = "none";
            // childELl.style.display = "block";
            // childELl.style.width = "100%";
            // childELl.style.height = "100%";
            const attributes = model.getAttributes();
            delete attributes["id"];

            console.log(
              "from render , :",
              media_types.includes(child.tagName.toLowerCase()),
              model.getClasses()
            );

            if (media_types.includes(child.tagName.toLowerCase())) {
              child.addAttributes(attributes, { avoidStore: true });
            }

            // if (
            //   media_types.includes(child.tagName.toLowerCase()) &&
            //   model.getClasses().includes("h-60")
            // ) {
            //   model.removeClass(["h-300", "minh-60", "h-60"]);
            // }
            // editor.getWrapper().getInnerHTML()
            // }
            model.updateTrait("src", {
              mediaType: typeTraitVal,
            });

            // model.updateTrait("media-attributes", {
            //   value: JSON.stringify(model.components().models[0].getAttributes()),
            // });
            child.set({
              layerable: false,
              draggable: false,
              droppable: false,
              removable: false,
              selectable: false,
              hoverable: false,
              badgable: false,
              editable: false,
              locked: true,
              resizable: false,
            });
          });
          // child.setTraits(traits({ mediaType: child.tagName.toLowerCase() }));
        } catch (error) {
          throw new Error(error);
        }
      },
      // onClick(event) {
      //   console.log("cliiickced");

      //   event.stopPropagation();
      //   const child = this.model.components().models[0];
      //   if (child && media_types.includes(child.tagName.toLowerCase())) {
      //     // child.setTraits(traits);
      //     editor.select(child);
      //   } else {
      //     editor.select(this.model);
      //   }
      // },
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(
          Icons.video({ fill: "white", width: 18, height: 18 })
        ),
        droppable: false,
        tagName: "infinitely-media",
        attributes: {
          // class: "h-60 w-full h-full ",
          // controls: true,
          // poster: "",
        },
        components: html` Please select media 💙 `,
        traits: defineTraits([
          {
            name: "type",
            label: "Media type",
            placeholder: "Choose media type",
            role: "attribute",
            type: "select",
            // value:'',
            bindToAttribute: true,
            keywords: media_types,
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              if (!sle) return;
              sle.removeClass(["h-300", "minh-60", "h-60"]);
              sle.components({
                tagName: newValue,
                layerable: false,
                draggable: false,
                droppable: false,
                removable: false,
                selectable: false,
                hoverable: false,
                badgable: false,
                editable: false,
                locked: true,
                resizable: false,
                attributes: {
                  // class: " no-pointer",
                  // style: `width:100%; height:100%; pointer-events:none; display:block;`,
                },
              });
              // sle.components().models[0].setTraits(traits({mediaType:newValue}));
              // preventSelectNavigation(editor, sle.components().models[0]);
              sle.updateTrait("src", {
                mediaType: newValue,
              });
            },
          },

          {
            name: "src",
            label: "Choose file",
            role: "attribute",
            type: "media",
            mediaType: "",
            // value:'',
            bindToAttribute: true,
            // showCallback() {
            //   const sle = editor.getSelected();
            //   if (!sle) return;
            //   const trait = sle?.getTrait?.("type");
            //   if (!trait) return;
            //   const type = trait.attributes.value;
            //   console.log(
            //     "from choose callback : ",
            //     type != "audio" && type != "video"
            //   );

            //   return type == "audio" || type == "video";
            // },
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              const child = sle.components().models[0];
              if (!sle && !child) return;
              console.log(editor.Storage.getConfig().autosave);

              sle.addAttributes({ src: newValue }, { avoidStore: true });
            },
          },

          // {
          //   name: "src",
          //   label: "Iframe src",
          //   placeholder: "Type iframe src",
          //   role: "attribute",
          //   type: "text",
          //   bindToAttribute: true,
          //   showCallback() {
          //     const sle = editor.getSelected();
          //     if (!sle) return;
          //     const trait = sle?.getTrait?.("type");
          //     if (!trait) return;
          //     const type = sle.getTrait("type").attributes.value;
          //     return type == "iframe";
          //   },
          //   callback({ editor, newValue }) {
          //     const sle = editor.getSelected();
          //     const child = sle.components().models[0];
          //     if (!sle && !child) return;
          //     sle.addAttributes({ src: newValue }, { avoidStore: true });
          //   },
          // },

          // {
          //   name: "media-attributes",
          //   label: "Media attributes",
          //   placeholder: "choose attribute",
          //   default: "{}",
          //   role: "handler",
          //   type: "add-props",
          //   keywords: defaultAttributeNames,
          //   addPropsInputType: "text",
          //   // addPropsCodeLanguage: "javascript",
          //   // allowCmdsContext: true,

          //   callback({ editor, newValue }) {
          //     const sle = editor.getSelected();
          //     const child = sle.components().models[0];
          //     if (!sle && !child) return;

          //     child.addAttributes(parse(newValue || "{}"));
          //   },
          // },

          // {
          //   name: "access-media",
          //   label: "Access media",
          //   role: "attribute",
          //   type: "switch",
          //   onSwitch(value) {
          //     const sle = editor.getSelected();
          //     const child = sle.components().models[0];
          //     const childEl = child.getEl();
          //     if (!sle && !child) return;

          //     console.log("access value : ", value);

          //     //   const parsedValue = Boolean(parse(newValue));
          //     // value
          //     //   ? (childEl.style.pointerEvents = "auto !important")
          //     //   : (childEl.style.pointerEvents = "none !important");

          //     // value
          //     //   ? child.removeClass("no-pointer")
          //     //   : child.addClass("no-pointer");
          //   },
          //   // callback({ editor, newValue }) {},
          // },

          // {
          //   name: "edite-commands",
          //   label: "Edite commands",
          //   role: "handler",
          //   type: "custom",
          //   component: ({}) => {
          //     const navigate = useNavigate();
          //     const sle = editor?.getSelected?.();
          //     const child = sle?.components?.()?.models?.[0];

          //     return (
          //       <Button
          //         className="w-full justify-center items-center flex"
          //         onClick={(ev) => {
          //           if (!sle && !child) return;
          //           editor.select(child);
          //           navigate("/edite/commands");
          //         }}
          //       >
          //         Edite commands
          //       </Button>
          //     );
          //   },
          // },
        ]),
      },
      init() {
        // Listen for child component removal
        // this.listenTo(this.get("components"), "remove", this.onChildRemove);
        this.on("change:attributes", this.handleAttrChange);
      },
      handleAttrChange(model, attributes) {
        timeout && clearTimeout(timeout);
        // timeout = setTimeout(() => {
          const child = this.components().models[0];
          if (!child) return;
          const childEl = child.getEl();
          if (!childEl) return;
          const originalAttributes = Object.fromEntries(
            [...this.getEl().attributes].map((attr) => [attr.name, attr.value])
          );;

          const allChildAttrsWillRemoved = Object.fromEntries(
            [...childEl.attributes].map((attr) => [attr.name, attr.value])
          );
          
          const childAttributes = { ...attributes };
          delete childAttributes["id"];
          const allAttributes = { ...childAttributes };
          const currentSrc = allChildAttrsWillRemoved["src"];

          console.log(
            "originalAttributes, childAttributes",
            originalAttributes,
            childAttributes,
            currentSrc,
            allAttributes.src
          );

          if (
            allAttributes.src &&
            currentSrc &&
            currentSrc == allAttributes.src
          ) {
            console.log(
              "srcccccccccccccccccccccccccccc updated",
              childAttributes
            );

            delete allAttributes["src"];
            delete allChildAttrsWillRemoved["src"];
            // delete allAttributes["controls"];
            // delete allAttributes["poster"];
          }

          for (const attrKey of Object.keys(allChildAttrsWillRemoved)) {
            // if (childEl.hasAttribute(attrKey)) continue;
            childEl.removeAttribute(attrKey);
          }

          Object.entries(allAttributes).forEach(([key, value]) => {
            childEl.setAttribute(key, value);
          });

          // child.addAttributes(childAttributes, {
          //   avoidStore: true,
          //   // addStyle: true,
          //   // skipWatcherUpdates: true,
          //   partial: true,
          // });
        // }, 100);
        // const isAccessed = Boolean(parse(childAttributes["access-media"]));
        // isAccessed
        //   ? (childEl.style.pointerEvents = "auto !important")
        //   : (childEl.style.pointerEvents = "none !important");
      },
      // onChildRemove(child) {
      //   // Check if the removed child was a media-child
      //   if (media_types.includes(child.get("tagName").toLowerCase())) {
      //     // Remove the entire media component
      //     this.remove();
      //   }
      // },

      toHTML() {
        const child = this.components().models[0];
        const childEl = child.getEl();
        console.log(`Exporter fired`);

        if (!media_types.includes(child.tagName.toLowerCase())) {
          return this.getEl().outerHTML;
        }
        // childEl.style.display = '';
        // childEl.style.pointerEvents = '';
        // child.addAttributes({style:childEl.getAttribute('style')})
        console.log("from exporter : ", childEl, child.getAttributes());
        // editor.StorageManager.setAutosave(false);
        // child.removeClass(["no-pointers"]);
        // const childAttr = child.getAttributes();
        // delete childAttr["style"];
        // const attributes = { ...childAttr, ...this.getAttributes() };
        // delete attributes["choose-file"];
        // delete attributes["iframe-src"];
        // delete attributes["media-attributes"];
        // childEl.classList.remove('no-pointers');
        // const clone = child.clone();
        // const attributes = clone.getAttributes();
        // const newClass = [...(clone.getClasses() || [])]
        //   .filter(
        //     (className) =>
        //       !["no-pointer", "block", "w-full", "h-full"].includes(className)
        //   )
        //   .join(" ");

        // clone.removeClass("no-pointers");
        const attributes = this.getAttributes();
        console.log("attrinutes", attributes);

        delete attributes["id"];
        // const exportedCode = child.getEl().outerHTML;
        const exportedCode = child.toHTML({ attributes });

        // clone.toHTML({
        //   attributes: { ...attributes, class: newClass },
        // });
        // clone.addClass("no-pointers");
        // childEl.classList.add('no-pointers');

        // child.addClass(["no-pointers"]);
        // editor.StorageManager.setAutosave(true);
        // childEl.style.display = "block";
        // childEl.style.pointerEvents = "none";
        return exportedCode;
      },
    },
  });

  // editor.Commands.add("transform-media", {
  //   run(editor) {
  //     const wrapper = editor.getWrapper();
  //     const components = wrapper.find("media-child");

  //     components.forEach((comp) => {
  //       if (comp.parent().get("type") === "media") return;

  //       const tagName = comp.get("tagName").toLowerCase();
  //       if (!media_types.includes(tagName)) return;

  //       const attributes = comp.getAttributes();
  //       const classes = comp.getClasses();

  //       const mediaComp = editor.Components.add({
  //         type: "media",
  //         tagName: "section",
  //         attributes: {
  //           class: "h-60 inline-block",
  //         },
  //         components: [
  //           {
  //             type: "media-child",
  //             tagName: tagName,
  //             attributes: {
  //               ...attributes,
  //               class: classes.length ? `${classes.join(" ")} w-full h-full no-pointer block` : "w-full h-full no-pointer block",
  //             },
  //           },
  //         ],
  //         traits: {
  //           type: tagName,
  //           "media-attributes": JSON.stringify(attributes),
  //           "choose-file": attributes.src || "",
  //           "iframe-src": tagName === "iframe" ? attributes.src || "" : "",
  //           "access-media": !classes.includes("no-pointer"),
  //         },
  //       }, { at: comp.index() });

  //       comp.remove();
  //       editor.select(mediaComp.components().models[0]);
  //     });
  //   },
  // });

  // Override core:copy to handle media and media-child
  // const originalCopy = editor.Commands.get("core:copy");
  // editor.Commands.add("core:copy", {
  //   run(editor, sender, opts = {}) {
  //     console.log('copy is fired');

  //     const selected = editor.getSelected();
  //     if (!selected) return;

  //     // If media-child is selected, copy its parent media component
  //     if ( selected.parent().get("type") === "media") {
  //       editor.select(selected.parent());
  //       const result = originalCopy.run(editor, sender, opts);
  //       editor.select(selected); // Restore original selection
  //       return result;
  //     }
  //     // Otherwise, proceed with default copy behavior
  //     return originalCopy.run(editor, sender, opts);
  //   },
  // });

  // // Override core:paste to ensure pasted media-child is wrapped in media
  // const originalPaste = editor.Commands.get("core:paste");
  // editor.Commands.add("core:paste", {
  //   run(editor, sender, opts = {}) {
  //           console.log('paste is fired');

  //     const result = originalPaste.run(editor, sender, opts);
  //     // Trigger transform-media to wrap any standalone media-child components
  //     editor.runCommand("transform-media");
  //     return result;
  //   },
  // });
};
