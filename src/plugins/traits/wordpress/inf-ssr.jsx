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
export const inf_ssr_traits = (editor) =>
  defineTraits([
    {
        name: "inf-ssr-handler",
      role: "handler",
      type: "custom",
      component: () => <MiniTitle>Inf SSR</MiniTitle>,
    //   showCallback: () => true,
    },
    {
      name: "inf-ssr-url",
      type: "text",
      label: "Url",
      placeholder: "Enter url for ssr",
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        // alert(`inf for : ${trait?.value} : model id ${model.getId()}`);
        if (!trait.value) return;

        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          {
            ...qv,
            ssr_url: trait?.value,
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
            ssr_url: newValue,
            _id: model.getId(),
          },
        ]);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
    },

    {
      name: "inf-ssr-method",
      type: "select",
      label: "Method",
      placeholder: "Enter method for ssr",
      hint: `Type method for ssr`,
      role: "attribute",
      keywords: httpGetterMethods.concat(httpSetterMethods),
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, ssr_method: trait?.value ?? "", _id: model.getId() },
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
            ssr_method: newValue,
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
      name: "inf-ssr-headers",
      type: "add-props",
      label: "headers",
      placeholder: "Enter method for ssr",
      hint: `Type method for ssr`,
      role: "attribute",
      keywords: headersProps,
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, ssr_headers: trait?.value ?? "", _id: model.getId() },
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
            ssr_headers: newValue,
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
      name: "inf-ssr-body",
      type: "textarea",
      label: "Body",
      placeholder: "Enter body for ssr",
      role: "attribute",
      addPropsCodeLanguage: "json",
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, ssr_body: trait?.value ?? "", _id: model.getId() },
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
            ssr_body: newValue,
            _id: model.getId(),
          },
        ]);
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      onBlur({ editor }) {
        editor.trigger(InfinitelyEvents.tokens.update);
      },
      showCallback(trait) {
        const sle = editor.getSelected();
        const inf_ssr_method = sle.getTrait("inf-ssr-method").attributes?.value;
        return httpSetterMethods.includes(inf_ssr_method);
      },
    },

    {
      name: "inf-ssr-response-var",
      type: "text",
      label: "Item Var Name",
      hint: `Type item var name for ssr`,
      placeholder: "Enter item var name for ssr",
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
      name: "inf-ssr-response-path",
      type: "text",
      label: "Data path",
      hint: `Type data path for ssr to loop it. EX: data.products`,
      placeholder: "Enter data path for ssr",
      role: "attribute",
      init({ editor, model, trait, mediaBreakpoint }) {
        if (!trait.value) return;
        const qv = getTokensQueryVar("_id", model.getId());
        removeTokensQueryVar("_id", model.getId());
        setTokensQueryVars([
          { ...qv, ssr_response_path: trait?.value ?? "", _id: model.getId() },
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
            ssr_response_path: newValue,
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
      name: "inf-ssr-timeout",
      type: "text",
      label: "Timeout",
      hint: `Type timeout to wait default is 20 seconds`,
      placeholder: "Enter data path for ssr",
      role: "attribute",
    },
  ]);
