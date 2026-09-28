// const PetiteRouter = (function(PetiteVue) {
//   const { reactive } = PetiteVue;

//   // Set to true to fix the "Cannot GET" error on VS Code Live Server
//   const USE_HASH_ROUTING = true; 

//   function parseLocation() {
//     if (USE_HASH_ROUTING) {
//       const hash = window.location.hash.slice(1) || '/';
//       const [pathname, search = ''] = hash.split('?');
//       return {
//         href: window.location.href,
//         pathname: pathname || '/',
//         search: search ? `?${search}` : '',
//         hash: '',
//         query: Object.fromEntries(new URLSearchParams(search)),
//         state: window.history.state
//       };
//     } else {
//       return {
//         href: window.location.href,
//         pathname: window.location.pathname,
//         search: window.location.search,
//         hash: window.location.hash,
//         query: Object.fromEntries(new URLSearchParams(window.location.search)),
//         state: window.history.state
//       };
//     }
//   }

//   const location = reactive(parseLocation());
//   let isInstalled = false;

//   function sync() {
//     const parsed = parseLocation();
    
//     // Explicitly update properties to guarantee petite-vue reactivity triggers
//     location.href = parsed.href;
//     location.pathname = parsed.pathname;
//     location.search = parsed.search;
//     location.hash = parsed.hash;
//     location.state = parsed.state;
    
//     // Safely update query object without breaking reactivity
//     for (const key in location.query) delete location.query[key];
//     Object.assign(location.query, parsed.query);

//     // Dispatch custom event for advanced use cases
//     window.dispatchEvent(new CustomEvent('petite-router:change', { detail: location }));
//   }

//   function install() {
//     if (isInstalled) return;
//     isInstalled = true;

//     window.addEventListener('popstate', sync);
//     window.addEventListener('hashchange', sync);

//     // MAGIC: Auto-intercept <a> clicks so you don't need @click.prevent anymore!
//     document.addEventListener('click', (e) => {
//       const link = e.target.closest('a');
//       if (!link) return;

//       const href = link.getAttribute('href');
//       if (!href) return;

//       // Ignore external links, mailto, tel, and target="_blank"
//       if (link.hasAttribute('target') || link.hasAttribute('download')) return;
//       if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      
//       // Ignore normal in-page scroll anchors (like #section)
//       if (href.startsWith('#') && !href.startsWith('#/')) return;

//       e.preventDefault(); // Stop full page reload!
//       navigate(href);
//     });
//   }

//   function navigate(to, options = {}) {
//     const { replace = false, state = null } = options;

//     if (typeof to === 'number') {
//       window.history.go(to);
//       return;
//     }

//     if (USE_HASH_ROUTING) {
//       const newHash = to.startsWith('#') ? to : `#${to}`;
//       if (replace) {
//         const url = new URL(window.location.href);
//         url.hash = newHash;
//         window.history.replaceState(state, '', url);
//         sync(); 
//       } else {
//         window.location.hash = newHash; 
//       }
//     } else {
//       const url = new URL(to, window.location.origin);
//       if (replace) {
//         window.history.replaceState(state, '', url);
//       } else {
//         window.history.pushState(state, '', url);
//       }
//       sync(); 
//     }
//   }

//   // Auto-install immediately
//   install();

//   return {
//     location,
//     navigate,
//     useLocation: () => location,
//     useNavigate: () => navigate
//   };
// })(window.PetiteVue);

// // Expose globally so you can use it anywhere
// window.PetiteRouter = PetiteRouter;