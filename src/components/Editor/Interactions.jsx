import React, { useEffect, useRef, useState } from "react";
import {
  interactionInDBType,
  interactionsType,
  interactionType,
  refType,
} from "../../helpers/jsDocs";
import { Select } from "./Protos/Select";
import { eventNames } from "../../constants/hsValues";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteAttributesInAllPages,
  downloadFile,
  getProjectData,
  getProjectSettings,
  preventSelectNavigation,
  setInteractionsAttributes,
  store,
  updatePrevirePage,
  workerCallbackMaker,
} from "../../helpers/functions";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import {
  current_page_id,
  current_project_id,
  interactionId,
  interactionInstanceId,
  mainInteractionId,
} from "../../constants/shared";
import { cloneDeep, isPlainObject, random, uniqueId } from "lodash";
import {
  addClickClass,
  parse,
  pushBetween,
  stringify,
  uniqueID,
} from "../../helpers/cocktail";
import { db } from "../../helpers/db";
import { infinitelyWorker } from "../../helpers/infinitelyWorker";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { FitTitle } from "./Protos/FitTitle";
import { Input } from "./Protos/Input";
import { actions } from "../../constants/actions";
import { MiniTitle } from "./Protos/MiniTitle";
import { SwitchButton } from "../Protos/SwitchButton";
// import { InfAccordion } from "../Protos/InfAccordion";
// import { AccordionItem } from "@heroui/accordion";
import { keyframesGetterWorker } from "../../helpers/defineWorkers";
import { ScrollableToolbar } from "../Protos/ScrollableToolbar";
import { Accordion } from "../Protos/Accordion";
import { AccordionItem } from "../Protos/AccordionItem";
import { Button } from "../Protos/Button";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { OptionsButton } from "../Protos/OptionsButton";
import { Tooltip } from "react-tooltip";
import { buildInteractionsAttributes } from "../../helpers/bridge";

const actionsKeywords = actions.map((action) => action.label);
const advancedParse = (value) => {
  // console.log("before parse value : ", value);

  try {
    return JSON.parse(value); // new Function(`return ${value}`)();
  } catch (error) {
    return value == undefined ? `undefined` : `\`${value}\``;
  }
};
const viewEvents = ["enterview", "leaveview", "view"];

