import React, { memo, useEffect, useRef, useState, useTransition } from "react";
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
  HslColorPicker,
  HsvaColorPicker,
} from "react-colorful";
import { hexToRgbA, rgbStringToHex } from "../../../helpers/functions";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useCloseMenu } from "../../../hooks/useCloseMenu";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { ColorPicker } from "./ColorPicker";

/**
 *
 * @param {{cssProp:string , placeholder:string , hideOpacityField:boolean ,disableSetClassMethod:boolean , colorState:string ,  onColorChange : (color:string)=>void}} param0
 * @returns
 */
export const Color = memo(
  ({
    cssProp,
    placeholder,
    hideOpacityField = false,
    disableSetClassMethod = false,
    colorState = "",
    onColorChange = (_) => {},
  }) => {
    const setClass = useSetClassForCurrentEl();
    const [color, setColor] = useState(colorState);
    const [showHexColor, setShowHexColor] = useState(false);
    const [isPending, setTransition] = useTransition();
    const selectedEl = useRecoilValue(currentElState);
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

    useCloseMenu(hexColorRef, setShowHexColor);

    !disableSetClassMethod &&
      useUpdateInputValue({
        cssProp,
        onEffect(cssProp, value) {
          setColor(rgbStringToHex(value) || value);
        },
      });

    return (
      <section
        className={`relative flex justify-between items-center bg-slate-800 w-full ${
          hideOpacityField ? "p-1 gap-2" : "p-2"
        } rounded-lg`}
      >
        <ColorPicker
          color={color}
          setColor={setColor}
          onEffect={(color, setColor) => {
            if (!color) return;
            !disableSetClassMethod &&
              setClass({
                cssProp,
                value: color,
              });

            onColorChange(color);
          }}
        />

        <input
          placeholder={placeholder}
          onFocus={(ev) => {
            ev.target.select();
          }}
          onInput={(ev) => {
            !disableSetClassMethod &&
              setClass({
                cssProp,
                value: ev.target.value,
              });
            onColorChange(color);
            setColor(ev.target.value);
          }}
          className={`bg-slate-900 shadow-inner shadow-gray-950 p-2 outline-none text-center text-slate-200 font-semibold ${
            hideOpacityField ? "w-[calc(100%-30px)]" : "w-[50%]"
          } rounded-lg`}
          type="text"
          value={color}
        />

        {!hideOpacityField && (
          <p
            className={`w-[20%] p-2 text-slate-200 text-[14px] font-bold flex justify-center items-center rounded-lg  bg-slate-900`}
          >
            {hexToRgbA(color || "").opacity}
          </p>
        )}
      </section>
    );
  }
);
