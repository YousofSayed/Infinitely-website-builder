import { useWpAllCategories, useWpAllPosts, useWpAllTags, useWpAuthors, useWpPostTypes } from "@/queries/wp.queries";
import { isArray } from "lodash";
import { MetaQueryBuilder } from "@/components/Protos/wordpress/MetaQueryBuilder";
import { TaxQueryBuilder } from "@/components/Protos/wordpress/TaxQueryBuilder";

/**
 * WP_Query settings configuration
 * 
 * Dynamic selects use:
 *   - resource: string matching UniversalDynamicQuerySelect's switch cases
 *   - getOption: function mapping API data to { value, title }
 * 
 * Static fields use standard inputType/keywords
 */
export const wp_query = [
  // ═══════════════════════════════════════════
  // GENERAL
  // ═══════════════════════════════════════════
  {
    title: "Post Type",
    componentType: "select",
    key: "post_type",
    group: "general",
    multiple: true,
    dynamic: true,
    resource: "postTypes",
    getOption: (pt) => ({ value: pt.name, title: pt.name }),
  },
  {
    title: "Post Status",
    componentType: "select",
    key: "post_status",
    group: "general",
    multiple: true,
    keywords: [
      { value: "publish", title: "Published" },
      { value: "draft", title: "Draft" },
      { value: "pending", title: "Pending Review" },
      { value: "future", title: "Scheduled" },
      { value: "private", title: "Private" },
      { value: "trash", title: "Trash" },
      { value: "any", title: "Any Status" },
    ],
  },
  {
    title: "Posts Per Page",
    componentType: "input",
    key: "posts_per_page",
    inputType: "number",
    group: "general",
    min: -1,
    placeholder: "10",
    description: "-1 shows all posts",
  },
  {
    title: "Offset",
    componentType: "input",
    key: "offset",
    inputType: "number",
    group: "general",
    min: 0,
    placeholder: "0",
  },
  {
    title: "Paged",
    componentType: "input",
    key: "paged",
    inputType: "number",
    group: "general",
    min: 1,
    placeholder: "1",
  },
  {
    title: "Ignore Sticky Posts",
    componentType: "select",
    key: "ignore_sticky_posts",
    group: "general",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "No Pagination",
    componentType: "select",
    key: "nopaging",
    group: "general",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },

  // ═══════════════════════════════════════════
  // ORDER & SORTING
  // ═══════════════════════════════════════════
  {
    title: "Order",
    componentType: "select",
    key: "order",
    group: "ordering",
    keywords: [
      { value: "DESC", title: "Descending" },
      { value: "ASC", title: "Ascending" },
    ],
  },
  {
    title: "Order By",
    componentType: "select",
    key: "orderby",
    group: "ordering",
    keywords: [
      { value: "date", title: "Date" },
      { value: "modified", title: "Last Modified" },
      { value: "title", title: "Title" },
      { value: "name", title: "Slug" },
      { value: "ID", title: "Post ID" },
      { value: "author", title: "Author" },
      { value: "parent", title: "Parent" },
      { value: "menu_order", title: "Menu Order" },
      { value: "comment_count", title: "Comment Count" },
      { value: "relevance", title: "Search Relevance" },
      { value: "rand", title: "Random" },
      { value: "meta_value", title: "Meta Value" },
      { value: "meta_value_num", title: "Numeric Meta Value" },
      { value: "post__in", title: "Included Posts Order" },
      { value: "none", title: "No Ordering" },
    ],
  },

  // ═══════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════
  {
    title: "Search",
    componentType: "input",
    key: "s",
    inputType: "text",
    group: "search",
    placeholder: "Search posts...",
  },
  {
    title: "Exact Search",
    componentType: "select",
    key: "exact",
    group: "search",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Sentence Search",
    componentType: "select",
    key: "sentence",
    group: "search",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Search Columns",
    componentType: "select",
    key: "search_columns",
    group: "search",
    multiple: true,
    keywords: [
      { value: "post_title", title: "Title" },
      { value: "post_excerpt", title: "Excerpt" },
      { value: "post_content", title: "Content" },
      { value: "post_name", title: "Slug (URL)" },
    ],
  },

  // ═══════════════════════════════════════════
  // AUTHOR
  // ═══════════════════════════════════════════
  {
    title: "Author ID",
    componentType: "select",
    key: "author",
    group: "author",
    dynamic: true,
    resource: "authors",
    getOption: (a) => ({ value: a.id, title: a.display_name }),
  },
  {
    title: "Author Username",
    componentType: "select",
    key: "author_name",
    group: "author",
    dynamic: true,
    resource: "authors",
    getOption: (a) => ({ value: a.user_nicename, title: a.display_name }),
  },
  {
    title: "Include Authors",
    componentType: "select",
    key: "author__in",
    group: "author",
    multiple: true,
    dynamic: true,
    resource: "authors",
    getOption: (a) => ({ value: a.id, title: a.display_name }),
  },
  {
    title: "Exclude Authors",
    componentType: "select",
    key: "author__not_in",
    group: "author",
    multiple: true,
    dynamic: true,
    resource: "authors",
    getOption: (a) => ({ value: a.id, title: a.display_name }),
  },

  // ═══════════════════════════════════════════
  // POSTS
  // ═══════════════════════════════════════════
  {
    title: "Post ID",
    componentType: "select",
    key: "p",
    group: "posts",
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },
  {
    title: "Post Slug",
    componentType: "select",
    key: "name",
    group: "posts",
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.post_name, title: p.post_title || p.post_name }),
  },
  {
    title: "Include Posts",
    componentType: "select",
    key: "post__in",
    group: "posts",
    multiple: true,
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },
  {
    title: "Exclude Posts",
    componentType: "select",
    key: "post__not_in",
    group: "posts",
    multiple: true,
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },
  {
    title: "Post Parent",
    componentType: "select",
    key: "post_parent",
    group: "posts",
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },
  {
    title: "Include Parents",
    componentType: "select",
    key: "post_parent__in",
    group: "posts",
    multiple: true,
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },
  {
    title: "Exclude Parents",
    componentType: "select",
    key: "post_parent__not_in",
    group: "posts",
    multiple: true,
    dynamic: true,
    resource: "posts",
    getOption: (p) => ({ value: p.id, title: p.post_title || p.post_name }),
  },

  // ═══════════════════════════════════════════
  // CATEGORY
  // ═══════════════════════════════════════════
  {
    title: "Category ID",
    componentType: "select",
    key: "cat",
    group: "categories",
    multiple: true,
    dynamic: true,
    resource: "categories",
    getOption: (c) => ({ value: c.id, title: c.name }),
  },
  {
    title: "Category Slug",
    componentType: "input",
    key: "category_name",
    inputType: "text",
    group: "categories",
    placeholder: "news,tutorials",
    description: "Comma for OR, plus (+) for AND",
  },
  {
    title: "Include Categories",
    componentType: "select",
    key: "category__in",
    group: "categories",
    multiple: true,
    dynamic: true,
    resource: "categories",
    getOption: (c) => ({ value: c.id, title: `${c.name} (${c.count})` }),
  },
  {
    title: "Exclude Categories",
    componentType: "select",
    key: "category__not_in",
    group: "categories",
    multiple: true,
    dynamic: true,
    resource: "categories",
    getOption: (c) => ({ value: c.id, title: `${c.name} (${c.count})` }),
  },

  // ═══════════════════════════════════════════
  // TAGS
  // ═══════════════════════════════════════════
  {
    title: "Tag ID",
    componentType: "select",
    key: "tag_id",
    group: "tags",
    multiple: true,
    dynamic: true,
    resource: "tags",
    getOption: (t) => ({ value: t.id, title: t.name }),
  },
  {
    title: "Tag Slug",
    componentType: "input",
    key: "tag",
    inputType: "text",
    group: "tags",
    placeholder: "featured,popular",
    description: "Comma for OR, plus (+) for AND",
  },
  {
    title: "Include Tags",
    componentType: "select",
    key: "tag__in",
    group: "tags",
    multiple: true,
    dynamic: true,
    resource: "tags",
    getOption: (t) => ({ value: t.id, title: `${t.name} (${t.count})` }),
  },
  {
    title: "Exclude Tags",
    componentType: "select",
    key: "tag__not_in",
    group: "tags",
    multiple: true,
    dynamic: true,
    resource: "tags",
    getOption: (t) => ({ value: t.id, title: `${t.name} (${t.count})` }),
  },

  // ═══════════════════════════════════════════
  // DATE
  // ═══════════════════════════════════════════
  {
    title: "Year",
    componentType: "input",
    key: "year",
    inputType: "number",
    group: "date",
    placeholder: "2026",
  },
  {
    title: "Month",
    componentType: "input",
    key: "monthnum",
    inputType: "number",
    group: "date",
    min: 1,
    max: 12,
  },
  {
    title: "Day",
    componentType: "input",
    key: "day",
    inputType: "number",
    group: "date",
    min: 1,
    max: 31,
  },
  {
    title: "Week",
    componentType: "input",
    key: "w",
    inputType: "number",
    group: "date",
    min: 1,
    max: 53,
  },
  {
    title: "Hour",
    componentType: "input",
    key: "hour",
    inputType: "number",
    group: "date",
    min: 0,
    max: 23,
  },
  {
    title: "Minute",
    componentType: "input",
    key: "minute",
    inputType: "number",
    group: "date",
    min: 0,
    max: 59,
  },
  {
    title: "Second",
    componentType: "input",
    key: "second",
    inputType: "number",
    group: "date",
    min: 0,
    max: 59,
  },

 // ═══════════════════════════════════════════
