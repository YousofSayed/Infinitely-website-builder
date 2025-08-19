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
import { defineRoot } from "../../../helpers/bridge";
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
   *
   * @param {any} editor
   * @param {typeof import("e:/code/infinitely-base/node_modules/monaco-editor/esm/vs/editor/editor.api")} monaco
   */
  const loadLibs = async (editor, monaco) => {
    
    const currentPageName = localStorage.getItem(current_page_id);
    const projectData = await await getProjectData();
    const restAPIModels = projectData.restAPIModels;
    const globalJs = await (
      await opfs.getFile(defineRoot(`global/global.js`))
    ).text();
    const localJs = await (
      await opfs.getFile(defineRoot(`js/${currentPageName}.js`))
    ).text();
    const libs = await Promise.all(
      (
        await opfs.getAllFiles(defineRoot(`libs/js`), { recursive: true })
      ).map((handle) => handle.text())
    );
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
    const assetsUrls = projectData.assets
      .map((asset) => `"${asset.file.name}"`)
      .join("|");

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
      ...libs,
      devLibs,
      // replacedInfImport,
      globalJs,
      localJs,
      extraLibs,
      allowCmdsContext && restModelsContext,
      allowCmdsContext && cmdsContext,

      ,
    ];

    toFormateValue &&
      isProjectSettingPropTrue(
        "enable_prettier_for_file_editor",
        async () => {
          const formatedValue =
            props.language == "js"
              ? js_beautify(toFormateValue, {
                  indent_size: 2, // 2 spaces
                  space_in_empty_paren: true,
                })
              : toFormateValue;
          console.log(formatedValue);

          editor.setValue(formatedValue);
          props.language == "css" &&
            editor.trigger("mySource", "editor.action.formatDocument");
        },
        () => {
          editor.setValue(toFormateValue);
        }
      );

    // console.log("replaced :", replacedInfImport, finalLibs.join("\n\n"));
    allowExtraLibs &&
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        finalLibs.join("\n\n"),
        "ts:filename/infinitely.d.ts"
      );

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      "global.d.ts"
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      libSource,
      "global.d.ts"
    );

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
          ...props.options
        }}
      />
    </section>
  );
};
