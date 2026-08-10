import { buildWpHeaderScripts, buildWpScripts } from "@/constants/shared";
import {
  fileNameToMediaSlug,
  functionFromString,
  getFonts,
  toQueryParams,
} from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  loopOnInfMetaInteractionsData,
  loopOnInfMetaMotionsData,
} from "@/apps/wordpress/helpers";
import {
  clone,
  cloneDeep,
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
} from "lodash";
import mime from "mime";

/**
 * Build a WordPress "Basic" Authorization header value from stored WP credentials.
 *
 * @param {import('@/helpers/types').Wp_Meta} wp_meta - Connection meta for the target site (username + application password).
 * @returns {string} A `Basic <base64>` string ready to use as an `Authorization` header.
 */
export function createWpToken(wp_meta) {
  return `Basic ${btoa(`${wp_meta.username}:${wp_meta.app_password}`)}`;
}

/**
 * Build a full REST URL for a WordPress site from its stored meta.
 *
 * @param {import('@/helpers/types').Wp_Meta} wp_meta - Connection meta containing `website_url`.
 * @param {string} [endpoint="wp/v2"] - REST namespace to target (e.g. `"wp/v2"`, `"infinitely-api/v1"`).
 * @returns {string} Full `https://<site>/wp-json/<endpoint>` URL.
 */
export function createWebsiteLink(wp_meta, endpoint = `wp/v2`) {
  return `${wp_meta.website_url}/wp-json/${endpoint}`;
}

/**
 * Normalize a raw WP REST "media" object into the flat shape used across the app.
 *
 * @param {object} media - Raw media object as returned by the WP `/media` endpoint.
 * @returns {{
 *   id:number, name:string, slug:string, date:string, modified:string,
 *   source_url:string, media_type:string, mime_type:string, author:number,
 *   meta:object, featured_media:number, comment_status:string, ping_status:string,
 *   template:string, fileUrl:string, url:string
 * }} Normalized media record.
 */
export function normalizeMedia(media) {
  return {
    id: media.id,
    name: media.title?.rendered,
    slug: media.slug,
    date: media.date,
    modified: media.modified,
    source_url: media.source_url,
    media_type: media.media_type,
    mime_type: media.mime_type,
    author: media.author,
    meta: media.meta,
    featured_media: media.featured_media,
    comment_status: media.comment_status,
    ping_status: media.ping_status,
    template: media.template,
    fileUrl: media.source_url,
    url: media.source_url,
  };
}

/**
 * Upload a single file to the WP media library, optionally skipping the upload
 * if a media item with the same slug already exists.
 *
 * @param {object} options
 * @param {File} options.file - File to upload.
 * @param {number} options.projectId - Local project id (used to look up WP connection meta).
 * @param {boolean} [options.check_before_upload=true] - If true, checks for an existing media item by slug first and returns it instead of re-uploading.
 * @returns {Promise<object>} Normalized media record for the uploaded (or pre-existing) file, or `{}` if the file was empty.
 * @throws {Error} If `projectId` is missing, or the upload request fails.
 */
