import { AnimationsBuilder } from "@/components/Editor/AnimationsBuilder";
import { CustomModals } from "@/components/Editor/CustomModals";
import { HomeHeader } from "@/components/Editor/EditorHeader";
import { HomeNav } from "@/components/Editor/EditorNav";
import { GJEditor } from "@/components/Editor/GJEditor";
import { Iframe } from "@/components/Editor/Iframe";
import { Aside } from "@/components/Editor/Protos/Aside";
import { AsideControllers } from "@/components/Editor/Protos/AsideControllers";
import { Layers } from "@/components/Editor/Protos/Layers";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { StyleAside } from "@/components/Editor/StyleAside";
import { ViewsPanel } from "@/components/Editor/ViewsPanel";
import { ViewsPanelNav } from "@/components/Editor/ViewsPanelNav";
import { Loader } from "@/components/Loader";
import { BusyProvider } from "@/components/Protos/BusyProvider";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { WordpressViewPanel } from "@/components/Protos/wordpress/WordpressViewPanel";
import { WordpressViewPanelNav } from "@/components/Protos/wordpress/WordpressViewPanelNav";
import { WpSettings } from "@/components/Protos/wordpress/WpSettings";
import { WpTokenPickers } from "@/components/Protos/wordpress/WpTokenPickers";
import { ShowIf } from "@/components/ShowIf";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  app_type,
  current_page_id,
  current_project_id,
} from "@/constants/shared";
import { tailwindClasses } from "@/constants/tailwindClasses";
import {
  appInstallingState,
  currentElState,
  currentWpPageNameState,
  dbAssetsSwState,
  modalDataState,
  reloaderState,
  showAnimationsBuilderState,
  showComponentsInLeftPanelState,
  showCustomModalState,
  showLayersState,
  showPreviewState,
  showStylesBuilderForMotionBuilderState,
} from "@/helpers/atoms";
import { isProjectExist } from "@/helpers/bridge";
import {
  assetsWorker,
  offlineInstallerWorker,
  pageBuilderWorker,
  routerWorker,
} from "@/helpers/defineWorkers";
import {
  getProjectData,
  getProjectId,
  getProjectSettings,
  isWordpress,
  workerCallbackMakerWithProps,
} from "@/helpers/functions";
import {
  infinitelyWorker,
  reInitInfinitelyWorker,
} from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { swAliveInterval } from "@/helpers/keepSwAlive";
import { useOfflineHandler } from "@/hooks/useOfflineHandler";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useWorkerToast } from "@/hooks/useWorkerToast";
import { useWorkreFetch } from "@/hooks/useWorkreFetch";
import { initDBAssetsSw } from "@/serviceWorkers/initDBAssets-sw";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { isPlainObject } from "lodash";
import React, { memo, useEffect, useLayoutEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Navigate,
  Outlet,
  useNavigate,
  useResolvedPath,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

//

//
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
  const [allWorkersDone, setAllWorkersDone] = useState({
    // pageBuilderWorker: false,
    assetsWorker: false,
    routerWorker: false,
    // offlineInstallerWorker: false,
    infinitelyWorker: false,
  });
  const [parent] = useAutoAnimate();
  const [mainAnimate] = useAutoAnimate({ duration: 100 });
  const [appInstalling, setAppInstalling] = useRecoilState(appInstallingState);
  const [reloader, setReloader] = useRecoilState(reloaderState);
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const app_type_name = localStorage.getItem(app_type);
  const currentPageName = localStorage.getItem(current_page_id);
  const [showStylesBuilder, setShowStylesBuilder] = useRecoilState(
    showStylesBuilderForMotionBuilderState,
  );
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  const [isProject, setIsProject] = useState(true);

  useLayoutEffect(() => {
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

    (async () => {
      if (!getProjectId()) {
        console.error("opfs id is not found, reloading the page");
        setReloader((prev) => prev + 1);
        return;
      }
      opfs.id = getProjectId();
      await opfs.init(+localStorage.getItem(current_project_id));

      console.log("opfs id is :", opfs.id);

      // infinitelyWorker.postMessage({
      //   command: "initOPFS",
      //   props: { id: getProjectId() },
      // });

      routerWorker.postMessage({
        command: "clean-opfs-broadcast",
      });

      workerCallbackMakerWithProps(
        infinitelyWorker,
        "initOPFS",
        {
          id: getProjectId(),
        },
        (props) => {
          if (props.done) {
            console.log(`props.done is ${props.done} infinitelyWorker`);
            setAllWorkersDone((prev) => ({
              ...prev,
              infinitelyWorker: true,
            }));
          }
        },
      );

      // assetsWorker.postMessage({
      //   command: "initOPFS",
      //   props: { id: getProjectId() },
      // });

      workerCallbackMakerWithProps(
        assetsWorker,
        "initOPFS",
        {
          id: getProjectId(),
        },
        (props) => {
          if (props.done) {
            console.log(`props.done is ${props.done} assetsWorker`);
            setAllWorkersDone((prev) => ({
              ...prev,
              assetsWorker: true,
            }));
          }
        },
      );

      workerCallbackMakerWithProps(
        routerWorker,
        "initOPFS",
        {
          id: getProjectId(),
        },
        (props) => {
          if (props.done) {
            console.log(`props.done is ${props.done} routerWorker`);
            // setIsAssetsWorkerDone(true);
            setAllWorkersDone((prev) => ({
              ...prev,
              routerWorker: true,
            }));
          }
        },
      );

      workerCallbackMakerWithProps(
        routerWorker,
        "listenToOPFSBroadcastChannel",
        {
          id: getProjectId(),
        },
        (props) => {
          if (props.done) {
            console.log(`props.done is ${props.done} routerWorker`);
            // setIsAssetsWorkerDone(true);
            setAllWorkersDone((prev) => ({
              ...prev,
              routerWorker: true,
            }));
          }
        },
      );
      //  routerWorker.postMessage({
      //    command: "listenToOPFSBroadcastChannel",
      //    props: { id: +localStorage.getItem(current_project_id) },
      //  });
    })();

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
    const windowNavigate = (ev) => {
      navigate(ev.detail.to);
    };
    window.addEventListener(
      InfinitelyEvents.navigator.navigate,
      windowNavigate,
    );
    // routerWorker.addEventListener("message", cb);

    setCurrentEl({ currentEl: null, addStyle: null });
    return () => {
      // routerWorker.removeEventListener("message", cb);
      window.removeEventListener(
        InfinitelyEvents.navigator.navigate,
        windowNavigate,
      );
    };
  }, []);

  useEffect(() => {
    (async () => {
      const isProjectExistRes = await isProjectExist(getProjectId());

      setIsProject(isProjectExistRes);
      console.log(`is project exist : ${isProjectExistRes}`);

      if (!isProjectExistRes) {
        navigate("/workspace", { viewTransition: true });
      }
    })();
  }, []);

  useOfflineHandler();
  useWorkreFetch(offlineInstallerWorker);
  useWorkerToast();

  return (
    <>
      <ShowIf condition={getProjectId()}>
        <ShowIf condition={!currentPageName && isWordpress()}>
          <Navigate to={"/wordpress/select"} replace />
        </ShowIf>

        <ShowIf
          condition={
            Object.values(allWorkersDone).every(Boolean) && currentPageName
          }
        >
          <BusyProvider>
            <section className={`w-full h-full  relative`}>
              <GJEditor key={reloader}>
                {/* <WithEditor> */}
                <main
                  className="relative w-full h-full bg-surface-main flex justify-between"
                  ref={mainAnimate}
                >
                  {/* {!showPreview && <HomeNav />} */}
                  <HomeNav />
                  <section
                    // ref={parent}
                    id="main-group"
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
                      <ShowIf
                        condition={
                          Object.values(showsComponents).some(
                            (item) => !isPlainObject(item) && Boolean(item),
                          ) && !showPreview
                        }
                      >
                        <Panel defaultSize={300} id="left-panel" order={1}>
                          <section
                            // ref={parentForPanelsGroup}
                            className="h-full w-full"
                          >
                            {/* {showLayers && (
                              <Aside dir="right">
                                <Layers />
                              </Aside>
                            )} */}

                            <ShowIf condition={showsComponents.layers}>
                              <Aside dir="right">
                                <Layers />
                              </Aside>
                            </ShowIf>

                            {/* {showAnimBuilder && (
                              <Aside>
                                <AnimationsBuilder />
                              </Aside>
                            )} */}

                            <ShowIf
                              condition={showsComponents.animationsBuilder}
                            >
                              <Aside>
                                <AnimationsBuilder />
                              </Aside>
                            </ShowIf>

                            {/* {showStylesBuilder && (
                              <section className="h-full pl-2 pr-1 overflow-y-auto hideScrollBar">
                                <StyleAside />
                              </section>
                            )} */}

                            <ShowIf condition={showsComponents.stylesBuilder}>
                              <section className="h-full pl-2 pr-1 overflow-y-auto hideScrollBar">
                                <StyleAside />
                              </section>
                            </ShowIf>

                            <ShowIf condition={showsComponents.viewPanel}>
                              <ShowIf
                                condition={
                                  showsComponents.views?.[
                                    showsComponents.views.viewKey
                                  ]?.supportNav &&
                                  !Object.values(
                                    showsComponents.views?.[
                                      showsComponents.views.viewKey
                                    ]?.panels,
                                  ).some((item) => item.show)
                                }
                              >
                                <ViewsPanelNav />
                              </ShowIf>

                              <ShowIf
                                condition={
                                  showsComponents.views?.viewKey &&
                                  Object.values(
                                    showsComponents.views?.[
                                      showsComponents.views.viewKey
                                    ]?.panels,
                                  ).some((item) => item.show)
                                }
                              >
                                 <ViewsPanel
                                  viewKey={showsComponents.views.viewKey}
                                />
                              
                              </ShowIf>
                            </ShowIf>
                          </section>
                        </Panel>
                        <PanelResizeHandle
                          className={`w-[5px] bg-brand-primary  opacity-0 hover:opacity-[1] transition-all`}
                        />
                      </ShowIf>
                      {/* {(showAnimBuilder || showLayers || showStylesBuilder) &&
                        !showPreview && (
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

                                {showStylesBuilder && (
                                  <section className="h-full pl-2 pr-1 overflow-y-auto hideScrollBar">
                                    <StyleAside />
                                  </section>
                                )}
                              </section>
                            </Panel>
                            <PanelResizeHandle
                              className={`w-[5px] bg-brand-primary  opacity-0 hover:opacity-[1] transition-all`}
                            />
                          </>
                        )} */}

                      <Panel id="center" defaultSize={600} order={2}>
                        <Iframe />
                      </Panel>

                      <PanelResizeHandle className="w-[5px] bg-brand-primary opacity-0 hover:opacity-[1] transition-all" />
                      <Panel defaultSize={300} order={3} id="right-panel">
                        <Aside>
                          {pathname.pathname != "/add-blocks" && (
                            <AsideControllers />
                          )}
                          <Outlet />
                        </Aside>
                      </Panel>
                    </PanelGroup>
                  </section>

                  <ShowIf condition={showCustomModal}>
                    <CustomModals />
                  </ShowIf>

                  <Wordpress>
                    <WpTokenPickers />
                  </Wordpress>

                  {/* <CustomModals /> */}
                  {/* <Popover /> */}
                </main>
                {/* </WithEditor> */}
              </GJEditor>
            </section>
          </BusyProvider>
        </ShowIf>

        <ShowIf
          condition={
            !(Object.values(allWorkersDone).every(Boolean) && currentPageName)
          }
        >
          <section className={`h-full w-full bg-surface-main`}>
            <Loader />
          </section>
        </ShowIf>
      </ShowIf>

      <ShowIf condition={!getProjectId()}>
        <Navigate to="/workspace" replace={true} />
      </ShowIf>
    </>
  );

  // return isProject ? (
  //   !currentPageName && app_type_name == "wordpress" ? (
  //     <Navigate to={"/wordpress/select"} replace />
  //   ) : isAssetsWorkerDone ? (
  //     <BusyProvider>
  //       <section
  //         className={`w-full h-full  relative`}
  //       >
  //         {/* <ToastContainer
  //           // toastStyle={{ background: "transparent" }}

  //           autoClose={3000}
  //           draggable={true}
  //           theme="dark"
  //           limit={10}
  //           pauseOnHover={true}
  //           position="top-left"
  //           toastClassName={`bg-surface-secondary`}
  //           className={`z-[1000000]    `}
  //           // containerId={`main-toast-container`}

  //           // stacked={true}
  //         /> */}
  //         <GJEditor key={reloader}>
  //           {/* <WithEditor> */}
  //           <main
  //             className="relative w-full h-full bg-surface-main flex justify-between"
  //             ref={mainAnimate}
  //           >
  //             {/* {!showPreview && <HomeNav />} */}
  //             <HomeNav />
  //             <section
  //               // ref={parent}
  //               id="main-group"
  //               className={`${
  //                 showPreview
  //                   ? "w-full"
  //                   : "w-[calc(100%-55px)] border-l-[1.5px] border-slate-400"
  //               } flex flex-col h-full `}
  //             >
  //               {/* {!showPreview && <HomeHeader />} */}
  //               <HomeHeader />
  //               <PanelGroup
  //                 id={"panels-group"}
  //                 tagName="section"
  //                 className="flex h-full w-full"
  //                 direction="horizontal"
  //                 autoSaveId="panels"
  //                 // ref={parentForPanelsGroup}
  //               >
  //                 {(showAnimBuilder || showLayers || showStylesBuilder) &&
  //                   !showPreview && (
  //                     <>
  //                       <Panel defaultSize={300} id="left-panel" order={1}>
  //                         <section
  //                           // ref={parentForPanelsGroup}
  //                           className="h-full w-full"
  //                         >
  //                           {showLayers && (
  //                             <Aside dir="right">
  //                               <Layers />
  //                             </Aside>
  //                           )}

  //                           {showAnimBuilder && (
  //                             <Aside>
  //                               <AnimationsBuilder />
  //                             </Aside>
  //                           )}
  //                           {showStylesBuilder && (
  //                             <section className="h-full pl-2 pr-1 overflow-y-auto hideScrollBar">
  //                               <StyleAside />
  //                             </section>
  //                           )}
  //                         </section>
  //                       </Panel>
  //                       <PanelResizeHandle
  //                         className={`w-[5px] bg-brand-primary  opacity-0 hover:opacity-[1] transition-all`}
  //                       />
  //                     </>
  //                   )}

  //                 <Panel id="center" defaultSize={600} order={2}>
  //                   <Iframe />
  //                 </Panel>

  //                 {/* {!showPreview && (
  //                 <>
  //                   <PanelResizeHandle className="w-[5px] bg-brand-primary opacity-0 hover:opacity-[1] transition-all" />
  //                   <Panel defaultSize={300} order={3} id="right-panel">
  //                     <Aside>
  //                       {pathname.pathname != "/add-blocks" && (
  //                         <AsideControllers />
  //                       )}
  //                       <Outlet />
  //                     </Aside>
  //                   </Panel>
  //                 </>
  //               )} */}

  //                 <PanelResizeHandle className="w-[5px] bg-brand-primary opacity-0 hover:opacity-[1] transition-all" />
  //                 <Panel defaultSize={300} order={3} id="right-panel">
  //                   <Aside>
  //                     {pathname.pathname != "/add-blocks" && (
  //                       <AsideControllers />
  //                     )}
  //                     <Outlet />
  //                   </Aside>
  //                 </Panel>
  //               </PanelGroup>
  //             </section>

  //             {showCustomModal && <CustomModals />}

  //             {/* <CustomModals /> */}
  //             {/* <Popover /> */}
  //           </main>
  //           {/* </WithEditor> */}
  //         </GJEditor>
  //       </section>
  //     </BusyProvider>
  //   ) : (
  //     <section
  //       className={`h-full w-full bg-surface-main`}
  //     >
  //       <Loader />
  //     </section>
  //   )
  // ) : (
  //   <Navigate to="/workspace" replace={true} />
  // );
}

// Editor.whyDidYouRender = true; // 👈 Required for tracking
