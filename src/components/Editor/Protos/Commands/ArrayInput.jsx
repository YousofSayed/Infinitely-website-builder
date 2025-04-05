import React, { useEffect, useState } from "react";
import { Input } from "../Input";
import { SmallButton } from "../SmallButton";
import { Icons } from "../../../Icons/Icons";
import { Choices } from "../Choices";
import { Select } from "../Select";
import { hsZoo } from "../../../../constants/hsValues";

export const ArrayInput = ({
  array,
  value = "",
  placeholder,
  onInput = (value) => {},
  onAddClick = (ev, value) => {},
  onCloseClick = (ev, keyword, index) => {},
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value || "");
  }, [value]);

  return (
    <main className="flex flex-col gap-2">
      <header className="flex gap-2">
        <Select
          className="bg-slate-900"
          placeholder={placeholder}
          value={val}
          isTextarea
          ignoreCurlyBrackets
          replaceLastWorld
          // respectParenthesis
          keywords={hsZoo}
          onInput={(value) => {
            onInput(value);
            setVal(value);
          }}
          onItemClicked={(value) => {
            // onInput(value);
            // setVal(value);
            onAddClick(undefined, value);
          }}
          onEnterPress={(value) => {
            // onInput(value);
            // setVal(value);
            onAddClick(undefined, value);
          }}
        />
        <SmallButton
          className="shadow-[unset] bg-slate-900"
          onClick={(ev) => {
            setVal("");
            onAddClick(ev, val);
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </header>
      {array.length ? (
        <section>
          <Choices
            className={`flex-wrap   ${
              array.length ? "bg-slate-900 px-2" : "px-[unset]"
            }`}
            onCloseClick={onCloseClick}
            keywords={array}
          />
        </section>
      ) : null}
    </main>
  );
};
