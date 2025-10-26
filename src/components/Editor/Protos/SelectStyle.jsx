import React, { useState } from "react";
import { Select } from "./Select";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";

/**
 *
 * @param {{cssProp:string , wrap :boolean, splitHyphen : boolean , placeholder:string , label:string , keywords:string[] , setKeyword:(keyword : string)=>void , debs:any[]}} param0
 * @returns
 */
export const SelectStyle = ({
  cssProp,
  wrap = false,
  splitHyphen = false,
  label,
  keywords,
  placeholder='',
  setKeyword=(_)=>{},
  debs=[],
}) => {
  const setClass = useSetClassForCurrentEl();
  const [val , setVal] = useState('');

  useUpdateInputValue({setVal , cssProp , debs});

  const onInput = (value) => {
    setVal(value);
    // setKeyword(ev.target.value);
    // filterKeywords(ev); 
    setClass({
      cssProp,
      value,
    });
  };

  const onItemClicked = (item) => {
    setVal(item);
    console.log(item);
    

    setClass({
      cssProp,
      value: item,
    });
  };

  const onEnterPress = (keyword) =>{
    setVal(keyword);
    
    setClass({
      cssProp,
      value: keyword,
    });
  }

  return (
    <section>
      <Select
        label={label}
        splitHyphen={splitHyphen}
        placeholder={placeholder}
        className=" bg-slate-800"
        keywords={keywords}
        wrap={wrap}
        setKeyword={setKeyword}
        onInput={onInput}
        onItemClicked={onItemClicked}
        onEnterPress={onEnterPress}
        value={val}
        // setVal={setVal}
      />
    </section>
  );
};

// console.log(`fileds-dsad_99.lol.tft`.split(/\.\w+/ig));
