import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const GO_TO_CLASS = "animate-go-to";
const GO_TO_SELECTOR = `.${GO_TO_CLASS}`;

function getTargets(scope) {
  if (!scope) return [];

  const self =
    scope instanceof Element && scope.matches(GO_TO_SELECTOR)
      ? [scope]
      : [];

  const nested = scope.querySelectorAll
    ? Array.from(scope.querySelectorAll(GO_TO_SELECTOR))
    : [];

  return [...self, ...nested].filter((el) =>
    el.classList.contains(GO_TO_CLASS)
  );
}

function useGoToAnimationWithRef(scopeRef, options = {}) {
  const {
    duration = 0.17,
    ease = "power1.inOut",
    animateOnMount = true,
  } = options;

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const stopCssAnimation = (el) => {
      // Important: this stops your CSS @keyframes animation
      // so GSAP can control opacity correctly.
      el.style.setProperty("animation", "none", "important");
    };

    const playIn = (el) => {
      gsap.killTweensOf(el);
      stopCssAnimation(el);

      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration,
          ease,
          overwrite: true,
        }
      );
    };

    const playOut = (el) => {
      gsap.killTweensOf(el);
      stopCssAnimation(el);

      gsap.to(el, {
        opacity: 0,
        duration,
        ease,
        overwrite: true,
      });
    };

    // Initial animation for elements already inside the scope
    if (animateOnMount) {
      getTargets(scope).forEach((el) => playIn(el));
    } else {
      getTargets(scope).forEach((el) => stopCssAnimation(el));
    }

    const getGoToTarget = (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(GO_TO_SELECTOR)
          : null;

      if (!target) return null;
      if (!scope.contains(target)) return null;

      const related = event.relatedTarget;

      // If pointer/focus is still moving inside the same target,
      // do not trigger in/out again.
      if (related instanceof Node && target.contains(related)) {
        return null;
      }

      return target;
    };

    const onPointerOver = (event) => {
      const el = getGoToTarget(event);
      if (el) playIn(el);
    };

    const onPointerOut = (event) => {
      const el = getGoToTarget(event);
      if (el) playOut(el);
    };

    const onFocusIn = (event) => {
      const el = getGoToTarget(event);
      if (el) playIn(el);
    };

    const onFocusOut = (event) => {
      const el = getGoToTarget(event);
      if (el) playOut(el);
    };

    scope.addEventListener("pointerover", onPointerOver);
    scope.addEventListener("pointerout", onPointerOut);
    scope.addEventListener("focusin", onFocusIn);
    scope.addEventListener("focusout", onFocusOut);

    return () => {
      scope.removeEventListener("pointerover", onPointerOver);
      scope.removeEventListener("pointerout", onPointerOut);
      scope.removeEventListener("focusin", onFocusIn);
      scope.removeEventListener("focusout", onFocusOut);

      gsap.killTweensOf(getTargets(scope));
    };
  }, [scopeRef, duration, ease, animateOnMount]);
}

export function useGoToAnimation(options = {}) {
  const ref = useRef(null);
  useGoToAnimationWithRef(ref, options);
  return ref;
}

export function GoToScope({
  children,
  duration,
  ease,
  animateOnMount,
  ...props
}) {
  const ref = useGoToAnimation({
    duration,
    ease,
    animateOnMount,
  });

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}

export default GoToScope;