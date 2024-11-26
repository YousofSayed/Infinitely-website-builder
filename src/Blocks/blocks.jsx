import { useRecoilValue } from "recoil";
import { html, uniqueID } from "../helpers/cocktail";
import { currentElState } from "../helpers/atoms";

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

const svgVideo = html`
  <?xml version="1.0" encoding="utf-8"?><svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="24"
    height="24"
    viewBox="0 0 121.78 122.88"
    style="enable-background:new 0 0 121.78 122.88"
    xml:space="preserve"
  >
    <style type="text/css">
      .st0 {
        fill-rule: evenodd;
        clip-rule: evenodd;
      }
    </style>
    <g>
      <path
        class="st0"
        d="M30.06,0h61.65c3.43,0,6.23,2.81,6.23,6.23v6.47H23.83V6.23C23.83,2.8,26.63,0,30.06,0L30.06,0z M11.23,38.38 h99.32c6.18,0,11.23,5.05,11.23,11.23v62.04c0,6.18-5.05,11.23-11.23,11.23H11.23C5.05,122.88,0,117.83,0,111.65V49.61 C0,43.43,5.05,38.38,11.23,38.38L11.23,38.38z M54.11,58.38L81.4,77.41c0.45,0.29,0.86,0.67,1.18,1.13 c1.28,1.85,0.81,4.39-1.04,5.67L54.37,103c-0.7,0.58-1.6,0.92-2.59,0.92c-2.26,0-4.09-1.83-4.09-4.09V61.72h0.02 c0-0.81,0.24-1.62,0.73-2.33C49.73,57.54,52.27,57.09,54.11,58.38L54.11,58.38z M18.14,18.81h85.49c3.43,0,6.23,2.81,6.23,6.23 v6.72H11.91v-6.72C11.91,21.61,14.71,18.81,18.14,18.81L18.14,18.81z"
      />
    </g>
  </svg>
`;

const jsxComponent = () => {
  const selectedEl = useRecoilValue(currentElState);
  return (
    <div>
      <custom-component>{selectedEl.currentEl.textContent}</custom-component>
    </div>
  );
};
let str = "${x}";

/**
 * @type {import('grapesjs').BlockProperties[]}
 */
export const blocks = [
  {
    id: uniqueID(),
    label: "Text",
    category: "Basic",
    media: svgText,
    activate: true,
    content: html`<p class="p-10">Insert your Text Here</p>`
  },
  {
    id: "link",
    label: "Link",
    category: "Basic",
    media: svgLink,
    activate: true,
    content: {
      type: "link",
      content: "Insert your link here",
      // style: { color: "#d983a6" },
    },
  },
  {
    id: "image",
    category: "Basic",
    label: html`<p class="custom-font-size">Image</p>`,
    media: svgImage,
    content: { type: "image" , onActive(ev){
      console.log('lol');
      
    } },
    activate: true,
    
    select: true,
    
  },
  {
    id: "video",
    category: "Basic",
    label: html`<p class="custom-font-size">Video</p>`,
    media: svgVideo,
    content: {
      type: "video",
    },
    select: true,
    activate: true,
  },

  {
    id: "button",
    category: "Basic",
    media: html`<svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#ffffff"
      stroke="#ffffff"
      style="width:24px;height:24px"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M20.5 17h-17A2.502 2.502 0 0 1 1 14.5v-4A2.502 2.502 0 0 1 3.5 8h17a2.502 2.502 0 0 1 2.5 2.5v4a2.502 2.502 0 0 1-2.5 2.5zm-17-8A1.502 1.502 0 0 0 2 10.5v4A1.502 1.502 0 0 0 3.5 16h17a1.502 1.502 0 0 0 1.5-1.5v-4A1.502 1.502 0 0 0 20.5 9zM17 12H7v1h10z"
        ></path>
        <path fill="none" d="M0 0h24v24H0z"></path>
      </g>
    </svg>`,
    label: html`<p class="custom-font-size">Button</p>`,
    content: html` 
       <button infinit="console.log('lol')" _="on mutation of @foo log 'foo' end ">Click me</button>
       <button _="on click set $div to document.createElement('button') then set $div.innerHTML to 'aywa b2aa' then put $div after me then $div.addEventListener('click', \ ev -> {console:log('lalala')})">Click me</button>
     `,
  },
  {
    id: "row",
    category: "Basic",
    label: html`<p class="custom-font-size ">Row</p>`,
    content: html`
      <section class="parent">
        <div class="row"></div>
        <div class="row"></div>
      </section>
    `,
    default: {},
  },
  {
   
    id:'input',
    label:'input',
    category:'Basic',
    content:{
      type:'input'
    }
  },
];
