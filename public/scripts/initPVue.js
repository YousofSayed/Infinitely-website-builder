/**
 * @type {import('petite-vue')}
 */
const pVuew = PetiteVue;

const app = pVuew.createApp({
  $delimiters: ["${", "}", "{{", "}}"],
});
function getAllVueEls(root = document) {
  return [...root.querySelectorAll("*")].filter((el) =>
    [...el.attributes].some((attr) => attr.name.startsWith("v-"))
  );
}
app.directive("view", vIntersection);
app.directive("ref", vRef);
// let scopesEls = [...(document.querySelectorAll("[v-scope]") || [])];
// // const scopes = scopesEls.map(el=>el.getAttribute("v-scope"));
// let scopes = Object.fromEntries(
//   scopesEls.map((el) => [el.getAttribute("v-scope"), el])
// );
let scopesEls;
/**
 * @type {Map<HTMLElement , Record<string , string>>}
 */
let scopesMap = new Map();

function reDefineDirectives() {
  scopesEls = getAllVueEls();
  scopesEls.forEach((el) => {
    if (!el.attributes) return;
    scopesMap.set(
      el,
      Object.fromEntries(
        el.getAttributeNames().map((name) => [name, el.getAttribute(name)])
      )
    );
  });

  console.log("scopesMap", scopesMap);
}

function reSetAttributes() {
  scopesMap.forEach((attrs, el) => {
    for (const name in attrs) {
      el.setAttribute(name, attrs[name]);
    }
  });
}

// reDefineDirectives();

app.mount(document.body);

// Watch for new DOM nodes and re-compile automatically
// const observer = new MutationObserver((entries) => {
//   entries.forEach((entry) => {
//     if (entry.target instanceof HTMLElement) {
//       console.log('entry.target : ' , entry.target);
      
//       if (
//         [...entry.target.attributes].some((attr) => attr.name.startsWith("v-")) || 
//         [...entry.addedNodes].some(node => node instanceof HTMLElement && getAllVueEls(node).length > 0)
//       ) {
//         reSetAttributes();
//         reDefineDirectives();
//         //
//         console.log(scopesEls, scopesMap);
//         app.mount(document.body);
//         // app.mount(entry.target);
//       }
//     }
//   });
//   // re-scan new stuff
// });
// observer.observe(document.body, { childList: true, subtree: true });
window.vApp = app;
