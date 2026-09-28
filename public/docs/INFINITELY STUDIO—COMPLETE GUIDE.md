# Infinitely Studio — The Complete Guide
### For End Users & AI Agents · Version 1.2

> **One document, two audiences:**
> - **End users** → read Parts 1–5, then jump to the feature chapters you need.
> - **AI agents / developers** → read Part 6 (Component JSON Spec) and Part 16 (Agent Rules) first — they are the contract for generating valid output.
>
> Infinitely Studio is a **headless website builder**. The editor (React + GrapesJS) builds pages as **JSON component trees**; the WordPress plugin renders those trees server-side into real HTML. Nothing is stored as raw HTML — **pages are data**.

---

## Table of Contents

1. [Part 1 — Understanding Infinitely Studio](#part-1--understanding-infinitely-studio)
2. [Part 2 — Quick Start (Your First Site in 15 Minutes)](#part-2--quick-start)
3. [Part 3 — Editor Tour (Every Panel Explained)](#part-3--editor-tour)
4. [Part 4 — Pages Manager](#part-4--pages-manager)
5. [Part 5 — Blocks Library (Every Block, With Steps)](#part-5--blocks-library)
6. [Part 6 — Component JSON Reference (AI Agent Contract)](#part-6--component-json-reference)
7. [Part 7 — Dynamic Data System](#part-7--dynamic-data-system)
8. [Part 8 — Reusable Content: Symbols, Templates, Dynamic Templates](#part-8--reusable-content)
9. [Part 9 — Styling & Responsive Design](#part-9--styling--responsive-design)
10. [Part 10 — Motion: Animations & Interactions](#part-10--motion)
11. [Part 11 — Assets: Media, Fonts, Libraries, Custom Code](#part-11--assets)
12. [Part 12 — WordPress Integration](#part-12--wordpress-integration)
13. [Part 13 — Infinitely AI](#part-13--infinitely-ai)
14. [Part 14 — Save, Export, Share, Publish](#part-14--save-export-share-publish)
15. [Part 15 — Complete Real-World Examples](#part-15--complete-real-world-examples)
16. [Part 16 — AI Agent Rules & Generation Checklist](#part-16--ai-agent-rules)
17. [Part 17 — Cheat Sheets](#part-17--cheat-sheets)
18. [Part 18 — Troubleshooting & Gotchas](#part-18--troubleshooting--gotchas)
19. [Part 19 — Glossary](#part-19--glossary)

---

# Part 1 — Understanding Infinitely Studio

## 1.1 The Mental Model

```text
Infinitely Studio
│
├── EDITOR (the app you use)
│   ├── Pages        → actual website content (JSON component trees)
│   ├── Blocks       → drag-and-drop building pieces
│   ├── Symbols      → reusable named components
│   ├── Templates    → reusable saved sections/pages
│   ├── Dynamic Templates → reusable API/data-driven resources
│   ├── Motions      → animations & interactions
│   ├── Assets       → media, fonts, libraries
│   └── Settings     → project configuration
│
├── STORAGE (where it lives)
│   ├── IndexedDB    → project data (db.projects)
│   └── OPFS         → page files, CSS, JS, fonts
│
└── OUTPUT (what it produces)
    ├── Normal project   → static export (HTML/CSS/JS zip)
    └── WordPress project → inf_meta JSON rendered server-side
```

## 1.2 The Golden Rule

> **Everything is a JSON component tree.**
> A page is never raw HTML. It is a tree of nodes: `{ tagName, attributes, classes, components }`. The renderer (WordPress `render.php` or the export pipeline) turns trees into HTML on every request.

## 1.3 Project Types

| Type | Storage | Rendering | Best for |
|---|---|---|---|
| **Normal** | Local (IndexedDB + OPFS) | Static export | Landing pages, portfolios, offline work |
| **WordPress** | `inf_meta` post meta on WP | Server-side on every request | Blogs, shops, dynamic content, ACF, WooCommerce |

## 1.4 The Six Concepts You Must Keep Separate

| Concept | Meaning |
|---|---|
| **Block** | Something you drag from the Blocks panel onto a page |
| **Page** | A page containing actual website content |
| **Symbol** | A reusable *named component* (edit once → updates everywhere) |
| **Template** | Reusable *saved page/section content* (a starting point, detached copies) |
| **Dynamic Template** | Reusable *dynamic/API-oriented* resource (data-driven) |
| **Theme** | A collection of design modes, categories, and variables |

## 1.5 How Rendering Works (WordPress)

1. Editor saves the JSON tree into post meta **`inf_meta`** (one object per post, auth `edit_posts`).
2. On each request, `render.php` (hooked to `template_include` at priority **5500**) resolves the template, walks the tree, and renders HTML.
3. **Tokens** `{{dot.path}}` are resolved against a **context array** (`site.*`, `post.*`, `time.*`, `pagination.*`, …).
4. Special attributes drive behavior: `inf-for`, `inf-query-id`, `inf-if-json`, `inf-pagination-id`, `inf-ssr`, `inf-symbol-id`.
5. Render state controls what you see: `saved` (published) vs `before_save` (draft/preview).

---

# Part 2 — Quick Start

## 2.1 Build Your First Site — Step by Step

1. **Open the Workspace** → click **New site**.
2. Enter **name** and **description**, choose the **project type**:
   - *Normal* → fully local project.
   - *WordPress* → you'll enter `website_url`, `username`, and an **Application Password** (create one in WP Admin → Users → Profile → Application Passwords). No nonces are used — auth is `Basic base64(user:app_password)`.
3. The project opens in the **Editor**. The **Index** page is created automatically (and is protected from deletion in normal projects).
4. Open the **Blocks** panel → drag a **Section** onto the canvas.
5. Drag a **Container** inside the Section, then drop a **Heading** and **Text** inside it.
6. **Double-click** any text element to edit its content.
7. With an element selected, use the **Style panel** for colors, spacing, typography, layout.
8. Use the **Layers panel** to see and reorder the tree.
9. Switch device views (**Desktop / Tablet / Mobile**) and adjust responsive styles.
10. **Save** (the editor autosaves if enabled in Settings).
11. Open **Preview** to see the real rendered result (not just the canvas).
12. **Export** (normal) or **publish to WordPress** (WP project).

## 2.2 The 16-Step Professional Workflow

```text
1.  Open Workspace → create project → choose type
2.  Open a page
3.  Add blocks/components to the canvas
4.  Select elements and edit content
5.  Configure attributes and traits
6.  Style the selected element
7.  Arrange the page using Layers
8.  Repeat for other pages
9.  Add responsive styles for desktop, tablet, mobile
10. Add animations or interactions
11. Create reusable Symbols or Templates
12. Add assets, fonts, libraries, or custom code
13. Configure page settings / SEO (Page Helmet)
14. Save
15. Preview & QA
16. Export / Share / Publish
```

---

# Part 3 — Editor Tour

| Area | What it does | When to use |
|---|---|---|
| **Workspace** | Project list, create/import projects | Starting out |
| **Pages Manager** | Create, search, rename, upload/download, delete pages | Multi-page sites |
| **Blocks Panel** | All building blocks by category + search | Adding content |
| **Canvas** | Visual editing area | Always |
| **Layers Panel** | The component tree of the current page | Nesting, reordering |
| **Style Panel** | Visual CSS controls + code-level CSS editor | Styling |
| **Traits Panel** | Component-specific properties (src, href, autoplay…) | Configuring components |
| **Code Manager** | Direct control over project code | Advanced users |
| **Files Manager** | Inspect project files (OPFS) | Debugging, advanced edits |
| **Media Manager** | Upload/select images, video, audio, SVG | Adding media |
| **Symbols & Templates Manager** | Manage reusable resources | Reuse |
| **Dynamic Templates Manager** | Manage data-driven templates | API content |
| **REST API Models** | Define API resources for dynamic components | API-driven data |
| **Custom Fonts** | Install Google Fonts or upload font files | Typography |
| **Library Installer** | Add JS/CSS libraries (CDN or uploaded) | Third-party features |
| **Page Helmet** | Page-level `<head>`/SEO metadata | SEO |
| **Animations Builder** | GSAP-based motion design | Motion |
| **Interactions** | Event-driven behaviors | Behavior |
| **Infinitely AI** | AI chats & preferences | AI assistance |
| **Settings** | Project settings (autosave, Tailwind, script bundling…) | Configuration |
| **Preview / Frontend** | Rendered output | QA |
| **Share** | Dropbox sync/share | Collaboration |
| **Export** | Build downloadable project | Delivery |

> ⚠️ **The canvas is not the final website.** Always verify spacing, scripts, animations, dynamic data, and responsiveness in **Preview** before publishing.

---

# Part 4 — Pages Manager

## 4.1 Create a Page
1. Open **Pages**.
2. Type the page name in the input.
3. Press **Enter** or click the create button.

## 4.2 Search Pages
Use the Pages search field — essential when a project has many pages.

## 4.3 Page Settings (Page Helmet)
Each page has a settings action opening the **Page Helmet** modal — manage `<head>` metadata (title, meta tags, links) separately from visual content.

## 4.4 Download / Upload Pages
- **Download page** → exports that page's definition as a `.json` file.
- **Upload pages** → import one or more `.json` files to move page definitions between compatible projects.

## 4.5 Delete Pages
Every page has a delete action — **except** the normal project's **Index** page, which is protected. Before deleting, check that no navigation or content depends on the page.

---

# Part 5 — Blocks Library

> **Universal workflow for any block:**
> 1. Open **Blocks** → 2. Find the category → 3. Drag the block to the canvas → 4. Drop it → 5. Select it → 6. Configure via Traits/Style panels.
>
> Use **search** when your project has many custom blocks, Symbols, or Templates.

## 5.1 Structure Blocks

### Section
Full-width page region (hero, features, footer…).
**Use when:** starting a new page region.
```json
{ "tagName": "section", "classes": ["hero-section"], "attributes": { "id": "hero" }, "components": [] }
```

### Container
Constrained-width wrapper inside a Section.
**Use when:** you need max-width content inside a full-width section.
```json
{ "tagName": "div", "classes": ["container"], "components": [] }
```

### Splitter
Resizable/paned layout divider.
**Use when:** you need side-by-side panes.

## 5.2 Content Blocks

### Heading
`h1`–`h6` text.
```json
{ "tagName": "h1", "classes": ["hero-title"], "components": [{ "type": "textnode", "content": "Welcome to {{ site.name }}" }] }
```

### Text
Paragraph/rich text.
```json
{ "tagName": "p", "components": [{ "type": "textnode", "content": "Today is {{ time.date }}" }] }
```

### Link
```json
{ "tagName": "a", "attributes": { "href": "/about" }, "components": [{ "type": "textnode", "content": "About us" }] }
```

### Button
**Checklist:** label ✔ action ✔ hover/active states ✔ accessibility attributes ✔.
```json
{ "tagName": "a", "attributes": { "href": "#", "class": "btn btn-primary" }, "components": [{ "type": "textnode", "content": "Click Me" }] }
```

### Image
**Steps:** 1. Select image block → 2. open Media trait → 3. upload/select asset → 4. set dimensions & object-fit → 5. test responsive.
```json
{ "tagName": "img", "attributes": { "src": "/assets/hero.png", "alt": "Hero image", "loading": "lazy" } }
```

### Media (generic)
Generic media wrapper supporting multiple media types.

### Video
**Check:** source, dimensions, controls, autoplay behavior, responsive sizing, performance. Large files hurt load time.
```json
{ "tagName": "video", "attributes": { "src": "/assets/clip.mp4", "controls": "true" } }
```

### Audio
Traits: **src** (media picker, audio), **autoplay** (`true`/`false`), **loop**.
```json
{ "tagName": "audio", "attributes": { "src": "/assets/track.mp3", "controls": "true" } }
```

### SVG
For logos, icons, illustrations. Test in both editor and final frontend.

### Iframe
For embedded external content. **Before publishing verify:** the site permits embedding ✔ works in target browser ✔ responsive ✔ not blocked by security policies ✔.

### Spline
Interactive 3D scenes. ⚠️ 3D is expensive — test performance on real target devices.

### Slider (Swiper-based)
Slides, navigation, autoplay, loop, effects, responsive behavior. Always test on mobile.
```json
{
  "tagName": "swiper-container",
  "attributes": { "space-between": "30", "loop": "true", "autoplay": "true" },
  "components": [
    { "tagName": "swiper-slide", "components": [ { "tagName": "img", "attributes": { "src": "/assets/slide-1.jpg" } } ] },
    { "tagName": "swiper-slide", "components": [ { "tagName": "img", "attributes": { "src": "/assets/slide-2.jpg" } } ] }
  ]
}
```

## 5.3 Form & Filter Blocks

### Input
For search, contact, user input. Configure labels, placeholders, attributes.
```json
{ "tagName": "input", "attributes": { "type": "email", "name": "email", "placeholder": "you@example.com" } }
```

### Input Filter
Filters a bound collection as the user types (pairs with dynamic containers).

### Filter Button
Trigger-style filter control (pairs with Input Filter / dynamic lists).

## 5.4 Dynamic Blocks (the powerful ones)

| Block | Purpose |
|---|---|
| **Dynamic Text** | Text bound to tokens/API data |
| **Dynamic Container** | Container whose children render from data |
| **Looper** | Repeats children per data item |
| **Load More** | Incremental loading for long collections (products, posts, API results) |
| **Next / Previous** | Navigation controls for paginated/navigable content |

Full syntax for all of these → **Part 7: Dynamic Data System**.

## 5.5 Reusable Blocks

| Block | Meaning |
|---|---|
| **Symbol** | Live-linked reusable component (`inf-symbol-id`) |
| **Template** | Saved section/page content you can drop in |

---

# Part 6 — Component JSON Reference

> **This is the contract for AI agents.** Every element in Infinitely Studio is one of two shapes.

## 6.1 The Component Node

```json
{
  "tagName": "div",
  "attributes": { "key": "value" },
  "classes": ["class-1", "class-2"],
  "components": [ /* child components */ ],
  "content": "raw content (rarely used directly)"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `tagName` | string | ✅ | HTML tag: `div`, `section`, `h1`, `p`, `img`, `a`, `button`, `input`, `swiper-container`… |
| `attributes` | object | ❌ | HTML attributes as key/value pairs (strings) |
| `classes` | string[] | ❌ | Array of CSS class names |
| `components` | array | ❌ | Child nodes (components or text nodes) |
| `content` | string | ❌ | Raw content — rarely used directly |

## 6.2 The Text Node (leaf)

```json
{ "type": "textnode", "content": "Hello {{ site.name }}" }
```

> **Rule:** visible text is *always* a text node inside `components`. Tokens work inside text nodes **and** inside attribute values.

## 6.3 Dynamic Attributes — Master Table

| Task | Attribute / Syntax |
|---|---|
| Plain text | `{ "type": "textnode", "content": "..." }` |
| Dynamic value | `{{ post.post_title }}` |
| Condition | `inf-if-json` (JSON string array) |
| Loop | `inf-for` + `inf-for-item` + `inf-for-index` |
| Dynamic query | `inf-query` + `inf-query-id` + `use-ajax` |
| Pagination | `inf-pagination` + `inf-pagination-id` |
| External fetch | `inf-ssr` + `ssr-loop` |
| Symbol reference | `inf-symbol-id` |
| Condition operators | `equals`, `includes`, `contains` |
| Logic operators | `"and"`, `"or"` |

## 6.4 Tokens `{{ }}`

- Syntax: `{{dot.path}}` — resolved server-side against the **context array**.
- Regex used by the engine: `/\{\{\s*([\w.]+)\s*\}\}/`.
- Tokens work in **both** `content` and `attributes`.
- In the editor, typing `{{` in a supported input opens the **token picker** (attributes with `inf-tokens-container`; elements with `inf-tokens-ignore` are excluded; Monaco editor excluded).
- Verify exact available paths via the **`/get-tokens`** REST endpoint or the token picker — the schema is extensible via the `inf/tokens/schema` filter.

## 6.5 Conditional Rendering — `inf-if-json`

The value is a **JSON string containing an array**: `[value, operator, value]`.
Operators: `equals`, `includes`, `contains`. Combine with `"and"` / `"or"`.
Evaluated server-side by `inf_get_condition_value()` / `inf_eval_expression()`.

```json
{
  "tagName": "span",
  "attributes": {
    "inf-if-json": "[\"{{ post.acf.is_featured }}\", \"equals\", \"true\"]"
  },
  "classes": ["badge"],
  "components": [{ "type": "textnode", "content": "Featured" }]
}
```

Compound logic example:

```json
{
  "tagName": "div",
  "attributes": {
    "inf-if-json": "[[\"{{ post.acf.sale_price }}\", \"contains\", \"9\"], \"or\", [\"{{ post.acf.on_sale }}\", \"equals\", \"yes\"]]"
  },
  "components": [{ "type": "textnode", "content": "On Sale 🔥" }]
}
```

## 6.6 Loops — `inf-for`

```json
{
  "tagName": "li",
  "attributes": {
    "inf-for": "{{ pagination.pagination_links }}",
    "inf-for-item": "pagination_link",
    "inf-for-index": "i"
  },
  "components": [
    { "tagName": "a", "attributes": { "href": "{{ pagination_link.url }}" },
      "components": [{ "type": "textnode", "content": "{{ pagination_link.text }}" }] }
  ]
}
```

- `inf-for` → the array token to iterate.
- `inf-for-item` → variable name for the current item.
- `inf-for-index` → optional index variable.

## 6.7 Dynamic Queries — `inf-query`

Runs a **WP_Query** (POST `/query` accepts WP_Query JSON). The node's children act as the **item template**, repeated per result. Each result is a **normalized post** (`normalize_post()` + `inf/normalize_post` filter), so `{{ post.* }}` tokens resolve per item.

```json
{
  "tagName": "div",
  "classes": ["post-grid"],
  "attributes": {
    "inf-query": "{\"post_type\":\"post\",\"posts_per_page\":6,\"orderby\":\"date\",\"order\":\"DESC\"}",
    "inf-query-id": "latest-posts",
    "use-ajax": "true"
  },
  "components": [
    {
      "tagName": "article",
      "classes": ["post-card"],
      "components": [
        { "tagName": "img", "attributes": { "src": "{{ post.thumbnail }}", "alt": "{{ post.post_title }}" } },
        { "tagName": "h3", "components": [{ "type": "textnode", "content": "{{ post.post_title }}" }] },
        { "tagName": "p",  "components": [{ "type": "textnode", "content": "{{ post.excerpt }}" }] }
      ]
    }
  ]
}
```

Common WP_Query fields you can put in `inf-query` JSON:
`post_type`, `posts_per_page`, `paged`, `orderby`, `order`, `s`, `category_name`, `tag`, `meta_query`, `date_query` (year/month/week/day/hour/minute/second), `fields` (`"all"`), `suppress_filters` (`false`).

## 6.8 Pagination — `inf-pagination`

Link it to a query via matching ids. Exposed tokens: `pagination_links[] {type,url,text}`, `prev_link`, `next_link`, `current`, `max_number`.

```json
{
  "tagName": "inf-pagination",
  "attributes": {
    "inf-pagination-id": "latest-posts",
    "allow-numbers": "true",
    "allow-prev-next": "true",
    "max-show": "2",
    "max-style": "window-first-last"
  },
  "components": [
    {
      "tagName": "a",
      "attributes": { "href": "{{ pagination.prev_link }}" },
      "components": [{ "type": "textnode", "content": "prev" }]
    },
    {
      "tagName": "a",
      "attributes": {
        "inf-for": "{{ pagination.pagination_links }}",
        "inf-for-item": "pagination_link",
        "href": "{{ pagination_link.url }}"
      },
      "components": [{ "type": "textnode", "content": "{{ pagination_link.text }}" }]
    },
    {
      "tagName": "a",
      "attributes": { "href": "{{ pagination.next_link }}" },
      "components": [{ "type": "textnode", "content": "next" }]
    }
  ]
}
```

## 6.9 Server-Side Fetch — `inf-ssr`

Fetch an **external API** at render time on the server; loop over results with `ssr-loop` (the item variable name).

```json
{
  "tagName": "div",
  "classes": ["articles"],
  "attributes": {
    "inf-ssr": "https://api.example.com/articles",
    "ssr-loop": "article"
  },
  "components": [
    {
      "tagName": "article",
      "components": [
        { "tagName": "h3", "components": [{ "type": "textnode", "content": "{{ article.title }}" }] },
        { "tagName": "p",  "components": [{ "type": "textnode", "content": "{{ article.summary }}" }] }
      ]
    }
  ]
}
```

## 6.10 Symbols — `inf-symbol-id`

Reference a reusable named component. Editing the Symbol updates every instance.

```json
{ "tagName": "div", "attributes": { "inf-symbol-id": "sym_header_01" } }
```

## 6.11 Available Context Data (typical)

| Group | Example tokens | Source |
|---|---|---|
| Site | `{{ site.name }}`, `{{ site.url }}` | WP options |
| Time | `{{ time.date }}` | Server time |
| Post | `{{ post.post_title }}`, `{{ post.thumbnail }}`, `{{ post.excerpt }}` | Normalized current post |
| ACF (add-on) | `{{ post.acf.* }}` | ACF fields |
| WooCommerce (add-on) | product fields + `{{ cart.* }}` | Product enrichment + `inf_get_cart_data` |
| Query | results of `inf-query-id` nodes | WP_Query |
| Pagination | `{{ pagination.prev_link }}`, `{{ pagination.pagination_links }}`, `{{ pagination.current }}`, `{{ pagination.max_number }}` | Linked query |
| SSR | item vars defined by `ssr-loop` (e.g. `{{ article.* }}`) | External fetch |

> The context is extensible via the **`inf/context`** filter; picker documentation via **`inf/tokens/schema`**.

---

# Part 7 — Dynamic Data System

## 7.1 Decision Tree

```text
Is the data static? ────────────────► Plain text node
Is it WordPress content? ───────────► inf-query + WP_Query JSON
Is it a repeating local array? ─────► inf-for loop
Is it an external REST API? ────────► inf-ssr + ssr-loop
Is it paginated? ───────────────────► inf-pagination linked by id
Should some items be hidden? ───────► inf-if-json conditions
Is it a reusable dynamic layout? ───► Dynamic Template + REST API Model
```

## 7.2 REST API Models (editor side)

Open **REST API Models** to define API resources: `name`, `method`, `url`, `headers`, `body`, `varName`. Dynamic components consume these models. Use this when content must be API-driven rather than statically designed.

## 7.3 Load More & Next/Previous

- **Load More** → append the next page of results to a query/API collection (products, posts, long lists).
- **Next / Previous** → controls that move through a collection or paginated data.

Both depend on the underlying data source configuration (query id / REST model).

## 7.4 WordPress Query Builder (WP projects)

The query builder groups WP_Query args:
- **Basics** — post type, per page, order, orderby
- **Date group** — year (1–53 weeks), hour (0–23), minute (0–59), second (0–59)
- **Meta Query group** — complex meta builder (`MetaQueryBuilder`)
- **Results** — `fields: "all"`, `suppress_filters: false`

> **When WordPress content is missing:** check the connection and the query/data configuration first — not the visual layout. Content is data-driven.

---

# Part 8 — Reusable Content

## 8.1 Symbol (live-linked component)

**What:** a named component. Every placement is a *reference* — edit the Symbol once, all instances update.
**Steps:**
1. Build the section on the canvas.
2. Select its root → **Create Symbol**.
3. Drop the Symbol block anywhere via the Blocks panel.
4. Manage all Symbols in the **Symbols & Templates Manager**.
**Internals:** stored with `inf-symbol-id`; `inf_symbols` CPT (headless, `show_in_rest`, no UI).

## 8.2 Template (saved copy)

**What:** saved page/section content inserted as a *detached copy* — a starting point, not a live link.
**Use for:** hero presets, footer presets, page skeletons.
**Internals:** `inf_template` posts with `inf_template_type` and `inf_disalbe` meta.

## 8.3 Dynamic Template

**What:** reusable **dynamic/API-oriented** resource — layout + data binding, rendered wherever placed.
**Use when:** content must be driven by dynamic data rather than reusing a static visual section.

## 8.4 Choosing Between Them

| Need | Use |
|---|---|
| Same component everywhere, always in sync | **Symbol** |
| Starting point I'll customize per page | **Template** |
| Same layout, different data each time | **Dynamic Template** |
| Drag-and-drop piece inside a page | **Block** |

> ⚠️ Before deleting any reusable resource, run the **Safe Deletion Checklist** (Part 18.3).

---

# Part 9 — Styling & Responsive Design

## 9.1 Style Panel
Visual controls for colors, spacing, typography, layout. Use **custom CSS** only when:
- A CSS property isn't exposed visually
- You need advanced selectors or custom effects
- You need project-specific styling

Keep custom CSS organized; avoid duplicating styles.

## 9.2 CSS Editor
Per-page and global CSS (global CSS, page CSS, symbol CSS, optional Tailwind CSS when enabled in project settings).

## 9.3 Tailwind
Enable Tailwind in **Settings**. Per-page Tailwind CSS is generated (`css/tailwind/{page}.css`); otherwise global rules apply.

## 9.4 Responsive Workflow
Style per device: **Desktop → Tablet → Mobile**.

**Desktop QA:** horizontal spacing, navigation, images, cards.
**Tablet QA:** wrapping, columns, spacing, navigation, media.
**Mobile QA:** text size, buttons, overflow, horizontal scrolling, images, stacking order, menus, fixed/absolute elements.

> Never assume desktop-correct = mobile-correct.

## 9.5 Recommended Page-Building Method

```text
1. Structure (sections/containers)
2. Content blocks
3. Typography
4. Colors
5. Spacing
6. Layout
7. Responsive
8. Motion & polish
```

---

# Part 10 — Motion

## 10.1 Animations Builder (GSAP-based)

Common use cases: entrance animations, scroll effects, reveals, movement, scaling, rotation, interactive effects.

**Workflow:**
1. Select the target element.
2. Open the animation controls.
3. Define **from** and **to** states (e.g. `x: -500px → 0`).
4. Optionally enable **ScrollTrigger** (single or multi options).
5. Choose the **selector** (`self` or custom).
6. Preview, tune timing/easing, save.

**Motion model (for agents):**
```json
{
  "id": "mtNTMwMw512033",
  "isTimeLine": false,
  "numberTimeOfUses": 1,
  "pages": ["home"],
  "instances": { "<instanceId>": { "id": "<instanceId>", "page": "home" } },
  "animations": [
    {
      "from": { "x": "-500px" },
      "to": { "x": "0" },
      "selector": "self",
      "isScrollTrigger": false
    }
  ]
}
```
Motions are attached via `motion-instance-id` attributes and compiled to GSAP scripts (`gsap.fromTo(...)`).

## 10.2 Interactions
Event-driven behaviors attached to elements. Configure trigger, target, and action. Build interactions *after* the layout is stable.

## 10.3 Commands
Advanced scripted behaviors (Code Manager territory). Commands are stored per page (`page.cmds`) and compiled at build time.

> ⚠️ **Script order matters:** global libraries must be **classic/IIFE scripts**. Forcing `type="module"` on UMD libs breaks their `window` attachment (strict-mode `this`). Modules run last.

---

# Part 11 — Assets

## 11.1 Media Manager
Upload/select images, video, audio, SVG. Assign to components via media traits. Always configure dimensions + object-fit and test responsive.

## 11.2 Fonts
- **Google Fonts / CDN** → linked via `<link>` + `@font-face` in `fonts.css`.
- **Uploaded font files** → stored in the project, uploaded to WP as real files (`.ttf/.woff2…`), referenced relatively.
- Install via **Custom Fonts** modal; both flows generate `define_font_face()` entries.

## 11.3 JavaScript & CSS Libraries
Manage installed libraries in the **Library Installer**. Before adding a library ask:
- Does the site actually need it?
- Does it conflict with existing scripts?
- Does it increase page size or hurt editor performance?

Project settings control bundling:
- Grab all CSS libs into a single file
- Grab all header/footer scripts into single files
- `defer` / `async` for grabbed header/footer scripts
- Disable petite-vue

## 11.4 Code Manager
Direct code-level control for advanced users. **Understand how custom code interacts with the page before editing it.**

---

# Part 12 — WordPress Integration

## 12.1 Connection Setup
1. In WP Admin → Users → Profile → create an **Application Password**.
2. In Infinitely Studio, create a **WordPress project** with `website_url`, `username`, `app_password`.
3. Auth header: `Authorization: Basic base64(user:app_password)` + `credentials: 'include'`. **No `X-WP-Nonce` is ever used.**

## 12.2 Where Content Lives
- Pages = JSON trees in post meta **`inf_meta`** (one object; always **merge**, never blind-overwrite).
- Builder content types (headless CPTs, REST-only, no UI): `inf_symbols`, `inf_blocks`, `inf_motions`, `inf_snippets`.
- `HIDDEN_POSTS` keeps builder types out of pickers.
- Templates captured as `inf_template` posts.

## 12.3 Dynamic Content in WP Projects
Use **queries** (Part 6.7), **tokens** (Part 6.4), **conditions**, and **pagination**. ACF fields appear as `{{ post.acf.* }}`; WooCommerce products are enriched automatically and cart data is available via cart endpoints.

## 12.4 Save Flow
```text
Editor → wp_update_meta (render state "before_save")
       → BroadcastChannel wp_preview_bc
       → Preview reloads with ?save_state=before_save
```
- Render state `saved` = published view.
- Render state `before_save` = draft view in preview/dev.
- Enqueue cache-busting: `$ver = time()` in preview/before_save; fixed `'1.2'` otherwise.

## 12.5 Snippets System (user PHP on any hook)

Snippets are stored in the `inf_snippets` CPT with meta fields:
`code, description, hook, is_filter, priority, accepted_args, enabled, created_at`.

| Setting | Behavior |
|---|---|
| `hook = 'manual'` | Only runs via `/snippets/execute` |
| Any other hook | Registered dynamically on `init` priority 5 (`add_action`/`add_filter`) |
| `is_filter = true` | Callback must **return** (else `$args[0]` passthrough) |
| `is_filter = false` | Echoed output is printed (ideal for `wp_head` / `wp_footer`) |

Scope variables inside snippet code: `$context, $snippet, $args (hook args), $params (request), $post_id, $post`.
Errors: manual → JSON error payload; auto-fire → `error_log` (WP_DEBUG), the page never crashes.
Limitation: hooks firing **before** `init:5` cannot be targeted.

**Example 1 — inject into `<head>`** (`hook: wp_head`, `is_filter: false`):
```php
echo '<meta name="infinitely-demo" content="1">' . "\n";
```

**Example 2 — filter titles** (`hook: the_title`, `is_filter: true`):
```php
$title = isset($args[0]) ? $args[0] : '';
return $title . ' — Infinitely';
```

**Example 3 — manual snippet using context:**
```php
return [
  'status' => 'ok',
  'site'   => isset($context['site']['name']) ? $context['site']['name'] : null,
];
```

> 🔒 Snippet `eval()` is gated by login + origin only — treat snippet creation as **admin-level power**.

## 12.6 Extension Points (for developers)

| Hook | Kind | Signature |
|---|---|---|
| `inf/normalize_post` | filter | `$result, $post_id, $post` |
| `inf/context` | filter | `$context, $filter_meta` |
| `inf/tokens/schema` | filter | `$groups, $context` |
| `inf_render_component` | filter | component render override |
| `inf_before_render_components` | filter-as-action | `null, $components` |
| `inf_query_permission` / `inf_option_permission` | functions | auth gates |

Add-ons load via `ADD_ONES` + `ADD_ONES_CHECKERS` (e.g. WooCommerce when `inf_is_woocommerce_active()`, ACF when `inf_is_acf_active()`).

---

# Part 13 — Infinitely AI

## 13.1 Overview
The **Infinitely AI** area provides a conversational interface backed by configurable providers/models (Chats + Preferences).

## 13.2 Using AI Well
Give the AI enough context:
- Page purpose & target audience
- Content structure & brand style
- Responsive requirements
- Components required
- Dynamic data requirements
- Existing design constraints

Keep tasks focused in large projects. Use separate chats for separate tasks/contexts.

---

# Part 14 — Save, Export, Share, Publish

## 14.1 Save
Save regularly — especially after: major layout changes, adding reusable resources, editing animations/interactions, changing settings, importing assets.

## 14.2 Preview vs Frontend
- **Preview** → rendered result with `save_state` control.
- **Frontend** → the site as end users see it.
Verify: actual spacing, runtime scripts, interactions, animations, dynamic data, external resources, responsive behavior.

## 14.3 Export (Normal projects)
Export builds a zip containing: `index.html`, `pages/*.html`, assets, fonts, global CSS/JS, `editor/infinitely.json` (full project data), logo, screenshot.

## 14.4 Share
Dropbox-based share/sync: upload the project file, generate a share link, pull into another workspace. A project already present in the workspace is detected and blocked from duplicate import.

## 14.5 Publish (WordPress projects)
Saving pushes `inf_meta` + related resources to WordPress; the plugin renders them server-side.

---

# Part 15 — Complete Real-World Examples

## 15.1 Hero Section

```json
{
  "tagName": "section",
  "attributes": { "id": "hero" },
  "classes": ["hero-section"],
  "components": [
    {
      "tagName": "h1",
      "classes": ["hero-title"],
      "components": [
        { "type": "textnode", "content": "Welcome to {{ site.name }}" }
      ]
    },
    {
      "tagName": "p",
      "classes": ["hero-desc"],
      "components": [
        { "type": "textnode", "content": "Today is {{ time.date }}" }
      ]
    },
    {
      "tagName": "a",
      "attributes": { "href": "#", "class": "btn btn-primary" },
      "components": [
        { "type": "textnode", "content": "Click Me" }
      ]
    }
  ]
}
```

## 15.2 Blog Post List with Loop + Query + Pagination

```json
{
  "tagName": "section",
  "classes": ["blog"],
  "components": [
    {
      "tagName": "div",
      "classes": ["post-grid"],
      "attributes": {
        "inf-query": "{\"post_type\":\"post\",\"posts_per_page\":6,\"orderby\":\"date\",\"order\":\"DESC\"}",
        "inf-query-id": "blog-list",
        "use-ajax": "true"
      },
      "components": [
        {
          "tagName": "article",
          "classes": ["post-card"],
          "components": [
            { "tagName": "img", "attributes": { "src": "{{ post.thumbnail }}", "alt": "{{ post.post_title }}", "loading": "lazy" } },
            {
              "tagName": "span",
              "classes": ["badge"],
              "attributes": { "inf-if-json": "[\"{{ post.acf.is_featured }}\", \"equals\", \"true\"]" },
              "components": [{ "type": "textnode", "content": "Featured" }]
            },
            { "tagName": "h2", "components": [{ "type": "textnode", "content": "{{ post.post_title }}" }] },
            { "tagName": "p",  "components": [{ "type": "textnode", "content": "{{ post.excerpt }}" }] },
            {
              "tagName": "a",
              "attributes": { "href": "{{ post.link }}" },
              "components": [{ "type": "textnode", "content": "Read more →" }]
            }
          ]
        }
      ]
    },
    {
      "tagName": "inf-pagination",
      "attributes": {
        "inf-pagination-id": "blog-list",
        "allow-numbers": "true",
        "allow-prev-next": "true",
        "max-show": "2",
        "max-style": "window-first-last"
      },
      "components": [
        { "tagName": "a", "attributes": { "href": "{{ pagination.prev_link }}" }, "components": [{ "type": "textnode", "content": "prev" }] },
        {
          "tagName": "a",
          "attributes": {
            "inf-for": "{{ pagination.pagination_links }}",
            "inf-for-item": "pagination_link",
            "href": "{{ pagination_link.url }}"
          },
          "components": [{ "type": "textnode", "content": "{{ pagination_link.text }}" }]
        },
        { "tagName": "a", "attributes": { "href": "{{ pagination.next_link }}" }, "components": [{ "type": "textnode", "content": "next" }] }
      ]
    }
  ]
}
```

## 15.3 WooCommerce Product Grid

```json
{
  "tagName": "section",
  "classes": ["shop"],
  "components": [
    {
      "tagName": "div",
      "classes": ["product-grid"],
      "attributes": {
        "inf-query": "{\"post_type\":\"product\",\"posts_per_page\":8}",
        "inf-query-id": "shop-products",
        "use-ajax": "true"
      },
      "components": [
        {
          "tagName": "article",
          "classes": ["product-card"],
          "components": [
            { "tagName": "img", "attributes": { "src": "{{ post.thumbnail }}", "alt": "{{ post.post_title }}" } },
            { "tagName": "h3", "components": [{ "type": "textnode", "content": "{{ post.post_title }}" }] },
            { "tagName": "p", "classes": ["price"], "components": [{ "type": "textnode", "content": "{{ post.acf.price }}" }] },
            {
              "tagName": "span",
              "classes": ["sale-badge"],
              "attributes": { "inf-if-json": "[\"{{ post.acf.on_sale }}\", \"equals\", \"yes\"]" },
              "components": [{ "type": "textnode", "content": "Sale" }]
            },
            {
              "tagName": "button",
              "classes": ["add-to-cart"],
              "attributes": { "data-product-id": "{{ post.id }}" },
              "components": [{ "type": "textnode", "content": "Add to cart" }]
            }
          ]
        }
      ]
    }
  ]
}
```

## 15.4 External API Feed (SSR)

```json
{
  "tagName": "section",
  "classes": ["news-feed"],
  "attributes": {
    "inf-ssr": "https://api.example.com/articles",
    "ssr-loop": "article"
  },
  "components": [
    {
      "tagName": "article",
      "classes": ["news-card"],
      "components": [
        { "tagName": "img", "attributes": { "src": "{{ article.image }}" } },
        { "tagName": "span", "classes": ["cat"], "components": [{ "type": "textnode", "content": "{{ article.category }}" }] },
        { "tagName": "h3", "components": [{ "type": "textnode", "content": "{{ article.title }}" }] },
        { "tagName": "p",  "components": [{ "type": "textnode", "content": "{{ article.summary }}" }] },
        { "tagName": "small", "components": [{ "type": "textnode", "content": "{{ article.reading_time }} min read" }] }
      ]
    }
  ]
}
```

## 15.5 Header with Symbol Reference

```json
{
  "tagName": "header",
  "classes": ["site-header"],
  "components": [
    { "tagName": "div", "attributes": { "inf-symbol-id": "sym_main_nav" } }
  ]
}
```

Or fully inline:

```json
{
  "tagName": "header",
  "classes": ["site-header"],
  "components": [
    {
      "tagName": "nav",
      "classes": ["main-nav"],
      "components": [
        {
          "tagName": "a",
          "attributes": { "href": "/" },
          "classes": ["logo"],
          "components": [
            { "tagName": "img", "attributes": { "src": "{{ site.logo }}", "alt": "{{ site.name }}" } }
          ]
        },
        {
          "tagName": "ul",
          "classes": ["nav-links"],
          "components": [
            { "tagName": "li", "components": [{ "tagName": "a", "attributes": { "href": "/about" },    "components": [{ "type": "textnode", "content": "About" }] }] },
            { "tagName": "li", "components": [{ "tagName": "a", "attributes": { "href": "/products" }, "components": [{ "type": "textnode", "content": "Products" }] }] },
            { "tagName": "li", "components": [{ "tagName": "a", "attributes": { "href": "/contact" },  "components": [{ "type": "textnode", "content": "Contact" }] }] }
          ]
        }
      ]
    }
  ]
}
```

## 15.6 Contact Form

```json
{
  "tagName": "form",
  "classes": ["contact-form"],
  "attributes": { "method": "post", "action": "/contact-handler" },
  "components": [
    { "tagName": "label", "attributes": { "for": "name" },  "components": [{ "type": "textnode", "content": "Name" }] },
    { "tagName": "input", "attributes": { "id": "name",  "type": "text",  "name": "name",  "placeholder": "Your name", "required": "true" } },

    { "tagName": "label", "attributes": { "for": "email" }, "components": [{ "type": "textnode", "content": "Email" }] },
    { "tagName": "input", "attributes": { "id": "email", "type": "email", "name": "email", "placeholder": "you@example.com", "required": "true" } },

    { "tagName": "label", "attributes": { "for": "msg" },   "components": [{ "type": "textnode", "content": "Message" }] },
    { "tagName": "textarea", "attributes": { "id": "msg", "name": "message", "rows": "5" } },

    { "tagName": "button", "attributes": { "type": "submit" }, "classes": ["btn", "btn-primary"], "components": [{ "type": "textnode", "content": "Send" }] }
  ]
}
```

## 15.7 Pricing Table with Conditions

```json
{
  "tagName": "section",
  "classes": ["pricing"],
  "components": [
    {
      "tagName": "div",
      "classes": ["plan"],
      "components": [
        { "tagName": "h3", "components": [{ "type": "textnode", "content": "Pro" }] },
        { "tagName": "p", "classes": ["price"], "components": [{ "type": "textnode", "content": "$29/mo" }] },
        {
          "tagName": "span",
          "classes": ["popular-badge"],
          "attributes": { "inf-if-json": "[\"{{ post.acf.plan_popular }}\", \"equals\", \"yes\"]" },
          "components": [{ "type": "textnode", "content": "Most Popular" }]
        },
        {
          "tagName": "ul",
          "components": [
            { "tagName": "li", "attributes": { "inf-for": "{{ post.acf.plan_features }}", "inf-for-item": "feature" },
              "components": [{ "type": "textnode", "content": "{{ feature }}" }] }
          ]
        },
        { "tagName": "a", "attributes": { "href": "/checkout?plan=pro" }, "classes": ["btn"], "components": [{ "type": "textnode", "content": "Choose Pro" }] }
      ]
    }
  ]
}
```

## 15.8 Slider (Swiper)

```json
{
  "tagName": "swiper-container",
  "attributes": { "space-between": "24", "loop": "true", "navigation": "true", "autoplay": "true" },
  "components": [
    {
      "tagName": "swiper-slide",
      "components": [
        { "tagName": "img", "attributes": { "src": "/assets/slide-1.jpg", "alt": "Slide 1" } }
      ]
    },
    {
      "tagName": "swiper-slide",
      "components": [
        { "tagName": "img", "attributes": { "src": "/assets/slide-2.jpg", "alt": "Slide 2" } }
      ]
    }
  ]
}
```

## 15.9 Footer

```json
{
  "tagName": "footer",
  "classes": ["site-footer"],
  "components": [
    {
      "tagName": "div",
      "classes": ["footer-grid"],
      "components": [
        {
          "tagName": "div",
          "components": [
            { "tagName": "h4", "components": [{ "type": "textnode", "content": "{{ site.name }}" }] },
            { "tagName": "p",  "components": [{ "type": "textnode", "content": "© {{ time.date }}. All rights reserved." }] }
          ]
        },
        {
          "tagName": "ul",
          "classes": ["footer-links"],
          "components": [
            { "tagName": "li", "components": [{ "tagName": "a", "attributes": { "href": "/privacy" }, "components": [{ "type": "textnode", "content": "Privacy" }] }] },
            { "tagName": "li", "components": [{ "tagName": "a", "attributes": { "href": "/terms" },   "components": [{ "type": "textnode", "content": "Terms" }] }] }
          ]
        }
      ]
    }
  ]
}
```

---

# Part 16 — AI Agent Rules

> **If you are an AI agent generating content for Infinitely Studio, follow these rules exactly.**

## 16.1 Hard Rules

1. **Output JSON component trees only** — never raw HTML strings as page content.
2. Every element node has `tagName`; every visible text lives in a **text node**: `{ "type": "textnode", "content": "..." }`.
3. `classes` is always an **array of strings**; `attributes` is always an **object of string values**.
4. Dynamic values use `{{dot.path}}` tokens — valid in both `content` and `attributes`.
5. Loops use the triple: `inf-for` + `inf-for-item` (+ optional `inf-for-index`).
6. Queries use `inf-query` (stringified WP_Query JSON) + `inf-query-id`; pagination links via **matching** `inf-pagination-id`.
7. Conditions use `inf-if-json` with operators `equals` / `includes` / `contains`, combined with `"and"` / `"or"`.
8. External data uses `inf-ssr` + `ssr-loop`.
9. Reuse via `inf-symbol-id` — do **not** duplicate repeated markup; reference a Symbol.
10. Tokens resolve **at render time** — never pre-resolve them into static strings.

## 16.2 Generation Checklist

Before delivering a component, verify:

```text
[ ] Valid JSON — no comments, no trailing commas
[ ] Every textnode has "type": "textnode"
[ ] All tokens use {{dot.path}} syntax with valid paths
[ ] inf-for nodes define inf-for-item
[ ] inf-query nodes define inf-query-id (and use-ajax when client loading is needed)
[ ] inf-pagination-id matches an existing inf-query-id
[ ] inf-if-json values are JSON strings containing arrays
[ ] Classes are semantic and non-duplicated
[ ] Responsive behavior considered (grid/flex wrapping, fluid sizes)
[ ] No broken references to missing symbols/assets
```

## 16.3 Anti-Patterns (never do these)

| ❌ Wrong | ✅ Right |
|---|---|
| `"components": "Hello"` | `"components": [{ "type": "textnode", "content": "Hello" }]` |
| `"classes": "a b"` | `"classes": ["a", "b"]` |
| Hardcoded post titles | `{{ post.post_title }}` |
| Copy-pasting a nav into 5 pages | One Symbol + `inf-symbol-id` references |
| Blind-overwriting `inf_meta` | Merge (`merge: true`) — it's one object |
| Forcing `type="module"` on UMD libs | Keep global libs as classic/IIFE |
| Using `X-WP-Nonce` | `Authorization: Basic base64(user:app_password)` |

## 16.4 WordPress REST Contract (for agents calling the API)

- Base: `{website_url}/wp-json/infinitely-api/v1/...`
- Auth: `Authorization: Basic base64(user:app_password)`, `credentials: 'include'`
- Key endpoints: `/get-tokens`, `/asset`, `/query` (POST WP_Query JSON), `/render-tokens`, `/get-blocks`, snippets CRUD + `/snippets/execute`
- Editor-side workers: `fetcherWorker`, `pageBuilderWorker`, `infinitelyWorker`, `assetsWorker` via `wpWorkerCallbackMaker(worker, cmd, props, cb)` → `cb({done, res})`

---

# Part 17 — Cheat Sheets

## 17.1 One-Screen Navigation

| Need | Go to |
|---|---|
| Create/open a project | **Workspace** |
| Create a page | **Pages** |
| Add content | **Blocks** |
| Reuse | **Templates / Symbols / Dynamic Templates** |
| Behavior | **Interactions / Animations** |
| Data | **REST API Models / WordPress Queries** |
| Project config | **Settings / Save / Export / Share** |
| Runtime check | **Preview / Frontend / WordPress** |
| SEO | **Page Helmet** |
| Code | **Code Manager / CSS Editor / Files Manager** |
| AI help | **Infinitely AI** |

## 17.2 Syntax Cheat Sheet

| Task | Syntax |
|---|---|
| Plain text | `{ "type": "textnode", "content": "..." }` |
| Dynamic value | `{{ post.post_title }}` |
| Condition | `inf-if-json` (JSON string array) |
| Loop | `inf-for` + `inf-for-item` + `inf-for-index` |
| Dynamic query | `inf-query` + `inf-query-id` + `use-ajax` |
| Pagination | `inf-pagination` + `inf-pagination-id` |
| External fetch | `inf-ssr` + `ssr-loop` |
| Symbol reference | `inf-symbol-id` |
| Operators | `equals`, `includes`, `contains`, `"and"`, `"or"` |

## 17.3 Fast Reference: Landing Page

```text
1. Create project            9.  Add CTA
2. Open Index page           10. Style sections
3. Add Header                11. Configure typography
4. Add Hero section          12. Configure responsive views
5. Add Features              13. Add hover states
6. Add Product/Service       14. Add animations/interactions
7. Add Testimonials          15. Preview → Save
8. Add Footer                16. Export/share/publish
```

## 17.4 Pre-Publish QA Checklist

```text
[ ] Desktop layout works
[ ] Tablet layout works
[ ] Mobile layout works
[ ] No unexpected horizontal overflow
[ ] Buttons work
[ ] Forms/integrations are configured
[ ] Dynamic content loads
[ ] WordPress queries return expected data
[ ] Animations work
[ ] Interactions work
[ ] External embeds work
[ ] Custom code works
[ ] Project is saved
[ ] Reusable resources are backed up
[ ] Preview has been checked
```

## 17.5 Backup Strategy

| What | How |
|---|---|
| Full project | Project **Export** |
| Individual pages | **Download page** |
| Reusable resources | Export Templates / Symbols |
| Source assets | Keep originals separately |

---

# Part 18 — Troubleshooting & Gotchas

## 18.1 Known Gotchas (learned the hard way)

1. **Module vs classic script order** — modules run last; global libraries must be classic/IIFE.
2. **`inf_meta` is ONE object** — always merge when updating; never replace blindly.
3. **`template_include` runs at priority 5500 on purpose** — don't move it earlier.
4. **Snippets `eval`** is gated by login + origin — treat as admin-level power; hooks before `init:5` can't be targeted.
5. **`get_page_by_path`** only matches exact `post_name`; UUID-named uploads come from the plugin uploader, not WP admin.
6. **No nonces anywhere** — auth is Basic (application passwords) + CORS allow-list.
7. **Media/upload pipeline** — one mime whitelist (`inf_allowed_mimes()`); never fall back to `*/*` or `application/octet-stream`.
8. **Canvas ≠ final output** — always QA in Preview/Frontend.

## 18.2 Debugging Dynamic Content

```text
Content missing?
├── WP project? → check connection + query config FIRST (data-driven!)
├── Token wrong? → open token picker / check /get-tokens
├── Query empty? → test the WP_Query JSON in the query builder
├── Pagination broken? → inf-pagination-id must EQUAL inf-query-id
└── Draft not showing? → check render state (saved vs before_save)
```

## 18.3 Safe Deletion Checklist

Before deleting any resource ask:
- Is another page using it?
- Is another component using it?
- Is it a Template? A Symbol?
- Is it a class used elsewhere?
- Is it an animation referenced by an interaction?
- Is it a dynamic resource?
- Is it needed by WordPress?

**If unsure → export it first.**

---

# Part 19 — Glossary

| Term | Meaning |
|---|---|
| **Block** | A component added to a page through the Blocks panel |
| **Canvas** | The visual editing area for the current page |
| **Class** | A CSS class applied to a component |
| **Component node** | `{tagName, attributes{}, classes[], content, components[]}` |
| **Text node** | Leaf node `{type:'textnode', content}` |
| **Context** | The array tokens resolve against (`site.*`, `post.*`, …) |
| **Dynamic Template** | Reusable API/data-driven resource |
| **inf_meta** | Post meta storing the page JSON tree |
| **Render state** | `saved` (published) vs `before_save` (draft in preview/dev) |
| **save_state** | URL/state flag controlling which render state is shown |
| **Symbol** | Live-linked reusable named component |
| **Template** | Reusable saved page/section content |
| **Theme** | Collection of design modes, categories, variables |
| **Token** | `{{dot.path}}` placeholder resolved at render time |
| **Trait** | A component-specific property/control |
| **WordPress Project** | A project connected to a WordPress site with WP-specific features |

---

*Infinitely Studio v1.2 — Complete Guide for End Users & AI Agents*
*Build structure first → make it reusable → handle responsive deliberately → add dynamic behavior → polish.*