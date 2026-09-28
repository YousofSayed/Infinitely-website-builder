# Infinitely Studio — Component Builder Reference

> Complete reference for building components in Infinitely Studio.
> Use this guide to generate valid component JSON for the builder.

---

## Table of Contents

1. [Component Structure](#1-component-structure)
2. [Text Nodes](#2-text-nodes)
3. [Attributes & Classes](#3-attributes--classes)
4. [Token System `{{ }}`](#4-token-system-)
5. [Conditional Rendering (`inf-if-json`)](#5-conditional-rendering-inf-if-json)
6. [Loops (`inf-for`)](#6-loops-inf-for)
7. [Dynamic Queries (`inf-query`)](#7-dynamic-queries-inf-query)
8. [Pagination (`inf-pagination`)](#8-pagination-inf-pagination)
9. [Server-Side Fetch (`inf-ssr`)](#9-server-side-fetch-inf-ssr)
10. [Motions & Interactions](#10-motions--interactions)
11. [Symbols (Reusable Components)](#11-symbols-reusable-components)
12. [Available Context Data](#12-available-context-data)
13. [Complete Real-World Examples](#13-complete-real-world-examples)

---

## 1. Component Structure

Every element in the builder is a JSON object with this shape:

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
|-------|------|----------|-------------|
| `tagName` | string | ✅ | HTML tag: `div`, `section`, `h1`, `p`, `img`, `a`, `button`, `input`, etc. |
| `attributes` | object | ❌ | HTML attributes as key/value pairs |
| `classes` | string[] | ❌ | Array of CSS class names |
| `components` | array | ❌ | Nested child components |
| `type` | string | ❌ | Set to `"textnode"` for plain text |
| `content` | string | ❌ | Text content (used with textnode) |

### Basic Example

```json
{
  "tagName": "section",
  "attributes": { "id": "hero" },
  "classes": ["hero-section", "p-10"],
  "components": [
    {
      "tagName": "h1",
      "components": [
        { "type": "textnode", "content": "Welcome" }
      ]
    }
  ]
}
```

**Renders:**
```html
<section id="hero" class="hero-section p-10">
  <h1>Welcome</h1>
</section>
```

---

## 2. Text Nodes

Plain text is always a `textnode`. Never put text directly in a parent — always wrap it.

```json
{ "type": "textnode", "content": "Hello World" }
```

### Text with Tokens

```json
{ "type": "textnode", "content": "Welcome, {{ user.display_name }}" }
```

---

## 3. Attributes & Classes

### Attributes

```json
{
  "tagName": "a",
  "attributes": {
    "href": "/about",
    "target": "_blank",
    "data-id": "123"
  },
  "components": [
    { "type": "textnode", "content": "Learn More" }
  ]
}
```

### Self-Closing Tags

Tags like `img`, `input`, `br` work the same way — just no children:

```json
{
  "tagName": "img",
  "attributes": {
    "src": "https://example.com/photo.jpg",
    "alt": "A photo"
  }
}
```

```json
{
  "tagName": "input",
  "attributes": {
    "type": "text",
    "placeholder": "Type here..."
  }
}
```

### Classes

```json
{
  "tagName": "div",
  "classes": ["container", "mx-auto", "bg-blue-500"],
  "components": []
}
```

---

## 4. Token System `{{ }}`

Tokens inject dynamic data using the syntax `{{ group.path.to.value }}`.

### Syntax

```
{{ post.post_title }}
{{ user.display_name }}
{{ site.name }}
{{ time.date }}
```

### Usage in Components

```json
{
  "tagName": "h1",
  "components": [
    { "type": "textnode", "content": "{{ post.post_title }}" }
  ]
}
```

### Using Tokens in Attributes

```json
{
  "tagName": "a",
  "attributes": {
    "href": "{{ post.link }}"
  },
  "components": [
    { "type": "textnode", "content": "{{ post.post_title }}" }
  ]
}
```

> ⚠️ **Important:** Inside loops, use the loop variable name (see Section 6), e.g. `{{ product_loop.title }}` instead of `{{ post.title }}`.

---

## 5. Conditional Rendering (`inf-if-json`)

Show/hide components based on conditions using the `inf-if-json` attribute.

### Structure

The value is a **JSON string** containing an array of condition objects and logic operators (`"and"` / `"or"`).

### Condition Object Shape

```json
{ "var": "token.path", "operator": "operator_name", "value": "compare_value" }
```

### Available Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{"var":"post.id","operator":"equals","value":79}` |
| `includes` | Array contains value | `{"var":"user.roles","operator":"includes","value":"administrator"}` |
| `contains` | String contains substring | `{"var":"request.agent","operator":"contains","value":"edg"}` |

### Example: Show Only for Administrators

```json
{
  "tagName": "div",
  "attributes": {
    "inf-if-json": "[{\"var\":\"user.roles\",\"operator\":\"includes\",\"value\":\"administrator\"}]"
  },
  "components": [
    { "type": "textnode", "content": "Admin-only content" }
  ]
}
```

### Example: Combined Conditions (AND / OR)

```json
{
  "tagName": "h1",
  "attributes": {
    "inf-if-json": "[{\"var\":\"user.roles\",\"operator\":\"includes\",\"value\":\"administrator\"},\"and\",{\"var\":\"request.query.name_user\",\"operator\":\"equals\",\"value\":\"yousef1\"},\"or\",{\"var\":\"post.id\",\"operator\":\"equals\",\"value\":79}]"
  },
  "components": [
    { "type": "textnode", "content": "Conditional content" }
  ]
}
```

**Logic reads as:**
```
(user.roles includes "administrator")
AND (request.query.name_user equals "yousef1")
OR  (post.id equals 79)
```

> 💡 **Tip:** When generating `inf-if-json`, always escape the inner quotes since it's a JSON string inside a JSON attribute.

---

## 6. Loops (`inf-for`)

Repeat a component over a list of data.

### Loop Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `inf-for` | The list to iterate (a token) | `{{ products }}` |
| `inf-for-item` | Variable name for each item | `product_loop` |
| `inf-for-index` | Variable name for the index | `i` |

### Basic Loop

```json
{
  "tagName": "section",
  "attributes": {
    "inf-for": "{{ products }}",
    "inf-for-item": "product_loop",
    "inf-for-index": "i"
  },
  "components": [
    {
      "tagName": "h2",
      "components": [
        { "type": "textnode", "content": "{{ product_loop.title }}" }
      ]
    },
    {
      "tagName": "p",
      "components": [
        { "type": "textnode", "content": "Price: {{ product_loop.price }}" }
      ]
    }
  ]
}
```

### Nested Loops

Loop inside a loop (e.g., product images inside a products loop):

```json
{
  "tagName": "section",
  "attributes": {
    "inf-for": "{{ products }}",
    "inf-for-item": "product_loop",
    "inf-for-index": "i"
  },
  "components": [
    {
      "tagName": "h1",
      "components": [
        { "type": "textnode", "content": "{{ product_loop.title }}" }
      ]
    },
    {
      "tagName": "img",
      "attributes": {
        "inf-for": "{{ product_loop.gallery_urls }}",
        "inf-for-item": "image",
        "inf-for-index": "x",
        "src": "{{ image }}",
        "key": "{{ x }}"
      }
    }
  ]
}
```

> ⚠️ **Important:** Inside a loop, reference items via the `inf-for-item` name (e.g. `product_loop.title`), NOT `post.title`.

---

## 7. Dynamic Queries (`inf-query`)

Fetch and render posts dynamically with optional AJAX loading.

### Query Attributes

| Attribute | Description |
|-----------|-------------|
| `inf-query` | JSON string of `WP_Query` args |
| `inf-query-id` | Unique ID (used to link pagination) |
| `use-ajax` | Set `"true"` to load via AJAX |

### Inside the Loop

Each post is available as `{{ product.* }}` with fields:
- `title`, `id`, `price`, `meta`, `post_excerpt`, `link`, etc.

### Example: Product Grid

```json
{
  "tagName": "article",
  "attributes": {
    "class": "post-card",
    "use-ajax": "true",
    "inf-query-id": "custom-query-id",
    "inf-query": "{\"post_type\":\"product\",\"posts_per_page\":3}"
  },
  "components": [
    {
      "tagName": "h2",
      "components": [
        { "type": "textnode", "content": "{{ product.title }}" }
      ]
    },
    {
      "tagName": "h2",
      "components": [
        { "type": "textnode", "content": "Price {{ product.price }}" }
      ]
    },
    {
      "tagName": "p",
      "components": [
        { "type": "textnode", "content": "Post ID: {{ product.id }}" }
      ]
    },
    {
      "tagName": "div",
      "attributes": { "class": "excerpt" },
      "components": [
        { "type": "textnode", "content": "{{ product.post_excerpt }}" }
      ]
    }
  ]
}
```

### Query with Meta Filter

```json
{
  "tagName": "article",
  "attributes": {
    "use-ajax": "true",
    "inf-query-id": "public-courses",
    "inf-query": "{\"post_type\":\"product\",\"posts_per_page\":3,\"meta_query\":[{\"key\":\"_tutor_is_public_course\",\"value\":\"yes\",\"compare\":\"=\"}]}"
  },
  "components": [
    {
      "tagName": "h2",
      "components": [
        { "type": "textnode", "content": "{{ product.title }}" }
      ]
    }
  ]
}
```

> 💡 The `inf-query` value must be a **JSON string** (escaped), matching `WP_Query` arguments.

---

## 8. Pagination (`inf-pagination`)

Add pagination to an `inf-query`. Link it via matching `inf-pagination-id` to the query's `inf-query-id`.

### Pagination Attributes

| Attribute | Description |
|-----------|-------------|
| `inf-pagination-id` | Must match the target `inf-query-id` |
| `allow-numbers` | `"true"` to show numbered links |
| `allow-prev-next` | `"true"` to show prev/next |
| `max-show` | Max number links to display |
| `max-style` | Window style (e.g. `window-first-last`) |

### Pagination Tokens

- `{{ pagination.prev_link }}`
- `{{ pagination.next_link }}`
- `{{ pagination.pagination_links }}` (loop → `pagination_link.url`, `pagination_link.text`)

### Full Example

```json
{
  "tagName": "inf-pagination",
  "attributes": {
    "inf-pagination-id": "custom-query-id",
    "allow-numbers": "true",
    "allow-prev-next": "true",
    "max-show": "2",
    "max-style": "window-first-last"
  },
  "components": [
    {
      "tagName": "a",
      "attributes": { "href": "{{ pagination.prev_link }}" },
      "components": [
        { "type": "textnode", "content": "prev" }
      ]
    },
    {
      "tagName": "a",
      "attributes": {
        "inf-for": "{{ pagination.pagination_links }}",
        "inf-for-item": "pagination_link",
        "inf-for-index": "i",
        "href": "{{ pagination_link.url }}"
      },
      "components": [
        { "type": "textnode", "content": "{{ pagination_link.text }}" }
      ]
    },
    {
      "tagName": "a",
      "attributes": { "href": "{{ pagination.next_link }}" },
      "components": [
        { "type": "textnode", "content": "next" }
      ]
    }
  ]
}
```

---

## 9. Server-Side Fetch (`inf-ssr`)

Fetch data from an external API at render time.

### SSR Attributes

| Attribute | Description |
|-----------|-------------|
| `url` | API endpoint to fetch |
| `method` | HTTP method (`GET`, `POST`) |
| `headers` | JSON string of headers |
| `response-ver` | Dot-path to extract from response |

### SSR Loop Attributes (on child)

| Attribute | Description |
|-----------|-------------|
| `ssr-for` | `"true"` to enable loop |
| `ssr-loop` | Dot-path to the list in response |
| `ssr-for-item` | Item variable name |
| `ssr-for-index` | Index variable name |

### Example: Fetch Products from External API

```json
{
  "tagName": "inf-ssr",
  "attributes": {
    "url": "https://dummyjson.com/products",
    "method": "GET",
    "headers": "{}",
    "response-ver": "products"
  },
  "components": [
    {
      "tagName": "section",
      "attributes": {
        "ssr-for": "true",
        "ssr-loop": "products.products",
        "ssr-for-item": "product_loop",
        "ssr-for-index": "i"
      },
      "components": [
        {
          "tagName": "h1",
          "components": [
            { "type": "textnode", "content": "{{ product_loop.title }}" }
          ]
        },
        {
          "tagName": "img",
          "attributes": {
            "ssr-for": "true",
            "ssr-loop": "product_loop.images",
            "ssr-for-item": "image",
            "ssr-for-index": "x",
            "src": "{{ image }}",
            "key": "{{ x }}"
          }
        }
      ]
    }
  ]
}
```

---

## 10. Motions & Interactions

GSAP animations and interactions are injected via attributes. You usually don't write these manually — the builder adds them. But here's the reference:

### Motion Attributes

| Attribute | Description |
|-----------|-------------|
| `motion-id` | Direct motion reference |
| `main-motion-id` | Parent motion reference |
| `motion-instance-id` | Specific motion instance |

### Interaction Attributes

| Attribute | Description |
|-----------|-------------|
| `interaction-id` | Direct interaction reference |
| `main-interaction-id` | Parent interaction reference |
| `interaction-instance-id` | Specific interaction instance |

> 💡 These resolve to `v-gsap` attributes or registered scripts at render time. For loops, the builder may also add `v-scope` and `v-effect` (petite-vue).

---

## 11. Symbols (Reusable Components)

Symbols are reusable components stored as `inf_symbols` posts. Reference them via `inf-symbol-id`.

### Symbol Reference in a Component

```json
{
  "type": "text",
  "tagName": "p",
  "classes": ["p-10", "inf-NTIxNA1498-67"],
  "attributes": {
    "inf-class-name": "inf-NTIxNA1498-67",
    "inf-symbol-id": "NTM4Mg10178-61"
  },
  "components": [
    {
      "type": "textnode",
      "content": "Insert your text here",
      "classes": ["inf-NDg2Mg11156"],
      "attributes": {
        "inf-class-name": "inf-NDg2Mg11156"
      }
    }
  ]
}
```

### Symbol Data Structure

A symbol post has this meta structure:

```json
{
  "symbol_id": "NTM4Mg10178-61",
  "media": "<svg>...</svg>",
  "inf_meta": {
    "before_save": {
      "html": [ /* component tree */ ],
      "css": "",
      "category": "",
      "media": "<svg>...</svg>"
    },
    "saved": {
      "html": [ /* component tree */ ],
      "css": "",
      "category": "",
      "media": "<svg>...</svg>"
    }
  }
}
```

---

## 12. Available Context Data

These are the token groups available via `{{ }}`:

### `post` — Current Post

```
{{ post.id }}
{{ post.post_title }}
{{ post.post_content }}
{{ post.post_excerpt }}
{{ post.type }}
{{ post.link }}
{{ post.meta }}
```

### `user` — Current User

```
{{ user.display_name }}
{{ user.user_email }}
{{ user.roles }}
```

### `site` — Site Info

```
{{ site.name }}
{{ site.description }}
{{ site.url }}
{{ site.home_url }}
{{ site.language }}
{{ site.timezone }}
```

### `theme` — Active Theme

```
{{ theme.name }}
{{ theme.version }}
```

### `query` — Current Query State

```
{{ query.is_home }}
{{ query.is_singular }}
{{ query.is_page }}
{{ query.is_archive }}
{{ query.is_search }}
{{ query.is_404 }}
{{ query.id }}
{{ query.type }}
```

### `time` — Current Time

```
{{ time.now }}
{{ time.date }}
{{ time.datetime }}
{{ time.year }}
{{ time.month }}
{{ time.day }}
```

### `request` — HTTP Request (internal)

```
{{ request.uri }}
{{ request.method }}
{{ request.query }}
{{ request.ip }}
{{ request.agent }}
```

> ⚠️ `request`, `env`, and `db` groups are internal/sensitive and hidden from the token picker, but still resolvable.

---

## 13. Complete Real-World Examples

### Example 1: Hero Section

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

### Example 2: Blog Post List with Loop

```json
{
  "tagName": "div",
  "classes": ["posts-grid"],
  "components": [
    {
      "tagName": "article",
      "attributes": {
        "inf-for": "{{ posts }}",
        "inf-for-item": "post_loop",
        "inf-for-index": "i"
      },
      "classes": ["post-card"],
      "components": [
        {
          "tagName": "h2",
          "components": [
            { "type": "textnode", "content": "{{ post_loop.title }}" }
          ]
        },
        {
          "tagName": "p",
          "components": [
            { "type": "textnode", "content": "{{ post_loop.post_excerpt }}" }
          ]
        },
        {
          "tagName": "a",
          "attributes": { "href": "{{ post_loop.link }}" },
          "components": [
            { "type": "textnode", "content": "Read More" }
          ]
        }
      ]
    }
  ]
}
```

### Example 3: Dynamic Product Grid with AJAX + Pagination

```json
{
  "tagName": "div",
  "classes": ["products-wrapper"],
  "components": [
    {
      "tagName": "article",
      "attributes": {
        "use-ajax": "true",
        "inf-query-id": "products-grid",
        "inf-query": "{\"post_type\":\"product\",\"posts_per_page\":6}"
      },
      "classes": ["product-card"],
      "components": [
        {
          "tagName": "h2",
          "components": [
            { "type": "textnode", "content": "{{ product.title }}" }
          ]
        },
        {
          "tagName": "span",
          "classes": ["price"],
          "components": [
            { "type": "textnode", "content": "{{ product.price }} EGP" }
          ]
        }
      ]
    },
    {
      "tagName": "inf-pagination",
      "attributes": {
        "inf-pagination-id": "products-grid",
        "allow-numbers": "true",
        "allow-prev-next": "true"
      },
      "components": [
        {
          "tagName": "a",
          "attributes": { "href": "{{ pagination.prev_link }}" },
          "components": [{ "type": "textnode", "content": "Previous" }]
        },
        {
          "tagName": "a",
          "attributes": { "href": "{{ pagination.next_link }}" },
          "components": [{ "type": "textnode", "content": "Next" }]
        }
      ]
    }
  ]
}
```

### Example 4: Admin-Only Notice

```json
{
  "tagName": "div",
  "attributes": {
    "inf-if-json": "[{\"var\":\"user.roles\",\"operator\":\"includes\",\"value\":\"administrator\"}]"
  },
  "classes": ["admin-notice"],
  "components": [
    {
      "tagName": "p",
      "components": [
        { "type": "textnode", "content": "Hello {{ user.display_name }}, you are an admin." }
      ]
    }
  ]
}
```

### Example 5: External API Feed

```json
{
  "tagName": "inf-ssr",
  "attributes": {
    "url": "https://api.example.com/news",
    "method": "GET",
    "headers": "{}",
    "response-ver": "articles"
  },
  "components": [
    {
      "tagName": "div",
      "attributes": {
        "ssr-for": "true",
        "ssr-loop": "articles.items",
        "ssr-for-item": "article",
        "ssr-for-index": "i"
      },
      "classes": ["news-item"],
      "components": [
        {
          "tagName": "h3",
          "components": [
            { "type": "textnode", "content": "{{ article.title }}" }
          ]
        },
        {
          "tagName": "p",
          "components": [
            { "type": "textnode", "content": "{{ article.summary }}" }
          ]
        }
      ]
    }
  ]
}
```

---

## Quick Reference Cheat Sheet

| Task | Attribute / Syntax |
|------|-------------------|
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

---

## Rules for Generating Components

1. **Always wrap text in a `textnode`** — never put raw strings as children.
2. **Use `classes` as an array**, not a string.
3. **Escape JSON inside attributes** — `inf-if-json` and `inf-query` values are JSON strings, so inner quotes must be escaped (`\"`).
4. **Inside loops, use the loop item name** (`product_loop.title`), not `post.title`.
5. **Link pagination to queries** via matching `inf-pagination-id` ↔ `inf-query-id`.
6. **Self-closing tags** (`img`, `input`, `br`) have no `components`.
7. **Tokens resolve at render time** — they work in both `content` and `attributes`.

---

*Infinitely Studio v1.2 — Component Builder Reference*