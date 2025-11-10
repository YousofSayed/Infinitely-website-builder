import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Layout } from "./Protos/Layout";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  cmpRulesState,
  currentElState,
  mediaConditionState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
} from "../../helpers/atoms";
import { StyleTypography } from "./Protos/StyleTypography";
import { Border } from "./Protos/Border";
import { useEditorMaybe } from "@grapesjs/react";
import { SelectState } from "./Protos/SelectState";
import { SelectClass } from "./Protos/SelectClass";
import { Background } from "./Protos/Background";
import { MultiFunctionProp } from "./Protos/MultiFunctionProp";
import { Animation } from "./Protos/Animation";
import {
  filterTypes,
  filterUnits,
  transformValues,
} from "../../constants/cssProps";
import { Others } from "./Protos/Others";
import { Backdrop } from "./Protos/Backdrop";
import { isArray, isBoolean, isString, random, uniqueId } from "lodash";
import { Accordion } from "../Protos/Accordion";
import { AccordionItem } from "../Protos/AccordionItem";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ErrorBoundary } from "react-error-boundary";
import { styles } from "../../constants/styles";
import { For } from "million/react";
import { Property } from "./Protos/Property";
import { MiniTitle } from "./Protos/MiniTitle";
import { SelectStyle } from "./Protos/SelectStyle";
import { Color } from "./Protos/Color";
import { DirectionsModel } from "./Protos/DirectionsModel";
import { MultiChoice } from "./Protos/MultiChoice";
import { AddMultiValuestoSingleProp } from "./Protos/AddMultiValuestoSingleProp";
import { useUpdateInputValue } from "../../hooks/useUpdateInputValue";
import {
  getCurrentMediaDevice,
  getCurrentSelector,
  toKebabCase,
} from "../../helpers/functions";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { FitTitle } from "./Protos/FitTitle";
import { useRemoveCurrentMedia } from "../../hooks/useRemoveCurrentMedia";
import { OptionsButton } from "../Protos/OptionsButton";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";
import { parse } from "../../helpers/cocktail";

const SelectElementToStyle = () => (
  <h1 className="text-slate-400 custom-font-size text-center animate-pulse capitalize font-semibold bg-slate-900 rounded-lg p-2">
    Select element to style
  </h1>
);

