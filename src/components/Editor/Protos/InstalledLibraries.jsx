import { wp_delete_media_files_by_slugs, wp_update_option } from "@/apps/wordpress/functions";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { reloadRequiredInstance } from "@/constants/InfinitelyInstances";
import { current_page_id, current_project_id } from "@/constants/shared";
import { db } from "@/helpers/db";
import { doInNormal, doInNormalAsync, doInWordpressAsync, getProjectData } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { Button } from "@/components/Protos/Button";
import { Checkbox } from "@/components/Protos/Checkbox";
import { DetailsNormal } from "@/components/Protos/DetailsNormal";
import { InfAccordion } from "@/components/Protos/InfAccordion";
import { MultiTab } from "@/components/Protos/Multitabs";
import Portal from "@/components/Editor/Portal";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { InstalledLibraryDetails } from "@/components/Editor/Protos/InstalledLibraryDetails";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep } from "lodash";
import React, { memo, useEffect, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { toast } from "react-toastify";

// 
// 
















const ReactSortableComponent = memo(
  ({ libraries = {}, prop = "", updateList = (newList, key) => { } }) => {
    const [selected, setSelected] = useState([]);
    const [checkedAll, setCheckedAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const libs = libraries[prop].libs;
    // const editor = useEditorMaybe();

    const deleteLibraries = async () => {
      const cnfrm = confirm(`Are you sure to delete selected libraries ? 🤔`);
      if (!cnfrm) return;
      setIsDeleting(true);
      const tid = toast.loading(<ToastMsgInfo msg={`Deleting selected libraries...`} />);
      try {
        const projectId = +localStorage.getItem(current_project_id);
        // const project = await await db.projects.get(projectId);
        // const data = project;
        const newArr = libs.filter((lib) => !(selected.some(slLib => slLib.name === lib.name)));
        console.log('new arr selected: ', newArr);
        const libsPathes = selected.map(lib => lib.path);
        const libsTypesPathes = selected.map(lib => lib.typesPath).filter(Boolean);
        const slugs = selected.map(lib => lib.slug);

        const deleteLibFromDB = async () => {
          await opfs.removeFiles([
            ...libsPathes,
            ...libsTypesPathes,
          ]);
          await db.projects.update(projectId, {
            [prop]: newArr,
          });
        };

        await doInNormalAsync(async () => {
          await deleteLibFromDB();
        })

        await doInWordpressAsync(async () => {
          const projecdData = await getProjectData();
          const cnfrm = confirm(`Do you want to delete those libraries from media library too ? 🤔`);
          if (cnfrm) {
            const wp_delete_file_res = await wp_delete_media_files_by_slugs({
              projectId,
              slugs,
            });

            if (!wp_delete_file_res.success) {
              console.error(wp_delete_file_res);
              throw new Error(`Faild to delete libraries 😥`);
            }
          }

          projecdData[prop] = newArr;
          const wp_update_option_res = await wp_update_option({
            projectId,
            optionName: 'inf_config',
            value: projecdData,
          });

          if (!wp_update_option_res?.success) {
            console.error(wp_update_option_res);
            throw new Error(`Faild to delete library 😥`);
          }

          await deleteLibFromDB();
        })

        toast.done(tid);
        toast.success(<ToastMsgInfo msg={"Library Removed Successfully"} />);
        reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });
      } catch (error) {
        toast.dismiss(tid);
        toast.error(<ToastMsgInfo msg={"Faild To Remove Library"} />);
        throw new Error(`Error From Installed Library Details Cmp ${error}`);
      } finally {
        setCheckedAll(false);
        setIsDeleting(false);
      }
    };

    const selectAll = () => {
      console.log(cloneDeep(libs));
      if (checkedAll) {
        setSelected([]);
      } else {
        setSelected(cloneDeep(libs));
      }
    }

    useEffect(() => {
      setCheckedAll(selected.length === libs.length);
    }, [selected])

    return (
      <section className={`${isDeleting && 'cursor-not-allowed pointer-events-none'}`}>
        {Boolean(libs.length) && <header className="flex items-center justify-between p-2 rounded-lg bg-surface-secondary">
          <section className="flex items-center gap-2">


            <Checkbox checked={checkedAll} title="select all" onChange={() => { selectAll() }} />

            <FitTitle className="flex items-center gap-2 capitalize bg-surface-tertiary">
              selected : {selected.length}

            </FitTitle>
          </section>

          <section>
          </section>

          <section>
            <Button className="bg-surface-tertiary hover:bg-[crimson] transition-colors font-semibold"
              onClick={async () => {
                await deleteLibraries();
              }}
            >
              {Icons.trash('white')}
              Delete
            </Button>
          </section>
        </header>}

        {!Boolean(libs.length) && <section className="capitalize p-2 rounded-lg font-semibold text-2xl text-blue-300 flex justify-center items-center animate-pulse bg-surface-secondary">Nothing here 😪</section>}

        <ReactSortable
          handle=".handle"
          list={libraries[prop].libs}
          setList={(newList) => {
            if (!newList || !newList.length) return;
            updateList(newList, prop);
          }}
          onUpdate={(ev) => {
            // editor.load();
            doInNormal(() => {
              reloadRequiredInstance.emit(InfinitelyEvents.editor.require, { state: true });

            })
          }}
        >
          {libraries[prop]?.libs?.map((lib, x) => (
            <InstalledLibraryDetails library={lib} key={x} dbKey={prop} selected={selected} setSelected={setSelected} />
          ))}
        </ReactSortable>
      </section>
    );
  }
);

