import React, { useEffect, useRef, useState } from "react";
import { refType } from "../../../helpers/jsDocs";

// million-ignore
/**
 * A small button component with customizable styles and click behavior.
 * @typedef {Object} Props - Component props
 * @property {string} className - Custom CSS class for the button.
 * @property {Function} onClick - Callback function for button click.
 * @property {boolean} showTooltip - Show popover on button click.
 * @property {string} tooltipTitle
 * @property {ReactNode} children - Child components to render inside the button.
 * @param {React.InputHTMLAttributes<HTMLInputElement> & Props} props
 */
export const Input = ({
  // type = "text",
  // autoFocus = false,
  className = "",
  placeholder = "",
  value = "",
  onInput = (_) => {},
  onChange = (_) => {},
  onKeyUp = (ev) => {},
  onKeyDown = (ev) => {},
  ...props
}) => {
  const [val, setVal] = useState(value);
  const inpRef = useRef(refType);

  useEffect(() => {
    setVal(value != undefined ? value : "");
  }, [value]);

  // useEffect(() => {
  //   if (!inpRef.current) return;
  //   const callback = (e) => {
  //     console.log("undo/redo prevented (before)", e);

  //     if (e.inputType === "historyUndo" || e.inputType === "historyRedo") {
  //       e.preventDefault();
  //       console.log("undo/redo prevented");
  //     }
  //   };

  //   inpRef.current.addEventListener("beforeinput", callback, { capture: true });
  //   return () => {
  //     inpRef.current?.removeEventListener?.("beforeinput", callback, {
  //       capture: true,
  //     });
  //   };
  // }, [inpRef]);

  return (
    <input
      {...props}
      // autoFocus={autoFocus}
      // type={type}
      ref={inpRef}
      value={val}
      placeholder={placeholder}
      className={`p-2 outline-none text-white border-2 border-transparent focus:border-blue-600  rounded-lg  ${
        className ? className : "bg-slate-950"
      }`}
      onInput={(ev) => {
        setVal(ev.target.value);
        onInput(ev);
      }}
      onChange={(ev) => {
        setVal(ev.target.value);
        onChange(ev);
      }}
      onKeyUp={onKeyUp}
      onKeyDown={(ev) => {
        const isSave =
          (ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() == "s";
        if (isSave) ev.preventDefault();
        onKeyDown(ev);
      }}
    />
  );
};
