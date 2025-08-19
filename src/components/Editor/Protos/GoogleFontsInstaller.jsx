import React, { useEffect, useRef, useState } from "react";
import { googleFontFiles, googleFontsSchema } from "../../../helpers/jsDocs";
import {
  google_fonts_endpoint,
  google_fonts_search_by_font_family,
} from "../../../constants/RestAPIEndpoints";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { Loader } from "../../Loader";
import { ViewportList } from "react-viewport-list";
import { Icons } from "../../Icons/Icons";
import { Input } from "./Input";
import { Button } from "../../Protos/Button";
import { getProjectData } from "../../../helpers/functions";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { uniqueID } from "../../../helpers/cocktail";
import { Virtuoso } from "react-virtuoso";
import { useEditorMaybe } from "@grapesjs/react";
import { useRecoilState } from "recoil";
import { dbAssetsSwState } from "../../../helpers/atoms";
import { FitTitle } from "./FitTitle";
import { VirtosuoVerticelWrapper } from "../../Protos/VirtosuoVerticelWrapper";
import { opfs } from "../../../helpers/initOpfs";
import { defineRoot, getFileSize, getFonts, toMB } from "../../../helpers/bridge";

export const GoogleFontsInstaller = () => {
  const editor = useEditorMaybe();
  const [googlFontsRespons, setGoogleFontsResponse] =
    useState(googleFontsSchema);
  const [showLoader, setShowLoader] = useState(true);
  const [fontFiles, setFontFiles] = useState(googleFontFiles);
  const allGoogleFonts = useRef(googleFontsSchema);
  const fontFilesWillInstalled = useRef([]);
  const checkedinputsRef = useRef([]);
  const currentFileName = useRef("");
  const searchTimeout = useRef();
  const [swDBAssets, setSwDBAssets] = useRecoilState(dbAssetsSwState);

  useEffect(() => {
    getGoogleFontsResponse();
  }, []);

  const getGoogleFontsResponse = async () => {
    try {
      setShowLoader(true);
      const response = await fetch(google_fonts_endpoint);
      const jsonRes = await response.json();
      allGoogleFonts.current = jsonRes;
      setGoogleFontsResponse(jsonRes);
    } catch (error) {
      console.error(`From google fonts : ${error}`);
      toast.error(<ToastMsgInfo msg={"There is error in google fonts"} />);
    } finally {
      setShowLoader(false);
    }
  };

  const search = (keyword) => {
    searchTimeout.current && clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!keyword) {
        setGoogleFontsResponse(allGoogleFonts.current);
        return;
      }
      const cloneArr = structuredClone(allGoogleFonts.current);
      cloneArr.items = cloneArr.items.filter((font) =>
        font.family.toLowerCase().includes(keyword.toLowerCase())
      );
      setGoogleFontsResponse(cloneArr);
    }, 500);
  };

  const installFiles = async (isCDN = false) => {
    const files = fontFilesWillInstalled.current;
    const mime = await (await import("mime")).default;
    if (!files.length) {
      toast.warn(<ToastMsgInfo msg={`Select Files To Install`} />);
      return;
    }

    const updateFiles = () => {
      toast.success(
        <ToastMsgInfo
          msg={`${files.length} Font Files Installed Successfully`}
        />
      );
    };

    const installedFonts = await Promise.all(
      files.map(async (key) => {
        const name = `${currentFileName.current.replaceAll(
          /\s+/gi,
          "-"
        )}-${key}`;
        if (!isCDN) {
          const response = await fetch(fontFiles[key]);
          const res = await response.blob();
          console.log("name : ", name, currentFileName.current, key);
          const ext = mime.getExtension(res.type);
          const fileName = `${name.replace(`.${ext}`, "")}.${ext}`;
          console.log("font name : ", name, ext);
          const file = new File([res], fileName, { type: res.type });
          return {
            url: fontFiles[key],
            // dataUrl: reader.result,
            // blob: res,
            file,
            id: uniqueID(),
            name: `${name}`,
            fileName,
            path: `fonts/${fileName}`,
            isCDN,
            size:getFileSize(file).MB
          };
        } else {
          return {
            url: fontFiles[key],
            id: uniqueID(),
            name,
            isCDN,
          };
        }
      })
    );

    const fontsIntoDB = {};
    // installedFonts.forEach((fontInfo) => {
    //   fontsIntoDB[fontInfo.isCDN ? fontInfo.name : fontInfo.fileName] =
    //     fontInfo;
    // });
    for (const fontInfo of installedFonts) {
      const key =fontInfo.isCDN ? fontInfo.name : fontInfo.fileName; 
      fontsIntoDB[key] =
        fontInfo;
      if (!fontInfo.isCDN) {
        // const fontsFolder = await opfs.getFolder(
        //   await opfs.root,
        //   `projects/project-${opfs.id}/fonts`
        // );
        await opfs.writeFiles([
          {
            path: defineRoot(`${fontInfo.path}`),
            content: fontInfo.file,
          },
        ]);

      }
      delete fontsIntoDB[key].file
    }
    console.log(installedFonts, fontsIntoDB);

    const updater = async () => {
      const projectData = await getProjectData();
      const projectId = +localStorage.getItem(current_project_id);
      const dataToUpdate = {
        fonts: {
          ...projectData.fonts,
          ...fontsIntoDB,
        },
      };

      await opfs.writeFiles([
        {
          path:defineRoot(`css/fonts.css`),
          content:getFonts(dataToUpdate)
        }
      ])
      await db.projects.update(projectId, dataToUpdate);
      // const newProjectData = await getProjectData();
      // swDBAssets.postMessage({
      //   command: "setVar",
      //   props: {
      //     obj: {
      //       projectId: +localStorage.getItem(current_project_id),
      //       projectData: newProjectData,
      //     },
      //   },
      // });
      updateFiles();
    };
    await updater();

    const clone = structuredClone(fontFiles);
    console.log("clooonet : ", clone, files);

    files.forEach((key) => {
      delete clone[key];
    });
    checkedinputsRef.current
      .filter(Boolean)
      .forEach((el) => (el.checked = false));
    if (!Object.keys(clone).length) {
      console.log("no lenfth");

      setGoogleFontsResponse(allGoogleFonts.current);
      checkedinputsRef.current = [];
    }
    // checkedinputsRef.current = checkedinputsRef.current.filter(Boolean);
    fontFilesWillInstalled.current = [];
    setFontFiles(clone);
    editor.load();
  };

  const onNavigateToFiles = (font) => {
    setFontFiles(font.files);
    checkedinputsRef.current = [];
    fontFilesWillInstalled.current = [];
    currentFileName.current = font.family;
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const onSelectAll = (ev) => {
    const checked = ev.target.checked;
    checkedinputsRef.current
      .filter(Boolean)
      .forEach((el) => (el.checked = checked));
    if (checked) {
      fontFilesWillInstalled.current = Object.keys(fontFiles);
    } else {
      fontFilesWillInstalled.current = [];
    }
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const onSelectOne = (ev, key) => {
    const checked = ev.target.checked;

    if (checked) {
      fontFilesWillInstalled.current.push(key);
    } else {
      const newArr = fontFilesWillInstalled.current.filter(
        (item) => item != key
      );
      fontFilesWillInstalled.current = newArr;
    }
  };

  return (
    <section className="h-full">
      <section
        className={`w-full overflow-auto ${
          !!Object.keys(fontFiles)?.length ? "h-[88.5%] p-2" : "h-full"
        } flex flex-col gap-2  `}
      >
        {!Object.keys(fontFiles).length && (
          <section className="flex max-h-[60px] p-1">
            <figure className="w-[50px] h-full flex-shrink-0 overflow-auto  bg-slate-800 grid place-items-center rounded-tl-lg rounded-bl-lg">
              {Icons.search({})}
            </figure>
            <Input
              placeholder="Search..."
              className="w-full bg-slate-800 py-3 rounded-tl-none rounded-bl-none border-none"
              onInput={(ev) => {
                search(ev.target.value);
              }}
            />
          </section>
        )}

        {!showLoader &&
          !Object.keys(fontFiles).length &&
          !!googlFontsRespons?.items?.length && (
            <section className="h-full overflow-auto flex flex-col">
              <Virtuoso
                // scrolling="none"
                // className="h-[100%!important] flex flex-col hideScrollBar"
                components={{ Item: VirtosuoVerticelWrapper }}
                totalCount={googlFontsRespons.items.length}
                itemContent={(i) => {
                  const font = googlFontsRespons.items[i];
                  return (
                    <section
                      key={i}
                      onClick={(ev) => {
                        onNavigateToFiles(font);
                      }}
                      className="p-2  text-slate-200 font-semibold bg-slate-800 rounded-md flex items-center justify-between [&:hover_path]:stroke-white cursor-pointer"
                    >
                      {/* <p className="cursor-pointer">{font.family}</p> */}
                      <FitTitle>{font.family}</FitTitle>
                      <button
                        className="rotate-[-90deg] cursor-pointer group"
                        // onClick={(ev) => {
                        //   onNavigateToFiles(font);
                        // }}
                      >
                        {Icons.arrow()}
                      </button>
                    </section>
                  );
                }}
              />
            </section>
          )}

        {!!Object.keys(fontFiles).length && (
          <section className="flex items-center justify-between">
            <button
              className="group cursor-pointer flex justify-between items-center gap-2  mb-2 bg-slate-800 rounded-lg w-fit p-1"
              onClick={(ev) => {
                checkedinputsRef.current = [];
                fontFilesWillInstalled.current = [];
                setFontFiles({});
              }}
            >
              <i className="rotate-[90deg]">{Icons.arrow()}</i>
              <FitTitle className="h-full">{currentFileName.current}</FitTitle>
            </button>

            <button className="group cursor-pointer flex justify-between items-center py-2 px-3 mb-2 bg-slate-800 rounded-lg w-fit">
              <span className="h-full block px-2 border-r-2 border-r-slate-600">
                <input
                  id="select-all"
                  type="checkbox"
                  name="select-all"
                  className="cursor-pointer"
                  onChange={onSelectAll}
                />
              </span>
              <label htmlFor="select-all" className="px-2 cursor-pointer">
                Select All
              </label>
              {/* <p className="px-2">Select All</p> */}
            </button>
          </section>
        )}

        {!!Object.keys(fontFiles).length &&
          Object.keys(fontFiles).map((key, i) => {
            return (
              <article
                key={i}
                className="px-2 py-3 gap-2 text-slate-200 font-semibold bg-slate-800 rounded-md flex items-center "
              >
                <section className="h-full px-2 border-r-2 border-r-slate-600">
                  <input
                    ref={(el) => (checkedinputsRef.current[i] = el)}
                    name={key}
                    type="checkbox"
                    className="cursor-pointer"
                    onChange={(ev) => onSelectOne(ev, key)}
                  />
                </section>
                <p>{key}</p>
              </article>
            );
          })}

        {showLoader && !googlFontsRespons?.items?.length && (
          <section className="flex items-center h-full justify-center ">
            <Loader />
          </section>
        )}
      </section>

      {!!Object.keys(fontFiles).length && (
        <footer className=" p-2  border-t-2 h-[12.5%]  border-t-slate-600 flex gap-2">
          <Button
            onClick={(ev) => {
              installFiles(true);
            }}
          >
            {Icons.installAsCDN({
              fill: "white",
              strokeColor: "white",
              arrowStrokeColor: "#3b82f6 ",
            })}
            Install As Cdn
          </Button>

          <Button
            onClick={(ev) => {
              installFiles(false);
            }}
          >
            {Icons.export("white")}
            Install Locally
          </Button>
        </footer>
      )}
    </section>
  );
};
