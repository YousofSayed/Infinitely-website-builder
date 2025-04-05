import React, { useEffect, useRef, useState } from "react";
import { JsLibrary } from "./JsLibrary";
import { Input } from "./Input";
import { Button } from "../../Protos/Button";
import { filesListType, JSLibrariesType } from "../../../helpers/jsDocs";
import { cssToDataURL, jsToDataURL } from "../../../helpers/functions";
import { ViewportList } from "react-viewport-list";
import { Icons } from "../../Icons/Icons";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";

export const LibraryUploader = () => {
  const inputFileRef = useRef();
  const [files, setFiles] = useState(JSLibrariesType);
  const [remoteLibraryDetail, setRemoteLibraryDetail] = useState({
    latest: "",
    name: "",
    file: null,
  });
  const filesTypes = {
    "application/x-javascript": "js",
    "text/css": "css",
  };
  useEffect(() => {
    console.log("effect : ", files);
  }, [files]);
  /**
   *
   * @param {HTMLInputElement} input
   */
  const loadFiles = async (input) => {
    const files = [...input.files];
    const newFiles = files.map((file, i) => {
      file.fileType = filesTypes[file.type];
      console.log("type : ", file.fileType, file.type);
      // const reader = new FileReader();
      // reader.readAsText(file);
      // reader.addEventListener("loadend", async () => {
      //   file.content = reader.result;

      //   if (file.fileType == "js") {
      //     file.latest = jsToDataURL(reader.result);
      //   } else if (file.fileType == "css") {
      //     file.latest = cssToDataURL(reader.result);
      //   }

      // });
      file.latest = URL.createObjectURL(file);
      return file;
    });
    setFiles(newFiles);
  };

  const onInput = (key, value) => {
    setRemoteLibraryDetail({
      ...remoteLibraryDetail,
      [key]: value,
    });
  };

  return (
    <section className="p-2 rounded-lg border-2 border-slate-600 min-h-full h-fit">
      <header className="flex items-center justify-between gap-2 p-2 mb-2 bg-slate-950 rounded-lg">
        <Input
          placeholder="Add Library Url"
          className="w-full bg-slate-900"
          onInput={(ev) => {
            onInput("latest", ev.target.value);
          }}
        />
        <Input
          placeholder="Add Library Name"
          className="w-full bg-slate-900"
          onInput={(ev) => {
            onInput("name", ev.target.value);
          }}
        />
        <Button
          className="flex-shrink-0 px-3 py-2"
          onClick={async (ev) => {
            if (!remoteLibraryDetail.latest || !remoteLibraryDetail.name) {
              toast.error(<ToastMsgInfo msg={`Fill All Fields`} />);
              return;
            }
            const res = await fetch(remoteLibraryDetail.latest);
            if (res.ok && res.status == 200) {
              const blob = await res.blob();
              const isJs = blob.type.includes("javascript"),
                isCss = blob.type.includes("css");

              if (isJs || isCss) {
                // const splited = remoteLibraryDetail.latest.match(/\.\w+/gi);
                const fileType = isJs ? "js" : isCss ? "css" : "".trim();
                console.log("ftype: ", fileType);

                setFiles((files) => [
                  ...files,
                  {
                    ...remoteLibraryDetail,
                    
                    fileType,
                    file: new File(
                      [blob],
                      `${remoteLibraryDetail.name.replaceAll(".js", "")}.js`,
                      { type: "application/javascript" }
                    ),
                  },
                ]);
              } else {
                toast.error(<ToastMsgInfo msg={`It is not css or js lib!`} />);
              }
            }
            else{
              toast.error(<ToastMsgInfo msg={`Faild To Fetch`}/>)
            }
          }}
        >
          Add
          {Icons.plus("white")}
        </Button>
        <Button
          className="flex-shrink-0  px-3 py-2"
          onClick={(ev) => {
            inputFileRef.current.click();
          }}
        >
          Upload File
        </Button>

        <input
          ref={inputFileRef}
          type="file"
          className="hidden"
          onChange={(ev) => {
            loadFiles(ev.target);
          }}
          multiple
        />
      </header>

      <main>
        <ViewportList items={files}>
          {(file, i) => (
            <JsLibrary
              key={i}
              library={file}
              // fileuploader
              afterInstall={({ key, lib }) => {
                const newLibs = files.filter((file) => file.name != lib.name);
                setFiles(newLibs);
              }}
            />
          )}
        </ViewportList>
      </main>
    </section>
  );
};
