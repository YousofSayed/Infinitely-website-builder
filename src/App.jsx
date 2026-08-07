import { Blocks } from "@/components/Editor/Blocks";
import { Commands } from "@/components/Editor/Commands";
import { Interactions } from "@/components/Editor/Interactions";
import { Motion } from "@/components/Editor/Protos/Motion";
import { StyleAside } from "@/components/Editor/StyleAside";
import { TraitsAside } from "@/components/Editor/TraitsAside";
import { current_project_id } from "@/constants/shared";
import {
  appInstallingState,
  appTypeStt,
  dbAssetsSwState,
} from "@/helpers/atoms";
import { isDevMode } from "@/helpers/bridge";
import { refresherWorker } from "@/helpers/defineWorkers";
import { getAppType } from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { initDBAssetsSw } from "@/serviceWorkers/initDBAssets-sw";
import { AppInstalling } from "@/views/AppInstalling";
import { Editor } from "@/views/Editor";
import { Opfs } from "@/views/Opfs";
import { Workspace } from "@/views/Workspace";
import { Preview } from "@/wordpress/Preview";
import { WpCreate } from "@/wordpress/WpCreate";
import { WpSelect } from "@/wordpress/WpSelect";
import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";

//

function App() {
  // const Editor = lazy(async () => ({
  //   default: (await import("@/views/Editor")).Editor,
  // }));
  // const Editor = lazy( async() => await import("@/views/Editor"));

  const [dbAssetsSw, setDBAssetsSw] = useRecoilState(dbAssetsSwState);
  const [appInstalling, setAppInstalling] = useRecoilState(appInstallingState);
  const [appSate, setAppState] = useRecoilState(appTypeStt);
  const navigate = useNavigate();
  // const location = useLocation();

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
        console.log("export project from main: ");
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
          props,
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
      }
      console.log(
        "Previous registrations:",
        prevRegs,
        navigator.serviceWorker.controller,
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

  useEffect(() => {
    setAppState(getAppType());
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
        <Route path="wordpress/create" element={<WpCreate />}></Route>
        <Route path="wordpress/select" element={<WpSelect />}></Route>
        <Route path="wordpress/preview" element={<Preview />}></Route>

        {/* <Route path="/share" element={<Share />}></Route> */}

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
