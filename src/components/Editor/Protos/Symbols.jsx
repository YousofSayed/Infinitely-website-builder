import React, { useState } from "react";
import { blocksArrayType, symbolsType } from "../../../helpers/jsDocs";
import { useLiveQuery } from "dexie-react-hooks";
import {
  extractAllRulesWithChildRules,
  getProjectData,
} from "../../../helpers/functions";
import { Button } from "../../Protos/Button";
import { Icons } from "../../Icons/Icons";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { useEditorMaybe } from "@grapesjs/react";

export const Symbols = () => {
  const [symbols, setSymbols] = useState(blocksArrayType);
  const projectId = +localStorage.getItem(current_project_id);
  const editor = useEditorMaybe();
  useLiveQuery(async () => {
    const projectData = await await getProjectData();
    const blocks = Object.values(projectData.blocks);
    const symbols = blocks.filter((block) => block.type == "symbol");
    setSymbols(symbols);
    return symbols;
  });

  const deleteSymbol = async (id = "" , name='') => {
    const projectData = await await getProjectData();
    const newBlocks = {};
    const blocks = structuredClone(projectData.blocks);
    delete blocks[id];
    // const filterdSymbols = symbols
    //   .filter((symbol) => symbol.id != id)
    //   .forEach((symbol) => {
    //     newBlocks[symbol.id] = symbol;
    //   });
    await db.projects.update(projectId, {
      blocks,
    });
    editor.trigger("block:add");
    editor.trigger("block:update");
    toast.success(<ToastMsgInfo msg={`${name} Symbol removed successfully`} />);
  };

  const exportSymbol = async () => {
    const allRules = extractAllRulesWithChildRules(
      editor.getCss(),
      editor.getSelected()
    );

    console.log(allRules);
    
  };

  return (
    <section className="h-full w-full grid grid-cols-4 gap-2 p-1">
      {symbols.map((symbol, i) => {
        return (
          <section
            key={i}
            className="p-2 bg-slate-800 max-h-[200px] rounded-lg flex flex-col gap-3"
          >
            <h1 className="font-semibold capitalize text-slate-200 text-lg custom-font-size first-letter:text-blue-400">
              {symbol.name}
            </h1>
            <figure className="w-full p-1 bg-slate-900 max-h-[50%] h-[50%] grid place-content-center rounded-lg">
              <img src={URL.createObjectURL(symbol.media)} alt="" />
            </figure>

            {/* <section>
            </section> */}
            <section className="flex gap-2">
              <Button
                title={"delete"}
                className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
                onClick={() => {
                  deleteSymbol(symbol.id , symbol.name);
                }}
              >
                {Icons.trash("white")}
              </Button>
              <Button
                title={"export as json"}
                className="p-2 bg-slate-900 hover:bg-blue-600 transition-all"
              >
                {Icons.export("white")}
              </Button>
            </section>
          </section>
        );
      })}
    </section>
  );
};
