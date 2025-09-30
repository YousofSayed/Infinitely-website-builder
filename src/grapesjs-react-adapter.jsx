// src/libs/grapesjs-react-adapter.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import grapesjs from "grapesjs";

// Exports expected by code that used @grapesjs/react:
// default export: a component that mounts editor
// named exports: WithEditor, useEditor, useEditorMaybe, destroyEditor

export const EditorContext = createContext(null);

export function useEditorMaybe() {
  return useContext(EditorContext);
}

let globalSetEditor = null; // store setter globally for destroyEditor to use

export function WithEditor({ children, options = {}, onEditor }) {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);

  // save setter globally so destroyEditor can call it
  globalSetEditor = setEditor;

  useEffect(() => {
    if (editorRef.current) return;

    // Find canvas element safely
    const canvasEl = document.querySelector('[data-gjs-canvas="true"]');
    if (!canvasEl) {
      console.error("No <Canvas> element found for GrapesJS container");
      return;
    }

    const safeOpts = {
      ...options,
      container: canvasEl,
      panels: { defaults: [] },
    };

    // ✅ Defer initialization to next microtask so React can finish rendering
    queueMicrotask(() => {
      let ed;
      try {
        ed = grapesjs.init(safeOpts);
      } catch (e) {
        console.error("grapesjs.init failed:", e);
        return;
      }

      editorRef.current = ed;
      setEditor(ed); // Safe now, avoids React flushSync warning
      window.__GRAPES_EDITOR__ = ed;

      if (typeof onEditor === "function") {
        Promise.resolve().then(() => {
          try {
            onEditor(ed);
          } catch (err) {
            console.warn("onEditor callback threw", err);
          }
        });
      }
    });

    return () => {
      destroyEditor();
    };
  }, []);

  return (
    <EditorContext.Provider value={editor}>
      {children}
    </EditorContext.Provider>
  );
}

// Hook that throws if editor is not ready
export function useEditor() {
  const ed = useEditorMaybe();
  if (!ed) throw new Error("Editor not ready");
  return ed;
}

// Canvas wrapper
export function Canvas(props) {
  return (
    <div
      data-gjs-canvas="true"
      style={{ width: "100%", height: "100%", position: "relative" }}
      {...props}
    />
  );
}

// ✅ Global destroy function
export function destroyEditor() {
  const toDestroy = window.__GRAPES_EDITOR__;
  if (!toDestroy) return;

  queueMicrotask(() => {
    try {
      toDestroy.destroy();
    } catch (e) {
      console.warn("editor.destroy failed", e);
    }

    if (window.__GRAPES_EDITOR__ === toDestroy) {
      window.__GRAPES_EDITOR__ = null;
    }

    // update context
    if (typeof globalSetEditor === "function") {
      globalSetEditor(null);
    }

    console.log("GrapesJS editor destroyed successfully");
  });
}

// Default export
export default function GjsEditor(props) {
  return <WithEditor {...props} />;
}






// // src/libs/grapesjs-react-adapter.js
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import grapesjs from "grapesjs";

// // Exports expected by code that used @grapesjs/react:
// // default export: a component that mounts editor
// // named exports: WithEditor, useEditor, useEditorMaybe, destroyEditor

// export const EditorContext = createContext(null);

// export function useEditorMaybe() {
//   return useContext(EditorContext);
// }

// let globalSetEditor = null; // store setter globally for destroyEditor to use

// /**
//  * Wait for the inner canvas element to appear inside the given iframe.
//  * Resolves with the canvas element or rejects after timeout.
//  */
// function waitForCanvasInIframe(iframeEl, timeout = 3000) {
//   return new Promise((resolve, reject) => {
//     if (!iframeEl) return reject(new Error("No iframe element"));
//     const start = Date.now();

//     const check = () => {
//       try {
//         const doc =
//           iframeEl.contentDocument || iframeEl.contentWindow?.document;
//         if (!doc) return false;
//         const canvas = doc.querySelector('[data-gjs-canvas="true"]');
//         if (canvas) {
//           resolve(canvas);
//           return true;
//         }
//       } catch (e) {
//         // iframe may not be ready yet
//       }
//       return false;
//     };

//     if (check()) return;

//     const iv = setInterval(() => {
//       if (check()) {
//         clearInterval(iv);
//         return;
//       }
//       if (Date.now() - start > timeout) {
//         clearInterval(iv);
//         reject(new Error("Timed out waiting for canvas in iframe"));
//       }
//     }, 50);
//   });
// }

// export function WithEditor({ children, options = {}, onEditor }) {
//   const editorRef = useRef(null);
//   const [editor, setEditor] = useState(null);

//   // save setter globally so destroyEditor can call it
//   globalSetEditor = setEditor;

//   useEffect(() => {
//     if (editorRef.current) return;

//     // Find outer iframe created by <Canvas /> (data attribute)
//     const iframeEl = document.querySelector('iframe[data-gjs-outer="true"]');
//     if (!iframeEl) {
//       console.error(
//         "No outer iframe (Canvas) found. Make sure <Canvas /> is rendered."
//       );
//       return;
//     }

