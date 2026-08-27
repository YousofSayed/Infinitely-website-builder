import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  defineTraits,
  getTokensQueryVar,
  removeTokensQueryVar,
  setTokensQueryVars,
} from "@/helpers/functions";
import { showCallback } from "./helpers";
import { inf_query_traits } from "./inf-query";
import { inf_ssr_traits } from "./inf-ssr";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";

export const inf_for_traits = (editor) =>
  defineTraits([
    {
      name: "inf-for-handler",
      role: "handler",
      type: "custom",
      component: () => <MiniTitle>Inf For</MiniTitle>,
    },
    {
      name: "inf-for",
      type: "text",
      label: "Inf For",
      placeholder: "Enter Inf For",
      hint: `Type {{ to start get tokens suggestions`,
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            source: trait?.value,
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
            source: newValue,
            _id: model.getId(),
          },
        ]);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
    },

    {
      name: "inf-for-item",
      type: "text",
      label: "Inf For Item",
      placeholder: "Enter Inf For Item",
      hint: `Type for item var name`,
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

    {
      name: "inf-for-index",
      type: "text",
      label: "Inf For Index Value",
      placeholder: "Enter Inf For Index Value",
      hint: `Type index var name`,
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, value: trait?.value ?? "", _id: model.getId() },
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
            index: newValue,
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