export async function wp_upload_file({
  file,
  projectId,
  check_before_upload = true,
}) {
  if (!projectId) {
    throw new Error(`Project id not founded in : uploadFile`);
  }

  if (!file || file.size === 0) {
    console.error("File is empty — nothing to upload");
    return {};
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  if (check_before_upload) {
    const isExist = await wp_get({
      endpoint: "media",
      projectId,
      params: { slug: file.name.replaceAll(".", "-") },
    });

    if (isArray(isExist) && Boolean(isExist.length)) {
      console.warn(`File ${file.name} already exist`, isExist);

      return normalizeMedia(isExist[0]);
    }
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", file.name);
  formData.append("slug", fileNameToMediaSlug(file.name));
  // formData.append("meta", JSON.stringify({ inf_meta: {} }));

  formData.append(
    "mime_type",
    mime.getType(file.name) || "application/octet-stream",
  );

  const response = await fetch(`${createWebsiteLink(wp_meta)}/media`, {
    method: "POST",
    headers: {
      Authorization: createWpToken(wp_meta),
      // "Content-Disposition": `form-data; filename="${file.name}"`,
      // "Content-Type": file.type || "application/octet-stream",
      // Slug: file.name,
    },
    body: formData, // RAW FILE — not FormData
  });

  if (!response.ok) {
    console.error("Upload failed:", await response.json(), file.name);
    return;
  }

  const media = await response.json();

  console.log("Uploaded:", media, media.id, media.source_url);

  //   return Object.fromEntries(['id' , 'name' , 'date' , 'modified'])
  return {
    id: media.id,
    name: media.title.rendered,
    date: media.data,
    modified: media.modified,
    source_url: media.source_url,
    slug: media.slug,
    meta: media.meta,
    media_type: media.media_type,
    mime_type: media.mime_type,
    author: media.author,
    featured_media: media.featured_media,
    comment_status: media.comment_status,
    ping_status: media.ping_status,
    template: media.template,
    url: media.source_url,
  };
}

/**
 * Fetch a single media item by id and normalize it.
 *
 * @param {object} options
 * @param {number} options.mediaId
 * @param {number} options.projectId
 * @returns {Promise<object>} Normalized media record.
 * @throws {Error} If `mediaId`/`projectId` are missing, or the request fails.
 */
export async function wp_get_media({ mediaId, projectId }) {
  if (!(mediaId && projectId)) {
    throw new Error(`Media id or project id missing`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/media/${mediaId}`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get media ${mediaId}`);
  }

  const media = await response.json();
  return normalizeMedia(media);
}

/**
 * Fetch a media item's underlying asset bytes as a Blob via the custom
 * `infinitely/v1/asset` endpoint (bypasses the CDN/source_url).
 *
 * @param {object} options
 * @param {number} [options.mediaId] - Optional; narrows the initial `/media` lookup.
 * @param {number} options.projectId
 * @param {object} [options.params={}] - Extra query params for the initial `/media` list request.
 * @returns {Promise<Blob>} Raw asset blob.
 * @throws {Error} If `projectId` is missing or the initial media lookup fails.
 */
export async function wp_get_media_as_blob({
  mediaId,
  projectId,
  params = {},
}) {
  if (!projectId) {
    throw new Error(`Media id or project id missing`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  const paramsQ = toQueryParams(params);

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/media${mediaId ? `/${mediaId}` : ""}${
      paramsQ ? `?${paramsQ}` : ""
    }`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get media ${mediaId}`);
  }

  const media = await response.json();
  const mediaCnfg = normalizeMedia(media[0]);
  const res = await fetch(
    `${createWebsiteLink(
      wp_meta,
      `infinitely/v1/asset?slug=${mediaCnfg.slug}`,
    )}`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const blob = await res.blob();
  console.log("wp get blob : ", res, blob);
  return blob;
}

/**
 * Fetch a media asset's bytes by slug and wrap them back into a `File`
 * (preserving the original filename and inferred mime type).
 *
 * @param {object} options
 * @param {{slug:string, source_url:string}} options.media - Normalized media record (at least `slug` + `source_url`).
 * @param {number} options.projectId
 * @returns {Promise<File>} The asset re-wrapped as a `File`.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_get_blob_media_by_slug({ media, projectId }) {
  if (!projectId) {
    throw new Error(`Project id missing`);
  }
  const mime = await (await import("mime")).default;
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  const res = await fetch(
    `${createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/asset?slug=${media.slug}`,
    )}`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );
  // const json = await res.json();
  // console.log('blob is ', json);
  const fileName = media.source_url.split("/").pop();
  const resBlob = await res.blob();
  const blob = new File([resBlob], fileName, {
    type: mime.getType(media.source_url) || "application/octet-stream",
  });
  // console.log("wp get blob : ", res, blob, await resBlob.text());
  return blob;
}

/**
 * Update a media item's fields (title, meta, etc.) via `POST /media/:id`.
 *
 * @param {object} options
 * @param {number} options.mediaId
 * @param {number} options.projectId
 * @param {object} [options.body={}] - Partial WP media fields to update.
 * @returns {Promise<object>} Normalized media record after update.
 * @throws {Error} If ids are missing or the request fails.
 */
export async function wp_update_media({ mediaId, projectId, body = {} }) {
  if (!(mediaId && projectId)) {
    throw new Error(`Media id or project id missing`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/media/${mediaId}`,
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update media ${mediaId}`);
  }

  const media = await response.json();
  return normalizeMedia(media);
}

/**
 * Push updated file *contents* (not new uploads) to existing media assets via
 * the custom `media/update-content` endpoint. Optionally verifies each file
 * already exists (by slug) first, uploading it instead if it doesn't.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {File[]|Object.<string, string>} [options.files={}] - Either an array of `File`s (used with `check_exist`) or a map of `mediaId -> content` string.
 * @param {boolean} [options.check_exist=false] - When `files` is a `File[]`, look up each by slug first; upload if missing, otherwise queue its text content for the update-content call.
 * @returns {Promise<object>} Parsed JSON response from `media/update-content`.
 * @throws {Error} If `wp_get_media_by_slugs` doesn't return a plain object, or the update request fails.
 */
export async function wp_update_media_files({
  projectId,
  files = {},
  check_exist = false,
}) {
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  let f_content = {};
  // const form = new FormData();
  // form.append("file", file);

  if (check_exist && isArray(files)) {
    const isAllFilesType = files.every((file) => file instanceof File);
    if (isAllFilesType) {
      const slugs = files.map((file) => file.name.replaceAll(".", "-"));
      const files_meta = await wp_get_media_by_slugs({
        projectId,
        slugs,
      });

      if (isPlainObject(files_meta)) {
        for (const [slug, file_meta] of Object.entries(files_meta)) {
          const file = files.find(
            (file) =>
              slug.toLowerCase() ===
              file.name.replaceAll(".", "-").toLowerCase(),
          );
          console.log("file is : ", file, slug, files);

          if (file_meta.is_exist) {
            f_content[file_meta.id] = await file.text();
            if (!f_content[file_meta.id]) {
              throw new Error(
                `f_content[file_meta.id] is ${f_content[file_meta.id]}`,
              );
            }
          } else {
            await wp_upload_file({
              projectId,
              file,
            });
          }
        }
      } else {
        throw new Error(
          `Files meta is not plain object wp_get_media_by_slugs & in wp_update_media_files`,
        );
      }
    }
  }

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/media/update-content`)}`,
    {
      method: "POST", // WP uses POST for update
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files_content: Object.keys(f_content).length ? f_content : files,
      }),
    },
  );

  const json = await response.json();
  console.log(`update-content : `, json);

  if (!response.ok) {
    throw new Error("Failed to update media");
  }

  return json;
}

/**
 * Upload several files at once as `multipart/form-data`, keying each part by
 * its slugified filename (`files[<slug>]`).
 *
 * @param {{projectId: number, files: File[]}} options
 * @returns {Promise<object>} Parsed JSON `{ files: {...} }` response from `media/upload`.
 * @throws {Error} If `projectId` is missing, any item in `files` isn't a `File`, or the request fails.
 */
export async function wp_upload_multiple_files({ projectId, files = [] }) {
  if (!projectId) {
    throw new Error(`Project id missing`);
  }

  if (files.some((file) => !(file instanceof File))) {
    throw new Error(`Files are not files`);
  }

  const mime = await (await import("mime")).default;

  // files = files.map(file => {
  //   const newFile =
  //     new File([file], fileNameToMediaSlug(file.name), { type: mime.getType(file.name) })
  //   return newFile
  // })

  const formData = new FormData();
  // fileNameToMediaSlug(file.name)
  for (const file of files) {
    const slug = fileNameToMediaSlug(file.name);

    const ext = file.name.split(".").pop(); // js / css
    const wpFileName = `${slug}.${ext}`; // global-js.js

    const newFile = new File([file], wpFileName, {
      type: mime.getType(file.name),
    });

    formData.append(`files[${slug}]`, newFile);

    // let fileName = file.name.split(".");
    // fileName.pop();
    // let ext = mime.getExtension(file.type);
    // let type = mime.getType(file.name);
    // if (!(type && ext)) {
    //   throw new Error(`File type or extension is not valid`);
    // }

    // if (!ext && type) {
    //   ext = mime.getExtension(type);
    // }

    // if (!type && ext) {
    //   type = mime.getType(ext);
    // }

    // let slug = fileNameToMediaSlug(fileName.join("."));
    // fileName = `${slug}.${ext}`;

    // const newFile =
    //   new File([file], fileName, { type: type });
    // formData.append(`files[${slug}]`, newFile);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/media/upload`)}`,
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
      },
      body: formData,
      credentials: "include",
    },
  );

  const json = await response.json();
  console.log(`media/upload : `, json);

  if (!response.ok) {
    throw new Error("Failed to update media");
  }

  if (isPlainObject(json.files)) {
    Object.values(json.files).map(normalizeMedia);
  }

  return json;
}

