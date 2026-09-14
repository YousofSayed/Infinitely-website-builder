import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { useRecoilState } from "recoil";
import { autoUpdate, flip, offset, shift, useFloating, FloatingPortal } from "@floating-ui/react";
import getCaretCoordinates from "textarea-caret";
import { Virtuoso } from "react-virtuoso";
import Fuse from "fuse.js";

import { useWpTokens } from "@/queries/wp.queries";
import { showWpTokensPickerState } from "@/helpers/atoms";
import { Loader } from "@/components/Loader";
import { Icons } from "@/components/Icons/Icons";
import { getParentNode, isWordpress } from "@/helpers/functions";
import { inf_tokens_container, inf_tokens_ignore } from "@/constants/shared";
import { Tooltip } from "react-tooltip";
import Portal from "@/components/Editor/Portal";

const supportedApps = [isWordpress()];

const isSupportedField = (el) => {
  if (!supportedApps.some(Boolean)) return false;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return false;
  if (el.closest(".monaco-editor")) return false;
  if (!getParentNode((n) => n.hasAttribute(inf_tokens_container), el)) return false;
  if (el.hasAttribute(inf_tokens_ignore)) return false;
  if (el.disabled || el.readOnly) return false;
  if (el instanceof HTMLInputElement && ["hidden","checkbox","radio","button","submit","reset","file","range","color"].includes(el.type)) return false;
  return true;
};

