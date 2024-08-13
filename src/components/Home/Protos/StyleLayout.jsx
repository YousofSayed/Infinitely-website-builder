import React, { useState } from "react";
import { getPropVal } from "../../../helpers/functions";
import { Property } from "./Property";
import { Select } from "./Select";
import { MultiProps } from "./MultiProps";
import { filterTypes, filterUnits } from "../../../constants/constants";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";

const BorderLabel = ({ label, borderColor }) => (
  <div
    className={`absolute w-full h-full border-2 border-${borderColor} border-dashed`}
  >
    <p
      className={`w-[60px] py-[1px] flex justify-center items-center rounded-xl font-semibold capitalize text-white text-[12px] absolute top-[-18px] left-[-5px] bg-gray-900`}
    >
      {label}
    </p>
  </div>
);

const Dimantions = ({ top = 0, right = 0, bottom = 0, left = 0 }) => (
  <>
    <div className="absolute w-full flex justify-center items-center h-[25px] top-0 text-[1vw] text-slate-200 font-bold">
      {top}
    </div>
    <div className="absolute w-full flex justify-center items-center h-[25px] bottom-0 text-[1vw] text-slate-200 font-bold">
      {bottom}
    </div>
    <div className="absolute w-[25px] h-full flex justify-center items-center right-0 text-[1vw] text-slate-200 font-bold">
      {right}
    </div>
    <div className="absolute w-[25px] h-full flex justify-center items-center left-0 text-[1vw] text-slate-200 font-bold">
      {left}
    </div>
  </>
);

const SidesControllers = ({ option, setOption }) => {
  /**
   *
   * @param {MouseEvent} ev
   * @param {string} option
   */
  const onClick = (ev, option) => {
    setOption(option);
  };

  return (
    <section className="p-2 w-full bg-slate-800 rounded-lg flex justify-between items-center">
      <button
        onClick={(ev) => {
          onClick(ev, "all");
        }}
        className={`w-[20px] h-[20px] border-2 ${
          option == "all" ? "border-blue-500" : "border-slate-500"
        } cursor-pointer transition-all`}
      ></button>
      <button
        onClick={(ev) => {
          onClick(ev, "tb");
        }}
        className={`w-[20px] h-[20px] border-2 border-transparent ${
          option == "tb"
            ? "border-b-blue-500 border-t-blue-500"
            : "border-b-slate-500 border-t-slate-500"
        }  cursor-pointer transition-all`}
      ></button>
      <button
        onClick={(ev) => {
          onClick(ev, "lr");
        }}
        className={`w-[20px] h-[20px] border-2 border-transparent ${
          option == "lr"
            ? "border-l-blue-500 border-r-blue-500"
            : "border-l-slate-500 border-r-slate-500"
        } cursor-pointer transition-all`}
      ></button>
    </section>
  );
};

/**
 *
 * @param {{currentEl:HTMLElement}} param0
 * @returns
 */
export const StyleLayout = ({}) => {
  const [option, setOption] = useState();
  const currentEl = useRecoilValue(currentElState);

  return (
    <section className="mt-3 overflow-y-auto  flex flex-col gap-2 p-2 rounded-lg bg-gray-900">
      <SidesControllers option={option} setOption={setOption} />
      <Property currentEl={currentEl} label="padding" cssProp="padding" />
      <Property currentEl={currentEl} label="margin" cssProp="margin" />
      <Property currentEl={currentEl} label="border" cssProp="border" />
      <Property currentEl={currentEl} label="color" cssProp="color" />
      <Select
        label="display"
        cssProp="display"
        currentEl={currentEl}
        keywords={[
          "none",
          "flex",
          "grid",
          "block",
          "inline",
          "inline-block",
          "table",
        ]}
      />
      <MultiProps
        label={"Filter"}
        keywords={filterTypes}
        units={filterUnits}
        cssProp="filter"
      />
    </section>
  );
};

window.addEventListener("click", () => {
  console.log(window.currentEl);
});
