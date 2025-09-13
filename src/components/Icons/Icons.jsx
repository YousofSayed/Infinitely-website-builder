import { Path } from "../Protos/Path";
export const mainColor = "#64748B";

export const Icons = {
  components: (strokeColor, strokeWidth) => (
    <svg
      width="23"
      height="22"
      viewBox="0 0 23 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.75001 5.25L17.25 16.75M17.25 5.25L5.75001 16.75M20.45 13.55L14.06 19.94C12.66 21.34 10.36 21.34 8.95001 19.94L2.56001 13.55C1.16001 12.15 1.16001 9.85 2.56001 8.44L8.95001 2.05C10.35 0.65 12.65 0.65 14.06 2.05L20.45 8.44C21.85 9.85 21.85 12.15 20.45 13.55Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  templates: ({ width = 20, height = 20, fill = mainColor }) => (
    <svg
      width={width}
      height={height}
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
          fill={fill}
        ></path>{" "}
        <path
          d="M3 8C3 7.06812 3 6.60218 3.15224 6.23463C3.35523 5.74458 3.74458 5.35523 4.23463 5.15224C4.60218 5 5.06812 5 6 5H8.34315C9.16065 5 9.5694 5 9.93694 5.15224C10.3045 5.30448 10.5935 5.59351 11.1716 6.17157L13 8H3Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  heading: ({ fill = mainColor, width = 18, height = 18 }) => (
    <svg
      width={width}
      height={height}
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 5C7.55228 5 8 5.44772 8 6V11.5H16V6C16 5.44772 16.4477 5 17 5C17.5523 5 18 5.44772 18 6V12.5V19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19V13.5H8V19C8 19.5523 7.55228 20 7 20C6.44772 20 6 19.5523 6 19V12.5V6C6 5.44772 6.44772 5 7 5Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  video: ({ width = 24, height = 24, fill = mainColor }) => (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 121.78 122.88"
      // style="enable-background:new 0 0 121.78 122.88"
      fill={fill}
      xmlSpace="preserve"
    >
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.06,0h61.65c3.43,0,6.23,2.81,6.23,6.23v6.47H23.83V6.23C23.83,2.8,26.63,0,30.06,0L30.06,0z M11.23,38.38 h99.32c6.18,0,11.23,5.05,11.23,11.23v62.04c0,6.18-5.05,11.23-11.23,11.23H11.23C5.05,122.88,0,117.83,0,111.65V49.61 C0,43.43,5.05,38.38,11.23,38.38L11.23,38.38z M54.11,58.38L81.4,77.41c0.45,0.29,0.86,0.67,1.18,1.13 c1.28,1.85,0.81,4.39-1.04,5.67L54.37,103c-0.7,0.58-1.6,0.92-2.59,0.92c-2.26,0-4.09-1.83-4.09-4.09V61.72h0.02 c0-0.81,0.24-1.62,0.73-2.33C49.73,57.54,52.27,57.09,54.11,58.38L54.11,58.38z M18.14,18.81h85.49c3.43,0,6.23,2.81,6.23,6.23 v6.72H11.91v-6.72C11.91,21.61,14.71,18.81,18.14,18.81L18.14,18.81z"
        />
      </g>
    </svg>
  ),
  image: ({ width = 24, height = 24, fill = "currentColor" }) => (
    <svg width={width} height={height} viewBox="0 0 24 24">
      <path
        fill={fill}
        d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"
      />
    </svg>
  ),
  button: ({ fill = mainColor, width = 25, height = 25 }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M20.5 17h-17A2.502 2.502 0 0 1 1 14.5v-4A2.502 2.502 0 0 1 3.5 8h17a2.502 2.502 0 0 1 2.5 2.5v4a2.502 2.502 0 0 1-2.5 2.5zm-17-8A1.502 1.502 0 0 0 2 10.5v4A1.502 1.502 0 0 0 3.5 16h17a1.502 1.502 0 0 0 1.5-1.5v-4A1.502 1.502 0 0 0 20.5 9zM17 12H7v1h10z"></path>
        <path fill="none" d="M0 0h24v24H0z"></path>
      </g>
    </svg>
  ),
  link: ({ fill = mainColor, width = 24, height = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24">
      <path
        fill={fill}
        d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"
      />
    </svg>
  ),
  input: ({ fill = mainColor, width = 35, height = 24 }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 65 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="64.5801"
        height="19.5697"
        rx="3.91395"
        transform="matrix(1 0 0 -1 0.351013 20.443)"
        fill={fill}
      />
      <path d="M7.15305 7.54184V14.6581H6.33302V7.54184H7.15305Z" fill="#000" />
    </svg>
  ),
  zoomIn: ({ fill = mainColor, width = 25, height = 18 }) => (
    // <svg
    //   style={{
    //     width,
    //     height,
    //   }}
    //   viewBox="-2.4 -2.4 28.80 28.80"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    //   <g
    //     id="SVGRepo_tracerCarrier"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   ></g>
    //   <g id="SVGRepo_iconCarrier">
    //     {" "}
    //     <Path
    //       dontFileStroke
    //       justFillOnHover
    //       d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 11.381 14.4415 12.6296 13.5355 13.5355C12.6296 14.4415 11.381 15 10 15C7.23858 15 5 12.7614 5 10ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C11.5719 17 13.0239 16.481 14.1921 15.6063L19.2929 20.7071C19.6834 21.0976 20.3166 21.0976 20.7071 20.7071C21.0976 20.3166 21.0976 19.6834 20.7071 19.2929L15.6063 14.1921C16.481 13.0239 17 11.5719 17 10C17 6.13401 13.866 3 10 3ZM11 8C11 7.44772 10.5523 7 10 7C9.44772 7 9 7.44772 9 8V9H8C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11H9V12C9 12.5523 9.44772 13 10 13C10.5523 13 11 12.5523 11 12V11H12C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9H11V8Z"
    //       fill={fill}
    //       stroke="none"
    //       // fill="none"
    //     ></Path>{" "}
    //   </g>
    // </svg>
    <svg
      style={{ width, height }}
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
        <Path
          dontFileStroke
          justFillOnHover
          d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 11.381 14.4415 12.6296 13.5355 13.5355C12.6296 14.4415 11.381 15 10 15C7.23858 15 5 12.7614 5 10ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C11.5719 17 13.0239 16.481 14.1921 15.6063L19.2929 20.7071C19.6834 21.0976 20.3166 21.0976 20.7071 20.7071C21.0976 20.3166 21.0976 19.6834 20.7071 19.2929L15.6063 14.1921C16.481 13.0239 17 11.5719 17 10C17 6.13401 13.866 3 10 3ZM11 8C11 7.44772 10.5523 7 10 7C9.44772 7 9 7.44772 9 8V9H8C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11H9V12C9 12.5523 9.44772 13 10 13C10.5523 13 11 12.5523 11 12V11H12C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9H11V8Z"
          fill={fill}
          strokeWidth="0"
        ></Path>{" "}
      </g>
    </svg>
  ),
  zoomOut: ({ fill = mainColor, width = 20, height = 20 }) => (
    <svg
      style={{ width, height }}
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
        <Path
          // dontFileStroke
          justFillOnHover
          d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 11.381 14.4415 12.6296 13.5355 13.5355C12.6296 14.4415 11.381 15 10 15C7.23858 15 5 12.7614 5 10ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C11.5719 17 13.0239 16.481 14.1921 15.6063L19.2929 20.7071C19.6834 21.0976 20.3166 21.0976 20.7071 20.7071C21.0976 20.3166 21.0976 19.6834 20.7071 19.2929L15.6063 14.1921C16.481 13.0239 17 11.5719 17 10C17 6.13401 13.866 3 10 3ZM8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11H12C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9H8Z"
          fill={fill}
          strokeWidth="0"
        ></Path>{" "}
      </g>
    </svg>
    // <svg
    //   fill={fill}
    //   viewBox="0 0 32 32"
    //   version="1.1"
    // style={{width,height}}
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    //   <g
    //     id="SVGRepo_tracerCarrier"
    //     strokeLinecap="round"
    //     strokeLinejoin="round"
    //   ></g>
    //   <g id="SVGRepo_iconCarrier">
    //     {" "}
    //     <title>zoomout</title>{" "}
    //     <Path
    //     // fill="none"
    //     dontFileStroke

    //     d="M16.906 20.188l5.5 5.5-2.25 2.281-5.75-5.781c-1.406 0.781-3.031 1.219-4.719 1.219-5.344 0-9.688-4.344-9.688-9.688s4.344-9.688 9.688-9.688 9.719 4.344 9.719 9.688c0 2.5-0.969 4.781-2.5 6.469zM2.688 13.719c0 3.875 3.125 6.969 7 6.969 3.844 0 7-3.094 7-6.969s-3.156-6.969-7-6.969c-3.875 0-7 3.094-7 6.969zM4.438 12.625h10.531v2.219h-10.531v-2.219z"></Path>{" "}
    //   </g>
    // </svg>
  ),
  text: ({ fill = mainColor, width = 24, height = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24">
      <path
        fill={fill}
        d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"
      />
    </svg>
  ),
  vue: ({ fill = mainColor, width = 20, height = 20 }) => (
    <svg
      viewBox="0 0 15 15"
      width={width}
      height={height}
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
          d="M2.71693 1H0.5C0.320967 1 0.155598 1.09572 0.0664289 1.25097C-0.0227402 1.40622 -0.0220988 1.59729 0.0681106 1.75194L7.06811 13.7519C7.15772 13.9055 7.32217 14 7.5 14C7.67783 14 7.84228 13.9055 7.93189 13.7519L14.9319 1.75194C15.0221 1.59729 15.0227 1.40622 14.9336 1.25097C14.8444 1.09572 14.679 1 14.5 1H12.2831L7.50004 8.97184L2.71693 1Z"
          fill={fill}
        ></path>{" "}
        <path
          d="M11.1169 1H8.191L7.50002 2.38197L6.80903 1H3.88312L7.50004 7.02819L11.1169 1Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  editGjsComponent: ({ fill = mainColor, width = 20, height = 20 }) => (
    <svg
      viewBox="0 0 20 20"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
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
          fill={fill}
        ></path>
      </g>
    </svg>
  ),
  select: (strokeColor, strokeWidth, fill) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 5.49939C8.40993 5.49939 5.49951 8.40981 5.49951 12C5.49951 15.5902 8.40993 18.5006 12.0001 18.5006C15.5903 18.5006 18.5007 15.5902 18.5007 12C18.5007 8.40981 15.5903 5.49939 12.0001 5.49939ZM3.99951 12C3.99951 7.58139 7.58151 3.99939 12.0001 3.99939C16.4187 3.99939 20.0007 7.58139 20.0007 12C20.0007 16.4186 16.4187 20.0006 12.0001 20.0006C7.58151 20.0006 3.99951 16.4186 3.99951 12Z"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        ></Path>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0002 9.5C10.6194 9.5 9.50016 10.6193 9.50016 12C9.50016 13.3807 10.6194 14.5 12.0002 14.5C13.3809 14.5 14.5002 13.3807 14.5002 12C14.5002 10.6193 13.3809 9.5 12.0002 9.5ZM8.00016 12C8.00016 9.79086 9.79102 8 12.0002 8C14.2093 8 16.0002 9.79086 16.0002 12C16.0002 14.2091 14.2093 16 12.0002 16C9.79102 16 8.00016 14.2091 8.00016 12Z"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        ></Path>
      </g>
    </svg>
  ),
  info: ({
    width = 20,
    height = 20,
    strokeColor = "#CBD5E1",
    strokeWidth = "1.5",
    fill,
  }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
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
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        ></circle>
        <path
          d="M12 17V11"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        ></path>
        <circle
          cx="1"
          cy="1"
          r="1"
          transform="matrix(1 0 0 -1 11 9)"
          fill={fill}
        ></circle>{" "}
      </g>
    </svg>
  ),
  table: ({
    width = 20,
    height = 20,
    strokeColor = mainColor,
    strokeWidth = "1.5",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      style={{ fill: fill }}
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
          d="M9 4L9 20M15 4L15 20M3 9H21M3 15H21M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  ),
  search({
    width = 20,
    height = 20,
    strokeColor = "#ffffff",
    strokeWidth = "2",
    fill,
  }) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={strokeColor}
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
            d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>{" "}
        </g>
      </svg>
    );
  },

  model: ({
    strokeColor,
    width = 25,
    height = 25,
    strokWidth = "1.472",
    fill = "#CBD5E1",
  }) => (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={width}
      height={height}
      stroke={fill}
      strokeWidth={strokWidth}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <rect x="8" y="40" width="16" height="16"></rect>
        <rect x="40" y="40" width="16" height="16"></rect>
        <rect x="24" y="8" width="16" height="16"></rect>
        <polyline points="48 40 48 32 16 32 16 40"></polyline>
        <line x1="32" y1="32" x2="32" y2="24"></line>
      </g>
    </svg>
  ),

  db: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M19 12.65V16.35C19 19.47 16.09 22 12.5 22C8.91 22 6 19.47 6 16.35V12.65C6 15.77 8.91 18 12.5 18C16.09 18 19 15.77 19 12.65Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M19 7.65C19 8.56 18.75 9.4 18.31 10.12C17.24 11.88 15.04 13 12.5 13C9.96 13 7.76 11.88 6.69 10.12C6.25 9.4 6 8.56 6 7.65C6 6.09 6.73 4.68 7.9 3.66C9.08 2.63 10.7 2 12.5 2C14.3 2 15.92 2.63 17.1 3.65C18.27 4.68 19 6.09 19 7.65Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M19 7.65V12.65C19 15.77 16.09 18 12.5 18C8.91 18 6 15.77 6 12.65V7.65C6 4.53 8.91 2 12.5 2C14.3 2 15.92 2.63 17.1 3.65C18.27 4.68 19 6.09 19 7.65Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  close: (strokeColor, strokeWidth, fill) => (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: "pointer" }}
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        {" "}
        <g>
          {" "}
          <Path
            d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          ></Path>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  gallery: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M9.5 22H15.5C20.5 22 22.5 20 22.5 15V9C22.5 4 20.5 2 15.5 2H9.5C4.5 2 2.5 4 2.5 9V15C2.5 20 4.5 22 9.5 22Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M3.17004 18.95L8.10004 15.64C8.89004 15.11 10.03 15.17 10.74 15.78L11.07 16.07C11.85 16.74 13.11 16.74 13.89 16.07L18.05 12.5C18.83 11.83 20.09 11.83 20.87 12.5L22.5 13.9M9.50004 10C10.0305 10 10.5392 9.78929 10.9143 9.41421C11.2893 9.03914 11.5 8.53043 11.5 8C11.5 7.46957 11.2893 6.96086 10.9143 6.58579C10.5392 6.21071 10.0305 6 9.50004 6C8.96961 6 8.4609 6.21071 8.08583 6.58579C7.71076 6.96086 7.50004 7.46957 7.50004 8C7.50004 8.53043 7.71076 9.03914 8.08583 9.41421C8.4609 9.78929 8.96961 10 9.50004 10Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  plus: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1.5 7H13.5M7.5 13V1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),

  css: ({ width = 20, height = 20 }) => (
    <svg
      viewBox="0 0 32 32"
      width={width}
      height={height}
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
        <path d="M6 28L4 3H28L26 28L16 31L6 28Z" fill="#1172B8"></path>{" "}
        <path d="M26 5H16V29.5L24 27L26 5Z" fill="#33AADD"></path>{" "}
        <path
          d="M19.5 17.5H9.5L9 14L17 11.5H9L8.5 8.5H24L23.5 12L17 14.5H23L22 24L16 26L10 24L9.5 19H12.5L13 21.5L16 22.5L19 21.5L19.5 17.5Z"
          fill="white"
        ></path>{" "}
      </g>
    </svg>
  ),

  html: ({ width = 20, height = 20 }) => (
    <svg
      height={width}
      width={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HTML5"
      role="img"
      viewBox="0 0 512 512"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path fill="#e34f26" d="M71 460L30 0h451l-41 460-185 52"></path>
        <path fill="#ef652a" d="M256 472l149-41 35-394H256"></path>
        <path
          fill="#ebebeb"
          d="M256 208h-75l-5-58h80V94H114l15 171h127zm-1 147l-63-17-4-45h-56l7 89 116 32z"
        ></path>
        <path
          fill="#ffffff"
          d="M255 208v57h70l-7 73-63 17v59l116-32 16-174zm0-114v56h137l5-56z"
        ></path>
      </g>
    </svg>
  ),
  js: ({ width = 20, height = 20 }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>file_type_js_official</title>
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          style={{ fill: "#f5de19" }}
        ></rect>
        <path d="M20.809,23.875a2.866,2.866,0,0,0,2.6,1.6c1.09,0,1.787-.545,1.787-1.3,0-.9-.716-1.222-1.916-1.747l-.658-.282c-1.9-.809-3.16-1.822-3.16-3.964,0-1.973,1.5-3.476,3.853-3.476a3.889,3.889,0,0,1,3.742,2.107L25,18.128A1.789,1.789,0,0,0,23.311,17a1.145,1.145,0,0,0-1.259,1.128c0,.789.489,1.109,1.618,1.6l.658.282c2.236.959,3.5,1.936,3.5,4.133,0,2.369-1.861,3.667-4.36,3.667a5.055,5.055,0,0,1-4.795-2.691Zm-9.295.228c.413.733.789,1.353,1.693,1.353.864,0,1.41-.338,1.41-1.653V14.856h2.631v8.982c0,2.724-1.6,3.964-3.929,3.964a4.085,4.085,0,0,1-3.947-2.4Z"></path>
      </g>
    </svg>
  ),
  code: ({
    width = 20,
    height = 20,
    strokeColor = mainColor,
    strokeWidth = 2,
  }) => (
    <svg
      width={width}
      height={height}
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
        <Path
          d="M7 8L3 11.6923L7 16M17 8L21 11.6923L17 16M14 4L10 20"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
      </g>
    </svg>
  ),

  logo: ({
    strokeColor = "white",
    strokeWidth = 1.5,
    width = 43,
    height = 43,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 43 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="43" height="43" rx="21.5" fill="#2563EB" />
      <Path
        d="M20.18 18.32C19.7657 17.7412 19.2194 17.2697 18.5863 16.9444C17.9533 16.6192 17.2517 16.4497 16.54 16.45C14.03 16.45 11.99 18.49 11.99 21C11.99 23.51 14.03 25.55 16.54 25.55C18.23 25.55 19.8 24.66 20.67 23.21L22 21L23.32 18.79C23.748 18.0768 24.3533 17.4865 25.077 17.0765C25.8007 16.6664 26.6182 16.4506 27.45 16.45C29.96 16.45 32 18.49 32 21C32 23.51 29.96 25.55 27.45 25.55C25.95 25.55 24.64 24.81 23.81 23.68"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  square: (strokeColor, strokeWidth) => (
    <svg width="23" height="23" fill="none" viewBox="0 0 24 24">
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z"
      ></Path>
    </svg>
  ),
  fullscreen: ({ width = 20, height = 20, fill = mainColor }) => (
    <svg
      width={width}
      height={height}
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
          d="M4 1.5C2.61929 1.5 1.5 2.61929 1.5 4V8.5C1.5 9.05228 1.94772 9.5 2.5 9.5H3.5C4.05228 9.5 4.5 9.05228 4.5 8.5V4.5H8.5C9.05228 4.5 9.5 4.05228 9.5 3.5V2.5C9.5 1.94772 9.05228 1.5 8.5 1.5H4Z"
          fill={fill}
        ></path>{" "}
        <path
          d="M20 1.5C21.3807 1.5 22.5 2.61929 22.5 4V8.5C22.5 9.05228 22.0523 9.5 21.5 9.5H20.5C19.9477 9.5 19.5 9.05228 19.5 8.5V4.5H15.5C14.9477 4.5 14.5 4.05228 14.5 3.5V2.5C14.5 1.94772 14.9477 1.5 15.5 1.5H20Z"
          fill={fill}
        ></path>{" "}
        <path
          d="M20 22.5C21.3807 22.5 22.5 21.3807 22.5 20V15.5C22.5 14.9477 22.0523 14.5 21.5 14.5H20.5C19.9477 14.5 19.5 14.9477 19.5 15.5V19.5H15.5C14.9477 19.5 14.5 19.9477 14.5 20.5V21.5C14.5 22.0523 14.9477 22.5 15.5 22.5H20Z"
          fill={fill}
        ></path>{" "}
        <path
          d="M1.5 20C1.5 21.3807 2.61929 22.5 4 22.5H8.5C9.05228 22.5 9.5 22.0523 9.5 21.5V20.5C9.5 19.9477 9.05228 19.5 8.5 19.5H4.5V15.5C4.5 14.9477 4.05228 14.5 3.5 14.5H2.5C1.94772 14.5 1.5 14.9477 1.5 15.5V20Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  minimize: ({
    width = 20,
    height = 20,
    strokeColor = mainColor,
    strokWidth = 1.5,
  }) => (
    <svg
      width={width}
      height={height}
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
          d="M2 22L2.875 21.125M9 15H3.14286M9 15V20.8571M9 15L5.5 18.5"
          stroke={strokeColor}
          strokeWidth={strokWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M22 2L15 9M15 9H20.8571M15 9V3.14286"
          stroke={strokeColor}
          strokeWidth={strokWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  ),
  newLine: (strokeColor, strokeWidth) => (
    <svg
      fill="transparent"
      width="20px"
      height="20px"
      viewBox="0 0 32 32"
      id="icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>new-line</title>
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M20.5859,14.4141,24.1719,18H6V8H4V18a2.0024,2.0024,0,0,0,2,2H24.1719L20.586,23.5859,22,25l6-6-6-6Z"
        ></Path>
        <rect
          id="_Transparent_Rectangle_"
          data-name="<Transparent Rectangle>"
          className="cls-1"
          width="24"
          height="24"
        ></rect>
      </g>
    </svg>
  ),
  helmet: ({ fill = mainColor, width = 20, height = 20 }) => (
    <svg
      viewBox="0 0 20 20"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title>helmet [#591]</title> <desc>Created with Sketch.</desc>{" "}
        <defs> </defs>{" "}
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          {" "}
          <g
            id="Dribbble-Light-Preview"
            transform="translate(-340.000000, -5559.000000)"
            fill={fill}
          >
            {" "}
            <g id="icons" transform="translate(56.000000, 160.000000)">
              {" "}
              <path
                d="M301.969958,5403.018 C301.396916,5402.252 300.719049,5401.573 299.955326,5401 C298.288113,5399.749 296.225561,5399 293.98331,5399 C291.741059,5399 289.678507,5399.749 288.011294,5401 C286.819287,5401.894 284.68186,5404.215 284.245589,5407 L296.978303,5407 L294.981641,5413 L284,5413 L284,5414.833 C284,5417.042 285.788011,5419 287.993324,5419 L299.973296,5419 C302.178609,5419 303.96662,5417.042 303.96662,5414.833 C303.96662,5408.958 304.421859,5406.297 301.969958,5403.018 L301.969958,5403.018 Z"
                id="helmet-[#591]"
              >
                {" "}
              </path>{" "}
            </g>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  ),

  layers: (strokeColor, strokeWidth, fill = "#64748B") => (
    <svg width="23" height="23" fill="none" viewBox="0 0 24 24">
      <Path
        justFillOnHover={true}
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"
      ></Path>
    </svg>
  ),
  style: (strokeColor, strokeWidth) => (
    <svg width="25" height="25" fill="none" viewBox="0 0 24 24">
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fillRule="evenodd"
        d="M13 21v-8h8v8h-8zm2-6h4v4h-4v-4zM3 11V3h8v8H3zm2-6h4v4H5V5z"
        clipRule="evenodd"
      />
      <path fill="#cbd5e1" d="M18 6v6h-2V8h-4V6h6zM12 18H6v-6h2v4h4v2z" />
    </svg>
  ),
  stNote: (strokeColor, strokeWidth, width = 25, height = 24) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M8.5 2V5M16.5 2V5M7.5 11H15.5M7.5 15H12.5M15.5 22H9.5C4.5 22 3.5 19.94 3.5 15.82V9.65C3.5 4.95 5.17 3.69 8.5 3.5H16.5C19.83 3.68 21.5 4.95 21.5 9.65V16"
        strokeMiterlimit="10"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M21.5 16L15.5 22V19C15.5 17 16.5 16 18.5 16H21.5Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  showInFrontEnd: ({
    width = 18,
    height = 18,
    strokWidth = 2,
    strokeColor = mainColor,
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <Path
        d="M9.25 14.523 23.25 0.75"
        fill="none"
        stroke={strokeColor}
        // strokeLinecap="round"
        // strokeLinejoin="round"
        strokeWidth={strokWidth}
      ></Path>
      <Path
        d="m23.25 8.621 0 -7.871 -8 0"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokWidth}
      ></Path>
      <Path
        d="M12.125 5.75h-10.5a0.875 0.875 0 0 0 -0.875 0.875v15.75a0.875 0.875 0 0 0 0.875 0.875h15.75a0.875 0.875 0 0 0 0.875 -0.875v-10.5"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokWidth}
      ></Path>
    </svg>
  ),
  git: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.5 15V8M5.5 8C6.29565 8 7.05871 7.68393 7.62132 7.12132C8.18393 6.55871 8.5 5.79565 8.5 5C8.5 4.20435 8.18393 3.44129 7.62132 2.87868C7.05871 2.31607 6.29565 2 5.5 2C4.70435 2 3.94129 2.31607 3.37868 2.87868C2.81607 3.44129 2.5 4.20435 2.5 5C2.5 5.79565 2.81607 6.55871 3.37868 7.12132C3.94129 7.68393 4.70435 8 5.5 8ZM5.63 15C5.85603 14.1278 6.36593 13.3556 7.07931 12.8052C7.79269 12.2547 8.66896 11.9574 9.57 11.96L13 11.97C15.62 11.98 17.85 10.3 18.67 7.96M5.75 22C6.61195 22 7.4386 21.6576 8.0481 21.0481C8.65759 20.4386 9 19.612 9 18.75C9 17.888 8.65759 17.0614 8.0481 16.4519C7.4386 15.8424 6.61195 15.5 5.75 15.5C4.88805 15.5 4.0614 15.8424 3.4519 16.4519C2.84241 17.0614 2.5 17.888 2.5 18.75C2.5 19.612 2.84241 20.4386 3.4519 21.0481C4.0614 21.6576 4.88805 22 5.75 22ZM19.5 8C20.2956 8 21.0587 7.68393 21.6213 7.12132C22.1839 6.55871 22.5 5.79565 22.5 5C22.5 4.20435 22.1839 3.44129 21.6213 2.87868C21.0587 2.31607 20.2956 2 19.5 2C18.7044 2 17.9413 2.31607 17.3787 2.87868C16.8161 3.44129 16.5 4.20435 16.5 5C16.5 5.79565 16.8161 6.55871 17.3787 7.12132C17.9413 7.68393 18.7044 8 19.5 8Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  headphone: (strokeColor, strokeWidth, width = 25, height = 25) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      style={{
        fill: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.96005 18.49V15.57C5.96005 14.6 6.72005 13.73 7.80005 13.73C8.77005 13.73 9.64005 14.49 9.64005 15.57V18.38C9.64005 20.33 8.02005 21.95 6.07005 21.95C4.12005 21.95 2.50005 20.32 2.50005 18.38V12.22C2.39005 6.59999 6.83005 2.04999 12.45 2.04999C18.07 2.04999 22.5 6.59999 22.5 12.11V18.27C22.5 20.22 20.88 21.84 18.93 21.84C16.98 21.84 15.36 20.22 15.36 18.27V15.46C15.36 14.49 16.12 13.62 17.2 13.62C18.17 13.62 19.04 14.38 19.04 15.46V18.49"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  iframe: ({ fill = mainColor, width = 25, height = 25 }) => (
    <svg
      fill={fill}
      width={width}
      height={height}
      viewBox="0 0 24 24"
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
          fillRule="evenodd"
          d="M13,20 L20,20 L20,4 L4,4 L4,11 L11,11 C12.1045695,11 13,11.8954305 13,13 L13,20 Z M11,20 L11,13 L4,13 L4,20 L11,20 Z M4,2 L20,2 C21.1045695,2 22,2.8954305 22,4 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,4 C2,2.8954305 2.8954305,2 4,2 Z"
        ></path>{" "}
      </g>
    </svg>
  ),
  svg: ({ width = 20, height = 20, fill = mainColor }) => (
    <svg
      viewBox="0 0 512 512"
      version="1.1"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title>svg-document</title>{" "}
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          {" "}
          <g id="icon" fill={fill} transform="translate(85.333333, 42.666667)">
            {" "}
            <path
              d="M236.504748,7.10542736e-15 L1.83808102,7.10542736e-15 L1.83808102,234.666667 L44.5047477,234.666667 L44.5047477,192 L44.5047477,169.6 L44.5047477,42.6666667 L218.798081,42.6666667 L300.504748,124.373333 L300.504748,169.6 L300.504748,192 L300.504748,234.666667 L343.171414,234.666667 L343.171414,106.666667 L236.504748,7.10542736e-15 L236.504748,7.10542736e-15 Z M4.26325641e-14,399.067492 L4.16875,374.417492 C18.85,380.579992 31.2958333,383.661242 41.50625,383.661242 C48.1520833,383.661242 53.0458333,382.029992 56.1875,378.767492 C58.90625,375.927909 60.265625,372.45395 60.265625,368.345617 C60.265625,364.6602 58.9364583,361.790409 56.278125,359.736242 C53.6197917,357.682075 47.0645833,354.5102 36.6125,350.220617 C28.8791667,347.018534 23.4265625,344.632075 20.2546875,343.061242 C17.0828125,341.490409 14.1677083,339.708117 11.509375,337.714367 C3.95729167,332.095617 0.18125,323.999784 0.18125,313.426867 C0.18125,304.30395 2.65833333,296.298742 7.6125,289.411242 C15.225,278.717492 27.73125,273.370617 45.13125,273.370617 C57.6979167,273.370617 71.3520833,275.696659 86.09375,280.348742 L80.29375,303.911242 C71.59375,300.709159 65.0536458,298.594575 60.6734375,297.567492 C56.2932292,296.540409 51.7166667,296.026867 46.94375,296.026867 C41.50625,296.026867 37.3677083,297.2352 34.528125,299.651867 C31.5677083,302.249784 30.0875,305.542492 30.0875,309.529992 C30.0875,312.973742 31.3411458,315.677388 33.8484375,317.64093 C36.3557292,319.604471 42.3822917,322.549784 51.928125,326.476867 C61.4135417,330.40395 67.696875,333.137805 70.778125,334.67843 C73.859375,336.219055 76.759375,338.01645 79.478125,340.070617 C86.909375,345.749784 90.625,354.419575 90.625,366.079992 C90.625,379.854992 85.9427083,390.276867 76.578125,397.345617 C68.603125,403.326867 57.4260417,406.317492 43.046875,406.317492 C28.0635417,406.317492 13.7145833,403.900825 4.26325641e-14,399.067492 Z M146.721875,404.051867 L98.05625,275.636242 L128.14375,275.636242 L149.53125,333.273742 C154.96875,347.954992 159.046875,360.038325 161.765625,369.523742 C165.934375,356.232075 169.891667,344.54145 173.6375,334.451867 L195.659375,275.636242 L224.296875,275.636242 L175.63125,404.051867 L146.721875,404.051867 Z M344.465625,332.186242 L344.465625,397.708117 C337.094792,400.1852 331.898958,401.81645 328.878125,402.601867 C319.513542,405.07895 309.454167,406.317492 298.7,406.317492 C277.554167,406.317492 261.453125,401.000825 250.396875,390.367492 C238.132292,378.646659 232,362.30395 232,341.339367 C232,317.233117 239.6125,299.0477 254.8375,286.783117 C265.89375,277.84145 280.816667,273.370617 299.60625,273.370617 C315.677083,273.370617 330.630208,276.300825 344.465625,282.161242 L334.5875,304.726867 C328.0625,301.464367 322.353125,299.183638 317.459375,297.88468 C312.565625,296.585721 307.188542,295.936242 301.328125,295.936242 C287.311458,295.936242 276.980208,300.4977 270.334375,309.620617 C264.715625,317.35395 261.90625,327.534159 261.90625,340.161242 C261.90625,355.325825 266.135417,366.744575 274.59375,374.417492 C281.360417,380.579992 289.758333,383.661242 299.7875,383.661242 C305.647917,383.661242 311.20625,382.664367 316.4625,380.670617 L316.4625,354.842492 L294.35,354.842492 L294.35,332.186242 L344.465625,332.186242 Z"
              id="Combined-Shape"
            >
              {" "}
            </path>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  setting: (strokeColor, strokeWidth, width = 25, height = 25) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M12.5 15C13.2956 15 14.0587 14.6839 14.6213 14.1213C15.1839 13.5587 15.5 12.7956 15.5 12C15.5 11.2044 15.1839 10.4413 14.6213 9.87868C14.0587 9.31607 13.2956 9 12.5 9C11.7044 9 10.9413 9.31607 10.3787 9.87868C9.81607 10.4413 9.5 11.2044 9.5 12C9.5 12.7956 9.81607 13.5587 10.3787 14.1213C10.9413 14.6839 11.7044 15 12.5 15Z"
        strokeMiterlimit="10"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M2.5 12.88V11.12C2.5 10.08 3.35 9.22 4.4 9.22C6.21 9.22 6.95 7.94 6.04 6.37C5.52 5.47 5.83 4.3 6.74 3.78L8.47 2.79C9.26 2.32 10.28 2.6 10.75 3.39L10.86 3.58C11.76 5.15 13.24 5.15 14.15 3.58L14.26 3.39C14.73 2.6 15.75 2.32 16.54 2.79L18.27 3.78C19.18 4.3 19.49 5.47 18.97 6.37C18.06 7.94 18.8 9.22 20.61 9.22C21.65 9.22 22.51 10.07 22.51 11.12V12.88C22.51 13.92 21.66 14.78 20.61 14.78C18.8 14.78 18.06 16.06 18.97 17.63C19.49 18.54 19.18 19.7 18.27 20.22L16.54 21.21C15.75 21.68 14.73 21.4 14.26 20.61L14.15 20.42C13.25 18.85 11.77 18.85 10.86 20.42L10.75 20.61C10.28 21.4 9.26 21.68 8.47 21.21L6.74 20.22C6.3041 19.969 5.98558 19.5553 5.85435 19.0698C5.72311 18.5842 5.78988 18.0664 6.04 17.63C6.95 16.06 6.21 14.78 4.4 14.78C3.35 14.78 2.5 13.92 2.5 12.88Z"
        strokeMiterlimit="10"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  logOut: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M15.6 7.55999C15.29 3.95999 13.44 2.48999 9.39 2.48999H9.26C4.79 2.48999 3 4.27999 3 8.74999V15.27C3 19.74 4.79 21.53 9.26 21.53H9.39C13.41 21.53 15.26 20.08 15.59 16.54M9.5 12H20.88M18.65 8.64999L22 12L18.65 15.35"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  desktop: ({
    strokeColor = mainColor,
    width = 25,
    height = 25,
    fill = mainColor,
  }) => (
    <svg
      viewBox="0 0 24 24"
      style={{
        width,
        height,
      }}
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
        <Path
          justFillOnHover
          strokeWidth="1"
          d="M19 16.75H5C4.53668 16.7474 4.09309 16.5622 3.76546 16.2345C3.43784 15.9069 3.25263 15.4633 3.25 15V5C3.25263 4.53668 3.43784 4.09309 3.76546 3.76546C4.09309 3.43784 4.53668 3.25263 5 3.25H19C19.4633 3.25263 19.9069 3.43784 20.2345 3.76546C20.5622 4.09309 20.7474 4.53668 20.75 5V15C20.7474 15.4633 20.5622 15.9069 20.2345 16.2345C19.9069 16.5622 19.4633 16.7474 19 16.75ZM5 4.75C4.9337 4.75 4.87011 4.77634 4.82322 4.82322C4.77634 4.87011 4.75 4.9337 4.75 5V15C4.75 15.0663 4.77634 15.1299 4.82322 15.1768C4.87011 15.2237 4.9337 15.25 5 15.25H19C19.0663 15.25 19.1299 15.2237 19.1768 15.1768C19.2237 15.1299 19.25 15.0663 19.25 15V5C19.25 4.9337 19.2237 4.87011 19.1768 4.82322C19.1299 4.77634 19.0663 4.75 19 4.75H5Z"
          fill={fill}
        ></Path>{" "}
        <Path
          justFillOnHover
          strokeWidth="1"
          d="M15 20.75H12C11.8019 20.7474 11.6126 20.6676 11.4725 20.5275C11.3324 20.3874 11.2526 20.1981 11.25 20V16C11.25 15.8011 11.329 15.6103 11.4697 15.4697C11.6103 15.329 11.8011 15.25 12 15.25C12.1989 15.25 12.3897 15.329 12.5303 15.4697C12.671 15.6103 12.75 15.8011 12.75 16V19.25H15C15.1989 19.25 15.3897 19.329 15.5303 19.4697C15.671 19.6103 15.75 19.8011 15.75 20C15.75 20.1989 15.671 20.3897 15.5303 20.5303C15.3897 20.671 15.1989 20.75 15 20.75Z"
          fill={fill}
        ></Path>{" "}
        <Path
          justFillOnHover
          strokeWidth="1"
          d="M12 20.75H9C8.80109 20.75 8.61032 20.671 8.46967 20.5303C8.32902 20.3897 8.25 20.1989 8.25 20C8.25 19.8011 8.32902 19.6103 8.46967 19.4697C8.61032 19.329 8.80109 19.25 9 19.25H12C12.1989 19.25 12.3897 19.329 12.5303 19.4697C12.671 19.6103 12.75 19.8011 12.75 20C12.75 20.1989 12.671 20.3897 12.5303 20.5303C12.3897 20.671 12.1989 20.75 12 20.75Z"
          fill={fill}
        ></Path>{" "}
      </g>
    </svg>
  ),
  tablet: ({ width = 20, height = 20, fill = mainColor }) => (
    <svg
      version="1.1"
      style={{
        width,
        height,
      }}
      id="_x32_"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g>
          {" "}
          <Path
            fill={fill}
            justFillOnHover
            d="M419.438,0H92.563C74.078,0,59.078,15,59.078,33.5v445c0,18.5,15,33.5,33.484,33.5h326.875 c18.5,0,33.484-15,33.484-33.5v-445C452.922,15,437.938,0,419.438,0z M259.938,490.984c-7.969,0-14.438-6.453-14.438-14.453 c0-7.969,6.469-14.438,14.438-14.438c7.984,0,14.438,6.469,14.438,14.438C274.375,484.531,267.922,490.984,259.938,490.984z M413.531,441.109H98.469V39.375h315.063V441.109z"
          ></Path>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  mobile: ({ fill = mainColor, width = 25, height = 25 }) => (
    <svg
      fill={fill}
      style={{
        width,
        height,
      }}
      // width={width}
      // height={height}
      viewBox="0 -8 72 72"
      id="Layer_1"
      dataname="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>mobile</title>
        <Path
          justFillOnHover
          d="M49.75,0H22.25a4,4,0,0,0-4.16,3.78V52.22A4,4,0,0,0,22.25,56h27.5a4,4,0,0,0,4.16-3.78V3.78A4,4,0,0,0,49.75,0ZM31.6,2.73h8.8a.48.48,0,0,1,.5.46.47.47,0,0,1-.5.45H31.6a.47.47,0,0,1-.5-.45A.48.48,0,0,1,31.6,2.73ZM36,54.11a1.9,1.9,0,1,1,2.08-1.89A2,2,0,0,1,36,54.11ZM51,49H21V6H51Z"
        ></Path>
      </g>
    </svg>
  ),
  share: ({ width = 25, height = 25, strokeColor = mainColor }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />

      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g id="SVGRepo_iconCarrier">
        {" "}
        <Path
          d="M8.68439 10.6578L15.3124 7.34378M15.3156 16.6578L8.69379 13.3469M21 6C21 7.65685 19.6569 9 18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z"
          stroke={strokeColor}
          strokeWidth="2"
        />{" "}
      </g>
    </svg>
  ),
  prush: ({
    fill = mainColor,
    width = 24,
    height = 24,
    strokeColor = mainColor,
    strokeWidth,
  }) => (
    <svg
      viewBox="0 0 24 24"
      height={height}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      // fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <Path
          d="M23.14.93l-.07-.07A2.926 2.926 0 0 0 20.98 0a2.886 2.886 0 0 0-2.08.86L8.858 10.9a3.04 3.04 0 0 0-.53.72 7.793 7.793 0 0 0-4.1 1.621c-.191.144-.36.316-.5.51a6.08 6.08 0 0 0-.98 1.961c-.25.69-.59 1.631-1.22 3-.42.91-.75 1.541-.98 1.981a3.092 3.092 0 0 0-.54 1.631c.014.206.08.406.19.58a2.64 2.64 0 0 0 2.23 1.07 10.462 10.462 0 0 0 8.161-3.371c.378-.44.692-.932.93-1.461a7.882 7.882 0 0 0 .69-3.361.142.142 0 0 1 .02-.04c.325-.144.62-.347.87-.6L23.14 5.1A2.888 2.888 0 0 0 24 3.021 2.927 2.927 0 0 0 23.14.93zM9.7 18.317c-.17.368-.388.711-.65 1.02a8.393 8.393 0 0 1-6.891 2.6c.05-.1.11-.21.17-.32.24-.46.58-1.11 1.02-2.061a39.058 39.058 0 0 0 1.28-3.151c.14-.491.355-.957.64-1.381.062-.08.133-.154.21-.22a5.221 5.221 0 0 1 2.59-1.14c.121.537.396 1.027.79 1.411l.07.07c.35.357.788.616 1.27.75a5.614 5.614 0 0 1-.499 2.422zM21.73 3.691L11.678 13.735a.947.947 0 0 1-.67.28.983.983 0 0 1-.67-.28l-.07-.07a.948.948 0 0 1 0-1.34L20.309 2.271c.18-.173.42-.27.671-.271a.937.937 0 0 1 .67.27l.08.08c.36.374.36.967 0 1.341z"
          fill={fill}
          stroke={""}
          strokeWidth={strokeWidth}
          justFillOnHover={true}
          dontHover={true}
          fillRule="evenodd"
        ></Path>{" "}
      </g>
    </svg>
  ),
  redo: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill={mainColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M18.1716 7.49955H11C7.68629 7.49955 5 10.1858 5 13.4996C5 16.8133 7.68629 19.4996 11 19.4996H20V21.4996H11C6.58172 21.4996 3 17.9178 3 13.4996C3 9.08127 6.58172 5.49955 11 5.49955H18.1716L15.636 2.96402L17.0503 1.5498L22 6.49955L17.0503 11.4493L15.636 10.0351L18.1716 7.49955Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={mainColor}
        justFillOnHover
      />
    </svg>
  ),
  undo: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill={mainColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.82843 7.49955L8.36396 10.0351L6.94975 11.4493L2 6.49955L6.94975 1.5498L8.36396 2.96402L5.82843 5.49955H13C17.4183 5.49955 21 9.08127 21 13.4996C21 17.9178 17.4183 21.4996 13 21.4996H4V19.4996H13C16.3137 19.4996 19 16.8133 19 13.4996C19 10.1858 16.3137 7.49955 13 7.49955H5.82843Z"
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        justFillOnHover
        fill={mainColor}
      />
    </svg>
  ),
  watch: (strokeColor, strokeWidth, fill = "#64748B") => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill={"#64748B"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        justFillOnHover={true}
        d="M12.0003 3.5C17.3924 3.5 21.8784 7.37976 22.8189 12.5C21.8784 17.6202 17.3924 21.5 12.0003 21.5C6.60812 21.5 2.12215 17.6202 1.18164 12.5C2.12215 7.37976 6.60812 3.5 12.0003 3.5ZM12.0003 19.5C16.2359 19.5 19.8603 16.552 20.7777 12.5C19.8603 8.44803 16.2359 5.5 12.0003 5.5C7.7646 5.5 4.14022 8.44803 3.22278 12.5C4.14022 16.552 7.7646 19.5 12.0003 19.5ZM12.0003 17C9.51498 17 7.50026 14.9853 7.50026 12.5C7.50026 10.0147 9.51498 8 12.0003 8C14.4855 8 16.5003 10.0147 16.5003 12.5C16.5003 14.9853 14.4855 17 12.0003 17ZM12.0003 15C13.381 15 14.5003 13.8807 14.5003 12.5C14.5003 11.1193 13.381 10 12.0003 10C10.6196 10 9.50026 11.1193 9.50026 12.5C9.50026 13.8807 10.6196 15 12.0003 15Z"
        stroke={strokeColor}
        fill={fill}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),

  // code: (strokeColor, strokeWidth) => (
  //   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
  //     <g
  //       id="SVGRepo_tracerCarrier"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     ></g>
  //     <g id="SVGRepo_iconCarrier">
  //       <Path
  //         d="M9 8L5 11.6923L9 16M15 8L19 11.6923L15 16"
  //         stroke={strokeColor}
  //         strokeWidth={strokeWidth}
  //       ></Path>
  //     </g>
  //   </svg>
  // ),
  trash: (strokeColor, strokeWidth, width = 20, height = 20) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className="w-[24px]"
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
        <Path
          d="M3 3L6 6M6 6L10 10M6 6V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18M6 6H4M10 10L14 14M10 10V17M14 14L18 18M14 14V17M18 18L21 21M18 6V12.3906M18 6H16M18 6H20M16 6L15.4558 4.36754C15.1836 3.55086 14.4193 3 13.5585 3H10.4415C9.94239 3 9.47572 3.18519 9.11861 3.5M16 6H11.6133"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        ></Path>{" "}
      </g>
    </svg>
  ),

  arrow: (strokeColor, strokeWidth) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="#CBD5E1"
        d="M11.7386 13.3406L16.5819 8.49741L17.9657 9.88119L11.7386 16.1083L5.51154 9.88119L6.89533 8.49741L11.7386 13.3406Z"
      />
    </svg>
  ),
  command: (strokeColor, strokeWidth) => (
    <svg viewBox="0 0 24 24" fill="none" height="25" width="25">
      <Path
        // fill="#CBD5E1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z"
      />
    </svg>
  ),
  export: (
    strokeColor = "#64748B",
    strokeWidth = 2,
    width = 24,
    height = 24
  ) => (
    <svg
      width={width}
      height={height}
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
        <Path
          d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
        <Path
          d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
      </g>
    </svg>
  ),
  spline: ({ strokeColor = mainColor, width = 18, height = 18, fill }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      style={{ fill }}
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
          d="M3 9C4.10457 9 5 8.10457 5 7C5 5.89543 4.10457 5 3 5C1.89543 5 1 5.89543 1 7C1 8.10457 1.89543 9 3 9Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M21 9C22.1046 9 23 8.10457 23 7C23 5.89543 22.1046 5 21 5C19.8954 5 19 5.89543 19 7C19 8.10457 19.8954 9 21 9Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M19 7H15"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M9 7H5"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M7.5 16.5V18.5C7.5 19.11 7.13 19.64 6.61 19.86C6.42 19.95 6.22 20 6 20H4C3.17 20 2.5 19.33 2.5 18.5V16.5C2.5 15.67 3.17 15 4 15H6C6.83 15 7.5 15.67 7.5 16.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M21.5 16.5V18.5C21.5 19.33 20.83 20 20 20H18C17.78 20 17.58 19.95 17.39 19.86C16.87 19.64 16.5 19.11 16.5 18.5V16.5C16.5 15.67 17.17 15 18 15H20C20.83 15 21.5 15.67 21.5 16.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M15 5.5V8.5C15 9.32 14.32 10 13.5 10H10.5C9.68 10 9 9.32 9 8.5V5.5C9 4.68 9.68 4 10.5 4H13.5C14.32 4 15 4.68 15 5.5Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M15 7.72998C17.37 8.92998 19 11.51 19 14.5C19 14.67 18.99 14.83 18.97 15"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
        <path
          d="M5.03 15C5.01 14.83 5 14.67 5 14.5C5 11.51 6.63 8.92998 9 7.72998"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  ),
  slider: ({ strokeColor = mainColor, width = 18, height = 18, fill }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      style={{ fill }}
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
          d="M6.41861 8C6.41861 5.17157 6.41861 3.75736 7.23598 2.87868C8.05336 2 9.36891 2 12 2C14.6311 2 15.9466 2 16.764 2.87868C17.5814 3.75736 17.5814 5.17157 17.5814 8V16C17.5814 18.8284 17.5814 20.2426 16.764 21.1213C15.9466 22 14.6311 22 12 22C9.36891 22 8.05336 22 7.23598 21.1213C6.41861 20.2426 6.41861 18.8284 6.41861 16L6.41861 8Z"
          fill={strokeColor}
        ></path>{" "}
        <path
          d="M5.02325 7.90125L5.02326 8L5.02325 16.0987C5.0232 17.0815 5.02316 17.9638 5.06946 18.7277C5.08581 18.9974 5.10793 19.2523 5.13787 19.4917C5.15132 19.5992 5.16661 19.7062 5.18411 19.8126C5.21968 20.0288 5.05257 20.2326 4.83435 20.2134C4.40341 20.1756 4.01421 20.0949 3.65073 19.8958C3.08186 19.5842 2.61937 19.087 2.32952 18.4755C2.14431 18.0847 2.06921 17.6663 2.034 17.2031C1.99999 16.7555 1.99999 16.2048 2 15.5314L2 8.46859C1.99999 7.79521 1.99999 7.2445 2.034 6.79693C2.06921 6.33367 2.14431 5.91527 2.32952 5.52453C2.61937 4.913 3.08186 4.41582 3.65073 4.10423C4.01421 3.90514 4.40341 3.8244 4.83435 3.78655C5.05257 3.76739 5.21968 3.97125 5.18411 4.1874C5.16661 4.29376 5.15132 4.40079 5.13787 4.50831C5.10793 4.74771 5.08581 5.00264 5.06946 5.27233C5.02316 6.03622 5.0232 6.91848 5.02325 7.90125Z"
          fill={strokeColor}
        ></path>{" "}
        <path
          d="M18.9767 16.0987L18.9767 7.90126C18.9768 6.91849 18.9768 6.03623 18.9305 5.27233C18.9142 5.00264 18.8921 4.74771 18.8621 4.50831C18.8487 4.40079 18.8334 4.29376 18.8159 4.1874C18.7803 3.97125 18.9474 3.76739 19.1656 3.78655C19.5966 3.8244 19.9858 3.90514 20.3493 4.10423C20.9181 4.41582 21.3806 4.913 21.6705 5.52453C21.8557 5.91527 21.9308 6.33367 21.966 6.79693C22 7.2445 22 7.79521 22 8.46859L22 15.5314C22 16.2048 22 16.7555 21.966 17.2031C21.9308 17.6663 21.8557 18.0847 21.6705 18.4755C21.3806 19.087 20.9181 19.5842 20.3493 19.8958C19.9858 20.0949 19.5966 20.1756 19.1656 20.2134C18.9474 20.2326 18.7803 20.0288 18.8159 19.8126C18.8334 19.7062 18.8487 19.5992 18.8621 19.4917C18.8921 19.2523 18.9142 18.9974 18.9305 18.7277C18.9768 17.9638 18.9768 17.0815 18.9767 16.0987Z"
          fill={strokeColor}
        ></path>{" "}
      </g>
    </svg>
  ),
  binoculars: ({ width = 20, height = 20, fill = mainColor }) => (
    <svg
      height={height}
      width={width}
      version="1.1"
      id="_x32_"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g>
          {" "}
          <Path
          justFillOnHover
          fill={fill}
          d="M184.297,115.479c21.824,6.823,39.669,20.913,52.011,39.309l1.722-9.817 c6.339-30.336-7.542-63.542-38.33-73.158c-30.788-9.608-61.109,9.791-73.166,38.339l-2.944,6.372 c10.286-3.554,21.005-5.477,31.859-5.477C165.148,111.047,174.865,112.544,184.297,115.479z"
          ></Path>{" "}
          <Path
          justFillOnHover
          fill={fill}
          d="M60.34,321.976l60.356-60.348C87.365,261.628,60.34,288.646,60.34,321.976z"
          ></Path>{" "}
          <Path
          justFillOnHover
          fill={fill}
          d="M275.676,154.755c12.359-18.362,30.204-32.452,52.028-39.276c9.432-2.936,19.132-4.432,28.832-4.432 c10.854,0,21.591,1.923,31.875,5.494l-2.943-6.388c-12.058-28.548-42.378-47.947-73.167-38.339 c-30.772,9.616-44.669,42.822-38.331,73.158L275.676,154.755z"
          ></Path>{" "}
          <Path
          justFillOnHover
          fill={fill}
          d="M391.304,201.272c-56.175,0-103.369,38.365-116.848,90.318c-2.642-1.439-5.469-2.542-8.446-3.337 c1.723-6.589,3.948-12.969,6.64-19.115l0.134,0.811c20.085-45.538,65.625-77.439,118.522-77.439 c25.972,0,50.172,7.718,70.475,20.954l-12.593-27.318c-19.584-46.391-68.852-77.925-118.89-62.296 c-36.993,11.556-58.951,44.101-63.718,80.208c-3.294-1.27-6.84-2.007-10.586-2.007c-3.729,0-7.292,0.736-10.57,2.007 c-4.766-36.107-26.725-68.651-63.734-80.208c-50.021-15.628-99.29,15.905-118.89,62.296l-12.576,27.318 c20.302-13.236,44.502-20.954,70.474-20.954c52.881,0,98.436,31.901,118.506,77.439l0.15-0.811 c2.693,6.146,4.918,12.526,6.64,19.115c-2.976,0.794-5.82,1.898-8.462,3.337c-13.48-51.953-60.658-90.318-116.833-90.318 C54.035,201.272,0,255.315,0,321.976c0,66.653,54.035,120.696,120.696,120.696c53.751,0,99.273-35.137,114.893-83.694 c5.937,3.671,12.911,5.82,20.403,5.82c7.51,0,14.466-2.149,20.42-5.82c15.62,48.558,61.142,83.694,114.892,83.694 C457.966,442.672,512,388.63,512,321.976C512,255.315,457.966,201.272,391.304,201.272z M120.696,403.739 c-45.154,0-81.763-36.609-81.763-81.763s36.609-81.762,81.763-81.762c45.171,0,81.763,36.608,81.763,81.762 S165.867,403.739,120.696,403.739z M391.304,403.739c-45.171,0-81.762-36.609-81.762-81.763s36.592-81.762,81.762-81.762 c45.155,0,81.764,36.608,81.764,81.762S436.459,403.739,391.304,403.739z"
          ></Path>{" "}
          <Path
          justFillOnHover
            fill={fill}
            d="M330.948,321.976l60.356-60.348C357.957,261.628,330.948,288.646,330.948,321.976z"
          ></Path>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  interaction: ({ fill = mainColor, width = 22, height = 22 }) => (
    <svg
      fill={fill}
      width={width}
      height={height}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 32 32"
      xmlSpace="preserve"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <Path
          strokeWidth={1.8}
          stroke={fill}
          // fill={fill}
          id="touch_1_"
          d="M19.77,31.36c-5.067,0-7.409-2.218-10.404-5.602c-0.844-0.953-3.435-3.76-3.435-3.76L5.43,21.444 c-1.217-1.339-1.79-2.018-1.79-2.459c0-0.541,0.374-1.022,1.052-1.357c1.188-0.586,3.129-0.646,4.319,0.269 c0.895,0.688,2.677,2.611,3.629,3.663V7c0-1.388,0.968-2.357,2.354-2.36c0,0,0,0,0.001,0c0,0,0.001,0,0.003,0 c0.001,0,0.002,0,0.003,0C16.391,4.643,17.36,5.612,17.36,7v7.64h6.552c2.536,0,4.448,1.778,4.448,4.136v4.01 C28.36,27.239,27.319,31.36,19.77,31.36z M6.465,21.516c0.002,0.002,2.595,2.811,3.44,3.767c2.865,3.236,5.099,5.357,9.865,5.357 c6.532,0,7.87-3.14,7.87-7.854v-4.01c0-1.948-1.603-3.417-3.728-3.417H17c-0.199,0-0.36-0.161-0.36-0.36V7 c0-0.98-0.66-1.639-1.642-1.64C14.019,5.361,13.36,6.02,13.36,7v15.5c0,0.149-0.092,0.283-0.232,0.337 c-0.139,0.054-0.298,0.015-0.397-0.099c-0.03-0.033-2.983-3.368-4.158-4.271c-0.925-0.709-2.589-0.673-3.562-0.192 c-0.413,0.203-0.65,0.463-0.65,0.711c0.057,0.274,1.063,1.38,1.603,1.975L6.465,21.516z M10.755,11.729 C9.407,10.535,8.634,8.811,8.634,7c0-3.507,2.853-6.36,6.36-6.36s6.36,2.853,6.36,6.36c0,1.811-0.773,3.534-2.121,4.729 l-0.479-0.539c1.194-1.058,1.879-2.585,1.879-4.19c0-3.11-2.529-5.64-5.64-5.64c-3.11,0-5.64,2.53-5.64,5.64 c0,1.605,0.685,3.133,1.879,4.19L10.755,11.729z"
        ></Path>{" "}
        <rect
          id="_Transparent_Rectangle"
          fill="none"
          width="32"
          height="32"
        ></rect>{" "}
      </g>
    </svg>
  ),
  looper: ({
    fill = "#ffffff",
    strokeColor = "#ffffff",
    width = 24,
    height = 24,
  }) => (
    <svg
      fill={fill}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke={strokeColor}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M18,7a7.669,7.669,0,0,0-6,3.19A7.669,7.669,0,0,0,6,7C2.313,7,1,9.583,1,12c0,3.687,2.583,5,5,5a7.669,7.669,0,0,0,6-3.19A7.669,7.669,0,0,0,18,17c2.417,0,5-1.313,5-5C23,9.583,21.687,7,18,7ZM6,15a2.689,2.689,0,0,1-3-3A2.689,2.689,0,0,1,6,9c2.579,0,4.225,2.065,4.837,3C10.225,12.935,8.579,15,6,15Zm12,0c-2.579,0-4.225-2.065-4.837-3,.612-.935,2.258-3,4.837-3a2.689,2.689,0,0,1,3,3A2.689,2.689,0,0,1,18,15Z"></path>
      </g>
    </svg>
  ),
  google: ({ width, height }) => (
    <svg
      viewBox="-0.5 0 48 48"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      fill="#000000"
      width={width}
      height={height}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title>Google-color</title> <desc>Created with Sketch.</desc>{" "}
        <defs> </defs>{" "}
        <g
          id="Icons"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          {" "}
          <g id="Color-" transform="translate(-401.000000, -860.000000)">
            {" "}
            <g id="Google" transform="translate(401.000000, 860.000000)">
              {" "}
              <path
                d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                id="Fill-1"
                fill="#FBBC05"
              >
                {" "}
              </path>{" "}
              <path
                d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                id="Fill-2"
                fill="#EB4335"
              >
                {" "}
              </path>{" "}
              <path
                d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                id="Fill-3"
                fill="#34A853"
              >
                {" "}
              </path>{" "}
              <path
                d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                id="Fill-4"
                fill="#4285F4"
              >
                {" "}
              </path>{" "}
            </g>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  installLibrary: ({
    width = 20,
    height = 20,
    fill = "transparent",
    strokeColor = mainColor,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      stroke={strokeColor}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <rect
          width="48"
          height="48"
          fill={fill}
          strokeWidth={0}
          // fillOpacity="0.01"
        ></rect>{" "}
        <Path
          d="M16 12L4 24.4322L16 36"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
        <Path
          d="M32 12L44 24.4322L32 36"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
        <Path
          d="M24 17V31"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        ></Path>{" "}
        <Path
          d="M18 25L24 31L30 25"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
      </g>
    </svg>
  ),
  splitter: ({
    width = 20,
    height = 20,
    fill = mainColor,
    strokeWidth = 2,
    strokeColor = mainColor,
  }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
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
          d="M8.15179 15.85L21 4M12.3249 12L8.15 8.15M21 20L15 14.4669M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6ZM9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  ),
  fonts: ({
    width = "",
    height = "",
    fill = "transparent",
    strokeColor = mainColor,
    strokeWidth = "2.9",
  }) => (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      stroke={strokeColor}
      width={width}
      height={height}
      // strokeWidth="2"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <defs></defs>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="m6.5694,40.1336c1.7892-10.5623,6.118-34.2263,10.1582-34.6303s5.8294,36.9968,5.8294,36.9968"
        ></Path>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="m6.5694,23.6842c4.6751-2.1355,18.9313-6.4643,24.3567-6.4643"
        ></Path>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="m34.4131,24.382c-3.1985-4.7957-7.0078-2.1985-7.1809,2.6498-.1732,4.8482,4.6831,4.668,6.4723,1.2627"
        ></Path>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="m35.024,21.8372c-1.1543,4.3288-3.3476,15.2374.5195,15.9877s5.8872-7.9938,5.8872-7.9938"
        ></Path>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="m40.2154,13.1202c.207-.6403-.1442-1.3273-.7846-1.5343-.4216-.1363-.8625-.0295-1.1742.2413-.0942-.4021-.3891-.7468-.8107-.8831-.6403-.207-1.3273.1442-1.5343.7846-.0473.1464-.0642.295-.0564.44.0268,1.2267,1.3263,2.9835,1.3263,2.9835,0,0,2.082-.6635,2.8219-1.6423.0912-.113.1646-.2433.2119-.3897Z"
        ></Path>
      </g>
    </svg>
  ),
  installAsCDN: ({
    width = 25,
    height = 25,
    fill = "white",
    strokeColor = "white",
    arrowStrokeColor = "black",
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      stroke={strokeColor}
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
          d="M12 9.5V15.5M12 15.5L10 13.5M12 15.5L14 13.5M8.4 19C5.41766 19 3 16.6044 3 13.6493C3 11.2001 4.8 8.9375 7.5 8.5C8.34694 6.48637 10.3514 5 12.6893 5C15.684 5 18.1317 7.32251 18.3 10.25C19.8893 10.9449 21 12.6503 21 14.4969C21 16.9839 18.9853 19 16.5 19L8.4 19Z"
          stroke={arrowStrokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{" "}
      </g>
    </svg>
  ),
  save: (strokeColor, strokeWidth, fill = "#64748B") => (
    <svg
      fill={fill}
      width="24px"
      height="24px"
      viewBox="0 0 24.00 24.00"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#64748B"
      strokeWidth="0.00024000000000000003"
      transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <Path
          stroke={" "}
          justFillOnHover={true}
          strokeWidth={strokeWidth}
          d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"
        ></Path>
      </g>
    </svg>
  ),
  saveData: ({ fill = mainColor, width = 20, height = 20 }) => (
    <svg
      fill={fill}
      height={height}
      width={width}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 24 24"
      enableBackground="new 0 0 24 24"
      xmlSpace="preserve"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g id="save-filled">
          {" "}
          <path d="M19,0H1C0.448,0,0,0.448,0,1v22c0,0.552,0.448,1,1,1h22c0.552,0,1-0.448,1-1V5L19,0z M6,3c0-0.552,0.448-1,1-1h10 c0.552,0,1,0.448,1,1v6c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V3z M20,22H4v-7c0-0.552,0.448-1,1-1h14c0.552,0,1,0.448,1,1V22 z"></path>{" "}
          <path d="M16,9h-4V3h4V9z"></path>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  copy: ({
    width = 20,
    height = 20,
    strokeColor = "#ffffff",
    strokWidth,
    fill,
  }) => {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={strokeColor}
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
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"
            fill="#ffffff"
            // justFillOnHover={true}
            strokeWidth={strokWidth}
            stroke={strokeColor}
          ></path>{" "}
          <path
            d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"
            fill={"#fff"}
            // justFillOnHover={true}
            stroke={strokeColor}
            strokeWidth={strokWidth}
          ></path>{" "}
        </g>
      </svg>
    );
  },
  paste: ({ width, height, strokeColor, strokWidth, fill }) => (
    <svg
      width={width || 20}
      height={height || 20}
      viewBox="0 0 24 24"
      fill="#fff"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth={strokWidth || 0}></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 0C11.2347 0 10.6293 0.125708 10.1567 0.359214C9.9845 0.44429 9.82065 0.544674 9.68861 0.62717L9.59036 0.688808C9.49144 0.751003 9.4082 0.803334 9.32081 0.853848C9.09464 0.984584 9.00895 0.998492 9.00053 0.999859C8.99983 0.999973 9.00019 0.999859 9.00053 0.999859C7.89596 0.999859 7 1.89543 7 3H6C4.34315 3 3 4.34315 3 6V20C3 21.6569 4.34315 23 6 23H18C19.6569 23 21 21.6569 21 20V6C21 4.34315 19.6569 3 18 3H17C17 1.89543 16.1046 1 15 1C15.0003 1 15.0007 1.00011 15 1C14.9916 0.998633 14.9054 0.984584 14.6792 0.853848C14.5918 0.80333 14.5086 0.751004 14.4096 0.688804L14.3114 0.62717C14.1793 0.544674 14.0155 0.44429 13.8433 0.359214C13.3707 0.125708 12.7653 0 12 0ZM16.7324 5C16.3866 5.5978 15.7403 6 15 6H9C8.25972 6 7.61337 5.5978 7.26756 5H6C5.44772 5 5 5.44772 5 6V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V6C19 5.44772 18.5523 5 18 5H16.7324ZM11.0426 2.15229C11.1626 2.09301 11.4425 2 12 2C12.5575 2 12.8374 2.09301 12.9574 2.15229C13.0328 2.18953 13.1236 2.24334 13.2516 2.32333L13.3261 2.37008C13.43 2.43542 13.5553 2.51428 13.6783 2.58539C13.9712 2.75469 14.4433 3 15 3V4H9V3C9.55666 3 10.0288 2.75469 10.3217 2.58539C10.4447 2.51428 10.57 2.43543 10.6739 2.37008L10.7484 2.32333C10.8764 2.24334 10.9672 2.18953 11.0426 2.15229Z"
          fill={fill || "#ffffff"}
          // justFillOnHover={true}
          strokeWidth={strokWidth}
          stroke={strokeColor}
        ></path>{" "}
      </g>
    </svg>
  ),
  options: ({ width, height, strokeColor, strokWidth, fill }) => (
    <svg
      width={width || 20}
      height={height || 20}
      fill={fill || "#ffffff"}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      stroke={strokeColor || "#ffffff"}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M388.8 896.4v-27.198c.6-2.2 1.6-4.2 2-6.4 8.8-57.2 56.4-102.4 112.199-106.2 62.4-4.4 115.2 31.199 132.4 89.199 2.2 7.6 3.8 15.6 5.8 23.4v27.2c-.6 1.8-1.6 3.399-1.8 5.399-8.6 52.8-46.6 93-98.6 104.4-4 .8-8 2-12 3h-27.2c-1.8-.6-3.6-1.6-5.4-1.8-52-8.4-91.599-45.4-103.6-96.8-1.2-5-2.6-9.6-3.8-14.2zm252.4-768.797l-.001 27.202c-.6 2.2-1.6 4.2-1.8 6.4-9 57.6-56.8 102.6-113.2 106.2-62.2 4-114.8-32-131.8-90.2-2.2-7.401-3.8-15-5.6-22.401v-27.2c.6-1.8 1.6-3.4 2-5.2 9.6-52 39.8-86 90.2-102.2 6.6-2.2 13.6-3.4 20.4-5.2h27.2c1.8.6 3.6 1.6 5.4 1.8 52.2 8.6 91.6 45.4 103.6 96.8 1.201 4.8 2.401 9.4 3.601 13.999zm-.001 370.801v27.2c-.6 2.2-1.6 4.2-2 6.4-9 57.4-58.6 103.6-114.6 106-63 2.8-116.4-35.2-131.4-93.8-1.6-6.2-3-12.4-4.4-18.6v-27.2c.6-2.2 1.6-4.2 2-6.4 8.8-57.4 58.6-103.601 114.6-106.2 63-3 116.4 35.2 131.4 93.8 1.6 6.4 3 12.6 4.4 18.8z"></path>
      </g>
    </svg>
  ),
  refresh: ({ width, height, strokeColor, strokWidth, fill }) => (
    <svg
      width={width}
      height={height}
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
        <Path
          d="M12 21C16.9706 21 21 16.9706 21 12C21 9.69494 20.1334 7.59227 18.7083 6L16 3M12 3C7.02944 3 3 7.02944 3 12C3 14.3051 3.86656 16.4077 5.29168 18L8 21M21 3H16M16 3V8M3 21H8M8 21V16"
          stroke={strokeColor || "#ffffff"}
          strokeWidth={strokWidth || "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
      </g>
    </svg>
  ),
  drag: ({
    width = 20,
    height = 20,
    strokeColor,
    strokWidth,
    fill = mainColor,
  }) => (
    <svg
      width={width}
      height={height}
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
          className="group-hover:fill-white transition-all"
          d="M16.1924 5.65683C16.5829 5.2663 16.5829 4.63314 16.1924 4.24261L13.364 1.41419C12.5829 0.633139 11.3166 0.633137 10.5355 1.41419L7.70711 4.24261C7.31658 4.63314 7.31658 5.2663 7.70711 5.65683C8.09763 6.04735 8.73079 6.04735 9.12132 5.65683L11 3.77812V11.0503H3.72784L5.60655 9.17157C5.99707 8.78104 5.99707 8.14788 5.60655 7.75735C5.21602 7.36683 4.58286 7.36683 4.19234 7.75735L1.36391 10.5858C0.582863 11.3668 0.582859 12.6332 1.36391 13.4142L4.19234 16.2426C4.58286 16.6332 5.21603 16.6332 5.60655 16.2426C5.99707 15.8521 5.99707 15.219 5.60655 14.8284L3.8284 13.0503H11V20.2219L9.12132 18.3432C8.73079 17.9526 8.09763 17.9526 7.7071 18.3432C7.31658 18.7337 7.31658 19.3669 7.7071 19.7574L10.5355 22.5858C11.3166 23.3669 12.5829 23.3669 13.364 22.5858L16.1924 19.7574C16.5829 19.3669 16.5829 18.7337 16.1924 18.3432C15.8019 17.9526 15.1687 17.9526 14.7782 18.3432L13 20.1213V13.0503H20.071L18.2929 14.8284C17.9024 15.219 17.9024 15.8521 18.2929 16.2426C18.6834 16.6332 19.3166 16.6332 19.7071 16.2426L22.5355 13.4142C23.3166 12.6332 23.3166 11.3668 22.5355 10.5858L19.7071 7.75735C19.3166 7.36683 18.6834 7.36683 18.2929 7.75735C17.9024 8.14788 17.9024 8.78104 18.2929 9.17157L20.1716 11.0503H13V3.87867L14.7782 5.65683C15.1687 6.04735 15.8019 6.04735 16.1924 5.65683Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  delete: (strokeColor, strokeWidth) => (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      // width="109.484px"
      // height="122.88px"
      width="15"
      height="15"
      viewBox="0 0 109.484 122.88"
      enableBackground="new 0 0 109.484 122.88"
      xmlSpace="preserve"
      fill="white"
      // stroke-color="white"
    >
      <g>
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M2.347,9.633h38.297V3.76c0-2.068,1.689-3.76,3.76-3.76h21.144 c2.07,0,3.76,1.691,3.76,3.76v5.874h37.83c1.293,0,2.347,1.057,2.347,2.349v11.514H0V11.982C0,10.69,1.055,9.633,2.347,9.633 L2.347,9.633z M8.69,29.605h92.921c1.937,0,3.696,1.599,3.521,3.524l-7.864,86.229c-0.174,1.926-1.59,3.521-3.523,3.521h-77.3 c-1.934,0-3.352-1.592-3.524-3.521L5.166,33.129C4.994,31.197,6.751,29.605,8.69,29.605L8.69,29.605z M69.077,42.998h9.866v65.314 h-9.866V42.998L69.077,42.998z M30.072,42.998h9.867v65.314h-9.867V42.998L30.072,42.998z M49.572,42.998h9.869v65.314h-9.869 V42.998L49.572,42.998z"
        />
      </g>
    </svg>
  ),
  edite: ({
    width = 20,
    height = 20,
    strokeColor,
    strokWidth,
    fill = mainColor,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          stroke={strokWidth}
          d="M18.52 4l-1 1H2V4zM2 8v1h11.52l1-1zm4.52 8H2v1h3.655a1.477 1.477 0 0 1 .282-.417zM2 12v1h7.52l1-1zm20.95-6.066a.965.965 0 0 1 .03 1.385L9.825 20.471 5.73 22.227a.371.371 0 0 1-.488-.487l1.756-4.097L20.15 4.491a.965.965 0 0 1 1.385.03zM9.02 19.728l-1.28-1.28-.96 2.24zM20.093 8.79L18.68 7.376 8.382 17.674l1.413 1.414zm1.865-2.445l-.804-.838a.42.42 0 0 0-.6-.007l-1.167 1.17L20.8 8.083l1.152-1.151a.42.42 0 0 0 .006-.587z"
        ></path>
        <path fill="none" d="M0 0h24v24H0z"></path>
      </g>
    </svg>
  ),
  textStart: ({
    strokeColor,
    strokeWidth,
    width = "18",
    height = "18",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="#CBD5E1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M3.26471 4.42346H20.8775V6.38044H3.26471V4.42346ZM3.26471 19.1008H16.9635V21.0577H3.26471V19.1008ZM3.26471 14.2083H20.8775V16.1653H3.26471V14.2083ZM3.26471 9.3159H16.9635V11.2729H3.26471V9.3159Z"
        fill={fill || "#CBD5E1"}
      />
    </svg>
  ),
  textCenter: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M3.3714 4.42346H20.9842V6.38044H3.3714V4.42346ZM5.32837 19.1008H19.0272V21.0577H5.32837V19.1008ZM3.3714 14.2083H20.9842V16.1653H3.3714V14.2083ZM5.32837 9.3159H19.0272V11.2729H5.32837V9.3159Z"
        fill={fill || "#CBD5E1"}
      />
    </svg>
  ),
  textEnd: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M3.47864 4.42346H21.0914V6.38044H3.47864V4.42346ZM7.39258 19.1008H21.0914V21.0577H7.39258V19.1008ZM3.47864 14.2083H21.0914V16.1653H3.47864V14.2083ZM7.39258 9.3159H21.0914V11.2729H7.39258V9.3159Z"
        fill={fill || "#CBD5E1"}
      />
    </svg>
  ),
  textJustify: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M3.58533 4.42346H21.1981V6.38044H3.58533V4.42346ZM3.58533 19.1008H21.1981V21.0577H3.58533V19.1008ZM3.58533 14.2083H21.1981V16.1653H3.58533V14.2083ZM3.58533 9.3159H21.1981V11.2729H3.58533V9.3159Z"
        fill={fill || "#CBD5E1"}
      />
    </svg>
  ),
  textCapitalize: ({
    strokeColor,
    strokeWidth,
    width = "18",
    height = "18",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18.04 14.24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill={fill || "#cbd5e1"}
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth || 1}
          d="M 6.2 14 L 4.3 14 L 4.3 1.68 L 0 1.68 L 0 0 L 10.5 0 L 10.5 1.68 L 6.2 1.68 L 6.2 14 Z M 12.3 10.42 L 12.3 5.54 L 10.5 5.54 L 10.5 3.98 L 12.34 3.98 L 12.72 0.7 L 14.1 0.7 L 14.1 3.98 L 16.98 3.98 L 16.98 5.54 L 14.1 5.54 L 14.1 10.56 Q 14.1 11.588 14.485 12.066 A 1.111 1.111 0 0 0 14.59 12.18 Q 15.08 12.64 15.76 12.64 Q 16.26 12.64 16.71 12.48 Q 17.16 12.32 17.54 12.1 L 18.04 13.54 A 3.709 3.709 0 0 1 17.716 13.711 Q 17.556 13.787 17.367 13.862 A 8.673 8.673 0 0 1 16.96 14.01 Q 16.28 14.24 15.54 14.24 A 3.665 3.665 0 0 1 14.504 14.101 A 2.787 2.787 0 0 1 13.17 13.25 Q 12.3 12.26 12.3 10.42 Z"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  ),
  textUppercase: ({
    strokeColor,
    strokeWidth,
    width = "18",
    height = "18",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21.4 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill={fill || "#cbd5e1"}
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M 6.2 14 L 4.3 14 L 4.3 1.68 L 0 1.68 L 0 0 L 10.5 0 L 10.5 1.68 L 6.2 1.68 L 6.2 14 Z M 17.1 14 L 15.2 14 L 15.2 1.68 L 10.9 1.68 L 10.9 0 L 21.4 0 L 21.4 1.68 L 17.1 1.68 L 17.1 14 Z"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  ),
  textLowercase: ({
    strokeColor,
    strokeWidth,
    width = "18",
    height = "18",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15.48 13.54"
      fill={fill || "#cbd5e1"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill={fill || "#cbd5e1"}
      >
        <Path
          fill={fill || "#cbd5e1"}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M 1.8 9.72 L 1.8 4.84 L 0 4.84 L 0 3.28 L 1.84 3.28 L 2.22 0 L 3.6 0 L 3.6 3.28 L 6.48 3.28 L 6.48 4.84 L 3.6 4.84 L 3.6 9.86 Q 3.6 10.888 3.985 11.366 A 1.111 1.111 0 0 0 4.09 11.48 Q 4.58 11.94 5.26 11.94 Q 5.76 11.94 6.21 11.78 Q 6.66 11.62 7.04 11.4 L 7.54 12.84 A 3.709 3.709 0 0 1 7.216 13.011 Q 7.056 13.087 6.867 13.162 A 8.673 8.673 0 0 1 6.46 13.31 Q 5.78 13.54 5.04 13.54 A 3.665 3.665 0 0 1 4.004 13.401 A 2.787 2.787 0 0 1 2.67 12.55 Q 1.8 11.56 1.8 9.72 Z M 9.74 9.72 L 9.74 4.84 L 7.94 4.84 L 7.94 3.28 L 9.78 3.28 L 10.16 0 L 11.54 0 L 11.54 3.28 L 14.42 3.28 L 14.42 4.84 L 11.54 4.84 L 11.54 9.86 Q 11.54 10.888 11.925 11.366 A 1.111 1.111 0 0 0 12.03 11.48 Q 12.52 11.94 13.2 11.94 Q 13.7 11.94 14.15 11.78 Q 14.6 11.62 14.98 11.4 L 15.48 12.84 A 3.709 3.709 0 0 1 15.156 13.011 Q 14.996 13.087 14.807 13.162 A 8.673 8.673 0 0 1 14.4 13.31 Q 13.72 13.54 12.98 13.54 A 3.665 3.665 0 0 1 11.944 13.401 A 2.787 2.787 0 0 1 10.61 12.55 Q 9.74 11.56 9.74 9.72 Z"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  ),
  textNone: ({
    strokeColor,
    strokeWidth,
    width = "16",
    height = "16",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 11.74 14.38"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill={fill || "#cbd5e1"}
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth || 1}
          d="M 11.74 13.2 L 10.2 14.38 L 5.78 8.38 L 1.5 14.34 L 0 13.2 L 4.7 7.06 L 0.2 1.18 L 1.78 0 L 5.84 5.68 L 9.86 0.06 L 11.34 1.18 L 6.98 6.96 L 11.74 13.2 Z"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  ),
  visible: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
    fill,
  }) => (
    <svg
      width={width}
      height={height}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 122.88 65.06"
      xmlSpace="preserve"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill={fill || "#cbd5e1"}
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M0.95,30.01c2.92-3.53,5.98-6.74,9.15-9.63C24.44,7.33,41.46,0.36,59.01,0.01c17.51-0.35,35.47,5.9,51.7,19.29 c3.88,3.2,7.63,6.77,11.24,10.74c1.16,1.28,1.22,3.17,0.23,4.51c-4.13,5.83-8.88,10.82-14.07,14.96 C95.12,59.88,79.34,64.98,63.35,65.06c-15.93,0.07-32.06-4.86-45.8-14.57c-6.14-4.34-11.81-9.63-16.78-15.85 C-0.34,33.24-0.23,31.27,0.95,30.01L0.95,30.01z M61.44,26.46c0.59,0,1.17,0.09,1.71,0.24c-0.46,0.5-0.73,1.17-0.73,1.9 c0,1.56,1.26,2.82,2.82,2.82c0.77,0,1.46-0.3,1.97-0.8c0.2,0.6,0.3,1.24,0.3,1.9c0,3.35-2.72,6.07-6.07,6.07 c-3.35,0-6.07-2.72-6.07-6.07C55.37,29.18,58.09,26.46,61.44,26.46L61.44,26.46z M61.44,10.82c5.99,0,11.42,2.43,15.35,6.36 c3.93,3.93,6.36,9.35,6.36,15.35c0,5.99-2.43,11.42-6.36,15.35c-3.93,3.93-9.35,6.36-15.35,6.36c-5.99,0-11.42-2.43-15.35-6.36 c-3.93-3.93-6.36-9.35-6.36-15.35c0-5.99,2.43-11.42,6.36-15.35C50.02,13.25,55.45,10.82,61.44,10.82L61.44,10.82z M71.89,22.08 c-2.67-2.67-6.37-4.33-10.45-4.33c-4.08,0-7.78,1.65-10.45,4.33c-2.67,2.67-4.33,6.37-4.33,10.45c0,4.08,1.65,7.78,4.33,10.45 c2.67,2.67,6.37,4.33,10.45,4.33c4.08,0,7.78-1.65,10.45-4.33c2.67-2.67,4.33-6.37,4.33-10.45C76.22,28.45,74.56,24.75,71.89,22.08 L71.89,22.08z M14.89,25.63c-2.32,2.11-4.56,4.39-6.7,6.82c4.07,4.72,8.6,8.8,13.45,12.23c12.54,8.85,27.21,13.35,41.69,13.29 c14.42-0.07,28.65-4.67,40.37-14.02c4-3.19,7.7-6.94,11.03-11.25c-2.79-2.91-5.63-5.54-8.51-7.92C91.33,12.51,75,6.79,59.15,7.1 C43.34,7.42,27.93,13.76,14.89,25.63L14.89,25.63z"
        />
      </g>
    </svg>
  ),
  animation: (strokeColor, strokeWidth, fill = "#64748B", width, height) => (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width={width | "24"}
      height={height | "24"}
      viewBox="0 0 512.000000 512.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        fill={fill}
        stroke="none"
      >
        <Path
          stroke={strokeColor}
          fill={fill}
          justFillOnHover={true}
          strokeWidth={strokeWidth}
          d="M794 5049 c-81 -9 -216 -50 -289 -86 -129 -65 -266 -183 -345 -297 -49 -72 -108 -203 -132 -296 l-23 -85 0 -1725 0 -1725 23 -85 c24 -93 83 -224 132 -296 79 -114 216 -232 345 -297 80 -40 204 -75 308 -86 134 -15 3360 -15 3494 0 383 42 686 305 785 679 l23 85 0 1725 0 1725 -23 85 c-24 93 -83 224 -132 296 -79 114 -216 232 -345 297 -77 38 -201 74 -300 86 -107 13 -3409 13 -3521 0z m1180 -1311 c52 -124 776 -2181 771 -2188 -10 -16 -480 -13 -492 3 -5 6 -36 89 -68 182 -32 94 -71 207 -88 253 l-29 82 -396 -2 -395 -3 -86 -260 -86 -260 -224 -3 c-124 -1 -228 1 -233 6 -5 5 132 409 303 898 418 1194 408 1165 416 1251 l6 73 294 0 294 0 13 -32z m2053 -483 c221 -42 378 -197 430 -425 15 -66 17 -146 18 -680 l0 -605 -226 -3 -227 -2 -6 22 c-3 13 -6 251 -6 529 0 483 -1 510 -21 574 -32 103 -104 171 -201 189 -79 14 -235 -29 -306 -85 l-27 -21 -5 -601 -5 -602 -225 0 -225 0 -7 815 c-4 448 -9 829 -10 845 l-3 30 197 3 c225 3 219 5 239 -83 7 -30 14 -55 17 -55 2 0 18 12 35 26 41 35 151 89 222 110 123 35 226 41 342 19z"
        />
        <Path
          stroke={strokeColor}
          justFillOnHover={true}
          strokeWidth={strokeWidth}
          fill={fill}
          d="M1534 2940 c-72 -242 -128 -442 -126 -445 8 -8 532 -6 532 2 0 13 -263 868 -269 875 -4 4 -65 -190 -137 -432z"
        />
      </g>
    </svg>
  ),
  hidden: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 122.879 79.699"
      enableBackground="new 0 0 122.879 79.699"
      xmlSpace="preserve"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill="#cbd5e1"
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M0.955,37.326c2.922-3.528,5.981-6.739,9.151-9.625C24.441,14.654,41.462,7.684,59.01,7.334 c6.561-0.131,13.185,0.665,19.757,2.416l-5.904,5.904c-4.581-0.916-9.168-1.324-13.714-1.233 c-15.811,0.316-31.215,6.657-44.262,18.533l0,0c-2.324,2.115-4.562,4.39-6.702,6.82c4.071,4.721,8.6,8.801,13.452,12.227 c2.988,2.111,6.097,3.973,9.296,5.586l-5.262,5.262c-2.782-1.504-5.494-3.184-8.12-5.039c-6.143-4.338-11.813-9.629-16.78-15.85 C-0.338,40.563-0.228,38.59,0.955,37.326L0.955,37.326L0.955,37.326z M96.03,0l5.893,5.893L28.119,79.699l-5.894-5.895L96.03,0 L96.03,0z M97.72,17.609c4.423,2.527,8.767,5.528,12.994,9.014c3.877,3.196,7.635,6.773,11.24,10.735 c1.163,1.277,1.22,3.171,0.226,4.507c-4.131,5.834-8.876,10.816-14.069,14.963C95.119,67.199,79.338,72.305,63.352,72.377 c-6.114,0.027-9.798-3.141-15.825-4.576l3.545-3.543c4.065,0.705,8.167,1.049,12.252,1.031c14.421-0.064,28.653-4.668,40.366-14.02 c3.998-3.191,7.706-6.939,11.028-11.254c-2.787-2.905-5.627-5.543-8.508-7.918c-4.455-3.673-9.042-6.759-13.707-9.273L97.72,17.609 L97.72,17.609z M61.44,18.143c2.664,0,5.216,0.481,7.576,1.359l-5.689,5.689c-0.619-0.079-1.248-0.119-1.886-0.119 c-4.081,0-7.775,1.654-10.449,4.328c-2.674,2.674-4.328,6.369-4.328,10.45c0,0.639,0.04,1.268,0.119,1.885l-5.689,5.691 c-0.879-2.359-1.359-4.912-1.359-7.576c0-5.995,2.43-11.42,6.358-15.349C50.02,20.572,55.446,18.143,61.44,18.143L61.44,18.143z M82.113,33.216c0.67,2.09,1.032,4.32,1.032,6.634c0,5.994-2.43,11.42-6.357,15.348c-3.929,3.928-9.355,6.357-15.348,6.357 c-2.313,0-4.542-0.361-6.633-1.033l5.914-5.914c0.238,0.012,0.478,0.018,0.719,0.018c4.081,0,7.775-1.652,10.449-4.326 s4.328-6.369,4.328-10.449c0-0.241-0.006-0.48-0.018-0.72L82.113,33.216L82.113,33.216z"
        />
      </g>
    </svg>
  ),
  upload: ({
    strokeColor = mainColor,
    strokeWidth = "2",
    width = "24",
    height = "24",
  }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
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
        <Path
          d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></Path>{" "}
      </g>
    </svg>
  ),
  file: ({ width = 20, height = 20, strokeWidth = 2, fill = mainColor }) => (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      width={width}
      height={height}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title></title>{" "}
        <g id="Complete">
          {" "}
          <g id="F-File">
            {" "}
            <g id="Text">
              {" "}
              <g>
                {" "}
                <path
                  d="M18,22H6a2,2,0,0,1-2-2V4A2,2,0,0,1,6,2h7.1a2,2,0,0,1,1.5.6l4.9,5.2A2,2,0,0,1,20,9.2V20A2,2,0,0,1,18,22Z"
                  fill="none"
                  id="File"
                  stroke={fill}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={strokeWidth}
                ></path>{" "}
                <line
                  fill="none"
                  stroke={fill}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={strokeWidth}
                  x1="7.9"
                  x2="16.1"
                  y1="17.5"
                  y2="17.5"
                ></line>{" "}
                <line
                  fill="none"
                  stroke={fill}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={strokeWidth}
                  x1="7.9"
                  x2="16.1"
                  y1="13.5"
                  y2="13.5"
                ></line>{" "}
                <line
                  fill="none"
                  stroke={fill}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={strokeWidth}
                  x1="8"
                  x2="13"
                  y1="9.5"
                  y2="9.5"
                ></line>{" "}
              </g>{" "}
            </g>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  scroll: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 80.59 122.88"
      xmlSpace="preserve"
    >
      {/* <style type="text/css">
        .st0{{ "fill-rule": evenodd, "clip-rule": evenodd }}
      </style> */}
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill="#cbd5e1"
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          class="st0"
          d="M53.06,0l27.53,28.63H62.88v22.7H43.25v-22.7H25.53L53.06,0L53.06,0z M27.53,122.88L0,94.25h17.72v-22.7h19.62 v22.7h17.72L27.53,122.88L27.53,122.88z M17.72,68.05V54.49h19.62v13.56H17.72L17.72,68.05z M17.72,51.24v-7.7l19.62,0v7.7 L17.72,51.24L17.72,51.24z M62.88,71.64v7.7H43.25v-7.7H62.88L62.88,71.64z M62.88,54.84v13.56l-19.62,0V54.84L62.88,54.84 L62.88,54.84z"
        />
      </g>
    </svg>
  ),
  initial: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 122.88 122.88"
      enableBackground="new 0 0 122.88 122.88"
      xmlSpace="preserve"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        strokeWidth="1.5"
        fill="#cbd5e1"
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M61.438,0c33.93,0,61.441,27.512,61.441,61.441 c0,33.929-27.512,61.438-61.441,61.438C27.512,122.88,0,95.37,0,61.441C0,27.512,27.512,0,61.438,0L61.438,0z"
        />
      </g>
    </svg>
  ),
  auto: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 35.152 11.392"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="svgGroup"
        strokeLinecap="round"
        fillRule="evenodd"
        stroke="#64748b"
        fill="#cbd5e1"
        fontSize="9pt"
        strokeWidth="0.25mm"
        // fill="#64748b"
        style={{ stroke: "#64748b", strokeWidth: "0.25mm", fill: "#64748b" }}
      >
        <Path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M 11.728 8.288 L 11.728 2.88 L 13.168 2.88 L 13.168 8.096 Q 13.168 9.072 13.584 9.592 A 1.345 1.345 0 0 0 14.402 10.075 A 2.049 2.049 0 0 0 14.8 10.112 Q 15.456 10.112 16.072 9.848 Q 16.688 9.584 17.168 9.136 L 17.168 2.88 L 18.608 2.88 L 18.608 9.04 Q 18.608 9.579 18.789 9.828 A 0.523 0.523 0 0 0 18.904 9.944 Q 19.2 10.16 19.552 10.16 L 19.248 11.28 Q 17.762 11.28 17.409 10.1 A 2.181 2.181 0 0 1 17.408 10.096 Q 16.848 10.672 16.112 11.032 Q 15.376 11.392 14.528 11.392 Q 13.808 11.392 13.168 11.088 Q 12.528 10.784 12.128 10.104 Q 11.815 9.571 11.747 8.759 A 5.66 5.66 0 0 1 11.728 8.288 Z M 10.368 10.8 L 8.976 11.36 L 7.728 8.16 L 2.544 8.16 L 1.296 11.328 L 0 10.8 L 4.384 0 L 6.048 0 L 10.368 10.8 Z M 21.792 8.336 L 21.792 4.432 L 20.352 4.432 L 20.352 3.184 L 21.824 3.184 L 22.128 0.56 L 23.232 0.56 L 23.232 3.184 L 25.536 3.184 L 25.536 4.432 L 23.232 4.432 L 23.232 8.448 A 3.449 3.449 0 0 0 23.259 8.895 Q 23.323 9.383 23.54 9.653 A 0.889 0.889 0 0 0 23.624 9.744 Q 24.016 10.112 24.56 10.112 Q 24.96 10.112 25.32 9.984 Q 25.68 9.856 25.984 9.68 L 26.384 10.832 A 2.967 2.967 0 0 1 26.125 10.969 Q 25.997 11.03 25.846 11.089 A 6.938 6.938 0 0 1 25.52 11.208 Q 24.976 11.392 24.384 11.392 Q 23.184 11.392 22.488 10.6 Q 21.792 9.808 21.792 8.336 Z M 29.626 11.178 A 4.354 4.354 0 0 0 31.008 11.392 A 4.916 4.916 0 0 0 31.372 11.379 A 4.041 4.041 0 0 0 33.128 10.848 Q 34.064 10.304 34.608 9.32 A 4.201 4.201 0 0 0 35.032 8.177 A 5.469 5.469 0 0 0 35.152 7.008 Q 35.152 5.68 34.6 4.712 Q 34.048 3.744 33.112 3.216 A 3.976 3.976 0 0 0 32.369 2.892 A 4.438 4.438 0 0 0 31.008 2.688 A 5.012 5.012 0 0 0 30.755 2.694 A 4.187 4.187 0 0 0 28.896 3.216 Q 27.952 3.744 27.408 4.72 A 4.164 4.164 0 0 0 26.968 5.934 A 5.601 5.601 0 0 0 26.864 7.04 A 5.575 5.575 0 0 0 26.906 7.731 Q 27.012 8.585 27.392 9.289 A 4.097 4.097 0 0 0 27.4 9.304 Q 27.936 10.288 28.88 10.84 A 3.929 3.929 0 0 0 29.626 11.178 Z M 31.008 10.112 A 2.999 2.999 0 0 0 31.844 10.001 A 2.24 2.24 0 0 0 32.976 9.256 A 3.008 3.008 0 0 0 33.587 7.962 A 4.337 4.337 0 0 0 33.68 7.04 A 3.42 3.42 0 0 0 33.484 5.874 A 3.202 3.202 0 0 0 33.328 5.512 Q 32.976 4.816 32.376 4.392 Q 31.776 3.968 31.008 3.968 A 3.08 3.08 0 0 0 30.172 4.075 A 2.246 2.246 0 0 0 29.04 4.8 Q 28.363 5.6 28.337 6.904 A 5.259 5.259 0 0 0 28.336 7.008 Q 28.336 7.84 28.688 8.552 A 3.11 3.11 0 0 0 29.253 9.358 A 2.82 2.82 0 0 0 29.64 9.688 Q 30.24 10.112 31.008 10.112 Z M 5.136 1.504 L 3.024 6.88 L 7.232 6.88 L 5.136 1.504 Z"
          vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>
  ),
  justifyStart: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M0 0H8V128H0zM16 16H48V112H16zM56 16H88V112H56z"
      ></Path>
    </svg>
  ),
  justifyCenter: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M60 0H68V128H60zM20 16H52V112H20zM76 16H108V112H76z"
      ></Path>
    </svg>
  ),
  justifyEnd: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <g fill="none" fillRule="evenodd">
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M120 0H128V128H120z"
        ></Path>
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          // fill="#23282D"
          d="M80 16H112V112H80zM40 16H72V112H40z"
          transform="matrix(1 0 0 -1 0 128)"
        ></Path>
      </g>
    </svg>
  ),
  justifyBetween: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M120 0H128V128H120zM0 0H8V128H0zM12 16H44V112H12zM84 16H116V112H84z"
      ></Path>
    </svg>
  ),
  justifyAround: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M120 0H128V128H120zM0 0H8V128H0zM24 16H56V112H24zM72 16H104V112H72z"
      ></Path>
    </svg>
  ),
  justifyEvenly: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M120 0H128V128H120zM0 0H8V128H0zM72 16H104V112H72zM24 16H56V112H24z"
      ></Path>
    </svg>
  ),

  alignStart: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M0 0H128V8H0zM28 16H60V112H28zM68 16H106V112H68z"
      ></Path>
    </svg>
  ),
  alignCenter: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M60 0H68V128H60zM20 16H52V112H20zM76 16H108V112H76z"
      ></Path>
    </svg>
  ),
  alignEnd: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M0 120H128V128H0zM28 16H60V112H28zM68 16H100V112H68z"
      ></Path>
    </svg>
  ),
  alignStrech: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M0 120H128V128H0zM0 0H128V8H0zM40 16H88V112H40z"
      ></Path>
    </svg>
  ),
  alignBaseline: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <g fill="none" fillRule="evenodd">
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M0 60H128V68H0zM32 68H64V96H32zM72 68H104V112H72z"
        ></Path>
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M35 31H61V63H35zM75 31H101V63H75z"
        ></Path>
      </g>
    </svg>
  ),

  alignSelfStart: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
    fill = mainColor,
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M0 0H8V128H0zM16 28H112V60H16zM16 68H112V100H16z"
      ></Path>
    </svg>
  ),
  motion: ({ width = 24, height = 24, fill = mainColor }) => (
    <svg
      fill={fill}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1 16v-5H7l6-7v5h4l-6 7z"></path>
      </g>
    </svg>
  ),
  play: ({ fill = mainColor || "#00e800", width = 24, height = 24 }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
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
          d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  pause: ({ fill = mainColor, width = 24, height = 24 }) => (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
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
          d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z"
          fill={fill}
        ></path>{" "}
        <path
          d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  resume: ({ fill = mainColor, width = 24, height = 24 }) => (
    <svg
      viewBox="0 0 15 15"
      width={width}
      height={height}
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.04995 2.74995C3.04995 2.44619 2.80371 2.19995 2.49995 2.19995C2.19619 2.19995 1.94995 2.44619 1.94995 2.74995V12.25C1.94995 12.5537 2.19619 12.8 2.49995 12.8C2.80371 12.8 3.04995 12.5537 3.04995 12.25V2.74995ZM5.73333 2.30776C5.57835 2.22596 5.39185 2.23127 5.24177 2.32176C5.0917 2.41225 4.99995 2.57471 4.99995 2.74995V12.25C4.99995 12.4252 5.0917 12.5877 5.24177 12.6781C5.39185 12.7686 5.57835 12.7739 5.73333 12.6921L14.7333 7.94214C14.8973 7.85559 15 7.68539 15 7.49995C15 7.31452 14.8973 7.14431 14.7333 7.05776L5.73333 2.30776ZM5.99995 11.4207V3.5792L13.4287 7.49995L5.99995 11.4207Z"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  x: ({ fill = mainColor, width = 24, height = 24 }) => (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
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
          d="m 3 2 c -0.265625 0 -0.519531 0.105469 -0.707031 0.292969 c -0.390625 0.390625 -0.390625 1.023437 0 1.414062 l 4.292969 4.292969 l -4.292969 4.292969 c -0.390625 0.390625 -0.390625 1.023437 0 1.414062 s 1.023437 0.390625 1.414062 0 l 4.292969 -4.292969 l 4.292969 4.292969 c 0.390625 0.390625 1.023437 0.390625 1.414062 0 s 0.390625 -1.023437 0 -1.414062 l -4.292969 -4.292969 l 4.292969 -4.292969 c 0.390625 -0.390625 0.390625 -1.023437 0 -1.414062 c -0.1875 -0.1875 -0.441406 -0.292969 -0.707031 -0.292969 s -0.519531 0.105469 -0.707031 0.292969 l -4.292969 4.292969 l -4.292969 -4.292969 c -0.1875 -0.1875 -0.441406 -0.292969 -0.707031 -0.292969 z m 0 0"
          fill={fill}
        ></path>{" "}
      </g>
    </svg>
  ),
  reverse: ({
    fill = mainColor,
    strokeColor = mainColor,
    width = 24,
    height = 24,
  }) => (
    <svg
      viewBox="0 0 21 21"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g
          fill="none"
          fillRule="evenodd"
          stroke={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(3 3)"
        >
          {" "}
          <path d="m6.5 6.5-4 4 4 4" strokeWidth={1.5}></path>{" "}
          <path d="m14.5 10.5h-12" strokeWidth={1.5}></path>{" "}
          <path d="m8.5.5 4 4-4 4" strokeWidth={1.5}></path>{" "}
          <path d="m12.5 4.5h-12" strokeWidth={1.5}></path>{" "}
        </g>{" "}
      </g>
    </svg>
  ),
  alignSelfCenter: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M60 0H68V24H60zM60 104H68V128H60zM16 28H112V60H16zM16 68H112V100H16z"
      ></Path>
    </svg>
  ),

  alignSelfEnd: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M120 0H128V128H120zM16 28H112V60H16zM16 68H112V100H16z"
      ></Path>
    </svg>
  ),
  alignSelfStretch: ({
    strokeColor,
    strokeWidth,
    width = "24",
    height = "24",
  }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M120 0H128V128H120zM0 0H8V128H0zM16 28H112V60H16zM16 68H112V100H16z"
      ></Path>
    </svg>
  ),
  columnDir: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      className="bricks-svg"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M16 86H112V112H16zM16 51H112V77H16zM16 16H112V42H16z"
      ></Path>
    </svg>
  ),
  rowDir: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <Path
        fill="#cbd5e1"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        d="M86 16H112V112H86zM51 16H77V112H51zM16 16H42V112H16z"
      ></Path>
    </svg>
  ),
  reverseDir: ({ strokeColor, strokeWidth, width = "24", height = "24" }) => (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <g fill="none" fillRule="evenodd">
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M56,19.9992122 L10,20 C4.4771525,20 -1.10000309e-15,15.5228475 0,10 C-6.61662521e-16,4.5971155 4.37990327,0.217212229 9.78278777,0.217212229 C9.8543947,0.217212229 9.92599948,0.217998439 9.99758914,0.219570718 L66.8367796,1.46789386 C70.9424147,1.55806332 74.3834686,4.27942675 75.5633162,7.9999083 L76,8 L76,32 L81.1715729,32 C81.7020059,32 82.2107137,32.2107137 82.5857864,32.5857864 C83.366835,33.366835 83.366835,34.633165 82.5857864,35.4142136 L82.5857864,35.4142136 L67.4142136,50.5857864 C66.633165,51.366835 65.366835,51.366835 64.5857864,50.5857864 L64.5857864,50.5857864 L49.4142136,35.4142136 C49.0391408,35.0391408 48.8284271,34.530433 48.8284271,34 C48.8284271,32.8954305 49.7238576,32 50.8284271,32 L50.8284271,32 L56,32 L56,19.9992122 Z"
          transform="translate(30 24)"
        ></Path>
        <Path
          fill="#cbd5e1"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M56,20 L8,20 C3.581722,20 5.41083001e-16,16.418278 0,12 L0,8 C-5.41083001e-16,3.581722 3.581722,8.11624501e-16 8,0 L68,0 C72.3349143,-7.96310831e-16 75.8645429,3.44783777 75.9961932,7.75082067 L76,8 L76,32 L81.1715729,32 C81.7020059,32 82.2107137,32.2107137 82.5857864,32.5857864 C83.366835,33.366835 83.366835,34.633165 82.5857864,35.4142136 L82.5857864,35.4142136 L67.4142136,50.5857864 C66.633165,51.366835 65.366835,51.366835 64.5857864,50.5857864 L64.5857864,50.5857864 L49.4142136,35.4142136 C49.0391408,35.0391408 48.8284271,34.530433 48.8284271,34 C48.8284271,32.8954305 49.7238576,32 50.8284271,32 L50.8284271,32 L56,32 L56,20 Z"
          transform="rotate(180 49 52)"
        ></Path>
      </g>
    </svg>
  ),
  dynamicTemp: ({
    strokeColor = "#64748B",
    strokeWidth = ".2",
    width = "24",
    height = "24",
    fill = "#64748B",
  }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      // role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <title>Dynamic Template</title>
        <Path
          fill={fill}
          justFillOnHover={true}
          strokeWidth={strokeWidth}
          stroke={strokeColor}
          d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zM16.795 22.677c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z"
        ></Path>
      </g>
    </svg>
  ),
  diminsions: ({ width, height }) => (
    <svg
      width="101"
      height="51"
      viewBox="0 0 101 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.81604"
        y="-0.000793457"
        width="99.8056"
        height="50.8813"
        fill="#475569"
      />
      <line
        x1="51.2081"
        y1="-0.0007324"
        x2="51.2081"
        y2="50.8806"
        stroke="#64748B"
        strokeWidth="0.978487"
      />
      <line
        x1="0.81604"
        y1="24.9506"
        x2="100.622"
        y2="24.9506"
        stroke="#64748B"
        strokWidth="0.978487"
      />
      <rect
        x="42.891"
        y="17.612"
        width="15.6558"
        height="15.6558"
        fill="#334155"
      />
    </svg>
  ),
};
