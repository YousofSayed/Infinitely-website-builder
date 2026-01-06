(() => {
  const storedVisibility = new WeakMap();
  const trackedElements = new Set();
  const pending = new Map();
  let rafId = null;

  const isOutlineEnabled = () => document.body.classList.contains("gjs-dashed");

  const flush = () => {
    rafId = null;
    pending.forEach((value, el) => {
      el.style.visibility = value;
    });
    pending.clear();
  };

  const intersectionObserver = new IntersectionObserver((entries) => {
    if (!isOutlineEnabled()) return;

    for (const entry of entries) {
      const el = entry.target;
      if (!(el instanceof Element)) continue;

      if (!storedVisibility.has(el)) {
        storedVisibility.set(el, el.style.visibility || "");
        trackedElements.add(el); // 👈 track for restore
      }

      pending.set(el, entry.isIntersecting ? "" : "hidden");
    }

    if (!rafId) rafId = requestAnimationFrame(flush);
  });

  const mutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        intersectionObserver.observe(node);
        node
          .querySelectorAll("*")
          .forEach((el) => intersectionObserver.observe(el));
      });
    }
  });

  // 🔥 Outline toggle cleanup (FIXED)
  const outlineToggleObserver = new MutationObserver(() => {
    if (isOutlineEnabled()) return;

    trackedElements.forEach((el) => {
      el.style.visibility = storedVisibility.get(el) || "";
    });

    trackedElements.clear();
    pending.clear();
  });

  outlineToggleObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const wrapper = document.querySelector(`body [data-gjs-type="wrapper"]`);

  if (!wrapper) return;

  wrapper
    .querySelectorAll("*")
    .forEach((el) => intersectionObserver.observe(el));

  mutationObserver.observe(wrapper, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("pointerenter", () => {
    document.body.classList.remove("preventWhenScroll");
  });

  document.addEventListener("pointerleave", () => {
    document.body.classList.add("preventWhenScroll");
  });

  let scrolling = false;
  let timeout;

  document.addEventListener("scroll", () => {
    if (!scrolling) {
      scrolling = true;
      // alert("START SCROLL");
      document.body.classList.add("preventWhenScroll");
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      scrolling = false;
      document.body.classList.remove("preventWhenScroll");
      // alert("END SCROLL");
    }, 150);
  });

  document.addEventListener("dragover", (ev) => {
    // alert('over')
    document.body.classList.remove("preventWhenScroll");
    document.body.classList.add("inf-stop-all-animations");
  });

  document.addEventListener("drop", (ev) => {
    // alert('dropped')
    // document.body.classList.remove("preventWhenScroll");
    document.body.classList.remove("inf-stop-all-animations");
  });

  

  console.log("⚡ Outlines Optimized (WeakMap-safe)");
})();

// (() => {
//   const storedVisibility = new WeakMap();
//   const tracked = new Set();
//   const pending = new Map();
//   let rafId = null;
//   let scrolling = false;
//   let scrollTimeout = null;

//   const isOutlineEnabled = () =>
//     document.body.classList.contains("gjs-dashed");

//   const flush = () => {
//     rafId = null;
//     pending.forEach((v, el) => {
//       el.style.visibility = v;
//     });
//     pending.clear();
//   };

//   // Helper to detect animated elements
//   const isAnimated = (el) => {
//     if (!(el instanceof Element)) return false;
//     const style = getComputedStyle(el);
//     const animDur = parseFloat(style.animationDuration) || 0;
//     const transDur = parseFloat(style.transitionDuration) || 0;
//     return animDur > 0 || transDur > 0;
//   };

//   const io = new IntersectionObserver((entries) => {
//     if (!isOutlineEnabled() || scrolling) return; // skip while scrolling

//     for (const entry of entries) {
//       const el = entry.target;

//       // skip images or animated elements
//       if (el.querySelector("img") || isAnimated(el)) continue;

//       if (!storedVisibility.has(el)) {
//         storedVisibility.set(el, el.style.visibility || "");
//         tracked.add(el);
//       }

//       pending.set(el, entry.isIntersecting ? "" : "hidden");
//     }

//     if (!rafId) rafId = requestAnimationFrame(flush);
//   });

//   const mo = new MutationObserver((mutations) => {
//     for (const m of mutations) {
//       m.addedNodes.forEach((node) => {
//         if (
//           node instanceof Element &&
//           node.parentElement === wrapper &&
//           !node.querySelector("img") &&
//           !isAnimated(node)
//         ) {
//           io.observe(node);
//         }
//       });
//     }
//   });

//   const outlineToggleObserver = new MutationObserver(() => {
//     if (isOutlineEnabled()) return;

//     tracked.forEach((el) => {
//       el.style.visibility = storedVisibility.get(el) || "";
//     });

//     tracked.clear();
//     pending.clear();
//   });

//   outlineToggleObserver.observe(document.body, {
//     attributes: true,
//     attributeFilter: ["class"],
//   });

//   const wrapper = document.querySelector(
//     'body [data-gjs-type="wrapper"]'
//   );

//   if (!wrapper) return;

//   // Observe only wrapper children that are not images or animated
//   Array.from(wrapper.children).forEach((el) => {
//     if (!el.querySelector("img") && !isAnimated(el)) io.observe(el);
//   });

//   mo.observe(wrapper, { childList: true });

//   console.log(
//     "🚀 Outlines Optimized (Wrapper + Image/Animated safe + Scroll)"
//   );
// })();