/**
 * Look up media items (and whether they already exist) by an array of slugs.
 * Used to avoid re-uploading files that are already on the server.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {string[]} [options.slugs=[]]
 * @returns {Promise<Object.<string, {is_exist:boolean, id?:number}>>} Map of slug → existence/id info.
 * @throws {Error} If the request fails.
 */
export async function wp_get_media_by_slugs({ projectId, slugs = [] }) {
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  // const form = new FormData();
  // form.append("file", file);

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/media/by-slugs`)}`,
    {
      method: "POST", // WP uses POST for update
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
        // ❌ DO NOT set Content-Type manually
      },
      body: JSON.stringify({
        slugs,
      }),
    },
  );

  const json = await response.json();
  console.log(`media-slugs : `, json);

  if (!response.ok) {
    throw new Error("Failed to update media");
  }

  return json;
}

/**
 * Fetch the actual *file content* of one or more media assets, keyed by slug.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {string[]} [options.slugs=[]]
 * @returns {Promise<Object.<string, string>>} Map of slug → file content.
 * @throws {Error} If the request fails.
 */
export async function wp_get_media_files_by_slugs({ projectId, slugs = [] }) {
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;
  // const form = new FormData();
  // form.append("file", file);

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/media/get-media-files-by-slugs`)}`,
    {
      method: "POST", // WP uses POST for update
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
        // ❌ DO NOT set Content-Type manually
      },
      body: JSON.stringify({
        slugs,
      }),
    },
  );

  const json = await response.json();
  console.log(`media-slugs : `, json);

  if (!response.ok) {
    throw new Error("Failed to update media");
  }

  return json;
}

/**
 * Delete one or more media assets identified by slug.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {string[]} options.slugs
 * @returns {Promise<object>} Parsed JSON response from `media/delete-media-by-slugs`.
 * @throws {Error} If `projectId` or a non-empty `slugs` array is missing.
 */
export async function wp_delete_media_files_by_slugs({
  projectId,
  slugs = [],
}) {
  if (!(projectId && slugs.length)) {
    throw new Error(`slugs or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/media/delete-media-by-slugs`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slugs,
      }),
    },
  );

  const json = await response.json();
  console.log("delete-media-by-slugs : ", json);
  return json;
}

/**
 * Update file contents for existing media assets, addressed by slug rather
 * than numeric media id (compare with {@link wp_update_media_files}).
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {Object.<string, string>} [options.files={}] - Map of slug → new file content.
 * @returns {Promise<object>} Parsed JSON response from `media/update-media-by-slugs`.
 * @throws {Error} If the request fails.
 */
export async function wp_update_media_files_by_slugs({
  projectId,
  files = {},
}) {
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/media/update-media-by-slugs`)}`,
    {
      method: "POST", // WP uses POST for update
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files,
      }),
    },
  );

  const json = await response.json();
  console.log(`update-files-by-slugs : `, json);

  if (!response.ok) {
    throw new Error("Failed to update media");
  }

  return json;
}

/**
 * Permanently delete (force) a single media item by id.
 *
 * @param {object} options
 * @param {number} options.mediaId
 * @param {number} options.projectId
 * @returns {Promise<boolean>} `true` if WP confirms deletion.
 * @throws {Error} If ids are missing or the request fails.
 */
export async function wp_delete_media({ mediaId, projectId }) {
  if (!(mediaId && projectId)) {
    throw new Error(`Media id or project id missing`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/media/${mediaId}?force=true`,
    {
      method: "DELETE",
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete media ${mediaId}`);
  }

  const result = await response.json();
  return result.deleted === true;
}

