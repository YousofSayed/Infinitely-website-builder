import { wp_update_option, wp_upload_multiple_files } from "@/Apps/wordpress/functions";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import {
  google_fonts_endpoint,
  google_fonts_search_by_font_family,
} from "@/constants/RestAPIEndpoints";
import { current_project_id } from "@/constants/shared";
import { dbAssetsSwState } from "@/helpers/atoms";
import { defineRoot, fileNameToMediaSlug, getFileSize, getFonts, toMB } from "@/helpers/bridge";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { doInNormalAsync, doInWordpressAsync, getProjectData } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { googleFontFiles, googleFontsSchema } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import { Checkbox } from "@/components/Protos/Checkbox";
import { VirtosuoVerticelWrapper } from "@/components/Protos/VirtosuoVerticelWrapper";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { isPlainObject } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Virtuoso } from "react-virtuoso";
import { useRecoilState } from "recoil";

/**
 * Component to render a single Google Font item with live preview
 */
const GoogleFontItem = ({ font, onClick }) => {
  const [fontLoaded, setFontLoaded] = React.useState(false);
  const fontFaceRef = React.useRef(null);

  React.useEffect(() => {
    const fontUrl = font.files?.regular || font.files?.[Object.keys(font.files)[0]];
    if (!fontUrl) return;

    const fontFace = new FontFace(font.family, `url(${fontUrl})`);
    fontFaceRef.current = fontFace;

    fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      setFontLoaded(true);
    }).catch((err) => {
      console.warn(`Failed to load font ${font.family}:`, err);
    });

    return () => {
      if (fontFaceRef.current) {
        document.fonts.delete(fontFaceRef.current);
      }
    };
  }, [font.family, font.files]);

  return (
    <section
      onClick={onClick}
      className="p-2 text-text-primary text-xl   bg-surface-tertiary rounded-md flex items-center justify-between [&:hover_path]:stroke-white cursor-pointer"
    >
      <h1 style={fontLoaded ? { fontFamily: font.family } : {}}>{font.family}</h1>
      <button
        className="rotate-[-90deg] cursor-pointer group"
      >
        {Icons.arrow()}
      </button>
    </section>
  );
};

