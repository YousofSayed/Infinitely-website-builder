import { AssetsManager } from "@/components/Editor/AssetsManager";
import { CodeManagerModal } from "@/components/Editor/Modals/CodeManagerModal";
import { CustomFontsModal } from "@/components/Editor/Modals/CustomFontsModal";
import { DynamicTemplatesManager } from "@/components/Editor/Modals/DynamicTemplatesManager";
import { ErrorModal } from "@/components/Editor/Modals/ErrorModal";
import { FileEditorModal } from "@/components/Editor/Modals/FileEditorModal";
import { LibraryInstallerModal } from "@/components/Editor/Modals/LibraryInstallerModal";
import { PageHelmetModal } from "@/components/Editor/Modals/PageHelmetModal";
import { PagesManager } from "@/components/Editor/Modals/PagesManager";
import { RestAPIModels } from "@/components/Editor/Modals/RestAPIModels";
import { SettingsModal } from "@/components/Editor/Modals/SettingsModal";
import { SymbolCodeEditor } from "@/components/Editor/Modals/SymbolCodeEditor";
import { SymbolsAndTemplatesManager } from "@/components/Editor/Modals/SymbolsAndTemplatesManager";
import { WpCodeManagerModal } from "@/components/Editor/Modals/wordpress/CodeManagerModal";
import { MediaManager } from "@/components/Editor/Modals/wordpress/MediaManager";
import { Icons } from "@/components/Icons/Icons";
import {
  open_code_manager_modal,
  open_custom_font_installer_modal,
  open_file_editor_modal,
  open_files_manager_modal,
  open_library_installer_modal,
  open_page_helmet_modal,
  open_pages_manager_modal,
  open_rest_models_modal,
  open_settings_modal,
  open_symbol_code_editor_modal,
  open_symbols_and_templates_manager_modal,
} from "@/constants/InfinitelyCommands";
import { closeCustomModal, openCustomModal } from "@/helpers/customEvents";
import { isNormal, isWordpress } from "@/helpers/functions";
import React from "react";

export const ModalTitle = ({ icon, title }) => {
  return (
    <>
      {icon}
      <span className="capitalize w-full">{title}</span>
    </>
  );
};

/**
 *
 * @param {import("grapesjs").Editor} editor
 */
export function customModal(editor) {
  editor.Commands.add("open:custom:modal", (editor, sender, options) => {
    window.dispatchEvent(
      openCustomModal({
        JSXModal: options.JSXModal,
        title: options.title,
        width: options.width || "65%",
        height: options.height || "calc(100%-70px)",
      })
    );
  });

  editor.Commands.add("close:custom:modal", (editor, sender, options) => {
    window.dispatchEvent(
      closeCustomModal({
        JSXModal: options.JSXModal,
        title: options.title,
      })
    );
  });

  editor.Commands.add(open_files_manager_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.gallery('white')} title={"Media Manager"} />,
      JSXModal: isWordpress() ? <MediaManager /> : <AssetsManager editor={editor} />,
      height: '90%'
    });
  });

  editor.Commands.add(open_pages_manager_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.stNote('white')} title={`${isNormal() ? 'Pages' : 'Posts'} Manager`} />,
      JSXModal: <PagesManager />,
      height: "90%",
    });
  });

  editor.Commands.add("open:error:modal", (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: options.errMsg,
      JSXModal: <ErrorModal>{options.content}</ErrorModal>,
    });
  });

  // editor.Commands.add(
  //   open_dynamic_templates_modal,
  //   (editor, sender, options) => {
  //     editor.runCommand("open:custom:modal", {
  //       title: (
  //         <ModalTitle
  //           icon={Icons.dynamicTemp({})}
  //           title={"Dynamic Templates Manager"}
  //         />
  //       ),
  //       JSXModal: <DynamicTemplatesManager />,
  //     });
  //   }
  // );

  editor.Commands.add(open_symbol_code_editor_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.code({ strokeColor: 'white' })} title={"Symbol Code Editor"} />,
      JSXModal: <SymbolCodeEditor />,
      width: "90%",
      height: "93%",
    });
  });

  editor.Commands.add(
    open_library_installer_modal,
    (editor, sender, options) => {
      editor.runCommand("open:custom:modal", {
        title: (
          <ModalTitle
            icon={Icons.installLibrary({ strokeColor: 'white' })}
            title={"Library Installer"}
          />
        ),
        JSXModal: <LibraryInstallerModal />,
        width: "70%",
        height: "90%",
      });
    }
  );

  editor.Commands.add(open_rest_models_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.db('white')} title={"Rest API Models"} />,
      JSXModal: <RestAPIModels />,
      width: "70%",
      height: "90%",
    });
  });

  editor.Commands.add(
    open_custom_font_installer_modal,
    (editor, sender, options) => {
      editor.runCommand("open:custom:modal", {
        title: (
          <ModalTitle
            icon={Icons.fonts({ width: 30, height: 30, strokeColor: 'white' })}
            title={"Custom font Installer"}
          />
        ),
        JSXModal: <CustomFontsModal />,
        width: "65%",
        height: "80%",
      });
    }
  );

  editor.Commands.add(open_settings_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.setting('white')} title={"Settings"} />,
      JSXModal: <SettingsModal />,
      width: "65%",
      height: "80%",
    });
  });

  editor.Commands.add(open_page_helmet_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: <ModalTitle icon={Icons.helmet({ fill: 'white' })} title={`${isNormal() ? 'Page' : 'Post'} Helmet`} />,
      JSXModal: <PageHelmetModal />,
      width: "55%",
      height: "90%",
    });
  });

  editor.Commands.add(open_code_manager_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: (
        <ModalTitle
          icon={Icons.code({ strokeWidth: 3, strokeColor: 'white' })}
          title={"Code Manager"}
        />
      ),
      JSXModal: isWordpress() ? <WpCodeManagerModal /> : <CodeManagerModal />,
      width: "90%",
      height: "80%",
    });
  });

  editor.Commands.add(open_file_editor_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: (
        <ModalTitle
          icon={Icons.file({ strokeWidth: 3, width: 24, height: 24, fill: "white" })}
          title={"File Editor"}
        />
      ),
      JSXModal: <FileEditorModal />,
      width: "90%",
      height: "93%",
    });
  });

  editor.Commands.add(open_symbols_and_templates_manager_modal, (editor, sender, options) => {
    editor.runCommand("open:custom:modal", {
      title: (
        <ModalTitle
          icon={Icons.components('white')}
          title={"Symbols & Templates Manager"}
        />
      ),
      JSXModal: <SymbolsAndTemplatesManager />,
      width: "60%",
      height: "75%",
    });
  });

}
