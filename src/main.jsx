import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "grapesjs/dist/css/grapes.min.css";
import "./index.css";
import { makeAppResponsive } from "./helpers/cocktail.js";
import { RecoilEnv, RecoilRoot } from "recoil";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { version } from "./constants/Version.js";
import { setProjectSettings } from "./helpers/functions.js";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./components/Editor/Protos/ToastMsgInfo.jsx";
// import worker from './helpers/worker.js';
// import './helpers/backbonePacher.js'
// src/main.js
// src/main.js
setProjectSettings();
RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;
makeAppResponsive("#root");
const originalFetch = window.fetch;

window.fetch = async (input, init) => {
  if (!navigator.onLine) {
    toast.error(<ToastMsgInfo msg="You are offline" />);
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    return await originalFetch(input, init);
  } catch (error) {
    toast.error(<ToastMsgInfo msg="Network error occurred" />);
    throw error;
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <RecoilRoot>
    <BrowserRouter basename="/">
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => {
          return (
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
          );
        }}
      >
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </RecoilRoot>
  // </React.StrictMode>,
);

const appStatus = { developer: 'Yousef' , version: version };
console.table(appStatus);
// console.log(version);
