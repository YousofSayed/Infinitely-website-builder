import {
  codeEditorScripts,
  current_page_id,
  current_project_id,
  global_types,
} from "@/constants/shared";
import libSource from "@/helpers/alpineType?raw";
import {
  defineRoot,
  doGlobalType,
  getProjectRoot,
  hasExportDefault,
  infinitelyCallback,
  needsWrapping,
  wrapModule,
} from "@/helpers/bridge";
import { random, uniqueID } from "@/helpers/cocktail";
import { getProjectData, isWordpress } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { useCmdsContext } from "@/hooks/useCmdsContext";
import { useWpTokens } from "@/queries/wp.queries";
import { Loader } from "@/components/Loader";
import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

// ✅ GLOBAL VARIABLES (Outside component to survive unmounts/remounts)
if (typeof window !== "undefined") {
  window.__wpTokens = window.__wpTokens || [];
  window.__wpTokenProviderRegistered =
    window.__wpTokenProviderRegistered || false;
}

const getMonacoOverflowContainer = () => {
  if (window.__monacoOverflowContainer) return window.__monacoOverflowContainer;

  const node = document.createElement("div");
  node.classList.add("monaco-editor");
  node.style.position = "fixed";
  node.style.top = "0";
  node.style.left = "0";
  node.style.zIndex = "99999";

  document.body.appendChild(node);
  window.__monacoOverflowContainer = node;
  return node;
};

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
  const monacoRef = useRef();
  const editorRef = useRef();
  const [cmdsContext, setCmdsContext] = useCmdsContext();
  const [fileName, setFileName] = useState(uniqueID() + random(1000000));

  const { data: tokensRes } = useWpTokens();

  // ❌ DELETED: const wpTokensRef = useRef([]);

  useEffect(() => {
    if (tokensRes?.success) {
      // ✅ UPDATE GLOBAL VARIABLE INSTEAD OF LOCAL REF
      window.__wpTokens = Object.values(tokensRes.groups ?? {})
        .flatMap((group) => group?.tokens ?? [])
        .flat()
        .filter(Boolean);
    }
  }, [tokensRes]);

  // 🔥 Add hover tooltip to Monaco suggestions
//   useEffect(() => {
//     const observer = new MutationObserver((mutations) => {
//       for (const mutation of mutations) {
//         for (const node of mutation.addedNodes) {
//           if (node.nodeType !== 1) continue;

//           // Target Monaco's suggest widget rows
//           const rows = node.querySelectorAll?.(".monaco-list-row");
//           if (!rows?.length) continue;

//           rows.forEach((row) => {
//             // Extract the full insert text from the row's data
//             const index = row.getAttribute("data-index");
//             if (index === null) return;

//             // Get the suggestion item's text content
//             const labelEl = row.querySelector(".label-name");
//             const currentText = labelEl?.textContent || "";

//             // Check if we already added a tooltip
//             if (row.getAttribute("data-inf-tooltip")) return;
//             row.setAttribute("data-inf-tooltip", "true");

//             // Find the full token from our global tokens list
//             const fullToken = (window.__wpTokens || []).find(
//               (t) =>
//                 t.key.endsWith(currentText.replace("…", "")) ||
//                 currentText.includes(t.key.split(".").pop()),
//             );

//             if (fullToken) {
//               // ✅ Native browser tooltip on hover
//               row.setAttribute(
//                 "title",
//                 `${fullToken.key}\nType: ${fullToken.type}\nValue: ${fullToken.live_value ?? "null"}`,
//               );
//               row.style.whiteSpace = "normal";
//             }
//           });
//         }
//       }
//     });

//     // Observe the Monaco overflow container where suggestions render
//     const checkContainer = () => {
//       const container = window.__monacoOverflowContainer || document.body;
//       observer.observe(container, { childList: true, subtree: true });
//     };

//     // Wait for Monaco to be ready
//     if (window.__monacoOverflowContainer) {
//       checkContainer();
//     } else {
//       setTimeout(checkContainer, 500);
//     }

//     return () => observer.disconnect();
//   }, []);

//   useEffect(() => {
//   const styleId = 'inf-monaco-tooltip-styles';
//   if (document.getElementById(styleId)) return;

//   const style = document.createElement('style');
//   style.id = styleId;
//   style.textContent = `
//     /* Native tooltip styling */
//     .monaco-editor .suggest-widget .monaco-list-row[title] {
//       cursor: help !important;
//     }