const StyleAccordion = () => {
  // const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const [notifires, setNotifires] = useState({});
  const showAnimationsBuilder = useRecoilValue(showAnimationsBuilderState);
  const allCssProps = useRef(
    Object.fromEntries(
      Object.entries(styles).map(([key, style]) => {
        // style.forEach((props) => {
        //   if (props.cssProp) {
        //     isArray(props.cssProp)
        //       ? prev.push(...props.cssProp)
        //       : prev.push(props.cssProp);
        //   }

        //   if (props.directions) {
        //     console.log(
        //       "all css props : directions ,",
        //       Object.values(props.directions)
        //     );

        //     prev.push(...Object.values(props.directions));
        //   }
        // });
        const cssProps = style.reduce((prev, { cssProp, directions }) => {
          if (cssProp) {
            isArray(cssProp) ? prev.push(...cssProp) : prev.push(cssProp);
          }

          if (directions) {
            console.log(
              "all css props : directions ,",
              Object.values(directions)
            );

            prev.push(...Object.values(directions));
          }

          return prev;
        }, []);
        return [key, cssProps];
      })
    )
  );

  function notifing(styles) {
    let newNotf = {};
    // styles = styles.framesStyles ? styles.framesStyles : styles;
    console.log("frames : ", styles, styles.framesStyles);

    for (const key in styles) {
      const kebabProp = toKebabCase(key);
      for (const [ctg, props] of Object.entries(allCssProps.current)) {
        if (styles[key] && props.includes(kebabProp)) {
          newNotf[ctg] = true;
        }
      }
    }
    console.log("notifires : ", newNotf, styles);

    setNotifires(newNotf);
  }

  console.log("all css props : ", allCssProps.current);
  function getAllStyles(styles) {
    // if (showAnimationsBuilder) {
    //   // setNotifires({});
    //   // return;
    // }
    notifing(styles);
  }

  useUpdateInputValue({
    getAllStyles,
  });

  // useEffect(() => {
  //   const frameStylesHandler = (ev) => {

  //     const framesStyles = ev.detail;
  //     console.log("lol" , framesStyles);
  //     notifing({ framesStyles });
  //   };

  //   keyframeStylesInstance.on(
  //     InfinitelyEvents.keyframe.set,
  //     frameStylesHandler
  //   );

  //   () => {
  //     keyframeStylesInstance.off(
  //       InfinitelyEvents.keyframe.set,
  //       frameStylesHandler
  //     );
  //   };
  // }, [showAnimationsBuilder]);

  return (
    <Accordion>
      <For each={Object.entries(styles)}>
        {([key, styles], i) => (
          <AccordionItem key={i} title={key} notify={notifires[key]}>
            <ErrorBoundary fallbackRender={SelectElementToStyle}>
              <section className="flex flex-col gap-1 w-full  bg-slate-900 rounded-lg">
                <For each={styles}>
                  {(
                    {
                      cssProp,
                      type,
                      title,
                      separator,
                      keywords,
                      directions,
                      choices,
                      placeholder,
                      splitHyphen,
                      Component,
                      special,
                      units,
                    },
                    i
                  ) => (
                    <section
                      title={cssProp}
                      key={i}
                      className="flex flex-col gap-1 w-full p-1 bg-slate-900 rounded-lg"
                    >
                      {type == "title" && <MiniTitle>{title}</MiniTitle>}
                      {type == "property" && (
                        <Property
                          cssProp={cssProp}
                          label={title}
                          placeholder={placeholder || title}
                          special={special}
                        />
                      )}
                      {type == "select" && (
                        <SelectStyle
                          cssProp={cssProp}
                          label={title}
                          placeholder={placeholder || title}
                          keywords={keywords}
                          splitHyphen={splitHyphen}
                        />
                      )}
                      {type == "color" && (
                        <Color
                          label={title}
                          cssProp={cssProp}
                          placeholder={placeholder || title}
                        />
                      )}
                      {type == "directions" && (
                        <DirectionsModel
                          tProp={directions.tProp}
                          rProp={directions.rProp}
                          bProp={directions.bProp}
                          lProp={directions.lProp}
                        />
                      )}
                      {type == "multi-choice" && (
                        <MultiChoice
                          cssProp={cssProp}
                          choices={choices}
                          label={title}
                        />
                      )}
                      {type == "multi-function-prop" && (
                        <MultiFunctionProp
                          cssProp={cssProp}
                          placeholder={placeholder || title}
                          keywords={keywords}
                          units={units}
                        />
                      )}
                      {type == "multi-values-for-single-prop" && (
                        <AddMultiValuestoSingleProp
                          cssProp={cssProp}
                          label={title}
                          keywords={keywords}
                          placeholder={placeholder || title}
                          separator={separator}
                        />
                      )}
                      {type == "custom" && <Component />}
                    </section>
                  )}
                </For>
              </section>
            </ErrorBoundary>
          </AccordionItem>
        )}
      </For>
    </Accordion>
  );
};
/**
 *
 * @param {{className:string}} param0
 * @returns
 */
