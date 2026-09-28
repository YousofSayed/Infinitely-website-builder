# Infinitely Studio — WordPress Plugin Architecture
> Reference document for AI agents. Version 1.2 — Author: Yousof Sayed
> The plugin is the **WordPress half** of a headless page builder. The editor
> (React + GrapesJS + Recoil + React Query) lives on `localhost:5173` /
> `infinitely.pages.dev` and talks to this plugin exclusively over REST.

---

## 1. High-Level Concept

- The editor saves pages as **JSON component trees** (not HTML) inside post meta `inf_meta`.
- WordPress **renders** those trees server-side into HTML on every request (`render.php`).
- Dynamic values use **tokens**: `{{path.to.value}}` resolved against a **context** array.
- Loops / queries / conditions / pagination are **custom attributes** on components
  (`inf-for`, `inf-query-id`, `inf-if-json`, `inf-pagination-id`…).
- Everything is extensible through WordPress filters (`inf/context`, `inf/normalize_post`,
  `inf_render_component`, `inf/tokens/schema`) and **add-ons** (WooCommerce, ACF).

---

## 2. File Map & Boot Order

`infinitely.php` loads files in this exact order (order matters):

| # | File | Responsibility |
|---|------|----------------|
| 1 | `constants.php` | `HIDDEN_POSTS`, `MAIN_ENDPOINT_NAME` (`infinitely-api/v1`), `ALLOWED_ORIGINS`, `ADD_ONES`, `ADD_ONES_CHECKERS` (function **names as strings** — constants load before helpers, so checkers are evaluated later on `init`) |
| 2 | `helpers.php` | `normalize_post()` (+ `inf/normalize_post` filter), `inf_is_woocommerce_active()`, `inf_is_acf_active()`, render-state helpers (`inf_get_render_state`, `inf_set_render_state`), template helpers (`inf_get_current_template`, `if_template_only`, `if_post_only`, `if_template_with_post`), `inf_motions_registry()`, `define_font_face()`, `replace_normal_with_symbol()` |
| 3 | `tokens.php` | Token engine: context builder, path resolver, renderer, schema walker, `/render-tokens` endpoint |
| 4 | `enqueue_project_scripts.php` | All front-end script/style enqueue + cache busting + `wpApiSettings` localization |
| 5 | `reload.php` | HMR / reload helpers |
| 6 | `CPTs.php` | Registers `inf_symbols`, `inf_blocks`, `inf_motions`, `inf_snippets` (headless, REST-only, `show_ui => false`) |
| 7 | `rest/rest.php` | Core REST endpoints (`/get-tokens`, `/asset`, `/query`, scope-var resolvers) |
| 8 | `inf_template.php` | Template capture + WP template-hierarchy resolution (`inf_get_current_template`) |
| 9 | `custom_meta.php` | Registers `inf_meta` (object, any keys), `inf_template_type`, `inf_disalbe` meta |
| 10 | `init` hook | Loads add-ons from `ADD_ONES` when their `ADD_ONES_CHECKERS` callback returns true |
| 11 | `render.php` | `template_include` render pipeline, component renderer, `body_class`, body-attribute injection, `inf_meta` REST field |
| — | `permissions.php` | CORS, mime whitelist, `wp_check_filetype_and_ext` fix, `.htaccess` CORS writer, `inf_query_permission()` |
| — | `rest/snippets.php` | Snippets CRUD + execution + dynamic hook registration |
| — | `add-ones/woocommerce/woocommerce.php` + `cart.php` | Product enrichment + cart endpoints |
| — | `add-ones/ACF/acf.php` | ACF fields → `{{post.acf.*}}` tokens |

Activation hook: forces permalink structure `/%postname%/` + `flush_rewrite_rules()`.

---

## 3. Data Shapes

### 3.1 `inf_meta` (post meta, object, single)
```jsonc
{
  "saved":       { "html": [components], "css": "", "js": "", "motions": "",
                   "bodyAttributes": {}, "helmet": {} },
  "before_save": { /* same shape — the unpublished draft */ }
}
```
- `save_state` is either `saved` or `before_save`; renderer picks the branch.
- `before_save` exists ⇒ `need_publish_to_wp = true`.
- Preview/dev mode renders `before_save`; production renders `saved`.

