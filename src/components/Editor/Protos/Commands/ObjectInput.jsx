import React, { useState } from "react";
import { SmallButton } from "../SmallButton";
import { Icons } from "../../../Icons/Icons";
import { Input } from "../Input";
import { Select } from "../Select";
import { useRecoilValue } from "recoil";
import { varsState } from "../../../../helpers/atoms";
import { hsZoo } from "../../../../constants/hsValues";
import { evalObject, replaceLastWord } from "../../../../helpers/functions";
import { DetailsNormal } from "../../../Protos/DetailsNormal";

export const ObjectInput = ({
  obj = {},
  setObject,
  onAddClick = (ev, key, value) => {},
  onDelete = (ev, key, value) => {},
  keywords = [],
  isRelative = false,
}) => {
  //   const [obj, setObj] = useState({
  //     name: "yousef",
  //     age: 22,
  //     wife: "not-yet 😥 😥😥😥😥😥😥",
  //   });
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const vars = useRecoilValue(varsState);

  // console.log('objeeeee  : ' , evalObject(obj) , obj);

  return (
    <main className="w-full flex flex-col gap-2 ">
      <header className="relative w-full flex gap-2">
        <section className="w-full flex gap-2 text-white font-bold justify-between ">
          <Input
            value={key}
            className="w-full bg-slate-900"
            type="text"
            placeholder="Key"
            onInput={(ev) => {
              setKey(ev.target.value);
            }}
          />
          <span className="self-center">:</span>
          <Select
            value={value}
            keywords={keywords}
            // isTextarea={true}
            isCode
            allowCmdsContext
            codeProps={{
              language: "javascript",
              onChange(value) {
                setValue(value);
              },
            }}
            setValue={setValue}
            isRelative={isRelative}
            className="w-full  bg-slate-900 "
            // inputClassName=""
            type="text"
            placeholder="Value"
            // onInput={(value) => {
            //   setValue(value);
            // }}

            // onEnterPress={(keyword)=>{
            //   console.log('valTest : ' , replaceLastWord(value , keyword));

            //   setValue(replaceLastWord(value , keyword))
            // }}

            // onItemClicked={(keyword)=>{
            //   setValue(replaceLastWord(value , keyword))
            // }}
          />
        </section>
        <SmallButton
          className="flex-shrink-0 bg-slate-900"
          onClick={(ev) => {
            onAddClick(ev, key, value);
            setKey("");
            setValue("");
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </header>

      {!!Object.keys(obj).length && (
        <DetailsNormal label={'data'} className="flex flex-col gap-2 w-full px-1 py-2 border-[2px] rounded-lg border-blue-600 bg-gray-950">
          {Object.keys(obj).map((propKey, i) => {
            return (
              <li
                key={i}
                className="flex gap-2 text-white px-1 font-bold relative"
              >
                <p className="w-full flex items-center overflow-auto text-nowrap bg-slate-900 p-2 rounded-lg text-slate-300">
                  {propKey}
                </p>
                <span className="self-center">:</span>
                <Select
                  isRelative={false}
                  isCode
                  allowCmdsContext
                  codeProps={{
                    value: obj[propKey],
                    onChange(value) {
                      setObject({ ...obj, [propKey]: value });
                    },
                  }}
                  keywords={[...hsZoo, ...vars]}
                  inputClassName=""
                  value={obj[propKey]}
                  className="p-[2px] px-[2px] bg-slate-900"
                >
                  {obj[propKey]}
                </Select>
                <SmallButton
                  onClick={(ev) => {
                    onDelete(ev, propKey, obj[propKey]);
                  }}
                  className="flex-shrink-0 bg-slate-900 shadow-[unset] "
                >
                  {Icons.delete("white")}
                </SmallButton>
              </li>
            );
          })}
        </DetailsNormal>
      )}
    </main>
  );
};
