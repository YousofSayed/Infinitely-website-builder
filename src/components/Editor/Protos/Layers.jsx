import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { layersType, refType } from "@/helpers/jsDocs";
import { Layer } from "@/components/Editor/Protos/Layer";
import { useEditorMaybe } from "@grapesjs/react";
import { For } from "million/react";
import React, { memo, useEffect, useRef, useState } from "react";

// million-ignore

/**
 * PERFORMANCE NOTES:
 *
 * - We store layer ids, not component objects.
 * - We do NOT pass the whole layers array into every Layer.
 * - Layer is memoized and only receives stable props.
 */
export const Layers = memo(() => {
  const editor = useEditorMaybe();

  const layerSecRef = useRef(refType);
  const layerstRef = useRef(refType);

  const [layers, setLayers] = useState(layersType);
const [tick, setTick] = useState(0);


  useEffect(() => {
    if (!editor) return;
    let layerFrame = 0;

    const updateLayers = () => {
      cancelAnimationFrame(layerFrame);
      layerFrame = requestAnimationFrame(() => {
        // alert("update layers");
        setLayers([editor.getWrapper().getId()]);
        setTick(tick => tick + 1);
      });
    };

    updateLayers();

    editor.on("component:add", updateLayers);
    editor.on("component:remove", updateLayers);
    editor.on("page:select", updateLayers);
    editor.on(InfinitelyEvents.layers.update, updateLayers);

    return () => {
        cancelAnimationFrame(layerFrame);
      editor.off("component:add", updateLayers);
      editor.off("component:remove", updateLayers);
      editor.off("page:select", updateLayers);
      editor.off(InfinitelyEvents.layers.update, updateLayers);
    };
  }, [editor]);

  return (
    <section id="layers" className="h-full hideScrollBar" ref={layerSecRef}>
      <main id="layer-wrapper" className="h-full">
        <For each={layers} >
          {(item, i) => {
            const layerId = item;

            return (
              <Layer
                setLayers={setLayers}
                layerId={layerId}
                layersRef={layerstRef}
                index={i}
                key={layerId}
                tick={tick}
              />
            );
          }}
        </For>
      </main>
    </section>
  );
});