// META QUERY (Complex Builder)
// ═══════════════════════════════════════════
{
  title: "Meta Query",
  componentType: "custom",
  key: "meta_query",
  group: "meta",
  Component: MetaQueryBuilder,
  description: "Filter posts by custom field values with AND/OR logic",
},

// ═══════════════════════════════════════════
// TAX QUERY (Complex Builder)
// ═══════════════════════════════════════════
{
  title: "Taxonomy Query",
  componentType: "custom",
  key: "tax_query",
  group: "taxonomy", // or create new group "taxonomy"
  Component: TaxQueryBuilder,
  description: "Filter posts by categories, tags, or custom taxonomies",
},

  // ═══════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════
  {
    title: "Cache Results",
    componentType: "select",
    key: "cache_results",
    group: "performance",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Update Post Meta Cache",
    componentType: "select",
    key: "update_post_meta_cache",
    group: "performance",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Update Post Term Cache",
    componentType: "select",
    key: "update_post_term_cache",
    group: "performance",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "No Found Rows",
    componentType: "select",
    key: "no_found_rows",
    group: "performance",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Suppress Filters",
    componentType: "select",
    key: "suppress_filters",
    group: "performance",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },

  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  {
    title: "Return Fields",
    componentType: "select",
    key: "fields",
    group: "results",
    keywords: [
      { value: "all", title: "Full Post Objects" },
      { value: "ids", title: "Post IDs Only" },
      { value: "id=>parent", title: "Post ID → Parent ID" },
    ],
  },
  {
    title: "Permission",
    componentType: "select",
    key: "perm",
    group: "results",
    keywords: [
      { value: "readable", title: "Readable" },
      { value: "editable", title: "Editable" },
    ],
  },

  // ═══════════════════════════════════════════
  // ATTACHMENTS
  // ═══════════════════════════════════════════
  {
    title: "Post MIME Type",
    componentType: "input",
    key: "post_mime_type",
    inputType: "text",
    group: "attachments",
    placeholder: "image/jpeg",
  },
];

// Group settings by section
/**
 * @type {import("@/helpers/types").GroupedWPQuerySettings}
 */
export const grouped_wp_query= wp_query.reduce((acc, setting) => {
  const group = setting.group || "general";
  if (!acc[group]) acc[group] = [];
  acc[group].push(setting);
  return acc;
}, {});

// Human-readable labels for Accordion headers
export const wpQueryGroupLabels = {
  general: "General",
  ordering: "Order & Sorting",
  search: "Search",
  author: "Author",
  posts: "Posts",
  categories: "Categories",
  tags: "Tags",
  date: "Date & Time",
  meta: "Meta Fields",
  performance: "Performance",
  results: "Results & Fields",
  attachments: "Attachments",
};
