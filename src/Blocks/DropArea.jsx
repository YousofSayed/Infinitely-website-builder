/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 */
export const DropArea = ({ editor }) => {
  // editor.on("", (model) => {
  //   // editor.UndoManager.stop();

  //   // const parent = removed.parent();
  //   if(model.get('type') == 'wrapper')return;
  //   console.log("component:remove:before", (model));

  //   // if (parent && parent.components().length === 0) {
  //   //   parent.components({ type: "drop-area" });
  //   // }

  //   editor
  //     .getWrapper()
  //     .find("*")
  //     .forEach((model) => {
  //       console.log(model.props().droppable && !model.components().length , model.props().droppable , !model.components().length , model.get('type'));
        
  //       if (model.props().droppable && !model.components().length) {
  //         model.components({ type: "drop-area" });
  //       }
  //     });

  //   // editor.UndoManager.stop();
  // });
  editor.Components.addType("drop-area", {
    view: {
      onRender({ editor, el, model }) {
        const comps = model.components().models;
        // console.log('redddddddddddddder...........' , comps , comps.length , el.children.length);
        model.set({
          droppable: true,
          draggable: false,
          resizable: false,
          badgable: false,
          hoverable: false,
          // selectable:false
        });

        const parent = model.parent();

        if (parent) {
          // ❌ While drop-area exists, parent is NOT droppable
          parent.set("droppable", false);
          parent.view.onRender = ({model})=>{
            console.log('renderrrrrrrrrrrrrrrr');
            
            if(!model.components().length && model.props().droppable){
              model.components({type:'drop-area'})
            }
          }
          // When THIS drop-area is removed/replaced → restore parent droppable
          model.on("removed", () => {
            console.log("remoooooooooooved : ", parent);

            parent.set("droppable", true);
            // 👀 Watch parent emptiness
          });
        }
        // parent.view.onRender = ({ model, editor, el }) => {
        //   console.log('parent render : ' , model.components().models);

        //   if (!model.components().models.length) {
        //     model.components({ type: "drop-area" });
        //     // parent.view.onRender = null;
        //   }
        // };
        // parent.on('component:mount',(ev)=>{
        //   console.log('parent mounted : ' , ev);

        // })
        parent.on("component:update:components", (model, comps, opts) => {
          if (comps.models.length === 0) {
            // ⬅️ Add new drop-area if empty
            console.log(
              "update lenght of comps of parent : ",
              comps.models,
              opts
            );
            // editor.UndoManager.stop();
            parent.components({
              type: "drop-area",
            });
            // editor.UndoManager.remove(parent)

            // editor.UndoManager.start();
          }
        });

        if (comps.length > 1) {
          // const mClone = model.clone();
          // mClone.components({type:'drop-area'});
          // model.replaceWith(mClone)
          console.log("Big redddddddddddddder...........");
          comps.forEach((comp, i) => {
            if (i == 0) return;
            comp.remove();
          });
        }
      },
    },
    model: {
      defaults: {
        name: "Drop area",
        tagName: "drop-area",
        attributes: { class: "drop-area" },
        components: `Drop Here`,
        // layerable: false,
        name: "Drop Area",
        // droppable: true,
        droppable: true,
        selectable: false,
        // Prevent this component itself from being dropped inside others
        draggable: false,
      },

      init() {
        // Run only on creation, not every render
        console.log("init......................");

        // Listen for drops
        this.on("component:update:components", (model, comps, opts) => {
          if (opts.action === "add-component") {
            // console.log('hahahahhhhhhhhhhhhhhhhhhhhhhhhhh');
            if (
              comps.length > 1 &&
              comps.at(0).toHTML().includes("Drop Here")
            ) {
              const dropped = comps.at(comps.length - 1);
              const clone = dropped.clone();
              // dropped.remove();
              // this.replaceWith(dropped);
              this.replaceWith(clone);  
              // editor.UndoManager.stop();

              // this.parent().components(clone);
              // editor.UndoManager.remove(this.parent())
              
              // editor.UndoManager.start();
            }
          }
        });
      },
    },
  });
};
