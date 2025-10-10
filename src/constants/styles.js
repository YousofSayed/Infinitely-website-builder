import { overflowValues } from "./cssProps";

/**
 * @type {import('../helpers/types').InfinitelyStyles}
 */
export const styles = {
  layout: [
    {
      type: "title",
      title: "Size",
    },
    {
      type: "property",
      cssProp: "width",
      title: "width",
    },
    {
      type: "property",
      cssProp: "height",
      title: "height,",
    },
    {
      type: "property",
      cssProp: "min-width",
    },
    {
      type: "property",
      cssProp: "min-height",
    },
    {
      type: "property",
      cssProp: "max-width",
    },
    {
      type: "property",
      cssProp: "max-height",
    },
    {
      type: "property",
      cssProp: "aspect-ratio",
    },
    {
      type: "select",
      cssProp: "overflow",
      keywords: overflowValues,
    },
    {
      type: "select",
      cssProp: "overflow-x",
      keywords: overflowValues,
    },
    {
      type: "select",
      cssProp: "overflow-y",
      keywords: overflowValues,
    },
    {
      type: "title",
      title: "Padding",
    },
    {
      type: "directions",
      directions: {
        tProp: "padding-top",
        rProp: "padding-right",
        bProp: "padding-bottom",
        lProp: "padding-left",
      },
    },
    {
        type:'title',
        title:'Margin'
    },
    {
        type:'directions',
        directions:{
            tProp:'margin-top',
            rProp:'margin-right',
            bProp:'margin-bottom',
            lProp:'margin-left'
        }
    },
  ],
};
