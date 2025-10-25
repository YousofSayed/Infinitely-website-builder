async function doAsync(callback = async () => {}) {
  try {
    await callback();
  } catch (error) {
    console.error("Error in doAsync:", error);
  }
}

function tryCatch(callack=()=>{}) {
  try {
      callack()
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

function hideElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.display = "none"));
}

function showElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.display = ""));
}

function toggleElement(selector) {
  /**
   * @type {NodeListOf<Element>}
   */
  const elements = document.querySelectorAll(selector);

  elements.forEach((el) => {
    const isHidden = window.getComputedStyle(el).display === "none";

    if (isHidden) {
      // Show element
      el.style.display = ""; // make it visible first
      el.animate(
        [
          { opacity: 0 },
          { opacity: 1 }
        ],
        {
          duration: 200,
          easing: "ease-in-out"
        }
      );
    } else {
      // Fade out, then hide
      const animation = el.animate(
        [
          { opacity: 1 },
          { opacity: 0 }
        ],
        {
          duration: 200,
          easing: "ease-in-out"
        }
      );

      // When fade-out finishes, set display: none
      animation.onfinish = () => {
        el.style.display = "none";
      };
    }
  });
}

function toggleAnimationClass(selector, animationClass) {
  const elements = document.querySelectorAll(selector);

  elements.forEach((el) => {
    const isHidden = window.getComputedStyle(el).display === "none";

    if (isHidden) {
      // Show element first, then animate in
      el.style.display = ""; 
      el.classList.add(animationClass);

      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove(animationClass); // Clean up after animation
        },
        { once: true }
      );
    } else {
      // Animate out
      el.classList.add(animationClass);

      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove(animationClass); // Clean up
          el.style.display = "none"; // Hide after animation ends
        },
        { once: true }
      );
    }
  });
}


function addClass(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.add(className));
}

function removeClass(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.remove(className));
}

function toggleClass(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.toggle(className));
}

function setText(selector, text) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.textContent = text));
}

function fadeIn(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.style.opacity = "0";
    el.style.display = "";
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      el.style.opacity = Math.min(progress / duration, 1);
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

function fadeOut(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      el.style.opacity = 1 - Math.min(progress / duration, 1);
      if (progress >= duration) {
        el.style.display = "none";
      } else {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

function slideDown(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.style.height = "0";
    el.style.overflow = "hidden";
    el.style.display = "block";
    const height = el.scrollHeight;
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      el.style.height = `${Math.min((progress / duration) * height, height)}px`;
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        el.style.height = "";
        el.style.overflow = "";
      }
    }
    requestAnimationFrame(step);
  });
}

function slideUp(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const height = el.scrollHeight;
    el.style.height = `${height}px`;
    el.style.overflow = "hidden";
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      el.style.height = `${Math.max(
        height - (progress / duration) * height,
        0
      )}px`;
      if (progress >= duration) {
        el.style.display = "none";
        el.style.height = "";
        el.style.overflow = "";
      } else {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

function setBackgroundColor(selector, color) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.backgroundColor = color));
}

function setTextColor(selector, color) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.color = color));
}

function setFontSize(selector, size) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.fontSize = size));
}

function setWidth(selector, width) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.width = width));
}

function setHeight(selector, height) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.height = height));
}

function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) element.scrollIntoView({ behavior: "smooth" });
}

function setOpacity(selector, opacity) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.opacity = opacity));
}

function rotateElement(selector, degrees) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transform = `rotate(${degrees}deg)`));
}

function scaleElement(selector, scale) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transform = `scale(${scale})`));
}

function translateX(selector, distance) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transform = `translateX(${distance})`));
}

function translateY(selector, distance) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transform = `translateY(${distance})`));
}

function setBorder(selector, style) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.border = style));
}

function setBorderRadius(selector, radius) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.borderRadius = radius));
}

function addEventListener(selector, event, callback) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.addEventListener(event, callback));
}

