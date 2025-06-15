import { Icons } from "../components/Icons/Icons";
import { html } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 */
export const Iframe = ({ editor }) => {
  editor.Components.removeType("iframe");
  editor.Components.addType("iframe", {
    // extendView:'video',
    // isComponent:(el)=>el.tagName === 'SECTION' && el.children[0].tagName === 'IFRAME',
    isComponent: (el) => {
      //   Only match <section> with data-gjs-type="iframe"
      if (
        el.tagName === "SECTION" &&
        el.children.length == 1 &&
        el.children[0].tagName == "IFRAME"
      ) {
        return {
          type: "iframe",
          attributes: Object.fromEntries(
            el.getAttributeNames().map((attr) => [attr, el.getAttribute(attr)])
          ),
        };
      }
      // Match standalone <iframe> not inside a custom component
      //   if (el.tagName === "IFRAME" && !el.parentElement.hasAttribute('data-gjs-type')) {
      //     const clone = el.cloneNode(true);
      //     const wrapper = document.createElement('section');
      //     wrapper.appendChild(clone);
      //     el.getAttributeNames().forEach((attr)=>{
      //         wrapper.setAttribute(attr , el.getAttribute(attr))
      //     });
      //     wrapper.setAttribute('data-gjs-type','iframe');
      //     el.replaceWith(wrapper);
      //     return {
      //       type: "iframe",
      //       attributes: Object.fromEntries(
      //         el.getAttributeNames().map((attr) => [attr, el.getAttribute(attr)])
      //       ),
      //     };
      //   }
      return undefined; // Explicitly skip other elements
    },

    view: {
      onAttrUpdate() {
        const cmp = this.model.components().models[0];
        if (!cmp) return;
        cmp.setAttributes(this.model.getAttributes());
      },
      onRender({ el, editor, model }) {
        console.log("from render : ", el);
        if (el.tagName != "IFRAME") return;
        el.style.pointerEvents = "none";
        el.style.height = "100%";
        el.style.width = "100%";
        el.style.display = "block";

        // const ifrCmp = model.components().models[0];
        // const ifrEl = ifrCmp.getEl();
        // ifrCmp.setAttributes(model.getAttributes());

        // ifrEl.style.pointerEvents = "none";
        // ifrEl.style.height = "100%";
        // ifrEl.style.width = "100%";
        // ifrEl.style.display = "block";
      },
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(
          Icons.iframe({ fill: "white", width: 19, height: 19 })
        ),
        tagName: "section",
        components: html` <iframe /> `,
        attributes: {
          class: "inline-block",
          //   src: "about:blank",
        },
        // editor,
        // script: function ({editor}) {
        //   /**
        //    * @type {HTMLElement}
        //    */
        //   const el = this;
        //   const body = document.body;

        //   console.log("script : ", this, this?.getAttributes?.());
        //   const preventerEl = document.createElement("div");
        //   const { left, top, width, height } = el.getBoundingClientRect();
        //   preventerEl.style.position = "absolute";
        //   preventerEl.style.left = `${Math.ceil(left)}px`;
        //   preventerEl.style.top = `${Math.ceil(top)}px`;
        //   preventerEl.style.width = `${width}px`;
        //   preventerEl.style.height = `${height}px`;
        //   // preventerEl.style.backgroundColor = `gold`;
        //   body.appendChild(preventerEl);
        //   el.setAttribute("prevented", "true");
        //   if (el.hasAttribute("data-gjs-type")) {
        //     preventerEl.addEventListener("click", (ev) => {
        //       // const gjsCmp = editor.getWrapper().find(`#${el.id}`)[0];
        //       // editor.select(gjsCmp);
        //       el.click();
        //     });

        //     const gjsCmp = editor.getWrapper().find(`#${el.id}`)[0];
        //     preventerEl.addEventListener("mousemove", (ev) => {
        //       console.log("over");

        //       editor.Layers.setLayerData(gjsCmp, { hovered: true });
        //     });
        //   }
        // },
        traits: defineTraits([
          {
            name: "src",
            label: "Enter url",
            role: "handler",
            type: "text",
          },
        ]),
      },
    },
  });
};
