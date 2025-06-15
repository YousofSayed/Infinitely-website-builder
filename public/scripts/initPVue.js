/**
 * @type {import('petite-vue')}
 */
const pVuew = PetiteVue
const app = pVuew.createApp({
     $delimiters: ["${", "}" , "{{" , "}}"],
})
app.mount()