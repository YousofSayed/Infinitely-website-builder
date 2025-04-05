import React from "react";
import { MultiTab } from "../../Protos/Multitabs";
import { TabLabel } from "../Protos/TabLabel";
import { Icons } from "../../Icons/Icons";
import { Symbols } from "../Protos/Symbols";
import { Templates } from "../Protos/Templates";
import { SymbolsAndTemplatesHandler } from "../Protos/SymbolsAndTemplatesHandler";
import { random } from "../../../helpers/cocktail";
import { UploadBlocks } from "../Protos/UploadBlocks";

export const SymbolsAndTemplatesManager = () => {
  return (
    <MultiTab
      tabs={[
        {
          title: <TabLabel label="Symbols" icon={Icons.components("white")} />,
          content: <SymbolsAndTemplatesHandler type="symbol" />,
        },
        {
          title: (
            <TabLabel
              label="Templates"
              icon={Icons.templates({ fill: "white", height: 24, width: 24 })}
            />
          ),
          content: <SymbolsAndTemplatesHandler type="template" />,
        },
        {
          title: (
            <TabLabel
              label="Upload"
              icon={Icons.upload({ strokeColor: "white" })}
            />
          ),
          content:<UploadBlocks />
        },
      ]}
    />
  );
};
