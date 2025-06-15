import React from "react";
import blankImg from "../../assets/images/blank.jpg";
import { Li } from "../Protos/Li";
import { Icons } from "../Icons/Icons";
import { db } from "../../helpers/db";
import { useNavigate } from "react-router-dom";
import {
  current_dynamic_template_id,
  current_page_id,
  current_project_id,
} from "../../constants/shared";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { getProjectSettings } from "../../helpers/functions";
import { useRecoilState } from "recoil";
import { dbAssetsSwState } from "../../helpers/atoms";

/**
 *
 * @param {{project : import('../../helpers/types').Project}} param0
 * @returns
 */
export const Project = ({ project }) => {
  const navigate = useNavigate();
  const [swAssset, setSwAsset] = useRecoilState(dbAssetsSwState);
  // console.log(project.imgSrc);

  return (
    <article className="p-2 bg-slate-900  rounded-lg flex flex-col h-[320px] justify-evenly  gap-2">
      <figure className="flex flex-col gap-2 h-[70%]  items-center ">
        <img
          src={project.imgSrc ? URL.createObjectURL(project.imgSrc) : '/images/blank.jpg'}
          className={`max-w-full max-h-full ${
            project.imgSrc ? "h-full " : "h-full  object-cover"
          }  w-full   max-h-[190px!important] rounded`}
          alt="project image"
          loading="lazy"
        />
        <figcaption
          className=" w-full rounded-lg p-1 text-center capitalize text-slate-200 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 "
          onBlur={(ev) => {
            ev.target.setAttribute("contenteditable", "false");
            db.projects.update(project.id, { name: ev.target.textContent });
          }}
          onDoubleClick={(ev) => {
            const contenteditable = ev.target.getAttribute("contenteditable");
            if (contenteditable == "true") {
              ev.target.setAttribute("contenteditable", "false");
              return;
            }
            ev.target.setAttribute("contenteditable", "true");
          }}
        >
          {project.name}
        </figcaption>
      </figure>
      <ul className="flex gap-2 items-center justify-center p-1 bg-slate-950 rounded-lg">
        <Li
          onClick={async() => {
            localStorage.setItem(current_project_id, project.id);
            localStorage.setItem(current_page_id, "index");
             swAssset.postMessage({
                  command: "setVar",
                  props: {
                    obj: {
                      projectId:project.id,
                      projectData: project,
                    },
                  },
                });
            navigate("/add-blocks");
          }}
        >
          {Icons.edite({ fill: "white", width: "20" })}
        </Li>

        <Li
          onClick={() => {
            db.projects.delete(project.id);
            sessionStorage.removeItem(current_dynamic_template_id);
            localStorage.removeItem(current_page_id);
            localStorage.removeItem(current_project_id);
          }}
        >
          {Icons.trash("white", undefined, 20)}
        </Li>

        <Li
          onClick={() => {
            infinitelyWorker.postMessage({
              command: "exportProject",
              props: {
                projectSetting: getProjectSettings().projectSettings,
                projectId:+project.id,
              },
            });
          }}
        >
          {Icons.export("white", undefined, 20)}
        </Li>
      </ul>
    </article>
  );
};