/**
 * Generic authenticated GET against any `wp/v2` (or other) REST endpoint.
 *
 * @param {object} options
 * @param {string} options.endpoint - Path segment appended after the base REST URL (e.g. `"pages"`, `"media"`).
 * @param {number} options.projectId
 * @param {object} [options.params={}] - Query params, serialized via `toQueryParams`.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_get({ endpoint, projectId, params = {} }) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }
  const strParams = toQueryParams(params);
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}${endpoint ? `/${endpoint}` : ""}${
      strParams ? `?${strParams}` : ""
    }`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );
  const json = await response.json();
  console.log(`${endpoint} : `, json);
  return json;
}

/**
 * Recursively page through a REST collection endpoint, accumulating all
 * results in `self._wp_per_page_get_looper` until WP returns
 * `rest_post_invalid_page_number` (i.e. no more pages).
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number} options.projectId
 * @param {{per_page:number, page:number}} [options.params={per_page:100, page:1}] - Mutated in place across recursive calls.
 * @param {number} [options.per_page_increase=100] - Amount `per_page` grows by on each page (unusual — increases page *size*, not just page number).
 * @param {boolean} [options.isWorker=false] - If true, also `postMessage`s the accumulated results after each page (for use inside a Worker).
 * @param {(accumulated: any[]) => (void | Promise<void>)|string} [options.callback] - Called after each page with the results so far; may be a function or a string to be run via `functionFromString`.
 * @returns {Promise<any[]>} All accumulated items once pagination is exhausted.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_per_page_get_looper({
  endpoint,
  projectId,
  params = { per_page: 100, page: 1 },
  per_page_increase = 100,
  isWorker = false,
  callback = () => {},
}) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }
  if (!isArray(self._wp_per_page_get_looper)) {
    self._wp_per_page_get_looper = [];
  }

  const strParams = toQueryParams(params);
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}${endpoint ? `/${endpoint}` : ""}${
      strParams ? `?${strParams}` : ""
    }`,
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );
  const json = await response.json();
  console.log("response : ", response, json);

  if (
    response.status === 400 &&
    json.code === "rest_post_invalid_page_number"
  ) {
    const clone = cloneDeep(self._wp_per_page_get_looper || []);

    self._wp_per_page_get_looper = null;
    return clone;
  }

  self._wp_per_page_get_looper.push(...json);
  params.per_page += per_page_increase;
  params.page += 1;

  if (isFunction(callback)) {
    await callback?.(self._wp_per_page_get_looper || []);
  } else if (isString(callback)) {
    await functionFromString(callback, self._wp_per_page_get_looper || []);
  }

  if (isWorker) {
    self.postMessage({
      command: "wp_per_page_get_looper",
      props: self._wp_per_page_get_looper,
    });
  }

  return await wp_per_page_get_looper({
    endpoint,
    projectId,
    params,
    per_page_increase,
  });
  // return json;
}

/**
 * Fetch a single resource by id from a REST collection (e.g. `pages/:id`).
 *
 * Note: unlike most other `wp_*` calls here, this one does not send an
 * `Authorization` header.
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number|string} options.singleId
 * @param {number} options.projectId
 * @returns {Promise<object>} Parsed JSON resource.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_get_single({ endpoint, singleId, projectId }) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/${endpoint}/${singleId}`,
  );
  const json = await response.json();
  console.log(`${endpoint} : `, json);
  return json;
}

/**
 * Create a new resource on a REST collection endpoint (`POST /:endpoint`).
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number} options.projectId
 * @param {object} [options.body={}] - Fields for the new resource.
 * @returns {Promise<object>} Parsed JSON of the created resource.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_create_single({ endpoint, projectId, body = {} }) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }
  console.log("body : ", JSON.stringify(body));

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(`${createWebsiteLink(wp_meta)}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: createWpToken(wp_meta),
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  console.log(`${endpoint} : `, json);
  return json;
}

/**
 * Update an existing resource by id on a REST collection endpoint.
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number|string} options.singleId
 * @param {number} options.projectId
 * @param {string} [options.method="POST"] - HTTP method to use (WP typically accepts `POST` for updates).
 * @param {object} [options.body={}] - Fields to update.
 * @returns {Promise<object>} Parsed JSON of the updated resource.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_update_single({
  endpoint,
  singleId,
  projectId,
  method = "POST",
  body = {},
}) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/${endpoint}/${singleId}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: createWpToken(wp_meta),
      },
      body: JSON.stringify(body),
    },
  );
  console.log(`${endpoint} : `, response);
  const json = await response.json();
  console.log(`${endpoint} : `, json);
  return json;
}

/**
 * Delete a resource by id on a REST collection endpoint.
 *
 * Note: the HTTP method string `"Delete"` is passed as-is; most fetch
 * implementations/servers treat this case-insensitively, but consider
 * normalizing to `"DELETE"` if you see unexpected behavior.
 *
 * @param {object} options
 * @param {string} options.endpoint
 * @param {number|string} options.singleId
 * @param {number} options.projectId
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {Error} If `projectId` or `endpoint` is missing.
 */
export async function wp_delete_single({
  endpoint,
  singleId,
  projectId,
  //   body = {},
}) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}/${endpoint}/${singleId}`,
    {
      method: "Delete",
      headers: {
        //  'Content-Type': 'application/json',
        Authorization: createWpToken(wp_meta),
      },
      //   body: JSON.stringify(body),
    },
  );
  const json = await response.json();
  console.log(`${endpoint} : `, json);
  return json;
}

/**
 * Read one or more files from the site's editor filesystem via the custom
 * `infinitely-api/v1/editor/read` endpoint.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {object} [options.files={}] - Descriptor of which files/paths to read (shape defined by the WP-side handler).
 * @returns {Promise<object>} Parsed JSON containing the requested file contents.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_read_files({ projectId, files = {} }) {
  if (!projectId) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/editor/read`)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createWpToken(wp_meta),
      },
      body: JSON.stringify({ files }),
    },
  );
  const json = await response.json();
  console.log(`readed files res : `, json);
  return json;
}

/**
 * Write one or more files to the site's editor filesystem via the custom
 * `infinitley-api/v1/editor/write` endpoint.
 *
 * Note: the endpoint path here is `infinitley-api` (typo'd, missing the "e"),
 * unlike the rest of this file's `infinitely-api` endpoints — verify this is
 * intentional/matches the PHP route before relying on it.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {object} [options.files={}] - Map of path → content to write.
 * @returns {Promise<object>} Parsed JSON write result.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_write_files({ projectId, files = {} }) {
  if (!projectId) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitley-api/v1/editor/write`)}`,
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    },
  );
  const json = await response.json();
  console.log(`writed files res : `, json);
  return json;
}

/**
 * Establish/verify a connection to a WordPress site using username + app
 * password, via the custom `infinitely-api/v1/connect` endpoint. This call
 * is unauthenticated (credentials are sent in the body, not as a header),
 * since no token exists yet.
 *
 * @param {object} options
 * @param {string} options.username
 * @param {string} options.password
 * @param {string} [options.website_url=""] - Bare host (no protocol), e.g. `"example.com"`.
 * @returns {Promise<object>} Parsed JSON connection result (site info / token, per the PHP handler).
 * @throws {Error} If `username`, `password`, or `website_url` is missing.
 */
export async function wp_connect({ username, password, website_url = "" }) {
  if (!(username && password && website_url)) {
    throw new Error(`Wordpress meta data is missed`);
  }
  console.log(
    "url :",
    `https://${website_url.replace(/http(\s)?\:\/\//gi, "")}`,
  );

  const response = await fetch(
    `${website_url}/wp-json/infinitely-api/v1/connect`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  );
  const json = await response.json();
  console.log(`connected  : `, json);
  return json;
}

/**
 * Select a WP page to load into the editor.
 *
 * @remarks
 * **Likely bug:** `wp_get_single(...)` is `async` but is called here without
 * `await`, so `page` is a `Promise`, not the resolved page object — the
 * subsequent `isNumber(page.id)` check will always be `false` and this
 * function never returns anything. Fix by awaiting `wp_get_single` before
 * reading `.id`, and by actually returning/using the result.
 *
 * @param {number|string} pageId
 * @param {number} projectId
 * @returns {Promise<void>} Currently always resolves to `undefined` (see remarks).
 * @throws {Error} If `pageId` or `projectId` is missing.
 */
export async function wp_select_page_to_edite(pageId, projectId) {
  if (!(pageId && projectId)) {
    throw new Error(`Page id or project id not founded`);
  }
  /**
   * @type {import('@/helpers/types').WpPage}
   */
  const page = wp_get_single({
    endpoint: "pages",
    singleId: pageId,
    projectId,
  });

  if (isNumber(page.id)) {
  }
}

