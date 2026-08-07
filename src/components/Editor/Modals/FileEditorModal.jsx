import { open_library_installer_modal } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_project_id } from "@/constants/shared";
import { fileInfoState } from "@/helpers/atoms";
import { defineRoot, getFileSize } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import { getProjectData } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { MultiTab } from "@/components/Protos/Multitabs";
import { CodeEditor } from "@/components/Editor/Protos/CodeEditor";
import { TabLabel } from "@/components/Editor/Protos/TabLabel";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";

export const FileEditorModal = () => {
  const editor = useEditorMaybe();
  // const fileInfo = useRecoilValue(fileInfoState);
  const [fileInfo, setFileInfo] = useRecoilState(fileInfoState);
  const [fileData, setFileData] = useState({
    name: "",
    path: "",
    content: "",
    type: "",
    size: 0,
    isJs: false,
    isCss: false,
    isOther: false,
  });

  const projectId = +localStorage.getItem(current_project_id);

  const saveToDB = async () => {
    // const projectData = await getProjectData();
    // /**
    //  * @type {import('@/helpers/types').LibraryConfig[] | undefined}
    //  */
    // let libs, key;

    // if (fileInfo.fileType.includes("javascript") && fileInfo.isHeader) {
    //   libs = projectData.jsHeaderLibs;
    //   key = "jsHeaderLibs";
    // } else if (fileInfo.fileType.includes("javascript") && fileInfo.isFooter) {
    //   libs = projectData.jsFooterLibs;
    //   key = "jsFooterLibs";
    // } else if (fileInfo.fileType.includes("css")) {
    //   libs = projectData.cssLibs;
    //   key = "cssLibs";
    // }

    // const editedLibs = libs.map((lib) => {
    //   if (lib.file.name == fileInfo.fileName && lib.id == fileInfo.id) {
    //     lib.file = new File([fileInfo.fileContent], fileInfo.fileName, {
    //       type: lib.file.type,
    //     });
    //   }
    //   return lib;
    // });

    // if (libs.length && key) {
    //   await db.projects.update(projectId, {
    // //     [key]: editedLibs,
    // //   });
    //   // console.log('project from saved : ' , await(await(await getProjectData())[key][0].file).text() , fileInfo.fileContent);

    // ;
    // } else {
    //   toast.error(<ToastMsgInfo msg={"Faild To Save File"} />);
    // }
    try {
      await opfs.writeFiles([
        {
          path: defineRoot(fileInfo.path),
          content: fileData.content,
        },
      ]);
      // editor.load();
      reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {state:true});
      toast.success(<ToastMsgInfo msg={"File Saved Successfully 👍"} />);
    } catch (error) {
      throw new Error(error);
    }
  };

  useEffect(() => {
    (async () => {
      const fileHandle = await opfs.getFile(defineRoot(fileInfo.path));
      const file = await fileHandle.getOriginFile();
      const isCss = file.type.toLowerCase().includes("css");
      const isJs = file.type.toLowerCase().includes("javascript");

      setFileData({
        name: file.name,
        content: await file.text(),
        path: fileHandle.path,
        type: file.type,
        size: getFileSize(file).MB,
        isCss,
        isJs,
        isOther: !isCss && !isJs,
      });
    })();
  }, []);

  return (
    <section className="h-full flex flex-col gap-2 justify-between">
      <MultiTab
        style={{
          height: `90%`,
        }}
        tabs={[
          {
            title: (
              <TabLabel
                icon={
                  (fileData.isJs && Icons.js({})) ||
                  (fileData.isCss && Icons.css({}))
                }
                label={fileData.name}
              />
            ),

            content: (
              <CodeEditor
                allowExtraLibs={true}
                // toFormateValue={fileData.content || ""}
                
                props={{
                  value:fileData.content,
                  options: {
                    // formatOnType:true,
                  },
                  onChange(value) {
                    console.log("done change");

                    setFileData({
                      ...fileData,
                      content: value,
                    });
                  },
                  language: fileData.isJs
                    ? "javascript"
                    : fileData.isCss
                    ? "css"
                    : "",
                }}
              />
            ),
          },
        ]}
      />
      <footer className="flex gap-2 items-center">
        <Button
          onClick={() => {
            editor.runCommand(open_library_installer_modal);
          }}
        >
          <i className="rotate-[90deg]">{Icons.arrow("white")}</i>
          Back
        </Button>

        <Button
          onClick={(ev) => {
            saveToDB();
          }}
        >
          {Icons.saveData({ fill: "white" })}
          Save
        </Button>
      </footer>
    </section>
  );
};