### 3.2 `inf_config` (option) — project settings
Keys: `id, name, app_type, logo, colors, projectSetting, fonts, cssLibs, jsHeaderLibs,
jsFooterLibs, mainEditorScripts{header,footer}, mainEditorStyles, globalCss, globalJs,
globalRules, motions, interactions, conditions, queries, symbols, symbolBlocks, blocks,
dynamicTemplates, themes{config,path,root}, currentEditingPage, current_inf_meta,
save_state, installStates, wp_meta{website_url, username, password, app_password}, …`

- `queries` = saved WP_Query arg sets keyed by id (`iNFWPQUERY…`) used by `inf-query-id`.
- `motions` / `interactions` / `conditions` keyed by generated ids referenced from component attributes.

### 3.3 Component tree node
```jsonc
{ "tagName": "section",
  "attributes": { "class": "...", "inf-for": "{{prod.gallery_urls}}",
                  "inf-for-item": "image", "inf-if-json": "[...]" },
  "classes": ["a","b"],              // optional, merged into class attr
  "content": "",                     // raw inner content
  "components": [ /* children */ ] }
// or leaf: { "type": "textnode", "content": "{{post.post_title}}" }
```

---

## 4. Security & Permissions

| Gate | Logic | Used by |
|------|-------|---------|
| `inf_query_permission($req)` | `is_user_logged_in()` **AND** `HTTP_ORIGIN ∈ ALLOWED_ORIGINS` | all builder REST routes |
| `inf_option_permission()` | `current_user_can('manage_options')` **AND** `inf_query_permission()` | option-level routes |
| CORS | `rest_pre_serve_request` filter sets ACAO/credentials/methods/headers for allowed origins; OPTIONS exits early. Plus generated `.htaccess` block for fonts/uploads (`inf_generate_htaccess_cors()` on `init`) | cross-origin editor |

**No nonces are used anywhere.** Auth = app-password Basic header (`createWpToken(wp_meta)`) + cookie session + origin allow-list.

`ALLOWED_ORIGINS`: `https://infinitely.pages.dev`, `https?://localhost:5173`, `https?://127.0.0.1:5173`.

---

## 5. REST API Reference (base: `/wp-json/infinitely-api/v1`)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/get-tokens` | `inf_query_permission` | Token schema for the picker. Params: `post_id`, `post_type`, `vars` (JSON array of scope vars), `include_arrays`, `max_leaves` |
| POST | `/render-tokens` | `inf_query_permission` | Renders a template string (tokens **+ embedded PHP eval**) against context. Params: `template`, `post_id`, `post_type` |
| POST | `/query` | `inf_query_permission` | Executes WP_Query. Body: `{ query_args: {...} }`. Returns normalized posts + `found_posts`, `max_num_pages`, `current_page` |
| GET | `/asset?slug=` | `inf_query_permission` | Returns file as **base64 JSON** (`{success, mime, filename, data}`) — never raw binary (REST corrupts binary) |
| GET/POST | `/snippets` | `inf_query_permission` | List / create snippets |
| GET/PUT/DELETE | `/snippets/{id}` | `inf_query_permission` | Read / update / delete |
| POST | `/snippets/{id}/execute`, `/snippets/execute` | `inf_query_permission` | Manual execution (`execute` takes `name`) |
| GET | `/cart` | `inf_query_permission` | Cart snapshot (WC only) |
| POST | `/cart/add` | `inf_query_permission` | `{product_id, quantity, variation_id, variation}` |
| PUT / DELETE | `/cart/{cart_item_key}` | `inf_query_permission` | Update qty / remove |

WP-core augmentation: `inf_meta` registered as a REST field on **every** post type
(`render.php`, `rest_api_init`), get_callback runs `replace_normal_with_symbol()` per state.

### 5.1 `/get-tokens` scope vars (`vars` param) — two-pass resolution
Pass 1 (no dependencies): `query`, `query_id`, `pagination_query_id`, `ssr_url`, `data`.
Pass 2: `source` vars (resolved from context via `inf_resolve_for_var`, unwraps list arrays to item shape).
**Reason:** a `source` var may depend on a var defined later in the array (e.g. `prodLink` ← `prodPag`).

Resolvers: `inf_resolve_query_var()` (WP_Query → `normalize_post()` of first hit),
`inf_resolve_pagination_var()` (mock pagination matching runtime shape),
`inf_resolve_ssr_var()` (wp_remote_request, any method, headers, body, `ssr_response_path` dot-path),
`inf_resolve_for_var()` (`{{path}}` → context, bracket→`.0` normalization, list unwrap).

---

