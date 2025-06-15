import React, { memo, useEffect } from "react";
import { Header } from "../components/Workspace/Header";
import { Projects } from "../components/Workspace/Projects";
import { CreateProjectModal } from "../components/Workspace/CreateProjectModal";
import { toast, ToastContainer } from "react-toastify";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { parse } from "../helpers/cocktail";

export const Workspace = memo(() => {
  useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command != "toast") return;
      const { msg, type , isNotMessage , dataProps } = props;
      console.log('from toast : ', msg, type , isNotMessage , dataProps);
      toast[type](isNotMessage ? parse(msg) || msg : <ToastMsgInfo msg={msg}  />, dataProps || {});
    };
    infinitelyWorker.addEventListener("message", cb);

    return () => {
      infinitelyWorker.removeEventListener("message", cb);
    };
  }, []);
  return (
    <main className=" h-full bg-slate-900 flex flex-col gap-2 py-2 ">
      <ToastContainer
        toastStyle={{ background: " #111827 " }}
        autoClose={3000}
        draggable={true}
        theme="dark"
        // limit={5}
        pauseOnHover={true}
        position="bottom-right"
        progressClassName={`bg-blue-600`}
        // stacked={true}
      />
      <Header />
      <Projects />
      <CreateProjectModal />
    </main>
  );
});
