import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";
import { db } from "../../../helpers/db";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { InstalledLibraryDetails } from "./InstalledLibraryDetails";
import { MultiTab } from "../../Protos/Multitabs";
import { DetailsNormal } from "../../Protos/DetailsNormal";
import { ReactSortable } from "react-sortablejs";
import { useEditorMaybe } from "@grapesjs/react";

export const InstalledLibraries = () => {
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const libraries = useLiveQuery(async () => {
    const data = await db.projects.get(projectId);
    return await {
      jsHeaderLibs: {
        libs: data.jsHeaderLibs,
        desc: "Header Scripts",
      },
      jsFooterLibs: {
        libs: data.jsFooterLibs,
        desc: "Footer Scripts",
      },
      cssLibs: {
        libs: data.cssLibs,
        desc: "Styles",
      },
      // jsFooterLocalLibraries: {
      //   libs: data.jsFooterLocalLibraries,
      //   desc: "Footer Scripts (Local)",
      // },
      // cssHeaderCDNLibraries: {
      //   libs: data.cssHeaderCDNLibraries,
      //   desc: "Header Styles (CDN)",
      // },
      // cssHeaderLocalLibraries: {
      //   libs: data.cssHeaderLocalLibraries,
      //   desc: "Header Styles (Local)",
      // },
      // cssFooterCDNLibraries: {
      //   libs: data.cssFooterCDNLibraries,
      //   desc: "Footer Styles (CDN)",
      // },
      // cssFooterLocalLibraries: {
      //   libs: data.cssFooterLocalLibraries,
      //   desc: "Footer Styles (Local)",
      // },
    };
  });

  const updateList = async (list, key) => {
    if (!list || !key) {
      console.error(`No List Or Key Founded..`);
    }
    console.log("new List : ", list);

    const data = await db.projects.get(projectId);
    db.projects.update(projectId, {
      [key]: [...list],
    });
  };
  const [list, setList] = useState(["1", "2", "3", "4"]);

  useEffect(() => {
    console.log("list : ", list);
  }, [list]);

  useEffect(() => {
    const windowHandler = () => {
      console.log(scroll);
    };

    window.addEventListener("slotchange", windowHandler);
    return () => {
      window.removeEventListener("slotchange", windowHandler);
    };
  });

  /**
   *
   * @param {import('../../../helpers/types').LibraryConfig} library
   */
  const deleteLibrary = async (library) => {
    const data = await (await db.projects.get(projectId)).data;
    const librariesArray = library.isLocal
      ? data.jsLocalLibraries
      : data.jsCDNLibraries;
    const newArr = librariesArray.filter(
      (jsLibrary) => jsLibrary.id != library.id
    );
  };

  return (
    <section className="px-1 py-2 flex flex-col gap-2">
      {/* <DetailsNormal
        defaultValue={"Lol"}
        className="p-2 bg-slate-800 rounded-lg select-none"
      >
        <summary>Header Scripts (Local)</summary>
        {libraries?.jsHeaderLocalLibraries.map((lib, i) => (
          <InstalledLibraryDetails
            library={lib}
            key={i}
            dbKey="jsHeaderLocalLibraries"
          />
        ))}
      </DetailsNormal> */}
      {/* 
      <DetailsNormal label={"Test"}>
        <ReactSortable list={list} setList={setList}>
          {
            list.map(item=><p className="text-slate-200 p-2 bg-slate-900 rounded-lg">{item}</p>)
          }
        </ReactSortable>
      </DetailsNormal> */}

      {libraries &&
        Object.keys(libraries)?.map((key, i) => {
          return (
            <DetailsNormal
              key={i}
              label={libraries[key].desc}
              allowPopupLength={true}
              length={libraries[key]?.libs.length}
            >
              <ReactSortable
                handle=".handle"
                list={libraries[key].libs}
                setList={(newList) => {
                  if (!newList || !newList.length) return;
                  updateList(newList, key);
                }}
                onUpdate={(ev) => {
                  editor.load();
                }}
              >
                {libraries[key]?.libs?.map((lib, x) => (
                  <InstalledLibraryDetails library={lib} key={x} dbKey={key} />
                ))}
              </ReactSortable>
            </DetailsNormal>
          );
        })}

      {/* <DetailsNormal label={"Header Scripts (Local)"}>
        <ReactSortable
          list={libraries?.jsHeaderLocalLibraries}
          setList={(newList) => {
            updateList(newList, "jsHeaderLocalLibraries");
          }}
        >
          {libraries?.jsHeaderLocalLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="jsHeaderLocalLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Header Scripts (CDN)"}>
        <ReactSortable
          list={libraries?.jsHeaderCDNLibraries}
          setList={(newList) => {
            updateList(newList, jsHeaderCDNLibraries);
          }}
        >
          {libraries?.jsHeaderCDNLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="jsHeaderCDNLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Footer Scripts (Local)"}>
        <ReactSortable
          list={libraries?.jsFooterLocalLibraries}
          setList={(newList) => {
            updateList(newList, "jsFooterLocalLibraries");
          }}
        >
          {libraries?.jsFooterLocalLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="jsFooterLocalLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Footer Scripts (Local)"}>
        <ReactSortable
          list={libraries?.jsFooterCDNLibraries}
          setList={(newList) => {
            updateList(newList, "jsFooterCDNLibraries");
          }}
        >
          {libraries?.jsFooterCDNLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="jsFooterCDNLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Header Styles (Local)"}>
        <ReactSortable
          list={libraries?.cssHeaderLocalLibraries}
          setList={(newList) => {
            updateList(newList, "cssHeaderLocalLibraries");
          }}
        >
          {libraries?.cssHeaderLocalLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="cssHeaderLocalLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Header Styles (CDN)"}>
        <ReactSortable
          list={libraries?.cssHeaderCDNLibraries}
          setList={(newList) => {
            updateList(newList, "cssHeaderCDNLibraries");
          }}
        >
          {libraries?.cssHeaderCDNLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="cssHeaderCDNLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Footer Styles (Local)"}>
        <ReactSortable
          list={libraries?.cssFooterLocalLibraries}
          setList={(newList) => {
            updateList(newList, "cssFooterLocalLibraries");
          }}
        >
          {libraries?.cssFooterLocalLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              dbKey="cssFooterLocalLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal>

      <DetailsNormal label={"Footer Styles (Local)"}>
        <ReactSortable
          list={libraries?.cssFooterCDNLibraries}
          setList={(newList) => {
            updateList(newList, "cssFooterCDNLibraries");
          }}
        >
          {libraries?.cssFooterCDNLibraries.map((lib, i) => (
            <InstalledLibraryDetails
              library={lib}
              key={i}
              dbKey="cssFooterCDNLibraries"
            />
          ))}
        </ReactSortable>
      </DetailsNormal> */}

      {/* <MultiTab
        tabs={[
          {
            title: "Scripts",
            content: (
              <section className="flex flex-col gap-2">
                <DetailsNormal label={"Header Scripts (Local)"}>
                  {libraries?.jsHeaderLocalLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="jsHeaderLocalLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Header Scripts (CDN)"}>
                  {libraries?.jsHeaderCDNLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="jsHeaderCDNLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Footer Scripts (Local)"}>
                  {libraries?.jsFooterLocalLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="jsFooterLocalLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Footer Scripts (Local)"}>
                  {libraries?.jsFooterCDNLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="jsFooterCDNLibraries"
                    />
                  ))}
                </DetailsNormal>
              </section>
            ),
          },

          {
            title: "Styles",
            content: (
              <section className="flex flex-col gap-2">
                <DetailsNormal label={"Header Styles (Local)"}>
                  {libraries?.cssHeaderLocalLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="cssHeaderLocalLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Header Styles (CDN)"}>
                  {libraries?.cssHeaderCDNLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="cssHeaderCDNLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Footer Styles (Local)"}>
                  {libraries?.cssFooterLocalLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      dbKey="cssFooterLocalLibraries"
                    />
                  ))}
                </DetailsNormal>

                <DetailsNormal label={"Footer Styles (Local)"}>
                  {libraries?.cssFooterCDNLibraries.map((lib, i) => (
                    <InstalledLibraryDetails
                      library={lib}
                      key={i}
                      dbKey="cssFooterCDNLibraries"
                    />
                  ))}
                </DetailsNormal>
              </section>
            ),
          },
        ]}
      /> */}
    </section>
  );
};