export const Interaction = ({
  interactions = interactionsType,
  setInteractions = () => {},
  setInteractionsId = () => {},
  interaction = interactionType,
  id,
  index,
}) => {
  const editor = useEditorMaybe();
  const [actionName, setActionName] = useState("");
  const [autoAnimateRef] = useAutoAnimate();
  const sendToKeyframesGetterWorker = ({ data }) => {
    /**
     * @type {{command:string , props : import('css').KeyFrames[]}}
     */
    const { command, props } = data;
    if (data.command == "getKeyFrames") {
      // setLoad(false);
      // console.log(
      //   "props : ",
      //   Object.entries(props).flatMap(([path, animes]) =>
      //     animes.map((anim) => ({ ...anim, path }))
      //   )
      // );

      console.log(props);
      const keyFrameNames = props.map((kfrm) => kfrm.name).filter(Boolean);
      const clone = structuredClone(interactions);

      for (const interaction of clone) {
        for (const action of interaction.actions) {
          for (const [key, value] of Object.entries(action.access)) {
            if (value.keyframes) {
              action.params[key] = {
                type: "select",
                keywords: keyFrameNames,
              };
            }
          }
        }
      }

      setInteractions(clone);
    }
  };

  /**
   *
   * @returns {Promise<string[]>}
   */
  const getKeyFrames = async () => {
    keyframesGetterWorker.postMessage({
      command: "getKeyFrames",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        pageName: localStorage.getItem(current_page_id),
        editorCss: editor.getCss({
          keepUnusedStyles: false,
          avoidProtected: true,
        }),
      },
    });

    return new Promise((res, rej) => {
      const reciver = ({ data }) => {
        /**
         * @type {{command:string , props : import('css').KeyFrames[]}}
         */
        const { command, props } = data;
        if (data.command == "getKeyFrames") {
          console.log(props);
          const keyFrameNames = props.map((kfrm) => kfrm.name).filter(Boolean);
          res(keyFrameNames);
        }
      };

      keyframesGetterWorker.addEventListener("message", reciver, {
        once: true,
      });
    });

    // return () => {
    //   keyframesGetterWorker.removeEventListener(
    //     "message",
    //     sendToKeyframesGetterWorker
    //     // { once: true }
    //   );
    // };

    // console.log(animes, animationsReady, Object.values(animes));
  };

  // useEffect(() => {
  //   if (!editor) return;
  //   const cleaner = getKeyFrames();
  //   return () => {
  //     cleaner();
  //   };
  // }, [editor]);

  const addAction = async (actionName = "") => {
    // if (interaction.actions.some((action) => action.label == actionName)) {
    //   toast.warn(<ToastMsgInfo msg={`You already use this action...!`} />);
    //   return;
    // }
    const actionTarget = actions.find(
      (action) => action.label.toLowerCase() == actionName.toLowerCase()
    );
    if (actionTarget) {
      const clone = cloneDeep(interactions);
      const newActions = [...clone[index].actions, actionTarget];
      clone[index].actions = newActions;
      for (const action of actions) {
        for (const [key, value] of Object.entries(action?.access || {})) {
          if (value.keyframes) {
            action.params[key] = {
              type: "select",
              keywords: await getKeyFrames(),
            };
          }
        }
      }
      setInteractions(clone);
      const sle = editor.getSelected();
      // const functionsFromParams = buildFunctionsFromActions(newActions);
      // sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
    } else {
      toast.warn(<ToastMsgInfo msg={`Action not founded!`} />);
    }
    setActionName("");
  };

  const addValueToActionParam = (key = "", value = "", actionIndex) => {
    if (!key) {
      throw new Error(`No key Founded!`);
    }
    if (actionIndex == undefined) {
      throw new Error(`Action index not founded!`);
    }
    // console.log(parse(value) , stringify(value) , advancedParse(value));

    const clone = cloneDeep(interactions);
    console.log(
      clone[index].actions[actionIndex].params[key],
      clone[index].actions[actionIndex].params,
      key,
      value
    );

    if (isPlainObject(clone[index].actions[actionIndex].params[key])) {
      clone[index].actions[actionIndex].params[key].value = value; //advancedParse(value);
    } else {
      clone[index].actions[actionIndex].params[key] = value; //advancedParse(value);
    }

    const sle = editor.getSelected();
    // const functionsFromParams = buildFunctionsFromActions(clone[0].actions);
    // console.log(`functionsFromParams : `, functionsFromParams);

    // sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
    setInteractions(clone);
  };

  const deleteAction = (actionIndex) => {
    const clone = cloneDeep(interactions);
    clone[index].actions.splice(actionIndex, 1);
    const sle = editor.getSelected();
    // const functionsFromParams = buildFunctionsFromActions(clone[index].actions);
    // // editor.getWrapper().find(`[${interactionId}="${id}"]`).forEach(cmp=>cmp.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams }))
    // sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
    console.log("actions delted");

    setInteractions(clone);
  };

  const deleteInteraction = () => {
    const clone = structuredClone(interactions);
    clone.splice(index, 1);
    const sle = editor.getSelected();
    editor
      .getWrapper()
      .find(`[${interactionId}="${id}"]`)
      .forEach((cmp) => {
        cmp.removeAttributes([`v-on:${interaction.event}`]);
        const viewAttrs = Object.keys(cmp.getAttributes()).filter((key) =>
          viewEvents.includes(key.replace(/v-on:|@/gi, ""))
        );
        console.log("attttttttrs : ", viewAttrs);

        if (!viewAttrs.length) {
          cmp.removeAttributes([`v-view`], { avoidStore: true });
        }
      });

    // console.log(clone  , 'cloooooooooone',);

    if (!clone.length) {
      console.log(
        "id is : ",
        id,
        editor.getWrapper().find(`[${interactionId}="${id}"]`)
      );

      editor
        .getWrapper()
        .find(`[${interactionId}="${id}"]`)
        .forEach((cmp) => cmp.removeAttributes([interactionId]));
      setInteractionsId("");
    }
    setInteractions(clone);
    // sle.removeAttributes([`v-on:${interaction.event}`]);
  };

  /**
   *
   * @param {import('../../helpers/types').Actions} actions
   */
  const buildFunctionsFromActions = (actions) => {
    // console.log(actions);

    const functionsFromParams = actions
      .map(
        (action) =>
          `${action.function}(${Object.values(action.params)
            .map((value) => {
              value = isPlainObject(value) ? value.value : value;
              value = advancedParse(value);
              console.log("value", value);
              return typeof value == "string"
                ? value.replaceAll(`self`, `[${interactionId}="${id}"]`)
                : value;
            })
            .join(",")})`
      )
      .join(";");

    // console.log('functionsFromParams' , functionsFromParams);

    return functionsFromParams;
  };

  const pasteAction = (action = "") => {
    const parsedAction = parse(action);
    if (!(parsedAction && parsedAction?.name && parsedAction?.function)) {
      toast.error(<ToastMsgInfo msg={`Invalid action!`} />);
      return;
    }
    const clone = structuredClone(interactions);
    clone[index].actions.push(parsedAction);
    setInteractions(clone);
  };

  return (
    <section
      ref={autoAnimateRef}
      className="flex flex-col gap-2 p-1 bg-slate-950 rounded-lg"
    >
      <header className="flex flex-col gap-2">
        {/* <section className="flex gap-2 justify-between ">
          <FitTitle className="flex-shrink-0 w-full flex gap-2 items-center justify-between bg-slate-800">
            <div className="flex-shrink-0 ">Interaction ID </div>
            <div className="text-slate-200 custom-font-size font-bold flex items-center p-2 justify-end w-full bg-slate-800 rounded-lg max-w-[50%]">
              {interaction.id}
            </div>
          </FitTitle>
        </section> */}

        <section className="flex gap-2 justify-between ">
          <MiniTitle className=" w-full  flex gap-2 justify-center items-center">
            {interaction.event}
          </MiniTitle>
          <SmallButton
            tooltipTitle="Copy Interaction"
            onClick={async (ev) => {
              await navigator.clipboard.writeText(JSON.stringify(interaction));
              toast.success(
                <ToastMsgInfo msg={`Interaction copied successfully👍`} />
              );
            }}
          >
            {Icons.copy({ fill: "white" })}
          </SmallButton>
          <SmallButton
            onClick={() => {
              deleteInteraction();
            }}
            className="bg-slate-800 hover:bg-[crimson!important] [&:hover_path]:stroke-white"
            tooltipTitle="Delete Interaction"
          >
            {Icons.trash("white")}
          </SmallButton>
        </section>

        <section className="flex gap-2 justify-between">
          <Select
            value={actionName}
            setValue={setActionName}
            placeholder="Add Action"
            keywords={actionsKeywords}
            onEnterPress={(value) => {
              addAction(value);
            }}
            onItemClicked={(value) => {
              addAction(value);
            }}
          />
          <SmallButton
            tooltipTitle="Paste Action"
            onClick={async () => {
              pasteAction(await navigator.clipboard.readText());
              toast.success(
                <ToastMsgInfo msg={`Action pasted successfully👍`} />
              );
            }}
          >
            {Icons.paste({})}
          </SmallButton>
          <SmallButton
            tooltipTitle="Add Action"
            onClick={() => {
              addAction(actionName);
            }}
          >
            {Icons.plus("white")}
          </SmallButton>
        </section>
      </header>

      {interaction.actions.map((action, i) => {
        return (
          <section
            className="flex flex-col gap-2 p-1 bg-slate-800 rounded-lg"
            key={i}
          >
            <ScrollableToolbar>
              <header className="w-full flex gap-2 justify-between">
                <MiniTitle className={` custom-font-size w-full flex-grow-0`}>
                  {action.label}
                </MiniTitle>
                <section className="rounded-lg flex gap-2">
                  <SmallButton
                    className="bg-slate-900"
                    tooltipTitle="Copy Action"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        JSON.stringify(action)
                      );
                      toast.success(
                        <ToastMsgInfo msg={`Action copied successfully👍`} />
                      );
                    }}
                  >
                    {Icons.copy({ fill: "white" })}
                  </SmallButton>
                  <SmallButton
                    onClick={() => {
                      deleteAction(i);
                    }}
                    className="h-full bg-slate-900 hover:bg-[crimson!important] [&:hover_path]:stroke-white"
                    tooltipTitle="Delete Action"
                  >
                    {Icons.trash("white")}
                  </SmallButton>{" "}
                </section>
              </header>
            </ScrollableToolbar>

            {Object.entries(action.params).map(([key, value], paramIndex) => {
              return (
                <section key={paramIndex} className="flex flex-col gap-2">
                  <FitTitle>{key}</FitTitle>

                  {isPlainObject(value) ? (
                    value.type == "select" ? (
                      <Select
                        className="p-[unset]"
                        keywords={value.keywords}
                        value={value.value}
                        placeholder={key}
                        onAll={(value) => {
                          addValueToActionParam(key, value, i);
                        }}
                      />
                    ) : value.type == "switch" ? (
                      <div className="flex justify-between  gap-2 p-2 bg-slate-900 rounded-lg items-center">
                        <p className="text-slate-400 capitalize">{key}</p>
                        <SwitchButton
                          className="p-[unset]"
                          defaultValue={parse(value.value)}
                          placeholder={key}
                          onSwitch={(value) => {
                            console.log("switch : ", key, stringify(value), i);

                            addValueToActionParam(key, stringify(value), i);
                          }}
                          // onUnActive={(value) => {
                          //   addValueToActionParam(key, stringify(value), i);
                          // }}
                        />
                      </div>
                    ) : null
                  ) : (
                    <Input
                      required
                      value={value}
                      placeholder={key}
                      className="bg-slate-900"
                      onInput={(ev) => {
                        addValueToActionParam(key, ev.target.value, i);
                      }}
                    />
                  )}
                </section>
              );
            })}
          </section>
        );
      })}
    </section>
  );
};

