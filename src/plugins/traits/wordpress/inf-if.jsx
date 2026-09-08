import { httpGetterMethods, httpSetterMethods } from "@/constants/hsValues";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { headersProps } from "@/constants/shared";
import {
  defineTraits,
  getProjectData,
  getTokensQueryVar,
  removeTokensQueryVar,
  setTokensQueryVars,
} from "@/helpers/functions";
import { inf_query_traits } from "./inf-query";
import { inf_for_traits } from "./inf-for";
import { showCallback } from "./helpers";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const inf_if_traits = (editor) =>
  defineTraits([
    {
      name: "inf-if-handler",
      role: "handler",
      type: "custom",
      component: () => <MiniTitle>Inf If</MiniTitle>,
      //   showCallback: () => true,
    },
    {
      name: "inf-if-json",
      type: "select",
      label: "Condition",
      placeholder: "Select or enter condition",
      role: "attribute",
      keywords: ({projectData}) => {
        if(!projectData) return [];
        return Object.values(projectData.conditions).map((q) => ({
          value: q.inf_condition_id,
          title: q.inf_condition_name,
        }));
      },
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);
        // (async () => {
        //   const projectData = await getProjectData();
        //   trait.keywords = Object.values(projectData.conditions).map((q) => ({
        //     value: q.inf_condition_id,
        //     title: q.inf_condition_name,
        //   }));
        //   editor.on("trait:value");
        // })();
       
      },
      
    },

  ]);
