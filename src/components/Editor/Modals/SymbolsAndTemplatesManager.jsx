
import { random } from "@/helpers/cocktail";
import { Icons } from "@/components/Icons/Icons";
import { MultiTab } from "@/components/Protos/Multitabs";
import { Symbols } from "@/components/Editor/Protos/Symbols";
import { SymbolsAndTemplatesHandler } from "@/components/Editor/Protos/SymbolsAndTemplatesHandler";
import { TabLabel } from "@/components/Editor/Protos/TabLabel";
import { Templates } from "@/components/Editor/Protos/Templates";
import { UploadBlocks } from "@/components/Editor/Protos/UploadBlocks";
import { ShowBasedOnAppType } from "@/components/Editor/ShowBasedOnAppType";
// import { WpSymbolsAndTemplatesHandler } from "@/components/Editor/Modals/wordpress/SymbolsAndTemplatesHandler";
import React from "react";

export const SymbolsAndTemplatesManager = () => {
  return (
    <MultiTab
      tabs={[
        {
          title: <TabLabel label="Symbols" icon={Icons.components("white")} />,
          content: (
            <SymbolsAndTemplatesHandler type="symbol" />
            // <>
            //   <ShowBasedOnAppType type="normal">
            //     <SymbolsAndTemplatesHandler type="symbol" />
            //   </ShowBasedOnAppType>

            //   <ShowBasedOnAppType type="wordpress">
            //     <WpSymbolsAndTemplatesHandler type="symbols" />
            //   </ShowBasedOnAppType>
            // </>
          ),
        },
        {
          title: (
            <TabLabel
              label="Templates"
              icon={Icons.templates({ fill: "white", height: 24, width: 24 })}
            />
          ),
          content: (
            <SymbolsAndTemplatesHandler type="template" />
            // <>
            //   <ShowBasedOnAppType type="normal">
            //     <SymbolsAndTemplatesHandler type="template" />
            //   </ShowBasedOnAppType>

            //   <ShowBasedOnAppType type="wordpress">
            //     <WpSymbolsAndTemplatesHandler type="templates" />
            //   </ShowBasedOnAppType>
            // </>
          ),
        },
        {
          title: (
            <TabLabel
              label="Upload"
              icon={Icons.upload({ strokeColor: "white" })}
            />
          ),
          content: <UploadBlocks />,
        },
      ]}
    />
  );
};
