// import '../wdyr.js'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "grapesjs/dist/css/grapes.min.css";
import "./index.css";
import { makeAppResponsive } from "./helpers/cocktail.js";
import { RecoilEnv, RecoilRoot } from "recoil";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { version } from "./constants/Version.js";
import { setProjectSettings } from "./helpers/functions.js";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./components/Editor/Protos/ToastMsgInfo.jsx";
import { isDevMode } from "./helpers/bridge.js";

// Save the initial state of window

// import worker from './helpers/worker.js';
// import './helpers/backbonePacher.js'
// src/main.js
// src/main.js
const appStatus = {
  developer_creator: "Yousef Sayed Ahmed",
  email: "infinitely.studio.dev@gmail.com",
  phone_1: "+201096277104",
  phone_2: "+201120020790",
  msg: "Contact me if you need any thing 💙",
  version: version,
};

(() => {
  console.log("%c🇵🇸  FREE PALESTINE 🇵🇸", "font-size: 50px;");
  console.log(
    "%c     \n%c     \n%c     \n%c     ",
    "background:#000; padding:20px 100px;",
    "background:#fff; padding:20px 100px;",
    "background:#009739; padding:20px 100px;",
    "background:linear-gradient(135deg, #ce1126 50%, transparent 50%); padding:20px 100px;"
  );
  console.log(
    "%c🇵🇸  FREE PALESTINE 🇵🇸",
    "font-size: 40px; font-weight:bold; color:#009739; text-shadow:2px 2px 4px #000;"
  );
})();
console.table(appStatus);
// if (!isDevMode()) {
//   const originalLog = window.console.log;
//   window.console.log = (...data) => {
//     // // Prevent infinite loop
//     // if (data.includes("[APP_STATUS]")) return;
//     // window.console.clear();
//     // console.table(appStatus);
//     // // originalLog(...data);
//   };
// }

setProjectSettings();
RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;
let cleaner;
const originalFetch = window.fetch;

window.fetch = async (input, init) => {
  if (!navigator.onLine) {
    toast.error(<ToastMsgInfo msg="You are offline" />);
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await originalFetch(input, init);
  } catch (error) {
    toast.error(<ToastMsgInfo msg="Network error occurred" />);
    throw error;
  }
};

// ✅ Main App with unique keys to reset Recoil & Router state
const Main = () => {
  const uniqueKey = Date.now();

  return (
    <RecoilRoot>
      <BrowserRouter basename="/">
        <ErrorBoundary
          key={uniqueKey}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div
              className="flex items-center justify-center min-h-screen h-full bg-slate-950 text-slate-200 relative overflow-hidden"
              role="alert"
            >
              {/* Blurry Background */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>

              {/* Error Card */}
              <div className="relative z-10 max-w-md p-8 bg-slate-900 rounded-xl shadow-xl border border-slate-800">
                <h1 className="text-2xl font-semibold text-red-500 mb-4">
                  Something went wrong!
                </h1>
                <p className="text-slate-300 mb-4">
                  We encountered an error while processing your request.
                </p>
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-lg border border-slate-800 overflow-auto max-h-40 mb-6">
                  {error.message}
                </pre>
                <button
                  onClick={resetErrorBoundary}
                  className="w-full px-4 py-2 bg-red-500 text-slate-100 font-medium rounded-md hover:bg-red-600 transition focus:outline-none focus:ring focus:ring-red-400"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        >
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </RecoilRoot>
  );
};

let root = null;

function mountApp() {
  const container = document.getElementById("root");

  if (!root) {
    // ✅ Only create root once
    root = ReactDOM.createRoot(container);
  }

  cleaner = makeAppResponsive("#root");
  // ✅ Just render new app instance
  root.render(<Main key={Date.now()} />);
}

mountApp();

export function unMountApp() {
  root.unmount();
  root = null;
  cleaner && cleaner();
  cleaner = null;
  // patch(null , null)
  // window.removeEventListener('resize');
}

export function reBuildApp() {
  unMountApp();
  requestIdleCallback(() => {
    mountApp();
  });
}

window.addEventListener("unmout", () => {
  console.log("unmounted");

  unMountApp();
});

window.__initialWindowKeys = new Set(Object.getOwnPropertyNames(window));

