window["vIntersectionObserver"] = new IntersectionObserver((entries) => {
  entries.forEach((entrie) => {
    entrie.target.dispatchEvent(
      new CustomEvent(`view`, { detail: { interscrt: entrie.isIntersecting } })
    );
    if (entrie.isIntersecting) {
      entrie.target.dispatchEvent(
        new CustomEvent(`enterView`, { detail: { interscrt: true } })
      );
    } else {
      entrie.target.dispatchEvent(
        new CustomEvent(`leaveView`, { detail: { interscrt: false } })
      );
    }
  });
});

const vIntersection = (ctx) => {
  // the element the directive is on
  console.log("ctttttttttttttttttttx : ", ctx.get(), ctx.el);
  const val = ctx.get();

  val && window["vIntersectionObserver"].observe(ctx.el);

  console.log("intersction plugin actaivated");

  return () => {
    window["vIntersectionObserver"].unobserve(ctx.el);
    // cleanup if the element is unmounted
  };
};

const vRef = (ctx) => {
  const value = ctx.exp;
  window[`$${value}`] = ctx.el;
  return () => {
    delete window[value];
  };
};
