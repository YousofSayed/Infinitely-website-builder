import { createApp } from "petite-vue";
const myDirective = async(ctx) => {
  // the element the directive is on
  console.log("directive should done : ", ctx.exp);

  const expression = ctx.exp;
if(!expression)return
  // Evaluate the expression in the current scope
  try {
    // If ctx.get() returns a function, call it with the scope as 'this'
    const value = ctx.get();
    if (typeof value === "function") {
      console.log("is function : ", value, value.toString());
      console.log("scope is  : ", ctx.scope);
      await value();
    }
    // Otherwise, the expression has already been evaluated by ctx.get()
    // (e.g., a simple value or side-effect like console.log)
  } catch (error) {
    console.error("Error in v-init:", error);
  }
};
let pVueApp = createApp();
// pVueApp.directive("my-dir", myDirective);
export { pVueApp };

export function reCreatePvApp() {
    pVueApp = createApp();
}