//     // Wait for the canvas element inside the iframe
//     waitForCanvasInIframe(iframeEl)
//       .then((canvasEl) => {
//         const safeOpts = {
//           ...options,
//           container: canvasEl,
//           panels: { defaults: [] },
//         };

//         // Defer initialization to avoid React flushSync issues
//         queueMicrotask(() => {
//           let ed;
//           try {
//             ed = grapesjs.init(safeOpts);
//           } catch (e) {
//             console.error("grapesjs.init failed:", e);
//             return;
//           }

//           editorRef.current = ed;
//           setEditor(ed); // update context
//           window.__GRAPES_EDITOR__ = ed;

//           if (typeof onEditor === "function") {
//             Promise.resolve().then(() => {
//               try {
//                 onEditor(ed);
//               } catch (err) {
//                 console.warn("onEditor callback threw", err);
//               }
//             });
//           }
//         });
//       })
//       .catch((err) => {
//         console.error("WithEditor: waiting for canvas in iframe failed:", err);
//       });

//     return () => {
//       destroyEditor();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
//   );
// }

// // Hook that throws if editor is not ready
// export function useEditor() {
//   const ed = useEditorMaybe();
//   if (!ed) throw new Error("Editor not ready");
//   return ed;
// }

// /**
//  * Canvas
//  * Renders an outer iframe and injects a minimal HTML doc inside that includes
//  * a <div data-gjs-canvas="true"> where GrapesJS will mount.
//  *
//  * NOTE: If you render multiple Canvas components, WithEditor will pick the
//  * first iframe it finds (querySelector). Keep that in mind.
//  */
// export function Canvas({
//   id = "gjs-outer-frame",
//   style = {},
//   className,
//   ...props
// }) {
//   const iframeRef = useRef(null);

//   useEffect(() => {
//     const iframe = iframeRef.current;
//     if (!iframe) return;

//     function writeSkeleton() {
//       try {
//         const doc = iframe.contentDocument || iframe.contentWindow?.document;
//         if (!doc) return;
//         doc.open();
//         doc.write(`<!doctype html>
//           <html>
//             <head>
//               <meta charset="utf-8" />
//               <meta name="viewport" content="width=device-width,initial-scale=1" />
//               <style>html,body{height:100%;margin:0;padding:0;}#gjs-iframe-root{width:100%;height:100%}</style>
//             </head>
//             <style>
//             .gjs-cv-canvas__frames{
//             height:100% !important;
//             }
//             </style>
//             <body>
//               <div id="gjs-iframe-root">
//                 <div data-gjs-canvas="true" style="width:100%;height:100%;position:relative;"></div>
//               </div>
//             </body>
//           </html>`);
//         doc.close();
//       } catch (e) {
//         // ignore
//       }
//     }

//     // If iframe is already loaded, write immediately; else attach load
//     if (
//       iframe.contentDocument &&
//       iframe.contentDocument.readyState === "complete"
//     ) {
//       writeSkeleton();
//     } else {
//       iframe.addEventListener("load", writeSkeleton, { once: true });
//       // sometimes immediate write is allowed
//       setTimeout(() => writeSkeleton(), 0);
//     }

//     return () => {
//       // clear iframe contents on unmount to help GC
//       try {
//         const doc = iframe.contentDocument || iframe.contentWindow?.document;
//         if (doc) {
//           doc.open();
//           doc.write("<!doctype html><html><body></body></html>");
//           doc.close();
//         }
//       } catch (e) {}
//     };
//   }, [id]);

//   return (
//     <iframe
//       id={id}
//       src="about:srcdoc"
//       ref={iframeRef}
//       data-gjs-outer="true"
//       className={className}
//       sandbox="allow-scripts allow-same-origin"
//       referrerPolicy="same-origin unsafe-url"
//       style={{ border: "none", width: "100%", height: "100%", ...style }}
//       {...props}
//     />
//   );
// }

// // ✅ Global destroy function
// export function destroyEditor() {
//   const toDestroy = window.__GRAPES_EDITOR__;
//   if (!toDestroy) return;

//   queueMicrotask(() => {
//     try {
//       toDestroy.destroy();
//     } catch (e) {
//       console.warn("editor.destroy failed", e);
//     }

//     if (window.__GRAPES_EDITOR__ === toDestroy) {
//       window.__GRAPES_EDITOR__ = null;
//     }

//     // update context (so useEditorMaybe returns null)
//     if (typeof globalSetEditor === "function") {
//       try {
//         globalSetEditor(null);
//       } catch (e) {}
//     }

//     // clear outer iframe contents to allow GC of iframe internals
//     try {
//       const iframe = document.querySelector('iframe[data-gjs-outer="true"]');
//       if (iframe) {
//         const doc = iframe.contentDocument || iframe.contentWindow?.document;
//         if (doc) {
//           doc.open();
//           doc.write("<!doctype html><html><body></body></html>");
//           doc.close();
//         }
//       }
//     } catch (e) {
//       // ignore
//     }

//     console.log("GrapesJS editor destroyed successfully");
//   });
// }

// // Default export
// export default function GjsEditor(props) {
//   return <WithEditor {...props} />;
// }

