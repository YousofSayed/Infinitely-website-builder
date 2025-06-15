import React, { memo, useEffect, useLayoutEffect, useState } from "react";
import { HomeNav } from "../components/Editor/EditorNav";
import { HomeHeader } from "../components/Editor/EditorHeader";
import { Iframe } from "../components/Editor/Iframe";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { GJEditor } from "../components/Editor/GJEditor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Aside } from "../components/Editor/Protos/Aside";
import { Outlet, useNavigate, useResolvedPath } from "react-router-dom";
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
import { pageBuilderWorker } from "../helpers/defineWorkers";

// export const Editor = () => {
//   const navigate = useNavigate();
//   const showLayers = useRecoilValue(showLayersState);
//   const showAnimBuilder = useRecoilValue(showAnimationsBuilderState);
//   const setModalData = useSetRecoilState(modalDataState);
//   const showPreview = useRecoilValue(showPreviewState);
//   const [isClose, setClose] = useState(true);
//   const pathname = useResolvedPath();
//   const setShowCustomModal = useSetRecoilState(showCustomModalState);
//   const showCustomModal = useRecoilValue(showCustomModalState);
//   // const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);

//   useEffect(() => {
//     /**
//      *
//      * @param {CustomEvent} ev
//      */
//     const openModal = (ev) => {
//       console.log("open");

//       setShowCustomModal(true);
//       setModalData({
//         title: ev.detail.title,
//         JSXModal: ev.detail.JSXModal,
//         width: ev.detail.width,
//         height: ev.detail.height,
//       });
//     };

//     const closeModal = (ev) => {
//       console.log("close");

//       setShowCustomModal(false);
//     };

//     window.addEventListener("open:custom:modal", openModal);
//     window.addEventListener("close:custom:modal", closeModal);

//     return () => {
//       window.removeEventListener("open:custom:modal", openModal);
//       window.removeEventListener("close:custom:modal", closeModal);
//       // clearInterval(swAliveInterval);
//     };
//   }, []);

//   useLayoutEffect(() => {
//     const projectId = +localStorage.getItem(current_project_id);
//     if (!projectId) {
//       navigate("/workspace");
//     }
//     console.log('navo');

//     // initDBAssetsSw(setDBAssetsSw);
//   }, []);

//   // useEffect(() => {
//   //   if (!dbAssetsSw) return;
//   //   sendVarsToSw();
//   //   // dbAssetsSw.addEventListener('')
//   // }, [dbAssetsSw]);

//   // const sendVarsToSw = async () => {
//   //   dbAssetsSw.postMessage({
//   //     command: "setVar",
//   //     props: {
//   //       obj: {
//   //         projectId: +localStorage.getItem(current_project_id),
//   //         projectData: await getProjectData(),
//   //       },
//   //       // value: +localStorage.getItem(current_project_id),
//   //     },
//   //   });
//   // };

//   return (
//     <GJEditor>
//       <main className="relative w-full h-full bg-slate-950 flex justify-between">
//         <ToastContainer
//           toastStyle={{ background: " #111827 " }}
//           autoClose={3000}
//           draggable={true}
//           theme="dark"
//           // limit={3}
//           pauseOnHover={true}
//           position="top-left"
//           stacked={true}
//         />
//         {!showPreview && <HomeNav />}
//         <section
//           className={`${
//             showPreview
//               ? "w-full"
//               : "w-[calc(100%-55px)] border-l-[1.5px] border-slate-400"
//           } flex flex-col h-full `}
//         >
//           {!showPreview && <HomeHeader />}
//           <PanelGroup
//             tagName="section"
//             className="flex h-full w-full"
//             direction="horizontal"
//             autoSaveId="panels"
//           >
//             {(showAnimBuilder || showLayers) && !showPreview && (
//               <>
//                 <Panel defaultSize={300} id="left" order={1}>
//                   {showLayers && (
//                     <Aside
//                       dir="right"
//                       // style={{ display: showLayers ? "block" : "none" }}
//                     >
//                       <Layers />
//                     </Aside>
//                   )}

//                   <Aside
//                     style={{ display: showAnimBuilder ? "block" : "none" }}
//                   >
//                     <AnimationsBuilder />
//                   </Aside>
//                 </Panel>
//                 <PanelResizeHandle
//                   className={`w-[5px] bg-blue-600  opacity-0 hover:opacity-[1] transition-all`}
//                 />
//               </>
//             )}

//             <Panel id="center" defaultSize={600} order={2}>
//               <Iframe />
//             </Panel>

//             {!showPreview && (
//               <>
//                 <PanelResizeHandle className="w-[5px] bg-blue-600 opacity-0 hover:opacity-[1] transition-all" />
//                 <Panel defaultSize={300} className="" id="right" order={3}>
//                   <Aside>
//                     {pathname.pathname != "/add-blocks" && <AsideControllers />}
//                     <Outlet />
//                   </Aside>
//                 </Panel>
//               </>
//             )}
//           </PanelGroup>
//         </section>
//         {showCustomModal && <CustomModals />}

//         {/* <CustomModals /> */}
//         {/* <Popover /> */}
//       </main>
//     </GJEditor>
//   );
// };
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
  // const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);

  useEffect(() => {
    pageBuilderWorker.postMessage({
      command: "sendPreviewPagesToServiceWorker",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        editorData: {
          canvasCss: "",
          editorCss: "",
        },
      },
    });
    console.log("i should send preview page");
  });

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

    window.addEventListener("open:custom:modal", openModal);
    window.addEventListener("close:custom:modal", closeModal);

    return () => {
      window.removeEventListener("open:custom:modal", openModal);
      window.removeEventListener("close:custom:modal", closeModal);
      // clearInterval(swAliveInterval);
    };
  }, []);

  useLayoutEffect(() => {
    const projectId = +localStorage.getItem(current_project_id);
    if (!projectId) {
      navigate("/workspace");
    }
    console.log("navo");

    // initDBAssetsSw(setDBAssetsSw);
  }, []);

  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command != "toast") return;
      const { msg, type, isNotMessage } = props;
      toast[type]?.(isNotMessage ? msg : <ToastMsgInfo msg={msg} />);
    };
    infinitelyWorker.addEventListener("message", cb);

    return () => {
      infinitelyWorker.removeEventListener("message", cb);
    };
  }, []);

  // useEffect(() => {
  //   if (!dbAssetsSw) return;
  //   sendVarsToSw();
  //   // dbAssetsSw.addEventListener('')
  // }, [dbAssetsSw]);

  // const sendVarsToSw = async () => {
  //   dbAssetsSw.postMessage({
  //     command: "setVar",
  //     props: {
  //       obj: {
  //         projectId: +localStorage.getItem(current_project_id),
  //         projectData: await getProjectData(),
  //       },
  //       // value: +localStorage.getItem(current_project_id),
  //     },
  //   });
  // };

  return (
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
                <Panel defaultSize={300}  id="right" order={3}>
                  <Aside>
                   
                    {pathname.pathname != "/add-blocks" && <AsideControllers />}
                      <Outlet  />
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
  );
}
