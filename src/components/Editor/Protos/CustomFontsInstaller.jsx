import React, { useRef, useState } from "react";
import { Icons } from "../../Icons/Icons";
import { Button } from "../../Protos/Button";
import { uploadFontsType } from "../../../helpers/jsDocs";
import { uniqueID } from "../../../helpers/cocktail";
import { ViewportList } from "react-viewport-list";
import { Input } from "./Input";
import { getProjectData } from "../../../helpers/functions";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { Virtuoso } from "react-virtuoso";

export const CustomFontsInstaller = () => {
  const [fontFiles, setFontFiles] = useState(uploadFontsType);
  const inputRef = useRef();

  const openInputFile = () => {
    inputRef.current.click();
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const handleUploadFiles = async (ev) => {
    /**
     * @type {File[]}
     */
    const files = Array.from(ev.target.files);
    // const filesWillSet = await Promise.all(
    //   files.map((file) => {
    //     return new Promise((res, rej) => {
    //       const reader = new FileReader();
    //       reader.readAsDataURL(file);
    //       reader.addEventListener("loadend", () => {
    //         res({
    //           dataUrl: reader.result,
    //           url: reader.result,
    //           name: file.name,
    //           id: uniqueID(),
    //         });
    //       });

    //       reader.addEventListener("error", (ev) => {
    //         rej(`Error In FileReader : ${reader.result}`);
    //       });
    //     });
    //   })
    // );

    setFontFiles(
      files.map((file) => ({ file, name: file.name, id: uniqueID() }))
    );
  };

  const changeFileName = (value, index) => {
    const clone = structuredClone(fontFiles);
    clone[index].name = value;
    setFontFiles(clone);
  };

  const saveFontFilesInDB = async () => {
    const projectData = await getProjectData();
    const projectId = +localStorage.getItem(current_project_id);
    const newFontsUploaded = {};
    fontFiles.forEach((file) => {
      newFontsUploaded[file.name] = file;
    });

    await db.projects.update(projectId, {
      fonts: {
        ...projectData.fonts,
        ...newFontsUploaded,
      },
    });

    toast.success(
      <ToastMsgInfo
        msg={`${fontFiles.length} Font File Installed Successfully`}
      />
    );
    setFontFiles([]);
  };

  const removeFile = (id = "") => {
    const newArr = fontFiles.filter((file) => file.id != id);
    setFontFiles(newArr);
  };

  return (
    <section className="h-full">
      {!fontFiles.length && (
        <section className="h-full w-full flex flex-col gap-2 justify-center items-center">
          <figure
            className="cursor-pointer"
            onClick={(ev) => {
              openInputFile();
            }}
          >
            {Icons.upload({ width: 150, height: 120 })}
          </figure>
          <Button
            className="px-[60px] py-[12px] text-xl font-bold"
            onClick={() => {
              openInputFile();
            }}
          >
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2,.eot,.svg"
            multiple
            className="hidden"
            onChange={handleUploadFiles}
          />
        </section>
      )}

      {!!fontFiles.length && (
        <>
          <section className="h-[90%] overflow-auto flex flex-col gap-2">
            <Virtuoso
              className="h-[100%!important] flex flex-col "
              totalCount={fontFiles.length}
              itemContent={(i) => {
                const file = fontFiles[i];
                return (
                  <section
                    key={i}
                    className="flex items-center justify-between mt-2 gap-2 p-2 bg-slate-800 rounded-lg"
                  >
                    <Input
                      placeholder="Font File Name"
                      className="w-full bg-slate-900"
                      value={file.name}
                      onInput={(ev) => {
                        changeFileName(ev.target.value, i);
                      }}
                    />
                    <Button
                      onClick={(ev) => {
                        removeFile(file.id);
                      }}
                    >
                      {Icons.trash("white")}
                      Delete
                    </Button>
                  </section>
                );
              }}
            />
          </section>

          <footer className="h-[10%] p-2 border-t-2 border-t-slate-600">
            <Button
              onClick={(ev) => {
                saveFontFilesInDB();
              }}
            >
              {Icons.export("white")}
              Save
            </Button>
          </footer>
        </>
      )}
    </section>
  );
};
