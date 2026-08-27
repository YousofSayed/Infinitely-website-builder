import { cssToDataURL, jsToDataURL } from "@/helpers/functions";
import { filesListType, JSLibrariesType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Input } from "@/components/Editor/Protos/Input";
import { JsLibrary } from "@/components/Editor/Protos/JsLibrary";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Virtuoso } from "react-virtuoso";

export const LibraryUploader = () => {
  const inputFileRef = useRef();
  const [files, setFiles] = useState(JSLibrariesType);
  const [addManauly, setAddManualy] = useState('');
  const [addManualyLibType, setManualyLibType] = useState('');
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

    const inputFiles = [...input.files];
    const mime = await (await import('mime')).default
    files.forEach(file => URL.revokeObjectURL(file.latest));
    const newFiles = inputFiles.map((file, i) => {

      file.fileType = mime.getExtension(file.type);
      console.log("type : ", mime.getExtension(file.type), file.fileType, file.type);

      file.latest = URL.createObjectURL(file);
      return file;
    });
    setFiles(newFiles);
    input.value = '';
  };

  const onInput = (key, value) => {
    setRemoteLibraryDetail({
      ...remoteLibraryDetail,
      [key]: value,
    });
  };

  return (
    <section className="p-1 rounded-lg min-h-full h-full flex flex-col">
      <header className="flex items-center justify-between gap-2 p-2 mb-2 bg-surface-tertiary rounded-lg">
        <Input
          placeholder="Add Library Url"
          className="w-full bg-surface-secondary"
          onInput={(ev) => {
            onInput("latest", ev.target.value);
          }}
        />
        <Input
          placeholder="Add Library Name"
          className="w-full bg-surface-secondary"
          onInput={(ev) => {
            onInput("name", ev.target.value);
          }}
        />
        <Button
          className="shrink-0 px-3 py-2  h-full font-semibold "
          onClick={async (ev) => {
            if (!remoteLibraryDetail.latest || !remoteLibraryDetail.name) {
              toast.error(<ToastMsgInfo msg={`Fill All Fields`} />);
              return;
            }
            try {
              const res = await fetch(remoteLibraryDetail.latest);
              if (res.ok && res.status == 200) {
                const blob = await res.blob();
                const isJs = blob.type.includes("javascript"),
                  isCss = blob.type.includes("css");
                  const fileType = isJs ? "js" : isCss ? "css" : "".trim();
                  console.log("ftype: ", fileType , blob.type);
                // console.log('');
                
                if (isJs || isCss) {
                  // const splited = remoteLibraryDetail.latest.match(/\.\w+/gi);

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
                  // setAddManualy(remoteLibraryDetail.latest);
                  setAddManualy(remoteLibraryDetail.latest);
                  
                  console.log(`remoteLibraryDetail.latest : `, remoteLibraryDetail.latest);
                  toast.error(<ToastMsgInfo msg={`It is not css or js lib!`} />);
                }
              } else {
                setAddManualy(remoteLibraryDetail.latest);
                console.log(`remoteLibraryDetail.latest : `, remoteLibraryDetail.latest);

                toast.error(<ToastMsgInfo msg={`Faild To Fetch`} />);
              }
            } catch (error) {
              setAddManualy(remoteLibraryDetail.latest);
              console.log(`remoteLibraryDetail.latest : `, remoteLibraryDetail.latest);
              throw new Error(error);
            }
          }}
        >
          {Icons.plus("white")}
          Add
        </Button>
        <Button
          className="shrink-0  px-3 py-2  h-full font-semibold "
          onClick={(ev) => {
            inputFileRef.current.click();
          }}
        >
          {Icons.upload({ strokeColor: "white" })}
          Upload File
        </Button>

        <input
          ref={inputFileRef}
          accept=".js , .css"
          type="file"
          hidden
          onChange={(ev) => {
            loadFiles(ev.target);
          }}
        // multiple
        />
      </header>

      {Boolean(addManauly) && <section className="z-0 p-2 mb-2 bg-slate-800 rounded-lg flex gap-2">
        <Input value={remoteLibraryDetail.latest}
          onInput={(ev) => {
            setAddManualy(ev.target.value);
            setRemoteLibraryDetail({
              ...remoteLibraryDetail,
              latest: ev.target.value
            })
          }}
          placeholder="Library url" className="bg-slate-900" />
        <Input value={remoteLibraryDetail.name} onInput={(ev) => {
          setRemoteLibraryDetail({
            ...remoteLibraryDetail,
            name: ev.target.value
          })
        }} placeholder="Library name" className="bg-slate-900" />

        <Select
          keywords={['js', 'css']}
          value={addManualyLibType}
          containerClassName="bg-slate-900"
          className="bg-slate-900"
          zIndex={2000}
          placeholder="Choose library type" onAll={(value) => {
            setManualyLibType(value)
          }} />

        <Button onClick={() => {
          if(!addManualyLibType){
            toast.warn(<ToastMsgInfo msg={`Please select library type 😀`} />)
            return;
          }
          setFiles((files) => ([
            ...files,
            {
              ...remoteLibraryDetail,
              fileType: addManualyLibType,
              manually : true,
              
            }
          ]));
          setAddManualy('');
        }}>
          {Icons.plus("white")}
          Add Manually
        </Button>
      </section>}

      <main className="h-full w-full overflow-auto">
        <Virtuoso
          totalCount={files.length}
          itemContent={(i) => {
            const file = files[i];
            return (
              <JsLibrary
                key={i}
                library={file}

                // fileuploader
                afterInstall={({ key, lib }) => {
                  const newLibs = files.filter((file) => file.name != lib.name);
                  setFiles(newLibs);
                }}
              />
            );
          }}
        />
      </main>
    </section>
  );
};
