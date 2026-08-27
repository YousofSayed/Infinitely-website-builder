import { wp_delete_media_files_by_slugs, wp_update_option } from "@/Apps/wordpress/functions";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_project_id } from "@/constants/shared";
import { doInNormalAsyncInWorker, getFileSize } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  advancedSearchSuggestions,
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Checkbox } from "@/components/Protos/Checkbox";
import { NoItemsHere } from "@/components/Protos/NoItemsHere";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

//million-ignore
export const InstalledFonts = () => {
  const editor = useEditorMaybe();
  const [fonts, setFonts] = useState([]);
  const allfontsRef = useRef([]);
  const [filesWillBeUninstalled, setFilesWillBeUninstalled] = useState([])

  useLiveQuery(async () => {
    const fontsWithCheckedProp = await (await getProjectData()).fonts;

    // for (const key in fontsWithCheckedProp) {
    //   fontsWithCheckedProp[key].checked = false;
    // }
    setFonts(fontsWithCheckedProp);
    allfontsRef.current = fontsWithCheckedProp;
    return fontsWithCheckedProp;
  });
  // const filesWillBeUninstalled = useRef([]);
  const checkedinputsRef = useRef([]);

  /**
   *
   * @param {InputEvent} ev
   */
  const selectAll = (ev) => {
    const checked = filesWillBeUninstalled.length === Object.keys(fonts).length;
    // const checked = ev.target.checked;
    // checkedinputsRef.current.filter(Boolean).forEach((el) => {
    //   el.checked = checked;
    // });
    if (checked) {
      // filesWillBeUninstalled.current = Object.keys(fonts);
      setFilesWillBeUninstalled([])
    } else {
      setFilesWillBeUninstalled(Object.keys(fonts))
    }
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const selectOne = (ev, key) => {
    // const checked = ev.target.checked;
    const checked = filesWillBeUninstalled.includes(key);
    if (checked) {
      // filesWillBeUninstalled.current.push(key);
      const newArr = filesWillBeUninstalled.filter(
        (item) => item != key
      );

      setFilesWillBeUninstalled(newArr);
    } else {
      setFilesWillBeUninstalled([...new Set([...filesWillBeUninstalled, key])])
    }
  };

  const deleteFontFiles = async () => {
    const filesToDelete = filesWillBeUninstalled;
    if (!filesToDelete.length) {
      toast.warn(<ToastMsgInfo msg="Select files to delete" />);
      return;
    }

    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await getProjectData();
    const clone = structuredClone(fonts);

    const toastId = toast.loading(
      <ToastMsgInfo msg={`Deleting ${filesToDelete.length} font files...`} />
    );

    try {
      await doInNormalAsync(async () => {
        await opfs.removeFiles(filesToDelete.map((key) => projectData.fonts[key].path));
        for (const key of filesToDelete) {
          delete clone[key];
        }

        await db.projects.update(projectId, {
          fonts: clone,
        });
      });

      await doInWordpressAsync(async () => {
        const updateConfig = async () => {
          for (const key of filesToDelete) {
            delete clone[key];
          }

          await db.projects.update(projectId, {
            fonts: clone,
          });

          const newProjectData = await getProjectData();
          const wp_update_option_res = await wp_update_option({
            projectId,
            optionName: "inf_config",
            value: newProjectData,
          });
          if (!wp_update_option_res.success) {
            throw new Error(`Failed to update config when delete fonts 😥`);
          }
        };

        const cnfrm = confirm(`Do you want to delete these fonts from the WordPress Media Library?`);
        if (!cnfrm) {
          await updateConfig();
          return;
        }

        const slugs = filesToDelete.map((key) => projectData.fonts[key].slug);
        const wp_deleted_files_res = await wp_delete_media_files_by_slugs({
          projectId,
          slugs,
        });

        if (!wp_deleted_files_res.success) {
          throw new Error(`Failed to delete fonts from WordPress Media Library 😥`);
        }

        await updateConfig();
      });

      setFilesWillBeUninstalled([])
      // checkedinputsRef.current.filter(Boolean).forEach((el) => (el.checked = false));

      toast.update(toastId, {
        render: <ToastMsgInfo msg={`${filesToDelete.length} font files deleted successfully`} />,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });
    } catch (error) {
      console.error("Delete fonts error:", error);
      toast.update(toastId, {
        render: <ToastMsgInfo msg={`Failed to delete fonts: ${error.message}`} />,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const filterFonts = (value = "") => {
    if (!value) {
      setFonts(allfontsRef.current);
      return;
    }
    const clone = structuredClone(fonts);
    const newFilterdFonts = {};
    // Object.keys(clone).forEach((key) => {
    //   if (key.toLowerCase().includes(value.toLowerCase())) {
    //     newFilterdFonts[clone[key].name] = clone[key];
    //   }
    // });
    const newKeys = advancedSearchSuggestions(Object.keys(clone), value);
    newKeys.forEach((key) => {
      newFilterdFonts[clone[key].name] = clone[key];
    });
    setFonts(newFilterdFonts);
  };

  return (
    <section className="flex flex-col h-full gap-2 p-1">
      <header className="sticky top-0 flex justify-between gap-2 mb-2 bg-surface-secondary">
        {/* <h1 className="text-text-primary font-bold px-[60px] py-2   border-b-2 border-b-slate-600 w-fit shrink-0 ">
          Fonts : {Object.keys(fonts || {}).length || undefined}
        </h1> */}

        <FitTitle className="shrink-0 flex items-center justify-center">
          Fonts  {Object.keys(fonts || {}).length && `: ${Object.keys(fonts || {}).length}` || undefined}
        </FitTitle>

        <section className="w-full">
          <Input
            className="w-full bg-surface-tertiary p-1"
            placeholder="Search..."
            onInput={(ev) => {
              filterFonts(ev.target.value);
            }}
          />
        </section>

        {/* <section className="w-fit bg-surface-tertiary rounded-lg px-[20px]  flex items-center gap-2 shrink-0"> */}
        {/* <section className="px-2 border-r-2 border-r-slate-600">
            <input
              id="select-all"
              type="checkbox"
              name="select-all"
              className="cursor-pointer"
              onChange={selectAll}
            />
          </section>
          <label htmlFor="select-all" className="cursor-pointer">
            Select All
          </label> */}
        {/* <h1>Select All</h1> */}
        {/* </section> */}
        <Checkbox title="Select All" className="shrink-0 flex-grow-0" onChange={selectAll} checked={filesWillBeUninstalled.length === Object.keys(fonts).length && Object.keys(fonts).length > 0} />
      </header>

      <main className="overflow-auto flex flex-col gap-2 h-[90%] rounded-lg pr-1">
        {fonts &&
          Object.keys(fonts)?.map((key, i) => {
            return (
              <section
                key={i}
                className="bg-surface-tertiary px-2 py-3 rounded-md flex justify-between items-center"
              >
                <section className="flex gap-2">
                  <section className="border-r-2 border-r-slate-600 px-2 ">
                    <Input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={filesWillBeUninstalled.includes(key)}
                      // ref={(el) => (checkedinputsRef.current[i] = el)}
                      onChange={(ev) => selectOne(ev, key)}
                    />
                  </section>
                  <h1>{key}</h1>
                </section>

                {
                  <FitTitle>
                    {!fonts[key].isCDN
                      ? `${fonts[key].size}MB`
                      : Icons.installAsCDN({
                        fill: "white",
                        strokeColor: "white",
                        arrowStrokeColor: "#2563eb ",
                      })}
                  </FitTitle>
                }
                {/* <section>
                  <button className="cursor-pointer group">{Icons.edite({fill:'white  ', width:23})}</button>
                </section> */}
              </section>
            );
          })}
        {Object.keys(fonts).length === 0 && <NoItemsHere title="No Fonts Installed" />}
      </main>

      <footer className="px-2 py-2 border-t-2 border-t-slate-600">
        <Button onClick={deleteFontFiles}>Delete</Button>
      </footer>
    </section>
  );
};
