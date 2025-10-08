import { Icons } from "../components/Icons/Icons";
import {
  defineTraits,
  doActionAndPreventSaving,
  getParentNode,
} from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {string | HTMLElement} source
 * @param {DOMParserSupportedType} parseType
 */
function elToJSON(source, parseType) {
  const el =
    typeof source != "string"
      ? source
      : new DOMParser().parseFromString(source, parseType).body.children[0];
  console.log("from innre : ", source, el);

  const attributes = el.attributes
    ? Object.fromEntries(
        [...el.getAttributeNames()].map((attr) => [attr, el.getAttribute(attr)])
      )
    : {};
  const tagName = el.tagName.toLowerCase();
  const childs = [...el.children].map((child) => elToJSON(child, parseType));
  /**
   *
   * @param {HTMLElement} el
   * @param {keyof HTMLElementTagNameMap} tagName
   */
  const getParent = (el, tagName) => {
    const parent = el.parentElement;
    if (parent.tagName.toLowerCase() == "body") return null;
    if (
      parent &&
      parent.tagName &&
      parent.tagName.toLowerCase() == tagName.toLowerCase()
    ) {
      return parent;
    } else if (
      parent &&
      parent.tagName &&
      parent.tagName.toLowerCase() != tagName.toLowerCase()
    ) {
      return getParent(parent, tagName);
    } else {
      return null;
    }
  };
  const aboveParent = getParent(el, "svg");

  return {
    tagName,
    attributes,
    type: tagName == "svg" ? "svg" : aboveParent ? "svg-in" : "",
    components: childs,
  };
}

/**
 * fixSVGSmart(svgString)
 * - Converts objectBoundingBox-patterns that used <use transform="scale(...)"> into
 *   userSpaceOnUse patterns with direct <image>.
 * - Renames defs ids (to avoid collision in editors/iframes) and updates url(#...) refs.
 * - Cleans common GrapesJS attributes and will-change styles.
 * @param {string} svgString
 * @returns {string} fixed SVG string
 */
