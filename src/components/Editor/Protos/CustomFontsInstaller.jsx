import React, { useLayoutEffect, useRef, useState } from "react";
import { Icons } from "../../Icons/Icons";
import { Button } from "../../Protos/Button";
import { refType, uploadFontsType } from "../../../helpers/jsDocs";
import { uniqueID } from "../../../helpers/cocktail";
import { ViewportList } from "react-viewport-list";
import { Input } from "./Input";
import {
  getProjectData,
  isElementScrollable,
} from "../../../helpers/functions";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { Virtuoso } from "react-virtuoso";
import { useRecoilState } from "recoil";
import { dbAssetsSwState } from "../../../helpers/atoms";
import { VirtosuoVerticelWrapper } from "../../Protos/VirtosuoVerticelWrapper";

const CustomScroller = React.forwardRef(({ style, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    style={{
      ...style,
      padding: "10px", // Space between content and scrollbar
      boxSizing: "border-box",
      // paddingLeft: '10px', // Optional: space on the left
    }}
  />
));



export const CustomFontsInstaller = () => {
  const [fontFiles, setFontFiles] = useState(uploadFontsType);
  const [swDBAssets, setSwDBAssets] = useRecoilState(dbAssetsSwState);
  const inputRef = useRef();

  const openInputFile = () => {
    inputRef.current.click();
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const handleUploadFiles = async (ev) => {
    const mime = (await import("mime")).default;
    /**
     * @type {File[]}
     */
    const files = Array.from(ev.target.files);

    setFontFiles(
      files.map((file) => {
        const fileWithType = new File([file], file.name, {
          type: mime.getType(file.name) || mime.getType(".ttf"),
        });
        console.log("file type : ", fileWithType, fileWithType.type);
        return { file: fileWithType, name: file.name, id: uniqueID() };
      })
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

    swDBAssets.postMessage({
      command: "setVar",
      props: {
        obj: {
          projectId: +localStorage.getItem(current_project_id),
          projectData: {
            ...projectData,
            fonts: {
              ...projectData.fonts,
              ...newFontsUploaded,
            },
          },
        },
        // value: +localStorage.getItem(current_project_id),
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
        <section className="h-full w-full flex  flex-col gap-2 justify-center items-center">
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
          <section className="h-[87.5%]   flex flex-col gap-2">
            <Virtuoso
              // className="h-[100%!important] flex flex-col "
              // style={{
              //   padding: "10px 0",
              // }}
              totalCount={fontFiles.length}
              // useWindowScroll
              style={
                {
                  // paddingRight:'10px'
                }
              }
              components={{ Item: VirtosuoVerticelWrapper }}
              itemContent={(i) => {
                const file = fontFiles[i];
                return (
                  <section
                    key={i}
                    className="flex items-center justify-between  gap-2 p-2 bg-slate-800 rounded-lg"
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
                      keepPadding
                      className="hover:bg-[crimson] transition-all"
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

          <footer className="h-[12.5%] flex items-center p-2 border-t-2 border-t-slate-600">
            <Button
              className="flex-shrink-0 px-10 py-2"
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