export const StyleAside = memo(({ className }) => {
  // const [currentEl, setCurrentEl] = useState();
  const editor = useEditorMaybe();
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  const [globalRule, setGlobalRule] = useRecoilState(ruleState);
  const [selector, setSelector] = useRecoilState(selectorState);
  const [showClasses, setShowClasses] = useState(false);
  const [animateRef] = useAutoAnimate();
  const [key, setKey] = useState(uniqueId("Accordion-id-"));
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  // const [globalRule , setGlobalRule] = useRecoilState(ruleState);
  const [notifyStates, setNotifyStates] = useState(false);
  const [notifyClasses, setNotifyClasses] = useState(false);
  const [mediaCondTitle, setMediaCondTitle] = useState("");
  const [mediaCond, setMediaCond] = useRecoilState(mediaConditionState);

  const removeCurrentMediaRule = useRemoveCurrentMedia();

  useLayoutEffect(() => {
    const showVal =
      globalRule.ruleString.includes("::before") ||
      !globalRule.ruleString.includes("::after");
    setShowClasses(showVal);
  }, [globalRule]);

  useEffect(() => {
    if (!editor) return;
    const sel = editor.getSelected();
    if (!sel) {
      setNotifyClasses(false);
      return;
    }
    const classes = sel.getClasses() || [];
    setNotifyClasses(classes.length > 0);
  }, [editor, currentEl]);

  useEffect(() => {
    if (!editor) return;
    const sle = editor.getSelected();
    if (!sle) return;
    const callback = () => {
      let currentSelector = getCurrentSelector(selector, sle);
      const currentMedia = getCurrentMediaDevice(editor);
      const mediaPx = editor.Devices.get(editor.getDevice()).attributes
        .widthMedia;
      // const mediaCond = editor.getConfig().mediaCondition;
      const selectorWithRule = `${currentSelector}${globalRule.ruleString}`;
      console.log(
        "cmprs",
        cmpRules,
        selectorWithRule,
        !cmpRules.some((rule) => {
          const mainCond = rule?.rule?.trim?.() === selectorWithRule;
          const isBoolCond =
            isBoolean(rule.atRuleType) && isBoolean(currentMedia.atRuleType)
              ? Boolean(rule.atRuleType) == Boolean(currentMedia.atRuleType)
              : false;
          const isMediaStringCond =
            isString(rule.atRuleType) && isString(currentMedia.atRuleType)
              ? rule.atRuleType == currentMedia.atRuleType
              : false;

          return mainCond && (isBoolCond || isMediaStringCond);
        })
      );
      const title = `${mediaCond} ${mediaPx ? `(${mediaPx})` : ""} ${
        editor.config.mediaCondition ? ":" : ""
      } 
    ${selectorWithRule}`;

      const edRule = editor.CssComposer.getRule(selectorWithRule.trim(), {
        ...currentMedia,
      });

      if (edRule) {
        setMediaCondTitle(title);
      } else {
        setMediaCondTitle("");
      }
    };

    callback();
    editor.on("change:device", callback);
    return () => {
      editor.off("change:device", callback);
    };
  }, [cmpRules, editor, currentEl, globalRule, mediaCond]);

  useEffect(() => {
    setKey(uniqueId("Accordion-id-"));
  }, [showAnimeBuilder]);

  useEffect(() => {
    if (!editor) {
      setNotifyStates(false);
      return;
    }
    if (!editor.getSelected()) {
      setNotifyStates(false);
      return;
    }

    const currentSelector = getCurrentSelector(selector, editor.getSelected());
    console.log(
      "seco currentSelector for states notify : ",
      currentSelector,
      selector
    );

    // for (const rule of cmpRules) {
    //   console.log(`seco : `  , rule.states && currentSelector && rule.rule.startsWith(currentSelector));

    //   if (rule.states && currentSelector && rule.rule.startsWith(currentSelector)) {
    //     return;
    //   }
    // }
    setNotifyStates(
      cmpRules.some(
        (rule) =>
          rule.states &&
          currentSelector &&
          rule.rule.startsWith(currentSelector)
      )
    );
  }, [cmpRules, currentEl, editor, selector]);

  const copyStyles = async () => {
    if (!editor) return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);

    //==========
    const outPut = editor.Css.getRule(
      `${currentSelector}${globalRule.ruleString}`,
      { ...Media }
    )?.toJSON()?.style;

    console.log("style output : ", outPut, JSON.stringify(outPut));
    await navigator.clipboard.writeText(JSON.stringify(outPut));
    toast.success(<ToastMsgInfo msg={`Styles copied successfully 👍`} />);
    return outPut || {};
  };

  const pasteStyles = async () => {
    const styles = parse(await navigator.clipboard.readText());
    if (!styles) {
      toast.error(<ToastMsgInfo msg={`Styles not valied 🥺`} />);
      return;
    }
    const cnfrm = confirm(`Are You Sure To Overwrite Styles ?`);
    if(!cnfrm)return;
    const slEL = editor?.getSelected();
    const Media = getCurrentMediaDevice(editor);
    const currentSelector = getCurrentSelector(selector, slEL);

    const rule = editor.Css.getRule(
      `${currentSelector}${globalRule.ruleString}`,
      { ...Media }
    );

    editor.CssComposer.remove(rule);
    editor.CssComposer.setRule(
      `${currentSelector}${globalRule.ruleString}`,
      styles,
      {
        ...Media,
        addStyles: true,
        validate: false,
        // inline:true,
        addStyle: true,
      }
    );

    setCurrentEl({
      currentEl: JSON.parse(JSON.stringify(slEL)),
    });
  };

  return (
    <section
      // key={key}
      ref={animateRef}
      className="flex flex-col w-full h-full gap-2 mt-2"
    >
      { (
        <section className="flex gap-2">
          <FitTitle
            isShowTooltib={Boolean(mediaCondTitle)}
            className={`custom-font-size w-full ${!mediaCondTitle && 'justify-center font-bold animate-pulse will-change-[transform,opacity] capitalize'}  text-ellipsis whitespace-nowrap overflow-hidden flex items-center py-2`}
          >
            {mediaCondTitle || 'There is no rule yet'}
          </FitTitle>
          <OptionsButton className="w-[35p] h-full bg-slate-800">
            <section className="flex flex-col items-center gap-3">
              <SmallButton
                className="h-[35px]"
                showTooltip
                tooltipTitle="Copy Styles"
                onClick={() => {
                  copyStyles();
                }}
              >
                {Icons.copy({ fill: "white" })}
              </SmallButton>
              <SmallButton
                className="h-[35px]"
                showTooltip
                tooltipTitle="Paste Styles"
                onClick={() => {
                  pasteStyles();
                }}
              >
                {Icons.paste({ fill: "white" })}
              </SmallButton>
            </section>
          </OptionsButton>
          <SmallButton
            className="hover:bg-[crimson!important] bg-slate-800"
            showTooltip
            tooltipTitle="Delete Current Rule"
            onClick={() => {
              removeCurrentMediaRule();
            }}
          >
            {Icons.trash("white")}
          </SmallButton>
        </section>
      )}
      {/* {!showAnimeBuilder && (
        <>
          <DetailsNormal className="bg-slate-950 " label={"Classes"}>
            <SelectClass />
          </DetailsNormal>

          <DetailsNormal label={"States"} className="bg-slate-950">
            <SelectState />
          </DetailsNormal>
        </>
      )}

       <DetailsNormal
          label={"layout"}
        >
          <Layout />
        </DetailsNormal> */}

      {/* {!showAnimeBuilder && (
        <InfAccordion>
          <AccordionItem
            title={"classes"}
            slotProps={{ transition: { unmountOnExit: true } }}
          >
            {showClasses ? <SelectClass /> : null}
          </AccordionItem>

          <AccordionItem
            key={2}
            title={"states"}
            slotProps={{ transition: { unmountOnExit: true } }}
          >
            <SelectState />
          </AccordionItem>
        </InfAccordion>
      )} */}

      <>
        {!showAnimeBuilder && (
          <Accordion>
            <AccordionItem title={"classes"} notify={notifyClasses}>
              {showClasses ? <SelectClass /> : null}
            </AccordionItem>

            <AccordionItem key={2} title={"states"} notify={notifyStates}>
              <SelectState />
            </AccordionItem>
          </Accordion>
        )}

        {showAnimeBuilder ? <StyleAccordion /> : <StyleAccordion />}
      </>
    </section>
  );
});

