# petite-vue-animated

> Drop-in enter/leave animations for `v-if` and `v-for` in [petite-vue](https://github.com/vuejs/petite-vue).
> Supports CSS classes, inline JS keyframe objects, staggered lists, and zero-boilerplate array helpers.

## Installation & Setup

```html
<!-- 1. Load Petite Vue -->
<script src="https://unpkg.com/petite-vue"></script>

<!-- 2. Load the Plugin -->
<script src="petite-vue-animated.js"></script>

<!-- 3. Initialize & Register -->
<script>
  const app = PetiteVue.createApp();
  PetiteVueAnimated.registerAnimatedDirectives(app);
  app.mount();
</script>
```

---

## The 7 Core Examples

### Example 1: Standard CSS Classes
The classic approach. Define your `@keyframes` in a CSS file and pass the class names.

```html
<style>
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
  .fade-in { animation: fade-in 0.4s ease forwards; }
  .fade-out { animation: fade-out 0.4s ease forwards; }
</style>

<div v-scope="{ show: false }">
  <button @click="show = !show">Toggle</button>
  
  <!-- Attribute order doesn't matter, but keeping them together is clean -->
  <div v-in="'fade-in'" v-out="'fade-out'" v-animated-if="show">
    Hello World
  </div>
</div>
```

### Example 2: Inline Object Keyframes (No CSS File Needed!)
Pass a JavaScript object directly into `v-in` and `v-out`. The plugin automatically generates the `@keyframes`, injects them into the `<head>`, and applies them.

```html
<div v-scope="{ show: false }">
  <button @click="show = !show">Toggle Slide</button>
  
  <div 
    v-in="{ from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' }, duration: '0.5s', easing: 'ease-out' }"
    v-out="{ from: { opacity: 1 }, to: { opacity: 0, transform: 'translateY(-20px)' }, duration: '0.3s' }"
    v-animated-if="show"
  >
    I animate purely via JS objects!
  </div>
</div>
```

### Example 3: CSS Transitions (Reverse on Exit)
If you use CSS `transition` instead of `@keyframes`, you only need `v-in`. Removing the class automatically triggers the reverse transition before the element is removed from the DOM.

```html
<style>
  .box { 
    opacity: 0; transform: scale(0.8); 
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
  }
  .box.active { opacity: 1; transform: scale(1); }
</style>

<div v-scope="{ show: false }">
  <button @click="show = !show">Toggle Transition</button>
  
  <!-- No v-out needed! -->
  <div class="box" v-in="'active'" v-animated-if="show">
    Transition Magic ✨
  </div>
</div>
```

### Example 4: Animate on First Page Load (`.appear`)
By default, elements that are `true` on initial page load appear instantly. Add the `.appear` modifier to force the enter animation to play on mount.

```html
<div v-scope="{ show: true }">
  <div 
    v-in="{ from: { opacity: 0 }, to: { opacity: 1 }, duration: '1s' }" 
    v-animated-if.appear="show"
  >
    I animated in as soon as the page loaded!
  </div>
</div>
```

### Example 5: Staggered List Animations
Use `v-stagger="ms"` to automatically apply an incremental `animation-delay` to sibling elements based on their DOM index.

```html
<div v-scope="{ items: ['Apple', 'Banana', 'Cherry'] }">
  <div 
    v-for="item in items" 
    v-in="{ from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1 }, duration: '0.4s' }"
    v-stagger="100"
    v-animated-if="true"
  >
    {{ item }}
  </div>
</div>
```

### Example 6: Zero-Boilerplate Animated Lists
Use `PetiteVueAnimated.list()` to create an array that behaves exactly like a native JS array, but automatically animates items when you `push()`, `splice()`, or `pop()`.

```html
<div v-scope="{ arr: PetiteVueAnimated.list(['Task 1', 'Task 2']) }">
  
  <button @click="arr.push('New Task')">Add</button>
  <button @click="arr.pop()">Remove Last</button>

  <div 
    v-for="(item, index) in arr" 
    :key="index"
    v-in="{ from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 }, duration: '0.3s' }"
    v-out="{ from: { opacity: 1 }, to: { opacity: 0, scale: 1.2 }, duration: '0.2s' }"
    v-animated-for="item"
    style="margin: 10px 0; padding: 10px; background: #eee;"
  >
    {{ item }}
    <button @click="arr.splice(index, 1)">Delete</button>
  </div>
</div>
```

### Example 7: Asymmetric Animations (Enter or Leave only)
Simply omit `v-in` or `v-out` if you only want the animation to happen in one direction.

```html
<div v-scope="{ show: false }">
  <button @click="show = !show">Toggle</button>
  
  <!-- Pops in instantly, but slides out smoothly -->
  <div v-out="{ from: { opacity: 1 }, to: { opacity: 0, transform: 'translateX(100px)' }, duration: '0.5s' }" v-animated-if="show">
    Instant Enter, Animated Leave
  </div>
</div>
```

---

## ⚠️ Crucial Note for PHP / GrapesJS Rendering

If you are rendering this HTML via a PHP backend (like WordPress) or a builder like GrapesJS, **you must wrap your HTML attributes in double quotes (`"`)**. 

If your PHP wraps attributes in single quotes (`'`), the single quotes inside your JS objects (e.g., `opacity: '0'`) will break the HTML parser.

**❌ WRONG (PHP):**
```php
// Breaks because of inner single quotes
$attrs .= ' v-in=\'' . esc_attr($value) . '\''; 
```

**✅ CORRECT (PHP):**
```php
// Safely handles inner single quotes
$attrs .= ' v-in="' . esc_attr($value) . '"'; 
```

---

## TypeScript Definitions

If you are using TypeScript or JSDoc for IDE autocomplete, use these types:

```typescript
export type CSSProperties = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends Function ? never : K]?: string | number;
} & {
  [key: `--${string}`]: string | number | undefined;
};

export interface ExplicitKeyframes {
  from?: CSSProperties;
  to?: CSSProperties;
  duration?: string | number; 
  easing?: string; 
}

export interface InlineKeyframes extends CSSProperties {
  to?: CSSProperties;
  duration?: string | number;
  easing?: string;
}

export type AnimationObject = ExplicitKeyframes | InlineKeyframes;
export type AnimationValue = string | AnimationObject;
```

---

## API Summary

| Directive / Helper | Description |
| :--- | :--- |
| `v-animated-if="bool"` | Like `v-if`, but waits for leave animations to finish before removing the DOM node. |
| `v-animated-if.appear` | Plays the enter animation on the very first page load if the condition is true. |
| `v-animated-for="item"` | Pairs with `v-for` to animate list additions and removals. |
| `v-in="class \| object"` | Defines the enter animation (CSS class string or inline JS keyframe object). |
| `v-out="class \| object"` | Defines the leave animation (CSS class string or inline JS keyframe object). |
| `v-stagger="ms"` | Adds incremental `animation-delay` based on the element's sibling index. |
| `PetiteVueAnimated.list(arr)` | Returns a proxy array that automatically animates `push`, `pop`, `splice`, etc. |