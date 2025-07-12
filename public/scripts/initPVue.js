/**
 * @type {import('petite-vue')}
 */
const pVuew = PetiteVue;


const app = pVuew.createApp({
  $delimiters: ["${", "}", "{{", "}}"],
});
app.directive("view", vIntersection);
app.directive("ref", vRef);
app.mount();
