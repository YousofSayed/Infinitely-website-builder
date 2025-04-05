import React, { useEffect, useLayoutEffect, useState } from "react";
import { Icons } from "../../Icons/Icons";
import { Li } from "../../Protos/Li";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { dynamic_container } from "../../../constants/cmpsTypes";
import { isDynamicComponent } from "../../../helpers/functions";

export const AsideControllers = () => {
  const editor = useEditorMaybe();
  const [select, setSelect] = useState("style");
  const sle = useRecoilValue(currentElState);
  const [cmp, setCmp] = useState("");

  useLayoutEffect(() => {
    if (!editor || !sle || !sle.currentEl) return;
    try {
      setCmp(editor?.getSelected());
    } catch (error) {
      console.error(`Error : ${error.message}`);
    }
  }, [sle]);

  return (
    <ul className="w-full flex items-center  bg-slate-800 p-1 rounded-lg gap-2 [&_svg]:w-[22px]">
      {/* {cmp && !isDynamicComponent(cmp) && (
        <Li
          title="commands"
          to={"/edite/commands"}
          className={`w-[50%] h-[40px] hover:bg-blue-600 `}
        >
          {Icons.command("white")}
        </Li>
      )} */}

      <Li
        title="commands"
        to={"/edite/commands"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
      >
        {Icons.command("white")}
      </Li>

      <Li
        title="traits"
        to={"/edite/traits"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
      >
        {Icons.setting("white")}
      </Li>

      {/* {cmp && isDynamicComponent(cmp) && (
        <Li
          title="choose-and-write-model"
          to={"/edite/choose-and-write-model"}
          className={`w-[50%] h-[30px] hover:bg-blue-600 `}
        >
          {Icons.model({ strokeColor: "white", fill: "white", strokWidth: 3 })}
        </Li>
      )} */}

      {/* <Li
        title="choose-and-write-model"
        to={"/edite/choose-and-write-model"}
        className={`w-[50%] h-[40px] hover:bg-blue-600 `}
      >
        {Icons.model({ strokeColor: "white", fill: "white", strokWidth: 3 })}
      </Li> */}

      <Li
        title="styling"
        to={"/edite/styling"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
        icon={Icons.prush}
      />
    </ul>
  );
};
