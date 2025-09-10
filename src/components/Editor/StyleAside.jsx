import React, { memo, useEffect, useLayoutEffect, useState } from "react";
import { Aside } from "./Protos/Aside";
import { Details } from "./Protos/Details";
import { Layout } from "./Protos/Layout";
import {
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  currentElState,
  ruleState,
  selectorState,
  showAnimationsBuilderState,
} from "../../helpers/atoms";
import { StyleTypography } from "./Protos/StyleTypography";
import { Content } from "./Protos/Content";
import { Size } from "./Protos/Size";
import { Positioning } from "./Protos/Positioning";
import { Border } from "./Protos/Border";
import { Select } from "./Protos/Select";
// import {  selectors } from "../../constants/cssProps";
import { useEditorMaybe } from "@grapesjs/react";
import { AsideControllers } from "./Protos/AsideControllers";
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
// import MonacoEditorWithESM from "./Protos/CSSEditor";
import { Backdrop } from "./Protos/Backdrop";
import { AccordionProvider, DetailsNormal } from "../Protos/DetailsNormal";
// import { AccordionItem } from "@heroui/accordion";
// import { InfAccordion } from "../Protos/InfAccordion";
// import { InfAccordionItem } from "../Protos/InfAccordionItem";
import { random, uniqueId } from "lodash";
import { Accordion } from "../Protos/Accordion";
import { AccordionItem } from "../Protos/AccordionItem";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Show } from "../Protos/Show";
import { ErrorBoundary } from "react-error-boundary";

const SelectElementToStyle = () => (
  <h1 className="text-slate-400 custom-font-size text-center animate-pulse capitalize font-semibold bg-slate-900 rounded-lg p-2">
    Select element to style
  </h1>
);

const StyleAccordion = () => {
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  return <Accordion>
    <AccordionItem label={"Layout"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <Layout />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"Typography"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <StyleTypography />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"border"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <Border />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"background"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <Background />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"backdrop"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <Backdrop />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"Filters"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <MultiFunctionProp
          cssProp={"filter"}
          keywords={filterTypes}
          units={filterUnits}
          placeholder={"Select Filter"}
        />
      </ErrorBoundary>
    </AccordionItem>

    <AccordionItem title={"Transform"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle}>
        <MultiFunctionProp
          cssProp={"transform"}
          keywords={transformValues}
          placeholder={"Select Prop"}
        />
      </ErrorBoundary>
    </AccordionItem>

    {!showAnimeBuilder && (
      <AccordionItem title={"Animation"}>
        <ErrorBoundary fallbackRender={SelectElementToStyle}>
          <Animation />
        </ErrorBoundary>
      </AccordionItem>
    )}

    <AccordionItem title={"Others"}>
      <ErrorBoundary fallbackRender={SelectElementToStyle} >
        <Others />
      </ErrorBoundary>
    </AccordionItem>
  </Accordion>;
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
