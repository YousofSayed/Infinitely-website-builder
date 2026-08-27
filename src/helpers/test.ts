import { WPQueryArgs } from "./types";

const advancedQuery: WPQueryArgs = {
  // ============================================================
  // BASIC QUERY
  // ============================================================

  post_type: ["post", "page"],

  post_status: ["publish", "private"],

  posts_per_page: 12,

  paged: 2,

  offset: 0,

  ignore_sticky_posts: true,

  no_found_rows: false,


  // ============================================================
  // ORDERING
  // ============================================================

  orderby: {
    meta_value_num: "DESC",
    date: "DESC",
    title: "ASC",
  },

  order: "DESC",

  meta_key: "featured_score",


  // ============================================================
  // SEARCH
  // ============================================================

  s: "technology",

  exact: false,

  sentence: false,

  search_columns: [
    "post_title",
    "post_content",
    "post_excerpt",
  ],


  // ============================================================
  // AUTHORS
  // ============================================================

  author__in: [1, 5, 8, 12],

  author__not_in: [3, 7],


  // ============================================================
  // POSTS
  // ============================================================

  post__not_in: [10, 20, 30],

  post_parent__not_in: [99],


  // ============================================================
  // TAXONOMY QUERY
  //
  // Example logic:
  //
  // (
  //   category IN (technology, business)
  //   AND
  //   product_type IN (premium)
  // )
  //
  // OR
  //
  // (
  //   post_tag IN (featured)
  // )
  // ============================================================

  tax_query: {
    relation: "OR",

    queries: [
      {
        relation: "AND",

        queries: [
          {
            taxonomy: "category",

            field: "slug",

            terms: [
              "technology",
              "business",
            ],

            operator: "IN",

            include_children: true,
          },

          {
            taxonomy: "product_type",

            field: "slug",

            terms: ["premium"],

            operator: "IN",
          },
        ],
      },

      {
        taxonomy: "post_tag",

        field: "slug",

        terms: ["featured"],

        operator: "IN",
      },
    ],
  },


  // ============================================================
  // META QUERY
  //
  // Logic:
  //
  // (
  //   featured_score >= 80
  //   AND
  //   price BETWEEN 100 AND 500
  // )
  //
  // OR
  //
  // (
  //   is_featured = true
  //   AND
  //   sale_end >= TODAY
  // )
  //
  // AND
  //
  // custom_field EXISTS
  // ============================================================

  meta_query: {
    relation: "AND",

    queries: [
      {
        relation: "OR",

        queries: [
          {
            relation: "AND",

            queries: [
              {
                key: "featured_score",

                value: 80,

                compare: ">=",

                type: "NUMERIC",
              },

              {
                key: "price",

                value: [100, 500],

                compare: "BETWEEN",

                type: "NUMERIC",
              },
            ],
          },

          {
            relation: "AND",

            queries: [
              {
                key: "is_featured",

                value: true,

                compare: "=",

                type: "CHAR",
              },

              {
                key: "sale_end",

                value: "2026-08-24",

                compare: ">=",

                type: "DATE",
              },
            ],
          },
        ],
      },

      {
        key: "custom_field",

        compare: "EXISTS",
      },
    ],
  },


  // ============================================================
  // DATE QUERY
  //
  // Logic:
  //
  // Published after Jan 1, 2025
  // AND
  // Published before Dec 31, 2026
  //
  // OR
  //
  // Modified within the last 30 days
  // ============================================================

  date_query: {
    relation: "OR",

    queries: [
      {
        relation: "AND",

        queries: [
          {
            column: "post_date",

            after: {
              year: 2025,
              month: 1,
              day: 1,
            },

            inclusive: true,
          },

          {
            column: "post_date",

            before: {
              year: 2026,
              month: 12,
              day: 31,
            },

            inclusive: true,
          },
        ],
      },

      {
        column: "post_modified",

        after: "30 days ago",
      },
    ],
  },


  // ============================================================
  // PERFORMANCE
  // ============================================================

  cache_results: true,

  update_post_meta_cache: true,

  update_post_term_cache: true,

  lazy_load_term_meta: true,


  // ============================================================
  // PERMISSIONS
  // ============================================================

  perm: "readable",


  // ============================================================
  // FILTERS
  // ============================================================

  suppress_filters: false,


  // ============================================================
  // RESULTS
  // ============================================================

  fields: "all",
};