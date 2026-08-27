import { modalDataState } from "@/helpers/atoms";
import { addClickClass } from "@/helpers/cocktail";
import { Icons } from "@/components/Icons/Icons";
import { BusyProvider } from "@/components/Protos/BusyProvider";
import { Button } from "@/components/Protos/Button";
import { P } from "@/components/Protos/P";
import { LibraryInstallerModal } from "@/components/Editor/Modals/LibraryInstallerModal";
import { RestAPIModels } from "@/components/Editor/Modals/RestAPIModels";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { LibraryInstaller } from "@/components/Editor/Protos/LibraryInstaller";
import Portal from "@/components/Editor/Portal";
import { useEditorMaybe } from "@grapesjs/react";
import React, { memo, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const CustomModals = () => {
  const editor = useEditorMaybe();
  const modalData = useRecoilValue(modalDataState);
  const setModalData = useSetRecoilState(modalDataState);
  const [isClose, setClose] = useState(false);
  const [modalProps, setModalProps] = useState({});

  return (
    <Portal container={document.querySelector("#root")}>
      <section
        id="main-modal"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) {
            editor.Commands.run("close:custom:modal");
          }
        }}
        style={{ zIndex: 1000 }}
        className={`
          fixed ${window?.electron?.isDesktop ? 'top-[40px]' : 'top-0'} left-0 transition-all bg-blue-950/40 backdrop-blur-sm w-full h-full flex justify-center items-center
          animate-go-to`}
      >
        <main
          style={{ ...modalProps }}
          onClick={(ev) => {
            ev.stopPropagation();
          }}
          className="container m-auto h-[75%] rounded-lg flex flex-col justify-between bg-surface-secondary shadow-md shadow-[#020617]"
        >
          <header className="w-full flex items-center rounded-lg rounded-br-none h-[60px] border-b-2 bg-surface-secondary border-b-slate-600">
            <section className="w-full flex justify-between items-center p-2">
              <FitTitle className="flex items-center gap-2">
                {modalData.title}
              </FitTitle>
              <section className="flex items-center gap-2">
                {/* <button
                  className="cursor-pointer flex items-center justify-center w-[27px] h-[27px] bg-yellow-600 rounded-full"
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    if (modalProps.width || modalProps.height) {
                      setModalProps({});
                    } else {
                      setModalProps({
                        width: "100%",
                        height: "100%",
                        margin: "unset",
                      });
                    }
                  }}
                >
                  {Icons.fullscreen({ fill: "white", height: 17, width: 17 })}
                </button> */}
                <button
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    editor.Commands.run("close:custom:modal");
                  }}
                  className="cursor-pointer flex items-center justify-center w-[27px] h-[27px] bg-brand-primary rounded-full"
                >
                  {Icons.close("white", 2, "blue")}
                </button>
              </section>
            </section>
          </header>

          <section className="animate-go-to p-2 h-full max-h-full overflow-auto rounded-bl-lg rounded-br-lg bg-surface-secondary">
            <BusyProvider>
              {modalData.JSXModal}

            </BusyProvider>
          </section>
        </main>
      </section>
    </Portal>
  );
};