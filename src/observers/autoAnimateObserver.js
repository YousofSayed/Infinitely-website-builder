import autoAnimate from "@formkit/auto-animate";

// Use a WeakSet to track initialized elements. 
// This prevents double-initialization and avoids memory leaks.
const initializedElements = new WeakSet();

const applyAnimation = (el) => {
  if (initializedElements.has(el)) return;
  
  if (el instanceof HTMLElement && el.classList.contains("auto-animate")) {
    autoAnimate(el);
    initializedElements.add(el);
  }
};

export const animateApp = (selector) => {
  const roots = document.querySelectorAll(selector);

  roots.forEach((root) => {
    // 1. Initialize elements that are ALREADY in the DOM
    applyAnimation(root);
    root.querySelectorAll(".auto-animate").forEach(applyAnimation);

    // 2. Observe for FUTURE DOM and class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle class changes on existing elements
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          applyAnimation(mutation.target);
        }

        // Handle newly added elements
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              applyAnimation(node);
              // CRUCIAL: Check descendants of the added node
              node.querySelectorAll(".auto-animate").forEach(applyAnimation);
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"], // Performance optimization: only watch 'class' changes
    });
    
    // Optional: If you need to clean up later (e.g., in a SPA), 
    // you might want to return the observer or a disconnect function.
  });
};