//  <InfAccordion>
//       {/* <Details label={'content'}>
//       <Content />
//     </Details> */}

//       {/* <section id="styles"></section> */}
//       {/* <AsideControllers /> */}

//       <AccordionItem
//         title={"layout"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <Layout />
//       </AccordionItem>

//       <AccordionItem
//         title={"Typography"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
// <StyleTypography />
//       </AccordionItem>

//       <AccordionItem
//         title={"border"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <Border />
//       </AccordionItem>

//       <AccordionItem
//         title={"background"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <Background />
//       </AccordionItem>

//       <AccordionItem
//         title={"backdrop"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <Backdrop />
//       </AccordionItem>

//       <AccordionItem
//         title={"Filters"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <MultiFunctionProp
//           cssProp={"filter"}
//           keywords={filterTypes}
//           units={filterUnits}
//           placeholder={"Select Filter"}
//         />
//       </AccordionItem>

//       <AccordionItem
//         title={"Transform"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <MultiFunctionProp
//           cssProp={"transform"}
//           keywords={transformValues}
//           placeholder={"Select Prop"}
//         />
//       </AccordionItem>

//       {!showAnimeBuilder && (
//         <AccordionItem
//           title={"Animation"}
//           slotProps={{ transition: { unmountOnExit: true } }}
//         >
//           <Animation />
//         </AccordionItem>
//       )}

//       <AccordionItem
//         title={"Others"}
//         slotProps={{ transition: { unmountOnExit: true } }}
//       >
//         <Others />
//       </AccordionItem>
//     </InfAccordion>
