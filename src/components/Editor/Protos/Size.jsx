import { overflowValues } from "@/constants/cssProps";
import { getIconForMultiChoice } from "@/helpers/functions";
import { P } from "@/components/Protos/P";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { MultiChoice } from "@/components/Editor/Protos/MultiChoice";
import { Property } from "@/components/Editor/Protos/Property";
import { Select } from "@/components/Editor/Protos/Select";
import { SelectStyle } from "@/components/Editor/Protos/SelectStyle";
import React from "react";

export const Size = () => {
  return (
    <section className="flex flex-col gap-2  rounded-lg bg-surface-secondary">
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
      {/* <section className="flex bg-surface-tertiary flex-col  rounded-lg  py-1">
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
