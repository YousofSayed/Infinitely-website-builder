import React from "react";
import { html } from "../helpers/cocktail";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { Icons } from "../components/Icons/Icons";
import { defineTraits } from "../helpers/functions";
import { getLoopComponent } from "../plugins/globalTraits";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const NextAndPrevious = ({ editor }) => {
  editor.Components.addType("looper-next-prev-button", {
    isComponent: (el) =>
      el?.tagName?.toLowerCase?.() == "looper-next-prev-button",
    model: {
      defaults: {
        name: `Next & prev button`,
        icon: html`<section class="flex justify-center items-center ">
          <i class="rotate-[90deg]">
            ${reactToStringMarkup(Icons.arrow("white"))}
          </i>
          <i class="rotate-[-90deg]">
            ${reactToStringMarkup(Icons.arrow("white"))}
          </i>
        </section>`,
        tagName: "looper-next-prev-button",
        components: html`
          <button class="looper-prev-button p-10">Prev</button>
          <button class="looper-next-button p-10">Next</button>
        `,
        traits: defineTraits([
          {
            name: "count-name",
            label: "Count Name",
            placeholder: "Enter Count Name",
            role: "attribute",
            type: "text",
            showCallback() {
              return Boolean(window.isLoop);
            },
            callback({ model, oldValue, newValue, traits, props }) {
              const eventTarget = `v-on:click`;
              const loopCmp = getLoopComponent(model);
              const targetCmpLoop = loopCmp.find(
                `[loop-count-name="${newValue}"]`
              )[0];
              if (!targetCmpLoop) return;

              const countValue =
                targetCmpLoop.getAttributes()["loop-count-value"] || "0";

              const loopValue = targetCmpLoop.getAttributes()["loop-value"];
              if (!loopValue) return;

              const prevBtnCmp = model.find(`.looper-prev-button`)[0];
              const nextBtnCmp = model.find(`.looper-next-button`)[0];
              const oldPrevAttr = prevBtnCmp.getAttributes()[eventTarget];
              const oldNextAttr = nextBtnCmp.getAttributes()[eventTarget];
              if (!prevBtnCmp || !nextBtnCmp) return;
              console.log(
                "counter : ",
                loopValue,
                `start${oldValue}-=${
                  props?.oldValue || countValue
                };${oldValue}-=${props?.oldValue || countValue}`
              );
              const replacer = (oldAttrValue = "",  operator) => {
                const withNewValue = `start${newValue}${operator}${
                  props?.oldValue || countValue
                };${newValue}${operator}${props?.oldValue || countValue}`;
                const withOldValue = `start${oldValue}${operator}${
                  props?.oldValue || countValue
                };${oldValue}${operator}${props?.oldValue || countValue}`;

                return oldAttrValue.includes(withNewValue)
                  ? oldAttrValue.replaceAll(withNewValue, "")
                  : oldAttrValue.includes(withOldValue)
                  ? oldAttrValue.replaceAll(withOldValue, "")
                  : "";
              };
              oldPrevAttr &&
                prevBtnCmp.addAttributes({
                  [eventTarget]: `${replacer(oldPrevAttr , '-=')}  start${newValue}-=${countValue};${newValue}-=${countValue}`,
                  "v-bind:disabled": `start${newValue} <= 0`,
                });

              oldNextAttr &&
                nextBtnCmp.addAttributes({
                  [eventTarget]: `${replacer(oldNextAttr , '+=')}  start${newValue}+=${countValue};${newValue}+=${countValue}`,
                  "v-bind:disabled": `${newValue} >= (Array.isArray(${loopValue}) ? ${loopValue} : []).length`,
                });

              !oldPrevAttr &&
                prevBtnCmp.addAttributes({
                  [eventTarget]: `start${newValue}-=${countValue};${newValue}-=${countValue}`,
                  "v-bind:disabled": `start${newValue} <= 0`,
                });

              !oldNextAttr &&
                nextBtnCmp.addAttributes({
                  [eventTarget]: `start${newValue}+=${countValue};${newValue}+=${countValue}`,
                  "v-bind:disabled": `${newValue} >= (Array.isArray(${loopValue}) ? ${loopValue} : []).length`,
                });
            },
          },
        ]),
      },
    },
  });
};
