import {
  wp_delete_option,
  wp_get_option,
  wp_update_option,
} from "@/Apps/wordpress/functions";
import { wp_toast_handler } from "@/Apps/wordpress/functions_ui";
import blankImg from "@/assets/images/blank.jpg";
import {
  app_type,
  current_dynamic_template_id,
  current_page_id,
  current_project_id,
  wp_meta,
} from "@/constants/shared";
import {
  currentWpPageNameState,
  dbAssetsSwState,
  isProjectInitedState,
} from "@/helpers/atoms";
import { getProjectRoot } from "@/helpers/bridge";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { checkDropBoxSignInState } from "@/helpers/dropboxHandlers";
import { getProjectSettings } from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { refType } from "@/helpers/jsDocs";
import { projectsImagesObserver } from "@/observers/projectsImagesObserver";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Li } from "@/components/Protos/Li";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { random, uniqueId } from "lodash";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";

// million-ignore
/**
 *
 * @param {{project : import('@/helpers/types').Project}} param0
 * @returns
 */
export const Project = ({ project }) => {
  const navigate = useNavigate();
  const [swAssset, setSwAsset] = useRecoilState(dbAssetsSwState);
  const thumbnailRef = useRef(refType);
  const [img, setImg] = useState("");
  const [autoAminRef] = useAutoAnimate();
  const [isProjectInited, setIsProjectInited] =
    useRecoilState(isProjectInitedState);
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState
  );
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
      console.log("image url : ", url, file);

      setImg(url);
      if (thumbnailRef.current) {
        projectsImagesObserver.observe(thumbnailRef.current);
      }
      urlsRef.current.push(url);
    })();

    return () => {
      canceled = true;
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (thumbnailRef.current) {
        projectsImagesObserver.unobserve(thumbnailRef.current);
      }
      urlsRef.current = [];
    };
  }, [project, project.id]);

  return (
    <article
      // ref={autoAminRef}
      className="relative px-2 py-1 bg-surface-secondary  rounded-lg flex flex-col h-[320px] justify-evenly  gap-2 animate-go-to"
    >
      <figure className="flex flex-col gap-2 h-[70%]  items-center ">
        <img
          key={project.id}
          ref={thumbnailRef}
          src={"/images/blank.jpg"}
          project-image-src={img || "/images/blank.jpg"}
          className={`max-w-full max-h-full select-none ${project.imgSrc ? "h-full " : "h-full  object-cover"
            }  w-full   max-h-[190px!important] rounded`}
          alt="project image"
        // loading="lazy"
        />
        <figcaption
          className=" w-full rounded-lg p-1 text-center capitalize text-text-primary text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 "
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
      <ul className="flex gap-2 items-center justify-center p-1 bg-surface-main rounded-lg">
        <Li
          onClick={async () => {
            if (!project.inited) return;
            if (
              project.apps == "Dropbox" &&
              !(await checkDropBoxSignInState())
            ) {
              toast.error(
                <ToastMsgInfo msg={"Please sign in to Dropbox to continue."} />
              );
              return;
            }

            opfs.id = project.id;
            localStorage.setItem(current_project_id, project.id);
            if (project.app_type == "wordpress") {
              localStorage.setItem(wp_meta, JSON.stringify(project.wp_meta));
              localStorage.setItem(app_type, project.app_type);
              wp_toast_handler({
                returnCallback: async () =>
                  await wp_get_option({
                    optionName: "inf_config",
                    wp_meta_data: project.wp_meta,
                  }),
                async onSuccess(res) {
                  res?.value?.id && delete res.value.id;
                  await db.projects.update(project.id, {
                    ...(res.value || {}),
                  });
                  setCurrentWpPageName("");
                  navigate("/wordpress/select");
                },
                toast_loading_msg: "Checking config...",
                toast_success_msg: "Config checked successfully 💙",
                toast_error_msg: "Config file not founded 😩",
              });
            } else {
              localStorage.removeItem(wp_meta);
              localStorage.setItem(app_type, project.app_type);
              localStorage.setItem(current_page_id, "index");
              setCurrentWpPageName("index");
              navigate("/add-blocks");
            }
          }}
        >
          {Icons.edite({ fill: "white", width: "20" })}
        </Li>

        <Li
          onClick={async () => {
            //  await wp_update_option({
            //     optionName:'inf_config',
            //     projectId:project.id,
            //     value:{
            //       ...project
            //     }

            //   })
            // await  wp_get_option({
            //     wp_meta_data:project.wp_meta,
            //     optionName:'inf_config'
            //   })
            //   return;
            // if (!project.inited) return;
            const cnfrm = confirm(
              `Are you sure to delete ${project.name} project ?`
            );

            let wpCnfrm;
            if (project.app_type === "wordpress") {
              wpCnfrm = confirm(
                `Are you sure to delete ${project.name} wordpress config ?`
              );
            }

            if (!cnfrm) return;
            const tId = toast.loading(
              <ToastMsgInfo msg={"Deleting project"} />
            );

            wpCnfrm &&
              (await wp_delete_option({
                optionName: "inf_config",
                projectId: project.id,
              }));

            await opfs.remove({
              dirOrFile: await opfs.getFolder(`projects/project-${project.id}`),
            });

            await db.projects.delete(project.id);
            sessionStorage.removeItem(current_dynamic_template_id);
            localStorage.removeItem(current_page_id);
            localStorage.removeItem(current_project_id);
            localStorage.removeItem(app_type);
            setCurrentWpPageName("");
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
