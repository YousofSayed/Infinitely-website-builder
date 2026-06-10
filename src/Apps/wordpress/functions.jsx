import { db } from "../../helpers/db";
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
import {
  fileNameToMediaSlug,
  functionFromString,
  getFonts,
  toQueryParams,
} from "../../helpers/bridge";
import mime from "mime";
import {
  loopOnInfMetaInteractionsData,
  loopOnInfMetaMotionsData,
} from "./helpers";
import { buildWpHeaderScripts, buildWpScripts } from "../../constants/shared";
/**
 *
 * @param {import('../../helpers/types').Wp_Meta} wp_meta
 */
export function createWpToken(wp_meta) {
  return `Basic ${btoa(`${wp_meta.username}:${wp_meta.app_password}`)}`;
}

/**
 *
 * @param {import('../../helpers/types').Wp_Meta} wp_meta
 */
export function createWebsiteLink(wp_meta, endpoint = `wp/v2`) {
  return `https://${wp_meta.website_url}/wp-json/${endpoint}`;
}

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
 * @param {number} mediaId
 * @param {number} projectId
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
    `${createWebsiteLink(wp_meta)}/media${mediaId ? `/${mediaId}` : ""}${paramsQ ? `?${paramsQ}` : ""
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
      `infinitely/v1/asset?slug=${(mediaCnfg.slug)}`,
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

export async function wp_get_blob_media_by_slug({
  media,
  projectId,
}) {
  if (!projectId) {
    throw new Error(`Project id missing`);
  }
  const mime = await (await import('mime')).default;
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
  const fileName = media.source_url.split('/').pop();
  const resBlob = (await res.blob())
  const blob = new File([resBlob], fileName, { type: mime.getType(media.source_url) || 'application/octet-stream' });
  // console.log("wp get blob : ", res, blob, await resBlob.text());
  return blob;
}

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
      const slugs = files.map(file => file.name.replaceAll(".", "-"));
      const files_meta = await wp_get_media_by_slugs({
        projectId,
        slugs
      });

      if (isPlainObject(files_meta)) {
        for (const [slug, file_meta] of Object.entries(files_meta)) {
          const file = files.find(file => slug.toLowerCase() === file.name.replaceAll(".", "-").toLowerCase());
          console.log('file is : ', file, slug, files);

          if (file_meta.is_exist) {
            f_content[file_meta.id] = await file.text();
            if (!f_content[file_meta.id]) {
              throw new Error(`f_content[file_meta.id] is ${f_content[file_meta.id]}`)
            }
          } else {
            await wp_upload_file({
              projectId,
              file
            })
          }
        }
      } else {
        throw new Error(`Files meta is not plain object wp_get_media_by_slugs & in wp_update_media_files`)
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
 * 
 * @param {{projectId : number , files : File[]}} param0 
 * @returns 
 */
export async function wp_upload_multiple_files({ projectId, files = [] }) {
  if (!projectId) {
    throw new Error(`Project id missing`);
  }

  if (files.some(file => !(file instanceof File))) {
    throw new Error(`Files are not files`);
  }

  const mime = await (await import('mime')).default

  // files = files.map(file => {
  //   const newFile =
  //     new File([file], fileNameToMediaSlug(file.name), { type: mime.getType(file.name) })
  //   return newFile
  // })


  const formData = new FormData();
  // fileNameToMediaSlug(file.name)
  for (const file of files) {

    const slug = fileNameToMediaSlug(file.name);

    const ext = file.name.split('.').pop(); // js / css
    const wpFileName = `${slug}.${ext}`;    // global-js.js

    const newFile = new File(
      [file],
      wpFileName,
      { type: mime.getType(file.name) }
    );

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
      method: 'POST',
      headers: {
        Authorization: createWpToken(wp_meta),
      },
      body: formData,
      credentials: 'include'
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


//!!get-media-post-data-and-check-is-exist!!
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

//!!get-content-files!!
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

export async function wp_delete_media_files_by_slugs({ projectId, slugs = [] }) {
  if (!(projectId && slugs.length)) {
    throw new Error(`slugs or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/media/delete-media-by-slugs`),
    {
      method: 'POST',
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slugs
      })
    },
  );

  const json = await response.json();
  console.log("delete-media-by-slugs : ", json);
  return json;
}

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
 * @param {number} mediaId
 * @param {number} projectId
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

export async function wp_get({ endpoint, projectId, params = {} }) {
  if (!(projectId && endpoint)) {
    throw new Error(`Project id Or endpoint not founded in : uploadFile`);
  }
  const strParams = toQueryParams(params);
  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    `${createWebsiteLink(wp_meta)}${endpoint ? `/${endpoint}` : ""}${strParams ? `?${strParams}` : ""
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

export async function wp_per_page_get_looper({
  endpoint,
  projectId,
  params = { per_page: 100, page: 1 },
  per_page_increase = 100,
  isWorker = false,
  callback = () => { },
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
    `${createWebsiteLink(wp_meta)}${endpoint ? `/${endpoint}` : ""}${strParams ? `?${strParams}` : ""
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

export async function wp_connect({ username, password, website_url = "" }) {
  if (!(username && password && website_url)) {
    throw new Error(`Wordpress meta data is missed`);
  }
  console.log('url :', `https://${website_url.replace(/http(\s)?\:\/\//ig, '')}`);

  const response = await fetch(
    `https://${website_url}/wp-json/infinitely-api/v1/connect`,
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
 *
 * @param {import('../../helpers/types').WpPage} number
 */
export async function wp_select_page_to_edite(pageId, projectId) {
  if (!(pageId && projectId)) {
    throw new Error(`Page id or project id not founded`);
  }
  /**
   * @type {import('../../helpers/types').WpPage}
   */
  const page = wp_get_single({
    endpoint: "pages",
    singleId: pageId,
    projectId,
  });

  if (isNumber(page.id)) {
  }
}

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
 *
 * @param {{data : {
 * name:string,
 * description:string,
 * projectSetting:import('../../helpers/types').ProjectSetting
 * id:number;
 * projectData:import(''../../helpers/types').WpProject
 * app_type:string,
 * global:{
 *  css:string;
 *  js:string;
 * }
 * wp_meta:{
 * website_url: string,
 * username: string,
 * password: string,
 *  app_password: string,
 * }
 * }}} param0
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

// export async function wp_insert_post({ projectId, post_data = {}, meta_data = {} }) {
//   if (!projectId) {
//     throw new Error(`Option name or project id not founded`);
//   }

//   const projectData = await db.projects.get(+projectId);
//   const wp_meta = projectData.wp_meta;

//   const response = await fetch(
//     createWebsiteLink(wp_meta, `infinitely-api/v1/insert-post`),
//     {
//       method: 'POST',
//       headers: {
//         Authorization: createWpToken(wp_meta),
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         post: post_data,
//         meta: meta_data
//       })
//     },
//   );

//   const json = await response.json();
//   console.log("insert-post : ", json);
//   return json;
// }

export async function wp_insert_post({
  projectId,
  post_data = {},
  meta_data = {},
  featured_image = null // 👈 pass File object here
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

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/insert-post`),
    {
      method: "POST",
      headers: {
        Authorization: createWpToken(wp_meta),
        // ❌ DO NOT set Content-Type manually
      },
      body: formData
    }
  );

  const json = await response?.json?.();
  console.log("insert-post:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }


  return json;
}


export async function wp_save_code({ projectId, post_id, meta = {}, global = {}, save_state }) {
  if (!(projectId && post_id && save_state)) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;

  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/save-code`),
    {
      method: 'POST',
      headers: {
        Authorization: createWpToken(wp_meta),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id,
        meta,
        global,
        save_state,
      })
    },
  );

  const json = await response.json();
  console.log("save-code : ", json);
  return json;
}

export async function wp_get_symbols({
  projectId,

}) {
  if (!projectId) {
    throw new Error(`Option name or project id not founded`);
  }

  const projectData = await db.projects.get(+projectId);
  const wp_meta = projectData.wp_meta;


  const response = await fetch(
    createWebsiteLink(wp_meta, `infinitely-api/v1/get-symbols`),
    {
      method: "GET",
      // headers: {
      //   Authorization: createWpToken(wp_meta),
      //   // ❌ DO NOT set Content-Type manually
      // },
      // body: formData
    }
  );

  const json = await response?.json?.();
  console.log("get symbols:", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }


  return json;
}

export async function wp_update_symbol({
  projectId,
  symbol_id,
  symbol_meta,
}) {
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
        post_meta: symbol_meta
      })
    }
  );

  const json = await response?.json?.();
  console.log("update symbols", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }


  return json;
}

export async function wp_update_symbols({
  projectId,
  symbols  = []
}) {
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
      })
    }
  );

  const json = await response?.json?.();
  console.log("update symbols", json);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }


  return json;
}