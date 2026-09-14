/**
 * @type {import('petite-vue')}
 */
const pVuew = PetiteVue;

// FIX 1: Delimiters MUST be exactly two strings.
const app = pVuew.createApp({
  $delimiters: ["${", "}"], 
});

app.directive("view", vIntersection);
app.directive("ref", vRef);
app.directive("gsap", vGsap);
registerAutoAnimateDirective(app);

const vScope = document.body.getAttribute('v-scope');
const isVScope = Boolean(vScope);
if (!isVScope) {
  document.body.setAttribute('v-scope', '{}');
}

app.mount(document.body);
window.vApp = app;