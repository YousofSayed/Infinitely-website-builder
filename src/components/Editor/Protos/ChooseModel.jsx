import React, { useEffect, useState } from "react";
import { Li } from "../../Protos/Li";
import { Icons } from "../../Icons/Icons";
import { Outlet } from "react-router-dom";

export const ChooseModel = () => {
  
  return (
    <section className="flex flex-col gap-3 ">
      <ul className="flex  justify-between gap-3 bg-slate-800 rounded-lg p-1">
        <Li
          title="dynamic-content"
          to="dynamic-content"
          className="w-full "
          linkClassName="w-full h-full flex py-2 gap-1 capitalize font-semibold items-center justify-center text-slate-200 "
        >
          {Icons.edite({fill:"white" , width:22})} <h1>content</h1>
        </Li>
        <Li
          title="dynamic-attributes"
          to="dynamic-attributes"
          className="w-full "
          linkClassName="w-full h-full py-2 flex  gap-1 capitalize font-semibold items-center justify-center text-slate-200 "
        >
          {Icons.setting("white" , undefined , 22  )} <h1>Attributes</h1>
        </Li>
      </ul>

      <Outlet />
      {/* <AsideControllers /> */}
      
    </section>
  );
};