const getTokenBounds = (input) => {
  const caret = input.selectionStart;
  if (caret == null) return null;
  const value = input.value;
  const beforeCaret = value.slice(0, caret);
  const triggerStart = beforeCaret.lastIndexOf("{{");
  if (triggerStart === -1) return null;
  const afterOpen = triggerStart + 2;
  const rest = value.slice(afterOpen);
  const closeIdx = rest.indexOf("}}");
  if (closeIdx !== -1 && caret >= afterOpen + closeIdx + 2) return null;
  const triggerEnd = closeIdx !== -1 ? afterOpen + closeIdx + 2 : caret;
  const query = closeIdx !== -1 ? rest.slice(0, closeIdx) : rest;
  if (/[\s{]/.test(query)) return null;
  return { triggerStart, triggerEnd, query };
};

const setNativeValue = (input, value) => {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
};

export const WpTokenPickers = () => {
  const [show, setShow] = useRecoilState(showWpTokensPickerState);
  const { data: tokensRes, isPending: tokensLoading, isRefetching: tokensRefetch } = useWpTokens();

  const activeFieldRef = useRef(null);
  const virtuosoRef = useRef(null);
  const insertingRef = useRef(false);
  const headerRef = useRef(null); // 🔥 Direct DOM ref for header text (no re-render)

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search); // 🔥 React 18: defer list updates
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { refs, floatingStyles, update } = useFloating({
    open: show,
    onOpenChange: setShow,
    placement: "bottom-start",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // 🔥 Fuse.js index — built ONCE per fetch, reused for all searches
  const fuseIndex = useMemo(() => {
    if (!tokensRes?.success) return null;
    const all = Object.values(tokensRes.groups ?? {})
      .flatMap((g) => g?.tokens ?? [])
      .filter(Boolean);
    return new Fuse(all, {
      keys: ["key", "label", "type"],
      threshold: 0.3,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [tokensRes]);

  // 🔥 Search with deferred value — doesn't block typing
  const tokens = useMemo(() => {
    if (!fuseIndex) return [];
    if (!deferredSearch) return fuseIndex.getIndex().docs;
    return fuseIndex.search(deferredSearch).map((r) => r.item);
  }, [fuseIndex, deferredSearch]);

  // Close Select popovers
  useEffect(() => {
    if (show) window.dispatchEvent(new CustomEvent("inf-close-all-popovers"));
  }, [show]);

  // Auto-scroll Virtuoso
  useEffect(() => {
    if (virtuosoRef.current && show && tokens.length > 0) {
      virtuosoRef.current.scrollToIndex({ index: selectedIndex, align: "center", behavior: "auto" });
    }
  }, [selectedIndex, show, tokens.length]);

  const close = useCallback(() => {
    activeFieldRef.current = null;
    setShow(false);
    setSearch("");
    setSelectedIndex(0);
    if (headerRef.current) headerRef.current.textContent = "Search tokens...";
  }, [setShow]);

  // 🔥 Only update position ONCE when opening (not on every keystroke)
  const openAt = useCallback(
    (input) => {
      const caret = input.selectionStart ?? 0;
      const coords = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();
      refs.setPositionReference({
        getBoundingClientRect: () => {
          const x = rect.left + coords.left - input.scrollLeft;
          const y = rect.top + coords.top - input.scrollTop;
          const h = coords.height || 0;
          return { x, y, width: 1, height: h, top: y, left: x, right: x + 1, bottom: y + h };
        },
      });
      requestAnimationFrame(update);
    },
    [refs, update],
  );

  const updateAutocomplete = useCallback(
    (input) => {
      if (insertingRef.current) return;
      const bounds = getTokenBounds(input);
      if (!bounds) {
        close();
        return;
      }
      const wasClosed = !show;
      activeFieldRef.current = { element: input, ...bounds };

      // 🔥 Update header text DIRECTLY (no state, no re-render)
      if (headerRef.current) headerRef.current.textContent = bounds.query || "Search tokens...";

      setSearch(bounds.query);
      setSelectedIndex(0);

      if (wasClosed) {
        setShow(true);
        openAt(input);
      }
    },
    [close, setShow, show, openAt],
  );

  const chooseToken = useCallback(
    (tokenValue) => {
      const activeField = activeFieldRef.current;
      if (!activeField || insertingRef.current) return;
      const { element } = activeField;
      const bounds = getTokenBounds(element);
      if (!bounds) { close(); return; }

      insertingRef.current = true;
      const { triggerStart, triggerEnd } = bounds;
      const before = element.value.slice(0, triggerStart);
      const after = element.value.slice(triggerEnd);
      const insertedToken = `{{${tokenValue}}}`;
      const nextValue = before + insertedToken + after;
      const nextCaret = triggerStart + insertedToken.length;

      setNativeValue(element, nextValue);
      element.dispatchEvent(new Event("input", { bubbles: true }));

      requestAnimationFrame(() => {
        element.focus();
        element.setSelectionRange(nextCaret, nextCaret);
        insertingRef.current = false;
      });
      close();
    },
    [close],
  );

  useEffect(() => {
    const onInput = (e) => {
      const t = e.target;
      if (!isSupportedField(t) || t.closest("[data-wp-token-picker]")) return;
      updateAutocomplete(t);
    };
    const onClick = (e) => {
      const t = e.target;
      if (!isSupportedField(t) || activeFieldRef.current?.element !== t) return;
      updateAutocomplete(t);
    };
    const onFocusIn = (e) => {
      const t = e.target;
      if (!isSupportedField(t)) return;
      updateAutocomplete(t);
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [updateAutocomplete]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!show) return;
      const activeField = activeFieldRef.current;
      if (!activeField || e.target !== activeField.element) return;
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, tokens.length - 1)); break;
        case "ArrowUp": e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); break;
        case "Enter": case "Tab": {
          const token = tokens[selectedIndex];
          if (!token) return;
          e.preventDefault();
          chooseToken(token.key);
          break;
        }
        case "Escape": e.preventDefault(); close(); break;
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [show, tokens, selectedIndex, chooseToken, close]);

  useEffect(() => { setSelectedIndex(0); }, [deferredSearch]);

  if (!show) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{ ...floatingStyles, zIndex: 999999 }}
        data-wp-token-picker
        className="w-[320px] max-h-[350px] overflow-hidden rounded-lg border border-slate-600 bg-surface-tertiary shadow-2xl"
      >
        <header className="flex items-center justify-between gap-2 border-b border-slate-600 bg-surface-secondary px-3 py-2">
          <section className="flex items-center gap-2 min-w-0">
            <Icons.code width={16} height={16} strokeColor="#e2e8f0" />
            <span ref={headerRef} className="truncate text-sm text-slate-400">
              Search tokens...
            </span>
          </section>
          <section>
            <i className={`block ${(tokensLoading || tokensRefetch) && "animate-spin"}`}>
              <Icons.refresh width={15} height={15} />
            </i>
          </section>
        </header>

        <div className="h-[280px]">
          {tokensLoading && !tokens.length ? (
            <div className="flex h-full items-center justify-center"><Loader width={24} height={24} /></div>
          ) : tokens.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-sm text-slate-400">No tokens found</div>
          ) : (
            <Virtuoso
              ref={virtuosoRef}
              data={tokens}
              overscan={300}
              increaseViewportBy={{ top: 500, bottom: 500 }}
              components={{
                Item: (props) => <div className="flex flex-col my-2 px-2" {...props} />,
              }}
              itemContent={(index, token) => {
                const selected = index === selectedIndex;
                return (
                  <button
                    type="button"
                    data-tooltip-id="wp-token-tip"
                    data-tooltip-content={token.key}
                    onMouseDown={(e) => { e.preventDefault(); chooseToken(token.key); }}
                    className={`flex items-center justify-between w-full bg-surface-secondary rounded-lg gap-2 px-3 py-2 text-left transition-colors ${
                      selected ? "!bg-brand-primary !text-white" : "!text-text-primary hover:!bg-surface-main"
                    }`}
                  >
                    <div className="flex items-center gap-2 max-w-[70%] overflow-hidden text-ellipsis">
                      <Icons.code width={16} height={16} strokeColor="#e2e8f0" />
                      <span className="truncate">{token.key}</span>
                    </div>
                    <span className="text-slate-200 font-medium block p-2 bg-surface-main rounded-lg">{token.type}</span>
                  </button>
                );
              }}
            />
          )}
        </div>

        <Portal>
          <Tooltip id="wp-token-tip" place="bottom-end" positionStrategy="fixed" opacity={1} className="font-semibold z-[9999999!important]" />
        </Portal>
      </div>
    </FloatingPortal>
  );
};