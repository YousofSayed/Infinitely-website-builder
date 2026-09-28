import { Input } from "@/components/Editor/Protos/Input";
import React, { useState } from "react";

export const ContentEditable = ({
  children,
  showInput = false,
  setShowInput,
  value,
  onInput,
}) => {
  // const [showInput, setShowInput] = useState(showState);
  return (
    <>
      {!showInput ? (
        [children]
      ) : (
        <Input
          className="w-[calc(100%-30px)] bg-surface-secondary"
          placeholder={value}
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
          value={value}
          onInput={(ev) => {
            onInput?.(ev);
          }}
        />
      )}
    </>
  );
};
