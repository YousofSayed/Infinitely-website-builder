import { Editor, useMonaco } from "@monaco-editor/react";
import React, { memo, useEffect, useRef, useState } from "react";
import { Loader } from "../../Loader";
import {
  codeEditorScripts,
  current_page_id,
  current_project_id,
  global_types,
} from "../../../constants/shared";
import {
  getProjectData,
  getProjectSettings,
  isProjectSettingPropTrue,
} from "../../../helpers/functions";
import { css_beautify, html_beautify, js_beautify } from "js-beautify";

import { useCmdsContext } from "../../../hooks/useCmdsContext";
import libSource from "../../../helpers/alpineType?raw";
import { opfs } from "../../../helpers/initOpfs";
import {
  buildGsapMotionsScript,
  cleanMotions,
  defineRoot,
  doGlobalType,
  filterMotionsByPage,
  getProjectRoot,
  hasExportDefault,
  infinitelyCallback,
  needsWrapping,
  wrapModule,
} from "../../../helpers/bridge";
import { random, uniqueID } from "../../../helpers/cocktail";
import { isBoolean } from "lodash";
// import {  } from 'lodash'
// import infImport from "/scripts/infinitely.js?raw";
/**
 *
 * @param {{props : import('@monaco-editor/react').EditorProps , showEditorState:boolean, toFormateValue:string, extraLibs:string , allowExtraLibs:boolean , isTemplateEngine:boolean , allowCmdsContext: boolean , allowRestAPIModelsContext:boolean}} param0
 * @returns
 */