## 6. Token Engine (`tokens.php`)

### 6.1 Context (`inf_build_context($post_id, $post_type)`)
Groups: `post` (= `normalize_post()`), `user` (WP_User), `site`, `theme`, `request`,
`query` (conditional tags), `time`, `env`, `db`.
Then `apply_filters('inf/context', $context, $filter_meta)` where
`$filter_meta = [post_id, post_type, post]`. Stores `global $inf_context`.
Excluded from picker: groups `request, env, db`; leaf keys matching
`/(pass|secret|activation_key|nonce|^caps$|allcaps|cap_key)/i`.

### 6.2 Rendering (`inf_render_tokens($template, $context, $for_eval)`)
1. `html_entity_decode`.
2. `{{ path }}` → `inf_get_by_path` (dot-path over arrays/objects).
   - array/object → `json_encode` if `$for_eval` else `''`
   - string → quoted+addslashed if `$for_eval` else raw
   - null/scalar → `(string)`
3. If result still contains `<?php` → `eval('?>'.$template)` inside try/catch + output buffer.

### 6.3 Schema (`inf_get_tokens_schema($context, $options)`)
- Options: `max_depth` (5), `max_leaves` (400 default; endpoint accepts override).
- Walks the **live context** (never a hardcoded list) via `inf_context_to_json()`
  (objects → `to_array()` or public vars) + `inf_walk_tokens_for_schema()`.
- List arrays sample index `0` only (`path.0`).
- Each leaf: `{key, label (humanized), type, live_value, resolves}`.
- Final `apply_filters('inf/tokens/schema', $groups, $context)`.
- ⚠️ Known bug class: `max_leaves = 0` silently returns empty groups
  (PHP precedence: `(int) null ?? X` → `0`). Guard param parsing carefully.

---

## 7. Render Pipeline (`render.php`)

`add_filter('template_include', …, 5500)`:
1. `inf_set_render_state('saved')`; `inf_capture_current_template()`; `inf_build_context()`.
2. Resolve `$template_post = inf_get_current_template()` (WP hierarchy map: index, singular,
   single, page, archive, home, front-page, category, tag, taxonomy, author, date, search, 404,
   + `single-{cpt}` / `archive-{cpt}`).
3. **Non-singular** → render template html only.
   **Singular** → render post html, inject into `$context['post']['post_content']`, then render
   template html around it.
4. Output via `inf-full-document-inline.php` receiving `$GLOBALS['inf_full_html']`.

### 7.1 Component renderer
`inf_render_components(array, $save_state)` → fires `apply_filters('inf_before_render_components', null, $components)` then per node `inf_render_component()`:
1. `apply_filters('inf_render_component', false, $component, $save_state, $inf_config, $all)` — string return **overrides** output (used by `inf-query`, `inf-pagination`, `inf-for`, `inf-ssr` components in `components/index.php`).
2. `textnode` → raw content.
3. Motions: `motion-id` / `main-motion-id` + `motion-instance-id` looked up in
   `$inf_config['motions']`; loop motions become `v-gsap` attr, one-shots pushed to
   `inf_motions_registry()` (inlined before `p-vue.js`).
4. Interactions: `interaction-id` / `main-interaction-id` + instance → merge `attr_for_wp` into attributes.
5. Conditions: `inf-if-json` (array of `{var, operator, value}` joined by `"and"/"or"` strings)
   evaluated with `inf_get_condition_value()`; false ⇒ component renders `''`.
6. Attributes escaped single-quoted; `classes` array appended; children recursed.

### 7.2 Loop / query / pagination attributes (components/index.php)
- `inf-query-id` + `inf-query` (JSON WP_Query args) or saved `inf_config.queries[id]`;
  `inf-query-item` names the loop variable (default derived from post_type).
- `inf-for="{{list}}"` + `inf-for-item` + `inf-for-index` — clones node per item, item becomes a context key.
- `inf-pagination-id` linked to a query id → `pagination_links[] {type,url,text}`, `prev_link`, `next_link`, `current`, `max_number`.

### 7.3 Body handling
- `body_class` filter merges template + post `bodyAttributes.class`.
- `template_redirect` (prio 1) output-buffer rewrites `<body …>` to append remaining
  `bodyAttributes` (class excluded).

---

## 8. Enqueue & Cache Busting (`enqueue_project_scripts.php`)

