// Smart "visual" will-change manager
const elements = new Set();
const rafMap = new WeakMap();

function observeElement(el) {
  if (elements.has(el)) return;
  elements.add(el);

  // Observe when element visible
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const node = entry.target;
      if (entry.isIntersecting) {
        if (!rafMap.has(node)) {
          const loop = () => {
            const style = getComputedStyle(node);
            const moving =
              style.transform !== 'none' ||
              style.transitionDuration !== '0s' ||
              style.animationName !== 'none' ||
              style.opacity !== '1';
            node.style.willChange = moving ? 'transform, opacity' : 'auto';
            rafMap.set(node, requestAnimationFrame(loop));
          };
          rafMap.set(node, requestAnimationFrame(loop));
        }
      } else {
        cancelAnimationFrame(rafMap.get(node));
        rafMap.delete(node);
        node.style.willChange = 'auto';
      }
    });
  });
  io.observe(el);
}

// Observe all new and existing nodes
document.querySelectorAll('*').forEach(observeElement);

const mo = new MutationObserver(muts => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      if (node.nodeType === 1) observeElement(node);
    }
  }
});
mo.observe(document.body, { childList: true, subtree: true });

console.log('🧩 Adaptive will-change manager active');
