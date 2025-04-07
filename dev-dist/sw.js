/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-c5a460e4'], (function (workbox) { 'use strict';

  importScripts("/custom-sw.js");
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "3ca0b8505b4bec776b69afdba2768812"
  }, {
    "url": "index.html",
    "revision": "0.20mjmm35pfo"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    allowlist: [/^\/$/]
  }));
  workbox.registerRoute(({
    url
  }) => url.pathname.includes("assets/"), ({
    url,
    request,
    event
  }) => {
    if (url.pathname.includes("/keep-alive")) {
      event.respondWith(new Response(new Blob(["ok"], {
        type: "text/plain"
      })));
      return;
    }
    const fileName = url.pathname.split("/").pop();
    const projectId = vars["projectId"];
    if (projectId) {
      const projectData = vars["projectData"] || {};
      const assets = projectData.assets || [];
      const fileFromDB = assets.concat(Object.values(projectData.fonts || {})).find(asset => {
        var _asset$file;
        return encodeURIComponent(((_asset$file = asset.file) == null ? void 0 : _asset$file.name) || "").toLowerCase() === fileName.toLowerCase();
      });
      if (fileFromDB) {
        var _fileFromDB$file;
        event.respondWith(new Response(fileFromDB.file, {
          status: 200,
          headers: {
            "Content-Type": ((_fileFromDB$file = fileFromDB.file) == null ? void 0 : _fileFromDB$file.type) || "application/octet-stream"
          }
        }));
        return;
      }
    }
  }, 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|webp)$/, new workbox.CacheFirst({
    "cacheName": "images",
    plugins: []
  }), 'GET');
  workbox.registerRoute(/^https?.*/, new workbox.NetworkFirst({
    "cacheName": "api",
    plugins: []
  }), 'GET');

}));
