import { Icons } from "@/components/Icons/Icons";
import { Adder } from "@/components/Editor/Protos/Adder";
import { Property } from "@/components/Editor/Protos/Property";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import React from "react";

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
