import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

import { StyleAside } from "./components/Editor/StyleAside";
import { Blocks } from "./components/Editor/Blocks";
import { TraitsAside } from "./components/Editor/TraitsAside";
import { lazy, Suspense, useEffect, useState } from "react";
import { Loader } from "./components/Loader";
import { Workspace } from "./views/Workspace";
import { Commands } from "./components/Editor/Commands";
import { ChooseModel } from "./components/Editor/Protos/ChooseModel";
import { DynamicContent } from "./components/Editor/Protos/DynamicContent";
import { DynamicAttributes } from "./components/Editor/Protos/DynamicAttributes";
import { infinitelyWorker } from "./helpers/infinitelyWorker";
import { dbAssetsSwState } from "./helpers/atoms";
import { initDBAssetsSw } from "./serviceWorkers/initDBAssets-sw";
import { useRecoilState } from "recoil";
import "react-toastify/dist/ReactToastify.css";
import { current_project_id } from "./constants/shared";

function App() {
  const Editor = lazy(async () => ({
    default: (await import("./views/Editor")).Editor,
  }));


  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const callback = (ev) => {
      const { command, props } = ev.data;
      if (command != "exportProject") return;
      const a = document.createElement("a");
      a.classList.add("hidden");
      a.download = props.name;
      const url = URL.createObjectURL(props.file);
      a.href = url;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    infinitelyWorker.addEventListener("message", callback);
    // test();
    return () => {
      infinitelyWorker.removeEventListener("message", callback);
    };
  }, []);

 

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Editor />}>
            <Route path="/add-blocks" element={<Blocks />} />
            <Route path="/edite">
              <Route path="styling" element={<StyleAside />} />
              <Route path="traits" element={<TraitsAside />} />
              <Route path="commands" element={<Commands />} />
              <Route path="choose-and-write-model" element={<ChooseModel />}>
                <Route path="dynamic-content" element={<DynamicContent />} />
                <Route
                  path="dynamic-attributes"
                  element={<DynamicAttributes />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="/workspace" element={<Workspace />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
