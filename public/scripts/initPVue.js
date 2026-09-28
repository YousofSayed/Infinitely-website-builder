/**
 * @type {import('petite-vue')}
 */
const pVuew = PetiteVue;
// const { location: routerLocation, navigate } = PetiteRouter;
const createApp = () =>
  PetiteVue.createApp({
    $delimiters: ["${", "}"],
    // location:routerLocation,
    // navigate,
  });
// FIX 1: Delimiters MUST be exactly two strings.
const app = createApp();
const initPlugins = () => {
  app.directive("view", vIntersection);
  app.directive("ref", vRef);
  app.directive("gsap", vGsap);
  app.directive("mount", vMount);
  app.directive("catch", vCatch);
};

initPlugins();
registerAutoAnimateDirective(app);

const vScope = document.body.getAttribute("v-scope");
const isVScope = Boolean(vScope);
if (!isVScope) {
  document.body.setAttribute("v-scope", "{}");
}

app.mount(document.body);
window.vApp = app;
