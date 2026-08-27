import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  FloatingPortal,
} from "@floating-ui/react";
import getCaretCoordinates from "textarea-caret";

import { useWpTokens } from "@/queries/wp.queries";
import { showWpTokensPickerState } from "@/helpers/atoms";
import { Virtuoso } from "react-virtuoso";
import { Loader } from "@/components/Loader";
import { Icons } from "@/components/Icons/Icons";
import {
  advancedSearchSuggestions,
  getParentNode,
  isWordpress,
} from "@/helpers/functions";
import { inf_tokens_container, inf_tokens_ignore } from "@/constants/shared";
import Portal from "@/components/Editor/Portal";
import { Tooltip } from "react-tooltip";
const supportedApps = [isWordpress()];
const isSupportedField = (element) => {
  if (!supportedApps.some(Boolean)) return false;

  if (
    !(
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    )
  ) {
    return false;
  }

  // 🛑 CRITICAL: Ignore Monaco Editor's internal textarea to prevent conflicts
  if (element.closest(".monaco-editor")) {
    return false;
  }

  // 🛑 CRITICAL: Ignore another unsupported inputs
  const parentNode = getParentNode(
    (el) => el.hasAttribute(inf_tokens_container),
    element,
  );

  if (!parentNode) return false;

  // 🛑 CRITICAL: Ignore another unsupported inputs
  if (element.hasAttribute(inf_tokens_ignore)) return false;

  if (element.disabled || element.readOnly) {
    return false;
  }

  if (
    element instanceof HTMLInputElement &&
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
    ].includes(element.type)
  ) {
    return false;
  }

  return true;
};

const findTokenQuery = (input) => {
  const caret = input.selectionStart;
  if (caret === null) return null;

  const beforeCaret = input.value.slice(0, caret);
  const triggerStart = beforeCaret.lastIndexOf("{{");

  if (triggerStart === -1) return null;

  const query = beforeCaret.slice(triggerStart + 2);

  if (/[\s{}]/.test(query)) return null;

  return { triggerStart, triggerEnd: caret, query };
};

const setNativeValue = (input, value) => {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (setter) {
    setter.call(input, value);
  } else {
    input.value = value;
  }
};

