import { toast } from "react-toastify";
import { authUrl } from "../constants/dropbox";
import {
  dbx_sign_in_state,
  dropbox_code_verifier,
  dropbox_refresh_token,
  dropbox_token,
} from "../constants/shared";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { DropArea } from "../Blocks/DropArea";
import { loadProject, workerCallbackMaker } from "./functions";
import { isFunction } from "lodash";
import { globalInstance } from "../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { opfs } from "./initOpfs";
import { db } from "./db";
import { infinitelyWorker } from "./infinitelyWorker";

// Dropbox PKCE Flow for permanent (refreshable) token
const DROPBOX_CLIENT_ID = "ii7jhayl4qz7feg";
const REDIRECT_URI = window.location.origin + "/workspace";

function generateCodeVerifier(length = 128) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function authDropBox() {
  // Step 1: PKCE setup
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem(dbx_sign_in_state, true);
  localStorage.setItem(dropbox_code_verifier, verifier);

  // Step 2: Redirect to Dropbox Auth
  const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${DROPBOX_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&token_access_type=offline&code_challenge_method=S256&code_challenge=${challenge}`;

  window.location.href = authUrl;
}

// Step 3: On redirect back
export async function handleDropboxRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return null;

  const verifier = localStorage.getItem(dropbox_code_verifier);

  // Step 4: Exchange code for access & refresh token
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: DROPBOX_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  const data = await res.json();
  console.log("Dropbox Tokens:", data);

  // { access_token, refresh_token, expires_in }
  localStorage.setItem(dropbox_refresh_token, data.refresh_token);
  localStorage.setItem(dropbox_token, data.access_token);
  sessionStorage.removeItem(dbx_sign_in_state);
  return data;
}

// Step 5: Refresh access token anytime
export async function refreshDropboxToken() {
  const refresh_token = localStorage.getItem(dropbox_refresh_token);
  if (!refresh_token) return null;

  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: DROPBOX_CLIENT_ID,
    }),
  });

  const data = await res.json();
  console.log("tokens : ", data);

  localStorage.setItem(dropbox_token, data.access_token);
  return data.access_token;
}

export async function logOutFromDropBox(params) {
  localStorage.removeItem(dropbox_code_verifier);
  localStorage.removeItem(dropbox_refresh_token);
  localStorage.removeItem(dropbox_token);
}

// export function authDropBox() {
//   console.log("auth : ", authUrl);
//   sessionStorage.setItem(dbx_sign_in_state, true);

//   window.location.href = authUrl;
// }

export function getDropBoxAccessToken() {
  const sp = new URLSearchParams(window.location.hash.substring(1));
  const access_token = sp.get("access_token");
  const refresh_token = sp.get("refresh_token");
  localStorage.setItem(dropbox_token, access_token);
  localStorage.setItem(dropbox_refresh_token, refresh_token);
  sessionStorage.removeItem(dbx_sign_in_state);
}

export async function uploadProjectToDropBox(fileBlob) {
  const token = localStorage.getItem(dropbox_token);
  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({
        path: "/project.zip",
        mode: "overwrite",
        mute: true,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: fileBlob,
  });
  refreshTokenIfNot(res, async () => await uploadProjectToDropBox(fileBlob));
  if (res.ok && res.status === 200) {
    toast.success(
      <ToastMsgInfo msg={`Project uploaded successfully to dropbox 👍`} />
    );
  } else {
    toast.error(<ToastMsgInfo msg={`Faild to upload project to dropbox 🙁`} />);
  }
  return await res.json();
}

export async function listDropboxFiles(path = "", onlyZip = false) {
  const token = await getDBXAccessToken();
  const res = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }), // empty string means root
  });

  // refreshTokenIfNot(res, async () => await listDropboxFiles(path, onlyZip));

  const data = await res.json();
  if (!data.entries) return [];

  return onlyZip
    ? data.entries.filter(
        (f) => f[".tag"] === "file" && f.name.toLowerCase().endsWith(".zip")
      )
    : data.entries;
}

export function checkDropBoxSignInState() {
  return Boolean(localStorage.getItem(dropbox_token));
}

export async function refreshTokenIfNot(res, callback) {
  const json = await res.json().catch(() => ({}));
  const errorSummary = json?.error_summary || "";

  if (
    !res.ok &&
    res.status === 401 &&
    (errorSummary.includes("expired_access_token") ||
      errorSummary.includes("invalid_access_token"))
  ) {
    await refreshDropboxToken();
    if (typeof callback === "function") {
      await callback();
    }
    throw new Error("expired_or_invalid_access_token");
  }
}

export async function getDropboxFileBlob(path) {
  const token = await getDBXAccessToken();
  if (!token) throw new Error("Missing Dropbox access token");

  const res = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
  });

  // console.log("res  : ", res, await res.json());

  // refreshTokenIfNot(res, async () => await getDropboxFileBlob(path));

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dropbox error: ${err}`);
  }

  return await res.blob();
}