//     /* Make the suggest details panel (Ctrl+Space) wider and always visible */
//     .monaco-editor .suggest-widget .suggest-details {
//       min-width: 350px !important;
//       max-width: 500px !important;
//       max-height: 300px !important;
//     }

//     /* Make the main list wider */
//     .monaco-editor .suggest-widget {
//       min-width: 320px !important;
//     }

//     /* Allow label text to wrap if needed */
//     .monaco-editor .suggest-widget .monaco-list-row .contents .main {
//       overflow: visible !important;
//     }

//     /* Style the preview ghost text */
//     .monaco-editor .suggest-widget .monaco-list-row .suggest-preview {
//       opacity: 0.5 !important;
//       font-style: italic !important;
//     }

//     /* Better details panel content */
//     .monaco-editor .suggest-widget .suggest-details .markdown-docs {
//       padding: 12px !important;
//       font-size: 13px !important;
//       line-height: 1.6 !important;
//     }

//     .monaco-editor .suggest-widget .suggest-details .markdown-docs code {
//       background: rgba(255,255,255,0.08) !important;
//       padding: 2px 6px !important;
//       border-radius: 4px !important;
//       font-size: 12px !important;
//       word-break: break-all !important;
//     }
//   `;
//   document.head.appendChild(style);
//   return () => document.getElementById(styleId)?.remove();
// }, []);

  const registerWpTokenProvider = (monaco) => {
    if (window.__wpTokenProviderRegistered) return;
    window.__wpTokenProviderRegistered = true;

    const wpTokenProvider = {
      // 🔥 Trigger on {, ., and [ so it pops up when drilling into objects/arrays
      triggerCharacters: ["{", ".", "["],
      provideCompletionItems: (model, position) => {
        const lineText = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineText.substring(0, position.column - 1);

        // 🔥 STRICT MATCH: Only trigger if we are inside {{ ... }}
        // Matches {{ followed by optional spaces, then alphanumeric, dots, hyphens, brackets
        const openMatch = textBeforeCursor.match(
          /\{\{\s*([a-zA-Z0-9_.\-\[\]]*)$/,
        );

        if (!openMatch) {
          return { suggestions: [] }; // Not inside {{ }}, return nothing
        }

        const query = openMatch[1];
        const currentTokens = window.__wpTokens || [];

        // Filter tokens based on the exact keyword being typed
        const filtered = currentTokens.filter((t) =>
          t.key.toLowerCase().includes(query.toLowerCase()),
        );

        const suggestions = filtered.map((token) => {
          // 🔥 Map token type to Monaco CompletionItemKind for proper icons
          let kind = monaco.languages.CompletionItemKind.Variable;
          let typeLabel = "String";

          switch (token.type) {
            case "array":
              kind = monaco.languages.CompletionItemKind.Enum; // List icon
              typeLabel = "Array";
              break;
            case "boolean":
              kind = monaco.languages.CompletionItemKind.Keyword;
              typeLabel = "Boolean";
              break;
            case "integer":
            case "float":
              kind = monaco.languages.CompletionItemKind.Value; // Number icon
              typeLabel = "Number";
              break;
            case "null":
              kind = monaco.languages.CompletionItemKind.Unit;
              typeLabel = "Null";
              break;
            default:
              typeLabel = "String";
          }

          // Truncate long live values for the UI
          const liveValue =
            token.live_value !== null && token.live_value !== undefined
              ? String(token.live_value).substring(0, 60)
              : "null";

          return {
            // 🔥 Rich Label: Shows key, type, and resolve status inline
            label: {
              label: token.key,
              detail: ` (${typeLabel})`, // Shows right next to the key
              description: token.resolves ? "✅" : "❌", // Shows on the far right
            },
            kind: kind,
            detail: token.label, // Human readable name in the side panel
            documentation: {
              // 🔥 Markdown documentation popup
              value: [
                `**${token.label}**`,
                `---`,
                `**Type:** \`${token.type}\``,
                `**Live Value:** \`${liveValue}\``,
                `**Resolves:** ${token.resolves ? "Yes ✅" : "No ❌"}`,
                token.count !== undefined ? `**Items:** ${token.count}` : "",
              ]
                .filter(Boolean)
                .join("\n\n"),
              isTrusted: true, // Allows markdown rendering
            },
            insertText: token.key,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - query.length,
              endColumn: position.column,
            },
            // 🔥 Smart sorting: exact matches first, then shorter keys, then alphabetical
            sortText: `${query.length === token.key.length ? "0" : "1"}_${String(token.key.length).padStart(4, "0")}_${token.key}`,
            filterText: token.key,
          };
        });

        return { suggestions };
      },
    };

    monaco.languages.registerCompletionItemProvider(
      "javascript",
      wpTokenProvider,
    );
    monaco.languages.registerCompletionItemProvider(
      "typescript",
      wpTokenProvider,
    );
    monaco.languages.registerCompletionItemProvider("html", wpTokenProvider);
  };

  const loadLibs = async (editor, monaco) => {
    console.log("condo : ", window.monacoLoaded, window.monacoNeedToLoad);
    if (!window.monacoTypesPathes) window.monacoTypesPathes = new Set();

    const currentPageName = localStorage.getItem(current_page_id);
    const projectData = await getProjectData();
    const restAPIModels = projectData.restAPIModels;

    registerWpTokenProvider(monaco);

    if (props.language === "javascript" || props.language === "typescript") {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        allowJs: true,
        checkJs: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
      });

      const globalJs = await (
        await opfs.getFile(
          defineRoot(isWordpress() ? "global.js" : `global/global.js`),
        )
      ).text();
      const localJs = await (
        await opfs.getFile(
          defineRoot(isWordpress() ? "local.js" : `js/${currentPageName}.js`),
        )
      ).text();

      const devLibs = (
        await Promise.all(
          codeEditorScripts.map(async (url) => {
            const response = await fetch(url);
            return await response.text();
          }),
        )
      ).join("\n");

      const restModelsContext = restAPIModels
        .map((model) => `var ${model.varName} = ${model.response}`)
        .join("\n");

      const finalLibs = [
        devLibs,
        globalJs,
        localJs,
        extraLibs,
        allowCmdsContext && restModelsContext,
        allowCmdsContext && cmdsContext,
      ].filter(Boolean);

      allowExtraLibs &&
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          finalLibs.join("\n\n"),
          "ts:filename/infinitely.d.ts",
        );

      setTimeout(async () => {
        for (const lib of [
          ...projectData.jsHeaderLibs,
          ...projectData.jsFooterLibs,
        ].filter((lib) => lib.typesPath)) {
          const libTypesHandles = await opfs.getAllFiles(
            defineRoot(lib.typesPath),
            { recursive: true },
          );
          const libs = new Set();

          for (const libTypeHandle of libTypesHandles) {
            if (window.monacoTypesPathes.has(libTypeHandle.path)) continue;
            window.monacoTypesPathes.add(libTypeHandle.path);

            let fileContent = await libTypeHandle.text();
            let typePath = libTypeHandle.path.replace(
              `${getProjectRoot(projectData.id)}/types`,
              "node_modules/@types",
            );

            typePath = typePath.replace(
              /node_modules\/@types\/([^/]+)\/node_modules\/\1\//g,
              "node_modules/$1/",
            );

            typePath = "file:///" + typePath.replace(/\\/g, "/");

            if (!typePath.includes("@types")) {
              typePath = typePath.replace(
                lib.nameWithoutExt,
                `${lib.nameWithoutExt}/@types`,
              );
            }

            const isNeedWrappingToModule = needsWrapping(fileContent);
            fileContent = isNeedWrappingToModule
              ? wrapModule(lib.nameWithoutExt, fileContent)
              : fileContent;

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              fileContent,
              typePath,
            );

            if (libTypeHandle.path.endsWith(".ts")) {
              const globalType = doGlobalType(
                lib.nameWithoutExt,
                lib.globalName,
                hasExportDefault(fileContent),
                fileContent,
              );
              if (libs.has(globalType)) continue;
              libs.add(globalType);

              monaco.languages.typescript.javascriptDefaults.addExtraLib(
                globalType,
                `file:///globals/${lib.nameWithoutExt}-global.d.ts`,
              );
            }
          }
        }
      }, 5);

      setTimeout(async () => {
        const libs = [...projectData.jsHeaderLibs, ...projectData.jsFooterLibs];

        for (const lib of libs) {
          const fileContent = await (
            await opfs.getFile(defineRoot(lib.path))
          ).text();
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            fileContent,
            `lolo.d.ts`,
          );
        }
      }, 5);

      setTimeout(async () => {
        for (const globalType of global_types) {
          const typesFiles = await opfs.getAllFiles(
            defineRoot(`types/${globalType.nameWithoutExt}`),
            { recursive: true },
          );

          for (const typeFile of typesFiles) {
            if (window.monacoTypesPathes.has(typeFile.path)) continue;
            let fileContent = await typeFile.text();
            window.monacoTypesPathes.add(typeFile.path);

            let typePath = typeFile.path.replace(
              `${getProjectRoot(projectData.id)}/types`,
              "node_modules/@types",
            );

            typePath = typePath.replace(
              /node_modules\/@types\/([^/]+)\/node_modules\/\1\//g,
              "node_modules/$1/",
            );

            typePath = "file:///" + typePath.replace(/\\/g, "/");

            if (!typePath.includes("@types")) {
              typePath = typePath.replace(
                globalType.nameWithoutExt,
                `${globalType.nameWithoutExt}/@types`,
              );
            }

            const isNeedWrappingToModule = needsWrapping(fileContent);
            fileContent = isNeedWrappingToModule
              ? wrapModule(globalType.nameWithoutExt, fileContent)
              : fileContent;

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              fileContent,
              typePath,
            );

            const globalTypeContent = doGlobalType(
              globalType.nameWithoutExt,
              globalType.globalName,
              hasExportDefault(fileContent),
            );
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              globalTypeContent,
              `file:///globals/${globalType.nameWithoutExt}-global.d.ts`,
            );
          }
        }
      }, 5);

      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        "global.d.ts",
      );

      monaco.languages.registerCompletionItemProvider("javascript", {
        triggerCharacters: ["t", " "],
        provideCompletionItems: function (model, position) {
          var word = model.getWordUntilPosition(position);
          var currentWord = word.word.toLowerCase();

          if (!currentWord.startsWith("t")) {
            return { suggestions: [] };
          }

          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          var suggestions = [
            {
              label: "trycatch",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                "(()=>{",
                "try {",
                "\t${1:// Your code here}",
                "} catch (error) {",
                "\tconsole.error(error, 'error in this el:', );",
                "throw new Error({message: error.message, stack: error.stack});",
                "}",
                "})()",
              ].join("\n"),
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Inserts a try...catch block for error handling",
              range: range,
            },
            {
              label: "asynctrycatch",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                "(async()=>{",
                "try {",
                "\t${1:// Your code here}",
                "} catch (error) {",
                "\tconsole.error(error, 'error in this el:', $el);",
                "throw new Error({message: error.message, stack: error.stack});",
                "}",
                "})()",
              ].join("\n"),
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation:
                "Inserts async a try...catch block for error handling",
              range: range,
            },
          ];

          return { suggestions };
        },
      });

      window.monacoLoaded = true;
      window.monacoNeedToLoad = false;
    }
  };

  return (
    <section
      className="h-full rounded-md overflow-hidden"
      inf-tokens-container="true"
    >
      <Editor
        path={`file:///${fileName}.tsx`}
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
              e.preventDefault();
            }
          });

          editor.onDidBlurEditorWidget((e) => {});

          props?.onMount?.(editor);
          infinitelyCallback(async () => await loadLibs(editor, monaco));
        }}
        options={{
          suggest: {
            preview: true, // Shows ghost text of full completion
            showStatusBar: true, // Shows type info at bottom
            filterGraceful: true,
            snippetsPreventQuickSuggestions: false,
            showWords: false,
            maxVisibleSuggestions: 12,
          },
          autoClosingQuotes: true,
          autoClosingBrackets: true,
          automaticLayout: true,
          autoClosingOvertype: true,
          acceptSuggestionOnCommitCharacter: true,
          autoClosingComments: true,
          formatOnPaste: true,
          fixedOverflowWidgets: true,
          overflowWidgetsDomNode: getMonacoOverflowContainer(),
          useShadowDOM: true,
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
          defaultColorDecorators: true,
          padding: { top: 15, bottom: 15 },
          hover: { sticky: true },
          scrollbar: {
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
          },
          codeLens: true,
          bracketPairColorization: {
            enabled: true,
            independentColorPoolPerBracketType: true,
          },
          colorDecorators: true,
          cursorBlinking: "expand",
          cursorSmoothCaretAnimation: "explicit",
          fontVariations: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: "none",
          inlineSuggest: { enabled: true },
          "semanticHighlighting.enabled": true,
          links: true,
          parameterHints: { enabled: true, cycle: true },
          mouseWheelZoom: true,
          fontSize: 20,
          minimap: { autohide: true, enabled: false },
          ...props.options,
        }}
      />
    </section>
  );
};
