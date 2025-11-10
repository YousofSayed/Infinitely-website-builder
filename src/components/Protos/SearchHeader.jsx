import React, { useRef } from "react";
import { Icons } from "../Icons/Icons";
import { Input } from "../Editor/Protos/Input";

export const SearchHeader = ({
  search = (value = "") => {},
  allowTimeout = true,
  timeout = 300,
}) => {
  const searchTimeout = useRef();
  return (
    <header className=" rounded-md flex overflow-hidden flex-shrink-0">
      <i className="w-[50px] flex justify-center items-center bg-slate-800">
        {Icons.search({ fill: "white" })}
      </i>
      <Input
      type="search"
        placeholder="Search..."
        className="bg-slate-800 w-full py-3 rounded-none focus:border-transparent"
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
