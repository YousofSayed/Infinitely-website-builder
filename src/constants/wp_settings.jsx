import { Select } from "@/components/Editor/Protos/Select";
import { useWpGet, useWpGetInfinite } from "@/queries/wp.queries";
import { useMemo } from "react";

/**
 * @type {import("@/helpers/types").WPSetting[]}
 */
export const wp_settings = [
  // ═══════════════════════════════════════════
  // GENERAL
  // ═══════════════════════════════════════════
  {
    title: "Site Title",
    componentType: "input",
    key: "title",
    inputType: "text",
    group: "general",
  },
  {
    title: "Tagline",
    componentType: "input",
    key: "description",
    inputType: "text",
    group: "general",
  },
  {
    title: "Site URL",
    componentType: "input",
    key: "url",
    inputType: "url",
    group: "general",
    readonly: true,
  },
  {
    title: "Admin Email",
    componentType: "input",
    key: "email",
    inputType: "email",
    group: "general",
  },
  {
    title: "Timezone",
    componentType: "select",
    key: "timezone",
    group: "general",
    keywords: [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Dubai",
      "Australia/Sydney",
      "Pacific/Auckland",
    ],
  },
  {
    title: "Date Format",
    componentType: "select",
    key: "date_format",
    group: "general",
    keywords: ["F j, Y", "Y-m-d", "m/d/Y", "d/m/Y", "jS F Y"],
  },
  {
    title: "Time Format",
    componentType: "select",
    key: "time_format",
    group: "general",
    keywords: ["g:i a", "g:i A", "H:i"],
  },
  {
    title: "Week Starts On",
    componentType: "select",
    key: "start_of_week",
    group: "general",
    keywords: [
      { value: 0, title: "Sunday" },
      { value: 1, title: "Monday" },
      { value: 2, title: "Tuesday" },
      { value: 3, title: "Wednesday" },
      { value: 4, title: "Thursday" },
      { value: 5, title: "Friday" },
      { value: 6, title: "Saturday" },
    ],
  },
  {
    title: "Language",
    componentType: "select",
    key: "language",
    group: "general",
    keywords: [
      { value: "", title: "English (Default)" },
      { value: "ar", title: "العربية" },
      { value: "fr_FR", title: "Français" },
      { value: "de_DE", title: "Deutsch" },
      { value: "es_ES", title: "Español" },
      { value: "it_IT", title: "Italiano" },
      { value: "ja", title: "日本語" },
      { value: "ko_KR", title: "한국어" },
      { value: "pt_BR", title: "Português do Brasil" },
      { value: "ru_RU", title: "Русский" },
      { value: "zh_CN", title: "简体中文" },
    ],
  },

  // ═══════════════════════════════════════════
  // WRITING
  // ═══════════════════════════════════════════
  {
    title: "Use Smilies",
    componentType: "select",
    key: "use_smilies",
    group: "writing",
    keywords: [
      { value: true, title: "Yes" },
      { value: false, title: "No" },
    ],
  },
  {
    title: "Default Category",
    componentType: "select",
    key: "default_category",
    group: "writing",
    keywords: [], // Populate dynamically from API
    dynamic: true,
    Component: function ({ setValue, value, ...props }) {
      const {
        data: categories,
        isPending: isLoadingCategories,
        isRefetching: isRefetchingCategories,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
      } = useWpGetInfinite("categories");
      const data = useMemo(() => categories?.pages.flat() || [], [categories]);

      return (
        <Select
          className="!p-[unset] "
          inputClassName="!p-3 bg-surface-tertiary"
          placeholder="Select Category"
          useLoader={isLoadingCategories || isRefetchingCategories}
          keywords={
            data?.map((item) => ({
              value: item.id,
              title: item.slug,
            })) || []
          }
          value={value}
          onAll={function (value) {
            setValue((old) => ({ ...old, [props.keyItem]: value }));
          }}
          onScrollEnd={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
      );
    },
    endpoint: "/wp/v2/categories",
  },
  {
    title: "Default Post Format",
    componentType: "select",
    key: "default_post_format",
    group: "writing",
    keywords: [
      { value: "", title: "Standard" },
      { value: "aside", title: "Aside" },
      { value: "chat", title: "Chat" },
      { value: "gallery", title: "Gallery" },
      { value: "link", title: "Link" },
      { value: "image", title: "Image" },
      { value: "quote", title: "Quote" },
      { value: "status", title: "Status" },
      { value: "video", title: "Video" },
      { value: "audio", title: "Audio" },
    ],
  },

  // ═══════════════════════════════════════════
  // READING
  // ═══════════════════════════════════════════
  {
    title: "Show On Front",
    componentType: "select",
    key: "show_on_front",
    group: "reading",
    keywords: [
      { value: "posts", title: "Your latest posts" },
      { value: "page", title: "A static page" },
    ],
  },
  {
    title: "Page On Front",
    componentType: "select",
    key: "page_on_front",
    group: "reading",
    keywords: [], // Populate dynamically
    dynamic: true,
    endpoint: "/wp/v2/pages",
    showIf: { show_on_front: "page" },
    Component: function ({ setValue, value, ...props }) {
      const {
        data: pages,
        isPending: isLoadingPages,
        fetchNextPage,
        isRefetching,
        hasNextPage,
        isFetchingNextPage,
      } = useWpGetInfinite("pages");
      const data = useMemo(() => pages?.pages.flat() || [], [pages]);

      return (
        <Select
          className="!p-[unset] "
          inputClassName="!p-3 bg-surface-tertiary"
          placeholder="Select Page"
          useLoader={isLoadingPages}
          isFetchingNext={isFetchingNextPage || isRefetching}
          keywords={
            data?.map?.((page) => ({
              value: page.id,
              title: page.slug,
            })) || []
          }
          value={value}
          onAll={function (value) {
            setValue((old) => ({ ...old, [props.keyItem]: value }));
          }}
          onScrollEnd={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
      );
    },
  },
  {
    title: "Page For Posts",
    componentType: "select",
    key: "page_for_posts",
    group: "reading",
    keywords: [], // Populate dynamically
    dynamic: true,
    endpoint: "/wp/v2/pages",
    showIf: { show_on_front: "page" },
    Component: function ({ setValue, value, ...props }) {
      const {
        data: pages,
        isPending: isLoadingPages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
      } = useWpGetInfinite("pages");
      const data = useMemo(() => pages?.pages.flat() || [], [pages]);
      console.log("pages is from item.c : ", pages, data);

      return (
        <Select
          className="!p-[unset] "
          inputClassName="!p-3 bg-surface-tertiary"
          placeholder="Select Page"
          useLoader={isLoadingPages || isRefetching}
          keywords={
            data?.map?.((page) => ({
              value: page.id,
              title: page.slug,
            })) || []
          }
          value={value}
          onAll={function (value) {
            setValue((old) => ({ ...old, [props.keyItem]: value }));
          }}
          onScrollEnd={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
        />
      );
    },
  },
  {
    title: "Posts Per Page",
    componentType: "input",
    key: "posts_per_page",
    inputType: "number",
    group: "reading",
    min: 1,
    max: 100,
  },
  {
    title: "Posts Per RSS",
    componentType: "input",
    key: "posts_per_rss",
    inputType: "number",
    group: "reading",
    min: 1,
    max: 100,
  }, 
  {
    title: "RSS Use Excerpt",
    componentType: "select",
    key: "rss_use_excerpt",
    group: "reading",
    keywords: [
      { value: true, title: "Yes (Excerpt only)" },
      { value: false, title: "No (Full content)" },
    ],
  },

  // ═══════════════════════════════════════════
  // DISCUSSION
  // ═══════════════════════════════════════════
  {
    title: "Default Ping Status",
    componentType: "select",
    key: "default_ping_status",
    group: "discussion",
    keywords: [
      { value: "open", title: "Open" },
      { value: "closed", title: "Closed" },
    ],
  },
  {
    title: "Default Comment Status",
    componentType: "select",
    key: "default_comment_status",
    group: "discussion",
    keywords: [
      { value: "open", title: "Open" },
      { value: "closed", title: "Closed" },
    ],
  },

  // ═══════════════════════════════════════════
  // MEDIA
  // ═══════════════════════════════════════════
  {
    title: "Thumbnail Width",
    componentType: "input",
    key: "thumbnail_size_w",
    inputType: "number",
    group: "media",
    min: 0,
    max: 2000,
    suffix: "px",
  },
  {
    title: "Thumbnail Height",
    componentType: "input",
    key: "thumbnail_size_h",
    inputType: "number",
    group: "media",
    min: 0,
    max: 2000,
    suffix: "px",
  },
  {
    title: "Crop Thumbnails",
    componentType: "select",
    key: "thumbnail_crop",
    group: "media",
    keywords: [
      { value: true, title: "Yes (Crop to exact size)" },
      { value: false, title: "No (Proportional scaling)" },
    ],
  },
  {
    title: "Medium Size Width",
    componentType: "input",
    key: "medium_size_w",
    inputType: "number",
    group: "media",
    min: 0,
    max: 4000,
    suffix: "px",
  },
  {
    title: "Medium Size Height",
    componentType: "input",
    key: "medium_size_h",
    inputType: "number",
    group: "media",
    min: 0,
    max: 4000,
    suffix: "px",
  },
  {
    title: "Large Size Width",
    componentType: "input",
    key: "large_size_w",
    inputType: "number",
    group: "media",
    min: 0,
    max: 8000,
    suffix: "px",
  },
  {
    title: "Large Size Height",
    componentType: "input",
    key: "large_size_h",
    inputType: "number",
    group: "media",
    min: 0,
    max: 8000,
    suffix: "px",
  },

  // ═══════════════════════════════════════════
  // PERMALINKS
  // ═══════════════════════════════════════════
  {
    title: "Permalink Structure",
    componentType: "select",
    key: "permalink_structure",
    group: "permalinks",
    keywords: [
      { value: "", title: "Plain (?p=123)" },
      { value: "/%year%/%monthnum%/%day%/%postname%/", title: "Day and name" },
      { value: "/%year%/%monthnum%/%postname%/", title: "Month and name" },
      { value: "/%postname%/", title: "Post name" },
      { value: "/archives/%post_id%", title: "Numeric" },
    ],
  },
  {
    title: "Category Base",
    componentType: "input",
    key: "category_base",
    inputType: "text",
    group: "permalinks",
    placeholder: "category",
  },
  {
    title: "Tag Base",
    componentType: "input",
    key: "tag_base",
    inputType: "text",
    group: "permalinks",
    placeholder: "tag",
  },

  // ═══════════════════════════════════════════
  // INFINITELY STUDIO (CUSTOM)
  // ═══════════════════════════════════════════
  // {
  //   title: "Template Preview Post",
  //   componentType: "select",
  //   key: "post_for_template_preview",
  //   group: "infinitely",
  //   keywords: [], // Populate dynamically
  //   dynamic: true,
  //   endpoint: "/wp/v2/posts",
  //   description: "Post ID used to preview templates in the builder",
  // },
];

// Group settings by section
/**
 * @type {{ [key: string]: import("@/helpers/types").WPSetting[] }}
 */
export const grouped_wp_settings = wp_settings.reduce((acc, setting) => {
  const group = setting.group || "general";
  if (!acc[group]) acc[group] = [];
  acc[group].push(setting);
  return acc;
}, {});



// Fetch dynamic keywords
export async function populateDynamicKeywords(setting) {
  if (setting.dynamic && setting.endpoint) {
    const res = await fetch(`${WP_API_URL}${setting.endpoint}`);
    const items = await res.json();
    setting.keywords = items.map((item) => ({
      value: item.id,
      title: item.title?.rendered || item.name,
    }));
  }
}
