/**
 * @type {Record<string , import('./helpers/types').BrandConfig>}
 */
const configs = import.meta.glob("./config/*.json", {
  eager: true,
});

const BRAND_BY_HOST = {
  localhost: "infinitely",
  "infinitely.pages.dev": "infinitely",
  // "builder.easyorders.com": "easyorders",
};

const host = location.hostname;

const brand = BRAND_BY_HOST[host] || "infinitely";

const config = configs[`./config/${brand}.json`];

/**
 * 
 * @param {import('./helpers/types').BrandConfig} config 
 * @returns 
 */
function applyBrandConfig(config) {
  if (!config) {
    console.error("Brand config is missing");
    return;
  }

  // 1️⃣ Apply CSS variables (colors)
  Object.entries(config.colors || {}).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });

  // 2️⃣ Apply document title
  if (config.meta && config.meta.title) {
    document.title = config.meta.title;
  }

  // 3️⃣ Apply meta description
  if (config.meta && config.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = config.meta.description;
  }

  if (config.cursor) {
    document.body.style.cursor = config.cursor;
  }

  // 4️⃣ Optional: expose brand info globally (debug / analytics)
  window.__BRAND__ = {
    key: config.brandKey,
    name: config.brandName,
  };
}

export { configs, host, brand, config, applyBrandConfig };