function removeEventListener(selector, event, callback) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.removeEventListener(event, callback));
}

function setAttribute(selector, attribute, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.setAttribute(attribute, value));
}

function removeAttribute(selector, attribute) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.removeAttribute(attribute));
}

function focusElement(selector) {
  const element = document.querySelector(selector);
  if (element) element.focus();
}

function blurElement(selector) {
  const element = document.querySelector(selector);
  if (element) element.blur();
}

function toggleAttribute(selector, attribute, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    if (el.hasAttribute(attribute)) {
      el.removeAttribute(attribute);
    } else {
      el.setAttribute(attribute, value);
    }
  });
}

function setInnerHTML(selector, html) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.innerHTML = html));
}

function appendChild(selector, html) {
  const elements = document.querySelectorAll(selector);
  const temp = document.createElement("div");
  temp.innerHTML = html;
  elements.forEach((el) => el.appendChild(temp.firstChild));
}

function prependChild(selector, html) {
  const elements = document.querySelectorAll(selector);
  const temp = document.createElement("div");
  temp.innerHTML = html;
  elements.forEach((el) => el.prepend(temp.firstChild));
}

function removeElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.remove());
}

function setMargin(selector, margin) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.margin = margin));
}

function setPadding(selector, padding) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.padding = padding));
}

function setPosition(selector, position) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.position = position));
}

function setZIndex(selector, zIndex) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.zIndex = zIndex));
}

function setDisplay(selector, display) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.display = display));
}

function shakeElement(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    let start = null;
    let shakeCount = 0;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const offset = Math.sin(progress / 50) * 10;
      el.style.transform = `translateX(${offset}px)`;
      if (progress < duration && shakeCount < 5) {
        requestAnimationFrame(step);
      } else {
        el.style.transform = "";
        shakeCount++;
      }
    }
    requestAnimationFrame(step);
  });
}

function pulseElement(selector, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const scale = 1 + Math.sin(progress / 100) * 0.1;
      el.style.transform = `scale(${scale})`;
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        el.style.transform = "";
      }
    }
    requestAnimationFrame(step);
  });
}

function setFontFamily(selector, font) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.fontFamily = font));
}

function setFontWeight(selector, weight) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.fontWeight = weight));
}

function setTextAlign(selector, align) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.textAlign = align));
}

function setBoxShadow(selector, shadow) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.boxShadow = shadow));
}

function setCursor(selector, cursor) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.cursor = cursor));
}

function disableElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.disabled = true));
}

function enableElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.disabled = false));
}

function toggleDisable(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.disabled = !el.disabled));
}

function setValue(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.value = value));
}

function clearValue(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.value = ""));
}

function setMaxWidth(selector, maxWidth) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.maxWidth = maxWidth));
}

function setMinWidth(selector, minWidth) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.minWidth = minWidth));
}

function setMaxHeight(selector, maxHeight) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.maxHeight = maxHeight));
}

function setMinHeight(selector, minHeight) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.minHeight = minHeight));
}

function setOverflow(selector, overflow) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.overflow = overflow));
}

function setVisibility(selector, visibility) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.visibility = visibility));
}

function toggleVisibility(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.style.visibility =
      el.style.visibility === "hidden" ? "visible" : "hidden";
  });
}

function setTransformOrigin(selector, origin) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transformOrigin = origin));
}

function setTransition(selector, transition) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.transition = transition));
}

function setBackgroundImage(selector, url) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.backgroundImage = `url(${url})`));
}

function setFlexDirection(selector, direction) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.flexDirection = direction));
}

function setJustifyContent(selector, justify) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.justifyContent = justify));
}

function setAlignItems(selector, align) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.alignItems = align));
}

function setGridTemplateColumns(selector, template) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.gridTemplateColumns = template));
}

function setGridTemplateRows(selector, template) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.gridTemplateRows = template));
}

function setGap(selector, gap) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.gap = gap));
}

function cloneElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const clone = el.cloneNode(true);
    el.parentNode.insertBefore(clone, el.nextSibling);
  });
}

function setAriaLabel(selector, label) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.setAttribute("aria-label", label));
}

function toggleAriaHidden(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const current = el.getAttribute("aria-hidden");
    el.setAttribute("aria-hidden", current === "true" ? "false" : "true");
  });
}

function setTabIndex(selector, index) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.tabIndex = index));
}

///New added in 14/7/2025
// interactions-extension.js

function toggleText(selector, text1, text2) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.textContent = el.textContent === text1 ? text2 : text1;
  });
}

function addHTMLBefore(selector, html) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.insertAdjacentHTML("beforebegin", html));
}

function addHTMLAfter(selector, html) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.insertAdjacentHTML("afterend", html));
}

function setPlaceholder(selector, text) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.placeholder = text));
}

function clearText(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.textContent = ""));
}

function disableScroll(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.overflow = "hidden"));
}

function enableScroll(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.overflow = "auto"));
}

function centerText(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.textAlign = "center"));
}

function justifyText(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.textAlign = "justify"));
}

function setLineHeight(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.lineHeight = value));
}

function setLetterSpacing(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.letterSpacing = value));
}

function setWordSpacing(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.wordSpacing = value));
}

function setWhiteSpace(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.whiteSpace = value));
}

function addTooltip(selector, text) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.title = text));
  console.log("tool tip added ");
}

function setMinHeightVH(selector, vh) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.minHeight = `${vh}vh`));
}

function setMinWidthVW(selector, vw) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.minWidth = `${vw}vw`));
}

function setMaxHeightVH(selector, vh) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.maxHeight = `${vh}vh`));
}

function setMaxWidthVW(selector, vw) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.maxWidth = `${vw}vw`));
}

function moveElementBefore(selector, targetSelector) {
  const element = document.querySelector(selector);
  const target = document.querySelector(targetSelector);
  if (element && target) target.parentNode.insertBefore(element, target);
}

function moveElementAfter(selector, targetSelector) {
  const element = document.querySelector(selector);
  const target = document.querySelector(targetSelector);
  if (element && target)
    target.parentNode.insertBefore(element, target.nextSibling);
}

function copyTextToClipboard(selector) {
  const el = document.querySelector(selector);
  if (el) navigator.clipboard.writeText(el.textContent);
}

function setElementId(selector, id) {
  const el = document.querySelector(selector);
  if (el) el.id = id;
}

function setElementName(selector, name) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("name", name);
}

function setElementTitle(selector, title) {
  const el = document.querySelector(selector);
  if (el) el.title = title;
}

function removeAllChildren(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.innerHTML = ""));
}

function toggleRequired(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.required = !el.required));
}

function setDraggable(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.draggable = value));
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function setFlexGrow(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.flexGrow = value));
}

function setFlexShrink(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.flexShrink = value));
}

function setOrder(selector, order) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.order = order));
}

function setAlignSelf(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.alignSelf = value));
}

function setPointerEvents(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.pointerEvents = value));
}

function toggleFullscreen(selector) {
  const el = document.querySelector(selector);
  if (!document.fullscreenElement) {
    el?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function setCaretColor(selector, color) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.caretColor = color));
}

function setUserSelect(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.userSelect = value));
}

function setFilter(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.filter = value));
}

function setBackdropFilter(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.backdropFilter = value));
}

function setTextDecoration(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.textDecoration = value));
}

function setBorderCollapse(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.borderCollapse = value));
}

function setTableLayout(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.tableLayout = value));
}

function setListStyle(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.listStyle = value));
}

function setDirection(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.direction = value));
}

function setWritingMode(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => (el.style.writingMode = value));
}

// interactions.js (new 70 interactions)

function toggleHTML(selector, html1, html2) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.innerHTML = el.innerHTML === html1 ? html2 : html1;
  });
}

function wrapElement(selector, wrapperTag) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const wrapper = document.createElement(wrapperTag);
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
}

function unwrapElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const parent = el.parentNode;
    if (parent !== document.body) {
      parent.parentNode.insertBefore(el, parent);
      parent.remove();
    }
  });
}

function swapElements(selector1, selector2) {
  const el1 = document.querySelector(selector1);
  const el2 = document.querySelector(selector2);
  if (el1 && el2) {
    const clonedEl1 = el1.cloneNode(true);
    const clonedEl2 = el2.cloneNode(true);
    el1.replaceWith(clonedEl2);
    el2.replaceWith(clonedEl1);
  }
}

function blinkElement(selector, times, interval) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    let count = 0;
    const blink = setInterval(() => {
      el.style.visibility =
        el.style.visibility === "hidden" ? "visible" : "hidden";
      count++;
      if (count >= times * 2) {
        clearInterval(blink);
        el.style.visibility = "visible";
      }
    }, interval);
  });
}

function duplicateElement(selector, times) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    for (let i = 0; i < times; i++) {
      const clone = el.cloneNode(true);
      el.parentNode.insertBefore(clone, el.nextSibling);
    }
  });
}

function centerElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    el.style.display = "flex";
    el.style.justifyContent = "center";
    el.style.alignItems = "center";
  });
}

function insertAfter(selector, html) {
  const elements = document.querySelectorAll(selector);
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const newEl = temp.firstChild;
  elements.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.insertBefore(newEl.cloneNode(true), el.nextSibling);
    }
  });
}

function insertBefore(selector, html) {
  const elements = document.querySelectorAll(selector);
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const newEl = temp.firstChild;
  elements.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.insertBefore(newEl.cloneNode(true), el);
    }
  });
}

function flashBackground(selector, color, duration) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const original = el.style.backgroundColor;
    el.style.backgroundColor = color;
    setTimeout(() => {
      el.style.backgroundColor = original;
    }, duration);
  });
}

function doAnimation(
  selector = "",
  name,
  duration = "1s",
  timingFunction = "ease",
  delay = "0s",
  iterationCount = "1",
  direction = "normal",
  fillMode = "forwards",
  playState = "running",
  once = true
) {
  /**
   * @type {(HTMLElement)[] | undefined}
   */
  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    if (!el) {
      console.warn(`No element founded to animate!`);

      return;
    }
    if (el) {
      // if (once && el.hasAttribute("animated")) {
      //   return;
      // } else if (!once && el.hasAttribute("animated")) {
      //   el.style.animation = "";
      //   el.setAttribute("animated", "false");
      //   el.style.animation = `${name || ""} ${duration || "1s"} ${
      //     timingFunction || "ease"
      //   } ${delay || "0s"} ${iterationCount || "1"} ${direction || "normal"} ${
      //     fillMode || "forwards"
      //   } ${playState || "running"}`;
      // }
      if (!once) {
        el.style.animation = "none"; // remove animation
        // force reflow so browser acknowledges the reset
        void el.offsetWidth;
      }
      console.log(`From do animtaion`, el, once);
      el.style.animation = `${name || ""} ${duration || "1s"} ${
        timingFunction || "ease"
      } ${delay || "0s"} ${iterationCount || "1"} ${direction || "normal"} ${
        fillMode || "forwards"
      } ${playState || "running"}`;
      // el.addEventListener("animationstart", (ev) => {
      //   el.setAttribute("animated", "true");
      // });
      // el.addEventListener("animationend", () => {
      //   el.style.animation = "";
      // });
    }
  });
}

function dontObserverMeAgain(selector) {
  if (!window["vIntersectionObserver"]) return;
  if (window["vIntersectionObserver"] instanceof IntersectionObserver) {
    const el = document.querySelector(selector);
    if (el) {
      window["vIntersectionObserver"].unobserve(el);
    } else {
      console.error(`From dontObserverMeAgain action : element is undefined`);
    }
  }
}

// ... 60 more interactions will follow in the same format ...
