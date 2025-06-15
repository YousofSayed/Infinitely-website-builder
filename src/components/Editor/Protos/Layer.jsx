import React, { memo, useEffect, useState } from "react";
import { Icons } from "../../Icons/Icons";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { sharedLayerState } from "../../../helpers/atoms";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { addClickClass, uniqueID } from "../../../helpers/cocktail";
import { OptionsButton } from "../../Protos/OptionsButton";
import { Tooltip } from "react-tooltip";

/**
 *
 * @param {{layers:import('grapesjs').Component[] , setLayers:Function ,wrapperId:string ,layer:import('grapesjs').Component , className:string , style : CSSStyleDeclaration}} param0
 * @returns
 */
export const Layer = ({
  layer,
  layers,
  setLayers,
  wrapperId,
  style = {},
  className = "",
}) => {
  const [layersStt, setLayerStt] = useState(layers);
  const [isOpentNested, setOpenNested] = useState(false);
  const [selected, setSelected] = useState(false);
  const [selectedEl, setSelectedEl] = useState();
  const sharedLayer = useRecoilValue(sharedLayerState);
  const setSharedLayer = useSetRecoilState(sharedLayerState);
  const editor = useEditorMaybe();
  const [tools, setTools] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLayerStt(layers);
  }, [layers]);

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
    const sleCallback = () => {
      const sle = editor.getSelected();
      const childs = layer.forEachChild((child) => {
        const cond = Boolean(editor.getSelected().getId() == child.getId());
        console.log("from open  cond: ", cond);

        setOpenNested(cond);
      });
      if (sle.getId() == layer.getId()) {
        setSelected(true);
        setSelectedEl(sle);
      } else {
        setSelected(false);
        setSelectedEl(null);
      }
    };
    // console.log(editor.getSelected().toolbar);

    editor.on("component:selected", sleCallback);
    return () => {
      editor.off("component:selected", sleCallback);
    };
  }, []);

  useEffect(() => {
    if (!editor || !editor?.getSelected?.()) return;
    console.log("layer should work");
 const childs = layer.forEachChild(child=>{
      const cond = Boolean(editor.getSelected().getId() == child.getId())
      console.log('from open  cond: ',cond);
      
      setOpenNested(cond)
    });
    setSelected(
      editor?.getSelected?.() && editor.getSelected().getId() == layer.getId()
        ? true
        : false
    );
  }, [editor]);

  useEffect(() => {
    const callbackSelected = () => {
      setTools(editor.getSelected().toolbar);
      // console.log(editor.getSelected().toolbar);
    };
    const callbackDeSelected = () => {
      setTools([]);
    };

    editor.on("component:selected", callbackSelected);
    editor.on("component:deselected", callbackDeSelected);

    return () => {
      editor.off("component:selected", callbackSelected);
      editor.off("component:deselected", callbackDeSelected);
    };
  }, []);

  const openNested = () => {
    setOpenNested(!isOpentNested);
  };

  /**
   *
   * @param {DragEvent} ev
   */
  const removeOpacity = (ev) => {
    ev.currentTarget.style.opacity = 0;
  };

  const addOpacity = (ev) => {
    ev.currentTarget.style.opacity = 0.7;
  };

  const getLayerLength = (layer) => {
    return layer
      .components()
      .models.filter((lyr) => lyr.getName().toLowerCase() != "box").length;
  };

  const dropCallback = ({ isAfter = false, ev }) => {
    removeOpacity(ev);
    const movedCmp = editor.getWrapper().find(`#${sharedLayer.id}`)[0];
    if (layer.getId() == sharedLayer || layer.isChildOf(movedCmp)) {
      toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
      return;
    }
    const index = layer.index();
    const parent = layer.parent().components();
    const sympolInfo = editor.Components.getSymbolInfo(movedCmp);
    // const oldId = movedCmp.getId();
    const instance = sympolInfo.isSymbol
      ? editor.Components.addSymbol(movedCmp)
      : movedCmp;
    movedCmp.remove();
    parent.add(instance, { at: isAfter ? index + 1 : index });
    instance.setId(uniqueID());

    !layer.components().models.length && setOpenNested(false);
    setLayers(
      editor
        .getWrapper()
        .components()
        .models.filter((lyr) => lyr.getName().toLowerCase() != "box")
    );
  };

  return (
    <section
      id={layer.getId()}
      className={` flex flex-col  gap-2  items-center justify-between mb-1 rounded-lg   border-transparent transition-all  `}
    >
      <section
        draggable={true}
        onDragOver={(ev) => {
          ev.preventDefault();
        }}
        onDrag={(ev) => {
          setSharedLayer({ id: layer.getId(), setState: setOpenNested });
        }}
        onMouseOver={(ev) => {
          ev.stopPropagation();
          editor.Layers.setLayerData(layer, { hovered: true });
        }}
        onMouseLeave={(ev) => {
          ev.stopPropagation();
        }}
        onClick={(ev) => {
          const el = ev.currentTarget;
          setSelected(!selected);

          !selected
            ? editor.Layers.setLayerData(layer, { selected: true })
            : editor.Layers.setLayerData(layer, { selected: false });

          const desCb = () => {
            editor.off("component:deselected", desCb);
            setSelected(false);
          };
          editor.on("component:deselected", desCb);
        }}
        style={{ ...style, background: selected ? "#2563eb " : "" }}
        className={`group layer relative flex items-center justify-between w-full  p-3 rounded-md
          transition-all hover:bg-slate-800 
          
          ${
            isOpentNested && getLayerLength(layer)
              ? "bg-slate-800"
              : "bg-slate-950"
          } ${className ? className : "bg-slate-800"} `}
      >
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
          className="absolute left-0 top-0 w-full h-[15px] rounded-tl-lg rounded-tr-lg bg-blue-600 opacity-[0] transition-all"
        ></div>

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
          className="absolute left-0 bottom-[0] w-full h-[15px] rounded-bl-lg rounded-br-lg bg-blue-600 z-[1] opacity-[0] transition-all"
        ></div>

        <div
          id="inside"
          onDragOver={(ev) => {
            addOpacity(ev);
          }}
          onDragLeave={(ev) => {
            removeOpacity(ev);
          }}
          onDragEnd={(ev) => {
            console.log(ev.currentTarget);

            removeOpacity(ev);
          }}
          onDragExit={(ev) => {
            console.log(ev.currentTarget);
          }}
          onDrop={(ev) => {
            removeOpacity(ev);
            const movedCmp = editor.getWrapper().find(`#${sharedLayer.id}`)[0];
            if (layer.getId() == sharedLayer || layer.isChildOf(movedCmp)) {
              toast.warn(<ToastMsgInfo msg={"Not allowed"} />);
              return;
            }
            const parent = layer.components();
            const movedCmpParent = movedCmp.parent();

            const sympolInfo = editor.Components.getSymbolInfo(movedCmp);
            const instance = sympolInfo.isSymbol
              ? editor.Components.addSymbol(movedCmp)
              : movedCmp;
            movedCmp.remove();
            parent.add(instance, { at: 0 });

            !movedCmpParent.components().models.length
              ? sharedLayer.setState(false)
              : null;
          }}
          className="absolute left-0 bottom-[0] w-[85%] h-[15px] rounded-bl-lg rounded-br-lg bg-blue-500 z-[2] opacity-[0]  transition-all"
        ></div>

        <section className="flex gap-2 items-center">
          {!!layer
            .components()
            .models.filter((lyr) => lyr.getName().toLowerCase() != "box")
            .length && (
            <button
              className={`${
                isOpentNested && "rotate-[360deg]"
              } transition-all rotate-[270deg]`}
              onClick={(ev) => {
                ev.stopPropagation();
                openNested();
              }}
            >
              {Icons.arrow(selected ? "white" : "")}
            </button>
          )}

          <section className="flex gap-2 items-center">
            {layer.getIcon() ? (
              <i dangerouslySetInnerHTML={{ __html: layer.getIcon() }}></i>
            ) : null}

            <p
              className={` select-none  text-slate-200 font-semibold capitalize`}
            >
              {layer.getName()}
            </p>
          </section>
        </section>

        <section
          className={`flex gap-2 items-center drag-icon-btn`}
          onClick={(ev) => {
            ev.stopPropagation();
            editor.select(null);
            editor.trigger("component:deselected");
          }}
        >
          <>
            <a
              id={`${layer.getId()}-tb`}
              className="cursor-pointer w-[30px] h-full flex justify-center items-center [&:hover_svg]:fill-white"
              onClick={(ev) => {
                ev.stopPropagation();
                addClickClass(ev.currentTarget, "click");
                document.body.click();
                setIsOpen(!isOpen);
                // editor.select(layer , {scroll:true});
                // editor.select(layer.)
                console.log("tools : ", tools, layer.toolbar);
                setTools(layer.toolbar);
                editor.Layers.setLayerData(layer, { selected: true });
              }}
            >
              {Icons.options({
                fill: "#64748B",
                ...(selected && { fill: "white" }),
              })}
            </a>
            <Tooltip
              isOpen={isOpen}
              opacity={1}
              clickable
              anchorSelect={`#${layer.getId()}-tb`}
              className="bg-[#1e293b!important] flex flex-col  shadow-lg bg-slate-800 z-[5000]"
              // float={true}
              // openEvents={{click:true}}
              // role="article"
              place="right-end"
              openOnClick
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
                      console.log("what happen?");

                      addClickClass(ev.currentTarget, "click");
                      // copyCmds();
                      typeof tool.command === "string"
                        ? editor.runCommand(tool.command)
                        : tool.command(editor);
                    }}
                    className="flex h-full items-center gap-2 cursor-pointer transition-all hover:bg-blue-500 font-semibold p-2 rounded-lg"
                  >
                    <i
                      className="w-[100%] [&_svg]:w-[20px] text-white flex justify-center items-center"
                      // onClick={(ev) => {
                      //   ev.stopPropagation();
                      // }}
                      dangerouslySetInnerHTML={{ __html: tool.label }}
                    ></i>
                    {/* <span></span> */}
                  </span>
                );
              })}
            </Tooltip>
          </>

          <button className="cursor-grab ">
            {Icons.drag({ fill: selected ? "white" : undefined })}
          </button>
        </section>
      </section>

      {layer.components().models.length && isOpentNested ? (
        <section
          style={{
            width: layer.parents().length
              ? `calc(100% -  ${layer.components().models.length}px)`
              : `100%`,
          }}
          className={`child flex ${
            isOpentNested &&
            "border-l-2 border-l-slate-600 hover:border-l-blue-600 rounded-bl-lg  pl-[8px]"
          } flex-col self-end justify-end  transition-all `}
        >
          {layer
            .components()
            .models.filter((lyr) => lyr.getName().toLowerCase() != "box")
            .map((lyr, i) => {
              return (
                <Layer
                  className={`w-full self-end ml-5`}
                  // style={{
                  //   // marginLeft:lyr.parents().length? `${lyr.parents().length + 85}px`:`0`,
                  //   width: lyr.parents().length
                  //     ? `calc(100% -  ${lyr.parents().length * 10}px)`
                  //     : `100%`,
                  // }}
                  layer={lyr}
                  key={lyr.getId()}
                  layers={layers}
                  setLayers={setLayers}
                />
              );
            })}
        </section>
      ) : null}
    </section>
  );
};
