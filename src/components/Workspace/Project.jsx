import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { dbAssetsSwState, isProjectInitedState } from "../../helpers/atoms";
import { opfs } from "../../helpers/initOpfs";
import { toast } from "react-toastify";
import { getProjectRoot } from "../../helpers/bridge";
import { random } from "lodash";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { uniqueID } from "../../helpers/cocktail";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import { checkDropBoxSignInState } from "../../helpers/dropboxHandlers";

// million-ignore
/**
 *
 * @param {{project : import('../../helpers/types').Project}} param0
 * @returns
 */
export const Project = ({ project }) => {
  const navigate = useNavigate();
  const [swAssset, setSwAsset] = useRecoilState(dbAssetsSwState);
  const [img, setImg] = useState("");
  const [autoAminRef] = useAutoAnimate();
  const [isProjectInited, setIsProjectInited] =
    useRecoilState(isProjectInitedState);
  const urlsRef = useRef([]);
  // console.log(project.imgSrc);
  useEffect(() => {
    let canceled = false;
    (async () => {
      const root = `projects/project-${project.id}`;
      const file = await (
        await opfs.getFile(`${root}/screenshot.webp`)
      ).getOriginFile();

      if (canceled) return;

      if (!file || file.size === 0) {
        setImg("/images/blank.jpg");
        return;
      }

      const url = URL.createObjectURL(file);
      console.log('image url : ' , url , file);
      
      setImg(url);
      urlsRef.current.push(url);
    })();

    return () => {
      canceled = true;
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, [project]);

  return (
    <article
      ref={autoAminRef}
      className="relative px-2 py-1 bg-slate-900  rounded-lg flex flex-col h-[320px] justify-evenly  gap-2"
    >
      <figure className="flex flex-col gap-2 h-[70%]  items-center ">
        <img
          key={project.inited}
          src={img || "/images/blank.jpg"}
          className={`max-w-full max-h-full select-none ${
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
      {Boolean(project.apps) && (
        <div className="absolute right-[.5rem] top-[1rem] backdrop-blur-md p-2 rounded-lg bg-[rgb(0,0,0,0.255)]">
          {project.apps == "Dropbox" && Icons.dropbox({ fill: "white" })}
        </div>
      )}
      <ul className="flex gap-2 items-center justify-center p-1 bg-slate-950 rounded-lg">
        <Li
          onClick={async () => {
            if (!project.inited) return;
            if(project.apps == 'Dropbox' && !(await checkDropBoxSignInState())){
              toast.error(<ToastMsgInfo msg={"Please sign in to Dropbox to continue."} />);
              return;
            };
            opfs.id = project.id;
            localStorage.setItem(current_project_id, project.id);
            localStorage.setItem(current_page_id, "index");
            // swAssset.postMessage({
            //   command: "setVar",
            //   props: {
            //     obj: {
            //       projectId: project.id,
            //       projectData: project,
            //     },
            //   },
            // });
            navigate("/add-blocks");
          }}
        >
          {Icons.edite({ fill: "white", width: "20" })}
        </Li>

        <Li
          onClick={async () => {
            if (!project.inited) return;
            const cnfrm= confirm(`Are you sure to delete ${project.name} project ?`);
            if(!cnfrm)return;
            const tId = toast.loading(<ToastMsgInfo msg={"Deleting project"}/>);
            await opfs.remove({
              dirOrFile: await opfs.getFolder(`projects/project-${project.id}`),
            });

            await db.projects.delete(project.id);
            sessionStorage.removeItem(current_dynamic_template_id);
            localStorage.removeItem(current_page_id);
            localStorage.removeItem(current_project_id);
            toast.done(tId);
          }}
        >
          {Icons.trash("white", undefined, 20)}
        </Li>

        <Li
          onClick={() => {
            if (!project.inited) return;
            infinitelyWorker.postMessage({
              command: "exportProject",
              props: {
                projectSetting: getProjectSettings().projectSettings,
                projectId: +project.id,
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
