import React from "react";
import { Property } from "./Property";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Adder } from "./Adder";

export const LinearGradient = () => {
  return (
    <section className="flex flex-col gap-2 rounded-lg ">
      <section className="w-full justify-between flex gap-2">
        <Adder>
          <section className="flex gap-2">
            <Property
              sectionClassName="p-[unset] px-[unset] w-full"
              inputClassName="w-full"
              placeholder="Direction"
            />
          </section>
        </Adder>
      </section>
    </section>
  );
};
