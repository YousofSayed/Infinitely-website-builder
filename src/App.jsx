import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { StyleAside } from "./components/Editor/StyleAside";
import { Blocks } from "./components/Editor/Blocks";
import { TraitsAside } from "./components/Editor/TraitsAside";
import React, {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Loader } from "./components/Loader";
import { Workspace } from "./views/Workspace";
import { Commands } from "./components/Editor/Commands";
import { ChooseModel } from "./components/Editor/Protos/ChooseModel";
// import { DynamicContent } from "./components/Editor/Protos/DynamicContent";
// import { DynamicAttributes } from "./components/Editor/Protos/DynamicAttributes";
import { infinitelyWorker } from "./helpers/infinitelyWorker";
import { appInstallingState, dbAssetsSwState } from "./helpers/atoms";
import { initDBAssetsSw } from "./serviceWorkers/initDBAssets-sw";
import { useRecoilState } from "recoil";
// import "react-toastify/dist/ReactToastify.css";
import { current_project_id } from "./constants/shared";
import { getProjectData } from "./helpers/functions";
// import { swAliveInterval } from "./helpers/keepSwAlive";
import { Editor } from "./views/Editor";
import { Motion } from "./components/Editor/Protos/Motion";
import { pageBuilderWorker, refresherWorker } from "./helpers/defineWorkers";
import { Preview } from "./views/Preview";
import { useLiveQuery } from "dexie-react-hooks";
import { useOfflineHandler } from "./hooks/useOfflineHandler";
import { opfs } from "./helpers/initOpfs";
import { isDevMode } from "./helpers/bridge";
import { Opfs } from "./views/Opfs";
import { Interactions } from "./components/Editor/Interactions";
import { AppInstalling } from "./views/AppInstalling";
// import { esmToUmd } from "./helpers/initBabel";

function App() {
  // const Editor = lazy(async () => ({
  //   default: (await import("./views/Editor")).Editor,
  // }));
  // const Editor = lazy( async() => await import("./views/Editor"));

  const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);
  const [appInstalling, setAppInstalling] = useRecoilState(appInstallingState);
  const navigate = useNavigate();
  // const location = useLocation();

  useOfflineHandler();

  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const messageCallback = (ev) => {
      const { command, props } = ev.data;
      if (command == "exportProject") {
        const a = document.createElement("a");
        a.classList.add("hidden");
        a.download = props.name;
        const url = URL.createObjectURL(props.file);
        a.href = url;
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        console.log('export project from main: ');
        
      } else if (command == "varsToServiceWorker") {
        console.log("recived preview pages from worker , props : ", props);

        navigator.serviceWorker.controller.postMessage({
          command: "setVar",
          props: {
            obj: props.vars,
          },
        });

        // setTimeout(async()=>{
        //   console.log(await(await fetch('../pages/contac us.html')).text());

        // },100)
      } else if (command == "initSevrviceWorker") {
        console.log(
          "recived preview pages from initSevrviceWorker , props : ",
          props
        );
        initDBAssetsSw(setDBAssetsSw);
      }
    };

    infinitelyWorker.addEventListener("message", messageCallback);
    // pageBuilderWorker.addEventListener("message", messageCallback);
    createProjectFolder();
    return () => {
      infinitelyWorker.removeEventListener("message", messageCallback);
      // pageBuilderWorker.removeEventListener("message", messageCallback);
      // clearInterval(swAliveInterval);
    };
  }, []);

  useEffect(() => {
    refresherWorker.postMessage({
      command: "refreshSW",
    });

    (async () => {
      const prevRegs = await navigator.serviceWorker.getRegistrations();
      if (!(prevRegs.length && navigator.serviceWorker.controller)) {
        setAppInstalling(true);
        localStorage.setItem("installed", "false");
        await initDBAssetsSw(() => {
          setAppInstalling(false);
          localStorage.setItem("installed", "true");
        });
      } else {
        localStorage.setItem("installed", "true");
        setAppInstalling(false);
        // navigator.serviceWorker.getRegistration().then((registration) => {
        //   if (registration && registration.active) {
        //     registration.active.addEventListener("statechange", (e) => {
        //       if (e.target.state === "redundant") {
        //         console.log(
        //           "Service Worker became redundant (unregistered or replaced)."
        //         );
        //       }
        //     });
        //   }
        // });
      }
      console.log(
        "Previous registrations:",
        prevRegs,
        navigator.serviceWorker.controller
      );
    })();

    /**
     *
     * @param {MessageEvent} ev
     */
    const messageCallback = (ev) => {
      const { command, props } = ev.data;
      if (command == "refreshSW") {
        console.log("Got refreshSW event from refresher worker!");

        // initDBAssetsSw(setDBAssetsSw);
      }
    };

    refresherWorker.addEventListener("message", messageCallback);

    return () => {
      refresherWorker.removeEventListener("message", messageCallback);
    };
  }, []);


  const createProjectFolder = async () => {
    console.log("main rooooot : ", opfs.root);
    const projectFolder = await opfs.getFolder("projects");
    const isExisit = projectFolder.exists();
    if (!isExisit) {
      await projectFolder.create();
      // await opfs.createFolder(await opfs.root, "projects");
    }
  };

  return (
    // <Suspense fallback={<Loader />}>
    appInstalling ? (
      <AppInstalling />
    ) : (
      <Routes>
        <Route
          path="/"
          element={<Editor />}
          action={
            Boolean(+localStorage.getItem(current_project_id))
              ? null
              : () => navigate("/workspace")
          }
        >
          <Route path="add-blocks" element={<Blocks />} />
          <Route path="edite">
            <Route path="styling" element={<StyleAside />} />
            <Route path="traits" element={<TraitsAside />} />
            <Route path="commands" element={<Commands />} />
            <Route path="interactions" element={<Interactions />} />
            <Route path="motion" element={<Motion />} />
            {/* <Route path="choose-and-write-model" element={<ChooseModel />}>
              <Route path="dynamic-content" element={<DynamicContent />} />
              <Route
                path="dynamic-attributes"
                element={<DynamicAttributes />}
              />
            </Route> */}
          </Route>
        </Route>

        <Route path="/preview" element={<Preview />} />

        <Route path="/workspace" element={<Workspace />}></Route>

        {isDevMode() && <Route path="opfs-dev" element={<Opfs />} />}
      </Routes>
    )
    // </Suspense>
  );
}

export default App;

// (async()=>{
//   const code  = await(await fetch(`https://cdn.jsdelivr.net/npm/opfs-tools@0.7.2/+esm`)).text()
//   console.log(`esm to module : `, esmToUmd(code , 'opfs-tools'));
// })()
