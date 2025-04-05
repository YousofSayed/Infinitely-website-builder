import React, { memo, useEffect, useState } from "react";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { TinyButton } from "./TinyButton";
import { Input } from "./Input";
import { Select } from "./Select";

/**
 *
 * @param {{className:string , itemRef:any, addClassName:string , id:string, delClassName:string, inputClassName:string, emptyInputValueAfterClick:boolean, showSelectMenu:boolean , keywords :string[] , value:string , setVal:(any)=>void , placeholder:string, onAllForSelect:(value:string)=>void, showInput:boolean, onInput:(value:string)=>void, onEnterPress:(value:string)=>void , onItemClicked:(value:string)=>void , onAddClick: (ev : MouseEvent , value:string)=>void , onDeleteClick:(ev : MouseEvent)=>void}} param0
 * @returns
 */

export const Adder = memo(
  ({
    id = "",
    children,
    itemRef,
    className,
    addClassName = "",
    delClassName = "",
    inputClassName = "",
    placeholder = "",
    showInput = false,
    showSelectMenu = false,
    emptyInputValueAfterClick = false,
    keywords = [],
    value,
    onInput = (value) => {},
    onItemClicked = (value) => {},
    onEnterPress = (value) => {},
    onAllForSelect = (value) => {},
    onAddClick = (_) => {},
    onDeleteClick = (_) => {},
  }) => {
    const [val, setVal] = useState(value);
    useEffect(() => {
      console.log("adder st", value);

      setVal(value);
    }, [value]);

    return (
      <section
        id={id}
        ref={itemRef}
        className={`flex w-full flex-col gap-2 p-2 rounded-lg ${
          className ? className : "bg-slate-900"
        } relative`}
      >
        {children ? <section>{children}</section> : null}
        {/* {children} */}
        <section className="flex items-center text-slate-200 font-semibold   justify-end  w-full  gap-2   bottom-[-40px] right-[0]  ">
          {showInput && (
            <input
              className={`p-2 rounded-lg w-[calc(100%-80px)] outline-none border-2 border-transparent focus:border-blue-600 ${
                inputClassName ? inputClassName : "bg-slate-900"
              }`}
              placeholder={placeholder || "Add Value"}
              onInput={(ev) => {
                onInput(ev.target.value);
              }}
            />
          )}

          {showSelectMenu && (
            <Select
              onInput={onInput}
              onEnterPress={onEnterPress}
              onItemClicked={onItemClicked}
              onAll={(value) => {
                onAllForSelect(value);
              }}
              // onEnterPress={()=>{ emptyInputValueAfterClick && setVal("");}}
              // onItemClicked={()=>{ emptyInputValueAfterClick && setVal("");}}
              keywords={keywords}
              className={`${inputClassName} `}
              placeholder={placeholder}
              value={val}
            />
          )}

          <TinyButton
            title="Delete button"
            className={`flex-shrink-0 ${delClassName}`}
            onClick={(ev) => {
              onDeleteClick(ev);
            }}
          >
            {Icons.delete("white")}
          </TinyButton>

          <TinyButton
            title="Add Button"
            className={`flex-shrink-0 ${addClassName}`}
            onClick={(ev) => {
              onAddClick(ev, val);
              emptyInputValueAfterClick && setVal("");
            }}
          >
            {Icons.plus("white")}
          </TinyButton>
        </section>
      </section>
    );
  }
);
