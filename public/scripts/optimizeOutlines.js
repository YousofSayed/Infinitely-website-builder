const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target instanceof Element) {
      if (!document.body.classList.contains("gjs-dashed")) {
        entry.target.classList.remove("optimize-outlines");
      } else {
        entry.target.classList.add("optimize-outlines");
      }
    } else {
      entry.target.classList.remove("optimize-outlines");
    }
  });
});

const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((node) => {
    if (node.target instanceof Element) {
      if (node.target.hasAttribute("outline-observed")) return;
      intersectionObserver.observe(node.target);
      node.target.setAttribute("outline-observed", "true");
      node.addedNodes.forEach((node) => {
        mutationObserver.observe(node, { childList: true, subtree: true });
      });
    }
  });
});

mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

document.querySelectorAll("*").forEach((el) => {
  if (el instanceof Element) {
    intersectionObserver.observe(el);
  }
});

console.log("Outlines Optimized💙");
