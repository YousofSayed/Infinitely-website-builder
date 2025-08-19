import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { layersType, refType } from "../../../helpers/jsDocs";
import { uniqueID } from "../../../helpers/cocktail";
import { Layer } from "./Layer";
import { Virtuoso } from "react-virtuoso";
import { VirtosuoVerticelWrapper } from "../../Protos/VirtosuoVerticelWrapper";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const Layers = memo(() => {
  const editor = useEditorMaybe();
  const layerSecRef = useRef(refType);
  const [layers, setLayers] = useState(layersType);
  const [animtedRef] = useAutoAnimate();
  useEffect(() => {
    if (!editor) return;
    console.log("layers");

    const newLayers = () =>
      editor
        .getWrapper()
        .components()
        .models.filter((lyr) => {
          console.log(lyr.props());

          return lyr.props().layerable && lyr.getName().toLowerCase() != "box";
        });

    // setLayers(newLayers());
    setLayers([editor.getWrapper()]);

    const evCallback = () => setLayers([editor.getWrapper()]);

    editor.on("component:add", evCallback);
    editor.on("component:remove", evCallback);
    editor.on("page:select", evCallback);

    return () => {
      editor.off("component:add", evCallback);
      editor.off("component:remove", evCallback);
    };
  }, [editor]);

  const moveCmps = useCallback(
    /**
     *
     * @param {{oldIndex:number , newIndex:number , wrapper:import('grapesjs').Components}} param0
     */

    ({ oldIndex, newIndex, wrapper }) => {
      const oldCmp = wrapper.at(oldIndex);
      wrapper.remove(oldCmp);
      wrapper.add(oldCmp, { at: newIndex });
    },
    [editor]
  );

  // useEffect(()=>{
  //    if(!showLayers || layerSecRef.current.children.length)return;

  //     layerSecRef.current.appendChild(editor.Layers.render())
  // })
  //[&>:not(:last-child)]:mb-2
  return (
    <section id="layers" className="h-full hideScrollBar" ref={layerSecRef}>
      <main id="layer-wrapper" className="h-full  ">
        <Virtuoso
          ref={animtedRef}
          className="hideScrollBar "
          totalCount={layers.length}
          // components={VirtosuoVerticelWrapper}
          itemContent={(i) => {
            const layer = layers[i];

            return layer.props().layerable ? (
              <Layer
                layers={layers}
                setLayers={setLayers}
                layer={layer}
                key={i}
              />
            ) : null;
          }}
        />
        {/* {layers.map((layer, i) => {
          return (
            // <section
            //   key={layer.cid}
            //   id={layer.id}
            //   className="p-2 select-none rounded-lg flex items-center justify-between bg-slate-800 text-slate-200 mb-2"
            // >
            //   {layer.components().models.length || ""}
            //   <span>{layer.getName().toUpperCase()}</span>
            //   {layer.components().models.length && (
            //     <figure>{Icons.arrow()}</figure>
            //   )}
            //   <figure className="handle cursor-grab">{Icons.plus()}</figure>
            // </section>
            <Layer
              layers={layers}
              setLayers={setLayers}
              layer={layer}
              key={layer.getId()}
            />
          );
        })} */}
      </main>
    </section>
  );
});
