import { useRecoilValue } from "recoil";
import { html, uniqueID } from "../helpers/cocktail";
import { currentElState } from "../helpers/atoms";
import { editorIcons } from "../components/Icons/editorIcons";
import { dynamic_container, dynamic_text } from "../constants/cmpsTypes";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { Icons } from "../components/Icons/Icons";

const svgText = html`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
  <path
    fill="currentColor"
    d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"
  />
</svg>`;

const svgLink = html`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
  <path
    fill="currentColor"
    d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"
  />
</svg>`;

const svgImage = html`<svg style="width:24px;height:24px" viewBox="0 0 24 24">
  <path
    fill="currentColor"
    d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
  />
</svg>`;

/**
 * @type {import('grapesjs').BlockProperties[]}
 */
export const blocks = [
  {
    id: uniqueID(),
    label: html`<p class="custom-font-size">Text</p>`,
    category: "Basic",
    media: reactToStringMarkup(Icons.text({ fill: "currentColor" })),
    // activate: true,
    content: { type: "text" },
    select: false,
  },
  {
    id: "link",
    label: html`<p class="custom-font-size">Link</p>`,
    category: "Basic",
    media: reactToStringMarkup(Icons.link({ fill: "currentColor" })),
    content: {
      type: "link",
      content: "Insert your link here",
    },
    select: false,
  },
  {
    id: "image",
    category: "Basic",
    label: html`<p class="custom-font-size">Image</p>`,
    media: reactToStringMarkup(Icons.image({})),
    content: {
      type: "image",
      // traits: defineTraits([
      //   { type: "media", role: "handler", mediaType: "image" , },
      // ]),
    },
    // activate: true,

    select: false,
  },
  {
    id: "media",
    category: "Basic",
    label: html`<p class="custom-font-size">Media</p>`,
    media: reactToStringMarkup(Icons.video({})),
    content: {
      type: "media",
    },
    select: false,
    // activate: true,
  },

  {
    id: "svg",
    category: "Basic",
    label: html`<p class="custom-font-size">Svg</p>`,
    media: reactToStringMarkup(Icons.svg({ fill: "currentColor" })),
    // content:reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "black" }))
    content: {
      type: "inf-svg",
    },
  },
  // {
  //   id: "video",
  //   category: "Basic",
  //   label: html`<p class="custom-font-size">Video</p>`,
  //   media: reactToStringMarkup(Icons.video({})),
  //   content: {
  //     type: "video",
  //   },
  //   select: false,
  //   // activate: true,
  // },

  // {
  //   id: "audio",
  //   category: "Basic",
  //   label: html`<p class="custom-font-size">Audio</p>`,
  //   media: reactToStringMarkup(Icons.headphone("currentColor")),
  //   content: {
  //     type: "audio",
  //   },
  //   select: false,
  //   // activate: true,
  // },

  // {
  //   id: "iframe-9098",
  //   category: "Basic",
  //   label: html`<p class="custom-font-size">Iframe</p>`,
  //   media: reactToStringMarkup(Icons.iframe({ fill: "currentColor" })),
  //   content: {
  //     type: "iframe",
  //   },
  //   select: false,

  //   // activate:false,
  // },

  {
    id: "button",
    category: "Basic",
    media: reactToStringMarkup(Icons.button({ fill: "currentColor" })),
    label: html`<p class="custom-font-size">Button</p>`,
    content: { type: "button" },
  },
  // {
  //   id: "columns",
  //   category: "Layout",
  //   label: html`<p class="custom-font-size ">Columns</p>`,
  //   media: editorIcons.columns,
  //   content: html`
  //     <section class="parent ">
  //       <div class="col"></div>
  //       <div class="col"></div>
  //       <div class="col"></div>
  //     </section>
  //   `,
  //   default: {},
  //   select: false,
  // },
  {
    id: "input",
    label: html`<p class="custom-font-size ">Input</p>`,
    media: reactToStringMarkup(Icons.input({ fill: "currentColor" })),
    category: "Basic",
    content: {
      type: "input",
    },
    select: false,
  },
  {
    id: "section",
    label: html`<p class="custom-font-size ">Section</p>`,
    media: editorIcons.section({ fill: "white", width: 25, height: 25 }),
    content: { type: "section" },
    category: "Layout",
    select: false,
  },
  {
    id: "container",
    label: html`<p class="custom-font-size ">Container</p>`,
    media: editorIcons.container({ fill: "white", width: 25, height: 25 }),
    category: "Layout",
    content: {
      type: "container",
    },
    select: false,
  },

  {
    id: "block",
    label: html`<p class="custom-font-size ">Block</p>`,
    media: editorIcons.block({ fill: "white", width: 25, height: 25 }),
    category: "Layout",
    content: {
      type: "block",
    },
    select: false,
  },

  {
    id: "heading",
    label: html`<p class="custom-font-size ">Heading</p>`,
    media: reactToStringMarkup(
      Icons.heading({ fill: "white", width: 25, height: 25 })
    ),
    category: "Basic",
    content: "<h1>Heading</h1>",
  },

  {
    id: "table",
    label: html`<p class="custom-font-size ">Table</p>`,
    media: reactToStringMarkup(
      Icons.table({ strokeColor: "white", width: 25, height: 25, fill: "none" })
    ),
    category: "Basic",
    content: html`
      <table class="w-full">
        <thead>
          <tr>
            <td class="p-10"></td>
            <td class="p-10"></td>
            <td class="p-10"></td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td class="p-10"></td>
            <td class="p-10"></td>
            <td class="p-10"></td>
          </tr>
          <tr>
            <td class="p-10"></td>
            <td class="p-10"></td>
            <td class="p-10"></td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td class="p-10"></td>
            <td class="p-10"></td>
            <td class="p-10"></td>
          </tr>
        </tfoot>
      </table>
    `,
  },

  {
    id: "splitter",
    label: html`<p class="custom-font-size ">Splitter</p>`,
    media: reactToStringMarkup(
      Icons.splitter({ strokeColor: "white", width: 25, height: 25 })
    ),
    category: "fancy",
    content: {
      type: "splitter",
    },
  },
  {
    id: "spline-viewer",
    label: html`<p class="custom-font-size ">Spline viewer</p>`,
    media: reactToStringMarkup(
      Icons.spline({
        strokeColor: "white",
        width: 25,
        height: 25,
        fill: "none",
      })
    ),
    category: "fancy",
    content: { type: "spline-viewer" },
    // `<spline-viewer></spline-viewer>`
  },

  {
    id: "slider",
    label: html`<p class="custom-font-size ">Slider</p>`,
    media: reactToStringMarkup(
      Icons.slider({ strokeColor: "white", width: 25, height: 25 })
    ),
    category: "fancy",
    content: { type: "slider" },
  },

  {
    id: "looper",
    label: html`<p class="custom-font-size ">Looper</p>`,
    media: reactToStringMarkup(
      Icons.looper({ strokeColor: "white", width: 25, height: 25 })
    ),
    category: "logic",
    content: {
      type: "looper",
    },
  },
  // {
  //   id: dynamic_text,
  //   label: "Dynamic Text",
  //   media: editorIcons.dynamicText,
  //   category: "Basic",
  //   content: {
  //     type: dynamic_text,
  //   },
  // },
  // {
  //   id:'template',
  //   label:'Template',
  //   media:editorIcons.looper,
  //   category:'Basic',
  //   content:{
  //     type:'template'
  //   }
  // }
];
//next steps : shoelace ان شاء الله 