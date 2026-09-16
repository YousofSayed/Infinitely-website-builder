import { actions } from "@/constants/actions";
import { eventNames } from "@/constants/hsValues";
import {
  current_page_id,
  current_project_id,
  interactionId,
  interactionInstanceId,
  mainInteractionId,
} from "@/constants/shared";
import { currentElState, showsState } from "@/helpers/atoms";
import { buildInteractionsAttributes } from "@/helpers/bridge";
import {
  addClickClass,
  parse,
  pushBetween,
  stringify,
  uniqueID,
} from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { keyframesGetterWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  deleteAttributesInAllPages,
  doInNormal,
  doInWordpress,
  downloadFile,
  getProjectData,
  getProjectSettings,
  preventSelectNavigation,
  setInteractionsAttributes,
  store,
  updatePrevirePage,
  workerCallbackMaker,
} from "@/helpers/functions";
import { removeAttributesInAllPages } from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import {
  interactionInDBType,
  interactionsType,
  interactionType,
  refType,
} from "@/helpers/jsDocs";
import { useInfinitelyUndoRedo } from "@/hooks/useInfinitelyUndoRedo";
import { Icons } from "@/components/Icons/Icons";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { Button } from "@/components/Protos/Button";
import { InfAccordion } from "@/components/Protos/InfAccordion";
import { Memo } from "@/components/Protos/Memo";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { ScrollableToolbar } from "@/components/Protos/ScrollableToolbar";
import { SwitchButton } from "@/components/Protos/SwitchButton";
import { UndoRedoContainer } from "@/components/Protos/UndoRedoContainer";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep, isPlainObject, random, uniqueId } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { useRecoilState, useRecoilValue } from "recoil";
import { ShowIf } from "@/components/ShowIf";

