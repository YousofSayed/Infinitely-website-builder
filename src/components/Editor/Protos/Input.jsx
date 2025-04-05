import React, { useEffect, useState } from "react";

/**
 *
 * @param {{type : string , value:string , autoFocus:boolean, className:string , placeholder:string , onInput:(ev:InputEvent)=>void , onChange:(ev:InputEvent)=>void , onKeyUp: (ev:KeyboardEvent)=>void  , onKeyDown:(ev:KeyboardEvent)=>void} } param0
 * @returns
 */
export const Input = ({
  type = "text",
  autoFocus = false,
  className = "", 
  placeholder = "",
  value = "",
  onInput = (_) => {},
  onChange = (_) => {},
  onKeyUp = (ev) => {},
  onKeyDown = (ev) => {},
}) => {
  const [val, setVal] = useState(value);

 
    useEffect(() => {
    setVal(value != undefined ? value : "");
    }, [value]);

  return (
    <input
      autoFocus={autoFocus}
      type={type}
      value={val}
      placeholder={placeholder}
      className={`p-2 outline-none text-white border-2 border-transparent focus:border-blue-600  rounded-lg ${className}`}
      onInput={(ev) => {
        setVal(ev.target.value);
        onInput(ev);
      }} 
      onChange={(ev) => {
        setVal(ev.target.value); 
        onChange(ev);
      }}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
    />
  );
};
