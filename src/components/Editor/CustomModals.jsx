import React, { memo, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { modalDataState } from "../../helpers/atoms";
import { P } from "../Protos/P";
import { Icons } from "../Icons/Icons";
import { addClickClass } from "../../helpers/cocktail";
import { useEditorMaybe } from "@grapesjs/react";
import { RestAPIModels } from "./Modals/RestAPIModels";
import { LibraryInstaller } from "./Protos/LibraryInstaller";
import { LibraryInstallerModal } from "./Modals/LibraryInstallerModal";
import { FitTitle } from "./Protos/FitTitle";

export const CustomModals = () => {
  const editor = useEditorMaybe();
  const modalData = useRecoilValue(modalDataState);
  const setModalData = useSetRecoilState(modalDataState);
  const [isClose, setClose] = useState(false);

  // useEffect(() => {
  //   /**
  //    *
  //    * @param {CustomEvent} ev
  //    */
  //   const openModal = (ev) => {
  //     setClose(false);
  //     setModalData({
  //       title: ev.detail.title,
  //       JSXModal: ev.detail.JSXModal,
  //       width:ev.detail.width,
  //       height:ev.detail.height
  //     });
  //   };
  //   window.addEventListener("open:custom:modal", openModal);
  //   window.addEventListener("close:custom:modal", (ev) => {
  //     setClose(true);
  //   });
  // });

  return (
    <section
      style={{
        // contain: "layout  paint  size  content  size  style",
        // willChange: "transform",
        // isolation:'isolate',
        // transform: "translateZ(0)",
        // backfaceVisibility: "hidden",
      }}
      onClick={(ev) => {
        // ev.stopPropagation();
        // ev.preventDefault();
        if (ev.target === ev.currentTarget) {
          // Only close if clicked directly on backdrop, not children
          editor.Commands.run("close:custom:modal");
        }
        // editor.Commands.run("close:custom:modal");
      }}
      className={`fixed   z-[55] backdrop-blur-sm right-0 left-0  w-full h-full flex justify-center items-center`}
    >
      <main
        style={{
          width: modalData.width,
          height: modalData.height,
        //    contain: "layout  paint  size  content  size  style",
        // willChange: "transform",
        // isolation:'isolate',
        // transform: "translateZ(0)",
        // backfaceVisibility: "hidden",
        }}
        onClick={(ev) => {
          // ev.stopPropagation();
          // ev.preventDefault();
          console.log("main is me");
          // document.body.click();
        }}
        className="z-[55] rounded-lg flex flex-col justify-between bg-slate-900 shadow-md shadow-[#020617]"
      >
        <header className="w-full flex items-center rounded-lg rounded-br-none  h-[60px]  border-b-2 bg-slate-900 border-b-slate-600">
          <section className="w-full flex justify-between  items-center p-2">
            {/* <p className="text-slate-300 text-lg capitalize select-none font-semibold flex items-center gap-2">
              {modalData.title}
            </p> */}
            <FitTitle className="flex items-center gap-2">
              {modalData.title}
            </FitTitle>
            <button
              onClick={(ev) => {
                addClickClass(ev.currentTarget, "click");
                editor.Commands.run("close:custom:modal");
              }}
              className="cursor-pointer z-50 flex items-center  justify-center w-[27px] h-[27px] bg-blue-600 rounded-full"
            >
              {Icons.close("white", 2, "blue")}
            </button>
          </section>
        </header>

        <section
          style={{
            // height: modalData.height,
        //      contain: "layout  paint  size  content  size  style",
        // willChange: "transform",
        // isolation:'isolate',
        // transform: "translateZ(0)",
        // backfaceVisibility: "hidden",
          }}
          className=" p-2 h-full max-h-full overflow-auto rounded-bl-lg rounded-br-lg bg-slate-900"
        >
          {modalData.JSXModal}
          {/* <RestAPIModels/> */}
          {/* <LibraryInstaller/> */}
          {/* <LibraryInstallerModal/>   */}
        </section>
      </main>
    </section>
  );
};
