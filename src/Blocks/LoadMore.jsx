import React from "react";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { Icons } from "../components/Icons/Icons";
import { defineTraits } from "../helpers/functions";
import { eventNames } from "../constants/hsValues";
import { getLoopComponent } from "../plugins/globalTraits";
import { viewEvents } from "../constants/shared";

/**
 *
 * @param {{editor: import('grapesjs').Editor}} param0
 * @returns
 */
export const LoadMore = ({ editor }) => {
  return editor.Components.addType("looper-load-more-button", {
    extend: "button",
    model: {
      defaults: {
        name: "Looper Load More Button",
        //  placeholder: 'Click me',
        // icon: reactToStringMarkup(Icons.loadMore({ strokeColor: "white" })),
        traits: defineTraits([
          {
            name: "event-target",
            label: "Event Target",
            placeholder: "Select Event Target",
            role: "attribute",
            value: "click",
            type: "select",
            keywords: eventNames,
            showCallback() {
              return Boolean(window.isLoop);
            },
            callback({ model, oldValue, newValue, traits }) {
              model.removeAttributes([`v-on:${oldValue.replace("v-on:", "")}`]);
              const countName = model.getTrait("count-name").attributes.value;
              const oldAttrVal = model.getAttributes()[`v-on:${newValue}`];
              const isView = viewEvents.includes(newValue) ? {'v-view':true} : {}
              if (oldAttrVal) {
                model.addAttributes({
                  [`v-on:${countName}`]: `${oldAttrVal.replaceAll(
                    `${countName}+=${countName}`,
                    ""
                  )} \n ${countName}+=${countName}`,
                  ...isView
                });

              } else {
                model.addAttributes({
                  [`v-on:${newValue}`]: `${countName}+=${countName}`,
                  ...isView
                });
              }
            },
          },
          {
            name: "count-name",
            label: "Count Name",
            placeholder: "Enter Count Name",
            role: "attribute",
            type: "text",
            showCallback() {
              return Boolean(window.isLoop);
            },
            callback({ model, oldValue, newValue, traits }) {
              const eventTarget =
                model.getTrait("event-target").attributes.value;
              const loopCmp = getLoopComponent(model);
              const targetCmpLoop = loopCmp.find(
                `[loop-count-name="${newValue}"]`
              )[0];
              if (!targetCmpLoop) return;
              
              const loopValue = targetCmpLoop.getAttributes()["loop-value"];
              if(!oldValue)return;
              const oldAttr = model.getAttributes()[eventTarget];

              if (oldAttr) {
                model.addAttributes({
                  [eventTarget]: `${oldAttr.replaceAll(
                    `${newValue}+=${newValue}`,
                    " "
                  )} \n ${newValue}+=${newValue}`,
                  "v-bind:disabled": `${newValue} >= (Array.isArray(${loopValue}) ? ${loopValue} : []).length`,
                });
              } else {
                model.addAttributes({
                  [eventTarget]: `${newValue}+=${newValue}`,
                  "v-bind:disabled": `${newValue} >= (Array.isArray(${loopValue}) ? ${loopValue} : []).length`,
                });
              }
            },
          },
        ]),
        components: `Load more...`,
        editable: true,
        droppable: true,
      },
    },
  });
};
