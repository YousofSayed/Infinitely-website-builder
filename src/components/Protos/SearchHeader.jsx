import { Input } from "@/components/Editor/Protos/Input";
import { Icons } from "@/components/Icons/Icons";
import React, { useRef } from "react";

export const SearchHeader = ({
  search = (value = "") => {},
  allowTimeout = true,
  timeout = 300,
}) => {
  const searchTimeout = useRef();
  return (
    <header className=" rounded-md flex overflow-hidden flex-shrink-0">
      <i className="w-[50px] flex justify-center items-center bg-surface-tertiary">
        {Icons.search({ fill: "white" })}
      </i>
      <Input
      type="search"
        placeholder="Search..."
        className="bg-surface-tertiary w-full py-3 rounded-none focus:border-transparent"
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
      />
    </header>
  );
};
