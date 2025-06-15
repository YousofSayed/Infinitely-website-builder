import React, { memo, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../helpers/db.ts";
import noDataImg from "../../assets/images/no-data.svg";
import { Button } from "../Protos/Button.jsx";
import { Icons } from "../Icons/Icons.jsx";
import { useRecoilState, useSetRecoilState } from "recoil";
import { projectState, showCrtModalState } from "../../helpers/atoms.jsx";
import { Project } from "./Project.jsx";
import { Loader } from "../Loader.jsx";
import { projectsType } from "../../helpers/jsDocs.js";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "../Protos/VirtusoGridComponent.jsx";

export const Projects = memo(() => {
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [showLoader, setShowLoader] = useState(true);
  const [dbProjects, setDbProjects] = useRecoilState(projectState);
  const liveQueryProjects = useLiveQuery(async () => {
    const res = await db.projects.toArray();
    console.log("res : ", res);

    setShowLoader(false);
    setDbProjects(res);
    return res;
  });

  return (
    <section className="w-full h-full">
      <section
        className={`${dbProjects?.length ? '' : 'p-2'} container m-auto gap-3 h-full bg-slate-950 w-full rounded-lg ${
          !dbProjects?.length &&
            "flex items-center justify-center"
        }`}
      >
        {dbProjects?.length && <VirtuosoGrid components={GridComponents} totalCount={Number(dbProjects.length)}  itemClassName="p-2" itemContent={(i)=>{
          return <Project key={i} project={dbProjects[i]} />
        }}/>}
        {/* {dbProjects?.map((project) => (
          <Project key={project.id} project={project} />
        ))} */}

        {!dbProjects?.length && !showLoader && !liveQueryProjects?.length && (
          <figure className="flex flex-col items-center justify-center gap-2">
            <img
              src={noDataImg}
              className="max-w-[300px] opacity-[.9] ml-[-36px]"
              alt="no data is here"
              // loading="lazy"
            />
            <figcaption className="text-slate-200 font-semibold text-2xl ">
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
      </section>
    </section>
  );
});
