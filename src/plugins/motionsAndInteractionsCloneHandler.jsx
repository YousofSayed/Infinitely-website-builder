import { cloneDeep, random, uniqueId } from "lodash";
import {
  current_page_id,
  current_project_id,
  interactionId,
  interactionInstanceId,
  mainInteractionId,
  mainMotionId,
  motionId,
  motionInstanceId,
} from "../constants/shared";
import { buildInteractionsAttributes } from "../helpers/bridge";
import {
  deleteAttributesInAllPages,
  getInfinitelySymbolInfo,
  getProjectData,
  getProjectSettings,
  handleCloneComponent,
  store,
} from "../helpers/functions";
import { db } from "../helpers/db";

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const motionsAndInteractionsCloneHandler = (editor) => {
  // editor.on("component:clone", async (model) => {
  //   await handleCloneComponent(model, editor);
  // });
  /**
   *
   * @param {import('grapesjs').Component} model
   */
  const recuseCmp = async (model, data = {}) => {
    if (model.handled) return;
    model.handled = true;
    const symbolInfo = getInfinitelySymbolInfo(model);
    if (symbolInfo.isSymbol) return;
    if (model.get("type").toLowerCase() == "textnode") return;
    const attributes = model.getAttributes();
    const projectData = {
      ...(await getProjectData()),
      ...data,
    };

    // 1- Handle Motions
    const mainId = attributes[motionId] || attributes[mainMotionId];
    const instanceId = attributes[motionInstanceId];
    const interactionsId =
      attributes[interactionId] || attributes[mainInteractionId];
    const interactionInstanceIdAttr = attributes[interactionInstanceId];
    console.log(
      "instances : ",
      model,
      model.getEl(),
      editor.getWrapper().find(`[${motionId}="${mainId}"] `)
    );
    const isNotMainMotion =
      editor.getWrapper().find(`[${motionId}="${mainId}"] `).length > 1;
    const isThereSameMotionInstance =
      editor.getWrapper().find(`[${motionInstanceId}="${instanceId}"] `)
        .length > 1;
    const isNotMainInteractions =
      editor.getWrapper().find(`[${interactionId}="${interactionsId}"]`)
        .length > 1;
    const isThereSameInteractionsInstance =
      editor
        .getWrapper()
        .find(`[${interactionInstanceId}="${interactionInstanceIdAttr}"] `)
        .length > 1;
    console.log(
      "handlers : ",
      isNotMainMotion,
      isThereSameMotionInstance,
      isNotMainInteractions,
      isThereSameMotionInstance,
      model.getEl()
    );
    let isChanged = false;
    // return;
    // if (!(mainId || interactionId)) return;

    if (mainId && (isNotMainMotion || isThereSameMotionInstance)) {
      const uuid = uniqueId(`mt${random(99, 9999)}${random(99, 599)}`);
      projectData.motions[mainId].instances[uuid] = {
        id: uuid,
        page: localStorage.getItem(current_page_id),
      };
      projectData.motions[mainId].pages = [
        ...new Set([
          ...projectData.motions[mainId].pages,
          localStorage.getItem(current_page_id),
        ]),
      ];
      model.removeAttributes([motionId]);
      model.addAttributes({ [motionInstanceId]: uuid, [mainMotionId]: mainId });
      console.log("main motion", model);
      isChanged = true;
    }

    if (
      interactionsId &&
      (isNotMainInteractions || isThereSameInteractionsInstance)
    ) {
      const uuid = uniqueId(`iNN${random(99, 9999)}${random(99, 599)}`);
      model.removeAttributes([interactionId]);
      model.addAttributes({
        ...buildInteractionsAttributes(
          projectData.interactions[interactionsId],
          uuid,
          true
        ),
        [interactionInstanceId]: uuid,
        [mainInteractionId]: interactionsId,
      });
      isChanged = true;
    }

    if (isChanged) {
      const updateResponse = await db.projects.update(
        +localStorage.getItem(current_project_id),
        {
          motions: cloneDeep(projectData.motions),
          interactions: cloneDeep(projectData.interactions),
        }
      );

      console.log(
        "updateResponse : ",
        updateResponse,
        await getProjectData(),
        projectData.motions,
        model.getEl()
      );
    }

    const childs = model.components().models;
    for (const child of childs) {
      await recuseCmp(child, projectData);
    }
  };
  let timeout;
  editor.on(
    "component:add",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model) => {
      // const projectData = await getProjectData();

      timeout && clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const cmps = editor
          .getWrapper()
          .find(
            `[${motionId}] , [${mainMotionId}] , [${interactionId}] , [${mainInteractionId}]`
          );
        for (const cmp of cmps) {
          await recuseCmp(cmp);
        }
      }, 20);

      // ✅ Write to DB once with the fully updated structure
      // await db.projects.update(
      //   +localStorage.getItem(current_project_id),
      //   cloneDeep({
      //     motions: projectData.motions,
      //     interactions: projectData.interactions,
      //   })
      // );

      // console.log("Final projectData saved:", projectData);
    }
  );

  editor.on(
    "component:remove:before",
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model, remove, options) => {
      if(editor.leaving)return;
      const attributes = model.getAttributes();
      const symbolInfo = getInfinitelySymbolInfo(model);
      if (symbolInfo.isSymbol) return;
      const mainId = attributes[motionId];
      const mainIntaractionsIdAttr = attributes[interactionId];
      if (editor.infLoading) return;
      if (!(mainId || mainIntaractionsIdAttr)) return;
      options.abort = true;
      (async () => {
        const projectData = await getProjectData();
        const motion = projectData.motions[mainId];
        const instancesLength = Object.keys(motion?.instances || {}).length;
        const { projectSettings } = getProjectSettings();
        const cnfrm =
          mainId && mainIntaractionsIdAttr
            ? confirm(
                `This component is main motion and main interactions , are you sure to remove it?`
              )
            : mainId
            ? confirm(
                `This component is main motion , are you sure to remove it?`
              )
            : mainIntaractionsIdAttr
            ? confirm(
                `This component is main interactions , are you sure to remove it?`
              )
            : null;
        if (cnfrm && mainId) {
          // editor.UndoManager.stop();
          model.removeAttributes([mainMotionId, motionId, motionInstanceId]);
          const originalAutosave = editor.Storage.config.autosave;
          editor.Storage.setAutosave(false);
          deleteAttributesInAllPages(
            {
              [mainMotionId]: mainId,
              ...Object.fromEntries(
                Object.keys(motion.instances).map((key) => [
                  motionInstanceId,
                  key,
                ])
              ),
            },
            () => {
              editor.Storage.setAutosave(projectSettings.enable_auto_save);
              // editor.UndoManager.start();
              model.remove();
              projectSettings.enable_auto_save && store({}, editor);
              // options.abort = false;
            }
          );
        }

        if (cnfrm && mainIntaractionsIdAttr) {
          model.removeAttributes([
            mainInteractionId,
            interactionId,
            interactionInstanceId,
          ]);

          editor.Storage.setAutosave(false);
          const interactions = projectData.interactions[mainIntaractionsIdAttr];
          deleteAttributesInAllPages(
            {
              // [interactionId]: mainIntaractionsIdAttr,
              [mainInteractionId]: mainIntaractionsIdAttr,
              [interactionInstanceId]: null,
              ...Object.fromEntries(
                Object.keys(
                  buildInteractionsAttributes(
                    interactions,
                    mainIntaractionsIdAttr
                  ) || {}
                ).map((key) => [key, null])
              ),
            },
            () => {
              editor.Storage.setAutosave(projectSettings.enable_auto_save);
              // editor.UndoManager.start();
              model.remove();
              projectSettings.enable_auto_save && store({}, editor);
              // options.abort = false;
            },
            `[${mainInteractionId}="${mainIntaractionsIdAttr}"][${interactionInstanceId}]`
          );
        }
      })();
    }
  );
};
