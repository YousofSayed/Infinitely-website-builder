import noDataImg from "@/assets/images/no-data.svg";
import { version } from "@/constants/Version.js";
import { projectState, showCrtModalState } from "@/helpers/atoms.jsx";
import { uniqueID } from "@/helpers/cocktail.js";
import { db } from "@/helpers/db.ts";
import { projectsType } from "@/helpers/jsDocs.js";
import {
  destroyProjectsImagesObserver,
  reInitProjectsImagesObserver,
} from "@/observers/projectsImagesObserver.js";
import { Icons } from "@/components/Icons/Icons.jsx";
import { Loader } from "@/components/Loader.jsx";
import { Button } from "@/components/Protos/Button.jsx";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent.jsx";
import { Project } from "@/components/Workspace/Project";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep, random } from "lodash";
import { For } from "million/react";
import React, { memo, useEffect, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { useRecoilState, useSetRecoilState } from "recoil";

//million-ignore
export const Projects = () => {
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [showLoader, setShowLoader] = useState(true);
  const [dbProjects, setDbProjects] = useRecoilState(projectState);
  const [animtedRef] = useAutoAnimate();
  useLiveQuery(async () => {
    const res = await db.projects.toArray();
    console.log("res : ", res);

    setShowLoader(false);
    setDbProjects(res);
    // return res;
  });

  useEffect(() => {
    reInitProjectsImagesObserver();

    return () => {
      destroyProjectsImagesObserver();
    };
  }, []);

  return (
    // <section className="relative w-full h-full flex flex-col">
    <section
      ref={animtedRef}
      className={`${dbProjects?.length ? "" : "p-2"
        } container m-auto gap-3 overflow-hidden h-full bg-surface-main w-full rounded-lg ${!dbProjects?.length && "flex items-center justify-center"
        }`}
    >
      {dbProjects?.length && (
        // <VirtuosoGrid
        //   components={GridComponents}
        //   totalCount={Number(dbProjects.length)}
        //   itemClassName="p-2"
        //   itemContent={(i) => {
        //     return <Project key={i} project={dbProjects[i]} />;
        //   }}
        // />

        <section className="h-full grid gap-2 p-1 overflow-auto grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          <For each={dbProjects} memo={false}>
            {(project, i) => {
              return <Project key={project.id} project={project} />;
            }}
          </For>

          {/* {dbProjects.map((project, i) => (
            <Project key={project.id} project={project}  />
          ))} */}
        </section>
      )}
      {/* {dbProjects?.map((project) => (
          <Project key={project.id} project={project} />
        ))} */}

      {!dbProjects?.length && !showLoader && !dbProjects?.length && (
        <figure className="flex flex-col items-center justify-center gap-2">
          <img
            src={noDataImg}
            className="max-w-[300px] opacity-[.9] ml-[-36px]"
            alt="no data is here"
          // loading="lazy"
          />
          <figcaption className="text-text-primary font-semibold text-2xl ">
            No Projects Yet
          </figcaption>
          <Button
            onClick={(ev) => {
              setShowCrtModal(true);
            }}
          >
            {Icons.plus("white")}
            Add New
          </Button>
        </figure>
      )}

      {showLoader && <Loader />}

      <div className="absolute right-[2%] bottom-[2%] text-slate-600 opacity-[.9] z-40 text-2xl pointer-events-none">
        {version}
      </div>
    </section>
    // {/* </section> */}
  );
};
