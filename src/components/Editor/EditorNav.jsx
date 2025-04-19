import React from "react";
import { Icons } from "../Icons/Icons";
import { Li } from "../Protos/Li";
import { useEditorMaybe } from "@grapesjs/react";
import { useNavigate } from "react-router-dom";
import {
  open_custom_font_installer_modal,
  open_dynamic_templates_modal,
  open_files_manager_modal,
  open_library_installer_modal,
  open_pages_manager_modal,
  open_rest_models_modal,
  open_settings_modal,
  open_symbols_and_templates_manager_modal,
} from "../../constants/InfinitelyCommands";

export const HomeNav = () => {
  const editor = useEditorMaybe();
  const navigate = useNavigate();
 
  return (
    <nav className="h-full  w-[55px]  p-2 flex flex-col justify-between items-center bg-slate-900 ">
      <div className="flex flex-col items-center gap-5">
        <figure className="pb-[20px] pt-1 border-b-[1px] border-slate-400 ">
          {Icons.logo({})}
        </figure>
        <ul className="flex flex-col gap-5 items-center">
          {/* <Li>{Icons.plus()}</Li> */}
          <Li
            title="Pages"
            icon={Icons.stNote}
            onClick={(ev) => {
              editor.runCommand(open_pages_manager_modal);
            }}
          />
          {/* <Li
            title="Dynamic Templates"
            onClick={() => {
              editor.runCommand(open_dynamic_templates_modal);
            }}
          >
            {Icons.dynamicTemp({})}
          </Li> */}
          <Li
            title="Sympols & Templates"
            icon={Icons.components}
            onClick={() => {
              editor.runCommand(open_symbols_and_templates_manager_modal);
            }}
          />
          <Li
            title="Rest API Models"
            icon={Icons.db}
            onClick={() => {
              editor.runCommand(open_rest_models_modal);
            }}
          />
          <Li
            title="Library Installer"
            onClick={() => {
              editor.runCommand(open_library_installer_modal);
            }}
          >
            {Icons.installLibrary({ width: 25, height: 25 })}
          </Li>

          <Li
            onClick={() => {
              editor.runCommand(open_custom_font_installer_modal);
            }}
          >
            {Icons.fonts({})}
          </Li>

          <Li
            title="Media"
            icon={Icons.gallery}
            onClick={() => {
              editor.runCommand(open_files_manager_modal);
            }}
          />
          {/* <Li title="Github" icon={Icons.git} /> */}
        </ul>
      </div>

      <div>
        <ul className="flex flex-col gap-5 items-center">
          {/* <Li>{Icons.headphone()}</Li> */}
          <Li
            title="Settings"
            icon={Icons.setting}
            onClick={() => {
              editor.runCommand(open_settings_modal);
            }}
          />
          <Li
            title="Out to projects"
            icon={Icons.logOut}
            to=""
            onClick={() => {
              editor.trigger("leave:project");
              console.log("navigated");

              navigate("workspace");
            }}
          />
        </ul>
      </div>
    </nav>
  );
};
