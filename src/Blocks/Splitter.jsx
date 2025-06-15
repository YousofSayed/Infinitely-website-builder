import { Icons } from "../components/Icons/Icons";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Splitter = ({ editor }) => {
  editor.Components.addType("splitter", {
    // extend: "text",
  
    view: {
      
      onRender({ model, editor, el }) {
        console.log('from splitter : ' , el.textContent , '\n\n' , el.innerText);
        
        model.updateTrait("splitter", { value: el.textContent });
        const firstSplittedEl = el.children[0];
        if(firstSplittedEl && firstSplittedEl.tagName.toLowerCase() == 'span'){
          model.updateTrait("char-class-name", {
            value: firstSplittedEl.classList[0],
          });
        }   
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
        components: `Insert your splitted text here`.split('').map(char=>`<span class="char">${char}</span>`).join(''),
        traits: defineTraits([
          {
            label: "char class name",
            name: "char-class-name",
            role: "attribute",
            value: "",
            type: "text",
          },
          {
            label: "splitter",
            name: "splitter",
            type: "textarea",
            role: "handler",
            // value: "",
            onMountHandler(mEditor , monaco){
              mEditor.setValue(this.value);
            },
            callback({ editor, newValue, oldValue }) {
              const sle = editor.getSelected();
              sle.components(
                newValue
                  .split("")
                  .map(
                    (char) =>
                     !char.includes(' ') ? `<span class="${
                        sle.getTrait(`char-class-name`).attributes.value || "char"
                      } inline-block">${char}</span>` :
                      `${char}`
                  )
                  .join("")
              );
            },
          },
        ]),
      },
    },
  });
};
