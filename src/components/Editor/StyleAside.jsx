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
  currentElState,
  ruleState,
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
import { isArray, random, uniqueId } from "lodash";
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
import { toKebabCase } from "../../helpers/functions";

const allCssProps = Object.fromEntries(
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
        console.log("all css props : directions ,", Object.values(directions));

        prev.push(...Object.values(directions));
      }

      return prev;
    }, []);
    return [key, cssProps];
  })
);

const SelectElementToStyle = () => (
  <h1 className="text-slate-400 custom-font-size text-center animate-pulse capitalize font-semibold bg-slate-900 rounded-lg p-2">
    Select element to style
  </h1>
);

const StyleAccordion = () => {
  // const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const [notifires, setNotifires] = useState({});

  console.log("all css props : ", allCssProps);

  useUpdateInputValue({
    getAllStyles(styles) {
      let newNotf = {};
      for (const key in styles) {
        const kebabProp = toKebabCase(key);
        for (const [ctg, props] of Object.entries(allCssProps)) {
          if (styles[key] && props.includes(kebabProp)) {
            newNotf[ctg] = true;
          } 
        }
      }
      console.log('notifires : ' ,newNotf , styles);
      
      setNotifires(newNotf);
    },
  });

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
  // const [cmpRules , set ]
  // return <Accordion>
  //   <AccordionItem label={"Layout"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <Layout />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"Typography"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <StyleTypography />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"border"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <Border />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"background"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <Background />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"backdrop"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <Backdrop />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"Filters"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <MultiFunctionProp
  //         cssProp={"filter"}
  //         keywords={filterTypes}
  //         units={filterUnits}
  //         placeholder={"Select Filter"}
  //       />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   <AccordionItem title={"Transform"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //       <MultiFunctionProp
  //         cssProp={"transform"}
  //         keywords={transformValues}
  //         placeholder={"Select Prop"}
  //       />
  //     </ErrorBoundary>
  //   </AccordionItem>

  //   {!showAnimeBuilder && (
  //     <AccordionItem title={"Animation"}>
  //       <ErrorBoundary fallbackRender={SelectElementToStyle}>
  //         <Animation />
  //       </ErrorBoundary>
  //     </AccordionItem>
  //   )}

  //   <AccordionItem title={"Others"}>
  //     <ErrorBoundary fallbackRender={SelectElementToStyle} >
  //       <Others />
  //     </ErrorBoundary>
  //   </AccordionItem>
  // </Accordion>;
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
  const [selector, setSelector] = useRecoilState(ruleState);
  const [showClasses, setShowClasses] = useState(false);
  const [animateRef] = useAutoAnimate();
  const [key, setKey] = useState(uniqueId("Accordion-id-"));
  // useEffect(() => {
  //   /**
  //    *
  //    * @param {CustomEvent} ev
  //    */
  //   const onCurrentEl = (ev) => {
  //     setCurrentEl((oldVal) => ({ currentEl: ev.detail.currentEl }));
  //   };

  //   window.addEventListener("currentel", onCurrentEl);

  //   return () => {
  //     window.removeEventListener("currentel", onCurrentEl);
  //   };
  // });

  useLayoutEffect(() => {
    // console.log(
    //   selector.ruleString,
    //   "selloooooooooooooooooo",
    //   selector.ruleString.includes("::before") ||
    //     !selector.ruleString.includes("::after")
    // );
    const showVal =
      selector.ruleString.includes("::before") ||
      !selector.ruleString.includes("::after");
    setShowClasses(showVal);
  }, [selector]);

  useEffect(() => {
    setKey(uniqueId("Accordion-id-"));
  }, [showAnimeBuilder]);

  return (
    <section
      // key={key}
      ref={animateRef}
      className="flex flex-col w-full h-full gap-2 mt-2"
    >
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
            <AccordionItem title={"classes"}>
              {showClasses ? <SelectClass /> : null}
            </AccordionItem>

            <AccordionItem key={2} title={"states"}>
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
