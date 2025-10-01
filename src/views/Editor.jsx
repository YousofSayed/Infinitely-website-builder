import React, { memo, useEffect, useLayoutEffect, useState } from "react";
import { HomeNav } from "../components/Editor/EditorNav";
import { HomeHeader } from "../components/Editor/EditorHeader";
import { Iframe } from "../components/Editor/Iframe";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { GJEditor } from "../components/Editor/GJEditor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Aside } from "../components/Editor/Protos/Aside";
import {
  Navigate,
  Outlet,
  useNavigate,
  useResolvedPath,
} from "react-router-dom";
import {
  appInstallingState,
  currentElState,
  dbAssetsSwState,
  modalDataState,
  reloaderState,
  showAnimationsBuilderState,
  showCustomModalState,
  showLayersState,
  showPreviewState,
} from "../helpers/atoms";
import { Layers } from "../components/Editor/Protos/Layers";
import { CustomModals } from "../components/Editor/CustomModals";
import { AnimationsBuilder } from "../components/Editor/AnimationsBuilder";
import { toast, ToastContainer } from "react-toastify";
import { AsideControllers } from "../components/Editor/Protos/AsideControllers";
import { initDBAssetsSw } from "../serviceWorkers/initDBAssets-sw";
import { current_project_id } from "../constants/shared";
import { getProjectData, getProjectSettings } from "../helpers/functions";
import {
  infinitelyWorker,
  reInitInfinitelyWorker,
} from "../helpers/infinitelyWorker";
// import { swAliveInterval } from "../helpers/keepSwAlive";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import {
  assetsWorker,
  pageBuilderWorker,
  routerWorker,
} from "../helpers/defineWorkers";
import { useWorkerToast } from "../hooks/useWorkerToast";
import { opfs } from "../helpers/initOpfs";
import { defineRoot, getProjectRoot } from "../helpers/bridge";
import { Loader } from "../components/Loader";
import { minify } from "csso";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Memo } from "../components/Protos/Memo";
import { WithEditor } from "@grapesjs/react";
// import { tailwindClasses } from "../constants/tailwindClasses";
// tailwindClasses
export function Editor({ params }) {
  const navigate = useNavigate();
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  const showLayers = useRecoilValue(showLayersState);
  const showAnimBuilder = useRecoilValue(showAnimationsBuilderState);
  const setModalData = useSetRecoilState(modalDataState);
  const showPreview = useRecoilValue(showPreviewState);
  const [isClose, setClose] = useState(true);
  const pathname = useResolvedPath();
  const setShowCustomModal = useSetRecoilState(showCustomModalState);
  const showCustomModal = useRecoilValue(showCustomModalState);
  const [isAssetsWorkerDone, setIsAssetsWorkerDone] = useState(false);
  const [parent] = useAutoAnimate();
  const [mainAnimate] = useAutoAnimate({ duration: 100 });
  const [appInstalling, setAppInstalling] = useRecoilState(appInstallingState);
  const [reloader, setReloader] = useRecoilState(reloaderState);

  useEffect(() => {
    /**
     *
     * @param {CustomEvent} ev
     */
    const openModal = (ev) => {
      console.log("open");

      setShowCustomModal(true);
      setModalData({
        title: ev.detail.title,
        JSXModal: ev.detail.JSXModal,
        width: ev.detail.width,
        height: ev.detail.height,
      });
    };

    const closeModal = (ev) => {
      console.log("close");

      setShowCustomModal(false);
    };
    opfs.id = +localStorage.getItem(current_project_id);
    opfs.init(+localStorage.getItem(current_project_id));

    infinitelyWorker.postMessage({
      command: "initOPFS",
      props: { id: opfs.id },
    });

    assetsWorker.postMessage({
      command: "initOPFS",
      props: { id: opfs.id },
    });

    routerWorker.postMessage({
      command: "clean-opfs-broadcast",
    });
    routerWorker.postMessage({
      command: "listenToOPFSBroadcastChannel",
      props: { id: +localStorage.getItem(current_project_id) },
    });
    getProjectSettings();

    const infinitelyWorkerIniter = (ev) => {
      const { command } = ev.data;
      if (command == "updateDB") {
        // reInitInfinitelyWorker();
        infinitelyWorker.reInit((worker) => {
          worker.postMessage({
            command: "initOPFS",
            props: { id: +localStorage.getItem(current_project_id) },
          });
        });
        // infinitelyWorker.addEventListener("message", infinitelyWorkerIniter);
      }
    };
    infinitelyWorker.addEventListener("message", infinitelyWorkerIniter);
    window.addEventListener("open:custom:modal", openModal);
    window.addEventListener("close:custom:modal", closeModal);

    return () => {
      window.removeEventListener("open:custom:modal", openModal);
      window.removeEventListener("close:custom:modal", closeModal);
      infinitelyWorker.removeEventListener("message", infinitelyWorkerIniter);
      // broadCastCleaner();
      // clearInterval(swAliveInterval);
    };
  }, []);

  useEffect(() => {
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command == "listenToOPFSBroadcastChannel" && props.done) {
        setIsAssetsWorkerDone(true);
        // assetsWorker.removeEventListener("message", cb);
      }
    };

    routerWorker.addEventListener("message", cb);
    setCurrentEl({ currentEl: null, addStyle: null });
    return () => {
      routerWorker.removeEventListener("message", cb);
    };
  }, []);

  useWorkerToast();
  const isProject = Boolean(+localStorage.getItem(current_project_id));
  const [parentForPanelsGroup] = useAutoAnimate();
  return isProject ? (
    isAssetsWorkerDone ? (
      <section className="w-full h-full">
        <ToastContainer
          // toastStyle={{ background: "transparent" }}

          autoClose={3000}
          draggable={true}
          theme="dark"
          limit={10}
          pauseOnHover={true}
          position="top-left"
          toastClassName={`backdrop-blur-md bg-[#020617BF]`}
          className={`z-[1000000]    `}
          // containerId={`main-toast-container`}

          // stacked={true}
        />
        <GJEditor key={reloader}>
          {/* <WithEditor> */}
          <main
            className="relative w-full h-full bg-slate-950 flex justify-between"
            ref={mainAnimate}
          >
            {/* {!showPreview && <HomeNav />} */}
            <HomeNav />
            <section
              // ref={parent}
              className={`${
                showPreview
                  ? "w-full"
                  : "w-[calc(100%-55px)] border-l-[1.5px] border-slate-400"
              } flex flex-col h-full `}
            >
              {/* {!showPreview && <HomeHeader />} */}
              <HomeHeader />
              <PanelGroup
                id={"panels-group"}
                tagName="section"
                className="flex h-full w-full"
                direction="horizontal"
                autoSaveId="panels"
                // ref={parentForPanelsGroup}
              >
                {(showAnimBuilder || showLayers) && !showPreview && (
                  <>
                    <Panel defaultSize={300} id="left-panel" order={1}>
                      <section
                        // ref={parentForPanelsGroup}
                        className="h-full w-full"
                      >
                        {showLayers && (
                          <Aside dir="right">
                            <Layers />
                          </Aside>
                        )}

                        {showAnimBuilder && (
                          <Aside>
                            <AnimationsBuilder />
                          </Aside>
                        )}
                      </section>
                    </Panel>
                    <PanelResizeHandle
                      className={`w-[5px] bg-blue-600  opacity-0 hover:opacity-[1] transition-all`}
                    />
                  </>
                )}

                <Panel id="center" defaultSize={600} order={2}>
                  <Iframe />
                </Panel>

                {/* {!showPreview && (
                  <>
                    <PanelResizeHandle className="w-[5px] bg-blue-600 opacity-0 hover:opacity-[1] transition-all" />
                    <Panel defaultSize={300} order={3} id="right-panel">
                      <Aside>
                        {pathname.pathname != "/add-blocks" && (
                          <AsideControllers />
                        )}
                        <Outlet />
                      </Aside>
                    </Panel>
                  </>
                )} */}

                <PanelResizeHandle className="w-[5px] bg-blue-600 opacity-0 hover:opacity-[1] transition-all" />
                <Panel defaultSize={300} order={3} id="right-panel">
                  <Aside>
                    {pathname.pathname != "/add-blocks" && <AsideControllers />}
                    <Outlet />
                  </Aside>
                </Panel>
              </PanelGroup>
            </section>

            {showCustomModal && <CustomModals />}

            {/* <CustomModals /> */}
            {/* <Popover /> */}
          </main>
          {/* </WithEditor> */}
        </GJEditor>
      </section>
    ) : (
      <section className="h-full w-full bg-slate-950">
        <Loader />
      </section>
    )
  ) : (
    <Navigate to="/workspace" replace={true} />
  );
}

// Editor.whyDidYouRender = true; // 👈 Required for tracking
