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
  useEffect(() => {
    /**
     *
     * @param {CustomEvent} ev
     */
    const onCurrentEl = (ev) => {
      setCurrentEl((oldVal) => ({ currentEl: ev.detail.currentEl }));
    };

    window.addEventListener("currentel", onCurrentEl);

    return () => {
      window.removeEventListener("currentel", onCurrentEl);
    };
  });

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

  return (
    <section
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
        {currentEl.currentEl || showAnimeBuilder ? (
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
            <Accordion>
              <AccordionItem label={"Layout"}>
                <Layout />
              </AccordionItem>

              <AccordionItem title={"Typography"}>
                <StyleTypography />
              </AccordionItem>

              <AccordionItem title={"border"}>
                <Border />
              </AccordionItem>

              <AccordionItem title={"background"}>
                <Background />
              </AccordionItem>

              <AccordionItem
                title={"backdrop"}
                slotProps={{ transition: { unmountOnExit: true } }}
              >
                <Backdrop />
              </AccordionItem>

              <AccordionItem
                title={"Filters"}
                slotProps={{ transition: { unmountOnExit: true } }}
              >
                <MultiFunctionProp
                  cssProp={"filter"}
                  keywords={filterTypes}
                  units={filterUnits}
                  placeholder={"Select Filter"}
                />
              </AccordionItem>

              <AccordionItem
                title={"Transform"}
                slotProps={{ transition: { unmountOnExit: true } }}
              >
                <MultiFunctionProp
                  cssProp={"transform"}
                  keywords={transformValues}
                  placeholder={"Select Prop"}
                />
              </AccordionItem>

              {!showAnimeBuilder && (
                <AccordionItem
                  title={"Animation"}
                  slotProps={{ transition: { unmountOnExit: true } }}
                >
                  <Animation />
                </AccordionItem>
              )}

              <AccordionItem
                title={"Others"}
                slotProps={{ transition: { unmountOnExit: true } }}
              >
                <Others />
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <section className="w-full h-full flex justify-center items-center ">
            <section className="text-slate-400 text-xl animate-pulse bg-slate-800 p-2 rounded-lg font-semibold capitalize text-center">
              Select element to start style
            </section>
          </section>
        )}
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
