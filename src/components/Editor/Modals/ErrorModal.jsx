import React from "react";
import { P } from "../../Protos/P";
import { Button } from "../../Protos/Button";
import { useEditorMaybe } from "@grapesjs/react";

/**
 * 
 * @param {{editor:import('grapesjs').Editor}} param0 
 * @returns 
 */
export const ErrorModal = ({children}) => {
  const editor = useEditorMaybe();

  return (
    <section className="flex flex-col gap-4">
      <article className="flex flex-col gap-4 bg-gray-950 p-2 text-slate-200 font-semibold rounded-lg">
        {children}
      </article>

      <footer className="flex items-end">
        <Button onClick={()=>{editor.runCommand('close:current:modal')}}>Close</Button>
      </footer>
    </section>
  );
};