export const InstalledLibraries = () => {
  const projectId = +localStorage.getItem(current_project_id);
  const [libraries, setLibraries] = useState({});
  const conatinerRef = useRef(refType);
  const [scriptsNeedToPublish, setScriptsNeedToPublish] = useState(false);
  


  useLiveQuery(async () => {
    const data = await db.projects.get(projectId);

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

    setScriptsNeedToPublish(data?.scripts_need_arranged);
  });

  const updateList = async (list, key) => {
    if (!list || !key) {
      console.error(`No List Or Key Founded..`);
    }
    console.log("new List : ", list);

    // const data = await db.projects.get(projectId);
    await doInNormalAsync(async () => {
      await db.projects.update(projectId, {
        [key]: [...list],
      });
    });

    await doInWordpressAsync(async () => {
      const projecdData = await getProjectData();
      const scripts_need_arranged = JSON.stringify(projecdData[key]) !== JSON.stringify(list);
      await db.projects.update(projectId, {
        [key]: [...list],
        scripts_need_arranged ,
      });
    })
  };

  const saveOrders = async () => {
    const tid = toast.loading(<ToastMsgInfo msg={`Saving orders...`} />);

    try {
      const projectData = await getProjectData();
      const wp_update_config_res = await wp_update_option({
        projectId,
        optionName: 'inf_config',
        value: projectData
      });
      if (!wp_update_config_res?.success) {
        throw new Error(`Faild to save orders 😥`);
      }
       await db.projects.update(projectId, {
        scripts_need_arranged : false,
      });
      toast.done(tid);
      toast.success(<ToastMsgInfo msg={`Orders saved successfully 😎`} />);
    } catch (error) {
      toast.dismiss(tid);
      toast.error(<ToastMsgInfo msg={error.message || 'Faild to save orders'} />);
      throw new Error(error);
    }

  }
  // const [list, setList] = useState(["1", "2", "3", "4"]);



  return (
    <section className="relative flex flex-col gap-2 h-full w-full rounded-lg">
      <section className="relative overflow-y-auto overflow-x-hidden hideScrollBar px-1  py-2 flex flex-col gap-2 h-full ">

        <Accordion attributes={{ ref: conatinerRef }}>
          {libraries &&
            Object.keys(libraries)?.map((key, i) => {
              return (
                <AccordionItem
                  // data-accordion-key={key}

                  key={i}
                  title={libraries[key].desc}
                  allowPopupLength
                  // className="bg-[var(--color-surface-tertiary)!important] relative"
                  // classNames={{ content: "bg-surface-tertiary p-[unset]" }}
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
        </Accordion>
        {scriptsNeedToPublish && <Button className="w-fit sticky bottom-[0] right-[5px] font-semibold capitalize" onClick={async () => {
          await saveOrders()
        }}>Save orders</Button>}
      </section>

    </section>
  );
};

// {!!Object.keys(libraries).length && renderPortals&&
//         Object.keys(libraries)?.map((key, i) => {
//           return (
//             <Portal
//               key={i}
//               container={ conatinerRef.current.children[i]}
//             >
//               {/* <h1 className="absolute right-0 top-0">hello</h1> */}
//               {!!libraries[key].libs.length && (
//                 <p className="w-[20px] h-[20px] bg-brand-primary text-text-primary flex justify-center items-center font-semibold rounded-md absolute right-[30px]  top-[50%] translate-y-[-50%] ">
//                   {libraries[key].libs.length}
//                 </p>
//               )}{" "}
//             </Portal>
//           );
//         })}