/**
 * Fetch a single named WP option via the custom `infinitely-api/v1/option/:name` endpoint.
 *
 * @param {object} options
 * @param {string} options.optionName
 * @param {number} [options.projectId] - Provide either this or `wp_meta_data`.
 * @param {import('@/helpers/types').Wp_Meta} [options.wp_meta_data] - Connection meta to use directly, bypassing the local project lookup.
 * @returns {Promise<any>} The option's value, per the PHP handler's response shape.
 * @throws {Error} If `optionName` is missing, or neither `projectId` nor `wp_meta_data` is provided.
 */
export async function wp_get_option({ optionName, projectId, wp_meta_data }) {
  if (!(optionName && (projectId || wp_meta_data))) {
    throw new Error(`Page id or project id not founded`);
  }
  const projectData = projectId ? await db.projects.get(+projectId) : null;
  const wp_meta = projectData ? projectData.wp_meta : wp_meta_data;

  const response = await fetch(
    `${createWebsiteLink(wp_meta, `infinitely-api/v1/option/${optionName}`)}`,
    {
      headers: {
        Authorization: createWpToken(wp_meta_data || wp_meta),
      },
    },
  );
  const json = await response.json();
  console.log(`option is : `, json);
  return json;
}

/**
 * Create a new WP option.
 *
 * @param {object} options
 * @param {string} options.optionName
 * @param {any} options.value
 * @param {boolean} [options.autoload=false]
 * @param {number} [options.projectId] - Provide either this or `wp_meta_data`.
 * @param {import('@/helpers/types').Wp_Meta} [options.wp_meta_data]
 * @returns {Promise<object>} Parsed JSON creation result.
 * @throws {Error} If `optionName` is missing, or neither `projectId` nor `wp_meta_data` is provided.
 */
export async function wp_create_option({
  optionName,
  value,
  autoload = false,
  projectId,
  wp_meta_data,
}) {
  if (!(optionName && (projectId || wp_meta_data))) {
    throw new Error(`Page id or project id not founded`);
  }

  const projectData = projectId ? await db.projects.get(+projectId) : null;
  const wp_meta = projectData ? projectData.wp_meta : wp_meta_data;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/option`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createWpToken(wp_meta),
      },
      body: JSON.stringify({
        name: optionName,
        value,
        autoload,
      }),
    },
  );

  const json = await response.json();
  console.log("option created : ", json);
  return json;
}

/**
 * Update an existing WP option's value.
 *
 * @param {object} options
 * @param {string} options.optionName
 * @param {any} options.value
 * @param {number} options.projectId
 * @param {boolean} [options.merge=false] - If true, ask the server to shallow-merge `value` into the existing option instead of replacing it.
 * @returns {Promise<object>} Parsed JSON update result.
 * @throws {Error} If `optionName` or `projectId` is missing.
 */
export async function wp_update_option({
  optionName,
  value,
  projectId,
  merge = false,
}) {
  if (!(optionName && projectId)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/option`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: createWpToken(wp_meta),
      },
      body: JSON.stringify({
        name: optionName,
        value,
        merge,
      }),
    },
  );

  const json = await response.json();
  console.log("option updated : ", json);
  return json;
}

/**
 * Delete a WP option by name.
 *
 * @param {object} options
 * @param {string} options.optionName
 * @param {number} options.projectId
 * @returns {Promise<object>} Parsed JSON deletion result.
 * @throws {Error} If `optionName` or `projectId` is missing.
 */
export async function wp_delete_option({ optionName, projectId }) {
  if (!(optionName && projectId)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/option/${optionName}`),
    {
      method: "DELETE",
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Fetch the rendered header/footer markup for a given post, via the custom
 * `infinitely-api/v1/header-footer` endpoint.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {number} options.projectId
 * @param {string|boolean} options.save_state - Server-defined flag indicating render/save context (truthy required — see guard clause).
 * @returns {Promise<object>} Parsed JSON with rendered header/footer content.
 * @throws {Error} If any of `post_id`, `post_type`, `projectId`, `save_state` is missing/falsy.
 */
export async function wp_get_header_footer({
  post_id,
  post_type,
  projectId,
  save_state,
}) {
  if (!(post_id && post_type && projectId && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/header-footer?post_id=${post_id}&post_type=${post_type}&save_state=${save_state}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Render a saved template (identified by id + slug) to markup, via the
 * custom `infinitely-api/v1/render-template` endpoint.
 *
 * @param {object} options
 * @param {number|string} options.template_id
 * @param {string} options.template_slug
 * @param {number} options.projectId
 * @param {string|boolean} options.save_state
 * @returns {Promise<object>} Parsed JSON with rendered template content.
 * @throws {Error} If any required field is missing/falsy.
 */
export async function wp_inf_render_template({
  template_id,
  template_slug,
  projectId,
  save_state,
}) {
  if (!(template_id && template_slug && projectId && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/render-template?template_id=${template_id}&template_slug=${template_slug}&save_state=${save_state}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Render the *token* form (unresolved dynamic placeholders) of an Infinitely
 * template for a given post, via `render-inf-components-template-tokens`.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {number} options.projectId
 * @param {string|boolean} options.save_state
 * @returns {Promise<object>} Parsed JSON with tokenized template content.
 * @throws {Error} If any required field is missing/falsy.
 */
export async function wp_inf_render_template_tokens({
  post_id,
  post_type,
  projectId,
  save_state,
}) {
  if (!(post_id && post_type && projectId && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/render-inf-components-template-tokens?post_id=${post_id}&post_type=${post_type}&save_state=${save_state}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Render a post's Infinitely components to final markup, via
 * `render-inf-components`.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {number} options.projectId
 * @param {string|boolean} options.save_state
 * @returns {Promise<object>} Parsed JSON with rendered components content.
 * @throws {Error} If any required field is missing/falsy.
 */
export async function wp_inf_render_components({
  post_id,
  post_type,
  projectId,
  save_state,
}) {
  if (!(post_id && post_type && projectId && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/render-inf-components?post_id=${post_id}&post_type=${post_type}&save_state=${save_state}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Render the tokenized form of a post's Infinitely components, via
 * `render-inf-components-tokens`.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {number} options.projectId
 * @param {string|boolean} options.save_state
 * @returns {Promise<object>} Parsed JSON with tokenized components content.
 * @throws {Error} If any required field is missing/falsy.
 */
export async function wp_inf_render_components_tokens({
  post_id,
  post_type,
  projectId,
  save_state,
}) {
  if (!(post_id && post_type && projectId && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/render-inf-components-tokens?post_id=${post_id}&post_type=${post_type}&save_state=${save_state}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Fetch a single named post-meta value.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {string} options.meta_key
 * @param {number} options.projectId
 * @returns {Promise<any>} The meta value, per the PHP handler's response shape.
 * @throws {Error} If any required field is missing/falsy.
 */
export async function wp_get_meta({ post_id, post_type, meta_key, projectId }) {
  if (!(post_id && post_type && projectId && meta_key)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/meta/get?post_id=${post_id}&post_type=${post_type}&meta_key=${meta_key}`,
    ),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Update (or merge into) a single named post-meta value.
 *
 * @param {object} options
 * @param {number|string} options.post_id
 * @param {string} options.post_type
 * @param {string} options.meta_key
 * @param {any} [options.meta_value={}]
 * @param {number} options.projectId
 * @param {boolean} [options.merge=false] - If true, ask the server to merge `meta_value` into the existing meta instead of replacing it.
 * @returns {Promise<object>} Parsed JSON update result.
 * @throws {Error} If `post_id`, `post_type`, `projectId`, or `meta_key` is missing.
 */
export async function wp_update_meta({
  post_id,
  post_type,
  meta_key,
  meta_value = {},
  projectId,
  merge = false,
}) {
  if (!(post_id && post_type && projectId && meta_key)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/meta/update`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createWpToken(wp_meta),
      },
      body: JSON.stringify({ meta_value, meta_key, post_id, post_type, merge }),
    },
  );

  const json = await response.json();
  console.log("option deleted : ", json);
  return json;
}

/**
 * Fetch every post across post types that carries Infinitely-specific meta
 * (`inf_meta`), used as the basis for cleanup passes (motions/interactions).
 *
 * @param {object} options
 * @param {number} options.projectId
 * @returns {Promise<object[]>} Array of posts, each expected to include an `inf_meta` field.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_get_posts_with_inf_meta({ projectId }) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/posts-with-inf-meta`),
    {
      headers: {
        Authorization: createWpToken(wp_meta),
      },
    },
  );

  const json = await response.json();
  console.log("posts-with-inf-meta : ", json);
  return json;
}

