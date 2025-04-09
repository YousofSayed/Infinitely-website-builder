import React from "react";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { useEditorMaybe } from "@grapesjs/react";
import { toast } from "react-toastify";
import { SmallButton } from "./SmallButton";
import { close_current_modal, open_file_editor_modal } from "../../../constants/InfinitelyCommands";
import { useRecoilState } from "recoil";
import { fileInfoState } from "../../../helpers/atoms";

/**
 *
 * @param {{library:import('../../../helpers/types').LibraryConfig , onDelete : (ev : MouseEvent)=>void , dbKey:string}} param0
 * @returns
 */
export const InstalledLibraryDetails = ({
  library,
  onDelete = (ev) => {},
  dbKey = "",
}) => {
  const editor = useEditorMaybe();
  const [ fileInfo,setFileInfo] = useRecoilState(fileInfoState);

  const deleteLibrary = async () => {
    try {
      const projectId = +localStorage.getItem(current_project_id);
      const project = await await db.projects.get(projectId);
      const data = project;
      const newArr = data[dbKey].filter((lib) => lib.id != library.id);
      await db.projects.update(projectId, {
        [dbKey]: newArr,
      });

      // editor.Pages.select(localStorage.getItem(current_page_id));
      editor.load();
      toast.success("Library Removed Successfully");
    } catch (error) {
      toast.success("Faild To Remove Library");
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
                fileName: library.file.name,
                fileType: library.file.type,
                fileContent:await library.file.text(),
                
                isHeader:library.header,
                isFooter:library.footer,
                id:library.id,
                file:library.file,
              });
              // console.log(await library.file.text());
              
              // editor.runCommand(close_current_modal)
              editor.runCommand(open_file_editor_modal);
            }}
            className=" w-fit cursor-pointer p-1 [&_svg]:hover:fill-white"
          >
            {Icons.edite({ width: 23, height: 23 })}
          </SmallButton>
          <figure className="handle w-fit cursor-move">{Icons.drag({})}</figure>
        </section>
      </section>

      <section className="flex flex-col gap-1">
        <p>
          <span className="text-blue-300 font-semibold text-lg">Version</span> :{" "}
          {library?.version || "Unknown"}
        </p>
        <p>
          <span className="text-blue-300 font-semibold text-lg">
            Description
          </span>{" "}
          : {library?.description || "Unknown"}
        </p>

        <p>
          <span className="text-blue-300 font-semibold text-lg">Location</span>{" "}
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
            <span className="text-blue-300 font-semibold text-lg">Url</span> :{" "}
            <a
              href={library?.fileUrl}
              target="_blank"
              className="transition-all hover:underline "
            >
              {library?.fileUrl || "Unknown"}
            </a>
          </p>

          <p className="max-w-[90%] overflow-hidden text-ellipsis text-nowrap">
            <span className="text-blue-300 font-semibold text-lg">Is CDN</span> :{new String(library.isCDN)}
          </p>
          </>
        )}
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
};