- `$ver = time()` when `is_preview_mode()` or render state `before_save`; else fixed `'1.2'`.
- `wp_head` prio 999: `inf_render_page_data()` for template+post / post-only dev states.
- `script_loader_tag` filter injects custom attributes from `global $inf_script_attributes[handle]`.
- Footer scripts enqueued as a **dependency chain** (`$prev_handle`) preserving editor order.
- `p-vue-js` special-case: enqueues `globalJs` before it and injects motions + template JS + post JS
  via `wp_add_inline_script($handle, …, 'before')`.
- Styles: `mainEditorStyles`, `@font-face` inline (`inf-fonts`), `globalCss`, `cssLibs`.
- `wp_localize_script('inf-builder', 'wpApiSettings', …)`:
  always: `nonce, restUrl, queryUrl, queryMethod, apiBase, tokensUrl, renderTokensUrl, assetUrl, ajaxUrl, homeUrl, isLoggedIn`;
  **only when WooCommerce active**: `cartUrl, cartAddUrl, cartEnabled, currency`.

### 8.1 Script-order law (learned the hard way)
`<script type="module">` **always executes after all classic scripts**, regardless of DOM position.
Libs that must expose globals (PetiteVue, GSAP, auto-animate) stay **classic**.
auto-animate ships as a **pure global IIFE** (`window.autoAnimate`) — never a module.
Forcing `type="module"` on UMD libs breaks their `window` attachment (strict-mode `this`).

---

## 9. CPTs & Meta

- CPTs (headless, `show_in_rest`, no UI): `inf_symbols`, `inf_blocks`, `inf_motions`, `inf_snippets`.
- `HIDDEN_POSTS` keeps builder types out of pickers (`inf_template`, add `inf_snippets`).
- Meta: `inf_meta` (object, `additionalProperties: true`, auth `edit_posts`) on all types;
  `inf_template_type` on all non-hidden types; `inf_disalbe` on `inf_template`.

---

## 10. Add-on System

`constants.php`:
```php
ADD_ONES = ['woocommerce' => '/add-ones/woocommerce/woocommerce.php',
            'acf'        => '/add-ones/ACF/acf.php'];
ADD_ONES_CHECKERS = ['woocommerce' => 'inf_is_woocommerce_active',
                     'acf'        => 'inf_is_acf_active'];   // strings, called on init
```
Loader on `init`: `if (function_exists($checker) && call_user_func($checker)) require …`.

### 10.1 WooCommerce add-on
- `inf/normalize_post` filter (products): adds `gallery_urls` (featured first + gallery),
  `price, regular_price, sale_price, sku, stock_status, permalink`.
  → makes `{{product.gallery_urls}}` loopable in picker **and** runtime (both call `normalize_post`).
- `cart.php`: cart endpoints + `inf_get_cart_data()`
  (`items[]{key,product_id,variation_id,name,quantity,price,line_total,thumbnail,permalink,variation}`,
  `item_count, total, subtotal, discount_total, tax_total, shipping_total`).

### 10.2 ACF add-on (Free **and** Pro — same API)
- `inf/normalize_post` filter: `get_fields($post_id)` → recursive `inf_normalize_acf_values()`:
  image-like array (`url`+`ID`) → URL string; arrays recursed; `WP_Post` → `normalize_post()`;
  `WP_Term` → flat array; scalars pass-through. Result under `$result['acf']`
  → tokens `{{post.acf.*}}`, repeaters loop with `inf-for`.

---

## 11. Snippets System (`rest/snippets.php` + `inf_snippets` CPT)

Meta fields: `code, description, hook, is_filter, priority, accepted_args, enabled, created_at`.
- `hook = 'manual'` → only via `/snippets/execute`.
- Any other hook string → registered **dynamically** on `init` prio 5 via
  `add_action`/`add_filter` (user chooses any WP/plugin hook).
- `is_filter = true` → callback must return (snippet `return` value, else `$args[0]` passthrough).
- `is_filter = false` → echoed output is printed (ideal for `wp_head`/`wp_footer`).
- Executor `inf_run_snippet_code()`: `eval()` inside `ob_start` + `try/catch Throwable`;
  scope vars: `$context, $snippet, $args (hook args), $params (request), $post_id, $post`.
- Errors: manual → JSON error payload; auto-fire → `error_log` under WP_DEBUG, page never crashes.
- Limitation: hooks firing **before** `init:5` cannot be targeted.

---

## 12. Media / Upload Pipeline (bug graveyard — do not regress)