export const WpTokenPickers = () => {
  const [show, setShow] = useRecoilState(showWpTokensPickerState);
  const {
    data: tokensRes,
    isPending: tokensLoading,
    isRefetching: tokensRefetch,
  } = useWpTokens();

  const activeFieldRef = useRef(null);
  const virtuosoRef = useRef(null); // ✅ Added for auto-scroll

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { refs, floatingStyles, update } = useFloating({
    open: show,
    onOpenChange: setShow,
    placement: "bottom-start",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const [tokens, setTokens] = useState([]);
  const timeout = useRef(null);

  // const tokens =
  useMemo(() => {
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      if (!tokensRes?.success) {
        return;
      }
      const normalizedSearch = search.toLowerCase();
      const tokens = Object.values(tokensRes.groups ?? {})
        .flatMap((group) => group?.tokens ?? [])
        .flat()
        .filter(Boolean);

      const searchTokens = advancedSearchSuggestions(
        tokens,
        normalizedSearch,
        false,
        ["key", "lable", "type"],
      );

      setTokens(searchTokens);
      return searchTokens;
    }, 70);
    // return
    //   .filter((token) => token.key.toLowerCase().includes(normalizedSearch));
  }, [tokensRes, search]);

  // ✅ Auto-scroll Virtuoso when selection changes
  useEffect(() => {
    if (virtuosoRef.current && show && tokens.length > 0) {
      requestAnimationFrame(() => {
        virtuosoRef.current?.scrollToIndex({
          index: selectedIndex,
          align: "center",
          behavior: "smooth",
        });
      });
    }
  }, [selectedIndex, show, tokens.length]);

  const close = useCallback(() => {
    activeFieldRef.current = null;
    setShow(false);
    setSearch("");
    setSelectedIndex(0);
  }, [setShow]);

  const updatePosition = useCallback(
    (input) => {
      const caret = input.selectionStart ?? 0;
      const coordinates = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();

      refs.setPositionReference({
        getBoundingClientRect() {
          const x = rect.left + coordinates.left - input.scrollLeft;
          const y = rect.top + coordinates.top - input.scrollTop;
          const height = coordinates.height || 0;

          return {
            x,
            y,
            width: 1,
            height,
            top: y,
            left: x,
            right: x + 1,
            bottom: y + height,
          };
        },
      });

      requestAnimationFrame(update);
    },
    [refs, update],
  );

  const updateAutocomplete = useCallback(
    (input) => {
      const tokenQuery = findTokenQuery(input);
      if (!tokenQuery) {
        close();
        return;
      }

      activeFieldRef.current = { element: input, ...tokenQuery };
      setSearch(tokenQuery.query);
      setSelectedIndex(0);
      setShow(true);
      updatePosition(input);
    },
    [close, setShow, updatePosition],
  );

  const chooseToken = useCallback(
    (tokenValue) => {
      const activeField = activeFieldRef.current;
      if (!activeField) return;

      const { element, triggerStart, triggerEnd } = activeField;
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
      });

      close();
    },
    [close],
  );

  useEffect(() => {
    const onInput = (event) => {
      const target = event.target;
      if (!isSupportedField(target)) return;
      if (target.closest("[data-wp-token-picker]")) return;
      updateAutocomplete(target);
    };

    const onClick = (event) => {
      const target = event.target;
      if (!isSupportedField(target)) return;
      if (activeFieldRef.current?.element !== target) return;
      updateAutocomplete(target);
    };

    const onFocusIn = (event) => {
      const target = event.target;
      if (!isSupportedField(target)) return;
      updateAutocomplete(target);
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
    const onKeyDown = (event) => {
      if (!show) return;
      const activeField = activeFieldRef.current;
      if (!activeField || event.target !== activeField.element) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, tokens.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
        case "Tab":
          const token = tokens[selectedIndex];
          if (!token) return;
          event.preventDefault();
          chooseToken(token.key);
          break;
        case "Escape":
          event.preventDefault();
          close();
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [show, tokens, selectedIndex, chooseToken, close]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

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
          <section className="flex items-center gap-2">
            <Icons.code width={16} height={16} strokeColor="#e2e8f0" />
            <span className="truncate text-sm text-slate-400">
              {search || "Search tokens..."}
            </span>
          </section>

          <section>
            <i
              className={`block ${(tokensLoading || tokensRefetch) && "animate-spin"}`}
            >
              <Icons.refresh width={15} height={15} />
            </i>
          </section>
        </header>

        <div className="h-[280px]">
          {/* {tokensLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader width={24} height={24} />
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-sm text-slate-400">
              No tokens found
            </div>
          ) : ( */}
          <Virtuoso
            ref={virtuosoRef} // ✅ Attached ref
            data={tokens}
            components={{
              Item: (props) => (
                <div className="flex flex-col my-2 px-2 " {...props}></div>
              ),
            }}
            itemContent={(index, token) => {
              const selected = index === selectedIndex;
              return (
                <button
                  tooltip-id={`${index}-${token.key}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    chooseToken(token.key);
                  }}
                  className={` flex items-center justify-between w-full  bg-surface-secondary rounded-lg   gap-2 px-3 py-2 text-left transition-colors ${
                    selected
                      ? "!bg-brand-primary !text-white"
                      : "!text-text-primary hover:!bg-surface-main"
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[70%] overflow-hidden text-ellipsis">
                    <Icons.code width={16} height={16} strokeColor="#e2e8f0" />
                    <span className="truncate">{token.key}</span>{" "}
                  </div>
                  <span className="text-slate-200 font-medium block p-2 bg-surface-main rounded-lg">
                    {token.type}
                  </span>

                  <Portal>
                    <Tooltip
                      anchorSelect={`[tooltip-id="${index}-${token.key}"]`}
                      place="bottom-end"
                      positionStrategy="fixed"
                      opacity={1}
                      className={` font-semibold z-[9999999!important]  `}
                    >
                      {token.key}
                    </Tooltip>
                  </Portal>
                </button>
              );
            }}
          />
          {/* )} */}
        </div>
      </div>
    </FloatingPortal>
  );
};
