import { Icons } from "../components/Icons/Icons";
import { html } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 */
export const Audio = ({ editor }) => {
  editor.Components.addType("audio", {
    isComponent: (el) => el.tagName === "Section" && el.children[0].tagName == 'AUDIO',
    view: {
      // onAttrUpdate() {
      //   const cmp = this.model.components().models[0];
      //   cmp.setAttributes(this.model.getAttributes());
      // },
      onRender({ editor, el, model }) {
        // el.style.pointerEvents = 'none'
        console.log('From Render :', el, el.children , model.components().models[0]);
        const audCmp =  model.components().models[0];           
        const audioEl = audCmp.getEl();      
        audCmp.setAttributes(model.getAttributes())

        audioEl.style.pointerEvents = "none";
        audioEl.style.height = "100%";
        audioEl.style.width = "100%";
        audioEl.style.display = "block";
        el.addEventListener("click", (ev) => {
          // ev.stopPropagation();
          ev.preventDefault();
          // editor.select(audCmp);
          console.log("audio clicked");
        });
      },
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(Icons.headphone("white" , undefined , 19 , 19)),
        tagName: "section",
        attributes: {
          class: `inline-block w-fit h-fit`,
          controls: "true",
        },
        components : html`<audio controls />`,
        droppable: false, // Prevents dropping other components inside
       
        traits: defineTraits([
          {
            name: "src",
            role: "handler",
            type: "media",
            mediaType: "audio",
            label: "Select audio",
          },
          {
            name: "autoplay",
            role: "handler",
            type: "select",
            keywords:['true' , 'false'],
            label: "Autoplay",
          },
          {
            name:'loop',
            role:'handler',
            type:'select',
            keywords:['true' , 'false'],
            label:'Loop'
          },
          {
            name:'mute',
            role:'handler',
            type:'select',
            keywords:['true' , 'false'],
            label:'Mute',
          }
        ]),
      },
    },
  });
};
