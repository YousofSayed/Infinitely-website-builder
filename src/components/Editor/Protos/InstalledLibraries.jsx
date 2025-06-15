import { useLiveQuery } from "dexie-react-hooks";
import React, { memo, useEffect, useRef, useState } from "react";
import { db } from "../../../helpers/db";
import { current_page_id, current_project_id } from "../../../constants/shared";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { InstalledLibraryDetails } from "./InstalledLibraryDetails";
import { MultiTab } from "../../Protos/Multitabs";
import { DetailsNormal } from "../../Protos/DetailsNormal";
import { ReactSortable } from "react-sortablejs";
import { useEditorMaybe } from "@grapesjs/react";
import { InfAccordion } from "../../Protos/InfAccordion";
import { AccordionItem } from "@heroui/accordion";
import Portal from "../Portal";
import { refType } from "../../../helpers/jsDocs";

const ReactSortableComponent = memo(
  ({ libraries = [], prop = "", updateList = (newList, key) => {} }) => {
    const editor = useEditorMaybe();
    return (
      <ReactSortable
        handle=".handle"
        list={libraries[prop].libs}
        setList={(newList) => {
          if (!newList || !newList.length) return;
          updateList(newList, prop);
        }}
        onUpdate={(ev) => {
          editor.load();
        }}
      >
        {libraries[prop]?.libs?.map((lib, x) => (
          <InstalledLibraryDetails library={lib} key={x} dbKey={prop} />
        ))}
      </ReactSortable>
    );
  }
);

export const InstalledLibraries = () => {
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  const refs = useRef([]);
  const [libraries, setLibraries] = useState({});
  const [renderPortals , setRenderPortals ] = useState(false);
  const conatinerRef = useRef(refType);

  useEffect(()=>{
    if(!conatinerRef && !conatinerRef.current)return;
    // console.log('container : ' , conatinerRef , conatinerRef.current , conatinerRef.current.childNodes);
     
    // setRenderPortals(true);

    const getNodes = ()=>{
      setTimeout(()=>{
        const childs = conatinerRef.current.children;
        if(!childs.length){
          getNodes()
        }else{
          setRenderPortals(true)
        }
      },5);
    };
    getNodes()
  },[conatinerRef , conatinerRef.current])

  useLiveQuery(async () => {
    const data = await db.projects.get(projectId);
    // console.log("live query from libs", data, {
    //   jsHeaderLibs: {
    //     libs: data.jsHeaderLibs,
    //     desc: "Header Scripts",
    //   },
    //   jsFooterLibs: {
    //     libs: data.jsFooterLibs,
    //     desc: "Footer Scripts",
    //   },
    //   cssLibs: {
    //     libs: data.cssLibs,
    //     desc: "Styles",
    //   },
    // });

    setLibraries({
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
    });
  });

  const updateList = async (list, key) => {
    if (!list || !key) {
      console.error(`No List Or Key Founded..`);
    }
    console.log("new List : ", list);

    // const data = await db.projects.get(projectId);
    db.projects.update(projectId, {
      [key]: [...list],
    });
  };
  // const [list, setList] = useState(["1", "2", "3", "4"]);

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
    <section  className="px-1 py-2 flex flex-col gap-2 h-full">
      <InfAccordion attributes={{ref:conatinerRef}}>
        {libraries &&
          Object.keys(libraries)?.map((key, i) => {
            return (
              <AccordionItem
                data-accordion-key={key}
                key={i}
                title={libraries[key].desc}
                allowPopupLength={true}
                className="bg-[#1e293b!important] relative"
                classNames={{ content: "bg-slate-800 p-[unset]" }}
                length={libraries[key]?.libs.length}
                slotProps={{
                  transition: {
                    unmountOnExit: true,
                    timeout: 10, // Duration of the animation in milliseconds
                    // easing: 'ease-in-out',
                    // properties: ['height', 'opacity'], // Properties to animate
                  },
                }}
              >
                <ReactSortableComponent
                  libraries={libraries}
                  prop={key}
                  updateList={updateList}
                />
              </AccordionItem>
            );
          })}
      </InfAccordion>

      {!!Object.keys(libraries).length && renderPortals&&
        Object.keys(libraries)?.map((key, i) => {
          return (
            <Portal
              key={i}
              container={ conatinerRef.current.children[i]}
            >
              {/* <h1 className="absolute right-0 top-0">hello</h1> */}
              {!!libraries[key].libs.length && (
                <p className="w-[20px] h-[20px] bg-blue-600 text-slate-200 flex justify-center items-center font-semibold rounded-md absolute right-[30px]  top-[50%] translate-y-[-50%] ">
                  {libraries[key].libs.length}
                </p>
              )}{" "}
            </Portal>
          );
        })}
    </section>
  );
};


