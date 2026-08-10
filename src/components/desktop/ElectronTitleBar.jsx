// components/ElectronTitleBar.jsx

import React from "react";
import Logo from "@/assets/images/logo.svg";

export default function  ElectronTitleBar() {
  const minimize = () => window.electron?.minimize();
  
  const maximize = () => window.electron?.maximize();
  
  const close = () => window.electron?.close();

  return (
    <div className="flex h-[30px!important] w-full select-none bg-slate-900 text-white shrink-0 grow">
      {/* App / title area */}
      <div
        className="
          flex h-full flex-1 items-center gap-2
          px-2
          [-webkit-app-region:drag]
        "
      >
        <img
          src={Logo}
          alt=""
          className="h-7 w-7 object-contain"
          draggable={false}
        />

        <span className="truncate text-base font-medium text-white ">
          Infinitely Studio
        </span>
      </div>

      {/* Window controls */}
      {/* <div className="flex h-full [-webkit-app-region:no-drag]">
        <button
          type="button"
          onClick={minimize}
          className="
            flex h-full w-11 items-center justify-center
            text-zinc-300
            transition-colors
            hover:bg-white/10
          "
        >
          <span className="text-xl">─</span>
        </button>

        <button
          type="button"
          onClick={maximize}
          className="
            flex h-full w-11 items-center justify-center
            text-zinc-300
            transition-colors
            hover:bg-white/10
          "
        >
          <span className="text-xl">□</span>
        </button>

        <button
          type="button"
          onClick={close}
          className="
            flex h-full w-11 items-center justify-center
            text-zinc-300
            transition-colors
            hover:bg-red-600
            hover:text-white
          "
        >
          <span className="text-xl leading-none">×</span>
        </button>
      </div> */}
    </div>
  );
}