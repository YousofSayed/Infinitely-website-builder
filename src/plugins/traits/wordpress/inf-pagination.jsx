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
export const inf_pagination_traits = (editor) =>
  defineTraits([
    {
      name: "inf-pagination-handler", // 👈 ADD THIS
      role: "handler",
      type: "custom",
      component: () => <MiniTitle>Inf Pagination</MiniTitle>,
      //   showCallback: () => true,
    },
    {
      name: "inf-pagination-id",
      role: "attribute",
      type: "select",
      label: "Query ID",
      placeholder: "Select Inf Query ID",
      hint: `Choose a query to paginate.`,
      keywords({ projectData }) {
        if (!projectData) return [];
        return Object.values(projectData.queries).map((q) => ({
          value: q.inf_query_id,
          title: q.inf_query_name,
        }));
      },
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            pagination_query_id: trait?.value,
            _id: model.getId(),
          },
        ]);
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      callback({
        innerCallback,
        editor,
        newValue,
        oldValue,
        trait,
        model,
        props,
        traits,
      }) {
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            pagination_query_id: newValue,
            _id: model.getId(),
          },
        ]);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      //  showCallback: () => true,
    },
    {
      name: "inf-pagination-var",
      role: "attribute",
      type: "text",
      label:  "Pagination Query Var",
      placeholder: "Pagination Query Var",
      hint: "Type Pagination Query Var",
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            name: trait?.value,
            _id: model.getId(),
          },
        ]);
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      callback({
        innerCallback,
        editor,
        newValue,
        oldValue,
        trait,
        model,
        props,
        traits,
      }) {
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            name: newValue,
            _id: model.getId(),
          },
        ]);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      //   showCallback: () => true,
    },
    {
      name: "mid-size",
      role: "attribute",
      type: "text",
      inputType: "number",
      label: "Mid Size",
      placeholder: "Enter mid size",
      //   showCallback: () => true,
    },
    {
      name: "end-size",
      role: "attribute",
      type: "text",
      inputType: "number",
      label: "End Size",
      placeholder: "Enter end size",
      //   showCallback: () => true,
    },
    {
      name: "allow-numbers",
      role: "attribute",
      type: "switch",
      label: "Allow Numbers",
      placeholder: "Allow Numbers",
      //   showCallback: () => true,
    },
    {
      name: "allow-prev-next",
      role: "attribute",
      type: "switch",
      label: "Allow Prev Next",
      placeholder: "Allow Prev Next",
      //   showCallback: () => true,
    },
    {
      name: "show-dots",
      role: "attribute",
      type: "switch",
      label: "Show Dots",
      placeholder: "Show Dots",
      default: true,
      //   showCallback: () => true,
    },
    {
      name: "show-all-pages",
      role: "attribute",
      type: "switch",
      label: "Show All Pages",
      placeholder: "Show All Pages",
      default: false,
      //   showCallback: () => true,
      //   showCallback: () => true,
    },

  ]);
