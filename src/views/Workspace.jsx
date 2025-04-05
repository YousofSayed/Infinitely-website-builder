import React, { memo, useEffect } from "react";
import { Header } from "../components/Workspace/Header";
import { Projects } from "../components/Workspace/Projects";
import { CreateProjectModal } from "../components/Workspace/CreateProjectModal";
import { toast, ToastContainer } from "react-toastify";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";

export const Workspace = memo(() => {
  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command != "toast") return;
      const { msg, type } = props;
      toast[type]?.(<ToastMsgInfo msg={msg} />);
    };
    infinitelyWorker.addEventListener("message", cb);

    return () => {
      infinitelyWorker.removeEventListener("message", cb);
    };
  }, []);
  return (
    <main className=" h-full flex flex-col gap-2 py-2 ">
      <ToastContainer
        toastStyle={{ background: " #111827 " }}
        autoClose={3000}
        draggable={true}
        theme="dark"
        limit={5}
        pauseOnHover={true}
        position="bottom-right"
        // stacked={true}
      />
      <Header />
      <Projects />
      <CreateProjectModal />
    </main>
  );
});
