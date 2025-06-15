import React, { memo, useEffect, useState } from "react";
import { Aside } from "./Protos/Aside";
import { Details } from "./Protos/Details";
import { Layout } from "./Protos/Layout";
import { selector, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentElState,
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
import MonacoEditorWithESM from "./Protos/CSSEditor";
import { Backdrop } from "./Protos/Backdrop";
import { DetailsNormal } from "../Protos/DetailsNormal";
import { AccordionItem } from "@heroui/accordion";
import { InfAccordion } from "../Protos/InfAccordion";
import { InfAccordionItem } from "../Protos/InfAccordionItem";
/**
 *
 * @param {{className:string}} param0
 * @returns
 */
export const StyleAside = memo(({ className }) => {
  // const [currentEl, setCurrentEl] = useState();
  const editor = useEditorMaybe();
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const setCurrentEl = useSetRecoilState(currentElState);

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

  return (
    <section className="flex flex-col gap-2 mt-2">
      {!showAnimeBuilder && (
        <InfAccordion>
          <AccordionItem
            title={"classes"}
            slotProps={{ transition: { unmountOnExit: true } }}
          >
            <SelectClass />
          </AccordionItem>
        
        
          <AccordionItem
            title={"states"}
            slotProps={{ transition: { unmountOnExit: true } }}
          >
            <SelectState />
          </AccordionItem>
        </InfAccordion>
      )}

      <InfAccordion>
        {/* <Details label={'content'}>
        <Content />
      </Details> */}

        {/* <section id="styles"></section> */}
        {/* <AsideControllers /> */}

        <AccordionItem
          title={"layout"}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <Layout />
        </AccordionItem>

        <AccordionItem
          title={"Typography"}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <StyleTypography />
        </AccordionItem>

        <AccordionItem
          title={"border"}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <Border />
        </AccordionItem>

        <AccordionItem
          title={"background"}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
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
      </InfAccordion>
    </section>
  );
});
