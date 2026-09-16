/**
 * @file TokenPicker.jsx
 * @description A highly optimized, generic, and reusable base component for 
 * autocomplete/token picking in input and textarea fields. It handles floating 
 * UI positioning, caret coordinate calculations, keyboard navigation, generic 
 * token insertion logic, app-wide event broadcasting, and global tooltip rendering.
 * 
 * @module TokenPicker
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
} from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  FloatingPortal,
} from "@floating-ui/react";
import getCaretCoordinates from "textarea-caret";
import { Virtuoso } from "react-virtuoso";
import Fuse from "fuse.js";
import Portal from "@/components/Editor/Portal";
import { Tooltip } from "react-tooltip";

export const defaultIsSupportedField = (el) => {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement))
    return false;
  if (el.closest(".monaco-editor")) return false; 
  if (el.disabled || el.readOnly) return false;
  if (
    el instanceof HTMLInputElement &&
    [
      "hidden",
      "checkbox",
      "radio",
      "button",
      "submit",
      "reset",
      "file",
      "range",
      "color",
    ].includes(el.type)
  ) {
    return false;
  }
  return true;
};

const setNativeValue = (input, value) => {
  const proto =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(input, value);
  else input.value = value;
};

const getTokenBounds = (input, pairs) => {
  const caret = input.selectionStart;
  if (caret == null) return null;
  const value = input.value;
  const beforeCaret = value.slice(0, caret);

  let bestMatch = null;

  for (const pair of pairs) {
    let searchFrom = beforeCaret.length;
    while (searchFrom >= 0) {
      const startIdx = beforeCaret.lastIndexOf(pair.start, searchFrom);
      if (startIdx === -1) break;

      const afterStartIdx = startIdx + pair.start.length;
      const rest = value.slice(afterStartIdx);

      // 🚨 FIX: If ender is empty, there is no closing tag (e.g., CSS variables, @mentions).
      // We just take everything from the starter up to the caret as the query.
      if (pair.end === "") {
        const query = rest.slice(0, caret - afterStartIdx);
        if (!bestMatch || startIdx > bestMatch.triggerStart) {
          bestMatch = { triggerStart: startIdx, triggerEnd: caret, query, pair };
        }
        break; 
      }

      const closeIdx = rest.indexOf(pair.end);

      if (closeIdx !== -1) {
        const absoluteCloseIdx = afterStartIdx + closeIdx + pair.end.length;
        if (caret >= absoluteCloseIdx) {
          searchFrom = startIdx - 1;
          continue;
        }
        const query = rest.slice(0, closeIdx);
        if (!bestMatch || startIdx > bestMatch.triggerStart) {
          bestMatch = { triggerStart: startIdx, triggerEnd: absoluteCloseIdx, query, pair };
        }
        break;
      } else {
        const query = rest.slice(0, caret - afterStartIdx);
        if (!bestMatch || startIdx > bestMatch.triggerStart) {
          bestMatch = { triggerStart: startIdx, triggerEnd: caret, query, pair };
        }
        break;
      }
    }
  }

  if (!bestMatch) return null;
  if (/[\s]/.test(bestMatch.query)) return null;

  return bestMatch;
};

/**
 * @typedef {Object} TokenPickerProps
 * @property {boolean} [isOpen] - External control for open state.
 * @property {(open: boolean) => void} [onOpenChange] - Callback when open state changes.
 * @property {string | string[]} [starter] - Trigger start string(s). e.g., "{{" or "--".
 * @property {string | string[]} [ender] - Trigger end string(s). e.g., "}}" or "" (empty for prefix-only).
 * @property {string | ((value: string) => string)} [prefix] - Format inserted value. e.g., "var(${token})".
 * @property {any[] | string[] | number[]} items - List of items to search.
 * @property {boolean} [isLoading] - Loading state.
 * @property {boolean} [isRefetching] - Refetching state.
 * @property {string[]} [searchKeys] - Keys to search in Fuse.js.
 * @property {(el: HTMLElement) => boolean} [isSupportedField] - Function to check if field is supported.
 * @property {(item: any) => string} [extractValue] - Function to extract value from item.
 * @property {(item: any, index: number, isSelected: boolean) => import('react').ReactNode} [renderItem] - Function to render item.
 * @property {(item: any) => string} [getItemId] - Function to get item id.
 * @property {import('react').ReactNode} [emptyState] - Empty state component.
 * @property {string} [placeholder] - Placeholder text.
 * @property {import('react').ReactNode} [headerIcon] - Header icon.
 * @property {import('react').ReactNode} [refreshIcon] - Refresh icon.
 */

