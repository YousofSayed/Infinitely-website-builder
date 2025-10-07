import React, { memo, useEffect } from "react";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { useEditorMaybe } from "@grapesjs/react";
import { toast } from "react-toastify";
import { SmallButton } from "./SmallButton";
import {
  close_current_modal,
  open_file_editor_modal,
} from "../../../constants/InfinitelyCommands";
import { useRecoilState } from "recoil";
import { fileInfoState } from "../../../helpers/atoms";
import { defineRoot, getFileSize } from "../../../helpers/bridge";
import { opfs } from "../../../helpers/initOpfs";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";
import { isPlainObject } from "lodash";

//million-ignore
/**
 *
 * @param {{library:import('../../../helpers/types').LibraryConfig , onDelete : (ev : MouseEvent)=>void , dbKey:string}} param0
 * @returns
 */
export const InstalledLibraryDetails = memo(
  ({ library, onDelete = (ev) => {}, dbKey = "" }) => {
    const editor = useEditorMaybe();
    const [fileInfo, setFileInfo] = useRecoilState(fileInfoState);

    const deleteLibrary = async () => {
      try {
        const projectId = +localStorage.getItem(current_project_id);
        const project = await await db.projects.get(projectId);
        const data = project;
        const newArr = data[dbKey].filter((lib) => lib.id != library.id);
        await opfs.removeFiles([
          defineRoot(library.path),
          ...(library.typesPath ? [defineRoot(library.typesPath)] : []),
        ]);
        await db.projects.update(projectId, {
          [dbKey]: newArr,
        });

        // editor.Pages.select(localStorage.getItem(current_page_id));
        console.log("scripts before : ", editor.config.canvas.scripts);
        const isJS = library.type.includes("js");
        const isCSS = library.type.includes("css");
        const key = (isJS && "scripts") || (isCSS && "styles");
        const index = editor.config.canvas[key].findIndex(
          (lib) => isPlainObject(lib) && lib.name.toLowerCase() == library.name.toLowerCase()
        );

        index != -1 && editor.config.canvas[key].splice(index, 1);
        console.log(
          "scripts after : ",
          editor.config.canvas[key],
          isCSS,
          isJS,
          index
        );
        // editor.load();
        
        toast.success(<ToastMsgInfo msg={"Library Removed Successfully"}/>);
        reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {state:true});
      } catch (error) {
        toast.error(<ToastMsgInfo msg={"Faild To Remove Library"}/>);
        throw new Error(`Error From Installed Library Details Cmp ${error}`);
      }
    };

    return (
      <article className="p-2 bg-slate-900 rounded-lg flex flex-col gap-2 mt-2">
        <section className="flex items-center justify-between">
          <h1 className="text-3xl p-2 bg-slate-950 rounded-lg w-fit text-blue-300 font-bold capitalize">
            {library.name}
          </h1>

          <section className="flex items-center gap-3">
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
            <figure className="handle w-fit cursor-move">
              {Icons.drag({})}
            </figure>
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
              :{library.size}MB
            </p>
          }
        </section>

        <section className="items-end justify-end flex bg-slate-950 p-2 rounded-lg w-fit self-end">
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
      </article>
    );
  }
);
