import { AnimationName } from "../components/Editor/Protos/AnimationName";
import { BackgroundImage } from "../components/Editor/Protos/BackgroundImage";
import { BorderColor } from "../components/Editor/Protos/BorderColor";
import { BorderRadius } from "../components/Editor/Protos/BorderRadius";
import { BorderStyle } from "../components/Editor/Protos/BorderStyle";
import { Display } from "../components/Editor/Protos/Display";
import { FontFamily } from "../components/Editor/Protos/FontFamily";
import { Gradient } from "../components/Editor/Protos/Gradient";
import { Icons } from "../components/Icons/Icons";
import {
  animationCompositions,
  animationDirections,
  animationFillModes,
  animationIterationCounts,
  animationPlayStates,
  animationTimingFunctions,
  backgroundAttachmentValues,
  backgroundBlendModeValues,
  backgroundClipValues,
  backgroundRepeatValues,
  backgroundSize,
  containValues,
  cssFonts,
  cursorValues,
  filterTypes,
  filterUnits,
  fontWeights,
  isolationValues,
  mixBlendModeValues,
  overflowValues,
  positionValues,
  tabSizeValues,
  textDecorationLineValues,
  textDecorationStyleValues,
  textOverflowValues,
  touchActionValues,
  transformOriginValues,
  transformValues,
  userSelectValues,
  whiteSpaceCollapse,
  whiteSpaceTrim,
  whiteSpaceValues,
  willChangeValues,
  wordBreakValues,
  wordWrap,
  writingModeValues,
} from "./cssProps";

/**
 * @type {import('../helpers/types').InfinitelyStyles}
 */
