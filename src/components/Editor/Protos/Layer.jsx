import { sharedLayerState, isLayerSelectedSelector } from "@/helpers/atoms";
import { addClickClass, uniqueID } from "@/helpers/cocktail";
import { initToolbar } from "@/helpers/functions";
import { refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Input } from "@/components/Editor/Protos/Input";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { useSetRecoilState, useRecoilValue, useRecoilCallback } from "recoil";
import { isBoolean, isString } from "lodash";

export const Layer = memo(
  ({
    layerId,
    setLayers,
    layersRef,
    index,
    style = {},
    className = "",
    tick,
  }) => {
    const safeLayerId = useMemo(() => {
      if (!layerId) return "";
      if (typeof layerId === "string") return layerId;
      return layerId?.getId?.() || "";
    }, [layerId]);

    const [isOpentNested, setOpenNested] = useState(false);
    const [tools, setTools] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [layerProps, setLayerProps] = useState({});
    const [showInput, setShowInput] = useState(false);

    // 🚨 PERFORMANCE FIX 1: DO NOT subscribe to sharedLayerState here.
    // Subscribing here causes EVERY layer to re-render 60 times a second while dragging.
    const setSharedLayer = useSetRecoilState(sharedLayerState);

    // Read sharedLayer imperatively ONLY when needed (onDrop)
    const getSharedLayer = useRecoilCallback(
      ({ snapshot }) =>
        () => {
          return snapshot.getLoadable(sharedLayerState).contents;
        },
      [],
    );

    const editor = useEditorMaybe();
    const isSelected = useRecoilValue(isLayerSelectedSelector(safeLayerId));

    const willScrollRef = useRef(refType);
    const nestedLayyersRef = useRef(refType);

    const layer = useMemo(() => {
      if (!editor || !safeLayerId) return;
      const wrapper = editor.getWrapper?.();
      if (!wrapper) return;
      if (safeLayerId === wrapper.getId?.()) return wrapper;
      return (
        editor.Components?.getById?.(safeLayerId) ||
        wrapper.find?.(`#${safeLayerId}`)[0]
      );
    }, [editor, safeLayerId]);

    useEffect(() => {
      if (!layer) return;
      setLayerProps(layer.props?.() || {});
    }, [layer]);

    const childModelsLength = layer?.components?.()?.models?.length || 0;

    const visibleChildren = useMemo(() => {
      if (!layer) return [];
      return layer
        .components()
        .models.filter(
          (lyr) =>
            lyr.props().layerable && lyr.getName().toLowerCase() !== "box",
        );
    }, [layer, childModelsLength, tick]);

    const hasLayerableChildren = visibleChildren.length > 0;

    useEffect(() => {
      const callback = () => {
        setIsOpen(false);
      };
      window.addEventListener("click", callback);
      return () => {
        window.removeEventListener("click", callback);
      };
    }, []);

    useEffect(() => {
      if (!editor || !layer || !safeLayerId) return;
      const openIfAncestorOfSelected = () => {
        const sle = editor.getSelected?.();
        if (!sle) return;
        const selectedId = sle.getId?.();
        if (!selectedId) return;
        if (selectedId === safeLayerId) return;
        const parents = sle.parents?.() || [];
        const isAncestor = parents.some((parent) => {
          return parent?.getId?.() === safeLayerId;
        });
        if (isAncestor) {
          setOpenNested(true);
        }
      };
      openIfAncestorOfSelected();
      editor.on("component:selected", openIfAncestorOfSelected);
      return () => {
        editor.off("component:selected", openIfAncestorOfSelected);
      };
    }, [editor, layer, safeLayerId]);

    useEffect(() => {
      if (!isSelected) {
        setTools([]);
      }
    }, [isSelected]);

    useEffect(() => {
      if (!editor || !isSelected || !layer) return;
      willScrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    }, [editor, isSelected, layer, isOpentNested]);

    const openNested = () => {
      setOpenNested(!isOpentNested);
    };

    const removeOpacity = (ev) => {
      ev.currentTarget.style.opacity = 0;
    };
    const addOpacity = (ev) => {
      ev.currentTarget.style.opacity = 0.7;
    };

    const getLayerLength = (layerModel) => {
      return layerModel
        .components()
        .models.filter((lyr) => lyr.getName().toLowerCase() != "box").length;
    };

    const dropCallback = ({ isAfter = false, ev }) => {
      removeOpacity(ev);
      const draggedBlock = editor.Blocks.getDragBlock();
      const draggedBlockContent = draggedBlock?.getContent?.();

      // Read state imperatively to avoid re-renders
      const sharedLayer = getSharedLayer();

      const movedCmp =
        draggedBlock && draggedBlockContent
          ? draggedBlockContent
          : editor.getWrapper().find(`#${sharedLayer?.id}`)[0];

      if (
        layer.getId() === sharedLayer?.id ||
        (movedCmp && layer.isChildOf(movedCmp))
      ) {
        toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
        return;
      }

      const currentIndex = layer.index();
      const parent = layer.parent().components();
      if (!isAfter && movedCmp && currentIndex == movedCmp?.index?.() + 1) {
        toast.warn("ahahha");
        return;
      }

      const instance = draggedBlockContent ? movedCmp : movedCmp.clone();
      !draggedBlockContent && movedCmp.remove();
      const newCmp = parent.add(instance, {
        at: isAfter ? currentIndex + 1 : currentIndex,
      });
      newCmp.setId(uniqueID());
      !layer.components().models.length && setOpenNested(false);

      setLayers([editor.getWrapper().getId()]);
    };

    if (!layer) return null;
    if (!layer.props().layerable) return null;

    return (
      <section
        id={layer.getId()}
        className={`flex flex-col gap-2 items-center justify-between mb-2 rounded-lg border-transparent`}
      >
        <section
          ref={willScrollRef}
          draggable={true}
          onDragOver={(ev) => {
            ev.preventDefault();
          }}
          onDrag={(ev) => {
            setSharedLayer({
              id: layer.getId(),
              type: layer.getType(),
              setState: setOpenNested,
            });
          }}
          onMouseEnter={(ev) => {
            ev.stopPropagation();
            editor.Layers.setLayerData(layer, { hovered: true });
          }}
          onMouseLeave={(ev) => {
            ev.stopPropagation();
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            if (isSelected) {
              editor.Layers.setLayerData(layer, { selected: false });
            } else {
              editor.Layers.setLayerData(layer, { selected: true });
            }
          }}
          style={{
            ...style,
            background: isSelected ? "#2563eb" : "",
          }}
          className={`group layer relative flex items-center justify-between w-full p-3 rounded-md
          transition-colors duration-150 hover:bg-surface-tertiary
          ${
            isOpentNested && getLayerLength(layer)
              ? "bg-surface-tertiary"
              : "bg-surface-main"
          } ${className ? className : "bg-surface-tertiary"}`}
        >
          {/* Drop before */}
          <div
            id="top"
            onDragOver={(ev) => {
              addOpacity(ev);
            }}
            onDragLeave={(ev) => {
              removeOpacity(ev);
            }}
            onDragEnd={(ev) => {
              removeOpacity(ev);
            }}
            onDrop={(ev) => {
              dropCallback({ ev });
            }}
            className="absolute left-0 top-0 w-full h-[15px] rounded-tl-lg rounded-tr-lg bg-green-500 opacity-[0] transition-opacity"
          ></div>

          {/* Drop after */}
          <div
            id="bottom"
            onDragOver={(ev) => {
              addOpacity(ev);
            }}
            onDragLeave={(ev) => {
              removeOpacity(ev);
            }}
            onDragEnd={(ev) => {
              removeOpacity(ev);
            }}
            onDrop={(ev) => {
              dropCallback({ ev, isAfter: true });
            }}
            className="absolute left-0 bottom-[0] w-full h-[15px] rounded-bl-lg rounded-br-lg bg-green-600 z-[1] opacity-[0] transition-opacity"
          ></div>

          {/* Drop inside */}
          <div
            id="inside"
            style={{
              pointerEvents:
                isBoolean(layerProps.droppable) && layerProps.droppable
                  ? "auto"
                  : isString(layerProps.droppable)
                    ? "auto"
                    : "none",
            }}
            onDragOver={(ev) => {
              addOpacity(ev);
            }}
            onDragLeave={(ev) => {
              removeOpacity(ev);
            }}
            onDragEnd={(ev) => {
              removeOpacity(ev);
            }}
            onDrop={(ev) => {
              removeOpacity(ev);
              if (
                isBoolean(layerProps.droppable) &&
                layerProps.droppable === false
              ) {
                toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
                return;
              }

              const draggedBlock = editor.Blocks.getDragBlock();

              // Read state imperatively to avoid re-renders
              const sharedLayer = getSharedLayer();

              const draggedBlockContent = draggedBlock?.getContent?.();
              const movedCmp = draggedBlockContent
                ? draggedBlockContent
                : editor.getWrapper().find(`#${sharedLayer?.id}`)[0];

              const blockComponentType =
                draggedBlock?.attributes?.content?.type;

              const blockComponentTagName = editor.DomComponents.getTypes(
                blockComponentType,
              ).some((t) =>
                t.model.isComponent(
                  document.createElement(layerProps.droppable),
                  {},
                ),
              );

              const allowedDropComponent = editor.DomComponents.getTypes()
                .map((t) => ({
                  ...(t.model?.getDefaults?.() || {}),
                  id: t.id,
                  type: t.id,
                }))
                .filter(
                  (t) => t?.type === (blockComponentType || movedCmp.getType()),
                )
                .find((t) => t?.tagName === layerProps.droppable);

              const blockComponentIsValidDroppable =
                isString(layerProps.droppable) && allowedDropComponent;

              console.log(
                "blockComponentTagName",
                draggedBlock,
                blockComponentTagName,
                blockComponentType,
                blockComponentIsValidDroppable,
                editor.DomComponents.getTypes().filter(
                  (t) =>
                    t.model?.getDefaults?.()?.type ===
                    (blockComponentType || movedCmp.getType()),
                ),
                // .find(
                //   (t) =>
                //     t.model?.getDefaults?.()?.tagName ===
                //     layerProps.droppable,
                // )
                editor.DomComponents.getTypes().map((t) => ({
                  ...(t.model?.getDefaults?.() || {}),
                  id: t.id,
                })),
                editor.DomComponents.getTypes()
                .map((t) => ({
                  ...(t.model?.getDefaults?.() || {}),
                  id: t.id,
                  type: t.id,
                })),
                blockComponentIsValidDroppable,
                allowedDropComponent,
                layerProps.droppable,
              );
              // return;

              if (!blockComponentIsValidDroppable) {
                toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
                return;
              }

              if (
                !draggedBlockContent &&
                (layer.getId() === sharedLayer?.id ||
                  (movedCmp && layer.isChildOf(movedCmp)))
              ) {
                toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
                return;
              }
              const parent = layer.components();
              const instance = !draggedBlockContent
                ? movedCmp.clone()
                : draggedBlockContent;
              !draggedBlockContent && movedCmp.remove();
              const newCmp = parent.add(instance, { at: 0 });
              const movedCmpParent = newCmp.parent();
              !movedCmpParent.components().models.length
                ? sharedLayer?.setState?.(false)
                : null;
            }}
            className="absolute left-0 bottom-[0] w-[85%] h-[15px] rounded-bl-lg rounded-br-lg bg-purple-500 z-[2] opacity-[0] transition-opacity"
          ></div>

          <section className="flex gap-2 items-center">
            {hasLayerableChildren && (
              <button
                className={`${
                  isOpentNested && "rotate-[360deg]"
                } transition-transform rotate-[270deg]`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  openNested();
                }}
              >
                {Icons.arrow(isSelected ? "white" : "")}
              </button>
            )}
            <section
              className="flex gap-2 items-center"
              onDoubleClick={(ev) => {
                setShowInput(!showInput);
              }}
            >
              {layer.getIcon() ? (
                <i dangerouslySetInnerHTML={{ __html: layer.getIcon() }}></i>
              ) : null}
              {!showInput ? (
                <p
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  className={`select-none custom-font-size text-text-primary font-semibold capitalize`}
                >
                  {layer.getName()}
                </p>
              ) : (
                <Input
                  className="w-[calc(100%-30px)] bg-surface-secondary"
                  onDoubleClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                  }}
                  onDrag={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                  }}
                  onKeyUp={(ev) => {
                    if (ev.key == "Enter") {
                      ev.preventDefault();
                      ev.target.blur();
                    }
                  }}
                  onBlur={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    setShowInput(false);
                  }}
                  value={layer.getName()}
                  onInput={(ev) => {
                    layer.setName(ev.target.value);
                  }}
                />
              )}
            </section>
          </section>

          <section
            className={`flex gap-2 items-center drag-icon-btn ml-2`}
            onClick={(ev) => {
              ev.stopPropagation();
              editor.select(null);
              editor.trigger("component:deselected");
            }}
          >
            {layer.getAttributes?.()?.["hide"] === "true" && (
              <i className="right-[0] top-[-10px]">
                {Icons.hidden({ strokeColor: "white", width: 20 })}
              </i>
            )}
            <a
              id={`${layer.getId()}-tb`}
              className="cursor-pointer w-[30px] h-full flex justify-center items-center [&:hover_svg]:fill-white"
              onClick={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                addClickClass(ev.currentTarget, "click");
                document.body.click();
                // Use functional update to prevent race conditions with the window click listener
                setIsOpen((prev) => !prev);
                editor.Layers?.setLayerData?.(layer, { selected: true });
                if (editor.getSelected() != layer) return;
                initToolbar(editor, editor.getSelected());
                const toolsWillSetted = editor
                  .getSelected()
                  .toolbar.filter((tlb) => tlb.command !== "tlb-move");
                setTools(toolsWillSetted);
              }}
            >
              {Icons.options({
                fill: "#64748B",
                ...(isSelected && { fill: "white" }),
              })}
            </a>

            {/* 🚨 PERFORMANCE FIX 2: Conditionally render Tooltip. 
               It only exists in DOM when open. This means you have exactly ONE tooltip 
               in the DOM at any time, instead of hundreds of hidden tooltips. */}
            {isOpen && !!tools.length && (
              <Tooltip
                isOpen={true}
                opacity={1}
                clickable
                anchorSelect={`#${layer.getId()}-tb`}
                className="bg-[var(--color-surface-main)!important] flex flex-col shadow-lg shadow-slate-900 border-[2px] rounded-[.5rem!important] border-border-default z-[5000]"
                place="right-end"
                closeEvents={{ click: true, blur: true, dblclick: true }}
                globalCloseEvents={{
                  clickOutsideAnchor: true,
                  escape: true,
                  scroll: true,
                  resize: true,
                }}
              >
                {tools.map((tool, i) => {
                  return (
                    <span
                      key={i}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        addClickClass(ev.currentTarget, "click");
                        typeof tool.command === "string"
                          ? editor.runCommand(tool.command)
                          : tool.command(editor);
                      }}
                      className="flex h-full items-center gap-2 cursor-pointer transition-colors hover:bg-blue-500 font-semibold p-2 rounded-lg"
                    >
                      <i
                        className="w-[100%] [&_svg]:w-[20px] text-white flex justify-center items-center"
                        dangerouslySetInnerHTML={{ __html: tool.label }}
                      ></i>
                    </span>
                  );
                })}
              </Tooltip>
            )}

            <button
              style={{
                opacity:
                  !layerProps.draggable && layerProps.type != "wrapper"
                    ? 0.5
                    : 1,
                pointerEvents:
                  !layerProps.draggable && layerProps.type != "wrapper"
                    ? "none"
                    : "auto",
              }}
              className="cursor-grab"
            >
              {Icons.drag({ fill: isSelected ? "white" : undefined })}
            </button>
          </section>
        </section>

        {hasLayerableChildren && isOpentNested ? (
          <section
            style={{
              width: layer.parents().length
                ? `calc(100% - ${layer.components().models.length}px)`
                : `100%`,
            }}
            className={`child flex min-h-full ${
              isOpentNested &&
              "border-l-2 border-l-slate-600 hover:border-l-blue-600 rounded-bl-lg pl-[8px]"
            } flex-col self-end justify-end transition-colors`}
          >
            {/* 🚨 PERFORMANCE FIX 3: Removed million/react <For>. 
               Using standard .map() ensures updates propagate correctly without caching bugs. */}
            {visibleChildren.map((lyr, i) => {
              return (
                <Layer
                  className={`w-full self-end ml-5`}
                  layersRef={layersRef}
                  index={i}
                  layerId={lyr.getId()}
                  key={lyr.getId()}
                  setLayers={setLayers}
                  tick={tick}
                />
              );
            })}
          </section>
        ) : null}
      </section>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.layerId === nextProps.layerId &&
      prevProps.setLayers === nextProps.setLayers &&
      prevProps.layersRef === nextProps.layersRef &&
      prevProps.index === nextProps.index &&
      prevProps.className === nextProps.className &&
      prevProps.tick === nextProps.tick
    );
  },
);
