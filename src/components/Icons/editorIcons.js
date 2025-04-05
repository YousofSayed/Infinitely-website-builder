import { css, html } from "../../helpers/cocktail";
const mainColor = "#64748B";

export const editorIcons = {
  reuseable: html`<svg
    fill="#ffffff"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 24.225 24.175"
    enable-background="new 0 0 24.225 24.175"
    xml:space="preserve"
    stroke="#fff"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <g>
        <path
          d="M7.428,17.653l0.016-3.873L6.14,15.082l-2.277-2.272c0,0-0.649-0.648-0.012-1.286L6.76,8.614L5.504,7.35l-3.59,3.588 c0,0-1.274,1.259,0.025,2.534l2.896,2.896l-1.277,1.284H7.428z"
        ></path>
        <path
          d="M10.568,7.41L9.257,6.096l2.275-2.277c0,0,0.646-0.65,1.283-0.012l2.908,2.91l1.272-1.264L13.401,1.87 c0,0-1.259-1.273-2.533,0.026L7.97,4.792L6.686,3.495l0.009,3.909L10.568,7.41z"
        ></path>
        <path
          d="M22.284,10.703L19.39,7.807l1.276-1.283l-3.87,0l-0.016,3.872l1.305-1.302l2.275,2.273c0,0,0.649,0.648,0.014,1.285 l-2.909,2.909l1.264,1.271l3.582-3.595C22.311,13.24,23.585,11.979,22.284,10.703z"
        ></path>
        <path
          d="M13.657,16.775l1.311,1.305l-2.274,2.277c0,0-0.647,0.648-1.284,0.012l-2.899-2.9l-1.271,1.265l3.586,3.574 c0,0,1.26,1.271,2.533-0.028l2.897-2.895l1.283,1.287l-0.001-3.881L13.657,16.775z"
        ></path>
      </g>
    </g>
  </svg>`,

  save: html`
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M0 1H6L9 4H16V14H0V1Z" fill="#ffffff"></path>
      </g>
    </svg>
  `,

  looper: html`<svg
    fill="#ffffff"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
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
        d="M18,7a7.669,7.669,0,0,0-6,3.19A7.669,7.669,0,0,0,6,7C2.313,7,1,9.583,1,12c0,3.687,2.583,5,5,5a7.669,7.669,0,0,0,6-3.19A7.669,7.669,0,0,0,18,17c2.417,0,5-1.313,5-5C23,9.583,21.687,7,18,7ZM6,15a2.689,2.689,0,0,1-3-3A2.689,2.689,0,0,1,6,9c2.579,0,4.225,2.065,4.837,3C10.225,12.935,8.579,15,6,15Zm12,0c-2.579,0-4.225-2.065-4.837-3,.612-.935,2.258-3,4.837-3a2.689,2.689,0,0,1,3,3A2.689,2.689,0,0,1,18,15Z"
      ></path>
    </g>
  </svg>`,

  runHsCmds: html`
    <svg
      fill="#fff"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 338.044 338.045"
      xml:space="preserve"
      stroke="#fff"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path
            d="M269.016,0h-99.652c-13.583,0-30.204,9.476-37.122,21.164L59.188,144.599c-6.917,11.688-1.513,21.164,12.07,21.164h73.511 l-78.183,56.613c-11.007,7.962-8.911,14.423,4.672,14.423h43.061l-49.11,90.049c-6.506,11.919-3.123,14.777,7.551,6.371 l125.996-99.26c10.664-8.406,8.593-15.469-4.648-15.769c-13.229-0.3-23.962-0.553-23.962-0.553l82.798-75.837 c10.016-9.176,7.127-16.369-6.456-16.066l-76.342,1.696L276.499,17.666C285.95,7.908,282.599,0,269.016,0z"
          ></path>
        </g>
      </g>
    </svg>
  `,

  addElement: html`
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      fill="#ffffff"
      stroke="#ffffff"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M839.7 734.7c0 33.3-17.9 41-17.9 41S519.7 949.8 499.2 960c-10.2 5.1-20.5 5.1-30.7 0 0 0-314.9-184.3-325.1-192-5.1-5.1-10.2-12.8-12.8-20.5V368.6c0-17.9 20.5-28.2 20.5-28.2L466 158.6c12.8-5.1 25.6-5.1 38.4 0 0 0 279 161.3 309.8 179.2 17.9 7.7 28.2 25.6 25.6 46.1-.1-5-.1 317.5-.1 350.8zM714.2 371.2c-64-35.8-217.6-125.4-217.6-125.4-7.7-5.1-20.5-5.1-30.7 0L217.6 389.1s-17.9 10.2-17.9 23v297c0 5.1 5.1 12.8 7.7 17.9 7.7 5.1 256 148.5 256 148.5 7.7 5.1 17.9 5.1 25.6 0 15.4-7.7 250.9-145.9 250.9-145.9s12.8-5.1 12.8-30.7v-74.2l-276.5 169v-64c0-17.9 7.7-30.7 20.5-46.1L745 535c5.1-7.7 10.2-20.5 10.2-30.7v-66.6l-279 169v-69.1c0-15.4 5.1-30.7 17.9-38.4l220.1-128zM919 135.7c0-5.1-5.1-7.7-7.7-7.7h-58.9V66.6c0-5.1-5.1-5.1-10.2-5.1l-30.7 5.1c-5.1 0-5.1 2.6-5.1 5.1V128h-56.3c-5.1 0-5.1 5.1-7.7 5.1v38.4h69.1v64c0 5.1 5.1 5.1 10.2 5.1l30.7-5.1c5.1 0 5.1-2.6 5.1-5.1v-56.3h64l-2.5-38.4z"
          fill="#ffffff"
        ></path>
      </g>
    </svg>
  `,

  dynamicText: html`
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M10 8C14.4183 8 18 6.65685 18 5C18 3.34315 14.4183 2 10 2C5.58172 2 2 3.34315 2 5C2 6.65685 5.58172 8 10 8ZM16.9297 8.5C15.5465 9.3967 12.9611 10 10 10C7.03887 10 4.4535 9.3967 3.07026 8.5C2.38958 8.94126 2 9.45357 2 10C2 11.6569 5.58172 13 10 13C14.4183 13 18 11.6569 18 10C18 9.45357 17.6104 8.94126 16.9297 8.5ZM16.9297 13.5C15.5465 14.3967 12.9611 15 10 15C7.03887 15 4.4535 14.3967 3.07026 13.5C2.38958 13.9413 2 14.4536 2 15C2 16.6569 5.58172 18 10 18C14.4183 18 18 16.6569 18 15C18 14.4536 17.6104 13.9413 16.9297 13.5Z"
          fill="#fff"
        ></path>
      </g>
    </svg>
  `,

  dynamicTemp: html`
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strok-linecap="round"
        strok-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>Dynamic Template</title>
        <path
          fill="white"
          stroke-width=".3"
          stroke=""
          d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zM16.795 22.677c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z"
        ></path>
      </g>
    </svg>
  `,

  columns: html`
    <svg
      width="30"
      height="30"
      viewBox="0 0 66 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.489243"
        y="-0.489243"
        width="17.9389"
        height="54.7953"
        rx="3.4247"
        transform="matrix(1 0 0 -1 0.531982 55.5664)"
        fill="#fff"
      />
      <rect
        x="0.489243"
        y="-0.489243"
        width="17.9389"
        height="54.7953"
        rx="3.4247"
        transform="matrix(1 0 0 -1 0.531982 55.5664)"
        stroke="#64748B"
        stroke-width="0.978487"
        stroke-dasharray="1.96 1.96"
      />
      <rect
        width="18.9174"
        height="55.7737"
        rx="3.91395"
        transform="matrix(1 0 0 -1 23.3635 56.5449)"
        fill="#fff"
      />
      <rect
        x="0.489243"
        y="-0.489243"
        width="17.9389"
        height="54.7953"
        rx="3.4247"
        transform="matrix(1 0 0 -1 46.1949 55.5665)"
        fill="#fff"
      />
      <rect
        x="0.489243"
        y="-0.489243"
        width="17.9389"
        height="54.7953"
        rx="3.4247"
        transform="matrix(1 0 0 -1 46.1949 55.5665)"
        stroke="#64748B"
        stroke-width="0.978487"
        stroke-dasharray="1.96 1.96"
      />
    </svg>
  `,

  button: html`<svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="#ffffff"
    style="width:35px;height:35px"
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

  input: html`
    <svg
      width="35"
      viewBox="0 0 65 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="64.5801"
        height="19.5697"
        rx="3.91395"
        transform="matrix(1 0 0 -1 0.351013 20.443)"
        fill="#fff"
      />
      <path d="M7.15305 7.54184V14.6581H6.33302V7.54184H7.15305Z" fill="#000" />
    </svg>
  `,
  container: ({ fill = mainColor, width = 24, height = 24 }) => html`
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      fill=${fill}
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>container-solid</title>
        <g id="Layer_2" data-name="Layer 2">
          <g id="invisible_box" data-name="invisible box">
            <rect width="48" height="48" fill="none"></rect>
          </g>
          <g id="icons_Q2" data-name="icons Q2">
            <path
              d="M44,6H4A2,2,0,0,0,2,8V40a2,2,0,0,0,2,2H44a2,2,0,0,0,2-2V8A2,2,0,0,0,44,6ZM14,32a2,2,0,0,1-4,0V16a2,2,0,0,1,4,0Zm8,0a2,2,0,0,1-4,0V16a2,2,0,0,1,4,0Zm8,0a2,2,0,0,1-4,0V16a2,2,0,0,1,4,0Zm8,0a2,2,0,0,1-4,0V16a2,2,0,0,1,4,0Z"
            ></path>
          </g>
        </g>
      </g>
    </svg>
  `,

  templates: ({ width = 20, height = 20, fill = mainColor }) =>
    html`
      <svg
        width=${width}
        height=${height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M3 8H16.2C17.8802 8 18.7202 8 19.362 8.32698C19.9265 8.6146 20.3854 9.07354 20.673 9.63803C21 10.2798 21 11.1198 21 12.8V14.2C21 15.8802 21 16.7202 20.673 17.362C20.3854 17.9265 19.9265 18.3854 19.362 18.673C18.7202 19 17.8802 19 16.2 19H7.8C6.11984 19 5.27976 19 4.63803 18.673C4.07354 18.3854 3.6146 17.9265 3.32698 17.362C3 16.7202 3 15.8802 3 14.2V8Z"
            fill="${fill}"
          ></path>
          {" "}
          <path
            d="M3 8C3 7.06812 3 6.60218 3.15224 6.23463C3.35523 5.74458 3.74458 5.35523 4.23463 5.15224C4.60218 5 5.06812 5 6 5H8.34315C9.16065 5 9.5694 5 9.93694 5.15224C10.3045 5.30448 10.5935 5.59351 11.1716 6.17157L13 8H3Z"
            fill=${fill}
          ></path>
          {" "}
        </g>
      </svg>
    `,
  components: ({ width = 23, height = 23, strokeColor, strokeWidth }) =>
    html`
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 23 22"
        fill="none"
        style="fill:transparent!important;"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.75001 5.25L17.25 16.75M17.25 5.25L5.75001 16.75M20.45 13.55L14.06 19.94C12.66 21.34 10.36 21.34 8.95001 19.94L2.56001 13.55C1.16001 12.15 1.16001 9.85 2.56001 8.44L8.95001 2.05C10.35 0.65 12.65 0.65 14.06 2.05L20.45 8.44C21.85 9.85 21.85 12.15 20.45 13.55Z"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    `,

  vue: ({ fill = mainColor, width = 20, height = 20 }) =>
    html`
      <svg
        viewBox="0 0 15 15"
        width="${width}"
        height="${height}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M2.71693 1H0.5C0.320967 1 0.155598 1.09572 0.0664289 1.25097C-0.0227402 1.40622 -0.0220988 1.59729 0.0681106 1.75194L7.06811 13.7519C7.15772 13.9055 7.32217 14 7.5 14C7.67783 14 7.84228 13.9055 7.93189 13.7519L14.9319 1.75194C15.0221 1.59729 15.0227 1.40622 14.9336 1.25097C14.8444 1.09572 14.679 1 14.5 1H12.2831L7.50004 8.97184L2.71693 1Z"
            fill="${fill}"
          ></path>
          <path
            d="M11.1169 1H8.191L7.50002 2.38197L6.80903 1H3.88312L7.50004 7.02819L11.1169 1Z"
            fill="${fill}"
          ></path>
        </g>
      </svg>
    `,
  editGjsComponent: ({ fill = mainColor, width = 20, height = 20 }) =>
    html`
      <svg
        viewBox="0 0 20 20"
        width="${width}"
        height="${height}"
        xmlns="http://www.w3.org/2000/svg"
        fill="${fill}"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M14.846 1.403l3.752 3.753.625-.626A2.653 2.653 0 0015.471.778l-.625.625zm2.029 5.472l-3.752-3.753L1.218 15.028 0 19.998l4.97-1.217L16.875 6.875z"
            fill="${fill}"
          ></path>
        </g>
      </svg>
    `,
  section: ({ fill = mainColor, width = 20, height = 20 }) => html`
    <svg
      fill="${fill}"
      width="${width}"
      height="${height}"
      viewBox="0 0 100 100"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M31,34H69a1,1,0,0,0,1-1V29a1,1,0,0,0-1-1H31a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1m41,6H28a4,4,0,0,1-4-4V26a4,4,0,0,1,4-4H72a4,4,0,0,1,4,4V36a4,4,0,0,1-4,4"
          fill-rule="evenodd"
        ></path>
        <path
          d="M31,72H69a1,1,0,0,0,1-1V67a1,1,0,0,0-1-1H31a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1m41,6H28a4,4,0,0,1-4-4V64a4,4,0,0,1,4-4H72a4,4,0,0,1,4,4V74a4,4,0,0,1-4,4"
          fill-rule="evenodd"
        ></path>
        <path
          d="M77,54H67a3,3,0,0,1-3-3V49a3,3,0,0,1,3-3H77a3,3,0,0,1,3,3v2a3,3,0,0,1-3,3"
          fill-rule="evenodd"
        ></path>
        <path
          d="M55,54H45a3,3,0,0,1-3-3V49a3,3,0,0,1,3-3H55a3,3,0,0,1,3,3v2a3,3,0,0,1-3,3"
          fill-rule="evenodd"
        ></path>
        <path
          d="M33,54H23a3,3,0,0,1-3-3V49a3,3,0,0,1,3-3H33a3,3,0,0,1,3,3v2a3,3,0,0,1-3,3"
          fill-rule="evenodd"
        ></path>
      </g>
    </svg>
  `,
  block: ({ fill = mainColor, width = 20, height = 20 }) => html`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      fill=${fill}
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <rect x="0" fill="none" width="20" height="20"></rect>
        <g>
          <path
            d="M15 6V4h-3v2H8V4H5v2H4c-.6 0-1 .4-1 1v8h14V7c0-.6-.4-1-1-1h-1z"
          ></path>
        </g>
      </g>
    </svg>
  `,
};
