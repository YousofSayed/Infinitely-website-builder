// desktop/dropboxOAuth.js

const {
  BrowserWindow,
} = require("electron");


const DROPBOX_REDIRECT_URIS = [
  "https://localhost:5173/workspace",
  "https://infinitely.pages.dev/workspace",
];


function isDropboxCallback(url) {
  try {
    const parsedUrl = new URL(url);

    return DROPBOX_REDIRECT_URIS.some(
      (redirectUri) => {
        const redirectUrl =
          new URL(redirectUri);

        return (
          parsedUrl.origin ===
            redirectUrl.origin &&

          parsedUrl.pathname ===
            redirectUrl.pathname &&

          (
            parsedUrl.searchParams.has("code") ||
            parsedUrl.searchParams.has("error")
          )
        );
      }
    );
  } catch {
    return false;
  }
}


function openDropboxAuth(
  authUrl,
  mainWindow
) {
  const popup = new BrowserWindow({
    width: 600,
    height: 800,

    parent: mainWindow,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });


  let callbackHandled = false;


  const onRedirectNavigation = (
    _event,
    url
  ) => {
    if (
      callbackHandled ||
      popup.isDestroyed()
    ) {
      return;
    }


    console.log(
      "[Dropbox OAuth] URL:",
      url
    );


    if (!isDropboxCallback(url)) {
      return;
    }


    callbackHandled = true;


    console.log(
      "[Dropbox OAuth] Callback:",
      url
    );


    /*
     * REMOVE THE LISTENER IMMEDIATELY.
     */
    if (
      !popup.isDestroyed()
    ) {
      popup.webContents.removeListener(
        "did-redirect-navigation",
        onRedirectNavigation
      );
    }


    /*
     * Send callback URL to React.
     */
    if (
      !mainWindow.isDestroyed()
    ) {
      mainWindow.webContents.send(
        "dropbox:oauth-callback",
        url
      );
    }


    /*
     * Close after navigation callback finishes.
     */
    setTimeout(() => {
      if (
        !popup.isDestroyed()
      ) {
        popup.close();
      }
    }, 100);
  };


  /*
   * ONLY ONE navigation listener.
   */
  popup.webContents.on(
    "did-redirect-navigation",
    onRedirectNavigation
  );


  /*
   * If the user closes the popup manually,
   * remove the listener.
   */
  popup.once(
    "closed",
    () => {
      if (
        !popup.isDestroyed()
      ) {
        popup.webContents.removeListener(
          "did-redirect-navigation",
          onRedirectNavigation
        );
      }

      console.log(
        "[Dropbox OAuth] Popup closed"
      );
    }
  );


  /*
   * Start Dropbox OAuth.
   */
  popup.loadURL(authUrl);


  return popup;
}


module.exports = {
  openDropboxAuth,
  isDropboxCallback,
};