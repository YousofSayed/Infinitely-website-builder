import React from "react";
import { Property } from "./Property";
import { MultiChoice } from "./MultiChoice";
import { overflowValues } from "../../../constants/cssProps";
import { getIconForMultiChoice } from "../../../helpers/functions";
import { P } from "../../Protos/P";
import { Select } from "./Select";
import { SelectStyle } from "./SelectStyle";
import { MiniTitle } from "./MiniTitle";

export const Size = () => {
  return (
    <section className="flex flex-col gap-2  rounded-lg bg-slate-900">
            <MiniTitle>size</MiniTitle>

      {/* <ul className="flex flex-col gap-2 pb-3 border-b-2 border-b-slate-600"> */}
        {/* <li className='flex items-center justify-between gap-2'> */}
        <Property label="width" cssProp="width" />
        <Property label="height" cssProp="height" />
        {/* </li> */}

        {/* <li className='flex items-center justify-between gap-2'> */}
        <Property label="Min W" cssProp="min-width" />
        <Property label="Min H" cssProp="min-height" />
        {/* </li> */}

        {/* <li className='flex items-center justify-between gap-2'> */}
        <Property label="Max W" cssProp="max-width" />
        <Property label="Max H" cssProp="max-height" />
        {/* </li> */}
        <Property label="Aspect ratio" cssProp="aspect-ratio" special={true}  />
      {/* </ul> */}
      {/* <section className="flex bg-slate-800 flex-col  rounded-lg  py-1">
        <p className="font-bold text-[14px] pl-2 text-slate-300">Overflow: </p>
        <MultiChoice label="overflow" cssProp="overflow" choices={overflowValues} icons={[
            getIconForMultiChoice('auto'),
            getIconForMultiChoice('hidden'),
            getIconForMultiChoice('visible'),
            getIconForMultiChoice('scroll'),
            getIconForMultiChoice('initial'),
        ]} />
      </section> */}
      <SelectStyle label="overflow" cssProp="overflow" keywords={overflowValues}/>
      <SelectStyle label="overflow X" cssProp="overflow-x" keywords={overflowValues}/>
      <SelectStyle label="overflow Y" cssProp="overflow-y" keywords={overflowValues}/>
    </section>
  );
};