export const Interactions = () => {
  const [interactionsState, setInteractions] = useState(interactionsType);
  const [interactionsId, setInteractionsId] = useState("");
  const [isInstance, setIsInstance] = useState(false);
  const [editeAsMain, setEditeAsMain] = useState(true);
  const [mainId, setMainId] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [interactionsIds, setInteractionsIds] = useState([]);
  const [selectedInteractionId, setSelectedInteractionId] = useState("");
  const [eventName, setEventName] = useState("");
  const selectedEl = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const [autoAnimateRef] = useAutoAnimate();
  const [autoAnimateHeaderRef] = useAutoAnimate();
  const interactionUploader = useRef(refType);
  const projectId = +localStorage.getItem(current_project_id);
  const timeout = useRef(null);

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    setInteractionsIds(Object.keys(projectData.interactions) || []);
  });

  useEffect(() => {
    if (!selectedEl) return;
    if (!editor) return;
    if (!editor.getSelected()) return;
    // getAndSetIdHandle();
    const sle = editor.getSelected();
    const handler = async () => {
      const sle = editor.getSelected();
      const attributes = sle.getAttributes();
      const intersectionIdAttr =
        attributes[interactionId] || attributes[mainInteractionId];
      const instanceAttr = attributes[interactionInstanceId];
      setMainId(intersectionIdAttr);
      setInstanceId(instanceAttr);
      setIsInstance(Boolean(instanceAttr));
      setEditeAsMain(!Boolean(instanceAttr));
      if (!intersectionIdAttr) {
        setInteractions([]);
        setInteractionsId(intersectionIdAttr);
      } else {
        const projectData = await getProjectData();
        console.log("elseeee", projectData.interactions[intersectionIdAttr]);
        setInteractions(projectData.interactions[intersectionIdAttr]);
        setInteractionsId(intersectionIdAttr);
        setMainId(intersectionIdAttr);
      }
    };
    handler();
    const eventHandler = (model, updatedAttributes, others) => {
      console.log(`updatedAttributes : `, updatedAttributes, others);

      if (
        !Object.keys(updatedAttributes).some(
          (key) => key == interactionId || key == mainInteractionId
        )
      )
        return;
      handler();
    };

    // sle.on("change:attributes", eventHandler);
    // return () => {
    //   sle.off("change:attributes", eventHandler);
    // };
  }, [selectedEl, editor]);

  useEffect(() => {
    if (!editor) return;
    if (mainId && Array.isArray(interactionsState)) {
      (async () => {
        const projectData = await getProjectData();
        // const allInteractions = {
        //   ...(projectData?.interactions || {}),
        //   [mainId]: interactionsState,
        // };
        // console.log(allInteractions);

        const { projectSettings } = getProjectSettings();
        const originalAutosave = projectSettings.enable_auto_save;
        editor.Storage.setAutosave(false);
        const allSameInteractionsCmps = editor
          .getWrapper()
          .find(
            `[${interactionId}="${mainId}"] , [${mainInteractionId}="${mainId}"]`
          );
        for (const cmp of allSameInteractionsCmps) {
          // if (editor.getSelected() == cmp) continue;
          const attributes = cmp.getAttributes();
          const instanceId = attributes[interactionInstanceId];
          const isInstance = Boolean(instanceId);
          const newInteractionsAttributes = buildInteractionsAttributes(
            interactionsState,
            isInstance ? instanceId : mainId,
            isInstance
          );
          cmp.addAttributes(newInteractionsAttributes);
          // for (const interaction of interactionsState) {
          //   cmp.addAttributes({
          //     [`v-on:${interaction.event}`]: buildFunctionsFromActions(
          //       interaction.actions
          //     ),
          //     ...(viewEvents.includes(interaction.event)
          //       ? { ["v-view"]: true }
          //       : {}),
          //   });
          // }
        }

        workerCallbackMaker(infinitelyWorker, "updateDB", () => {
          setInteractionsAttributes(interactionsId, async () => {
            console.log("doneeeeeeeeeeeeeeeeeee", originalAutosave);
            // alert("kokokokoo");
            // projectSettings.enable_auto_save && store({}, editor);
            if (projectSettings.enable_auto_save) {
              updatePrevirePage({
                data: await getProjectData(),
                pageName: localStorage.getItem(current_page_id),
                projectId: +localStorage.getItem(current_project_id),
                projectSetting: projectSettings,
                editorData: {},
              });
              editor.clearDirtyCount();
              editor.Storage.setAutosave(originalAutosave);
            }
          });
        });

        timeout.current && clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          infinitelyWorker.postMessage({
            command: "updateDB",
            props: {
              data: {
                interactions: {
                  ...(projectData?.interactions || {}),
                  [mainId]: interactionsState,
                },
              },
            },
          });
        }, 10);

        console.log("interactions from all effetc : ", interactionsState);
      })();
    }
  }, [interactionsId, interactionsState, editor, mainId]);

  const resetStates = () => {
    setIsInstance(false);
    setEditeAsMain(true);
    setInstanceId("");
    setMainId("");
    setInteractions([]);
    setEventName("");
    setInteractionsIds("");
    setSelectedInteractionId("");
  };

  const getAndSetIdHandle = async (newInteractions = []) => {
    const projectData = await getProjectData();
    const sle = editor.getSelected();
    const sleAttributes = sle.getAttributes();
    const interactionIdAttr =
      sleAttributes[interactionId] || sleAttributes[mainInteractionId];
    const instanceAttr = sleAttributes[interactionInstanceId];
    const uuid = uniqueId(`iNN${uniqueID()}-${random(999, 10000)}`);

    setMainId(interactionIdAttr);
    setInstanceId(instanceAttr);
    setEditeAsMain(!Boolean(instanceAttr));
    setIsInstance(Boolean(instanceAttr));
    console.log(
      "inter id : ",
      interactionIdAttr,
      projectData?.interactions?.[interactionIdAttr]
    );

    // return;
    if (interactionIdAttr) {
      setInteractionsId(interactionIdAttr);
      const interactionFromDB = projectData?.interactions?.[interactionIdAttr];
      if (!interactionFromDB) {
        await db.projects.update(projectId, {
          interactions: {
            ...(projectData?.interactions || {}),
            [interactionIdAttr]: newInteractions,
          },
        });
        setInteractionsId(interactionIdAttr);
        setInteractions(newInteractions);
      } else {
        setInteractions(newInteractions);
      }
    } else {
      await db.projects.update(projectId, {
        interactions: {
          ...projectData.interactions,
          [uuid]: newInteractions,
        },
      });
      sle.addAttributes({ [interactionId]: uuid });
      console.log("from else");

      setInteractionsId(uuid);
      setMainId(uuid);
      setInstanceId("");
      setEditeAsMain(true);
      setIsInstance(false);
      setInteractions(newInteractions);
    }
  };

  const createINNUUID = () => uniqueId(`${uniqueID()}-${random(999, 10000)}`);

  const addInteraction = async (eventName = "") => {
    if (!eventName) {
      toast.warn(<ToastMsgInfo msg={`Select event to add`} />);
      return;
    }
    if (
      interactionsState.some(
        (interaction) =>
          interaction.event.toLowerCase() == eventName.toLowerCase()
      )
    ) {
      toast.warn(<ToastMsgInfo msg={`You already use this interaction...!`} />);
      return;
    }
    const sle = editor.getSelected();
    if (viewEvents.includes(eventName)) {
      sle.addAttributes({ "v-view": "true" }, { avoidStore: true });
    }
    const uuid = createINNUUID();
    const newInteraction = {
      id: uuid,
      name: uuid,
      event: eventName,
      actions: [],
    };

    const newInteractions = [...interactionsState, newInteraction];
    console.log("new interactions : ", newInteractions);
    await getAndSetIdHandle(newInteractions);
    // setInteractions([...interactionsState, newInteraction]);
    // const projectData = await getProjectData();
    // await db.projects.update(projectId, {
    //   interactions: {
    //     ...projectData.interactions,
    //     [uuid]: newInteractions,
    //   },
    // });
    sle.addAttributes({ [`v-on:${eventName}`]: "" });
    setEventName("");
  };

  const pasteInteraction = async (interaction = "") => {
    const parsedInteraction = parse(interaction);
    if (
      !(
        parsedInteraction &&
        parsedInteraction?.actions &&
        parsedInteraction?.id
      )
    ) {
      toast.error(<ToastMsgInfo msg={`Invalid interaction!`} />);
      return;
    }
    console.log("parsed Acttions", parsedInteraction);

    if (
      interactionsState.some(
        (interaction) =>
          interaction.event.toLowerCase() ==
          parsedInteraction.event.toLowerCase()
      )
    ) {
      toast.warn(<ToastMsgInfo msg={`You already use this interaction...!`} />);
      return;
    }

    await getAndSetIdHandle([...interactionsState, parsedInteraction]);

    toast.success(<ToastMsgInfo msg={`Interaction pasted successfully👍`} />);

    // setInteractions([...interactionsState, parsedInteraction]);
  };

  const deleteInteractions = async () => {
    const { projectSettings } = getProjectSettings();
    const sle = editor.getSelected();
    if (!sle) return;
    const cnfrm = confirm(
      `Are you sure you want to delete those interactions? All instances will be removed from all pages, and you won’t be able to undo them on other pages (but you can undo them on the current page; symbols are exceptions)`
    );
    if (!cnfrm) return;
    editor.Storage.setAutosave(false);
    const allSameInteractionsCmps = editor
      .getWrapper()
      .find(
        `[${mainInteractionId}="${mainId}"][${interactionInstanceId}] , [${interactionId}="${mainId}"]`
      );

    for (const cmp of allSameInteractionsCmps) {
      console.log(
        Object.fromEntries(
          Object.keys(
            buildInteractionsAttributes(interactionsState, mainId) || {}
          ).map((key) => [key, null])
        )
      );

      cmp.removeAttributes([
        ...Object.keys(
          buildInteractionsAttributes(interactionsState, mainId) || {}
        ),
        mainInteractionId,
        interactionId,
        interactionInstanceId,
      ]);
    }
    const projectData = await getProjectData();
    delete projectData.interactions[mainId];
    deleteAttributesInAllPages(
      {
        [mainInteractionId]: mainId,
        [interactionInstanceId]: null,
      },
      async () => {
        editor.Storage.setAutosave(projectSettings.enable_auto_save);
        // resetStates();
        preventSelectNavigation(editor, sle);
        // projectSettings.enable_auto_save && store({}, editor);
      },
      `[${mainInteractionId}="${mainId}"][${interactionInstanceId}] , [${interactionId}="${mainId}"] `
    );
  };

  const createInstance = async () => {
    const sle = editor.getSelected();
    const uuid = createINNUUID();

    if (!sle) return;
    sle.addAttributes({
      [interactionInstanceId]: uuid,
      [mainInteractionId]: selectedInteractionId,
    });
    preventSelectNavigation(editor, sle);
    // const projectData = await getProjectData();
    // const
    // setInstanceId(uuid);
    // setMainId(selectedInteractionId);
    // setIsInstance(true);
    // setEditeAsMain(false);
    // setSelectedInteractionId("");
    // await getAndSetIdHandle();
  };

  const removeInstance = () => {
    const sle = editor.getSelected();
    if (!sle) return;
    sle.removeAttributes([mainInteractionId, interactionInstanceId]);
    // resetStates();
    preventSelectNavigation(editor, sle);
  };

  const cloneInteractions = async () => {
    const sle = editor.getSelected();
    if (!sle) return;
    const projectData = await getProjectData();
    const newUUID = createINNUUID();
    sle.addAttributes({ [interactionId]: newUUID });
    const oldInteractions = cloneDeep(
      projectData.interactions[selectedInteractionId]
    );
    projectData.interactions[newUUID] = oldInteractions;
    await db.projects.update(+localStorage.getItem(current_project_id), {
      interactions: projectData.interactions,
    });
    preventSelectNavigation(editor, sle);
    toast.success(<ToastMsgInfo msg={`Interactions cloned successfully👍`} />);
  };

  const uploadInteractions = async (ev) => {
    /**
     * @type {File[]}
     */
    const files = [...ev.target.files];
    const sle = editor.getSelected();
    if (!sle) return;
    const projectData = await getProjectData();
    const fileContent = JSON.parse(await files[0].text());
    const newUUID = createINNUUID();
    sle.addAttributes({ [interactionId]: newUUID });
    projectData.interactions[newUUID] = fileContent;
    await db.projects.update(+localStorage.getItem(current_project_id), {
      interactions: projectData.interactions,
    });
    preventSelectNavigation(editor, sle);
    toast.success(
      <ToastMsgInfo msg={`Interactions uploaded successfully👍`} />
    );
    ev.target.value = "";
  };

  const downloadInteractions = async () => {
    await downloadFile({
      filename: `interactions-${mainId}.json`,
      content: JSON.stringify(interactionsState),
      mimeType: "application/json",
    });

    toast.success(
      <ToastMsgInfo msg={`Interactions downloaded successfully👍`} />
    );
  };

  return (
    <section
      ref={autoAnimateRef}
      className={`relative  w-full h-full flex flex-col gap-2 my-2 ${
        isInstance && !editeAsMain ? "overflow-hidden" : "overflow-auto"
      } hideScrollBar`}
    >
      <header
        ref={autoAnimateHeaderRef}
        className="flex flex-col  gap-2 justify-between"
      >
        {!interactionsId && (
          <section className="flex flex-col gap-2 ">
            <FitTitle>Select Interaction Id</FitTitle>
            <section className="flex justify-between gap-2   bg-slate-800 p-1 rounded-lg">
              <Select
                className="p-[unset]"
                placeholder="Select Interaction"
                keywords={interactionsIds}
                value={selectedInteractionId}
                onAll={(value) => {
                  // selectNewMotion(value);
                  setSelectedInteractionId(value);
                }}
              />

              <div className="flex-shrink">
                <OptionsButton>
                  <section className="flex flex-col gap-3 items-center">
                    <button
                      id="inn-clone"
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        await cloneInteractions();
                      }}
                    >
                      {Icons.copy({ fill: "white", height: 18 })}
                    </button>
                    <Tooltip
                      anchorSelect="#inn-clone"
                      opacity={1}
                      place="left-end"
                    >
                      Clone
                    </Tooltip>

                    <button
                      id="int-instance-btn"
                      onClick={(ev) => {
                        createInstance(selectedInteractionId);
                      }}
                    >
                      {Icons.link({
                        fill: "white",
                        strokWidth: 2.4,
                        height: 19,
                      })}{" "}
                    </button>
                    <Tooltip
                      anchorSelect="#int-instance-btn"
                      place="left-end"
                      opacity={1}
                    >
                      Create Instance
                    </Tooltip>

                    <button
                      id="mt-upload-btn"
                      onClick={(ev) => {
                        addClickClass(ev.currentTarget, "click");
                        interactionUploader.current.click();
                      }}
                    >
                      {Icons.upload({
                        strokeColor: "white",
                        strokWidth: 2.4,
                        width: 18,
                        height: 18,
                      })}{" "}
                    </button>
                    <input
                      ref={interactionUploader}
                      type="file"
                      accept=".json"
                      hidden
                      onChange={uploadInteractions}
                    />

                    <Tooltip
                      anchorSelect="#mt-upload-btn"
                      place="left-end"
                      opacity={1}
                    >
                      Upload Interactions
                    </Tooltip>
                  </section>
                </OptionsButton>
              </div>
            </section>
          </section>
        )}

        {!mainId && <FitTitle>Or Add New</FitTitle>}
        {
          <>
            {mainId && isInstance && (
              <section className="flex justify-between gap-2 p-1 bg-slate-800 rounded-lg items-center">
                <FitTitle className="custom-font-size  text-slate-200 rounded-md">
                  Instance ID : {instanceId}
                </FitTitle>

                <section className="flex justify-center items-center">
                  <button
                    className="[&_path]:hover:stroke-[white!important]"
                    id="int-remove-instance-btn"
                    onClick={(ev) => {
                      removeInstance(instanceId);
                    }}
                  >
                    {Icons.trash()}{" "}
                  </button>
                  <Tooltip
                    className="z-[1000]"
                    anchorSelect="#int-remove-instance-btn"
                    place="left-end"
                    opacity={1}
                  >
                    Remove Instance
                  </Tooltip>
                </section>
              </section>
            )}

            {mainId && (
              <section className="relative flex gap-2 p-1 py-2 justify-between bg-slate-800 w-full rounded-lg">
                {/* <FitTitle className="absolute top-[-50%]  left-0">{isInstance ? 'Instance' : 'Main'}</FitTitle> */}
                <FitTitle className="custom-font-size  text-slate-200 rounded-md">
                  Main ID : {mainId}
                </FitTitle>
                <OptionsButton>
                  <section className="flex flex-col items-center gap-5">
                    <button
                      id="inn-copy"
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        await navigator.clipboard.writeText(mainId);
                        toast.success(
                          <ToastMsgInfo
                            msg={`Interactions Id Copied Successfully`}
                          />
                        );
                      }}
                    >
                      {Icons.copy({ fill: "white", height: 18 })}
                    </button>
                    <Tooltip
                      anchorSelect="#inn-copy"
                      opacity={1}
                      place="left-end"
                    >
                      Copy
                    </Tooltip>

                    <button
                      id="inn-delete-interactions"
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        await deleteInteractions();
                      }}
                    >
                      {Icons.trash("white", undefined, undefined, 18)}
                    </button>
                    <Tooltip
                      className="z-[1000]"
                      anchorSelect="#inn-delete-interactions"
                      opacity={1}
                      place="left-end"
                    >
                      Delete Interactions
                    </Tooltip>

                    <button
                      id="inn-download-interactions"
                      onClick={async (ev) => {
                        addClickClass(ev.currentTarget, "click");
                        await downloadInteractions();
                      }}
                    >
                      {Icons.export("white", 2, 18, 18)}
                    </button>
                    <Tooltip
                      className="z-[1000]"
                      anchorSelect="#inn-download-interactions"
                      opacity={1}
                      place="left-end"
                    >
                      Download Interactions
                    </Tooltip>
                  </section>
                </OptionsButton>
              </section>
            )}

            <section className="flex justify-between gap-2">
              <Select
                value={eventName}
                setValue={setEventName}
                placeholder="Add Interaction"
                keywords={eventNames}
                onItemClicked={(value) => {
                  addInteraction(value);
                }}
                onEnterPress={(value) => {
                  addInteraction(value);
                }}
              />
              <SmallButton
                tooltipTitle="Paste Interaction"
                onClick={async () => {
                  pasteInteraction(await navigator.clipboard.readText());
                }}
              >
                {Icons.paste({ fill: "white" })}
              </SmallButton>
              <SmallButton
                tooltipTitle="Add Interaction"
                onClick={(ev) => {
                  addInteraction(eventName);
                }}
              >
                {Icons.plus("white")}
              </SmallButton>
            </section>
          </>
        }
      </header>
      {interactionsId && interactionsState?.length && (
        <MiniTitle>Interactions</MiniTitle>
      )}
      <Accordion>
        {interactionsState.map((interaction, i) => (
          <AccordionItem key={i} title={interaction.event}>
            <Interaction
              id={interactionsId}
              index={i}
              interactions={interactionsState}
              setInteractions={setInteractions}
              setInteractionsId={setInteractionsId}
              interaction={interaction}
            />
          </AccordionItem>
        ))}
      </Accordion>

      {interactionsState.length > 2 && (
        <footer className="flex gap-2 justify-between">
          <Select
            value={eventName}
            setValue={setEventName}
            placeholder="Add Interaction"
            keywords={eventNames}
            onItemClicked={(value) => {
              addInteraction(value);
            }}
            onEnterPress={(value) => {
              addInteraction(value);
            }}
          />
          <SmallButton
            tooltipTitle="Add Interaction"
            onClick={(ev) => {
              addInteraction(eventName);
            }}
          >
            {Icons.plus("white")}
          </SmallButton>
        </footer>
      )}

      {isInstance && !editeAsMain && (
        <section className="absolute left-0 top-[0] w-full h-full min-h-full backdrop-blur-md z-[1001] rounded-lg p-2">
          <section className="sticky top-0 flex flex-col gap-3 items-center p-2 py-3 bg-slate-900 rounded-lg">
            {Icons.info({
              fill: "yellow",
              strokeColor: "yellow",
              width: 30,
              height: 30,
            })}
            <p className="text-center text-slate-200 font-semibold">
              You can’t edite instance , If you wanna to edite so you should
              edite as main
            </p>
            <Button
              onClick={(ev) => {
                setEditeAsMain(true);
              }}
            >
              Edite As Main
            </Button>
          </section>
        </section>
      )}
    </section>
  );
};
