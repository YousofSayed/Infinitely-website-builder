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
import { dbAssetsSwState } from "./helpers/atoms";
import { initDBAssetsSw } from "./serviceWorkers/initDBAssets-sw";
import { useRecoilState } from "recoil";
// import "react-toastify/dist/ReactToastify.css";
import { current_project_id } from "./constants/shared";
import { getProjectData } from "./helpers/functions";
import { swAliveInterval } from "./helpers/keepSwAlive";
import { Editor } from "./views/Editor";
import { Motion } from "./components/Editor/Protos/Motion";
import { pageBuilderWorker } from "./helpers/defineWorkers";
import { Preview } from "./views/Preview";
import { useLiveQuery } from "dexie-react-hooks";
import { useOfflineHandler } from "./hooks/useOfflineHandler";
import { opfs } from "./helpers/initOpfs";
import { isDevMode } from "./helpers/bridge";
import { Opfs } from "./views/Opfs";
// import { esmToUmd } from "./helpers/initBabel";

const IsProject = ({ children }) => {
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  if (!projectId) {
    console.log("no project id found, navigating to workspace");
    navigate("workspace");
    return null;
  }
  return projectId ? children : <Navigate to="/workspace" replace />;
};

function App() {
  // const Editor = lazy(async () => ({
  //   default: (await import("./views/Editor")).Editor,
  // }));
  // const Editor = lazy( async() => await import("./views/Editor"));

  const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);
  const navigate = useNavigate();
  const location = useLocation();

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

  useLayoutEffect(() => {
    initDBAssetsSw(setDBAssetsSw);
  }, [location]);

  // useEffect(() => {
  //   if (!dbAssetsSw) return;
  //   sendVarsToSw();
  //   // dbAssetsSw.addEventListener('')
  // }, [dbAssetsSw]);

  const createProjectFolder = async () => {
    console.log("main rooooot : ", opfs.root);
    const projectFolder = await opfs.getFolder('projects');
    const isExisit = projectFolder.exists();
    if(!isExisit){
     await projectFolder.create()
      // await opfs.createFolder(await opfs.root, "projects");
    }
  };

  // const projectId = +localStorage.getItem(current_project_id);
  //   console.log("navo");
  //   if (!projectId) {
  //     console.log("no project id found, navigating to workspace");

  //     navigate("workspace");
  //   }

  const sendVarsToSw = async () => {
    dbAssetsSw.postMessage({
      command: "setVar",
      props: {
        obj: {
          projectId: +localStorage.getItem(current_project_id),
          projectData: await getProjectData(),
        },
        // value: +localStorage.getItem(current_project_id),
      },
    });
  };

  const isProject = Boolean(+localStorage.getItem(current_project_id));
  return (
    // <Suspense fallback={<Loader />}>
    <Routes >
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

      {isDevMode() && <Route path="opfs-dev" element={<Opfs/>} />}
    </Routes>
    // </Suspense>
  );
}

export default App;

// (async()=>{
//   const code  = await(await fetch(`https://cdn.jsdelivr.net/npm/opfs-tools@0.7.2/+esm`)).text()
//   console.log(`esm to module : `, esmToUmd(code , 'opfs-tools'));
// })()
