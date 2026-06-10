window["vIntersectionObserver"] = new IntersectionObserver(
  (entries) => {
    entries.forEach((entrie) => {
      entrie.target.dispatchEvent(
        new CustomEvent(`view`, {
          detail: { interscrt: entrie.isIntersecting },
        })
      );
      if (entrie.isIntersecting) {
        console.log('In view', entrie.target);

        entrie.target.dispatchEvent(
          new CustomEvent(`enterview`, { detail: { interscrt: true } })
        );
      } else {
        console.log('out view', entrie.target);

        entrie.target.dispatchEvent(
          new CustomEvent(`leaveview`, { detail: { interscrt: false } })
        );
      }
    });
  },
  {
    // root: null,
    // a thin band around the viewport center (±1%)
    // rootMargin:'-50% 0% -50% 0%',
    threshold: [0, 1],
    // root: null,
    // threshold: 0,
    // rootMargin: "-50% 0px -50% 0px",
  }
);
const vIntersection = (ctx) => {
  // the element the directive is on
  console.log("ctttttttttttttttttttx : ", ctx.get(), ctx.el);
  const val = ctx.get();

  val && window["vIntersectionObserver"].observe(ctx.el);
  window["vIntersectionObserver"].observe(ctx.el);

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

const vGsap = (ctx) => {
  if (!gsap) {
    console.warn(`Gsap is undefined (from gsap p-vue plugin)`);
    return;
  }

  // console.log(ctx.exp.replaceAll(/"(thrower\(.*?\))"/gs, "$1"))
  const tween = ctx.get(`(()=>{
    const el = $el;
    // console.log('exp : ' , el , el.getBoundingClientRect);
    ${ctx.exp.replaceAll(/"(thrower\(.*?\))"/gs, "$1")}
   
    })()`);
  // window.vGsapTweens = window.vGsapTweens ? window.vGsapTweens : new Set();
  // window.vGsapTweens.add(tween);
  return () => {
    gsap.killTweensOf(ctx.el)
    // window.vGsapTweens.delete(tween);
  }
}
