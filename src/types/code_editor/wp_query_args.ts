
type WPQueryArgs = {
  // ============================================================
  // AUTHOR PARAMETERS
  // ============================================================

  author?: number;
  author_name?: string;
  author__in?: number[];
  author__not_in?: number[];

  // ============================================================
  // CATEGORY PARAMETERS
  // ============================================================

  cat?: number;
  category_name?: string;
  category__and?: number[];
  category__in?: number[];
  category__not_in?: number[];

  // ============================================================
  // TAG PARAMETERS
  // ============================================================

  tag?: string;
  tag_id?: number;
  tag__and?: number[];
  tag__in?: number[];
  tag__not_in?: number[];
  tag_slug__and?: string[];
  tag_slug__in?: string[];

  // ============================================================
  // TAXONOMY PARAMETERS
  // ============================================================

  taxonomy?: string;
  term?: string;

  tax_query?: WPTaxQuery[];

  // ============================================================
  // POST PARAMETERS
  // ============================================================

  p?: number;
  name?: string;
  page_id?: number;
  pagename?: string;

  post_parent?: number;
  post_parent__in?: number[];
  post_parent__not_in?: number[];

  post__in?: number[];
  post__not_in?: number[];

  post_name__in?: string[];

  post_type?: WPPostType | WPPostType[];
  post_status?: WPPostStatus | WPPostStatus[];

  // ============================================================
  // POST & PAGE PARAMETERS
  // ============================================================

  posts_per_page?: number;
  posts_per_archive_page?: number;
  nopaging?: boolean;

  posts_per_rss?: number;

  paged?: number;
  page?: number;

  offset?: number;

  // ============================================================
  // ORDERING PARAMETERS
  // ============================================================

  order?: WPOrder;

  orderby?: WPOrderBy | WPOrderBy[] | Record<string, WPOrder>;

  // ============================================================
  // DATE PARAMETERS
  // ============================================================

  year?: number;
  monthnum?: number;
  w?: number;
  day?: number;

  hour?: number;
  minute?: number;
  second?: number;

  m?: number;

  date_query?: WPDateQuery[];

  // ============================================================
  // CUSTOM FIELD / META PARAMETERS
  // ============================================================

  meta_key?: string;
  meta_value?: string | number | boolean | (string | number | boolean)[];

  meta_value_num?: number;

  meta_compare?: WPMetaCompare;

  meta_type?: WPMetaType;

  meta_query?: WPMetaQuery[];

  // ============================================================
  // PERMISSION PARAMETERS
  // ============================================================

  perm?: "readable" | "editable";

  // ============================================================
  // MIME TYPE PARAMETERS
  // ============================================================

  post_mime_type?: string | string[];

  // ============================================================
  // SEARCH PARAMETERS
  // ============================================================

  s?: string;

  exact?: boolean;
  sentence?: boolean;

  search_columns?: ("post_title" | "post_excerpt" | "post_content")[];

  // ============================================================
  // STICKY POSTS
  // ============================================================

  ignore_sticky_posts?: boolean;

  // ============================================================
  // CACHING
  // ============================================================

  cache_results?: boolean;

  update_post_meta_cache?: boolean;

  update_post_term_cache?: boolean;

  lazy_load_term_meta?: boolean;

  // ============================================================
  // RESULT FIELDS
  // ============================================================

  fields?: "all" | "ids" | "id=>parent";

  // ============================================================
  // PAGINATION / COUNTING
  // ============================================================

  no_found_rows?: boolean;

  // ============================================================
  // ORDERING / SQL
  // ============================================================

  suppress_filters?: boolean;

  // ============================================================
  // COMMENTS
  // ============================================================

  comment_count?: number;

  // ============================================================
  // MISC
  // ============================================================

  preview?: boolean;

  post_status_exclude?: WPPostStatus[];

  // Allow custom WP_Query args
  [key: string]: unknown;
};