1. `upload_mimes` + **single** `wp_check_filetype_and_ext` filter using one whitelist
   (`inf_allowed_mimes()`); never fall back to `'*/*'` or `application/octet-stream`.
   (Old dual-filter with `$mimes[$ext] ?? '*/*'` wrote `*/*` into `post_mime_type`.)
2. Every programmatic upload MUST call
   `wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $file))`
   — without `_wp_attachment_metadata['sizes']`: media grid shows file icons and
   WooCommerce galleries render empty (IDs saved, sizes missing).
3. `/asset` returns **base64 JSON**, never `readfile()` inside REST (binary corruption).
4. Slug lookups need variants: `name-jpg` ↔ `name.jpg` ↔ base name
   (strategies: `post_name`, `_wp_attached_file` meta, `guid`, `post_title`).
5. `rest_prepare_attachment` overrides `mime_type`/`media_type` via `finfo`, injects `svg_content`.

---

## 13. Extension Points Cheat-Sheet

| Hook | Type | Args | Use |
|------|------|------|-----|
| `inf/normalize_post` | filter | `$result, $post_id, $post` | enrich any post type (WC, ACF pattern) |
| `inf/context` | filter | `$context, $filter_meta` | add top-level token groups |
| `inf/tokens/schema` | filter | `$groups, $context` | inject synthetic picker tokens |
| `inf_render_component` | filter | `false, $component, $save_state, $inf_config, $all` | override/custom component tags |
| `inf_before_render_components` | filter-as-action | `null, $components` | pre-render global side effects |
| `inf_query_permission` / `inf_option_permission` | functions | — | auth gates |

---

## 14. Frontend Contract (editor side)

- Auth header: `Authorization: Basic base64(user:app_password)` (`createWpToken(wp_meta)`),
  `credentials: 'include'`; **no** `X-WP-Nonce`.
- Workers: `fetcherWorker`, `pageBuilderWorker`, `infinitelyWorker`, `assetsWorker`
  via `wpWorkerCallbackMaker(worker, cmd, props, cb)` (`cb({done, res})`).
- Storage: IndexedDB `db.projects` (project + `currentEditingPage` + `current_inf_meta`),
  OPFS for page files (`local.js`, global js/css).
- Save flow: editor → `wp_update_meta` (`before_save`) → BroadcastChannel `wp_preview_bc`
  triggers preview reload with `?save_state=before_save`.
- Token picker: opens on `{{` in supported inputs (attrs with `inf-tokens-container`,
  ignores `inf-tokens-ignore`, monaco excluded); inserts `{{key}}`.

---

## 15. Gotchas / Lessons (read before touching)

1. **Module vs classic script order** — modules run last; globals libs must be classic/IIFE.
2. **`(int) $x ?? default`** precedence bug yields `0`, not default → empty token schema.
3. **REST + binary** = corruption; always base64 or rewrite-rule raw endpoint.
4. **`max_leaves` budget** — big groups (products with attachments) eat the cap;
   WooCommerce-enriched keys sit at object end and get cut first. Raise cap via param.
5. **Two-pass var resolution** is required for `source` vars (dependency order ≠ array order).
6. **Attachment rows without metadata** look fine in browser (raw bytes) but break
   media UI + galleries (DB-driven). Repair = fix mime + regenerate metadata.
7. **`get_page_by_path`** only matches exact `post_name`; UUID-named uploads come from the
   plugin uploader, not WP admin.
8. **`inf_meta` is one object** — always merge (`merge: true`) when updating via worker.
9. **`template_include` prio 5500** runs late on purpose; don't move earlier.
10. **Snippets `eval`** is gated by login+origin only — treat snippet creation as admin-level power.

---

## 16. Glossary

| Term | Meaning |
|------|---------|
| save_state | `saved` (published) vs `before_save` (draft rendered in preview/dev) |
| context | The array tokens resolve against (`inf_build_context`) |
| token | `{{dot.path}}` placeholder |
| scope var | Entry in `/get-tokens?vars=` creating a context group (query/ssr/source/…) |
| symbol | Reusable component stored in `inf_symbols`, instanced by id attrs |
| motion | GSAP recipe in `inf_config.motions`, bound via `motion-id` attrs |
| interaction | Attribute-set recipe in `inf_config.interactions` |
| template post | `inf_template` CPT row matched by WP hierarchy (`inf_template_type`) |
| add-on | Conditional plugin module loaded via `ADD_ONES` + checker |