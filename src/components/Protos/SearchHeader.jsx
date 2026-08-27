import { Input } from "@/components/Editor/Protos/Input";
import { Icons } from "@/components/Icons/Icons";
import { addClickClass } from "@/helpers/cocktail";
import React, { useRef } from "react";
import { ShowIf } from "@/components/ShowIf";

export const SearchHeader = ({
  search = (value = "") => {},
  allowTimeout = true,
  timeout = 300,
  inputProps = {},
  iconProps = {},
  showReloadIcon = false,
  showReloadIconNotify = false,
  isReload = false,
  isNeedReload = false,
  onReload = () => {},
  ...props
}) => {
  const searchTimeout = useRef();
  return (
    <section
      {...props}
      className={`rounded-md flex relative  overflow-hidden shrink-0 ${props?.className || ""}`}
    >
      <i
        {...iconProps}
        className={`w-[50px] flex justify-center items-center bg-surface-tertiary ${iconProps?.className || ""}`}
      >
        {Icons.search({ fill: "white" })}
      </i>
      <Input
        // type="search"
        placeholder="Search..."
        onInput={(ev) => {
          if (allowTimeout) {
            searchTimeout.current && clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => {
              search(ev.target.value);
            }, timeout);
          } else {
            search(ev.target.value);
          }
        }}
        {...inputProps}
        className={`bg-surface-tertiary w-full py-3 rounded-none focus:border-transparent ${inputProps?.className || ""}`}
      />
      <ShowIf condition={showReloadIcon}>
        <i
          role="button"
          style={{
            opacity: isReload ? "1" : ".6",
            pointerEvents: isReload ? "auto" : "none",
          }}
          className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer block"
          onClick={async (e) => {
            addClickClass(e.currentTarget, "click");
            await onReload?.();
          }}
        >
          {/* 1. WRAPPER: Handles sizing, strokes, and the spinning animation */}
          <span
            className={`
            block [&_svg]:w-5 [&_svg]:h-5 [&_path]:stroke-[2.5px]
            ${isReload ? "animate-spin" : ""}
          `}
          >
            <Icons.refresh />
          </span>

          {/* 2. RED DOT: Stays outside the spinning wrapper so it stays pinned to the corner */}
          <ShowIf condition={isNeedReload && showReloadIconNotify}>
            <span className="block absolute -right-1 -top-1 w-3 h-3 bg-[crimson] rounded-full"></span>
          </ShowIf>
        </i>
      </ShowIf>
    </section>
  );
};
