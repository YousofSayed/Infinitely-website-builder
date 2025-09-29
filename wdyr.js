import React from "react";

if (import.meta.env.DEV && !window.__WDYR_INITIALIZED__) {
  window.__WDYR_INITIALIZED__ = true;
  const whyDidYouRender = await import("@welldone-software/why-did-you-render");
  whyDidYouRender.default(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
    collapseGroups: true,
  });
  
  console.log('%c[WDYR] Initialized!', 'color: green; font-weight: bold;');
}
