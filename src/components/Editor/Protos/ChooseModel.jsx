import { Icons } from "@/components/Icons/Icons";
import { Li } from "@/components/Protos/Li";
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export const ChooseModel = () => {
  
  return (
    <section className="flex flex-col gap-3 ">
      <ul className="flex  justify-between gap-3 bg-surface-tertiary rounded-lg p-1">
        <Li
          title="dynamic-content"
          to="dynamic-content"
          className="w-full "
          linkClassName="w-full h-full flex py-2 gap-1 capitalize font-semibold items-center justify-center text-text-primary "
        >
          {Icons.edite({fill:"white" , width:22})} <h1>content</h1>
        </Li>
        <Li
          title="dynamic-attributes"
          to="dynamic-attributes"
          className="w-full "
          linkClassName="w-full h-full py-2 flex  gap-1 capitalize font-semibold items-center justify-center text-text-primary "
        >
          {Icons.setting("white" , undefined , 22  )} <h1>Attributes</h1>
        </Li>
      </ul>

      <Outlet />
      {/* <AsideControllers /> */}
      
    </section>
  );
};
