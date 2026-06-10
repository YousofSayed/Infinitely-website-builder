import React, { useEffect, useState } from "react";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import {  current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { useEditorMaybe } from "@grapesjs/react";
import { toast } from "react-toastify";
import { SmallButton } from "./SmallButton";
import {
  open_file_editor_modal,
} from "../../../constants/InfinitelyCommands";
import { useRecoilState } from "recoil";
import { fileInfoState } from "../../../helpers/atoms";
import { defineRoot } from "../../../helpers/bridge";
import { opfs } from "../../../helpers/initOpfs";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { doInNormalAsync, doInWordpressAsync, getProjectData } from "../../../helpers/functions";
import { wp_delete_media_files_by_slugs, wp_update_option } from "../../../Apps/wordpress/functions";

import { Checkbox } from "../../Protos/Checkbox";

//million-ignore
/**
 *
 * @param {{library:import('../../../helpers/types').LibraryConfig , onDelete : (ev : MouseEvent)=>void , dbKey:string}} param0
 * @returns
 */
export const InstalledLibraryDetails = (
  ({ library, onDelete = (ev) => { }, dbKey = "", selected = [], setSelected }) => {
    const editor = useEditorMaybe();
    const [fileInfo, setFileInfo] = useRecoilState(fileInfoState);
    const [checked, setChecked] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteLibrary = async () => {
      const cnfrm = confirm(`Are you sure to delete ${library.name} library ? 🤔`);
      if (!cnfrm) return;
      setIsDeleting(true);
      const tid = toast.loading(<ToastMsgInfo msg={`Deleting ${library.name} library...`} />);
      try {
        const projectId = +localStorage.getItem(current_project_id);
        const project = await await db.projects.get(projectId);
        const data = project;
        const newArr = data[dbKey].filter((lib) => lib.id != library.id);
        const deleteLibFromDB = async () => {
          await opfs.removeFiles([
            defineRoot(library.path),
            ...(library.typesPath ? [defineRoot(library.typesPath)] : []),
          ]);
          await db.projects.update(projectId, {
            [dbKey]: newArr,
          });
        };

        await doInNormalAsync(async () => {
          await deleteLibFromDB();
        })

        await doInWordpressAsync(async () => {
          const projecdData = await getProjectData();
          const cnfrm = confirm(`Do you want to delete this library from media library too ? 🤔`);
          if (cnfrm) {
            const wp_delete_file_res = await wp_delete_media_files_by_slugs({
              projectId,
              slugs: [library.slug],
            });

            if (!wp_delete_file_res.success) {
              console.error(wp_delete_file_res);
              throw new Error(`Faild to delete library 😥`);
            }
          }

          projecdData[dbKey] = newArr;
          const wp_update_option_res = await wp_update_option({
            projectId,
            optionName: 'inf_config',
            value: projecdData,
          });

          if (!wp_update_option_res?.success) {
            console.error(wp_update_option_res);
            throw new Error(`Faild to delete library 😥`);
          }

          await deleteLibFromDB();
        })

        // editor.Pages.select(localStorage.getItem(current_page_id));
        console.log("scripts before : ", editor.config.canvas.scripts);


        toast.done(tid);
        toast.success(<ToastMsgInfo msg={"Library Removed Successfully"} />);
        reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });
      } catch (error) {
        toast.dismiss(tid);
        toast.error(<ToastMsgInfo msg={"Faild To Remove Library"} />);
        setIsDeleting(false);
        throw new Error(`Error From Installed Library Details Cmp ${error}`);
      }
    };

    useEffect(() => {
      const index = selected.findIndex(lib => lib.name === library.name);
      const isChecked = index === -1 ? false : true;
      // console.log('isChecked', isChecked , index === -1 , index);

      setChecked(isChecked);
    }, [selected])

    return (
      <section className={`p-2 bg-surface-secondary rounded-lg flex flex-col gap-2 mt-2 ${isDeleting && 'pointer-events-none'}`} >
        <section className="flex items-center justify-between">
          <h1 className="text-3xl p-2 bg-surface-main rounded-lg w-fit text-blue-300 font-bold capitalize">
            {library.name}
          </h1>

          <section className="flex items-center gap-3 p-2 rounded-lg bg-surface-main">
            <Checkbox title="select to delete" checked={checked} onChange={() => {
              if (!checked) {
                setSelected([...selected, library])

              } else {
                const filterd = selected.filter(lib => lib.name !== library.name);
                setSelected(filterd);
              }
            }} />
            {/* <FitTitle className="flex items-center gap-2">select to delete<Input type="checkbox" /></FitTitle> */}
            <SmallButton
              onClick={async (ev) => {
                setFileInfo({
                  path: library.path,
                });
                // console.log(await library.file.text());

                // editor.runCommand(close_current_modal)
                editor.runCommand(open_file_editor_modal);
              }}
              className=" w-fit cursor-pointer p-1 [&_svg]:hover:fill-white"
            >
              {Icons.edite({ width: 23, height: 23 })}
            </SmallButton>
            <SmallButton className="handle w-fit cursor-[move!important] [&_svg]:hover:fill-white [&_path]:hover:fill-white">
              {Icons.drag({})}
            </SmallButton>
          </section>
        </section>

        <section className="flex flex-col gap-1">
          <p>
            <span className="text-blue-300 font-semibold text-lg">Version</span>{" "}
            : {library?.version || "Unknown"}
          </p>
          <p>
            <span className="text-blue-300 font-semibold text-lg">
              Description
            </span>{" "}
            : {library?.description || "Unknown"}
          </p>

          <p>
            <span className="text-blue-300 font-semibold text-lg">
              Location
            </span>{" "}
            : {library?.header || library?.footer || "Unknown"}
          </p>

          {library.type == "js" && (
            <>
              <p>
                <span className="text-blue-300 font-semibold text-lg">
                  Is Defer
                </span>{" "}
                : {new String(library?.defer)}
              </p>

              <p>
                <span className="text-blue-300 font-semibold text-lg">
                  Is Async
                </span>{" "}
                : {new String(library?.async)}
              </p>
            </>
          )}

          {library?.isCDN && (
            <>
              <p className="max-w-[90%] overflow-hidden text-ellipsis text-nowrap">
                <span className="text-blue-300 font-semibold text-lg">Url</span>{" "}
                :{" "}
                <a
                  href={library?.fileUrl}
                  target="_blank"
                  className="transition-all hover:underline "
                >
                  {library?.fileUrl || "Unknown"}
                </a>
              </p>

              <p className="max-w-[90%] overflow-hidden text-ellipsis text-nowrap">
                <span className="text-blue-300 font-semibold text-lg">
                  Is CDN
                </span>{" "}
                :{new String(library.isCDN)}
              </p>
            </>
          )}

          {
            <p className="max-w-[90%] overflow-hidden text-ellipsis text-nowrap">
              <span className="text-blue-300 font-semibold text-lg">Size</span>{" "}
              : {library.size}MB
            </p>
          }
        </section>

        <section className="items-end justify-end flex bg-surface-main p-2 rounded-lg w-fit self-end">
          <Button
            onClick={(ev) => {
              onDelete(ev);
              deleteLibrary();
            }}
          >
            {Icons.trash("white")}
            Delete
          </Button>
        </section>
      </section>
    );
  }
);
