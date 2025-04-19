import { open_files_manager_modal } from "../constants/InfinitelyCommands";
import { html, uniqueID } from "../helpers/cocktail";
import { defineTraits, traitCallback } from "../helpers/functions";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const Video = ({ editor }) => {
  const classId = `${uniqueID()}`;
  //   editor.Components.removeType("video");
  editor.Components.addType("video", {
    // extend: "video",
    // isComponent(el) {
    //   if (el.tagName === "VIDEO") {
    //     return { type: "video" };
    //   }
    // },
    // extendView:'image',

    view: {
      onActive(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        editor.runCommand(open_files_manager_modal);
      },
      onRender(op) {
        op.model.setTraits(defineTraits([
          {
            type: "media",
            role: "handler",
            mediaType: "video",
            label: "Select video",
            name: "Select video",
            callback({ editor, newValue, oldValue }) {
              // editor.get
            },
          },
        ]),)
        // op.el.addEventListener('click',(ev)=>{
        //   ev.stopPropagation();
        //   ev.preventDefault();
        //   console.log('img click');
        // })
        const videoEl = op.el.querySelector("video");
        console.log("elllll rendere : ", op.el, videoEl, op.el.innerHTML);
        if (!videoEl) return;

        op.el.addEventListener("click", () => {
          console.log("clickckckck");
          // editor.Canvas.removeSpots({ type: "resize", component: op.model });
          // editor.Canvas.addSpot({
          //   type: "resize",
          //   component: op.model,
          //   force: true,
          //   // componentView:sle.view,
          //   // frame:sle.frame,
          //   // boxRect:{
          //   //   height:400,
          //   //   width:400
          //   // }
          // });
          // editor.Canvas.getCanvasView().updateFrames();

          // op.model.set('resizable' , {
          //   tl: 0,
          //   tc: 1,
          //   tr: 0,
          //   cl: 1,
          //   cr: 1,
          //   bl: 0,
          //   bc: 1,
          //   br: 0,
          //   minDim: 50,
          //   maxDim: 500,
          //   ratioDefault: 1,
          // })
          // editor.refresh({tools:true});
          // editor.Canvas.refresh({all:true,spots:true});
          // editor.Canvas.refreshSpots()
        });

        // op.el.addEventListener("dblclick", (ev) => {
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
        // });

        // videoEl.addEventListener("load", (ev) => {
        //   // ev.stopPropagation();
        //   // ev.preventDefault();
        //   console.log("Video load");
        //   console.log("Video el : ", op.el);
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
        // videoEl.addEventListener("error", async (ev) => {
        //   console.log("video , no src here", op.el.src);
        //   if (!videoEl.src) return;

        //   console.log("from outer :", loadCounter);

        //   try {
        //     if (loadCounter > 3) throw new Error("More of calling");
        //     videoEl.src = URL.createObjectURL(
        //       await (await fetch(`${window.origin}/${videoEl.src}`)).blob()
        //     );
        //     loadCounter++;
        //     // videoEl.load();
        //     // videoEl.play();

        //     // editor.refresh({tools:true});
        //     // editor.Canvas.refresh({all:true,spots:true});
        //     // editor.Canvas.refreshSpots()
        //   } catch (error) {
        //     videoEl.poster = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik0yLjI4IDNMMSA0LjI3bDIgMlYxOWMwIDEuMS45IDIgMiAyaDEyLjczbDIgMkwyMSAyMS43MiAyLjI4IDNtMi41NSAwTDIxIDE5LjE3VjVhMiAyIDAgMCAwLTItMkg0LjgzTTguNSAxMy41bDIuNSAzIDEtMS4yNUwxNC43MyAxOEg1bDMuNS00LjV6Ij48L3BhdGg+CiAgICAgIDwvc3ZnPg==`;
        //   }
        // });
      },
    },
    model: {
      defaults: {
        // tagName: 'section',
        // attributes: {
        //   controls: true,
        //   class: classId,
        // },
        // content: html`<video src=""></video>`,
        resizable: {
          tl: 0, tc: 0, tr: 0,
          bl: 0, bc: 0, br: 0,
          updateTarget: function(element, rect, context)
          {
              //console.log('custom updateTarget invoked');
  
              var elStyle = element.style;
  
              elStyle.width = rect.w + 'px';
              elStyle.minWidth = rect.w + 'px';
              elStyle.maxWidth = rect.w + 'px';
              elStyle.flexGrow = 0;
          }
      }
        // attributes: {
        //   //   src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+",
        //   class: `${classId}`,
        //   //   controles: true,
        // },

        // components: html`
        //   <video src=""></video>
        //   <style>
        //     .${classId} {
        //       width: fit-content;
        //       max-width: 100%;
        //       max-height: 100%;
        //     }
        //   </style>
        // `,
        // traits: defineTraits([
        //   {
        //     type: "media",
        //     role: "handler",
        //     mediaType: "video",
        //     label: "Select video",
        //     name: "Select video",
        //     callback({ editor, newValue, oldValue }) {
        //       // editor.get
        //     },
        //   },
        // ]),
      },
    },
  });

  // editor.Components.ad()

  // const videoCmp = editor.Components.getType("video");
  // /**
  //  * @type {import('grapesjs').ComponentModelDefinition}
  //  */
  // const cmpModel = videoCmp.model;
//   /**
//    * @type {import('grapesjs').ComponentView | import('grapesjs').ComponentViewDefinition}
//    */
//   const cmpView = videoCmp.view;

//   cmpView.onRender = (op) => {
//     // op.el.addEventListener('click',(ev)=>{
//     //   ev.stopPropagation();
//     //   ev.preventDefault();
//     //   console.log('img click');
//     // })
//     const videoEl = op.el.querySelector("video");
//     console.log("elllll rendere : ", op.el, videoEl, op.el.innerHTML);
//     if (!videoEl) return;

//     op.el.addEventListener("click", () => {
//       console.log("clickckckck");
//       editor.Canvas.removeSpots({ type: "resize", component: op.model });
//       editor.Canvas.addSpot({
//         type: "resize",
//         component: op.model,
//         force: true,
//         // componentView:sle.view,
//         // frame:sle.frame,
//         // boxRect:{
//         //   height:400,
//         //   width:400
//         // }
//       });
//       editor.Canvas.getCanvasView().updateFrames();

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
//     });

//     op.el.addEventListener("dblclick", (ev) => {
//       ev.stopPropagation();
//       ev.preventDefault();
//       // console.log('img dblckick');
//       // console.log('img el : ' , op.el);
//       editor.runCommand(open_files_manager_modal);
//       // op.model.set('resizable' , {
//       //   tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
//       //   tc: 1, // Top-center
//       //   tr: 0, // Top-right
//       //   cl: 1, // Center-left
//       //   cr: 1, // Center-right
//       //   bl: 0, // Bottom-left
//       //   bc: 1, // Bottom-center
//       //   br: 0, // Bottom-right
//       //   minDim: 50, // Minimum width/height in px
//       //   step: 1, // Resize step in px
//       // })
//     });

//     videoEl.addEventListener("load", (ev) => {
//       // ev.stopPropagation();
//       // ev.preventDefault();
//       console.log("Video load");
//       console.log("Video el : ", op.el);
//       // op.model.resizable = {
//       //   tl: 0, // Top-left handle (0 = disabled, 1 = enabled)
//       //   tc: 1, // Top-center
//       //   tr: 0, // Top-right
//       //   cl: 1, // Center-left
//       //   cr: 1, // Center-right
//       //   bl: 0, // Bottom-left
//       //   bc: 1, // Bottom-center
//       //   br: 0, // Bottom-right
//       //   minDim: 50, // Minimum width/height in px
//       //   step: 1, // Resize step in px
//       // }
//     });

//     let loadCounter = 0;
//     videoEl.addEventListener("error", async (ev) => {
//       console.log("video , no src here", op.el.src);
//       if (!videoEl.src) return;

//       console.log("from outer :", loadCounter);

//       try {
//         if (loadCounter > 3) throw new Error("More of calling");
//         videoEl.src = URL.createObjectURL(
//           await (await fetch(`${window.origin}/${videoEl.src}`)).blob()
//         );
//         loadCounter++;
//         // videoEl.load();
//         // videoEl.play();

//         // editor.refresh({tools:true});
//         // editor.Canvas.refresh({all:true,spots:true});
//         // editor.Canvas.refreshSpots()
//       } catch (error) {
//         videoEl.poster = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik0yLjI4IDNMMSA0LjI3bDIgMlYxOWMwIDEuMS45IDIgMiAyaDEyLjczbDIgMkwyMSAyMS43MiAyLjI4IDNtMi41NSAwTDIxIDE5LjE3VjVhMiAyIDAgMCAwLTItMkg0LjgzTTguNSAxMy41bDIuNSAzIDEtMS4yNUwxNC43MyAxOEg1bDMuNS00LjV6Ij48L3BhdGg+CiAgICAgIDwvc3ZnPg==`;
//       }
//     });
//   };

// console.log('model : ' , cmpModel);
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0"

  // cmpModel.extend(
  //   { 
  //    defaults:{
  //     ...cmpModel.prototype.defaults,
  //     traits:defineTraits([
  //       {
  //         type: "media",
  //         role: "handler",
  //         mediaType: "video",
  //         label: "Select video",
  //         name: "Select video",
  //         callback({ editor, newValue, oldValue }) {
  //           // editor.get
  //         },
  //       },
  //     ])
  //    }
  //   }
  // );
};
