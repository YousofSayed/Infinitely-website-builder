/** @jsxImportSource react */
import React, { memo, useEffect, useRef, useState, useTransition } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { addClickClass, uniqueID } from "../../../helpers/cocktail";
import { Input } from "./Input";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { FitTitle } from "./FitTitle";
import { db } from "../../../helpers/db";
import { getProjectData } from "../../../helpers/functions";
import { current_project_id } from "../../../constants/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 *
 * @param {{color:string , setColor:Function , onEffect : (color:string , setColor:Function)=>void}} param0
 * @returns
 */
export const ColorPicker = memo(
  ({ color = "", setColor, onEffect = (_1, _2) => {} }) => {
    const [showHexColor, setShowHexColor] = useState(false);
    const [savedColors, setSavedColors] = useState([]);
    const [width, setWidth] = useState(0);
    const [animate] = useAutoAnimate();
    const hexColorRef = useRef();

    /**
     * @type {{current:HTMLElement}}
     */
    const colorPickerContainerRef = useRef();
    const [isPending, setTransition] = useTransition();

    useEffect(()=>{
      if(!hexColorRef.current)return;
      hexColorRef.current && animate(hexColorRef.current);
    },[hexColorRef])

    /**
     * @type {{current:HTMLElement}}
     */
    useEffect(() => {
      if (hexColorRef.current) {
        hexColorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, [showHexColor]);

    useEffect(() => {
      const hideColorPicker = () => {
        setShowHexColor(false);
      };
      document.addEventListener("click", hideColorPicker);

      return () => {
        document.removeEventListener("click", hideColorPicker);
      };
    });

    // useEffect(() => {
    //   onEffect(color, setColor);
    // }, [color]);

    useEffect(() => {
      if (!colorPickerContainerRef || !colorPickerContainerRef.current) return;
      const resizableObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          setWidth(entry.target.clientWidth - 10);
        });
      });
      const el = colorPickerContainerRef.current.parentNode.parentNode;
      resizableObserver.observe(el);

      setWidth(el.clientWidth - 10);
      console.log(
        "colorPickerContainerRef.current.parentNode.clientWidth - 10",
        el.clientWidth - 10
      );

      return () => {
        resizableObserver.disconnect();
      };
    }, []);

    useLiveQuery(async () => {
      const savedColors = await (await getProjectData())?.colors;
      if (!savedColors) return;
      setSavedColors(savedColors);
    });

    return (
      <section ref={colorPickerContainerRef} className="relative ">
        <button
          className={`w-[30px] h-[30px] shadow-md shadow-gray-950 rounded-lg border-[2.3px] border-slate-600  bg-slate-900 cursor-pointer`}
          onClick={(ev) => {
            ev.stopPropagation();
            colorPickerContainerRef.current.click();
            setTransition(() => {
              setShowHexColor(!showHexColor);
            });
          }}
          style={{ backgroundColor: color }}
        ></button>
        {showHexColor && (
          <section
            style={{
              width: `${width - 5}px`,
              maxWidth: `370px`,
            }}
            className={` max-w-[370px] absolute left-[0] z-[60]  top-[calc(100%+5px)] flex flex-col h-[400px] shadow-md shadow-slate-950 `}
            ref={hexColorRef}
          >
            <HexAlphaColorPicker
              id="color_picker"
              color={color}
              // className="overflow-hidden"
              style={
                {
                  // backgroundColor:'blue',
                  // position: "relative !important",
                  // padding: "10px",
                }
              }
              className="relative bg-slate-800 "
              onClick={(ev) => {
                ev.stopPropagation();
              }}
              onChange={(color) => {
                // setShowHexColor(true);
                // console.log("color : ", color);
                if (color.toLowerCase().includes("nan")) return;
                setColor(color);
                onEffect(color, setColor);
              }}
            ></HexAlphaColorPicker>
            <section
              onClick={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
              }}
              id="colors"
              style={{
                height : Boolean(savedColors.length) ? '250px' : ''
              }}
              className="transition-all absolute flex flex-col gap-2 top-[195px] rounded-bl-lg rounded-br-lg p-2 pt-[13px] bg-slate-800 shadow-md shadow-slate-950  w-full z-[70] "
            >
              <header className="flex justify-between gap-2 bg-slate-900 p-2 rounded-lg">
                <FitTitle className="w-full flex justify-center items-center">
                  Save
                </FitTitle>
                <div
                  className="p-3  w-[120px] rounded-lg"
                  style={{ backgroundColor: color }}
                ></div>
                <SmallButton
                  className="w-[30px!important] h-[30px]  bg-slate-800 "
                  tooltipTitle="Save Color"
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    const projectId = +localStorage.getItem(current_project_id);
                    const projectData = await getProjectData();
                    !projectData?.colors && (projectData.colors = []);
                    projectData.colors.push(color);
                    await db.projects.update(projectId, {
                      colors: [...new Set(projectData.colors)],
                    });
                    console.log(ev.target, this);

                    (ev.currentTarget || ev.target.parentElement).blur();
                  }}
                >
                  {Icons.plus("white")}
                </SmallButton>
              </header>

              {Boolean(savedColors.length) && (
                <main className=" p-2 h-full overflow-auto bg-slate-900 rounded-lg  ">
                  <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(30px,1fr))] gap-2 h-fit">
                    {savedColors.map((savedColor, i) => (
                      <button
                        key={i}
                        className="h-[30px] rounded-lg border-[2.2px] border-slate-600 hover:border-blue-500  transition-all "
                        style={{
                          backgroundColor: savedColor,
                          borderColor: savedColor == color ? "#3b82f6" : null,
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          ev.preventDefault();
                          addClickClass(ev.currentTarget, "click");
                          // if (color.toLowerCase().includes("nan")) return;
                          setColor(savedColor);
                          onEffect(savedColor, setColor);
                        }}
                      ></button>
                    ))}
                  </div>
                </main>
              )}
            </section>
          </section>
        )}
      </section>
    );
  }
);
