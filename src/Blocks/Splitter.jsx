import { isFunction } from "lodash";
import { Icons } from "../components/Icons/Icons";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Splitter = ({ editor }) => {
  let renderTimeout;
  editor.Components.addType("splitter", {
    // extend: "text",

    view: {
      onRender({ model, editor, el }) {
        // console.log("from splitter : ", el.textContent, "\n\n", el.innerText);

        // model.updateTrait("splitter", { value: el.textContent });
        const segmenter = new Intl.Segmenter(undefined, {
          granularity: "grapheme",
        });
        const value = `${[...segmenter.segment(el.textContent)]
          .map((seg) => seg.segment)
          .join("")}`;

        model.updateTrait("splitter", {
          value,
        });

        console.log(
          "from splitter : ",
          `${[...segmenter.segment(el.textContent)]
            .map((seg) => seg.segment)
            .join("")}`
        );

        const attributes = model.getAttributes();
        const isPlain = Boolean(attributes["is-plain"]);
        if (isPlain) {
          const splitterTraitCallback =
            model.getTrait("splitter").attributes.callback;
          isFunction(splitterTraitCallback) &&
            splitterTraitCallback({
              editor,
              newValue: value,
              model,
            });

          model.removeAttributes(["is-plain"]);
        }
        // const firstSplittedEl = el.children[0];
        // if (
        //   firstSplittedEl &&
        //   firstSplittedEl.tagName.toLowerCase() == "span"
        // ) {
        //   model.updateTrait("char-class-name", {
        //     value: firstSplittedEl.classList[0],
        //   });
        // }
        // editor.on(' ')
      },
    },
    model: {
      //   init() {
      //     this.updateTrait("splitter", { value: this. });
      //   },

      defaults: {
        draggable: true,
        droppable: false,
        icon: reactToStringMarkup(
          Icons.splitter({ strokeColor: "white", width: 25, height: 25 })
        ),
        tagName: "p",
        attributes: {
          class: "p-10",
        },
        components: `Insert your splitted text here`
          .split("")
          .map((char) => `<span class="char">${char}</span>`)
          .join(""),
        traits: defineTraits([
          {
            label: "char class name",
            name: "char-class-name",
            role: "attribute",
            value: "char",
            type: "text",
            // init({})=>{},
            callback({ editor, newValue, oldValue }) {
              const sle = editor.getSelected();
              sle.components().models.forEach((model) => {
                model.find(`.${oldValue}`).forEach((model) => {
                  model.removeClass(["char", oldValue]);
                  model.addClass(newValue, "inline-block");
                });
              });
            },
          },
          {
            label: "splitter",
            name: "splitter",
            type: "textarea",
            role: "handler",
            // value: "",
            // init({ editor, model, trait }) {},
            onMountHandler(mEditor, monaco) {
              mEditor.setValue(this.value);
            },
            callback({ editor, newValue, oldValue, model }) {
              const sle = model || editor.getSelected();
              const segmenter = new Intl.Segmenter(undefined, {
                granularity: "grapheme",
              });

              const words = newValue
                .split(" ")
                .map((word) => {
                  const chars = [...segmenter.segment(word)].map(
                    ({ segment }) =>
                      `<span class="${
                        sle.getTrait("char-class-name").attributes.value ||
                        "char"
                      } inline-block">${segment}</span>`
                  );
                  return chars.join("");
                })
                .filter(Boolean)
                .map((word) => `${word}&nbsp;`);
              sle.components("");
              console.log("words : ", words);
              // return
              if (renderTimeout) clearTimeout(renderTimeout);
              const render = (word, index) => {
                sle.append(
                  ` <span class="inline-block text-nowrap" >${word}</span>`,
                  { at: index }
                );
                renderTimeout = setTimeout(() => {
                  const newIndex = index + 1;
                  if (newIndex < words.length)
                    render(words[newIndex], newIndex);
                }, 50);
              };
              render(words[0], 0);
              // sle.components(
              //   newValue
              //     .split("")
              //     .map(
              //       (char) =>
              //  !char.includes(' ') ? `<span class="${
              //     sle.getTrait(`char-class-name`).attributes.value || "char"
              //   } inline-block">${char}</span>` :
              //   `${char}`
              // )
              //     .join("")
              // );
            },
          },
        ]),
      },
    },
  });
};
