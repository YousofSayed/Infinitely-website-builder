import { Editor, useMonaco } from "@monaco-editor/react";
import React, { memo, useEffect, useRef } from "react";
import { Loader } from "../../Loader";
import { current_page_id } from "../../../constants/shared";
import {
  getProjectData,
  isProjectSettingPropTrue,
} from "../../../helpers/functions";
import { js_beautify } from "js-beautify";

import { useCmdsContext } from "../../../hooks/useCmdsContext";
import libSource from "../../../helpers/alpineType?raw";
import infImport from "/scripts/infImport.js?url&raw";

/**
 *
 * @param {{props : import('@monaco-editor/react').EditorProps , toFormateValue:string, extraLibs:string , allowExtraLibs:boolean , isTemplateEngine:boolean , allowCmdsContext: boolean , allowRestAPIModelsContext:boolean}} param0
 * @returns
 */
export const CodeEditor = memo(
  ({
    props,
    extraLibs = "",
    toFormateValue = "",
    isTemplateEngine = false,
    allowCmdsContext = false,
    allowRestAPIModelsContext = false,
    allowExtraLibs = true,
  }) => {
    /**
     * @type {{current:typeof import("e:/code/infinitely/node_modules/monaco-editor/esm/vs/editor/editor.api")}}
     */
    const monacoRef = useRef();
    const editorRef = useRef();
    const [cmdsContext, setCmdsContext] = useCmdsContext();

    console.log("from code cmds context", cmdsContext);

    useEffect(() => {
      if (!monacoRef?.current) return;
    }, []);

    /**
     *
     * @param {any} editor
     * @param {typeof import("e:/code/infinitely-base/node_modules/monaco-editor/esm/vs/editor/editor.api")} monaco
     */
    const loadLibs = async (editor, monaco) => {
      const currentPageName = localStorage.getItem(current_page_id);
      const projectData = await await getProjectData();
      const restAPIModels = projectData.restAPIModels;
      const globalJs = await projectData.globalJs.text();
      const localJs = await projectData.pages[`${currentPageName}`].js.text();
      const libs = await Promise.all(
        [...projectData.jsHeaderLibs, ...projectData.jsFooterLibs].map(
          async (lib) => {
            // console.log("await lib.blob.text() : ", lib, await lib.file.text());

            return `${await lib.file.text()};`.replaceAll(
              /module\.exports(\s+)?=(\s+)?\w+\;/gi,
              " "
            );
          }
        )
      );
      const assetsUrls = projectData.assets
        .map((asset) => `"${asset.file.name}"`)
        .join("|");
      const replacedInfImport = infImport.replace(
        "#/type-here/#",
        "InfinitelyURLsType"
      );

      const restModelsContext = restAPIModels
        .map((model) => `var ${model.varName} = ${model.response}`)
        .join("\n");
      const finalLibs = [
        ...libs,
        `
        declare type AssetUrl = ${assetsUrls};
        declare function infinitelyImport(url: AssetUrl): string;
      `,
        // replacedInfImport,
        globalJs,
        localJs,
        extraLibs,
        allowCmdsContext && restModelsContext,
        allowCmdsContext && cmdsContext,

        ,
      ];

      console.log("code context : ", cmdsContext);

      //========================
      // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      //   target: monaco.languages.typescript.ScriptTarget.ESNext,
      //   allowNonTsExtensions: true,
      //   moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      //   module: monaco.languages.typescript.ModuleKind.CommonJS,
      //   noEmit: true,
      //   typeRoots: []
      // });

      // // Force JSDoc parsing
      // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      //   noSemanticValidation: false,
      //   noSyntaxValidation: false,
      //   diagnosticCodesToIgnore: []
      // });
      console.log("frommmmmated : ", toFormateValue);

      toFormateValue &&
        isProjectSettingPropTrue(
          "enable_prettier_for_file_editor",
          async () => {
            // const prettier = await import("../../../helpers/prettier");
            // const estree = await import("../../../helpers/estree");
            // const parseBabel = await import("../../../helpers/bableParser");
            // const formatedValue = await prettier.format(toFormateValue, {
            //   parser: "babel",
            //   plugins: [estree, parseBabel],
            //   tabWidth: 2,
            //   useTabs: false,
            //   semi: true,
            //   singleQuote: true,
            // });
            const formatedValue =
              props.language == "js"
                ? js_beautify(toFormateValue, {
                    indent_size: 2, // 2 spaces
                    space_in_empty_paren: true,
                  })
                : toFormateValue;
            console.log(formatedValue);

            editor.setValue(formatedValue);
            props.language == 'css' && editor.trigger('mySource', 'editor.action.formatDocument');
            // editor.executeEdits("initial-set", [
            //   {
            //     range: editor.getModel().getFullModelRange(),
            //     text: formatedValue,
            //     forceMoveMarkers: true,
            //   },
            // ]);
          },
          () => {
            editor.setValue(toFormateValue);
          }
        );

      console.log("replaced :", replacedInfImport, finalLibs.join("\n\n"));
      allowExtraLibs &&
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          finalLibs.join("\n\n"),
          "ts:filename/infinitely.d.ts"
        );
      //   const libSource = `

      // `;

      // Add to Monaco's global scope
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        "global.d.ts"
      );
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        libSource,
        "global.d.ts"
      );

      // Ensure DOM types are loaded
      // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      //   target: monaco.languages.typescript.ScriptTarget.ESNext,
      //   lib: ["esnext", "dom"],
      //   allowNonTsExtensions: true,
      //   moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      //   module: monaco.languages.typescript.ModuleKind.CommonJS,
      //   noEmit: true,
      // });

      // isTemplateEngine && editor.setValue(`\` \n\n\n \``)
      // editor.getAction("editor.action.formatDocument").run();
    };

    return (
      <section className="h-full rounded-md">
        <Editor
          theme="vs-dark"
          className="rounded-[inherit]"
          height={"100%"}
          width={"100%"}
          saveViewState
          loading={<Loader />}
          {...props}
          onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            editorRef.current = editor;
            editor.focus();
            console.log("pos", editor.getPosition().lineNumber);
            console.log("lllllllllang :", props.language);

            if (props.language == "html") {
              props?.onMount?.(editor);
              return;
            }
            editor.onKeyDown((e) => {
              if (
                e.ctrlKey &&
                (e.keyCode === monaco.KeyCode.KeyZ ||
                  e.keyCode === monaco.KeyCode.KeyY)
              ) {
                console.log(
                  "Monaco ignored:",
                  e.keyCode === monaco.KeyCode.KeyZ ? "Ctrl+Z" : "Ctrl+Y"
                );
                e.preventDefault(); // Stop propagation to GrapesJS if needed
                // e.stopPropagation()
              }
            });

            loadLibs(editor, monaco);

            if (isTemplateEngine) {
              // Set the value in the editor
              editor.setValue(
                `\`\n\n${editor
                  .getValue()
                  .slice(1, -1)
                  .replaceAll("\n", "")}\n\``
              );

              // Move the caret to the position of "here"
              editor.setPosition({
                lineNumber: 2, // Line 3 (1-based: "`" is line 1, empty line is line 2, "here" is line 3)
                column: 1, // Column 1 (start of "here")
              });

              // Optional: Ensure the caret is visible by revealing the position
              editor.revealPosition({
                lineNumber: 3,
                column: 1,
              });
            }
            props?.onMount?.(editor);
          }}
          options={{
            autoClosingQuotes: true,
            autoClosingBrackets: true,
            automaticLayout: true,
            autoClosingOvertype: true,
            acceptSuggestionOnCommitCharacter: true,
            autoClosingComments: true,
            formatOnPaste: true,
            // smoothScrolling: true,
            quickSuggestions: true,
            tabCompletion: "on",
            wordWrap: true,
            hover: {
              sticky: true,
            },
            scrollbar: {
              horizontal: "hidden",
              useShadows: false, // Simpler scroll UI
              verticalScrollbarSize: 10, // Thinner, less redraw
            },

            codeLens: true,
            bracketPairColorization: {
              enabled: true,
              independentColorPoolPerBracketType: true,
            },

            // codeActionsOnSaveTimeout: 300,
            colorDecorators: true,
            // columnSelection:true,

            cursorBlinking: "expand",
            cursorSmoothCaretAnimation: "explicit",
            fontVariations: true,
            // formatOnType: true,
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            inlineSuggest: { enabled: true },
            "semanticHighlighting.enabled": true,

            links: true,
            parameterHints: {
              enabled: true,
              cycle: true,
            },

            mouseWheelZoom: true,
            fontSize: 20,
            minimap: {
              autohide: true,
              enabled: false,
            },
          }}
        />
      </section>
    );
  }
);