export const styles = {
  Layout: [
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
      title: "height",
    },
    {
      type: "property",
      cssProp: "min-width",
      title: "min width",
    },
    {
      type: "property",
      cssProp: "min-height",
      title: "min height",
    },
    {
      type: "property",
      cssProp: "max-width",
      title: "max width",
    },
    {
      type: "property",
      cssProp:'max-height',
      title: "max height",
    },
    {
      type: "property",
      cssProp: "aspect-ratio",
      title: "aspect ratio",
    },
    {
      type: "select",
      cssProp: "overflow",
      title: "overflow",
      keywords: overflowValues,
    },
    {
      type: "select",
      cssProp: "overflow-x",
      title: "overflow x",
      keywords: overflowValues,
    },
    {
      type: "select",
      cssProp: "overflow-y",
      title: "overflow y",
      keywords: overflowValues,
    },
    {
      type:'property',
      title:'z Index',
      cssProp:'z-index',
      special:true,
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
      type: "title",
      title: "Margin",
    },
    {
      type: "directions",
      directions: {
        tProp: "margin-top",
        rProp: "margin-right",
        bProp: "margin-bottom",
        lProp: "margin-left",
      },
    },
    {
      type: "title",
      title: "Positioning",
    },
    {
      title:'position',
      cssProp:'position',
      type:'select',
      keywords:positionValues
    },
    {
      type: "directions",
      directions: {
        tProp: "top",
        rProp: "right",
        bProp: "bottom",
        lProp: "left",
      },
    },
    {
      type: "custom",
      cssProp: [
        "display",
        "flex-direction",
        "align-items",
        "justify-content",
        "align-self",
        "justify-items",
        "align-content",
        "flex-wrap",
        "flex-grow",
        "flex-shrink",
        "flex-basis",
        "order",
        "column-gap",
        "row-gap",
        "grid-template-columns",
        "grid-template-rows",
        "grid-auto-columns",
        "grid-auto-rows",
        "grid-row",
        "grid-column",
      ],
      Component: () => <Display />,
    },
  ],
  Typography: [
    {
      type: "custom",
      title: "Font",
      Component: () => <FontFamily />,
    },
    {
      title: "weight",
      type:'select',
      cssProp: "font-weight",
      keywords: fontWeights,
      splitHyphen: true,
    },
    {
      type: "color",
      title:'color',
      cssProp: "color",
    },
    {
      type: "property",
      title: "Size",
      cssProp: "font-size",
    },
    {
      title: "spacing",
      type: "property",
      cssProp: "letter-spacing",
    },
    {
      title: "line height",
      type: "property",
      cssProp: "line-height",
    },
    {
      title: "transform",
      type: "multi-choice",
      cssProp:'text-transform',
      choices: [
        { choice: "none", Icon: Icons.textNone },
        { choice: "capitalize", Icon: Icons.textCapitalize },
        { choice: "lowercase", Icon: Icons.textLowercase },
        { choice: "uppercase", Icon: Icons.textUppercase },
      ],
    },
    {
      title: "indent",
      type: "property",
      cssProp: "text-indent",
    },
    {
      type: "multi-choice",
      cssProp: "text-align",
      title:'align',
      choices: [
        { choice: "start", Icon: Icons.textStart },
        { choice: "center", Icon: Icons.textCenter },
        { choice: "end", Icon: Icons.textEnd },
        { choice: "justify", Icon: Icons.textJustify },
      ],
    },
    {
      type: "select",
      keywords: textDecorationLineValues,
      title: "decoration line",
      cssProp: "text-decoration-line",
    },
    {
      type: "select",
      keywords: textDecorationStyleValues,
      title: "decoration style",
      cssProp: "text-decoration-style",
    },
    {
      type: "property",
      title: "decoration thickness",
      cssProp: "text-decoration-thickness",
    },
    {
      type: "select",
      title: "Overflow",
      splitHyphen: true,
      cssProp: "text-overflow",
      keywords: textOverflowValues,
    },
    {
      title: "word breaking",
      cssProp: "word-break",
      type: "select",
      keywords: wordBreakValues,
    },
    {
      type: "property",
      title: "word spacing",
      cssProp: "word-spacing",
    },
    {
      type: "select",
      cssProp: "word-wrap",
      title: "word wrap",
      keywords: wordWrap,
    },
    {
      title: "white space",
      type: "select",
      cssProp: "white-space",
      keywords: whiteSpaceValues,
    },
    {
      type: "select",
      title: "white space collapse",
      cssProp: "white-space-collapse",
      keywords: whiteSpaceCollapse,
    },
    {
      type: "select",
      title: "white space trim",
      cssProp: "white-space-trim",
      keywords: whiteSpaceTrim,
    },
    {
      title: "writing mode",
      type: "select",
      keywords: writingModeValues,
      cssProp: "writing-mode",
    },
  ],
  Border: [
    {
      type: "directions",
      title: "border width",
      directions: {
        tProp: "border-top-width",
        rProp: "border-right-width",
        bProp: "border-bottom-width",
        lProp: "border-left-width",
      },
    },
    {
      type: "custom",
      title: "border color",
      cssProp: [
        "border-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
      ],
      Component: () => (
        <section className="  flex flex-col gap-2 rounded-lg bg-slate-900">
          <BorderColor />
        </section>
      ),
    },
    {
      type: "custom",
      title: "border style",
      cssProp: [
        "border-style",
        "border-top-style",
        "border-right-style",
        "border-bottom-style",
        "border-left-style",
      ],
      Component: () => (
        <section className="  flex flex-col gap-2 rounded-lg bg-slate-900">
          <BorderStyle />
        </section>
      ),
    },
    {
      type: "custom",
      title: "border raduis",
      cssProp: [
        "border-radius",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-left-radius",
        "border-bottom-left-radius",
      ],
      Component: () => (
        <section className="  flex flex-col gap-2  rounded-lg bg-slate-900">
          <BorderRadius />
        </section>
      ),
    },
  ],
  Background: [
    {
      type: "title",
      title: "Color",
    },
    {
      type: "color",
      cssProp: "background-color",
    },
    {
      type: "title",
      title: "Image",
    },
    {
      type: "custom",
      cssProp: "background-image",
      Component: ({ value }) => (
        // value.toLowerCase().startsWith('url(') ?
        <BackgroundImage />
      ),
      // : null,
    },
    {
      type: "property",
      title: "position x",
      cssProp: "background-position-x",
    },
    {
      type: "property",
      title: "position y",
      cssProp: "background-position-y",
    },
    {
      type: "select",
      cssProp: "background-repeat",
      title: "Reapeat",
      keywords: backgroundRepeatValues,
    },
    {
      type: "select",
      cssProp: "background-size",
      title: "Size",
      keywords: backgroundSize,
    },
    {
      type: "multi-values-for-single-prop",
      cssProp: "background-attachment",
      title: "Attachment",
      keywords: backgroundAttachmentValues,
    },
    {
      type: "title",
      title: "Gradient",
    },
    {
      type: "custom",
      cssProp: "background-image",
      Component: ({ value }) => (
        // value.toLowerCase().startsWith("linear-gradient") ||
        // value.toLowerCase().startsWith("radial-gradient") ? (
        <Gradient />
      ),
      // ) : null,
    },
    {
      type: "title",
      title: "Other",
    },
    {
      type: "select",
      title: "Clip",
      cssProp: "background-clip",
      keywords: backgroundClipValues,
    },
    {
      type: "select",
      title: "Origin",
      cssProp: "background-origin",
      keywords: backgroundClipValues.slice(0, -1),
    },
    {
      title: "Blend mode",
      cssProp: "background-blend-mode",
      type: "select",
      keywords: backgroundBlendModeValues,
    },
  ],
  Backdrop: [
    {
      type: "multi-function-prop",
      cssProp: "backdrop-filter",
      keywords: [...filterTypes, "url"],
      units: { ...filterUnits, url: "" },
      placeholder: "Add Filter",
    },
  ],
  Filters: [
    {
      type: "multi-function-prop",
      cssProp: "filter",
      keywords: filterTypes,
      units: filterUnits,
      placeholder: "Add Filter",
    },
  ],
  Transform: [
    {
      cssProp: "transform-origin",
      title: "Origin",
      type: "select",
      keywords: transformOriginValues,
    },
    {
      cssProp: "transform",
      type: "multi-function-prop",
      title: "Transform",
      keywords: transformValues,
      placeholder: "Add Prop",
    },
  ],
  Animation: [
    {
      cssProp: "animation-name",
      type: "custom",
      Component: () => <AnimationName />,
    },
    {
      title: "Duration",
      cssProp: "animation-duration",
      type: "property",
    },
    {
      title: "Delay",
      cssProp: "animation-delay",
      type: "property",
    },
    {
      type: "select",
      title: "Counts",
      cssProp: "animation-iteration-count",
      keywords: animationIterationCounts,
    },
    {
      type: "select",
      title: "Directions",
      cssProp: "animation-direction",
      keywords: animationDirections,
    },
    {
      type: "select",
      title: "Fill",
      cssProp: "animation-fill-mode",
      keywords: animationFillModes,
    },
    {
      type: "select",
      title: "Timing",
      cssProp: "animation-timing-function",
      keywords: animationTimingFunctions,
    },
    {
      type: "select",
      title: "State",
      cssProp: "animation-play-state",
      keywords: animationPlayStates,
    },
    {
      title: "Composition",
      type: "select",
      cssProp: "animation-composition",
      keywords: animationCompositions,
    },
    {
      type: "multi-values-for-single-prop",
      cssProp: "will-change",
      title:'will change',
      keywords: willChangeValues,
    },
    {
      type: "multi-values-for-single-prop",
      cssProp: "contain",
      title:'contain',
      keywords: containValues,
      separator: " ",
    },
  ],
  Others: [
    {
      title: "user select",
      cssProp: "user-select",
      type: "select",
      keywords: userSelectValues,
    },
    {
      title: "transition",
      cssProp: "transition",
      type: "property",
    },
    {
      title: "tab size",
      cssProp: "tab-size",
      type: "select",
      keywords: tabSizeValues,
    },
    {
      title: "opacity",
      cssProp: "opacity",
      type: "property",
    },
    {
      title: "empty cells",
      cssProp: "empty-cells",
      type: "select",
      keywords: ["show", "hide"],
    },
    {
      title: "touch action",
      cssProp: "touch-action",
      type: "select",
      keywords: touchActionValues,
    },
    {
      title: "mix blend mode",
      cssProp: "mix-blend-mode",
      type: "select",
      keywords: mixBlendModeValues,
    },
    {
      title: "isolation",
      cssProp: "isolation",
      type: "select",
      keywords: isolationValues,
    },
    {
      title: "cursor",
      cssProp: "cursor",
      type: "select",
      keywords: cursorValues,
    },
  ],
};
