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
      className="group rounded-lg cursor-pointer p-2 flex justify-center items-center bg-surface-secondary hover:bg-brand-primary transition-all "
    >
      <div
        className={`w-[20px] h-[20px] ${borderName} ${
          option != borderDir ? "border-slate-500" : "border-blue-500"
        } group-hover:border-white transition-all`}
      ></div>
    </button>
  );
};
