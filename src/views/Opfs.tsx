import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import { InfAccordion } from "@/components/Protos/InfAccordion";
import { addClickClass } from "@/helpers/cocktail";
import { downloadFile } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { OPFS } from "@/helpers/opfs";
import { OTDir, OTFile } from "opfs-tools";
import React, { JSX, useEffect, useLayoutEffect, useState } from "react";

// {
//   folder: FileSystemDirectoryHandle;
//   files: FileSystemFileHandle[];
// }
type OpfsViewData = FileSystemDirectoryHandle[];

type Root = string;
type Entries = (OTDir | OTFile)[];

const OpfsChild = ({
  root,
  children,
}: {
  root: Root;
  children?: JSX.Element;
}) => {
  const [dir, setDir] = useState<OTDir>();
  const [dirChildren, setDirChildren] = useState<Entries>();
  useEffect(() => {
    console.log(`useLayoutEffect triggered for root: ${root}`);
    getDirs();
    const events = [
      "fileCreated",
      "filesCreated",
      "folderCreated",
      "foldersCreated",
      "entriesRemoved",
      "entryRemoved",
    ];

    const createCleaner = opfs.onBroadcast(events as any, async (data) => {
      // const opfsD = (await opfs.getAllFolders(
      //   (await root) as FileSystemDirectoryHandle
      // )) as OpfsViewData;
      console.log("dddddddddd");
      getDirs();
    });

    const eventTargetCleaner = opfs.on(events as any, getDirs);

    return () => {
      console.log(`Cleanup for root: ${root}`);

      createCleaner();
      eventTargetCleaner();
    };
  }, [root]);

  const getDirs = async () => {
    const dirHandle = await opfs.getFolder(root);
    const dirChildren = await dirHandle.children();
    setDir(dirHandle);
    setDirChildren(dirChildren);
  };

  return (
    <main className=" h-full">
      {/* <details> */}
      <details className="ml-3 text-text-primary">
        {children}

        <summary className="p-2 bg-surface-tertiary w-[38%] rounded-lg">
          <div
            style={{
              display: "inline-block",
              width: `calc(100% - 15px)`,
            }}
          >
            <div className="flex items-center justify-between gap-2 w-full shrink">
              <h1>{dir?.name}</h1>
              {dir?.name !== "projects" && (
                <div className="flex items-center gap-3">
                  {/* <button
                          onClick={async (ev) => {
                            addClickClass(ev.currentTarget, "click");
                            const file = await (
                              handle as FileSystemFileHandle
                            ).getFile();
                            downloadFile({
                              filename: name,
                              content: file,
                              mimeType: file.type,
                            });
                          }}
                        >
                          {Icons.export("white", undefined, 18, 18)}
                        </button>
                        <Hr /> */}
                  <button
                    onClick={async (ev) => {
                      addClickClass(ev.currentTarget, "click");
                      console.log("start click dir");
                      await opfs.remove({ dirOrFile: dir as OTDir });
                      // await dir?.remove();
                      // await getDirs();
                    }}
                  >
                    {Icons.trash("white", undefined, 18, 18)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </summary>
        {!!dirChildren?.length &&
          dirChildren?.map((handle, index: number) => (
            <section key={index} className="">
              {handle?.kind == "file" && (
                <div
                  className="bg-surface-tertiary rounded-lg p-2 flex items-center ml-3 mb-2 w-[30%] justify-between"
                  onClick={async (ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    const file = await handle.getOriginFile();
                   
                    if (!file) return;
                    // console.log('file'  , await handle.arrayBuffer());
                    
                    const url = URL.createObjectURL(file);
                    const a = document.createElement("a");
                    a.hidden = true;
                    a.href = url;
                    a.target = "_blank";
                    document.body.append(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {Icons.file({})}
                    <h1 className="max-w-[70%] overflow-hidden text-ellipsis">{handle.name}</h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={async (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        addClickClass(ev.currentTarget, "click");
                        const file = await handle.getOriginFile();
                        if (!file) {
                          throw new Error(`File is not founded`);
                        }
                        downloadFile({
                          filename: file.name,
                          content: file,
                          mimeType: file.type,
                        });
                      }}
                    >
                      {Icons.export("white", undefined, 18, 18)}
                    </button>
                    <Hr />
                    <button
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        console.log("start click");
                        await opfs.remove({
                          dirOrFile:handle
                        })
                        // const file = await (handle as FileSystemFileHandle).getFile()
                        // await handle.remove();
                        // await getDirs();
                      }}
                    >
                      {Icons.trash("white", undefined, 18, 18)}
                    </button>
                  </div>
                </div>
              )}

              {handle?.kind == "dir" && <OpfsChild root={handle.path} />}
            </section>
          ))}
      </details>
      {/* </details> */}
      {/* {opfsData && opfsData.map((handle: FileSystemDirectoryHandle | FileSystemFileHandle)=><INf className='text-text-primary capitalize'>
        <summary>{handle.name}</summary>
        {handle.kind == 'directory' && <Opfs root={(handle as any)}/>}
      </INf>)} */}
    </main>
  );
};

export const Opfs = () => {
  return (
    <section className="bg-surface-secondary h-full w-full p-2 overflow-auto">
      <OpfsChild root={`/projects`} />
    </section>
  );
};
