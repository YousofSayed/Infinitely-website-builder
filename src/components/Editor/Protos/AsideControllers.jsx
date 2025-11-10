import React from "react";
import { Icons } from "../../Icons/Icons";
import { Li } from "../../Protos/Li";
// import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilState } from "recoil";
import { asideControllersNotifiresState} from "../../../helpers/atoms";
// import {
//   interactionId,
//   mainInteractionId,
//   mainMotionId,
//   motionId,
// } from "../../../constants/shared";
// import { dynamic_container } from "../../../constants/cmpsTypes";
// import { isDynamicComponent } from "../../../helpers/functions";

export const AsideControllers = () => {
  // const editor = useEditorMaybe();
  // const [select, setSelect] = useState("style");
  // const sle = useRecoilValue(currentElState);
  // const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  // const [cmp, setCmp] = useState("");
  const [notify, setNotify] = useRecoilState(asideControllersNotifiresState);

  // useEffect(() => {
  //   if (!editor || !sle || !sle.currentEl) return;
  //   const selectedCmp = editor?.getSelected();
  //   if (!selectedCmp) return;
  //   /**
  //    *
  //    * @param {import('grapesjs').Component} selectedCmp
  //    */
  //   const checkers = (selectedCmp) => {
  //     const attributes = selectedCmp.getAttributes();
  //     const checkCommands = () =>
  //       Object.keys(attributes).some((attrKey) => attrKey.startsWith("v-"));
  //     const checkTraits = () => selectedCmp.getTraits().some(trait=>Boolean(trait.attributes.value));
  //     const checkInteractions = () =>
  //       attributes[interactionId] || attributes[mainInteractionId];
  //     const checkMotion = () =>
  //       attributes[motionId] || attributes[mainMotionId];
  //     const checkStyling = ()=> cmpRules.length > 0 || selectedCmp.getClasses().length > 0;

  //     return {
  //       commands: checkCommands(),
  //       traits: checkTraits(),
  //       interactions: checkInteractions(),
  //       motion: checkMotion(),
  //       styling: checkStyling(),
  //     };
  //   };
  //   try {
  //     setCmp(selectedCmp);
  //     setNotify(checkers(selectedCmp));
  //   } catch (error) {
  //     console.error(`Error : ${error.message}`);
  //   }
  // }, [sle , cmpRules , editor]);

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
        notify={notify.commands}
      >
        {Icons.command("white")}
      </Li>

      <Li
        title="traits"
        to={"/edite/traits"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
        notify={notify.traits}
      >
        {Icons.setting("white")}
      </Li>

      <Li
        title="interactions"
        to={"/edite/interactions"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
        notify={notify.interactions}
      >
        {Icons.interaction({ fill: "white" })}
      </Li>

      <Li
        title="motion"
        to={"/edite/motion"}
        className={`w-[50%] h-[40.5px!important] hover:bg-blue-600 `}
        isObjectParamsIcon
        fillObjIcon={undefined}
        icon={Icons.motion}
        notify={notify.motion}
      />

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
        isObjectParamsIcon
        fillObjIcon={undefined}
        icon={Icons.prush}
        notify={notify.styling}
      />
    </ul>
  );
};
