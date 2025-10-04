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
  preventSelectNavigation,
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

    // console.log(
    //   "instances : ",
    //   model,
    //   model.getEl(),
    //   editor.getWrapper().find(`[${motionId}="${mainId}"] `)
    // );

    // console.log(
    //   "handlers : ",
    //   isNotMainMotion,
    //   isThereSameMotionInstance,
    //   isNotMainInteractions,
    //   isThereSameMotionInstance,
    //   model.getEl()
    // );
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
      preventSelectNavigation(editor, model);
      console.log("main motion", model, model.getEl());
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
      preventSelectNavigation(editor, model);
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

      // console.log(
      //   "updateResponse : ",
      //   updateResponse,
      //   await getProjectData(),
      //   projectData.motions,
      //   model.getEl()
      // );
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
      // 1- Handle Motions
      // const attributes = model.getAttributes();
      // const mainId = attributes[motionId] || attributes[mainMotionId];
      // const instanceId = attributes[motionInstanceId];
      // const interactionsId =
      //   attributes[interactionId] || attributes[mainInteractionId];
      // const interactionInstanceIdAttr = attributes[interactionInstanceId];

      // const isNotMainMotion =
      //   editor.getWrapper().find(`[${motionId}="${mainId}"] `).length > 1;
      // const isThereSameMotionInstance =
      //   editor.getWrapper().find(`[${motionInstanceId}="${instanceId}"] `)
      //     .length > 1;
      // const isNotMainInteractions =
      //   editor.getWrapper().find(`[${interactionId}="${interactionsId}"]`)
      //     .length > 1;
      // const isThereSameInteractionsInstance =
      //   editor
      //     .getWrapper()
      //     .find(`[${interactionInstanceId}="${interactionInstanceIdAttr}"] `)
      //     .length > 1;

      // if (!isNotMainMotion && instanceId) {
      //   model.removeAttributes([mainMotionId, motionInstanceId]);

      //   model.addAttributes({
      //     [motionId]: mainId,
      //   });
      // }

      // if (!isNotMainInteractions && interactionInstanceIdAttr) {
      //   model.removeAttributes([
      //     interactionId,
      //     mainInteractionId,
      //     interactionInstanceId,
      //   ]);

      //   model.addAttributes({
      //     [interactionId]: interactionsId,
      //   });
      // }

    
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

  const removerBeforeHandler =
    /**
     *
     * @param {import('grapesjs').Component} model
     */
    (model, remove, options) => {
      console.log(
        "from remover : ",
        editor.infLoading,
        options.infinitelyClear
      );

      if (editor.leaving || editor.infLoading || options.infinitelyClear)
        return;
      const attributes = model.getAttributes();
      const symbolInfo = getInfinitelySymbolInfo(model);
      if (symbolInfo.isSymbol) return;
      const mainId = attributes[motionId];
      const mainIntaractionsIdAttr = attributes[interactionId];
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
                `This component is the main motion and main interactions. If you remove them, all their instances will also be removed (In current page only). Are you sure you want to remove it?`
              )
            : mainId
            ? confirm(
                `This component is the main motion. If you remove it, all its instances will also be removed (In current page only). Are you sure you want to remove it?`
              )
            : mainIntaractionsIdAttr
            ? confirm(
                `This component is the main interactions. If you remove it, all its instances will also be removed (In current page only). Are you sure you want to remove it?`
              )
            : null;
        if (!cnfrm) return;
        if (cnfrm && mainId) {
          // editor.UndoManager.stop();
          const keysWillRemoved = {
            [motionId]: mainId,
            [mainMotionId]: mainId,
            [motionInstanceId]: "",
            ...Object.fromEntries(
              Object.keys(motion.instances).map((key) => [
                motionInstanceId,
                key,
              ])
            ),
          };
          // model.removeAttributes([mainMotionId, motionId, motionInstanceId]);
          // const originalAutosave = editor.Storage.config.autosave;
          editor
            .getWrapper()
            .find(`[${motionId}="${mainId}"] , [${mainMotionId}="${mainId}"]`)
            .forEach((model) => {
              model.removeAttributes(Object.keys(keysWillRemoved));
            });
          editor.Storage.setAutosave(false);
          // deleteAttributesInAllPages(keysWillRemoved, () => {
          //   editor.Storage.setAutosave(projectSettings.enable_auto_save);
          //   // editor.UndoManager.start();
          //   model.remove();
          //   projectSettings.enable_auto_save && store({}, editor);
          //   // options.abort = false;
          //   console.log("motion removed", mainId, mainIntaractionsIdAttr);
          // });
        }

        if (cnfrm && mainIntaractionsIdAttr) {
          const keysWillRemoved = [
            mainInteractionId,
            interactionId,
            interactionInstanceId,
          ];

          editor
            .getWrapper()
            .find(
              `[${interactionId}="${mainIntaractionsIdAttr}"] , [${mainInteractionId}="${mainIntaractionsIdAttr}"]`
            )
            .forEach((model) => {
              model.removeAttributes(keysWillRemoved);
            });

          model.removeAttributes();

          editor.Storage.setAutosave(false);
          // const interactions = projectData.interactions[mainIntaractionsIdAttr];
          // deleteAttributesInAllPages(
          //   {
          //     // [interactionId]: mainIntaractionsIdAttr,
          //     [mainInteractionId]: mainIntaractionsIdAttr,
          //     [interactionInstanceId]: null,
          //     ...Object.fromEntries(
          //       Object.keys(
          //         buildInteractionsAttributes(
          //           interactions,
          //           mainIntaractionsIdAttr
          //         ) || {}
          //       ).map((key) => [key, null])
          //     ),
          //   },
          //   () => {
          // editor.Storage.setAutosave(projectSettings.enable_auto_save);
          // // editor.UndoManager.start();
          // model.remove();
          // projectSettings.enable_auto_save && store({}, editor);
          // // options.abort = false;
          //   },
          //   `[${mainInteractionId}="${mainIntaractionsIdAttr}"][${interactionInstanceId}]`
          // );
        }

        editor.Storage.setAutosave(projectSettings.enable_auto_save);
        // editor.UndoManager.start();
        model.remove();
        projectSettings.enable_auto_save && store({}, editor);
        // options.abort = false;
      })();
    };
  editor.removerBeforeHandler = removerBeforeHandler;
  editor.on("component:remove:before", editor.removerBeforeHandler);
};
