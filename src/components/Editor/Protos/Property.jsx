import React, { useEffect, useRef, useState } from "react";
import { P } from "../../Protos/P";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentElState,
  ifrDocument,
  undoAndRedoStates,
} from "../../../helpers/atoms";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import {
  onFocus,
  onInput,
  onKeyDown,
  onKeyUp,
} from "../../../helpers/propertyInputHandlers";
import { useEditor, useEditorMaybe } from "@grapesjs/react";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { FitTitle } from "./FitTitle";
import { Input } from "./Input";

/**
 *
 * @param {{label:string,  placeholder:string, cssProp:string , sectionClassName:string ,inputClassName:string , allowText:boolean , wrap:boolean , special:boolean}} param0
 * @returns
 */
export const Property = ({
  label,
  cssProp,
  sectionClassName = "",
  inputClassName = "",
  placeholder = "",
  allowText = false,
  wrap = false,
  special = false,
}) => {
  const currentElObj = useRecoilValue(currentElState);
  const ifrDocumentVal = useRecoilValue(ifrDocument);
  const setClass = useSetClassForCurrentEl();
  const setUndoAndRedoStatesVal = useSetRecoilState(undoAndRedoStates);
  const [val, setVal] = useState("");
  const isCurrentELChange = useRef(false);
  const editor = useEditorMaybe();

  useUpdateInputValue({ setVal, cssProp });

  // useEffect(() => {
  //   if ( currentElObj.currentEl) {
  //     setVal(editor.getSelected().getStyle()[cssProp] || '');

  //   //   const styleElement =
  //   //     ifrDocumentVal.head.querySelector("#elements-classes");
  //   //   const prop =
  //   //     getOriginalCSSValue(currentElObj.currentEl, styleElement, cssProp) ||
  //   //     "";

  //   //   const valWithoutText = +parseInt(
  //   //     getPropVal(currentElObj.currentEl, cssProp)
  //   //   )
  //   //     ? +parseInt(getPropVal(currentElObj.currentEl, cssProp))
  //   //     : 0;
  //   //   const finalVal = allowText
  //   //     ? getPropVal(currentElObj.currentEl, cssProp)
  //   //     : Math.round(valWithoutText);

  //   //   setVal(prop);
  //   }
  // }, [currentElObj]);

  return (
    <section
      className={`${sectionClassName} flex flex-col ${
        wrap && "flex-wrap gap-3 py-2"
      } gap-2  bg-slate-800 p-1 rounded-lg`}
    >
      {label ? (
        <FitTitle className="capitalize flex items-center  justify-center custom-font-size w-fit flex-shrink-0  overflow-hidden text-ellipsis ">
          {label}{" "}
        </FitTitle>
      ) : (
        ""
      )}
      <Input
        autoCorrect="off"
        className={`${
          inputClassName ? inputClassName : `${wrap ? "w-full" : "w-full"}`
        } h-full   font-semibold bg-slate-900 rounded-lg px-2 py-2 outline-none border-2 border-transparent focus:border-blue-600 transition-colors text-white`}
        type={special ? "number" : "text"}
        value={val}
        placeholder={placeholder || label}
        onFocus={(ev) => {
          onFocus({
            ev,
            setUndoAndRedoStatesVal,
          });
        }}
        onKeyUp={(ev) => {
          onKeyUp({ ev, isCurrentELChange });
        }}
        onInput={(ev) => {
          onInput({
            ev,
            isCurrentELChange,
            setClass,
            setVal,
            special,
            currentElObj,
            cssProp,
          });
        }}
        onKeyDown={(ev) => {
          onKeyDown({ ev, setClass, setVal, isCurrentELChange, cssProp });
        }}
      />
    </section>
  );
};
