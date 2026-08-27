import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  defineTraits,
  getProjectData,
  getTokensQueryVar,
  removeTokensQueryVar,
  setTokensQueryVars,
} from "@/helpers/functions";
import { inf_for_traits } from "./inf-for";
import { inf_ssr_traits } from "./inf-ssr";
import { showCallback } from "./helpers";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";

export const inf_query_traits = (editor) =>
  defineTraits([
    {
         name: "inf-query-handler", // 👈 ADD THIS
      role: "handler",
      type: "custom",
      component: () => <MiniTitle>Inf Query</MiniTitle>,
      //  showCallback: () => true,
    },
    {
      name: "inf-query-id",
      type: "select",
      label: "Inf Query",
      placeholder: "Select Inf Query",
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);

        (async () => {
          const projectData = await getProjectData();
          trait.keywords = Object.values(projectData.queries).map((q) => ({
            value: q.inf_query_id,
            title: q.inf_query_name,
          }));
        })();

        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            query_id: trait?.value,
            _id: model.getId(),
            id: model.getId(),
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
            query_id: newValue,
            _id: model.getId(),
          },
        ]);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
    },

    {
      name: "inf-query-item",
      type: "text",
      label: "Inf Query Item",
      placeholder: "Enter Inf Query Item",
      hint: `Type query item var name`,
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, name: trait?.value ?? "", _id: model.getId() },
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
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
    },
  ]);