/**
 * Garbage-collect the project's stored GSAP `motions` map: walks every post's
 * `inf_meta` (both `before_save` and `saved` states) to mark motions/instances
 * still in use, then deletes anything left unmarked. Mutates and returns the
 * in-memory `motions` object from Dexie (does not persist the change itself —
 * callers are expected to save it back if needed).
 *
 * @param {object} options
 * @param {number} options.projectId
 * @returns {Promise<object>} The cleaned `motions` map.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_clean_motions({ projectId }) {
  if (!projectId) {
    throw new Error(`Project id is undefined`);
  }

  // try {
  const posts = await wp_get_posts_with_inf_meta({ projectId });
  const motions = await (await db.projects.get(projectId)).motions;
  if (isArray(posts)) {
    for (const post of posts) {
      if (!post.inf_meta) {
        console.warn(post, `this post is not have inf_meta!!!!`);
        continue;
      }

      loopOnInfMetaMotionsData({
        inf_meta: post.inf_meta,
        motions,
        key: "before_save",
      });

      loopOnInfMetaMotionsData({
        inf_meta: post.inf_meta,
        motions,
        key: "saved",
      });
    }
    const clonedMotions = structuredClone(motions);
    for (const id in clonedMotions) {
      const motion = clonedMotions[id];
      if (!motion?.used) {
        delete motions[id];
        continue;
      }
      delete motions[id].used;

      if (isPlainObject(motion.instances)) {
        for (const instanceId in motion.instances) {
          const instance = motion.instances[instanceId];
          if (!instance?.used) {
            delete motions[id].instances[instanceId];
            continue;
          }
          delete motions[id].instances[instanceId].used;
        }
      }
    }
    console.log("cleaned wp motions : ", motions);
  }

  return motions;
  // } catch (error) {
  //   throw new Error(error.message);
  // }
}

/**
 * Garbage-collect the project's stored `interactions` map, mirroring
 * {@link wp_clean_motions} but for interactions (which are stored as arrays
 * keyed by id rather than single objects).
 *
 * @param {object} options
 * @param {number} options.projectId
 * @returns {Promise<object>} The cleaned `interactions` map.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_clean_interactions({ projectId }) {
  if (!projectId) {
    throw new Error(`Project id is undefined`);
  }

  // try {
  const posts = await wp_get_posts_with_inf_meta({ projectId });
  const interactions = await (await db.projects.get(projectId)).interactions;
  if (isArray(posts)) {
    for (const post of posts) {
      if (!post.inf_meta) {
        console.warn(post, `this post is not have inf_meta!!!!`);
        continue;
      }

      loopOnInfMetaInteractionsData({
        inf_meta: post.inf_meta,
        interactions,
        key: "before_save",
      });

      loopOnInfMetaInteractionsData({
        inf_meta: post.inf_meta,
        interactions,
        key: "saved",
      });
    }

    const cloneInteractions = structuredClone(interactions);
    for (const [id, interaction] of Object.entries(cloneInteractions)) {
      for (const [index, interactionItem] of Object.entries(interaction)) {
        if (!interactionItem.used) {
          interactions[id].splice(+index, 1);
          continue;
        }

        if (isPlainObject(interactionItem.instances)) {
          for (const [instance_id, instance] of Object.entries(
            interactionItem.instances,
          )) {
            if (!instance.used) {
              delete interactions[id][+index].instances[instance_id];
              continue;
            }
            delete interactions[id][+index].instances[instance_id].used;
          }
        }

        delete interactions[id][+index].used;
      }

      !interactions[id].length && delete interactions[id];
    }
  }

  return interactions;
}

/**
 * Same cleanup as {@link wp_clean_motions}, but scoped to a single in-memory
 * HTML tree (`html`) rather than fetching every post from the server — useful
 * right before saving the *current* post, without a round trip.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {import('@/helpers/types').JSONComponent[]} [options.html=[]] - The current page's component tree to scan for motion usage.
 * @returns {Promise<object>} The cleaned `motions` map.
 * @throws {Error} If `projectId` is missing.
 */
