import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../../helpers/db";
import {
  advancedSearchSuggestions,
  getProjectData,
} from "../../../helpers/functions";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { current_project_id } from "../../../constants/shared";
import { Input } from "./Input";
import { useEditorMaybe } from "@grapesjs/react";
import { FitTitle } from "./FitTitle";
import { getFileSize } from "../../../helpers/bridge";
import { reloadRequiredInstance } from "../../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";

//million-ignore
export const InstalledFonts = () => {
  const editor = useEditorMaybe();
  const [fonts, setFonts] = useState([]);
  const allfontsRef = useRef([]);

  useLiveQuery(async () => {
    const fontsWithCheckedProp = await (await getProjectData()).fonts;

    // for (const key in fontsWithCheckedProp) {
    //   fontsWithCheckedProp[key].checked = false;
    // }
    setFonts(fontsWithCheckedProp);
    allfontsRef.current = fontsWithCheckedProp;
    return fontsWithCheckedProp;
  });
  const filesWillBeUninstalled = useRef([]);
  const checkedinputsRef = useRef([]);

  /**
   *
   * @param {InputEvent} ev
   */
  const selectAll = (ev) => {
    const checked = ev.target.checked;
    checkedinputsRef.current.forEach((el) => {
      el.checked = checked;
    });
    if (checked) {
      filesWillBeUninstalled.current = Object.keys(fonts);
    } else {
      filesWillBeUninstalled.current = [];
    }
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const selectOne = (ev, key) => {
    const checked = ev.target.checked;
    if (checked) {
      filesWillBeUninstalled.current.push(key);
    } else {
      const newArr = filesWillBeUninstalled.current.filter(
        (item) => item != key
      );

      filesWillBeUninstalled.current = newArr;
    }
  };

  const deleteFontFiles = async () => {
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await getProjectData();
    const clone = structuredClone(fonts);

    for (const key of filesWillBeUninstalled.current) {
      delete clone[key];
    }

    await db.projects.update(projectId, {
      fonts: clone,
    });

    // editor.load();
    reloadRequiredInstance.emit(InfinitelyEvents.editor.require, {state:true});
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
      <header className="sticky top-0 flex justify-between gap-4 mb-2 bg-slate-900">
        {/* <h1 className="text-slate-200 font-bold px-[60px] py-2   border-b-2 border-b-slate-600 w-fit flex-shrink-0 ">
          Fonts : {Object.keys(fonts || {}).length || undefined}
        </h1> */}

        <FitTitle className="flex-shrink-0 flex items-center justify-center">
          Fonts : {Object.keys(fonts || {}).length || undefined}
        </FitTitle>

        <section className="w-full">
          <Input
            className="w-full bg-slate-800 p-1"
            placeholder="Search..."
            onInput={(ev) => {
              filterFonts(ev.target.value);
            }}
          />
        </section>

        <section className="w-fit bg-slate-800 rounded-lg px-[20px]  flex items-center gap-2 flex-shrink-0">
          <section className="px-2 border-r-2 border-r-slate-600">
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
          </label>
          {/* <h1>Select All</h1> */}
        </section>
      </header>

      <main className="overflow-auto flex flex-col gap-2 h-[90%] rounded-lg pr-1">
        {fonts &&
          Object.keys(fonts)?.map((key, i) => {
            return (
              <section
                key={i}
                className="bg-slate-800 px-2 py-3 rounded-md flex justify-between items-center"
              >
                <section className="flex gap-2">
                  <section className="border-r-2 border-r-slate-600 px-2 ">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      ref={(el) => (checkedinputsRef.current[i] = el)}
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
      </main>

      <footer className="p-2 border-t-2 border-t-slate-600">
        <Button onClick={deleteFontFiles}>Delete</Button>
      </footer>
    </section>
  );
};
