import { useEditorMaybe } from "@grapesjs/react";
import React from "react";
import { useRecoilValue } from "recoil";

export const BrowserWindow = () => {
    const editor = useEditorMaybe();
    const showPreview = useRecoilValue(show)
  return (
    <section
      className="w-full h-full rounded-xl overflow-hidden p-1"
      style={{ display: showPreview ? "block" : "none" }}
    >
      <header className="w-full h-[60px] flex items-center justify-between p-2 rounded-tl-lg rounded-tr-lg  bg-black">
        <ul className="flex items-center gap-3">
          <li className="w-[15px] h-[15px] bg-red-600 rounded-full"></li>
          <li className="w-[15px] h-[15px] bg-green-600 rounded-full"></li>
          <li className="w-[15px] h-[15px] bg-yellow-600 rounded-full"></li>
        </ul>

        <h1 className="text-slate-200 text-md p-2 bg-slate-800 rounded-lg font-semibold">
          {(editor && editor.Pages.getSelected().getName()) ||
            "No Named Page..."}
        </h1>

        <button
          onClick={(ev) => {
            addClickClass(ev.currentTarget, "click");
            reloadPreview();
          }}
        >
          {Icons.refresh({ width: 20, height: 20 })}
        </button>
      </header>
      <main className="h-full">
        <iframe
          ref={previewIframe}
          id="preview"
          className={`bg-white w-full h-full  transition-all`}
          // srcDoc={srcDoc}
        ></iframe>
      </main>
    </section>
  );
};
