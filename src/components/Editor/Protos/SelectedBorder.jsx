import React from "react";
import { addClickClass } from "../../../helpers/cocktail";

export const SelectedBorder = ({
  borderName,
  borderDir,
  option,
  setOption,
}) => {
  return (
    <button
      onClick={(ev) => {
        addClickClass(ev.currentTarget, "click");
        setOption(option == borderDir ? "" : borderDir);
      }}
      className=" rounded-lg cursor-pointer p-2 flex justify-center items-center bg-slate-800"
    >
      <div
        className={`w-[20px] h-[20px] ${borderName} ${
          option != borderDir ? "border-slate-500" : "border-blue-500"
        } `}
      ></div>
    </button>
  );
};