const actionsKeywords = actions.map((action) => action.label);
const advancedParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return value == undefined ? `undefined` : `\`${value}\``;
  }
};
const viewEvents = ["enterview", "leaveview", "view"];
const mounteEvents = ["mount", "unmount"];

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
    const { command, props } = data;
    if (data.command == "getKeyFrames") {
      const keyFrameNames = props.map((kfrm) => kfrm.name).filter(Boolean);
      setInteractions((prev) => {
        const clone = structuredClone(prev);
        for (const inter of clone) {
          for (const act of inter.actions) {
            for (const [key, value] of Object.entries(act.access || {})) {
              if (value.keyframes) {
                act.params[key] = { type: "select", keywords: keyFrameNames };
              }
            }
          }
        }
        return clone;
      });
    }
  };

  const getKeyFrames = async () => {
    const res = await callWorkerCommand(keyframesGetterWorker, "getKeyFrames", {
      projectId: +localStorage.getItem(current_project_id),
      pageName: localStorage.getItem(current_page_id),
      editorCss: editor.getCss({ keepUnusedStyles: false, avoidProtected: true }),
    });
    return res.map((kfrm) => kfrm.name).filter(Boolean);
  };

  const getThemesData = async () => {
    const projectData = await getProjectData();
    const themesNames = projectData.themes.config.map((theme) => theme.name);
    const themesModes = projectData.themes.config
      .map((theme) => Object.keys(theme.modes).map((mode) => mode))
      .flat();
    return { names: themesNames, modes: themesModes };
  };

  // TRUE PERFORMANCE FIX: OPTIMISTIC UI UPDATE
  // We add the action to the state IMMEDIATELY so the user sees it instantly without waiting.
  // Then we fetch the heavy data (keyframes/themes) in the background and update the state again.
  const addAction = async (actionName = "") => {
    const actionTarget = actions.find(
      (action) => action.label.toLowerCase() == actionName.toLowerCase(),
    );

    if (!actionTarget) {
      toast.warn(<ToastMsgInfo msg={`Action not founded!`} />);
      setActionName("");
      return;
    }

    // 1. IMMEDIATE UI UPDATE (Optimistic)
    const clonedAction = cloneDeep(actionTarget);
    const tempId = `__temp_${Date.now()}_${Math.random()}`;
    clonedAction.__tempId = tempId;

    // Pre-fill selects with empty arrays so the UI doesn't crash while loading
    for (const [key, accessValue] of Object.entries(clonedAction?.access || {})) {
      if (accessValue.keyframes || accessValue.themesNames || accessValue.themesModes) {
        clonedAction.params[key] = { 
          type: "select", 
          keywords: [], 
          value: clonedAction.params[key]?.value || "" 
        };
      }
    }

    setInteractions((prev) => {
      const clone = [...prev];
      const targetInteraction = { ...clone[index] };
      targetInteraction.actions = [...targetInteraction.actions, clonedAction];
      clone[index] = targetInteraction;
      return clone;
    });
    
    setActionName("");

    // 2. BACKGROUND FETCH (Happens AFTER the UI has already updated)
    try {
      const [keyframes, themesData] = await Promise.all([
        getKeyFrames(),
        getThemesData(),
      ]);

      // 3. UPDATE UI WITH FETCHED DATA
      setInteractions((prev) => {
        const clone = [...prev];
        const targetInteraction = { ...clone[index] };
        const newActions = [...targetInteraction.actions];
        
        const actionIdx = newActions.findIndex(a => a.__tempId === tempId);
        if (actionIdx === -1) return prev; // Action was deleted before fetch finished

        const updatedAction = { ...newActions[actionIdx] };
        delete updatedAction.__tempId; // Clean up temp ID so it doesn't pollute the DB
        const updatedParams = { ...updatedAction.params };

        for (const [key, accessValue] of Object.entries(updatedAction?.access || {})) {
          if (accessValue.keyframes) {
            updatedParams[key] = { ...updatedParams[key], keywords: keyframes };
          }
          if (accessValue.themesNames || accessValue.themesModes) {
            updatedParams[key] = {
              ...updatedParams[key],
              keywords: accessValue.themesNames
                ? themesData.names
                : accessValue.themesModes
                ? themesData.modes
                : [],
            };
          }
        }

        updatedAction.params = updatedParams;
        newActions[actionIdx] = updatedAction;
        targetInteraction.actions = newActions;
        clone[index] = targetInteraction;
        return clone;
      });
    } catch (error) {
      console.error("Failed to fetch action data:", error);
    }
  };

  const addValueToActionParam = (key = "", value = "", actionIndex) => {
    if (!key) throw new Error(`No key Founded!`);
    if (actionIndex == undefined) throw new Error(`Action index not founded!`);

    setInteractions((prevInteractions) => {
      const newInteractions = [...prevInteractions];
      const targetInteraction = { ...newInteractions[index] };
      const newActions = [...targetInteraction.actions];
      const targetAction = { ...newActions[actionIndex] };
      const newParams = { ...targetAction.params };

      if (isPlainObject(newParams[key])) {
        newParams[key] = { ...newParams[key], value };
      } else {
        newParams[key] = value;
      }

      targetAction.params = newParams;
      newActions[actionIndex] = targetAction;
      targetInteraction.actions = newActions;
      newInteractions[index] = targetInteraction;

      return newInteractions;
    });
  };

  const deleteAction = (actionIndex) => {
    setInteractions((prev) => {
      const clone = [...prev];
      const targetInteraction = { ...clone[index] };
      const newActions = [...targetInteraction.actions];
      newActions.splice(actionIndex, 1);
      targetInteraction.actions = newActions;
      clone[index] = targetInteraction;
      return clone;
    });
  };

  const deleteInteraction = () => {
    const willBeEmpty = interactions.length <= 1;

    setInteractions((prev) => {
      const clone = [...prev];
      clone.splice(index, 1);
      return clone;
    });

    editor
      .getWrapper()
      .find(`[${interactionId}="${id}"]`)
      .forEach((cmp) => {
        cmp.removeAttributes([`v-on:${interaction.event}`]);
        const viewAttrs = Object.keys(cmp.getAttributes()).filter((key) =>
          viewEvents.includes(key.replace(/v-on:|@/gi, ""))
        );
        const mountAttrs = Object.keys(cmp.getAttributes()).filter((key) =>
          mounteEvents.includes(key.replace(/v-on:|@/gi, ""))
        );
        if (viewAttrs.length) cmp.removeAttributes([`v-view`], { avoidStore: true });
        if (mountAttrs.length) cmp.removeAttributes([`v-mount`], { avoidStore: true });
      });

    if (willBeEmpty) {
      editor
        .getWrapper()
        .find(`[${interactionId}="${id}"]`)
        .forEach((cmp) => cmp.removeAttributes([interactionId]));
      setInteractionsId("");
    }
  };

  const buildFunctionsFromActions = (actions) => {
    const functionsFromParams = actions
      .map(
        (action) =>
          `${action.function}(${Object.values(action.params)
            .map((value) => {
              value = isPlainObject(value) ? value.value : value;
              value = advancedParse(value);
              return typeof value == "string"
                ? value.replaceAll(`self`, `[${interactionId}="${id}"]`)
                : value;
            })
            .join(",")})`
      )
      .join(";");
    return functionsFromParams;
  };

  const pasteAction = (action = "") => {
    const parsedAction = parse(action);
    if (!(parsedAction && parsedAction?.name && parsedAction?.function)) {
      toast.error(<ToastMsgInfo msg={`Invalid action!`} />);
      return;
    }
    setInteractions((prev) => {
      const clone = [...prev];
      const targetInteraction = { ...clone[index] };
      targetInteraction.actions = [...targetInteraction.actions, parsedAction];
      clone[index] = targetInteraction;
      return clone;
    });
  };

  return (
    <section className="flex flex-col gap-2 p-1 bg-surface-main rounded-lg animate-go-to auto-animate">
      <header className="flex flex-col gap-2">
        <section className="flex gap-2 justify-between ">
          <MiniTitle className=" w-full  flex gap-2 justify-center items-center">
            {interaction.event}
          </MiniTitle>
          <SmallButton
            tooltipTitle="Copy Interaction"
            onClick={async (ev) => {
              await navigator.clipboard.writeText(JSON.stringify(interaction));
              toast.success(<ToastMsgInfo msg={`Interaction copied successfully👍`} />);
            }}
          >
            {Icons.copy({ fill: "white" })}
          </SmallButton>
          <SmallButton
            onClick={() => deleteInteraction()}
            className="bg-surface-tertiary hover:bg-[crimson!important] [&:hover_path]:stroke-white"
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
            onEnterPress={(value) => addAction(value)}
            onItemClicked={(value) => addAction(value)}
          />
          <SmallButton
            tooltipTitle="Paste Action"
            onClick={async () => {
              pasteAction(await navigator.clipboard.readText());
              toast.success(<ToastMsgInfo msg={`Action pasted successfully👍`} />);
            }}
          >
            {Icons.paste({})}
          </SmallButton>
          <SmallButton tooltipTitle="Add Action" onClick={() => addAction(actionName)}>
            {Icons.plus("white")}
          </SmallButton>
        </section>
      </header>

      {interaction.actions.map((action, i) => {
        return (
          <section
            className="flex flex-col gap-2 p-1 bg-surface-tertiary rounded-lg"
            key={i}
          >
            <ScrollableToolbar>
              <header className="w-full flex gap-2 justify-between">
                <MiniTitle className={` custom-font-size w-full flex-grow-0`}>
                  {action.label}
                </MiniTitle>
                <section className="rounded-lg flex gap-2">
                  <SmallButton
                    className="bg-surface-secondary"
                    tooltipTitle="Copy Action"
                    onClick={async () => {
                      await navigator.clipboard.writeText(JSON.stringify(action));
                      toast.success(<ToastMsgInfo msg={`Action copied successfully👍`} />);
                    }}
                  >
                    {Icons.copy({ fill: "white" })}
                  </SmallButton>
                  <SmallButton
                    onClick={() => deleteAction(i)}
                    className="h-full bg-surface-secondary hover:bg-[crimson!important] [&:hover_path]:stroke-white"
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
                        onAll={(val) => addValueToActionParam(key, val, i)}
                      />
                    ) : value.type == "switch" ? (
                      <div className="flex justify-between  gap-2 p-2 bg-surface-secondary rounded-lg items-center">
                        <p className="text-slate-400 capitalize">{key}</p>
                        <SwitchButton
                          className="p-[unset]"
                          defaultValue={parse(value.value)}
                          placeholder={key}
                          onSwitch={(val) => addValueToActionParam(key, stringify(val), i)}
                        />
                      </div>
                    ) : null
                  ) : (
                    <Input
                      required
                      value={value}
                      placeholder={key}
                      className="bg-surface-secondary"
                      onInput={(ev) => addValueToActionParam(key, ev.target.value, i)}
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
  const [shows, setShows] = useRecoilState(showsState);
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
  const oldInteractionsIdRef = useRef();
  const [isWrapper, setIsWrapper] = useState(false);
  
  const syncTimeoutRef = useRef(null);
  const latestInteractionsRef = useRef(interactionsState);

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    setInteractionsIds(Object.keys(projectData.interactions) || []);
  });

  useEffect(() => {
    latestInteractionsRef.current = interactionsState;
  }, [interactionsState]);

  useEffect(() => {
    if (!selectedEl.currentEl) return;
    if (!editor) return;
    
    const sle = editor.getSelected();
    if (!sle) return;

    setIsWrapper(sle.getType() === "wrapper");

    const handler = async () => {
      const attributes = sle.getAttributes();
      const intersectionIdAttr = attributes[interactionId] || attributes[mainInteractionId];
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
        setInteractions(projectData.interactions[intersectionIdAttr] || []);
        setInteractionsId(intersectionIdAttr);
        setMainId(intersectionIdAttr);
      }
    };
    
    handler();
  }, [selectedEl, editor]);

  useEffect(() => {
    if (!editor) return;
    if (mainId && Array.isArray(interactionsState)) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(async () => {
        const currentInteractions = latestInteractionsRef.current;
        const projectData = await getProjectData();
        const { projectSettings } = getProjectSettings();
        const originalAutosave = projectSettings.enable_auto_save;
        editor.Storage.setAutosave(false);
        
        const allSameInteractionsCmps = editor
          .getWrapper()
          .find(`[${interactionId}="${mainId}"] , [${mainInteractionId}="${mainId}"]`);
          
        for (const cmp of allSameInteractionsCmps) {
          const attributes = cmp.getAttributes();
          const cmpInstanceId = attributes[interactionInstanceId];
          const cmpIsInstance = Boolean(cmpInstanceId);
          const newInteractionsAttributes = buildInteractionsAttributes(
            currentInteractions,
            cmpIsInstance ? cmpInstanceId : mainId,
            cmpIsInstance,
          );
          cmp.addAttributes(newInteractionsAttributes);
        }
        
        doInNormal(() => {
          workerCallbackMaker(infinitelyWorker, "updateDB", () => {
            setInteractionsAttributes(interactionsId, async () => {
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
                    [mainId]: currentInteractions,
                  },
                },
              },
            });
          }, 10);
        });

        doInWordpress(() => {
          const wpInteractions = currentInteractions.map((interaction) => {
            if (!interaction?.instances) interaction.instances = {};
            for (const [id, instance] of Object.entries(interaction.instances)) {
              if (!id) continue;
              instance.attr_for_wp = buildInteractionsAttributes([interaction], id, true);
              instance.id = id;
            }
            if (isInstance && !isPlainObject(interaction.instances[instanceId])) {
              interaction.instances[instanceId] = {
                id: instanceId,
                attr_for_wp: buildInteractionsAttributes([interaction], instanceId, true),
              };
            }
            interaction.attr_for_wp = buildInteractionsAttributes([interaction], mainId, false);
            return interaction;
          });

          timeout.current && clearTimeout(timeout.current);
          timeout.current = setTimeout(() => {
            infinitelyWorker.postMessage({
              command: "updateDB",
              props: {
                data: {
                  interactions: {
                    ...(projectData?.interactions || {}),
                    [mainId]: wpInteractions,
                  },
                },
              },
            });
          }, 10);
        });
      }, 250); 
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [interactionsId, interactionsState, editor, mainId, isInstance, instanceId]);

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
    const interactionIdAttr = sleAttributes[interactionId] || sleAttributes[mainInteractionId];
    const instanceAttr = sleAttributes[interactionInstanceId];
    const uuid = uniqueId(`iNN${uniqueID()}-${random(999, 10000)}`);

    setMainId(interactionIdAttr);
    setInstanceId(instanceAttr);
    setEditeAsMain(!Boolean(instanceAttr));
    setIsInstance(Boolean(instanceAttr));

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
        (interaction) => interaction.event.toLowerCase() == eventName.toLowerCase()
      )
    ) {
      toast.warn(<ToastMsgInfo msg={`You already use this interaction...!`} />);
      return;
    }
    const sle = editor.getSelected();
    if (viewEvents.includes(eventName)) sle.addAttributes({ "v-view": "true" }, { avoidStore: true });
    if (mounteEvents.includes(eventName)) sle.addAttributes({ "v-mount": "true" }, { avoidStore: true });

    const uuid = createINNUUID();
    const newInteraction = { id: uuid, name: uuid, event: eventName, actions: [] };
    const newInteractions = [...interactionsState, newInteraction];
    
    await getAndSetIdHandle(newInteractions);
    sle.addAttributes({ [`v-on:${eventName}`]: "" });
    setEventName("");
  };

  const pasteInteraction = async (interaction = "") => {
    const parsedInteraction = parse(interaction);
    if (!(parsedInteraction && parsedInteraction?.actions && parsedInteraction?.id)) {
      toast.error(<ToastMsgInfo msg={`Invalid interaction!`} />);
      return;
    }
    if (
      interactionsState.some(
        (interaction) => interaction.event.toLowerCase() == parsedInteraction.event.toLowerCase()
      )
    ) {
      toast.warn(<ToastMsgInfo msg={`You already use this interaction...!`} />);
      return;
    }
    await getAndSetIdHandle([...interactionsState, parsedInteraction]);
    toast.success(<ToastMsgInfo msg={`Interaction pasted successfully👍`} />);
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
      .find(`[${mainInteractionId}="${mainId}"][${interactionInstanceId}] , [${interactionId}="${mainId}"]`);

    for (const cmp of allSameInteractionsCmps) {
      cmp.removeAttributes([
        ...Object.keys(buildInteractionsAttributes(interactionsState, mainId) || {}),
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
        preventSelectNavigation(editor, sle);
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
  };

  const removeInstance = () => {
    const sle = editor.getSelected();
    if (!sle) return;
    sle.removeAttributes([mainInteractionId, interactionInstanceId]);
    preventSelectNavigation(editor, sle);
  };

  const cloneInteractions = async () => {
    const sle = editor.getSelected();
    if (!sle) return;
    const projectData = await getProjectData();
    const newUUID = createINNUUID();
    sle.addAttributes({ [interactionId]: newUUID });
    const oldInteractions = cloneDeep(projectData.interactions[selectedInteractionId]);
    projectData.interactions[newUUID] = oldInteractions;
    await db.projects.update(+localStorage.getItem(current_project_id), {
      interactions: projectData.interactions,
    });
    preventSelectNavigation(editor, sle);
    toast.success(<ToastMsgInfo msg={`Interactions cloned successfully👍`} />);
  };

  const uploadInteractions = async (ev) => {
    const files = [...ev.target.files];
    const sle = editor.getSelected();
    ev.target.value = "";
    if (!sle) return;
    const projectData = await getProjectData();
    const fileContent = JSON.parse(await files[0].text());
    ev.target.value = "";

    const newUUID = createINNUUID();
    if (!mainId) {
      sle.addAttributes({ [interactionId]: newUUID });
    } else {
      const attrbiutesV = buildInteractionsAttributes(interactionsState, mainId, isInstance);
      editor
        .getWrapper()
        .find(`[${interactionId}="${mainId}"] , [${mainInteractionId}="${mainId}"]`)
        .forEach((cmp) => {
          cmp.removeAttributes(Object.keys(attrbiutesV));
        });
      await removeAttributesInAllPages({
        selectors: {
          [`[${interactionId}="${mainId}"] , [${mainInteractionId}="${mainId}"]`]: { ...attrbiutesV },
        },
      });
    }
    projectData.interactions[mainId || newUUID] = fileContent;
    await db.projects.update(+localStorage.getItem(current_project_id), {
      interactions: projectData.interactions,
    });
    preventSelectNavigation(editor, sle);
    toast.success(<ToastMsgInfo msg={`Interactions uploaded successfully👍`} />);
    ev.target.value = "";
  };

  const downloadInteractions = async () => {
    await downloadFile({
      filename: `interactions-${mainId}.json`,
      content: JSON.stringify(interactionsState),
      mimeType: "application/json",
    });
    toast.success(<ToastMsgInfo msg={`Interactions downloaded successfully👍`} />);
  };

  return (
    <Memo className="h-full">
      <ShowIf condition={!isWrapper}>
        <UndoRedoContainer
          defaultValue={interactionsType}
          className="h-full"
          state={[interactionsState, setInteractions]}
          showProp="interactionsBuilder"
        >
          <section
            ref={autoAnimateRef}
            className={`relative  w-full h-full flex flex-col gap-2 my-2 ${
              isInstance && !editeAsMain ? "overflow-hidden" : "overflow-auto"
            } hideScrollBar animate-go-to auto-animate`}
          >
            <header ref={autoAnimateHeaderRef} className="flex flex-col  gap-2 justify-between">
              <input
                ref={interactionUploader}
                type="file"
                accept=".json"
                hidden
                onChange={uploadInteractions}
              />
              {!interactionsId && (
                <section className="flex flex-col gap-2 ">
                  <FitTitle>Select Interaction Id</FitTitle>
                  <section className="flex justify-between gap-2   bg-surface-tertiary p-1 rounded-lg">
                    <Select
                      className="p-[unset]"
                      placeholder="Select Interaction"
                      keywords={interactionsIds}
                      value={selectedInteractionId}
                      onAll={(value) => setSelectedInteractionId(value)}
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
                          <Tooltip anchorSelect="#inn-clone" opacity={1} place="left-end">
                            Clone
                          </Tooltip>

                          <button
                            id="int-instance-btn"
                            onClick={(ev) => createInstance(selectedInteractionId)}
                          >
                            {Icons.link({ fill: "white", strokWidth: 2.4, height: 19 })}{" "}
                          </button>
                          <Tooltip anchorSelect="#int-instance-btn" place="left-end" opacity={1}>
                            Create Instance
                          </Tooltip>

                          <button
                            id="mt-upload-btn"
                            onClick={(ev) => {
                              addClickClass(ev.currentTarget, "click");
                              interactionUploader.current.click();
                            }}
                          >
                            {Icons.upload({ strokeColor: "white", strokWidth: 2.4, width: 18, height: 18 })}{" "}
                          </button>
                          <Tooltip anchorSelect="#mt-upload-btn" place="left-end" opacity={1}>
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
                    <section className="flex justify-between gap-2 p-1 bg-surface-tertiary rounded-lg items-center">
                      <FitTitle className="custom-font-size  text-text-primary rounded-md">
                        Instance ID : {instanceId}
                      </FitTitle>
                      <section className="flex justify-center items-center">
                        <button
                          className="[&_path]:hover:stroke-[white!important]"
                          id="int-remove-instance-btn"
                          onClick={(ev) => removeInstance(instanceId)}
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
                    <section className="relative flex gap-2 p-1 py-2 justify-between bg-surface-tertiary w-full rounded-lg">
                      <FitTitle className="custom-font-size  text-text-primary rounded-md">
                        Main ID : {mainId}
                      </FitTitle>
                      <OptionsButton>
                        <section className="flex flex-col items-center gap-5">
                          <button
                            id="inn-copy"
                            onClick={async (ev) => {
                              addClickClass(ev.currentTarget, "click");
                              await navigator.clipboard.writeText(mainId);
                              toast.success(<ToastMsgInfo msg={`Interactions Id Copied Successfully`} />);
                            }}
                          >
                            {Icons.copy({ fill: "white", height: 18 })}
                          </button>
                          <Tooltip anchorSelect="#inn-copy" opacity={1} place="left-end">
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
                            id="inn-upload-interactions"
                            onClick={async (ev) => {
                              addClickClass(ev.currentTarget, "click");
                              interactionUploader.current.click();
                            }}
                          >
                            {Icons.upload({ strokeColor: "white", strokeWidth: 2, width: 18, height: 18 })}
                          </button>
                          <Tooltip
                            className="z-[1000]"
                            anchorSelect="#inn-upload-interactions"
                            opacity={1}
                            place="left-end"
                          >
                            Upload Interactions
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
                      onItemClicked={(value) => addInteraction(value)}
                      onEnterPress={(value) => addInteraction(value)}
                    />
                    <SmallButton
                      tooltipTitle="Paste Interaction"
                      onClick={async () => pasteInteraction(await navigator.clipboard.readText())}
                    >
                      {Icons.paste({ fill: "white" })}
                    </SmallButton>
                    <SmallButton tooltipTitle="Add Interaction" onClick={(ev) => addInteraction(eventName)}>
                      {Icons.plus("white")}
                    </SmallButton>
                  </section>
                </>
              }
            </header>
            {interactionsId && Boolean(interactionsState?.length) && (
              <MiniTitle>Interactions</MiniTitle>
            )}

            <Accordion>
              {Array.isArray(interactionsState) &&
                interactionsState.map((interaction, i) => (
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
                  onItemClicked={(value) => addInteraction(value)}
                  onEnterPress={(value) => addInteraction(value)}
                />
                <SmallButton tooltipTitle="Add Interaction" onClick={(ev) => addInteraction(eventName)}>
                  {Icons.plus("white")}
                </SmallButton>
              </footer>
            )}

            {isInstance && !editeAsMain && (
              <section className="absolute left-0 top-[0] w-full h-full min-h-full backdrop-blur-md z-[1001] rounded-lg p-2">
                <section className="sticky top-0 flex flex-col gap-3 items-center p-2 py-3 bg-surface-secondary rounded-lg">
                  {Icons.info({ fill: "yellow", strokeColor: "yellow", width: 30, height: 30 })}
                  <p className="text-center text-text-primary font-semibold">
                    You can’t edite instance , If you wanna to edite so you should edite as main
                  </p>
                  <Button onClick={(ev) => setEditeAsMain(true)}>Edite As Main</Button>
                </section>
              </section>
            )}
          </section>
        </UndoRedoContainer>
      </ShowIf>

      <ShowIf condition={isWrapper}>
        <section className="flex flex-col gap-3 items-center justify-center p-2 py-3 bg-surface-tertiary my-2 aspect-square rounded-lg">
          {Icons.info({ fill: "yellow", strokeColor: "yellow", width: 30, height: 30 })}
          <p className="text-center text-text-primary font-semibold">
            You can’t set interactions for wrapper
          </p>
        </section>
      </ShowIf>
    </Memo>
  );
};