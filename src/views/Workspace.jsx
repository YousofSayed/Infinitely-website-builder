import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { CreateProjectModal } from "@/components/Workspace/CreateProjectModal";
import { Header } from "@/components/Workspace/Header";
import { Projects } from "@/components/Workspace/Projects";
import { parse } from "@/helpers/cocktail";
import {
  downloadFile,
  downloadFileByLink,
  loadProject,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { useWorkerToast } from "@/hooks/useWorkerToast";
import React, { memo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export const Workspace = memo(() => {
  const [searchParams] = useSearchParams();
  const fileParam = searchParams.get("file");
  const fileUrl = fileParam ? atob(searchParams.get("file")) : null;
  useEffect(() => {
    (async () => {
      if (!fileUrl) return;
      console.log("url : ", fileUrl);

      try {
        // const file = await (await fetch(fileUrl));
        // loadProject(file);

        downloadFileByLink(fileUrl);
        toast.success(
          <ToastMsgInfo msg={`Project downloaded successfully 💙`} />
        );
      } catch (error) {
        toast.error("Faild to load project");
        console.error(error);
      }
    })();
  });
  useWorkerToast();
  return (
    <main className=" h-full bg-surface-secondary flex flex-col gap-2 pb-2 overflow-hidden">
      <ToastContainer
        toastClassName={`bg-surface-secondary`}
        className={`z-[1000000000000]    `}
        autoClose={3000}
        draggable={true}
        theme="dark"
        // limit={5}
        pauseOnHover={true}
        position="bottom-right"
        // progressClassName={`bg-brand-primary`}
        // stacked={true}
      />
      <Header />
      <Projects />
      <CreateProjectModal />
    </main>
  );
});