export const GoogleFontsInstaller = () => {
  const editor = useEditorMaybe();
  const [googlFontsRespons, setGoogleFontsResponse] =
    useState(googleFontsSchema);
  const [showLoader, setShowLoader] = useState(true);
  const [fontFiles, setFontFiles] = useState(googleFontFiles);
  const allGoogleFonts = useRef(googleFontsSchema);
  // const fontFilesWillInstalled = useRef([]);
  const [fontFilesWillInstalled, setFontFilesWillInstalled] = useState([]);
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
      console.log('google fonts : ', jsonRes);

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
    const files = fontFilesWillInstalled;
    const mime = await (await import("mime")).default;
    if (!files.length) {
      toast.warn(<ToastMsgInfo msg={`Select Files To Install`} />);
      return;
    }

    const toastId = toast.loading(
      <ToastMsgInfo msg={`Installing ${files.length} font files...`} />
    );

    const updateFiles = () => {
      toast.update(toastId, {
        render: <ToastMsgInfo msg={`${files.length} Font Files Installed Successfully`} />,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    };

    const onError = (error) => {
      toast.update(toastId, {
        render: <ToastMsgInfo msg={error?.message || "Failed to install fonts"} />,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    };

    try {
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
              size: getFileSize(file).MB
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

      await doInNormalAsync(async (params) => {
        for (const fontInfo of installedFonts) {
          const key = fontInfo.isCDN ? fontInfo.name : fontInfo.fileName;
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
              path: defineRoot(`css/fonts.css`),
              content: getFonts(dataToUpdate)
            }
          ])
          await db.projects.update(projectId, dataToUpdate);

          updateFiles();
        };
        await updater();
      });

      await doInWordpressAsync(async () => {
        const projectId = +localStorage.getItem(current_project_id);
        const projectData = await getProjectData();

        // Filter files for upload (non-CDN only, as CDN fonts don't need upload)
        const filesToUpload = installedFonts
          .filter((fontInfo) => !fontInfo.isCDN && fontInfo.file)
          .map((fontInfo) => fontInfo.file);

        if (filesToUpload.length > 0) {
          const uploadResult = await wp_upload_multiple_files({
            projectId,
            files: filesToUpload,
          });

          console.log("wp_upload_multiple_files result:", uploadResult);

          if (uploadResult.success && isPlainObject(uploadResult.files)) {
            // Build fonts object from upload results
            for (const [slug, mediaInfo] of Object.entries(uploadResult.files)) {
              const fontInfo = installedFonts.find(
                (f) => f.fileName && slug.toLowerCase() === fileNameToMediaSlug(f.fileName).toLowerCase()
              );

              if (fontInfo) {
                const key = fontInfo.fileName;
                fontsIntoDB[key] = {
                  ...fontInfo,
                  ...mediaInfo,
                  // url: mediaInfo.source_url || mediaInfo.url,
                  // wpMediaId: mediaInfo.id,
                  // slug: mediaInfo.slug,
                };
                delete fontsIntoDB[key].file;
              }
            }
          } else {
            console.error(uploadResult);
            throw new Error(`Failed to upload font files 😥`)
          }
        }

        // Handle CDN fonts (no upload needed)
        for (const fontInfo of installedFonts.filter((f) => f.isCDN)) {
          const key = fontInfo.name;
          fontsIntoDB[key] = fontInfo;
        }

        console.log("fontsIntoDB for WordPress:", fontsIntoDB);

        // Update database
        const dataToUpdate = {
          fonts: {
            ...projectData.fonts,
            ...fontsIntoDB,
          },
        };

        await db.projects.update(projectId, dataToUpdate);
        const newProjectData = await getProjectData();
        const wp_update_config_res = await wp_update_option({
          optionName: 'inf_config',
          projectId,
          value: newProjectData,
        });
        if (!wp_update_config_res.success) {
          throw new Error(`Failed to update WordPress config 😥`)
        }
        updateFiles();
      });

      const clone = structuredClone(fontFiles);
      console.log("clooonet : ", clone, files);

      files.forEach((key) => {
        delete clone[key];
      });
      // checkedinputsRef.current
      //   .filter(Boolean)
      //   .forEach((el) => (el.checked = false));
      setFontFilesWillInstalled([]);
      if (!Object.keys(clone).length) {
        console.log("no lenfth");

        setGoogleFontsResponse(allGoogleFonts.current);
        // checkedinputsRef.current = [];
      }
      // checkedinputsRef.current = checkedinputsRef.current.filter(Boolean);
      // fontFilesWillInstalled.current = [];
      setFontFilesWillInstalled([]);
      setFontFiles(clone);
      // editor.load();
      reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });
    } catch (error) {
      console.error("Install fonts error:", error);
      onError(error);
    }
  };

  const onNavigateToFiles = (font) => {
    setFontFiles(font.files);
    setFontFilesWillInstalled([]);
    currentFileName.current = font.family;
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const onSelectAll = (ev) => {
    // const checked = ev.target.checked;
    const checked = fontFilesWillInstalled.length === Object.keys(fontFiles).length && Object.keys(fontFiles).length > 0;
    // checkedinputsRef.current
    //   .filter(Boolean)
    //   .forEach((el) => (el.checked = checked));
    if (checked) {
      // fontFilesWillInstalled.current = Object.keys(fontFiles);
      setFontFilesWillInstalled([]);
    } else {
      setFontFilesWillInstalled(Object.keys(fontFiles));
      // fontFilesWillInstalled.current = [];
    }
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const onSelectOne = (ev, key) => {
    // const checked = ev.target.checked;
    const checked = fontFilesWillInstalled.includes(key);

    if (checked) {
      // fontFilesWillInstalled.current.push(key);
      setFontFilesWillInstalled(fontFilesWillInstalled.filter((item) => item != key));
    } else {
      // const newArr = fontFilesWillInstalled.current.filter(
      //   (item) => item != key
      // );
      // fontFilesWillInstalled.current = newArr;
      setFontFilesWillInstalled([...fontFilesWillInstalled, key]);
    }
  };

  return (
    <section className="h-full">
      <section
        className={`w-full overflow-auto ${!!Object.keys(fontFiles)?.length ? "h-[88.5%] p-2" : "h-full"
          } flex flex-col gap-2  `}
      >
        {!Object.keys(fontFiles).length && (
          <section className="flex max-h-[60px] p-1">
            <figure className="w-[50px] h-full shrink-0 overflow-auto  bg-surface-tertiary grid place-items-center rounded-tl-lg rounded-bl-lg">
              {Icons.search({})}
            </figure>
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-surface-tertiary py-3 rounded-tl-none rounded-bl-none border-none"
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
                    <GoogleFontItem
                      key={i}
                      font={font}
                      onClick={() => onNavigateToFiles(font)}
                    />
                  );
                }}
              />
            </section>
          )}

        {!!Object.keys(fontFiles).length && (
          <section className="flex items-center justify-between">
            <button
              className="group cursor-pointer flex justify-between items-center gap-2  mb-2 bg-surface-tertiary rounded-lg w-fit p-1"
              onClick={(ev) => {
                checkedinputsRef.current = [];
                fontFilesWillInstalled.current = [];
                setFontFiles({});
              }}
            >
              <i className="rotate-[90deg]">{Icons.arrow()}</i>
              <FitTitle className="h-full">{currentFileName.current}</FitTitle>
            </button>

            {/* <button className="group cursor-pointer flex justify-between items-center py-2 px-3 mb-2 bg-surface-tertiary rounded-lg w-fit">
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
            </button> */}

            <Checkbox title="Select All" className="shrink-0 flex-grow-0 py-2 px-3" onChange={onSelectAll} checked={fontFilesWillInstalled.length === Object.keys(fontFiles).length && Object.keys(fontFiles).length > 0} />
          </section>
        )}

        {!!Object.keys(fontFiles).length &&
          Object.keys(fontFiles).map((key, i) => {
            return (
              <article
                key={i}
                className="px-2 py-3 gap-2 text-text-primary font-semibold bg-surface-tertiary rounded-md flex items-center "
              >
                <section className="h-full px-2 border-r-2 border-r-slate-600">
                  <Input
                    name={key}
                    type="checkbox"
                    className="cursor-pointer"
                    checked={fontFilesWillInstalled.includes(key)}
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
