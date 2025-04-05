import React, { memo, useEffect, useRef, useState, useTransition } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { uniqueID } from "../../../helpers/cocktail";
import { Input } from "./Input";

/**
 *
 * @param {{color:string , setColor:Function , onEffect : (color:string , setColor:Function)=>void}} param0
 * @returns
 */
export const ColorPicker = memo(
  ({ color = "", setColor, onEffect = (_1, _2) => {} }) => {
    const [showHexColor, setShowHexColor] = useState(false);
    const [width, setWidth] = useState(0);
    /**
     * @type {{current:HTMLElement}}
     */
    const colorPickerContainerRef = useRef();
    const [isPending, setTransition] = useTransition();

    /**
     * @type {{current:HTMLElement}}
     */
    const hexColorRef = useRef();
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
          setWidth(entry.target.offsetWidth - 10);
        });
      });
      resizableObserver.observe(colorPickerContainerRef.current.parentNode);

      setWidth(colorPickerContainerRef.current.parentNode.offsetWidth - 10);

      return () => {
        resizableObserver.disconnect();
      };
    }, []);

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
            className={`absolute left-[0] z-[60]  top-[calc(100%+5px)] `}
            ref={hexColorRef}
          >
            <HexAlphaColorPicker
              id="color_picker"
              color={color}
              // className="overflow-hidden"
              style={{
                position: "relative !important",
              }}
              className="relative"
              onClick={(ev) => {
                ev.stopPropagation();
              }}
              onChange={(color) => {
                // setShowHexColor(true);
                console.log("color : ", color);
                if (color.toLowerCase().includes("nan")) return;
                setColor(color);
                onEffect(color, setColor);
              }}
            />

            {/* <div className="rounded-lg p-2 bg-slate-900"  style={{backgroundColor:color}}>dsadas</div> */}
          </section>
        )}
      </section>
    );
  }
);
