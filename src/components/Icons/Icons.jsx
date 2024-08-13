import { Path } from "../Protos/Path";
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
      width="15"
      height="14"
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

  logo: () => (
    <svg
      width="43"
      height="43"
      viewBox="0 0 43 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="43" height="43" rx="21.5" fill="#2563EB" />
      <Path
        d="M20.18 18.32C19.7657 17.7412 19.2194 17.2697 18.5863 16.9444C17.9533 16.6192 17.2517 16.4497 16.54 16.45C14.03 16.45 11.99 18.49 11.99 21C11.99 23.51 14.03 25.55 16.54 25.55C18.23 25.55 19.8 24.66 20.67 23.21L22 21L23.32 18.79C23.748 18.0768 24.3533 17.4865 25.077 17.0765C25.8007 16.6664 26.6182 16.4506 27.45 16.45C29.96 16.45 32 18.49 32 21C32 23.51 29.96 25.55 27.45 25.55C25.95 25.55 24.64 24.81 23.81 23.68"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  ),
  stNote: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
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
  headphone: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.96005 18.49V15.57C5.96005 14.6 6.72005 13.73 7.80005 13.73C8.77005 13.73 9.64005 14.49 9.64005 15.57V18.38C9.64005 20.33 8.02005 21.95 6.07005 21.95C4.12005 21.95 2.50005 20.32 2.50005 18.38V12.22C2.39005 6.59999 6.83005 2.04999 12.45 2.04999C18.07 2.04999 22.5 6.59999 22.5 12.11V18.27C22.5 20.22 20.88 21.84 18.93 21.84C16.98 21.84 15.36 20.22 15.36 18.27V15.46C15.36 14.49 16.12 13.62 17.2 13.62C18.17 13.62 19.04 14.38 19.04 15.46V18.49"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),
  setting: (strokeColor, strokeWidth) => (
    <svg
      width="25"
      height="24"
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
  laptop: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M2 13H18V2H2V13ZM11 15V17H15V19H5V17H9V15H0.9918C0.44405 15 0 14.5511 0 13.9925V1.00748C0 0.45107 0.45531 0 0.9918 0H19.0082C19.556 0 20 0.44892 20 1.00748V13.9925C20 14.5489 19.5447 15 19.0082 15H11Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="#CBD5E1"
      />
    </svg>
  ),
  taplet: (strokeColor, strokeWidth) => (
    <svg
      width="16"
      height="21"
      viewBox="0 0 16 21"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M2 2.5V18.5H14V2.5H2ZM1 0.5H15C15.5523 0.5 16 0.94772 16 1.5V19.5C16 20.0523 15.5523 20.5 15 20.5H1C0.44772 20.5 0 20.0523 0 19.5V1.5C0 0.94772 0.44772 0.5 1 0.5ZM8 15.5C8.5523 15.5 9 15.9477 9 16.5C9 17.0523 8.5523 17.5 8 17.5C7.4477 17.5 7 17.0523 7 16.5C7 15.9477 7.4477 15.5 8 15.5Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="#CBD5E1"
      />
    </svg>
  ),
  mopile: (strokeColor, strokeWidth) => (
    <svg
      width="14"
      height="21"
      viewBox="0 0 14 21"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M2 2.5V18.5H12V2.5H2ZM1 0.5H13C13.5523 0.5 14 0.94772 14 1.5V19.5C14 20.0523 13.5523 20.5 13 20.5H1C0.44772 20.5 0 20.0523 0 19.5V1.5C0 0.94772 0.44772 0.5 1 0.5ZM7 15.5C7.5523 15.5 8 15.9477 8 16.5C8 17.0523 7.5523 17.5 7 17.5C6.4477 17.5 6 17.0523 6 16.5C6 15.9477 6.4477 15.5 7 15.5Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="#CBD5E1"
      />
    </svg>
  ),
  redo: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M18.1716 7.49955H11C7.68629 7.49955 5 10.1858 5 13.4996C5 16.8133 7.68629 19.4996 11 19.4996H20V21.4996H11C6.58172 21.4996 3 17.9178 3 13.4996C3 9.08127 6.58172 5.49955 11 5.49955H18.1716L15.636 2.96402L17.0503 1.5498L22 6.49955L17.0503 11.4493L15.636 10.0351L18.1716 7.49955Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="#CBD5E1"
      />
    </svg>
  ),
  undo: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M5.82843 7.49955L8.36396 10.0351L6.94975 11.4493L2 6.49955L6.94975 1.5498L8.36396 2.96402L5.82843 5.49955H13C17.4183 5.49955 21 9.08127 21 13.4996C21 17.9178 17.4183 21.4996 13 21.4996H4V19.4996H13C16.3137 19.4996 19 16.8133 19 13.4996C19 10.1858 16.3137 7.49955 13 7.49955H5.82843Z"
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        fill="#CBD5E1"
      />
    </svg>
  ),
  watch: (strokeColor, strokeWidth) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 25"
      fill="#64748B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M12.0003 3.5C17.3924 3.5 21.8784 7.37976 22.8189 12.5C21.8784 17.6202 17.3924 21.5 12.0003 21.5C6.60812 21.5 2.12215 17.6202 1.18164 12.5C2.12215 7.37976 6.60812 3.5 12.0003 3.5ZM12.0003 19.5C16.2359 19.5 19.8603 16.552 20.7777 12.5C19.8603 8.44803 16.2359 5.5 12.0003 5.5C7.7646 5.5 4.14022 8.44803 3.22278 12.5C4.14022 16.552 7.7646 19.5 12.0003 19.5ZM12.0003 17C9.51498 17 7.50026 14.9853 7.50026 12.5C7.50026 10.0147 9.51498 8 12.0003 8C14.4855 8 16.5003 10.0147 16.5003 12.5C16.5003 14.9853 14.4855 17 12.0003 17ZM12.0003 15C13.381 15 14.5003 13.8807 14.5003 12.5C14.5003 11.1193 13.381 10 12.0003 10C10.6196 10 9.50026 11.1193 9.50026 12.5C9.50026 13.8807 10.6196 15 12.0003 15Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  ),

  code: (strokeColor, strokeWidth) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <Path
          d="M9 8L5 11.6923L9 16M15 8L19 11.6923L15 16"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        ></Path>
      </g>
    </svg>
  ),
  trash: (strokeColor, strokeWidth) => (
    <svg
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
        fill="#CBD5E1"
        d="M11.7386 13.3406L16.5819 8.49741L17.9657 9.88119L11.7386 16.1083L5.51154 9.88119L6.89533 8.49741L11.7386 13.3406Z"
      />
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
          d="M2.347,9.633h38.297V3.76c0-2.068,1.689-3.76,3.76-3.76h21.144 c2.07,0,3.76,1.691,3.76,3.76v5.874h37.83c1.293,0,2.347,1.057,2.347,2.349v11.514H0V11.982C0,10.69,1.055,9.633,2.347,9.633 L2.347,9.633z M8.69,29.605h92.921c1.937,0,3.696,1.599,3.521,3.524l-7.864,86.229c-0.174,1.926-1.59,3.521-3.523,3.521h-77.3 c-1.934,0-3.352-1.592-3.524-3.521L5.166,33.129C4.994,31.197,6.751,29.605,8.69,29.605L8.69,29.605z M69.077,42.998h9.866v65.314 h-9.866V42.998L69.077,42.998z M30.072,42.998h9.867v65.314h-9.867V42.998L30.072,42.998z M49.572,42.998h9.869v65.314h-9.869 V42.998L49.572,42.998z"
        />
      </g>
    </svg>
  ),
};
