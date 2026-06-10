import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../Icons/Icons";
import { Button } from "../Protos/Button";
import { Input } from "../Editor/Protos/Input";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { projectState, showCrtModalState } from "../../helpers/atoms";
import { dropBoxFilesMeta, projectsType } from "../../helpers/jsDocs";
import { db } from "../../helpers/db";
import JSZip from "jszip";
import { parseHTML } from "linkedom";
import { uniqueId } from "lodash";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Editor/Protos/ToastMsgInfo";
import { restoreBlobs } from "../../helpers/bridge";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { loadProject } from "../../helpers/functions";
import { OptionsButton } from "../Protos/OptionsButton";
import {
  authDropBox,
  checkDropBoxSignInState,
  getDropBoxAccessToken,
  getDropboxFileBlob,
  handleDropboxRedirect,
  listDropboxFiles,
  loadDropBoxProject,
  logOutFromDropBox,
  refreshDropboxToken,
} from "../../helpers/dropboxHandlers";
import { addClickClass, uniqueID } from "../../helpers/cocktail";
import { dbx_sign_in_state } from "../../constants/shared";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { For } from "million/react";
import { Loader } from "../Loader";

export const Header = () => {
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [dbProjects, setDbProjects] = useRecoilState(projectState);
  const [dropboxFiles, setDropBoxFiles] = useState(dropBoxFilesMeta);
  const [uiRefresher, setUiRefresher] = useState(uniqueId(`${uniqueID()}-`));
  const inpFile = useRef();

  useEffect(() => {
    dbxHandler();
    
    // (async () => {
    //   console.log("files list");
    // })();
  }, []);

 

  const dbxHandler = async () => {
    const isDropBoxInSignInState = Boolean(
      sessionStorage.getItem(dbx_sign_in_state)
    );
    if (isDropBoxInSignInState) {
    const res =  await handleDropboxRedirect();
     res && toast.success(<ToastMsgInfo msg={`Dropbox sign in successfully 💙`} />);
    }
  };

  const search = async (value = "") => {
    if (!value) return setDbProjects(await db.projects.toArray());

    const projects = await db.projects
      .filter((prjct) => prjct.name.includes(value))
      .toArray();
    setDbProjects(projects);
    // console.log(
    //   await db.projects.filter((prjct) => prjct.name.includes("d")).toArray()
    // );
  };

  /**
   *
   * @param {import("react").ChangeEvent} ev
   */
  const loadSite = async (ev) => {
    /**
     * @type {File}
     */
    const file = ev.target.files[0];
    console.log("load File start: ", file);

    loadProject(file);

    ev.target.value = "";
    
  };

  // console.log(document.querySelectorAll('meta'));

  return (
    <header className="w-full   flex  text-text-primary font-semibold">
      <section className="container m-auto p-2 flex items-center justify-between gap-2 bg-surface-main  rounded-lg">
        <figure className="flex items-center gap-2 pr-2 border-r-2 border-r-slate-600">
          {Icons.logo({})}
          <figcaption className="font-bold">Workspace</figcaption>
        </figure>

        <section className="flex rounded-lg overflow-hidden w-[50%] ">
          <figure className="flex items-center  px-3 bg-surface-secondary">
            {Icons.search({})}
          </figure>
          <Input
            onInput={(ev) => {
              search(ev.target.value);
            }}
            placeholder="Search..."
            className="bg-surface-secondary focus:border-none rounded-tl-none rounded-bl-none w-full"
          />
        </section>

        <section className="flex items-center gap-3">
         
          <OptionsButton
            onClick={async (ev) => {
              if (!checkDropBoxSignInState()) {
                toast.warn(
                  <ToastMsgInfo msg={`You should sign in to dropbox`} />
                );
                return;
              }
              const filesMeta = await listDropboxFiles("", true);
              console.log("files meta : ", filesMeta);

              setDropBoxFiles(filesMeta);
            }}
            icon={Icons.dropbox({ fill: "white" })}
          >
            <menu style={{ width: 300, height: 300 }} className={`${dropboxFiles.length && `grid grid-cols-2 grid-rows-[135px] gap-2 overflow-hidden  overflow-y-auto [scrollbar-gutter:stable] rounded-lg   ${dropboxFiles.length > 4 && `pr-1`}`}`}>
              {Boolean(dropboxFiles.length) && checkDropBoxSignInState() ? (
                <For each={dropboxFiles}>
                  {(fileMeta, i) => (
                    <li key={i} className=" h-[135px]">
                      <figure className="p-2 h-full rounded-lg bg-surface-secondary flex flex-col items-center gap-3 w-full">
                        <i>
                          {Icons.file({ fill: "white", width: 30, height: 30 })}
                        </i>
                        <figcaption className="p-2 max-w-full bg-surface-tertiary rounded-md custom-font-size text-nowrap  overflow-hidden text-ellipsis">
                          {fileMeta.name}
                        </figcaption>
                        <SmallButton
                          tooltipTitle={`Export : ${fileMeta.name}`}
                          className="h-[35px] bg-surface-tertiary"
                          onClick={async (ev) => {
                            addClickClass(ev.currentTarget , 'click')
                            await loadDropBoxProject(fileMeta.path_lower, {
                              apps: "Dropbox",
                              dropboxFileMeta: fileMeta,
                            });
                          }}
                        >
                          {Icons.export("white")}
                        </SmallButton>
                      </figure>
                    </li>
                  )}
                </For>
              ) : (
                <section className="w-full h-full">
                  <Loader />
                </section>
              )}
            </menu>
          </OptionsButton>
          {/* </SmallButton> */}
          <Button
            onClick={(ev) => {
              setShowCrtModal(true);
            }}
          >
            {Icons.plus("white")} New site
          </Button>

          <Button
            onClick={(ev) => {
              inpFile.current.click();
            }}
          >
            {Icons.upload({ strokeColor: "white" })} Load site
          </Button>
          <OptionsButton key={uiRefresher}>
            <menu>
              <li>
                {!checkDropBoxSignInState() ? (
                  <Button
                    onClick={(ev) => {
                      addClickClass(ev.currentTarget, "click");
                      authDropBox();
                    }}
                  >
                    <i>{Icons.dropbox({ fill: "white" })}</i>
                    <h1 className="capitalize">Sign in to dropbox</h1>
                  </Button>
                ) : (
                  <Button
                    style={{
                      backgroundColor: "crimson",
                    }}
                    className="bg-[crimson]"
                    onClick={(ev) => {
                      addClickClass(ev.currentTarget, "click");
                      logOutFromDropBox();
                      setUiRefresher(uniqueId(`${uniqueID()}-`));
                      toast.info(
                        <ToastMsgInfo msg={`You signed out from dropbox 👍`} />
                      );
                    }}
                  >
                    <i>{Icons.dropbox({ fill: "white" })}</i>
                    <h1 className="capitalize">Log out from dropbox</h1>
                  </Button>
                )}
              </li>
            </menu>
          </OptionsButton>
          <input
            type="file"
            ref={inpFile}
            className="hidden"
            accept=".zip"
            onChange={loadSite}
          />
        </section>
      </section>
    </header>
  );
};