function fixSVGSmart(svgString) {
  if (typeof svgString !== 'string') return svgString;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return svgString;

  // Ensure namespaces
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Helper to escape regex
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1) Rename defs children ids to avoid collisions (only defs children)
  const idMap = {};
  doc.querySelectorAll('defs [id]').forEach(el => {
    const old = el.getAttribute('id');
    if (!old) return;
    const rand = Math.random().toString(36).slice(2, 8);
    const neu = `svgfix-${old}-${rand}`;
    idMap[old] = neu;
    el.setAttribute('id', neu);
  });

  // 2) Update references across all attributes (fill, stroke, filter, clip-path, style, href/xlink:href, etc.)
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      let val = attr.value;

      // replace url(#old) occurrences
      for (const old in idMap) {
        val = val.replace(new RegExp(`url\\(#${esc(old)}\\)`, 'g'), `url(#${idMap[old]})`);
      }

      // If an href/xlink:href points to "#old", remap it
      if ((attr.name === 'href' || attr.name === 'xlink:href') && /^#/.test(val)) {
        const target = val.slice(1);
        if (idMap[target]) val = '#' + idMap[target];
      }

      // update style inline url(...) references too
      for (const old in idMap) {
        val = val.replace(new RegExp(`#${esc(old)}`, 'g'), `#${idMap[old]}`);
      }

      el.setAttribute(attr.name, val);
    });
  });

  // 3) Convert xlink:href -> href (keep both for compatibility)
  doc.querySelectorAll('[xlink\\:href]').forEach(el => {
    const v = el.getAttribute('xlink:href');
    if (v && !el.getAttribute('href')) el.setAttribute('href', v);
  });

  // parse scale(sx [, sy]) from transform
  function parseScale(transform) {
    if (!transform) return null;
    const m = transform.match(/scale\(\s*([0-9.+-eE]+)(?:[,\s]+([0-9.+-eE]+))?\s*\)/);
    if (!m) return null;
    return { sx: parseFloat(m[1]), sy: m[2] ? parseFloat(m[2]) : parseFloat(m[1]) };
  }

  // 4) Normalize patterns: objectBoundingBox + use -> userSpaceOnUse + direct <image>
  doc.querySelectorAll('pattern').forEach(pattern => {
    const pc = pattern.getAttribute('patternContentUnits');
    if (!pc || pc.toLowerCase() !== 'objectboundingbox') return;

    const use = pattern.querySelector('use');
    if (!use) return;

    // find referenced element (usually <image>)
    const href = use.getAttribute('href') || use.getAttribute('xlink:href');
    const refId = href && href.startsWith('#') ? href.slice(1) : null;
    const refEl = refId ? doc.getElementById(refId) : null;

    // parse transform scale (common in GrapesJS output)
    const transform = use.getAttribute('transform') || '';
    const sc = parseScale(transform);

    if (refEl && refEl.tagName && refEl.tagName.toLowerCase() === 'image') {
      // attempt to get intrinsic width/height from the <image> attributes
      const iwAttr = refEl.getAttribute('width');
      const ihAttr = refEl.getAttribute('height');
      const iw = iwAttr ? parseFloat(iwAttr) : NaN;
      const ih = ihAttr ? parseFloat(ihAttr) : NaN;

      // If we have width/height, convert pattern into userSpaceOnUse sized to image pixels
      if (!isNaN(iw) && !isNaN(ih) && iw > 0 && ih > 0) {
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', String(iw));
        pattern.setAttribute('height', String(ih));
        pattern.removeAttribute('patternContentUnits');

        // create a direct <image> to replace the <use>
        const newImg = refEl.cloneNode(true);
        // keep href and xlink:href for compatibility
        const imgHref = refEl.getAttribute('href') || refEl.getAttribute('xlink:href') || '';
        newImg.setAttribute('href', imgHref);
        newImg.setAttribute('xlink:href', imgHref);
        newImg.setAttribute('x', '0');
        newImg.setAttribute('y', '0');
        newImg.setAttribute('width', String(iw));
        newImg.setAttribute('height', String(ih));
        if (!newImg.getAttribute('preserveAspectRatio')) newImg.setAttribute('preserveAspectRatio', 'none');

        // remove id from cloned image to avoid duplicate IDs inside defs (we already remapped defs ids)
        if (newImg.hasAttribute('id')) newImg.removeAttribute('id');

        // replace <use> with <image>
        use.replaceWith(newImg);
      } else if (sc && sc.sx && sc.sy) {
        // Fallback: no explicit image width/height but scale exists.
        // If transform is scale(1/W 1/H), derive W = 1/sx
        const maybeW = 1 / sc.sx;
        const maybeH = 1 / sc.sy;
        if (isFinite(maybeW) && isFinite(maybeH) && maybeW > 0 && maybeH > 0) {
          pattern.setAttribute('patternUnits', 'userSpaceOnUse');
          pattern.setAttribute('width', String(Math.round(maybeW)));
          pattern.setAttribute('height', String(Math.round(maybeH)));
          pattern.removeAttribute('patternContentUnits');

          const newImg = refEl.cloneNode(true);
          const imgHref = refEl.getAttribute('href') || refEl.getAttribute('xlink:href') || '';
          newImg.setAttribute('href', imgHref);
          newImg.setAttribute('xlink:href', imgHref);
          newImg.setAttribute('x', '0');
          newImg.setAttribute('y', '0');
          newImg.setAttribute('width', String(Math.round(maybeW)));
          newImg.setAttribute('height', String(Math.round(maybeH)));
          if (!newImg.getAttribute('preserveAspectRatio')) newImg.setAttribute('preserveAspectRatio', 'none');
          if (newImg.hasAttribute('id')) newImg.removeAttribute('id');
          use.replaceWith(newImg);
        }
      }
    }
  });

  // 5) Remove GrapesJS-specific attributes and sanitize styles (strip will-change)
  doc.querySelectorAll('[data-gjs-type],[draggable]').forEach(el => {
    el.removeAttribute('data-gjs-type');
    el.removeAttribute('draggable');
  });
  doc.querySelectorAll('[style]').forEach(el => {
    let s = el.getAttribute('style') || '';
    // remove will-change and useless inline bits GrapesJS adds
    s = s.replace(/(?:^|;)\s*will-change\s*:[^;]+;?/gi, '');
    s = s.replace(/(?:^|;)\s*cursor\s*:[^;]+;?/gi, ''); // optional
    s = s.replace(/(?:^|;)\s*pointer-events\s*:[^;]+;?/gi, '');
    s = s.trim();
    if (!s) el.removeAttribute('style');
    else el.setAttribute('style', s);
  });

  // 6) Ensure images have preserveAspectRatio
  doc.querySelectorAll('image').forEach(img => {
    if (!img.getAttribute('preserveAspectRatio')) img.setAttribute('preserveAspectRatio', 'none');
  });

  // Serialize and return the fixed svg
  return new XMLSerializer().serializeToString(svg);
}