export async function getDropboxFileBlobWithToastProgress(path) {
  let toastId;
  let processTId;
  toastId = toast.loading(<ToastMsgInfo msg={"Downloading file..."} />);
  processTId = toast.loading(<ToastMsgInfo msg={"Processing..."} />);

  try {
    const accessToken = await getDBXAccessToken();

    const xhr = new XMLHttpRequest();
    const downloadUrl = "https://content.dropboxapi.com/2/files/download";

    xhr.open("POST", downloadUrl, true);
    xhr.responseType = "blob";

    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Dropbox-API-Arg", JSON.stringify({ path }));

    // ✅ Progress (if available)
    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        toast.update(toastId, {
          render: <ToastMsgInfo msg={`Downloading... ${progress}%`} />,
          progress: progress / 100,
          progressClassName: "bg-[#07bc0c]",
        });
      }
    };

    const blob = await new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          toast.done(toastId);
          toast.done(processTId);
          toast.success(
            <ToastMsgInfo msg="✅ File downloaded successfully!" />,
            {
              autoClose: 3000,
              progressClassName: "bg-[green]",
            }
          );
          resolve(xhr.response); // ✅ Blob
        } else {
          let errorMsg = `Dropbox download failed (${xhr.status})`;
          try {
            const json = JSON.parse(xhr.responseText);
            if (json?.error_summary) errorMsg = json.error_summary;
          } catch {}
          toast.dismiss(toastId);
          toast.dismiss(processTId);
          toast.error(<ToastMsgInfo msg={`❌ ${errorMsg}`} />);
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        toast.dismiss(toastId);
        toast.dismiss(processTId);
        toast.error(<ToastMsgInfo msg={`❌ Network error during download`} />);
        reject(new Error("Network error during download"));
      };

      xhr.send();
    });

    return blob;
  } catch (err) {
    console.error("Download failed:", err);
    toast.dismiss(toastId);
    toast.dismiss(processTId);
    toast.error(<ToastMsgInfo msg={`❌ Download failed: ${err.message}`} />);
    throw err;
  }
}

