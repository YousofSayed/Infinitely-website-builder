import React, { memo } from "react";
import { Icons } from "../../Icons/Icons";
import { useRecoilValue } from "recoil";
import { refsStt, searchWord } from "../../../helpers/atoms";
import { stringify } from "../../../helpers/cocktail";
import { P } from "../../Protos/P";

/**
 *
 * @param {{content:string ,inner:string, name:string,classes:string}} param0
 * @returns
 */
export const Element = ({ content='', inner='default', name ='', classes='text-red-600' , cssText = "",attrs={} }) => {
  const searchW = useRecoilValue(searchWord);
  return (
    <div
      draggable={true}
      onDragStart={(ev) => {
        const dataModel = {
          tagType: content.toLowerCase(),
          inner,
          oldId: "",
          classes,
          cssText,
          attrs:{editable:true, draggable:true},
        };

        ev.dataTransfer.setData(
          "application/json",
          JSON.stringify(dataModel)
        );
        localStorage.setItem('elData',JSON.stringify(dataModel));
      }}
      className={`${
        content.toLowerCase().includes(searchW.toLowerCase()) ||
        name.toLowerCase().includes(searchW.toLowerCase())
          ? ""
          : "hidden"
      } group h-[90px] bg-slate-800 border-[1.5px] border-slate-400 rounded-lg flex items-center  justify-center flex-col gap-[15px]`}
    >
      {Icons.code()}
      <P className="font-semibold text-white custom-font-size mb-[10px]">
      {name || content.toLowerCase()}
      </P>

    </div>
  );
};
