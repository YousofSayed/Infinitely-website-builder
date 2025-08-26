import React, { useEffect, useState } from "react";
import {
  interactionInDBType,
  interactionsType,
  interactionType,
} from "../../helpers/jsDocs";
import { Select } from "./Protos/Select";
import { eventNames } from "../../constants/hsValues";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { useLiveQuery } from "dexie-react-hooks";
import { getProjectData } from "../../helpers/functions";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import {
  current_page_id,
  current_project_id,
  interactionId,
} from "../../constants/shared";
import { cloneDeep, isPlainObject, random, uniqueId } from "lodash";
import {
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
    if (interaction.actions.some((action) => action.label == actionName)) {
      toast.warn(<ToastMsgInfo msg={`You already use this action...!`} />);
      return;
    }
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
      const functionsFromParams = buildFunctionsFromActions(newActions);
      sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
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
    const functionsFromParams = buildFunctionsFromActions(clone[0].actions);
    console.log(`functionsFromParams : `, functionsFromParams);

    // sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
    setInteractions(clone);
  };

  const deleteAction = (actionIndex) => {
    const clone = cloneDeep(interactions);
    clone[index].actions.splice(actionIndex, 1);
    const sle = editor.getSelected();
    const functionsFromParams = buildFunctionsFromActions(clone[index].actions);
    // editor.getWrapper().find(`[${interactionId}="${id}"]`).forEach(cmp=>cmp.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams }))
    sle.addAttributes({ [`v-on:${interaction.event}`]: functionsFromParams });
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
    <section className="flex flex-col gap-2 p-1 bg-slate-950 rounded-lg">
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
  const [eventName, setEventName] = useState("");
  const selectedEl = useRecoilValue(currentElState);
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);

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
                ? value.replaceAll(
                    `self`,
                    `[${interactionId}="${interactionsId}"]`
                  )
                : value ;
            })
            .join(",")})`
      )
      .join(";");

   
    console.log(`functionsFromParams 222 : `, functionsFromParams);

    return functionsFromParams;
  };

  useEffect(() => {
    if (!selectedEl && !editor) return;
    // getAndSetIdHandle();
    (async () => {
      const sle = editor.getSelected();
      const intersectionIdAttr = sle.getAttributes()[interactionId];
      if (!intersectionIdAttr) {
        setInteractions([]);
        setInteractionsId(intersectionIdAttr);
      } else {
        const projectData = await getProjectData();
        console.log("elseeee", projectData.interactions[intersectionIdAttr]);
        setInteractions(projectData.interactions[intersectionIdAttr]);
        setInteractionsId(intersectionIdAttr);
      }
    })();
  }, [selectedEl, editor]);

  useEffect(() => {
    if (!editor) return;
    const allSameInteractionsCmps = editor
      .getWrapper()
      .find(`[${interactionId}="${interactionsId}"]`);
    for (const cmp of allSameInteractionsCmps) {
      // if (editor.getSelected() == cmp) continue;
      for (const interaction of interactionsState) {
        cmp.addAttributes({
          [`v-on:${interaction.event}`]: buildFunctionsFromActions(
            interaction.actions
          ),
          ...(viewEvents.includes(interaction.event)
            ? { ["v-view"]: true }
            : {}),
        });
      }
    }
    console.log("interactions from all effetc : ", interactionsState);
  }, [interactionsState, interactionsId, editor]);

  //   useLiveQuery(async () => {
  //     const interactionsFromDB = await (await getProjectData()).interactions;
  //     setInteractions(interactionsFromDB);
  //   });

  useEffect(() => {
    if (interactionsId && Array.isArray(interactionsState)) {
      (async () => {
        const projectData = await getProjectData();
        const allInteractions = {
          ...(projectData?.interactions || {}),
          [interactionsId]: interactionsState,
        };
        console.log(allInteractions);

        infinitelyWorker.postMessage({
          command: "updateDB",
          props: {
            data: {
              interactions: {
                ...(projectData?.interactions || {}),
                [interactionsId]: interactionsState,
              },
            },
          },
        });
      })();
    }
  }, [interactionsId, interactionsState]);

  const getAndSetIdHandle = async (newInteractions = []) => {
    const projectData = await getProjectData();
    const sle = editor.getSelected();
    const sleAttributes = sle.getAttributes();
    const interactionIdAttr = sleAttributes[interactionId];
    const uuid = uniqueId(`iN${uniqueID()}-${random(999, 10000)}`);

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
      sle.addAttributes({ [interactionId]: uuid });
      console.log("from else");

      await db.projects.update(projectId, {
        interactions: {
          ...projectData.interactions,
          [uuid]: newInteractions,
        },
      });
      setInteractionsId(uuid);
      setInteractions(newInteractions);
    }
  };

  const addInteraction = async (eventName = "") => {
    if (!eventName) {
      toast.warn(<ToastMsgInfo msg={`Select event to add`} />);
      return;
    }
    await getAndSetIdHandle();
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
    const uuid = uniqueId(`${uniqueID()}-${random(999, 10000)}`);
    const newInteraction = {
      id: uuid,
      name: uuid,
      event: eventName,
      actions: [],
    };

    const newInteractions = [...interactionsState, newInteraction];
    console.log("new interactions : ", newInteractions);
    sle.addAttributes({ [`v-on:${eventName}`]: "" });
    setInteractions([...interactionsState, newInteraction]);
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
    // setInteractions([...interactionsState, parsedInteraction]);
  };

  return (
    <section className="w-full h-full flex flex-col gap-2 my-2 overflow-auto hideScrollBar">
      <header className="flex gap-2 justify-between">
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
      </header>
      <Accordion>
        {Object.values(interactionsState).map((interaction, i) => (
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
    </section>
  );
};