// ============================================================
// TAX QUERY
// ============================================================

type WPTaxQuery = {
  taxonomy: string;

  field?: "term_id" | "name" | "slug" | "term_taxonomy_id";

  terms?: string | number | Array<string | number>;

  operator?: "IN" | "NOT IN" | "AND" | "EXISTS" | "NOT EXISTS";

  include_children?: boolean;

  relation?: "AND" | "OR";
};

// ============================================================
// META QUERY
// ============================================================

type WPMetaQuery = {
  key?: string;

  value?: string | number | boolean | Array<string | number | boolean>;

  compare?: WPMetaCompare;

  type?: WPMetaType;

  compare_key?:
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "LIKE"
    | "NOT LIKE"
    | "IN"
    | "NOT IN"
    | "REGEXP"
    | "NOT REGEXP"
    | "RLIKE"
    | "EXISTS"
    | "NOT EXISTS";

  type_key?: WPMetaType;

  relation?: "AND" | "OR";

  meta_query?: WPMetaQuery[];
};

// ============================================================
// DATE QUERY
// ============================================================

type WPDateQuery = {
  year?: number;
  month?: number;
  monthnum?: number;
  week?: number;
  w?: number;
  dayofyear?: number;
  day?: number;
  dayofweek?: number;
  dayofweek_iso?: number;
  hour?: number;
  minute?: number;
  second?: number;

  after?: WPDateValue;
  before?: WPDateValue;

  inclusive?: boolean;

  compare?: WPDateCompare;

  column?:
    | "post_date"
    | "post_date_gmt"
    | "post_modified"
    | "post_modified_gmt"
    | string;

  relation?: "AND" | "OR";
};

// ============================================================
// DATE VALUES
// ============================================================

type WPDateValue =
  | string
  | {
      year?: number;
      month?: number;
      day?: number;
    };

// ============================================================
// META COMPARE
// ============================================================

type WPMetaCompare =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "LIKE"
  | "NOT LIKE"
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "REGEXP"
  | "NOT REGEXP"
  | "RLIKE"
  | "EXISTS"
  | "NOT EXISTS";

// ============================================================
// META TYPE
// ============================================================

type WPMetaType =
  | "NUMERIC"
  | "BINARY"
  | "CHAR"
  | "DATE"
  | "DATETIME"
  | "DECIMAL"
  | "SIGNED"
  | "TIME"
  | "UNSIGNED";

// ============================================================
// DATE COMPARE
// ============================================================

type WPDateCompare =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "NOT BETWEEN";

// ============================================================
// ORDER
// ============================================================

type WPOrder = "ASC" | "DESC";

// ============================================================
// ORDER BY
// ============================================================

type WPOrderBy =
  | "none"
  | "ID"
  | "author"
  | "title"
  | "name"
  | "type"
  | "date"
  | "modified"
  | "parent"
  | "rand"
  | "comment_count"
  | "relevance"
  | "menu_order"
  | "meta_value"
  | "meta_value_num"
  | "post__in"
  | "post_name__in"
  | "post_parent__in"
  | "rand"
  | "RAND()"
  | `RAND(${number})`
  | string;

// ============================================================
// POST TYPE
// ============================================================

type WPPostType =
  | "post"
  | "page"
  | "attachment"
  | "revision"
  | "nav_menu_item"
  | "custom_css"
  | "customize_changeset"
  | "oembed_cache"
  | "user_request"
  | "wp_block"
  | "wp_template"
  | "wp_template_part"
  | "wp_global_styles"
  | "wp_navigation"
  | "wp_font_family"
  | "wp_font_face"
  | "any"
  | string;

// ============================================================
// POST STATUS
// ============================================================

type WPPostStatus =
  | "publish"
  | "future"
  | "draft"
  | "pending"
  | "private"
  | "trash"
  | "auto-draft"
  | "inherit"
  | "any"
  | string;
