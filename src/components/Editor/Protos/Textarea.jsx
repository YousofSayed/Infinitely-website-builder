import React, { useEffect, useState } from "react";

export const Textarea = ({
  className = "",
  value = "",
  placeholder='',
  onInput = (ev) => {},
}) => {
  const [val, setVal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setVal(value);
  }, [value]);
  return (
    <textarea
      value={val}
      spellCheck={false}
      placeholder={placeholder}
      onResize={()=>{
        console.log('resizeTo');
        
      }}
      onInput={(ev) => {
        setVal(ev.target.value);
        onInput(ev);
      }} 
      className={`p-2 resize-y rounded-lg h-full min-h-[100%] z-[5] hideScrollBar text-slate-200 border-2 outline-none  focus:border-blue-600 border-transparent ${className}`}
    ></textarea>
  );
};
