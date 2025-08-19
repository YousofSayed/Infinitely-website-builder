import React, { memo, useEffect, useState } from "react";
import { Select } from "./Select";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Input } from "./Input";
import { filterTypes, filterUnits } from "../../../constants/cssProps";
import { Adder } from "./Adder";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { pushBetween } from "../../../helpers/cocktail";
import { useRemoveCssProp } from "../../../hooks/useRemoveCssProp";
import { useEditorMaybe } from "@grapesjs/react";
import { Textarea } from "./Textarea";
import { FitTitle } from "./FitTitle";

export const MultiFunctionProp = memo(
  ({ cssProp, placeholder, keywords, units = {} }) => {
    const editor = useEditorMaybe();
    const [filters, setFilters] = useState([]);
    const [filter, setFilter] = useState("");
    const [updatedVal, setUpdatedValue] = useState("");
    const setClass = useSetClassForCurrentEl();
    const removeProp = useRemoveCssProp();

    const stringifyFilter = (filtersVals = []) => {
      const value = filtersVals
        .map(
          ({ name, value }) => `${name}(${value}${units?.[name] ?  units[name] : ''})`
        )
        .join(" ");

      return value;
    };

    const parseFilters = (stringValue = "") => {
      if(!stringValue) return [];
      // console.log(stringValue, "dsadasdsa");
      // console.log(
      //   editor.Parser.parserCss.parse(stringValue),
      //   "parsed form editor"
      // );
      // console.log(stringValue
      //   .match(/(\w+\([^()]*\))/g));
      
      const value = stringValue
        .match(/(\w+\((?:[^()]+|\([^()]*\))*\))/g)
        .filter(Boolean)
        .map((prop) => {
          const vals = prop.split(/\(|\)/gi);
          return {
            name: vals[0],
            value: vals[1].split(filterUnits[vals[0]]).join(""),
          };
        });
      return value;
    };

    const setPropVal = (propValue, index) => {
      const newArr = [...filters];
      newArr[index].value = propValue;
      console.log(stringifyFilter(newArr));
      console.log(propValue , newArr , cssProp);
      
      setClass({
        cssProp,
        value: stringifyFilter(newArr),
      });
      setFilters(newArr);
    };

    const addProp = (filterProp) => {
      if (!filterProp) return;
      setFilter("");
      setFilters([...filters, { name: filterProp, value: "" }]);
    };

    const addPropBetween = (filterProp, index) => {
      const newArr = pushBetween({
        arr: filters,
        oldContent: filters[index],
        content: { name: filterProp, value: "" },
      });
      setFilters(newArr);
    };

    const deleteProp = (index) => {
      const newArr = filters.filter((prop, i) => i != index);
      // !newArr.length && removeProp({ cssProp });
      setClass({
        cssProp,
        value: stringifyFilter(newArr),
      });
      setFilters(newArr);
    };

    useUpdateInputValue({
      cssProp,
      setVal: setUpdatedValue,
      onEffect(prop, value) {
        console.log(parseFilters(value), value, "parsed");

        setFilters(parseFilters(value));
      },
    });

    return (
      <section className=" flex flex-col p-1 bg-slate-900 rounded-lg">
        <section className="flex gap-2">
          <Select
            placeholder={placeholder}
            keywords={keywords}
            value={filter}
            onInput={(value) => {
              setFilter(value);
            }}
            onEnterPress={(value) => {
              console.log("mt : ", value);

              // setFilter("");
              addProp(value);
            }}
            onItemClicked={(value) => {
              console.log("mt : ", value);

              // setFilter("");
              addProp(value);
            }}
          />
          <SmallButton
            className="flex-shrink-0 bg-slate-800"
            title={placeholder}
            onClick={(ev) => {
              setFilter("");
              addProp(filter);
            }}
          >
            {Icons.plus("white")}
          </SmallButton>
        </section>

        {!!filters.length && (
          <main className=" rounded-lg flex flex-col gap-[40px] mt-2  ">
            {filters.map((filterProp, i) => {
              return (
                <Adder
                  key={i}
                  className=" bg-slate-800 relative minion"
                  addClassName="bg-slate-900 h-[42px] w-[50px] flex-shrink-0"
                  delClassName="bg-slate-900 h-[42px] w-[50px] flex-shrink-0"
                  inputClassName="p-[unset] px-[unset]  py-1 bg-slate-900"
                  placeholder="New Prop"
                  showSelectMenu={true}
                  keywords={keywords}
                  value={filter}
                  setVal={setFilter}
                  onAllForSelect={(value) => {
                    setFilter(value);
                  }}
                  onAddClick={(ev) => {
                    addPropBetween(filter, i);
                    setFilter("");
                  }}
                  onDeleteClick={(ev) => {
                    deleteProp(i);
                  }}
                >
                  <section key={i} className="flex flex-col   gap-2">
                    <FitTitle className="capitalize">
                      {filterProp.name}
                    </FitTitle>
                    {/* <p className="font-semibold capitalize border-l-[3px] border-blue-600 bg-slate-900 py-2 px-3 rounded-lg text-slate-200 flex-grow flex-shrink-0">
                      {filterProp.name} :
                    </p> */}
                    <section className="flex  h-[40px] w-full">
                      {filterProp.name &&
                      filterProp.name.toLowerCase() == "url" ? (
                        <Textarea
                          className={`bg-slate-900 w-full  ${
                            !filterUnits[filterProp.name]
                              ? "rounded-lg"
                              : "rounded-tr-none  rounded-br-none"
                          }`}
                          placeholder={filterProp.name}
                          value={filterProp.value}
                          onInput={(ev) => {
                            setPropVal(ev.target.value, i);
                          }}
                        />
                      ) : (
                        <Input
                          className={`bg-slate-900 w-full  focus:border-none ${
                            !filterUnits[filterProp.name]
                              ? "rounded-lg"
                              : "rounded-tr-none  rounded-br-none"
                          }`}
                          placeholder={filterProp.name}
                          value={filterProp.value}
                          onInput={(ev) => {
                            setPropVal(ev.target.value, i);
                          }}
                        />
                      )}

                      {!!(
                        Object.keys(units).length &&
                        filterUnits[filterProp.name]
                      ) && (
                        <p className="w-[40px] font-bold  flex flex-shrink-0 rounded-tl-none rounded-bl-none items-center justify-center text-slate-200 bg-slate-900 h-[100%] rounded-lg">
                          {filterUnits[filterProp.name]}
                        </p>
                      )}
                    </section>
                  </section>
                </Adder>
              );
            })}
          </main>
        )}
      </section>
    );
  }
);