export async function getDropboxFileMeta(path) {
  const token = localStorage.getItem(dropbox_token);
  if (!token) throw new Error("Missing Dropbox access token");

  const res = await fetch("https://api.dropboxapi.com/2/files/get_metadata", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  // await refreshTokenIfNot(res, async () => await getDropboxFileMeta(path));

  const data = await res.json();

  if (!res.ok) {
    toast.error(
      <ToastMsgInfo
        msg={`Dropbox error: ${data?.error_summary || res.statusText}`}
      />
    );
    throw new Error(data?.error_summary || "Failed to get metadata");
  }

  return data; // contains name, id, rev, size, client_modified, server_modified, etc.
}

/**
 *
 * @param {string} path
 * @param {import('./types').Project} data
 */
export async function loadDropBoxProject(path, data = {}) {
  const tId = toast.loading(
    <ToastMsgInfo msg={`Fetching project from dropbox...`} />
  );
  try {
    const file = await getDropboxFileBlobWithToastProgress(path);
    await loadProject(file, data);
    toast.done(tId);
  } catch (error) {
    toast.dismiss(tId);
  }
}

export async function uploadDropboxFile(path, blob, rev = null) {
  const token = localStorage.getItem(dropbox_token);
  if (!token) throw new Error("Missing Dropbox access token");

  const mode = rev ? { ".tag": "update", update: rev } : "add";

  const res = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({
        path,
        mode,
        autorename: false,
        mute: false,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: blob,
  });
  await refreshTokenIfNot(
    res,
    async () => await uploadDropboxFile(path, blob, rev)
  );

  const data = await res.json();

  if (!res.ok) {
    if (data?.error_summary?.includes("conflict")) {
      globalInstance.emit(InfinitelyEvents.global.pull_require, { req: true });
      toast.error(
        <ToastMsgInfo msg="Conflict: file was updated from another device. Please pull your files first." />
      );
    } else {
      toast.error(
        <ToastMsgInfo
          msg={`Dropbox error: ${data?.error_summary || res.statusText}`}
        />
      );
    }
    throw new Error(data?.error_summary || "Dropbox upload failed");
  }

  return data; // includes new rev, path_display, etc.
}

export async function getDBXAccessToken() {
  let accessToken = localStorage.getItem(dropbox_token);

  // ✅ Step 1: Pre-check access token before upload starts
  const isTokenValid = await validateDropboxToken(accessToken);
  if (!isTokenValid) {
    await refreshDropboxToken();
    accessToken = localStorage.getItem(dropbox_token);
  }

  return accessToken;
}

export async function uploadDbxFileWithToastProgress(
  path,
  blob,
  rev = null,
  onSuccess
) {
  let toastId;
  let processTId;
  toastId = toast.loading(<ToastMsgInfo msg={"Uploading file..."} />);
  processTId = toast.loading(<ToastMsgInfo msg={"processing..."} />);

  try {
    const { conflict, remoteRev } = await checkDropboxFileConflict(path, rev);
    // return;
    console.log("conflict : ", conflict, remoteRev, "&&&&", rev);
    if (conflict) {
      const cnfrm = confirm(
        `⚠️ Conflict detected: The file has been updated elsewhere. Do you want to push anyway?`
      );
      if (cnfrm) {
        rev = remoteRev;
      } else {
        toast.dismiss(toastId);
        toast.dismiss(processTId);
        toast.error(
          <ToastMsgInfo msg={`⚠️ Conflict: File was updated elsewhere!`} />
        );
        globalInstance.emit(InfinitelyEvents.global.pull_require, {
          req: true,
        });
        return;
      }
    }

    const accessToken = await getDBXAccessToken();

    const uploadUrl = "https://content.dropboxapi.com/2/files/upload";
    const dropboxArg = {
      path,
      mode: rev ? { ".tag": "update", update: rev } : "overwrite",
      autorename: false,
      mute: false,
      strict_conflict: true,
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Dropbox-API-Arg", JSON.stringify(dropboxArg));
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    // ✅ Upload progress updates
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        toast.update(toastId, {
          render: <ToastMsgInfo msg={`Uploading... ${progress}%`} />,
          progress: progress / 100,
          progressClassName: "bg-[#07bc0c]",
        });
      }
    };

    const result = await new Promise((resolve, reject) => {
      xhr.onload = async () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            toast.done(toastId);
            toast.done(processTId);
            toast.success(
              <ToastMsgInfo msg="✅ File uploaded successfully!" />,
              {
                autoClose: 3000,
                progressClassName: "bg-[green]",
              }
            );
            onSuccess?.(json);
            resolve(json);
          } else {
            if (json?.error_summary?.includes("conflict")) {
              toast.dismiss(toastId);
              toast.dismiss(processTId);
              toast.error(
                <ToastMsgInfo
                  msg={`⚠️ Conflict: File was updated elsewhere!`}
                />
              );
              globalInstance.emit(InfinitelyEvents.global.pull_require, {
                req: true,
              });
              reject(new Error("File conflict detected"));
            } else {
              toast.dismiss(toastId);
              toast.dismiss(processTId);
              toast.error(
                <ToastMsgInfo
                  msg={`❌ Upload failed: ${
                    json?.error_summary || xhr.statusText
                  }`}
                />
              );

              reject(new Error(json?.error_summary || "Upload failed"));
            }
          }
        } catch (err) {
          toast.dismiss(toastId);
          toast.dismiss(processTId);
          toast.error(
            <ToastMsgInfo
              msg={`❌ Upload failed: ${json?.error_summary || xhr.statusText}`}
            />
          );
          reject(err);
        }
      };

      xhr.onerror = () => {
        toast.dismiss(toastId);
        toast.dismiss(processTId);
        toast.error(
          <ToastMsgInfo
            msg={`❌ Upload failed: ${json?.error_summary || xhr.statusText}`}
          />
        );
        reject(new Error("Network error during upload"));
      };
      xhr.send(blob);
    });

    return result;
  } catch (err) {
    console.error("Upload failed:", err);
    toast.dismiss(toastId);
    toast.dismiss(processTId);
    toast.error(
      <ToastMsgInfo
        msg={`❌ Upload failed: ${json?.error_summary || xhr.statusText}`}
      />
    );
    throw err;
  }
}
/**
 * ✅ Helper: quickly verify if current Dropbox token is valid
 */
