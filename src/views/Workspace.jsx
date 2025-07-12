import React, { memo, useEffect } from "react";
import { Header } from "../components/Workspace/Header";
import { Projects } from "../components/Workspace/Projects";
import { CreateProjectModal } from "../components/Workspace/CreateProjectModal";
import { toast, ToastContainer } from "react-toastify";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { parse } from "../helpers/cocktail";
import { useWorkerToast } from "../hooks/useWorkerToast";

export const Workspace = memo(() => {
  useWorkerToast()
  return (
    <main className=" h-full bg-slate-900 flex flex-col gap-2 pb-2 overflow-hidden">
      <ToastContainer
        toastStyle={{ background: " #111827 " }}
        autoClose={3000}
        draggable={true}
        theme="dark"
        // limit={5}
        pauseOnHover={true}
        position="bottom-right"
        // progressClassName={`bg-blue-600`}
        // stacked={true}
      />
      <Header />
      <Projects />
      <CreateProjectModal />
    </main>
  );
});
