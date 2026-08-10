import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { keyframeStylesInstance } from "@/constants/InfinitelyInstances";
import {
  current_project_id,
  current_symbol_id,
  inf_class_name,
} from "@/constants/shared";
import {
  cmpRulesState,
  framesStylesState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
  showStylesBuilderForMotionBuilderState,
} from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  offlineInstallerWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  arrangeDevicesPeriority,
  doInWordpress,
  getComponentRules,
  getCurrentMediaDevice,
  getCurrentSelector,
  getInfinitelySymbolInfo,
  getProjectData,
  getProjectId,
  getProjectSettings,
  reorderCss,
  store,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { useRemoveCssProp } from "@/hooks/useRemoveCssProp";
import { useEditorMaybe } from "@grapesjs/react";
import { random, uniqueId } from "lodash";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";

let setStyleTimeout = null;

/**
 *
 * @param {{ifrDocument:Document , currentEl:HTMLElement , cssProp:string , value:string}} param0
 */
export function useSetClassForCurrentEl() {
  const editor = useEditorMaybe();
  const rule = useRecoilValue(ruleState);
  const [selector, setSelector] = useRecoilState(selectorState);
  const removeProp = useRemoveCssProp();
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [frameStyles, setFrameStyles] = useRecoilState(framesStylesState);

  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
  const [showStylesBuilder, setShowStylesBuilder] = useRecoilState(
    showStylesBuilderForMotionBuilderState,
  );

  // const setAnimeStyles = useSetRecoilState(animeStylesState);

  return ({ cssProp, value }) => {
    const setter = () => {
      let newCssProps = {};
      const selectedCmp = editor.getSelected();
      if (!selectedCmp && !showAnimationsBuilder) {
        toast.warn(
          <ToastMsgInfo msg={` please select component to apply style `} />,
        );
        return;
      }
      if (Array.isArray(cssProp) && Array.isArray(value)) {
        cssProp.forEach((prop, i) => {
          // if (!CSS.supports(prop, value[i]) && value[i]) {
          //   removeProp({ cssProp: prop });
          //   return;
          // }

          newCssProps = { ...newCssProps, [prop]: value[i] };
        });
      } else if (Array.isArray(cssProp) && !Array.isArray(value)) {
        cssProp.forEach((prop, i) => {
          // if (!CSS.supports(prop, value) && value) {
          //   removeProp({ cssProp: prop });
          //   return;
          // }

          newCssProps = { ...newCssProps, [prop]: value };
        });
      } else {
        newCssProps = { ...newCssProps, [cssProp]: value };
        // CSS.supports(cssProp, value) && value
        //   ? { ...newCssProps, [cssProp]: value }
        //   : { ...newCssProps };
        // !value && removeProp({ cssProp })
        !value && (newCssProps[cssProp] = "");
        // console.log("elssssssssssssooooooooooo", newCssProps, !value);
      }

      if (showAnimationsBuilder || showStylesBuilder) {
        newCssProps = newCssProps ? newCssProps : { [cssProp]: "" };
        // setAnimeStyles((old) => ({ ...old, ...newCssProps }));
        // setAnimeStyles({ ...newCssProps });
        console.log(newCssProps, "from animations up");
        setFrameStyles(newCssProps);
        keyframeStylesInstance.emit(InfinitelyEvents.keyframe.set, newCssProps);
        return;
      } //stop any action if animation builder is on

      if (
        rule.ruleString.endsWith("before") ||
        rule.ruleString.endsWith("after")
      ) {
        newCssProps.content = " '' ";
      }

      const Media = getCurrentMediaDevice(editor);
      const sle = editor.getSelected();

      let currentSelector = getCurrentSelector(selector, sle);
      console.log("from set style current selector is : ", currentSelector);
      const classes = [...sle.getClasses()];
      const isCurrentSelectorAdded = classes.some(
        (cls) => cls === currentSelector,
      );

      if (!currentSelector) {
        const newClassName = uniqueId(
          `infcls-${uniqueID()}-${random(100, 9999)}-`,
        );
        sle.addClass(newClassName);
        sle.addAttributes({ [inf_class_name]: newClassName });
        const classes = [...sle.getClasses()];
        const isNewAdded = classes.some((cls) => cls === newClassName);
        if (isNewAdded) {
          currentSelector = `.${newClassName}`;
        } else {
          throw new Error(`New class not added!`);
        }
      } else if (currentSelector && !isCurrentSelectorAdded) {
        sle.addClass(currentSelector);
      }
      console.log(
        "current selector from updater : ",
        currentSelector,
        newCssProps,
      );

      const symbolInfo = getInfinitelySymbolInfo(sle);
      if (symbolInfo.isSymbol) {
        sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
      } else {
        sessionStorage.removeItem(current_symbol_id);
      }

      console.log(
        "new media devices :",
        editor.DeviceManager.getAll()
          .toArray()
          .map((dev) => dev.attributes),
      );

      editor.CssComposer.setRule(
        `${currentSelector}${rule.ruleString}`,
        newCssProps || { [cssProp]: "" },
        {
          ...Media,
          // addStyle: false,
          addStyles: true,
          // validate: true,
          // inline:true,
          // addStyle: true,
        },
      );

      // reorderCss(editor);
      const rulesParsed = getComponentRules({
        editor,
        cmp: editor.getSelected(),
      });

      setCmpRules(rulesParsed.rules || []);

      if (symbolInfo.isSymbol) {   

        if (!getProjectSettings().projectSettings.enable_auto_save) {
          wpWorkerCallbackMaker(
            pageBuilderWorker,
            "wp_update_symbol",
            {
              projectId: getProjectId(),
              symbol_id: symbolInfo.mainId,
              symbol_meta: {
                inf_meta: {
                  before_save: {
                    css: rulesParsed.stringRules,
                  },
                },
              },
            },
            (props) => {
              if (props.done) {
                editor.trigger(InfinitelyEvents.blocks.symbols_need_reload, {
                  state: true,
                });
              }
            },
          );
        }
      }

      editor.trigger("inf:rules:update", {
        rules: newCssProps,
      });
    };

    setStyleTimeout && clearTimeout(setStyleTimeout);
    setStyleTimeout = setTimeout(() => {
      setter();
    }, 100);
  };
}