async function validateDropboxToken() {
  const token = localStorage.getItem(dropbox_token);
  if (!token) return false;

  try {
    const res = await fetch("https://api.dropboxapi.com/2/check/user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}", // ✅ Dropbox requires a JSON body (even if empty)
    });

    const text = await res.json();
    console.log("user res:", text);

    return res.ok;
  } catch (error) {
    console.error("validateDropboxToken error:", error);
    return false;
  }
}

/**
 *
 * @param {import('./types').Project} projectData
 * @param {()=>void} callback
 * @returns
 */
export async function pullProject(projectData, callback = () => {}) {
  if (!projectData.inited) return;
  // if (!projectData.dbx_pull_requried) {
  //   toast.info(<ToastMsgInfo msg={`Project don’t need pulling 🤨`} />);
  //   return;
  // }
  const tId = toast.loading(<ToastMsgInfo msg={"Pulling project..."} />);
  try {
    const dropboxFileMeta = projectData.dropboxFileMeta;

    // await db.projects.delete(projectData.id);
    await getDBXAccessToken();
    const newProject = await getDropboxFileBlobWithToastProgress(
      dropboxFileMeta.path_lower
    );
    const newFileMeta = await getDropboxFileMeta(dropboxFileMeta.path_lower);
    await opfs.remove({
      dirOrFile: await opfs.getFolder(`projects/project-${projectData.id}`),
    });
    workerCallbackMaker(
      infinitelyWorker,
      "project-loaded",
      async ({ done }) => {
        console.log("done  : ", done);

        if (done) {
          toast.done(tId);
          toast.success(
            <ToastMsgInfo msg={`Project pulled successfully 💙`} />
          );
          await callback();
          setTimeout(() => {
            location.replace(location.href);
          }, 1000);
        }
      }
    );

    await loadProject(
      newProject,
      {
        dropboxFileMeta: newFileMeta,
        apps: "Dropbox",
        dbx_pull_requried: false,
      },
      +projectData.id,
      true
    );
  } catch (error) {
    toast.dismiss(tId);
    toast.error(<ToastMsgInfo msg={`Faild to pull project 💔`} />);
    throw new Error(error);
  }
}

/**
 * ✅ Check if a Dropbox file has a different rev (conflict detection)
 */
export async function checkDropboxFileConflict(path, localRev) {
  const token = await getDBXAccessToken();
  if (!token) throw new Error("Missing Dropbox token");

  try {
    const res = await fetch("https://api.dropboxapi.com/2/files/get_metadata", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        include_deleted: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      // token issues or file not found
      if (
        err?.error_summary?.includes("expired_access_token") ||
        err?.error_summary?.includes("invalid_access_token")
      ) {
        await refreshTokenIfNot(res, async () =>
          checkDropboxFileConflict(path, localRev)
        );
      }
      if (err?.error_summary?.includes("path/not_found")) {
        return { exists: false, conflict: false };
      }
      throw new Error(err?.error_summary || "Failed to fetch metadata");
    }

    const data = await res.json();

    // ✅ Compare revs
    const remoteRev = data.rev;
    const conflict = localRev && remoteRev && localRev !== remoteRev;

    return {
      exists: true,
      conflict,
      remoteRev,
      metadata: data,
    };
  } catch (err) {
    console.error("checkDropboxFileConflict error:", err);
    throw err;
  }
}

/**
 *
 * @param {import('./types').Project} projectData
 */
export async function shareLink(projectData) {
  await navigator.clipboard.writeText(
    `${window.origin}/share?app=dropbox&file_path=${
      projectData.dropboxFileMeta.path_lower
    }&rev=${projectData.dropboxFileMeta.rev}&access_token=${btoa(
      localStorage.getItem(dropbox_token)
    )}&refresh_token=${btoa(localStorage.getItem(dropbox_refresh_token))}`
  );
  toast.success(
    <ToastMsgInfo msg={`Share link copied successfully to clipboard 👍`} />
  );
}