export async function wp_clean_current_post_motions({ projectId, html = [] }) {
  if (!projectId) {
    throw new Error(`Project id is undefined`);
  }

  // try {
  const dummy_meta = { before_save: html };
  const motions = await (await db.projects.get(projectId)).motions;
  loopOnInfMetaMotionsData({
    inf_meta: dummy_meta,
    motions,
    key: "before_save",
  });
  const clonedMotions = structuredClone(motions);
  for (const id in clonedMotions) {
    const motion = clonedMotions[id];
    if (!motion?.used) {
      delete motions[id];
      continue;
    }
    delete motions[id].used;

    if (isPlainObject(motion.instances)) {
      for (const instanceId in motion.instances) {
        const instance = motion.instances[instanceId];
        if (!instance?.used) {
          delete motions[id].instances[instanceId];
          continue;
        }
        delete motions[id].instances[instanceId].used;
      }
    }
  }
  console.log("cleaned wp motions : ", motions);
  return motions;
  // } catch (error) {
  //   throw new Error(error.message);
  // }
}

/**
 * Build and upload the site's global header scripts, body scripts, fonts
 * CSS, Infinitely base CSS, and (optionally) Tailwind global-rules CSS as a
 * single batch of media files — effectively a full "rebuild global assets"
 * operation, driven by the project's current settings.
 *
 * @param {object} options
 * @param {{
 *   id: number,
 *   projectSetting: import('@/helpers/types').ProjectSetting,
 *   projectData: import('@/helpers/types').WpProject,
 *   app_type: string,
 *   global: {css: string, js: string},
 *   wp_meta: {website_url: string, username: string, password: string, app_password: string}
 * }} options.data
 * @returns {Promise<object>} Parsed JSON result from {@link wp_upload_multiple_files}.
 */
export async function wp_update_main_global_files({ data }) {
  const id = data.id;
  const projecdData = await db.projects.get(+id);
  const projectSettingsFromDB = projecdData.projectSetting;
  const files = [];

  // if (
  //   JSON.stringify(projectSettingsFromDB) ===
  //   JSON.stringify(data.projectSetting)
  // )
  //   return;
  const mainHeaderScripts = await Promise.all(
    buildWpHeaderScripts({
      projectSetting: data.projectSetting,
    }).map(async (item) => {
      const blob = await (await fetch(item.localUrl)).blob();
      if (isBoolean(item.condition)) {
        if (item.condition) {
          return new File([blob], item.name, { type: blob.type });
        } else {
          return new File([" "], item.name, { type: blob.type });
        }
      }
      return new File([blob], item.name, { type: blob.type });
    }),
  );

  const mainScripts = await Promise.all(
    buildWpScripts({
      projectSetting: data.projectSetting,
    }).map(async (item) => {
      const blob = await (await fetch(item.localUrl)).blob();
      if (isBoolean(item.condition)) {
        if (item.condition) {
          return new File([blob], item.name, { type: blob.type });
        } else {
          return new File([" "], item.name, { type: blob.type });
        }
      }
      return new File([blob], item.name, { type: blob.type });
    }),
  );

  // for (const script of mainScripts) {
  //   // const res = await wp_update_media({ file: script, projectId: id });
  //   files.push(script);
  // }

  files.push(...mainHeaderScripts, ...mainScripts);

  const fontsCss = new File([getFonts(data.projectData) || " "], "fonts.css", {
    type: "text/css",
  });

  const infinitelyStyles = new File(
    [
      data.projectSetting.include_canvas_styles_in_build_file
        ? await (await fetch("/styles/style.css")).blob()
        : " ",
    ],
    "infinitely.css",
    { type: "text/css" },
  );

  const globalRules = new File(
    [
      !data.projectSetting.enable_tailwind
        ? await (await fetch(`/styles/global-rules.css`)).blob()
        : " ",
    ],
    "global-rules.css",
    { type: "text/css" },
  );

  files.push(...[fontsCss, infinitelyStyles, globalRules]);

  // const gCss = new File(
  //   [data.global.css || " html{ --_init: 0} "],
  //   "global.css",
  //   {
  //     type: "text/css",
  //   },
  // );
  // const gJs = new File(
  //   [data.global.js || "console.log('global.js')"],
  //   "global.js",
  //   {
  //     type: "application/javascript",
  //   },
  // );

  // files.push(...[gCss, gJs]);

  return await wp_upload_multiple_files({
    projectId: data.id,
    files,
  });
  // return await wp_update_media_files({
  //   projectId: data.id,
  //   check_exist: true,
  //   files,
  // });
}

/**
 * Fetch all posts of a given post type via the custom
 * `infinitely-api/v1/get-posts` endpoint (distinct from the standard
 * `wp/v2` collection endpoints used by {@link wp_get}).
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {string} options.post_type
 * @returns {Promise<any>} Parsed JSON array of posts.
 * @throws {Error} If `projectId` is missing or the request fails.
 */
