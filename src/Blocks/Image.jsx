import { open_files_manager_modal } from "../constants/InfinitelyCommands";
import { html, uniqueID } from "../helpers/cocktail";
import { defineTraits, traitCallback } from "../helpers/functions";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Image = ({ editor }) => {
  const classId = `${uniqueID()}`
  editor.Components.removeType('image')
  editor.Components.addType("image", {
    // extend:'image',
    // extendView:'image',
    view: {
      onActive(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        editor.runCommand(open_files_manager_modal);
      },
      onAttrUpdate() {},
      onRender(op) {
        // op.el.addEventListener('click',(ev)=>{
        //   ev.stopPropagation();
        //   ev.preventDefault();
        //   console.log('img click');
        // })

        op.el.addEventListener('dblclick',(ev)=>{
          ev.stopPropagation();
          ev.preventDefault();
          // console.log('img dblckick');
          // console.log('img el : ' , op.el);
          editor.runCommand(open_files_manager_modal);
        })

        op.el.addEventListener("load", (ev) => {
          // ev.stopPropagation();
          // ev.preventDefault();
          console.log("img load");
          console.log("img el : ", op.el);
        });

        op.el.addEventListener('error',(ev)=>{
          console.log('img , no src here');
          op.el.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik0yLjI4IDNMMSA0LjI3bDIgMlYxOWMwIDEuMS45IDIgMiAyaDEyLjczbDIgMkwyMSAyMS43MiAyLjI4IDNtMi41NSAwTDIxIDE5LjE3VjVhMiAyIDAgMCAwLTItMkg0LjgzTTguNSAxMy41bDIuNSAzIDEtMS4yNUwxNC43MyAxOEg1bDMuNS00LjV6Ij48L3BhdGg+CiAgICAgIDwvc3ZnPg==`
        })
      },
    },
    model: {
      defaults: {
        tagName: "img",
        attributes: {
          src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+",
          class : `${classId}`
        },
        components:html`
          <style>
            .${classId}{
             
              aspect-ratio:33/33;
            }
          </style>
        `,
        traits: defineTraits([
          {
            type: "media",
            role: "handler",
            mediaType: "image",
            label: "Select image",
            name: "Select image",
          },
        ]),
        resizable: {
          tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
          tc: 1, // Top-center
          tr: 0, // Top-right
          cl: 1, // Center-left
          cr: 1, // Center-right
          bl: 0, // Bottom-left
          bc: 1, // Bottom-center
          br: 0, // Bottom-right
          minDim: 50, // Minimum width/height in px
          step: 1, // Resize step in px
        },
      },
    },
  });
};