export const CodeEditor = ({
  props,
  extraLibs = "",
  toFormateValue = "",
  isTemplateEngine = false,
  allowCmdsContext = false,
  allowRestAPIModelsContext = false,
  showEditorState,
  allowExtraLibs = true,
}) => {
  /**
   * @type {{current:typeof import("e:/code/infinitely/node_modules/monaco-editor/esm/vs/editor/editor.api")}}
   */
  const monacoRef = useRef();
  const editorRef = useRef();
  const [cmdsContext, setCmdsContext] = useCmdsContext();
  const [fileName, setFileName] = useState(uniqueID() + random(1000000));

  /**
   * @type {import("@monaco-editor/react").OnMount}
   */
  const loadLibs = async (editor, monaco) => {
    console.log("condo : ", window.monacoLoaded, window.monacoNeedToLoad);
    // if (window.monacoLoaded) return;
    // console.log();
    if (!window.monacoTypesPathes) window.monacoTypesPathes = new Set();

    const currentPageName = localStorage.getItem(current_page_id);
    const projectData = await await getProjectData();
    const restAPIModels = projectData.restAPIModels;
    if (props.language == "javascript" || props.language == "typescript") {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        allowJs: true,
        checkJs: true, // 👈 enables IntelliSense in JS
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
      });

      const globalJs = await (
        await opfs.getFile(defineRoot(`global/global.js`))
      ).text();
      const localJs = await (
        await opfs.getFile(defineRoot(`js/${currentPageName}.js`))
      ).text();

      infinitelyCallback(async () => {
        for (const lib of [
          ...projectData.jsHeaderLibs,
          ...projectData.jsFooterLibs,
        ].filter((lib) => lib.typesPath)) {
          console.log("starting loop");

          const libTypesHandles = await opfs.getAllFiles(
            defineRoot(lib.typesPath),
            {
              recursive: true,
            }
          );
          const libs = new Set();

          for (const libTypeHandle of libTypesHandles) {
            //file:///node_modules/public-google-sheets-parser/@types/index.d.ts --> Good URL
            if (window.monacoTypesPathes.has(libTypeHandle.path)) continue;
            window.monacoTypesPathes.add(libTypeHandle.path);

            let fileContent = await libTypeHandle.text();
            console.log("path : ", libTypeHandle.path);
            // Step 1: Build raw virtual path
            let typePath = libTypeHandle.path.replace(
              `${getProjectRoot(projectData.id)}/types`,
              "node_modules/@types"
            );

            // Step 2: Clean up duplicated node_modules/<lib>/<lib>
            typePath = typePath.replace(
              /node_modules\/@types\/([^/]+)\/node_modules\/\1\//g,
              "node_modules/$1/"
            );

            // Step 3: Normalize to Monaco virtual file URL
            typePath = "file:///" + typePath.replace(/\\/g, "/");

            if (!typePath.includes("@types")) {
              typePath = typePath.replace(
                lib.nameWithoutExt,
                `${lib.nameWithoutExt}/@types`
              );
            }
            console.log("🧩 Cleaned typePath:", typePath);

            // Step 4: Register with Monaco
            const isNeedWrappingToModule = needsWrapping(fileContent);
            fileContent = isNeedWrappingToModule
              ? wrapModule(lib.nameWithoutExt, fileContent)
              : fileContent;
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              fileContent,
              typePath
            );
            console.log("file content : ", isNeedWrappingToModule, fileContent);

            if (libTypeHandle.path.endsWith(".ts")) {
              const globalType = doGlobalType(
                lib.nameWithoutExt,
                lib.globalName,
                // fileContent,
                hasExportDefault(fileContent),
                fileContent
              );
              if (libs.has(globalType)) continue;
              libs.add(globalType);
              console.log("global type : ", globalType);

              monaco.languages.typescript.javascriptDefaults.addExtraLib(
                globalType,
                `file:///globals/${lib.nameWithoutExt}-global.d.ts`
              );
            }
          }
        }
      }, 10);

      infinitelyCallback(async () => {
        ///// Global types
        for (const globalType of global_types) {
          const typesFiles = await opfs.getAllFiles(
            defineRoot(`types/${globalType.nameWithoutExt}`),
            {
              recursive: true,
            }
          );

          for (const typeFile of typesFiles) {
            // const content = await typeFile.text();
            if (window.monacoTypesPathes.has(typeFile.path)) continue;
            let fileContent = await typeFile.text();
            console.log("path : ", typeFile.path);
            window.monacoTypesPathes.add(typeFile.path);
            // Step 1: Build raw virtual path
            let typePath = typeFile.path.replace(
              `${getProjectRoot(projectData.id)}/types`,
              "node_modules/@types"
            );

            // Step 2: Clean up duplicated node_modules/<lib>/<lib>
            typePath = typePath.replace(
              /node_modules\/@types\/([^/]+)\/node_modules\/\1\//g,
              "node_modules/$1/"
            );

            // Step 3: Normalize to Monaco virtual file URL
            typePath = "file:///" + typePath.replace(/\\/g, "/");

            if (!typePath.includes("@types")) {
              typePath = typePath.replace(
                globalType.nameWithoutExt,
                `${globalType.nameWithoutExt}/@types`
              );
            }
            console.log("🧩 Cleaned typePath:", typePath);

            // Step 4: Register with Monaco
            const isNeedWrappingToModule = needsWrapping(fileContent);
            fileContent = isNeedWrappingToModule
              ? wrapModule(globalType.nameWithoutExt, fileContent)
              : fileContent;

            console.log("🧩 Cleaned typePath:", typePath);

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              fileContent,
              typePath
            );

            const globalTypeContent = doGlobalType(
              globalType.nameWithoutExt,
              globalType.globalName,
              hasExportDefault(fileContent)
            );
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              globalTypeContent,
              `file:///globals/${globalType.nameWithoutExt}-global.d.ts`
            );
          }
        }
      }, 10);

      const devLibs = (
        await Promise.all(
          codeEditorScripts.map(async (url) => {
            const response = await fetch(url);
            return await response.text();
          })
        )
      ).join("\n");

      const restModelsContext = restAPIModels
        .map((model) => `var ${model.varName} = ${model.response}`)
        .join("\n");
      const finalLibs = [
        // ...libs,
        devLibs,
        // replacedInfImport,
        globalJs,
        localJs,
        extraLibs,
        allowCmdsContext && restModelsContext,
        allowCmdsContext && cmdsContext,
      ].filter(Boolean);
      console.log("contentnsss : ", restModelsContext, cmdsContext);

      allowExtraLibs &&
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          finalLibs.join("\n\n"),
          "ts:filename/infinitely.d.ts"
        );

      // const projectId = +localStorage.getItem(current_project_id);
      // const {projectSettings} = await getProjectSettings(projectId);
      // monaco.languages.typescript.javascriptDefaults.addExtraLib(
      //   buildGsapMotionsScript(
      //     filterMotionsByPage(
      //       await cleanMotions(projectData.motions, projectData.pages),
      //       currentPageName
      //     ),
      //     false,
      //     projectSettings.remove_gsap_markers_on_build,
      //     currentPageName
      //   ),
      //   `ts:filename/motions.${currentPageName}.d.ts`
      // );

      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        "global.d.ts"
      );

      monaco.languages.registerCompletionItemProvider("javascript", {
        // Trigger suggestions on typing 'try' or a space
        triggerCharacters: ["t", " "],
        provideCompletionItems: function (model, position) {
          // Get the text until the cursor position
          var textUntilPosition = model.getValueInRange({
            startLineNumber: 3,
            startColumn: 3,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Check if the user is typing 'try'
          var word = model.getWordUntilPosition(position);
          var currentWord = word.word.toLowerCase();

          // Only suggest if the current word starts with 'try'
          if (!currentWord.startsWith("t")) {
            return { suggestions: [] };
          }

          // Define the range for the suggestion
          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          // Define the try...catch snippet
          var suggestions = [
            {
              label: "trycatch",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                "(()=>(",
                "try {",
                "retrun (",
                "\t${1:// Your code here}",
                ")",
                "} catch (error) {",
                "\tconsole.error(error, 'error in this el:', $el);",
                "throw new Error({message: error.message, stack: error.stack});",
                "}",
                "))()",
              ].join("\n"),
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Inserts a try...catch block for error handling",
              range: range,
            },
          ];

          return { suggestions: suggestions };
        },
      });

      window.monacoLoaded = true;
      window.monacoNeedToLoad = false;
    }

    // toFormateValue &&
    //   isProjectSettingPropTrue(
    //     "enable_prettier_for_file_editor",
    //     async () => {
    //       const formatedValue =
    //         props.language == "javascript"
    //           ? js_beautify(toFormateValue, {
    //               indent_size: 2, // 2 spaces
    //               space_in_empty_paren: true,
    //             })
    //           : props.language == "css"
    //           ? css_beautify(toFormateValue, {
    //               indent_size: 2, // 2 spaces
    //               space_in_empty_paren: true,
    //             })
    //           : props.language == "html"
    //           ? html_beautify(toFormateValue, {
    //               indent_size: 2, // 2 spaces
    //               space_in_empty_paren: true,
    //             })
    //           : toFormateValue;

    //       console.log(formatedValue);

    //       editor.setValue(formatedValue);
    //     },
    //     () => {
    //       editor.setValue(toFormateValue);
    //     }
    //   );
  };

  //main
  return (
    <section className="h-full rounded-md overflow-hidden">
      <Editor
        path={`file:///${fileName}.tsx`}
        // defaultLanguage="javascript"
        theme="vs-dark"
        className="rounded-[inherit]"
        height={"100%"}
        width={"100%"}
        saveViewState
        loading={<Loader />}
        {...props}
        onMount={async (editor, monaco) => {
          monacoRef.current = monaco;
          editorRef.current = editor;
          editor.focus();

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

          props?.onMount?.(editor);

          infinitelyCallback(async () => await loadLibs(editor, monaco));
        }}
        options={{
          autoClosingQuotes: true,
          autoClosingBrackets: true,
          automaticLayout: true,
          autoClosingOvertype: true,
          acceptSuggestionOnCommitCharacter: true,
          autoClosingComments: true,
          formatOnPaste: true,
          fixedOverflowWidgets: true,
          quickSuggestions: true,
          tabCompletion: "on",

          dragAndDrop: true,
          formatOnType: false,
          gotoLocation: {
            multiple: "peek",
            multipleDefinitions: "peek",
            multipleTypeDefinitions: "peek",
            multipleDeclarations: "peek",
            multipleImplementations: "peek",
            multipleReferences: "peek",
          },
          largeFileOptimizations: true,

          // wordWrap: true,
          defaultColorDecorators: true,
          useShadowDOM: true, //experimental feature
          padding: {
            top: 15,
            bottom: 15,
          },
          hover: {
            sticky: true,
          },
          scrollbar: {
            horizontal: "auto",
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
          ...props.options,
        }}
      />
    </section>
  );
};