export const TokenPicker = ({
  isOpen,
  onOpenChange,
  starter = "{{",
  ender = "}}",
  prefix,
  items,
  isLoading = false,
  isRefetching = false,
  searchKeys = ["key", "label", "value"],
  isSupportedField = defaultIsSupportedField,
  extractValue,
  renderItem,
  getItemId,
  emptyState,
  placeholder = "Search...",
  headerIcon,
  refreshIcon,
}) => {
  const [internalShow, setInternalShow] = useState(false);
  const show = isOpen !== undefined ? isOpen : internalShow;

  const setShow = useCallback(
    (val) => {
      if (isOpen === undefined) setInternalShow(val);
      onOpenChange?.(val);
    },
    [isOpen, onOpenChange],
  );

  const activeFieldRef = useRef(null);
  const virtuosoRef = useRef(null);
  const insertingRef = useRef(false);
  const headerRef = useRef(null);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { refs, floatingStyles, update } = useFloating({
    open: show,
    onOpenChange: setShow,
    placement: "bottom-start",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const pairs = useMemo(() => {
    const starters = typeof starter === "string" ? starter.split("|") : starter;
    const enders = typeof ender === "string" ? ender.split("|") : ender;
    const maxLen = Math.max(starters.length, enders.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      result.push({
        start: starters[i] || starters[0],
        end: enders[i] || enders[0],
      });
    }
    return result;
  }, [starter, ender]);

  const fuseIndex = useMemo(() => {
    if (!items || items.length === 0) return null;
    const isPrimitiveList = typeof items[0] === "string" || typeof items[0] === "number";

    return new Fuse(items, {
      keys: isPrimitiveList ? [] : searchKeys,
      threshold: 0.4,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 1,
      useExtendedSearch: false,
      includeMatches: true,
      tokenize: true,
      matchAllTokens: false,
    });
  }, [items, searchKeys]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!deferredSearch) return items;
    if (!fuseIndex) return [];
    return fuseIndex.search(deferredSearch).map((r) => r.item);
  }, [fuseIndex, deferredSearch, items]);

  const safeExtractValue = useCallback(
    (item) => {
      if (extractValue) return extractValue(item);
      if (typeof item === "string" || typeof item === "number") return String(item);
      return item?.key || item?.value || String(item);
    },
    [extractValue],
  );

  const safeRenderItem = useCallback(
    (item, index, isSelected) => {
      if (renderItem) return renderItem(item, index, isSelected);
      const displayText =
        typeof item === "string" || typeof item === "number"
          ? item
          : item?.label || item?.key || String(item);
      return (
        <div
          data-tooltip-id="token-picker-tooltip"
          data-tooltip-content={displayText}
          className={`px-3 py-2 rounded-lg transition-colors ${isSelected ? "!bg-brand-primary !text-white" : "!text-text-primary hover:!bg-surface-main"}`}
        >
          {displayText}
        </div>
      );
    },
    [renderItem],
  );

  const close = useCallback(() => {
    activeFieldRef.current = null;
    setShow(false);
    setSearch("");
    setSelectedIndex(0);
    if (headerRef.current) headerRef.current.textContent = placeholder;
  }, [placeholder, setShow]);

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
      const bounds = getTokenBounds(input, pairs);
      if (!bounds) {
        close();
        return;
      }
      const wasClosed = !show;
      activeFieldRef.current = { element: input, ...bounds };

      if (headerRef.current) headerRef.current.textContent = bounds.query || placeholder;

      setSearch(bounds.query);
      setSelectedIndex(0);

      if (wasClosed) {
        setShow(true);
        openAt(input);
      }
    },
    [close, show, openAt, pairs, placeholder, setShow],
  );

  const chooseToken = useCallback(
    (tokenValue) => {
      const activeField = activeFieldRef.current;
      if (!activeField || insertingRef.current) return;
      const { element } = activeField;
      const bounds = getTokenBounds(element, pairs);
      if (!bounds) {
        close();
        return;
      }

      insertingRef.current = true;
      const { triggerStart, triggerEnd } = bounds;
      const before = element.value.slice(0, triggerStart);
      const after = element.value.slice(triggerEnd);

      let insertedToken = tokenValue;
      if (typeof prefix === "function") {
        insertedToken = prefix(tokenValue);
      } else if (typeof prefix === "string") {
        insertedToken = prefix.replace(/\$\{.*?\}/g, tokenValue);
      }

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
    [close, pairs, prefix],
  );

  useEffect(() => {
    if (show) window.dispatchEvent(new CustomEvent("inf-close-all-popovers"));
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!show) return;
      const floatingEl = refs.floating.current;
      const activeEl = activeFieldRef.current?.element;

      if (floatingEl && !floatingEl.contains(e.target) && activeEl && !activeEl.contains(e.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, close, refs.floating]);

  useEffect(() => {
    const onInput = (e) => {
      const t = e.target;
      if (!isSupportedField(t) || t.closest("[data-token-picker-popup]")) return;
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
  }, [updateAutocomplete, isSupportedField]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!show) return;
      const activeField = activeFieldRef.current;
      if (!activeField || e.target !== activeField.element) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
        case "Tab": {
          const token = filteredItems[selectedIndex];
          if (!token) return;
          e.preventDefault();
          chooseToken(safeExtractValue(token));
          break;
        }
        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [show, filteredItems, selectedIndex, chooseToken, close, safeExtractValue]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [deferredSearch]);

  useEffect(() => {
    if (virtuosoRef.current && show && filteredItems.length > 0) {
      virtuosoRef.current.scrollToIndex({ index: selectedIndex, align: "center", behavior: "auto" });
    }
  }, [selectedIndex, show, filteredItems.length]);

  if (!show) return null;

  return (
    <>
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, zIndex: 999999 }}
          data-token-picker-popup
          className="w-[320px] max-h-[350px] overflow-hidden rounded-lg border border-slate-600 bg-surface-tertiary shadow-2xl"
        >
          <header className="flex items-center justify-between gap-2 border-b border-slate-600 bg-surface-secondary px-3 py-2">
            <section className="flex items-center gap-2 min-w-0">
              {headerIcon}
              <span ref={headerRef} className="truncate text-sm text-slate-400">
                {placeholder}
              </span>
            </section>
            {refreshIcon && (
              <section>
                <i className={`block ${(isLoading || isRefetching) && "animate-spin"}`}>
                  {refreshIcon}
                </i>
              </section>
            )}
          </header>

          <div className="h-[280px]">
            {isLoading && filteredItems.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-sm text-slate-400">
                {emptyState || "No tokens found"}
              </div>
            ) : (
              <Virtuoso
                ref={virtuosoRef}
                data={filteredItems}
                overscan={300}
                increaseViewportBy={{ top: 500, bottom: 500 }}
                components={{
                  Item: (props) => <div className="flex flex-col my-2 px-2" {...props} />,
                }}
                itemContent={(index, item) => {
                  const selected = index === selectedIndex;
                  return (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        chooseToken(safeExtractValue(item));
                      }}
                      className="w-full text-left"
                    >
                      {safeRenderItem(item, index, selected)}
                    </button>
                  );
                }}
              />
            )}
          </div>
        </div>
      </FloatingPortal>

      <Portal>
        <Tooltip
          id="token-picker-tooltip"
          place="bottom-end"
          positionStrategy="fixed"
          opacity={1}
          className="font-semibold z-[9999999!important]"
        />
      </Portal>
    </>
  );
};