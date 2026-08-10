
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "grapesjs/dist/css/grapes.min.css";
import "@/index.css";

import { makeAppResponsive } from "@/helpers/cocktail";
import { RecoilEnv, RecoilRoot } from "recoil";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { version } from "@/constants/Version";
import { setProjectSettings } from "@/helpers/functions";
import { toast } from "react-toastify";
import { isDevMode } from "@/helpers/bridge";
import { applyBrandConfig, config, configs } from "@/config/brand";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

applyBrandConfig(config);

const appStatus = {
  developer_creator: "Yousef Sayed Ahmed",
  email: "infinitely.studio.dev@gmail.com",
  phone_1: "+201096277104",
  phone_2: "+201120020790",
  msg: "Contact me if you need any thing 💙",
  version,
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

if (!isDevMode()) {
  window.addEventListener("error", (event) => {
    console.error(`
File: ${event.filename}
Line: ${event.lineno}
Column: ${event.colno}
Error: ${event.error}
    `);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error(event.reason);
  });
}

console.log("configs:", configs);

setProjectSettings();

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

// -----------------------------------------------------------------------------
// Fetch handling
// -----------------------------------------------------------------------------

const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init) => {
  if (!navigator.onLine) {
    toast.error();

    return new Response(
      JSON.stringify({
        error: "Offline",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    return await originalFetch(input, init);
  } catch (error) {
    toast.error();
    throw error;
  }
};

// -----------------------------------------------------------------------------
// React
// -----------------------------------------------------------------------------

export const queryClient = new QueryClient();

const Main = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <BrowserRouter>
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="relative z-10 max-w-md rounded-xl border border-slate-800 bg-surface-secondary p-8 shadow-xl">
                  <h1 className="mb-4 text-2xl font-semibold text-red-500">
                    Something went wrong!
                  </h1>

                  <p className="mb-4 text-slate-300">
                    We encountered an error while processing your request.
                  </p>

                  <pre className="mb-6 max-h-40 overflow-auto rounded-lg border border-slate-800 bg-surface-main p-4 text-text-primary">
                    {error.message}
                  </pre>

                  <button
                    onClick={resetErrorBoundary}
                    className="w-full rounded-md bg-red-500 px-4 py-2 font-medium text-slate-100 transition hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
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
    </QueryClientProvider>
  );
};

// -----------------------------------------------------------------------------
// Mount / Unmount
// -----------------------------------------------------------------------------

let root = null;
let cleaner = null;

function mountApp() {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error('Root element "#root" was not found.');
  }

  if (!root) {
    root = ReactDOM.createRoot(container);
  }

  root.render(<Main />);

  // Set up responsive behavior after React owns the root.
  cleaner = makeAppResponsive("#root");
}

export function unMountApp() {
  // Clean external DOM/event behavior first.
  if (cleaner) {
    cleaner();
    cleaner = null;
  }

  // Then let React remove its own DOM.
  if (root) {
    root.unmount();
    root = null;
  }
}

export function reBuildApp() {
  unMountApp();
  mountApp();
}

mountApp();

window.addEventListener("unmount", () => {
  console.log("unmounted");
  unMountApp();
});

// Useful for debugging changes to the global window object.
window.__initialWindowKeys = new Set(Object.getOwnPropertyNames(window));