/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const Svg = (editor) => {
  // const parseSvg = (text = "") => {
  //   const parser = new DOMParser();
  //   const svgDoc = parser.parseFromString(text, "image/svg+xml");
  //   const svg = svgDoc.querySelector("svg");
  //   return svg;
  // };
  // editor.getSelected().props().droppable
  // const icon = parseSvg(
  //   reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "black" }))
  // );
  // editor.Components.removeType("svg");
  // console.log(
  //   "JSON ",
  //   editor.Parser.parserHtml.parse(
  //     reactToStringMarkup(Icons.svg({ width: 40, height: 50, fill: "black" })),
  //     undefined,
  //     { htmlType: "image/svg+xml" }
  //   )
  // );

  //   editor.Components.removeType('svg');

  // editor.DomComponents.addType("svg", {
  //   isComponent: (el) => el.tagName === "SVG",
  //   model: {
  //     defaults: {
  //       copyable: false,
  //       removable: true,
  //       draggable: true,
  //       resizable: false, // stop GrapesJS attaching resize observers
  //       highlightable: false,
  //       selectable: true,
  //     },
  //     init() {
  //       // force stop children parsing
  //       this.set("void", true);
  //     },
  //   },
  // });

  // editor.DomComponents.addType("svg-in", {
  //   isComponent: (el) =>
  //     Boolean(getParentNode(
  //       (el) => el.tagName && el.tagName.toLowerCase() == "svg",
  //       el
  //     )),
  //   model: {
  //     defaults: {
  //       copyable: false,
  //       removable: true,
  //       draggable: true,
  //       resizable: false, // stop GrapesJS attaching resize observers
  //       highlightable: false,
  //       selectable: true,
  //     },
  //     init() {
  //       // force stop children parsing
  //       this.set("void", true);
  //     },
  //   },
  // });

  editor.Components.addType("inf-svg", {
    // extend:'svg',
    // extendView: true,

    isComponent: (el) => {
      if (!el.tagName) {
        // console.warn(`SVG Element Not Founded...!`);
        return;
      }
      // console.log(el);

      if (
        el.tagName.toLowerCase() == "infinitely-svg"
        // &&
        // el.parentElement.tagName.toLowerCase() != "infinitely-svg"
      ) {
        // console.log("JSON ", elToJSON(el.outerHTML,'text/html'));

        return {
          // type: "inf-svg",
          // tagName: "infinitely-svg",
          // Avoid setting components as outerHTML to prevent re-parsing
          components: elToJSON(el.outerHTML, "text/html"),
        };
      }
    },

    view: {
      onRender({ model }) {
        doActionAndPreventSaving(editor, () => {
          // model.set({
          //   // draggable: false,
          //   droppable: false,
          //   resizable: true,
          // });

          const child = model.components().models[0];
          if (!child) {
            console.warn(`No child in svg component`);
            return;
          }
        });

        // child.addClass("no-pointer");
        // model.setAttributes(
        //   { ...(child.getAttributes() || {} ),type: "svg-wrapper", },
        //   { avoidStore: true }
        // );
        // model.removeClass("no-pointer");
      },
    },
    model: {
      icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
      defaults: {
        name: "svg",
        icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
        tagName: "infinitely-svg",
        // // content:reactToStringMarkup(Icons.svg({ fill: "white" })),
        droppable: false,
        resizable: { ratioDefault: true },
        attributes: {
          // xmlns: "http://www.w3.org/2000/svg",
          //   ...Object.fromEntries(
          //     icon
          //       .getAttributeNames()
          //       .map((attr) => [attr, icon.getAttribute(attr)])
          //   ),
          // type: "svg-wrapper",
          // width: 40,
          // height: 40,
        },

        components: reactToStringMarkup(
          Icons.svg({ width: 40, height: 50, fill: "black" })
        ),

        traits: defineTraits([
          {
            name: "choose-svg",
            label: "Choose svg",
            placeholder: "Enter svg content",
            role: "handler",
            type: "media",
            mediaType: "svg",
            async callback({ editor, newValue, asset , }) {
              const sle = editor.getSelected();
              // const type = sle?.props().type;
              if (!sle || !asset) return;

              // Read the SVG file content
              const textCmp = await asset.text();
              // const children = sle.components().models;
              sle.components(fixSVGSmart(textCmp));
              const svg = sle.components().models[0];
              svg.set({
                draggable: false,
                draggable: false,
                layerable: false,
                selectable: false,
                highlightable: false,
                hoverable: false,
              });
              // const newCmp = sle.replaceWith(textCmp)[0];
              // newCmp.set({ resizable: true });
              // preventSelectNavigation(editor, newCmp);
            },
          },
        ]),
      },
      // init() {
      //   // Listen for child component removal
      //   // this.listenTo(this.get("components"), "remove", this.onChildRemove);
      //   this.on("change:attributes", this.handleAttrChange);
      // },
      // handleAttrChange(model, attributes) {
      //   const child = this.components().models[0];
      //   const childEl = child.getEl();
      //   if (!child && !childEl) return;

      //   const newAttrs = { ...this.getAttributes(), ...attributes };
      //   delete newAttrs.id; // Avoid overwriting ID
      //   child.addAttributes(newAttrs)
      //   // Object.entries(newAttrs).forEach(([key, value]) => {
      //   //   childEl.setAttribute(key, value);
      //   // });
      // },
      // toHTML() {
      //   const child = this.components().models[0];
      //   const clone = child.getEl().cloneNode(true) ;
      //   clone.removeAttribute(`data-gjs-type`);
      //   console.log('From exporter : '  , clone , clone.outerHTML);

      //   return clone.outerHTML
      //   // child.toHTML({
      //   //   withProps: true,
      //   //   keepInlineStyle: true,
      //   //   attributes: this.getAttributes(),

      //   // });
      // },
    },
  });

  // editor.Components.addType("inf-svg", {
  //   isComponent: (el) => {
  //     if (!el.tagName) return;
  //     if (
  //       el.tagName.toLowerCase() == "object" &&
  //       el.getAttribute("inf-type") == "svg"
  //     )
  //       return true;
  //     if (el.tagName.toLowerCase() == "svg")
  //       return {
  //         tagName: "object",
  //         attributes: {
  //           type: "image/svg+xml",
  //           data: svgToDataURL(el),
  //         },
  //       };
  //   },
  //   model: {
  //     defaults: {
  //       name: "svg",
  //       icon: reactToStringMarkup(Icons.svg({ fill: "white" })),
  //       tagName: "object",
  //       attributes: {
  //         type: "image/svg+xml",
  //         "inf-type": "svg",
  //       },

  //       traits: defineTraits([
  //         {
  //           name: "choose-svg",
  //           label: "Choose svg",
  //           placeholder: "Enter svg content",
  //           role: "handler",
  //           type: "media",
  //           mediaType: "svg",
  //           async callback({ editor, newValue, asset }) {
  //             const sle = editor.getSelected();
  //             // const type = sle?.props().type;
  //             if (!sle || !asset) return;
  //             sle.addAttributes(
  //               {
  //                 data: newValue,
  //               },
  //               { avoidStore: true }
  //             );
  //             // Read the SVG file content
  //             // const textCmp = await asset.text();
  //             // const children = sle.components().models;
  //             // sle.components(textCmp);
  //             // const svg = sle.components().models[0];
  //             // svg.set({
  //             //   draggable: false,
  //             //   draggable: false,
  //             //   layerable: false,
  //             //   selectable: false,
  //             //   highlightable: false,
  //             //   hoverable: false,
  //             // });
  //             // const newCmp = sle.replaceWith(textCmp)[0];
  //             // newCmp.set({ resizable: true });
  //             // preventSelectNavigation(editor, newCmp);
  //           },
  //         },
  //       ]),
  //     },
  //   },
  // });
};
