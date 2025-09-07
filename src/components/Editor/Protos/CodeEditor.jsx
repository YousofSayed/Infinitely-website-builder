import { Editor, useMonaco } from "@monaco-editor/react";
import React, { memo, useEffect, useRef } from "react";
import { Loader } from "../../Loader";
import { codeEditorScripts, current_page_id } from "../../../constants/shared";
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
  defineRoot,
  doGlobalType,
  getProjectRoot,
  hasExportDefault,
} from "../../../helpers/bridge";
import { setupTypeAcquisition } from "@typescript/ata";
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

  /**
   * @type {import("@monaco-editor/react").OnMount}
   */
  const loadLibs = async (editor, monaco) => {
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
      // const ata = setupTypeAcquisition({
      //   projectName: "lolo",
      //   typescript: ts,
      //   logger: console,

      //   delegate: {
      //     started: () => {
      //       console.error("ATA start");
      //     },
      //     progress: (downloaded, total) => {
      //       console.log(`Got ${downloaded} out of ${total}`);
      //     },
      //     //  receivedFile: (code, path) => {
      //     //   console.log("ATA received:", path);
      //     //   monaco.languages.typescript.javascriptDefaults.addExtraLib(code, `file://`+path);
      //     // },
      //     finished: (vfs) => {
      //       console.log("ATA finished");
      //       vfs.forEach((value, key) => {
      //         console.log(value, key);

      //         monaco.languages.typescript.typescriptDefaults.addExtraLib(
      //           value,
      //           `file://` + key
      //         );
      //         monaco.languages.typescript.javascriptDefaults.addExtraLib(
      //           value,
      //           `file://` + key
      //         );
      //       });
      //     },
      //   },
      // });
      const globalJs = await (
        await opfs.getFile(defineRoot(`global/global.js`))
      ).text();
      const localJs = await (
        await opfs.getFile(defineRoot(`js/${currentPageName}.js`))
      ).text();

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
        // console.log(
        //   "pendding loop : ",
        //   libTypesHandles,
        //   defineRoot(lib.typesPath)
        // );

        for (const libTypeHandle of libTypesHandles) {
          const fileContent = await libTypeHandle.text();
          // console.log(
          //   fileContent,
          //   `file:///${libTypeHandle.path.replace(
          //     `${getProjectRoot(projectData.id)}/types`,
          //     `node_modules/@types`
          //   )}`
          // );

          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            fileContent,
            `file:///${libTypeHandle.path.replace(
              `${getProjectRoot(projectData.id)}/types`,
              `node_modules/@types`
            )}`
          );
          if (libTypeHandle.path.endsWith(".ts")) {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              doGlobalType(
                lib.nameWithoutExt,
                lib.globalName,
                hasExportDefault(fileContent)
              ),
              `file:///globals/${lib.nameWithoutExt}-global.d.ts`
            );
          }
        }

        // monaco.languages.typescript.javascriptDefaults.addExtraLib(
        //   doGlobalType(lib.nameWithoutExt, lib.globalName , hasExportDefault(fileContent)),
        //   `file:///globals/${lib.nameWithoutExt}-global.d.ts`
        // );
      }

      // const libsTypes = await Promise.all(
      //   [...projectData.jsHeaderLibs, ...projectData.jsFooterLibs]
      //     .filter((lib) => lib.globalName && lib.typesPath)
      //     .map(
      //       async (lib) =>
      //         await (
      //           await opfs.getAllFiles(defineRoot(lib.typesPath), {
      //             recursive: true,
      //           })
      //         )
      //           .map(async (file) => await file.text())
      //           .join("\n")
      //     )
      // );
      const libs = await Promise.all(
        (
          await opfs.getAllFiles(defineRoot(`libs/js`), { recursive: true })
        ).map((handle) => handle.text())
      );
      console.log("libs : ", projectData.jsFooterLibs);

      // await ata(libs[0]);

      //   await ata( `
      // import * as _lf from "animejs";
      // declare global {
      //   const anime: typeof _lf;
      // }
      // export {};
      // `);

      //   monaco.languages.typescript.javascriptDefaults.addExtraLib(
      //   `
      //   import * as _lf from "animejs";
      //   declare global {
      //     const anime: typeof _lf;
      //   }
      //   export {};
      //   `,
      //   "file:///globals/animejs-global.d.ts"
      // );

      // const libs = await Promise.all(
      //   [...projectData.jsHeaderLibs, ...projectData.jsFooterLibs].map(
      //     async (lib) => {
      //       // console.log("await lib.blob.text() : ", lib, await lib.file.text());

      //       return `${await lib.file.text()};`.replaceAll(
      //         /module\.exports(\s+)?=(\s+)?\w+\;/gi,
      //         " "
      //       );
      //     }
      //   )
      // );
      // const assetsUrls = projectData.assets
      //   .map((asset) => `"${asset.file.name}"`)
      //   .join("|");

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

        ,
      ];

      allowExtraLibs &&
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          finalLibs.join("\n\n"),
          "ts:filename/infinitely.d.ts"
        );

      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        "global.d.ts"
      );
      //     monaco.languages.typescript.javascriptDefaults.addExtraLib(
      //       `interface LocalForageDbInstanceOptions {
      //     name?: string;

      //     storeName?: string;
      // }

      // interface LocalForageOptions extends LocalForageDbInstanceOptions {
      //     driver?: string | string[];

      //     size?: number;

      //     version?: number;

      //     description?: string;
      // }

      // interface LocalForageDbMethodsCore {
      //     getItem<T>(key: string, callback?: (err: any, value: T | null) => void): Promise<T | null>;

      //     setItem<T>(key: string, value: T, callback?: (err: any, value: T) => void): Promise<T>;

      //     removeItem(key: string, callback?: (err: any) => void): Promise<void>;

      //     clear(callback?: (err: any) => void): Promise<void>;

      //     length(callback?: (err: any, numberOfKeys: number) => void): Promise<number>;

      //     key(keyIndex: number, callback?: (err: any, key: string) => void): Promise<string>;

      //     keys(callback?: (err: any, keys: string[]) => void): Promise<string[]>;

      //     iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U,
      //             callback?: (err: any, result: U) => void): Promise<U>;
      // }

      // interface LocalForageDropInstanceFn {
      //     (dbInstanceOptions?: LocalForageDbInstanceOptions, callback?: (err: any) => void): Promise<void>;
      // }

      // interface LocalForageDriverMethodsOptional {
      //     dropInstance?: LocalForageDropInstanceFn;
      // }

      // // duplicating LocalForageDriverMethodsOptional to preserve TS v2.0 support,
      // // since Partial<> isn't supported there
      // interface LocalForageDbMethodsOptional {
      //     dropInstance: LocalForageDropInstanceFn;
      // }

      // interface LocalForageDriverDbMethods extends LocalForageDbMethodsCore, LocalForageDriverMethodsOptional {}

      // interface LocalForageDriverSupportFunc {
      //     (): Promise<boolean>;
      // }

      // interface LocalForageDriver extends LocalForageDriverDbMethods {
      //     _driver: string;

      //     _initStorage(options: LocalForageOptions): void;

      //     _support?: boolean | LocalForageDriverSupportFunc;
      // }

      // interface LocalForageSerializer {
      //     serialize<T>(value: T | ArrayBuffer | Blob, callback: (value: string, error: any) => void): void;

      //     deserialize<T>(value: string): T | ArrayBuffer | Blob;

      //     stringToBuffer(serializedString: string): ArrayBuffer;

      //     bufferToString(buffer: ArrayBuffer): string;
      // }

      // interface LocalForageDbMethods extends LocalForageDbMethodsCore, LocalForageDbMethodsOptional {}

      // interface LocalForage extends LocalForageDbMethods {
      //     LOCALSTORAGE: string;
      //     WEBSQL: string;
      //     INDEXEDDB: string;

      //     /**
      //      * Set and persist localForage options. This must be called before any other calls to localForage are made, but can be called after localForage is loaded.
      //      * If you set any config values with this method they will persist after driver changes, so you can call config() then setDriver()
      //      * @param {LocalForageOptions} options?
      //      */
      //     config(options: LocalForageOptions): boolean;
      //     config(options: string): any;
      //     config(): LocalForageOptions;

      //     /**
      //      * Create a new instance of localForage to point to a different store.
      //      * All the configuration options used by config are supported.
      //      * @param {LocalForageOptions} options
      //      */
      //     createInstance(options: LocalForageOptions): LocalForage;

      //     driver(): string;

      //     /**
      //      * Force usage of a particular driver or drivers, if available.
      //      * @param {string} driver
      //      */
      //     setDriver(driver: string | string[], callback?: () => void, errorCallback?: (error: any) => void): Promise<void>;

      //     defineDriver(driver: LocalForageDriver, callback?: () => void, errorCallback?: (error: any) => void): Promise<void>;

      //     /**
      //      * Return a particular driver
      //      * @param {string} driver
      //      */
      //     getDriver(driver: string): Promise<LocalForageDriver>;

      //     getSerializer(callback?: (serializer: LocalForageSerializer) => void): Promise<LocalForageSerializer>;

      //     supports(driverName: string): boolean;

      //     ready(callback?: (error: any) => void): Promise<void>;
      // }

      // declare module "localforage" {
      //     let localforage: LocalForage;
      //     export = localforage;
      // }
      //  `,
      //       "localforage.d.ts"
      //     );
      // monaco.languages.typescript.typescriptDefaults.addExtraLib(
      //   libSource,
      //   "global.d.ts"
      // );

      monaco.languages.registerCompletionItemProvider("javascript", {
        // Trigger suggestions on typing 'try' or a space
        triggerCharacters: ["t", " "],
        provideCompletionItems: function (model, position) {
          // Get the text until the cursor position
          var textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
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
                "try {",
                "\t${1:// Your code here}",
                "} catch (error) {",
                "\tconsole.error(error);",
                "}",
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
    }

    toFormateValue &&
      isProjectSettingPropTrue(
        "enable_prettier_for_file_editor",
        async () => {
          const formatedValue =
            props.language == "javascript"
              ? js_beautify(toFormateValue, {
                  indent_size: 2, // 2 spaces
                  space_in_empty_paren: true,
                })
              : props.language == "css"
              ? css_beautify(toFormateValue, {
                  indent_size: 2, // 2 spaces
                  space_in_empty_paren: true,
                })
              : props.language == "html"
              ? html_beautify(toFormateValue, {
                  indent_size: 2, // 2 spaces
                  space_in_empty_paren: true,
                })
              : toFormateValue;

          console.log(formatedValue);

          editor.setValue(formatedValue);
        },
        () => {
          editor.setValue(toFormateValue);
        }
      );

    // Force the model to use the right language
// monaco.editor.setModelLanguage(editor.getModel(), props.language);

// monaco.languages.registerDocumentFormattingEditProvider({language:"javascript"}, {
//   provideDocumentFormattingEdits(model) {
//     const text = model.getValue();
//     const formatted = js_beautify(text, { indent_size: 2 });
//     return [
//       {
//         range: model.getFullModelRange(),
//         text: formatted,
//       },
//     ];
//   },
// });

// monaco.languages.registerDocumentFormattingEditProvider({language:'css'}, {
//   provideDocumentFormattingEdits(model) {
//     const text = model.getValue();
//     const formatted = css_beautify(text, { indent_size: 2 });
//     return [
//       {
//         range: model.getFullModelRange(),
//         text: formatted,
//       },
//     ];
//   },
// });

// monaco.languages.registerDocumentFormattingEditProvider({language:'html'}, {
//   provideDocumentFormattingEdits(model) {
//     const text = model.getValue();
//     const formatted = html_beautify(text, { indent_size: 2 });
//     console.log("HTML formatting triggered");
//     return [
//       {
//         range: model.getFullModelRange(),
//         text: formatted,
//       },
//     ];
//   },
// });

// 🔑 Ensure formatting is triggered programmatically if you want auto-format
// editor.getAction("editor.action.formatDocument").run();


    // console.log("replaced :", replacedInfImport, finalLibs.join("\n\n"));
  };

  return (
    <section className="h-full rounded-md">
      <Editor
        path="file:///main.tsx"
        // defaultLanguage="javascript"
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

          // if (isTemplateEngine) {
          //   // Set the value in the editor
          //   editor.setValue(
          //     `\`\n\n${editor.getValue().slice(1, -1).replaceAll("\n", "")}\n\``
          //   );
          //   // Move the caret to the position of "here"
          //   editor.setPosition({
          //     lineNumber: 2, // Line 3 (1-based: "`" is line 1, empty line is line 2, "here" is line 3)
          //     column: 1, // Column 1 (start of "here")
          //   });

          //   // Optional: Ensure the caret is visible by revealing the position
          //   editor.revealPosition({
          //     lineNumber: 3,
          //     column: 1,
          //   });
          // }
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
