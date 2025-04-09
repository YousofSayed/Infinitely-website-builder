import React from "react";
import { MultiTab } from "../../Protos/Multitabs";
import { TabLabel } from "../Protos/TabLabel";
import { Icons } from "../../Icons/Icons";
import { useRecoilState} from "recoil";
import { fileInfoState } from "../../../helpers/atoms";
import { CodeEditor } from "../Protos/CodeEditor";
import { Button } from "../../Protos/Button";
import { useEditorMaybe } from "@grapesjs/react";
import { getProjectData } from "../../../helpers/functions";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { open_library_installer_modal } from "../../../constants/InfinitelyCommands";

export const FileEditorModal = () => {
  const editor = useEditorMaybe();
  // const fileInfo = useRecoilValue(fileInfoState);
  const [fileInfo,setFileInfo] = useRecoilState(fileInfoState);
  
  const projectId = +localStorage.getItem(current_project_id);

  const saveToDB = async () => {
    const projectData = await getProjectData();
    /**
     * @type {import('../../../helpers/types').LibraryConfig[] | undefined}
     */
    let libs, key;

    if (fileInfo.fileType.includes("javascript") && fileInfo.isHeader) {
      libs = projectData.jsHeaderLibs;
      key = "jsHeaderLibs";
    } else if (fileInfo.fileType.includes("javascript") && fileInfo.isFooter) {
      libs = projectData.jsFooterLibs;
      key = "jsFooterLibs";
    } else if (fileInfo.fileType.includes("css")) {
      libs = projectData.cssLibs;
      key = "cssLibs";
    }

    const editedLibs = libs.map((lib) => {
      if (lib.file.name == fileInfo.fileName && lib.id == fileInfo.id) {
        lib.file = new File([fileInfo.fileContent], fileInfo.fileName, {
          type: lib.file.type,
        });
      }
      return lib;
    });

    if (libs.length && key) {
      await db.projects.update(projectId, {
        [key]: editedLibs,
      });
      editor.load();
      toast.success(<ToastMsgInfo msg={"File Save Successfully"} />);
    } else {
      toast.error(<ToastMsgInfo msg={"Faild To Save File"} />);
    }
  };

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
                  (fileInfo.fileType.toLowerCase().includes("javascript") &&
                    Icons.js({})) ||
                  (fileInfo.fileType.toLowerCase().includes("css") &&
                    Icons.css({}))
                }
                label={fileInfo.fileName}
              />
            ),

            content: (
              <CodeEditor
                allowExtraLibs={false}
                toFormateValue={fileInfo.fileContent || ""}
                props={{
                  options: {
                    // formatOnType:true,
                  },
                  onChange(value) {
                    console.log("done change");

                    setFileInfo({
                      ...fileInfo,
                      fileContent: value,
                    });
                  },
                  language:
                    fileInfo.fileType.toLowerCase().includes("javascript") ? 'javascript': 
                    (fileInfo.fileType.toLowerCase().includes("css") ? "css" : ''),
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
