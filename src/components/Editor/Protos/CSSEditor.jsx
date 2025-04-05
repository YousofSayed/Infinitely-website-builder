import React, { useRef, useEffect } from "react";
import Editor, { useMonaco ,DiffEditor } from "@monaco-editor/react";

const MonacoEditorWithESM = () => {
  const editorRef = useRef(null);
  const monaco = useMonaco();

  useEffect(() => {
    if(editorRef.current)return;
    if (monaco) {
      // Configure Monaco for ESM
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        module: monaco.languages.typescript.ModuleKind.ESNext, // ESM support
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowUmdGlobalAccess: true,
        checkJs: true,
        importHelpers: true,
        allowSyntheticDefaultImports: true,
        alwaysStrict: true,
        allowUnreachableCode: true,
        declaration: true,
        esModuleInterop: true,
        jsx: true,
        lib: [`export const greet = (name) => \`Hello, \${name}\`;`],
        emitBOM: true,
        useDefineForClassFields: true,
        allowJs: true,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
    })


      const m2 = monaco.editor.createModel(
        `export declare const lole = 1241;`,
        "javascript",
        monaco.Uri.parse("file:///main.js")
      ).isAttachedToEditor();

      // Add example library (simulating an ESM module)
      const model1 = monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
          /**
       * @description returns name
       * @param {string} name 
       * @returns 
       */
            export declare  function greet(name) {
              return \`Hello, \${name}!\`;
            }
               `,
        "file:///module.js" // Virtual file path for the module
      );


      // Create virtual models for module resolution

      /**
       * @description returns name
       * @param {string} name
       * @returns
       */
      function greet(name) {
        return `Hello, ${name}!`;
      }

      // monaco.editor.setModelLanguage(m2 , 'javascript')
    }
  },[]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue={`import { greet } from './module.js';\nconsole.log(greet("React"));`}
      onMount={handleEditorDidMount}
    />
  );
};

export default MonacoEditorWithESM;
