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
  dbAssetsSwState,
  modalDataState,
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
import { getProjectData } from "../helpers/functions";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { swAliveInterval } from "../helpers/keepSwAlive";
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
// import { tailwindClasses } from "../constants/tailwindClasses";
// tailwindClasses
export function Editor({ params }) {
  const navigate = useNavigate();
  const showLayers = useRecoilValue(showLayersState);
  const showAnimBuilder = useRecoilValue(showAnimationsBuilderState);
  const setModalData = useSetRecoilState(modalDataState);
  const showPreview = useRecoilValue(showPreviewState);
  const [isClose, setClose] = useState(true);
  const pathname = useResolvedPath();
  const setShowCustomModal = useSetRecoilState(showCustomModalState);
  const showCustomModal = useRecoilValue(showCustomModalState);
  const [isAssetsWorkerDone, setIsAssetsWorkerDone] = useState(false);
  // const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);

  // useEffect(() => {
  //   pageBuilderWorker.postMessage({
  //     command: "sendPreviewPagesToServiceWorker",
  //     props: {
  //       projectId: +localStorage.getItem(current_project_id),
  //       editorData: {
  //         canvasCss: "",
  //         editorCss: "",
  //       },
  //     },
  //   });
  //   console.log("i should send preview page");
  // });

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
    infinitelyWorker.postMessage({
      command: "initOPFS",
      props: { id: opfs.id },
    });

    assetsWorker.postMessage({
      command: "initOPFS",
      props: { id: opfs.id },
    });

    console.log("opfs id : ", opfs.id, opfs._id);
    opfs.init(+localStorage.getItem(current_project_id));
    routerWorker.postMessage({
      command: "listenToOPFSBroadcastChannel",
      props: { id: +localStorage.getItem(current_project_id) },
    });

    // const broadCastCleaner = opfs.onBroadcast(
    //   "getFile",
    //   async (data) => {
    //     console.log(
    //       "recived getFile event from boadcast",
    //       opfs.id,
    //       data.projectId
    //     );
    //     const path = `${data.folderPath}/${data.fileName}`
    //     try {
    //       if (!opfs.id) {
    //         opfs.opfsBraodcast.postMessage({
    //           type: "sendFile",
    //           file: undefined,
    //           isExisit: false,
    //           fileName: undefined,
    //           filePath: undefined,
    //         });
    //         throw new Error(`Project id not found`);
    //       }

    //       const fileHandle = await opfs.getFile(
    //         `${getProjectRoot()}/${data.folderPath}/${data.fileName}`
    //       );
    //       const file = await fileHandle.getOriginFile();

    //         console.log(
    //         "recived path : ",
    //         `projects/project-${opfs.id || data.projectId}/${data.folderPath}/${
    //           data.fileName
    //         }`,
    //         file
    //       );
    //       if (!file) {
    //         throw new Error(`File not founded`);
    //       }
    //       const fileBraodcast = new BroadcastChannel(path);
    //       fileBraodcast.postMessage({
    //         type: "sendFile",
    //         file: file,
    //         isExisit: file ? true : false,
    //         fileName: fileHandle.name,
    //         filePath: fileHandle.path,
    //       });
    //     } catch (error) {
    //       const fileBraodcast = new BroadcastChannel(path);
    //       fileBraodcast.postMessage({
    //         type: "sendFile",
    //         file: undefined,
    //         isExisit: false,
    //         fileName: undefined,
    //         filePath: undefined,
    //       });
    //       throw new Error(error);
    //     }
    //   }
    //   // { once: true }
    // );

    window.addEventListener("open:custom:modal", openModal);
    window.addEventListener("close:custom:modal", closeModal);

    return () => {
      window.removeEventListener("open:custom:modal", openModal);
      window.removeEventListener("close:custom:modal", closeModal);
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

      // else {
      //   setIsAssetsWorkerDone(false);
      //   // assetsWorker.removeEventListener("message", cb);
      // }
    };

    // (async () => {
    //   await opfs.getAllFiles(defineRoot("assets"), {
    //     chunks: true,
    //     recursive:true,
    //     chunksCount:50,
    //     chunksStart:0,
    //     onChunk: (chunk) => {
    //       console.log(`Chunkkkk`, chunk);
    //     },
    //   });
    // })();
    routerWorker.addEventListener("message", cb);
    return () => {
      routerWorker.removeEventListener("message", cb);
    };
  }, []);

  useWorkerToast();
  const isProject = Boolean(+localStorage.getItem(current_project_id));

  return isProject ? (
    isAssetsWorkerDone ? (
      <GJEditor>
        <main className="relative w-full h-full bg-slate-950 flex justify-between">
          <ToastContainer
            toastStyle={{ background: " #111827 " }}
            autoClose={3000}
            draggable={true}
            theme="dark"
            limit={10}
            pauseOnHover={true}
            position="top-left"
            // stacked={true}
          />
          {!showPreview && <HomeNav />}
          <section
            className={`${
              showPreview
                ? "w-full"
                : "w-[calc(100%-55px)] border-l-[1.5px] border-slate-400"
            } flex flex-col h-full `}
          >
            {!showPreview && <HomeHeader />}
            <PanelGroup
              tagName="section"
              className="flex h-full w-full"
              direction="horizontal"
              autoSaveId="panels"
            >
              {(showAnimBuilder || showLayers) && !showPreview && (
                <>
                  <Panel defaultSize={300} id="left" order={1}>
                    {showLayers && (
                      <Aside
                        dir="right"
                        // style={{ display: showLayers ? "block" : "none" }}
                      >
                        <Layers />
                      </Aside>
                    )}

                    <Aside
                      style={{ display: showAnimBuilder ? "block" : "none" }}
                    >
                      <AnimationsBuilder />
                    </Aside>
                  </Panel>
                  <PanelResizeHandle
                    className={`w-[5px] bg-blue-600  opacity-0 hover:opacity-[1] transition-all`}
                  />
                </>
              )}

              <Panel id="center" defaultSize={600} order={2}>
                <Iframe />
              </Panel>

              {!showPreview && (
                <>
                  <PanelResizeHandle className="w-[5px] bg-blue-600 opacity-0 hover:opacity-[1] transition-all" />
                  <Panel defaultSize={300} id="right" order={3}>
                    <Aside>
                      {pathname.pathname != "/add-blocks" && (
                        <AsideControllers />
                      )}
                      <Outlet />
                    </Aside>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </section>
          {showCustomModal && <CustomModals />}

          {/* <CustomModals /> */}
          {/* <Popover /> */}
        </main>
      </GJEditor>
    ) : (
      <section className="h-full w-full bg-slate-950">
        <Loader />
      </section>
    )
  ) : (
    <Navigate to="/workspace" replace={true} />
  );
}