export async function wp_get_posts({ projectId, post_type }) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(
      wp_meta,
      `infinitely-api/v1/get-posts?post_type=${post_type}`,
    ),
    {
      method: "GET",

      headers: {
        Authorization: createWpToken(wp_meta),
        // ❌ DO NOT set Content-Type manually
      },
      // body: formData,
    },
  );

  const json = await response?.json?.();
  console.log("get-posts:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Insert a single WordPress post (with optional meta and featured image), via
 * the custom `infinitely-api/v1/insert-post` endpoint.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {object} [options.post_data={}] - WP post fields (title, content, status, type, etc.).
 * @param {object} [options.meta_data={}] - Post meta to attach.
 * @param {File|null} [options.featured_image=null] - Featured image file to upload alongside the post.
 * @returns {Promise<object>} Parsed JSON of the created post.
 * @throws {Error} If `projectId` is missing or the request fails.
 */
export async function wp_insert_post({
  projectId,
  post_data = {},
  meta_data = {},
  featured_image = null, // 👈 pass File object here
}) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const formData = new FormData();

  // Important: stringify objects
  formData.append("post", JSON.stringify(post_data));
  formData.append("meta", JSON.stringify(meta_data));

  // Append file if exists
  if (featured_image instanceof File) {
    formData.append("featured_image", featured_image);
  }

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }
  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/insert-post`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        // ❌ DO NOT set Content-Type manually
      },
      body: formData,
    },
  );

  const json = await response?.json?.();
  console.log("insert-post:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * @typedef {Object} WpInsertPostData
 * @property {number} [ID]
 * @property {string} [post_title]
 * @property {string} [post_content]
 * @property {string} [post_excerpt]
 * @property {string} [post_status]
 * @property {string} [post_type]
 * @property {string} [post_name]
 * @property {number} [post_author]
 * @property {number} [post_parent]
 * @property {number} [menu_order]
 */

/**
 * @typedef {Object} WpInsertPost
 * @property {WpInsertPostData} post
 * @property {Object.<string, any>} [meta]
 */

/**
 * Insert multiple WordPress posts in a single request, via the custom
 * `infinitely-api/v1/insert-posts` endpoint.
 *
 * @param {Object} options
 * @param {number|string} options.projectId
 * @param {WpInsertPost[]} options.posts
 * @returns {Promise<any>}
 * @throws {Error} If `projectId` is missing, `posts` is empty/not an array, or the request fails.
 */
export async function wp_insert_posts({ projectId, posts }) {
  if (!projectId) {
    throw new Error("Option name or project id not found");
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Posts array is required");
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const formData = new FormData();

  formData.append("posts", JSON.stringify(posts));

  const response = await fetch(
    createWebsiteLink(wp_meta, "infinitely-api/v1/insert-posts"),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
      },
      body: formData,
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || `Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Delete multiple WordPress posts in a single request, via the custom
 * `infinitely-api/v1/delete-posts` endpoint.
 *
 * @param {Object} options
 * @param {number|string} options.projectId
 * @param {number[]} options.ids
 * @param {boolean} [options.force=true] - If true, bypasses trash and permanently deletes.
 * @returns {Promise<any>}
 * @throws {Error} If `projectId` is missing, `ids` is empty/not an array, or the request fails.
 */
export async function wp_delete_posts({ projectId, ids, force = true }) {
  if (!projectId) {
    throw new Error("Option name or project id not found");
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Ids array is required");
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const formData = new FormData();

  formData.append("ids", JSON.stringify(ids));
  formData.append("force", String(force));

  const response = await fetch(
    createWebsiteLink(wp_meta, "infinitely-api/v1/delete-posts"),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
      },
      body: formData,
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || `Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Save a post's editor code (per-post meta + optional global assets) in one
 * call, via the custom `infinitely-api/v1/save-code` endpoint.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {number|string} options.post_id
 * @param {object} [options.meta={}] - Per-post Infinitely meta to save.
 * @param {object} [options.global={}] - Global (site-wide) code/assets to save alongside.
 * @param {string|boolean} options.save_state
 * @returns {Promise<object>} Parsed JSON save result.
 * @throws {Error} If `projectId`, `post_id`, or `save_state` is missing/falsy.
 */
export async function wp_save_code({
  projectId,
  post_id,
  meta = {},
  global = {},
  save_state,
}) {
  if (!(projectId && post_id && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/save-code`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id,
        meta,
        global,
        save_state,
      }),
    },
  );

  const json = await response.json();
  console.log("save-code : ", json);
  return json;
}

/**
 * Fetch all Infinitely "symbols" (reusable components) registered on the
 * site, via the custom `infinitely-api/v1/get-symbols` endpoint.
 *
 * Note: unlike most other `wp_*` calls here, this request does not send an
 * `Authorization` header.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @returns {Promise<any>} Parsed JSON array/collection of symbols.
 * @throws {Error} If `projectId` is missing or the request fails.
 */
export async function wp_get_symbols({ projectId }) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/get-symbols`),
    {
      method: "GET",
    },
  );

  const json = await response?.json?.();
  console.log("get symbols:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Update a single symbol's post meta, via `infinitely-api/v1/update-symbol`.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {number|string} options.symbol_id
 * @param {object} options.symbol_meta - New meta payload to store for the symbol (sent as `post_meta`).
 * @returns {Promise<any>} Parsed JSON update result.
 * @throws {Error} If `projectId`, `symbol_id`, or a plain-object `symbol_meta` is missing, or the request fails.
 */
export async function wp_update_symbol({ projectId, symbol_id, symbol_meta }) {
  if (!(projectId && symbol_id && isPlainObject(symbol_meta))) {
    throw new Error(`Symbol id name or project id or symbol meta not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/update-symbol`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol_id,
        post_meta: symbol_meta,
      }),
    },
  );

  const json = await response?.json?.();
  console.log("update symbols", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Batch-update several symbols at once, via `infinitely-api/v1/update-symbols`.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @param {object[]} [options.symbols=[]] - Array of symbol update payloads (shape defined by the WP-side handler).
 * @returns {Promise<any>} Parsed JSON update result.
 * @throws {Error} If `projectId`/`symbols` (as array) is missing, or the request fails.
 */
export async function wp_update_symbols({ projectId, symbols = [] }) {
  if (!(projectId && isArray(symbols))) {
    throw new Error(`Symbols or project id or not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/update-symbols`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbols,
      }),
    },
  );

  const json = await response?.json?.();
  console.log("update symbols", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * Fetch all registered GrapesJS blocks for the site, via the custom
 * `infinitely-api/v1/get-blocks` endpoint.
 *
 * Note: like {@link wp_get_symbols}, this request does not send an
 * `Authorization` header.
 *
 * @param {object} options
 * @param {number} options.projectId
 * @returns {Promise<any>} Parsed JSON array/collection of blocks.
 * @throws {Error} If `projectId` is missing or the request fails.
 */
export async function wp_get_blocks({ projectId }) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/get-blocks`),
    {
      method: "GET",
    },
  );

  const json = await response?.json?.();
  console.log("get symbols:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}

/**
 * 
 * @param {{
 * projectId : number,
 * symbol_ids : string[]
 * }} param0 
 * @returns 
 */
export async function wp_unlink_symbols({ projectId, symbol_ids = [] }) {
  if (!projectId) {
    throw new Error(`project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/symbols/remove-references`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol_ids,
      }),
    },
  );

  const json = await response?.json?.();
  console.log("unlink symbols:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return json;
}
