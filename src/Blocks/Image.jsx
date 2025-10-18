import { Icons } from "../components/Icons/Icons";
import { open_files_manager_modal } from "../constants/InfinitelyCommands";
import { html, uniqueID } from "../helpers/cocktail";
import {
  defineTraits,
  doActionAndPreventSaving,
  traitCallback,
} from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Image = ({ editor }) => {
  const classId = `${uniqueID()}`;
  editor.Components.removeType("image");
  editor.Components.addType("image", {
    // extend:'image',
    // extendView:'image',
    view: {
      events: {},
      onActive(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        editor.runCommand(open_files_manager_modal);
      },
      onAttrUpdate() {},
      // onClick(){
      //   console.log('view clicked');

      // },
      onRender(op) {
        doActionAndPreventSaving(editor, () => {
          op.model.set({
            droppable: false,
          });
        });
        // op.el.addEventListener('click',(ev)=>{
        //   ev.stopPropagation();
        //   ev.preventDefault();
        //   console.log('img click');
        // })

        //     op.el.addEventListener('click',()=>{
        //       console.log('clickckckck');
        //       editor.Canvas.getCanvasView().updateFrames()

        // // editor.Canvas.removeSpots({ type: "resize", component: op });
        // // editor.Canvas.addSpot({
        // //   type: "resize",
        // //   component: sle,
        // //   force: true,
        // //   // componentView:sle.view,
        // //   // frame:sle.frame,
        // //   // boxRect:{
        // //   //   height:400,
        // //   //   width:400
        // //   // }
        // // });
        //       // op.model.set('resizable' , {
        //       //   tl: 0,
        //       //   tc: 1,
        //       //   tr: 0,
        //       //   cl: 1,
        //       //   cr: 1,
        //       //   bl: 0,
        //       //   bc: 1,
        //       //   br: 0,
        //       //   minDim: 50,
        //       //   maxDim: 500,
        //       //   ratioDefault: 1,
        //       // })
        //       // editor.refresh({tools:true});
        //       // editor.Canvas.refresh({all:true,spots:true});
        //       // editor.Canvas.refreshSpots()
        //     })

        // op.el.addEventListener('dblclick',(ev)=>{
        //   ev.stopPropagation();
        //   ev.preventDefault();
        //   // console.log('img dblckick');
        //   // console.log('img el : ' , op.el);
        //   editor.runCommand(open_files_manager_modal);
        //   // op.model.set('resizable' , {
        //   //   tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
        //   //   tc: 1, // Top-center
        //   //   tr: 0, // Top-right
        //   //   cl: 1, // Center-left
        //   //   cr: 1, // Center-right
        //   //   bl: 0, // Bottom-left
        //   //   bc: 1, // Bottom-center
        //   //   br: 0, // Bottom-right
        //   //   minDim: 50, // Minimum width/height in px
        //   //   step: 1, // Resize step in px
        //   // })

        // })

        // op.el.addEventListener("load", (ev) => {
        //   // ev.stopPropagation();
        //   // ev.preventDefault();
        //   console.log("img load");
        //   console.log("img el : ", op.el);
        //   // op.model.resizable = {
        //   //   tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
        //   //   tc: 1, // Top-center
        //   //   tr: 0, // Top-right
        //   //   cl: 1, // Center-left
        //   //   cr: 1, // Center-right
        //   //   bl: 0, // Bottom-left
        //   //   bc: 1, // Bottom-center
        //   //   br: 0, // Bottom-right
        //   //   minDim: 50, // Minimum width/height in px
        //   //   step: 1, // Resize step in px
        //   // }

        // });

        // let loadCounter = 0;
        op.el.addEventListener("error", async (ev) => {
          // if(!op.el.src)return
          // console.log('img , no src here' , op.el.src);

          // console.log('from outer :' , loadCounter);

          // try {
          //   if(loadCounter >3)throw new Error('More of calling')
          //   op.el.src = URL.createObjectURL(await (await fetch(`${window.origin}/${op.el.src}`)).blob());
          //   loadCounter++;
          //   console.log('from in :' , loadCounter);

          // editor.refresh({tools:true});
          // editor.Canvas.refresh({all:true,spots:true});
          // editor.Canvas.refreshSpots()

          // } catch (error) {

          // }
          op.el.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik0yLjI4IDNMMSA0LjI3bDIgMlYxOWMwIDEuMS45IDIgMiAyaDEyLjczbDIgMkwyMSAyMS43MiAyLjI4IDNtMi41NSAwTDIxIDE5LjE3VjVhMiAyIDAgMCAwLTItMkg0LjgzTTguNSAxMy41bDIuNSAzIDEtMS4yNUwxNC43MyAxOEg1bDMuNS00LjV6Ij48L3BhdGg+CiAgICAgIDwvc3ZnPg==`;
        });
      },
    },
    isComponent: (el) => el.tagName && el.tagName.toLowerCase() == "img",
    model: {
      defaults: {
        droppable: false,
        tagName: "img",
        icon: reactToStringMarkup(
          Icons.image({ fill: "white", width: 20, height: 20 })
        ),
        attributes: {
          src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+",
          // class : `inf-${classId}`
        },
        // components:html`
        //   <style>
        //     .inf-${classId}{

        //       aspect-ratio:33/33;
        //     }
        //   </style>
        // `,
        resizable: true,

        traits: defineTraits([
          {
            type: "media",
            role: "attribute",
            mediaType: "image",
            label: "Select image",
            name: "src",
            callback({ editor }) {
              // editor.getSelected().set({
              //   droppable
              // })
            },
          },
        ]),
      },
    },
  });
};
