import React, { useState } from "react";
import { FitTitle } from "../Editor/Protos/FitTitle";
import { cloneDeep, isArray, isBoolean, isPlainObject } from "lodash";
import { Accordion } from "./Accordion";
import { AccordionItem } from "./AccordionItem";
import { editNestedObject, getNestedValue, removeNestedKey } from "../../helpers/bridge";
import { parseAndReturnInputIfNot } from "../../helpers/cocktail";
import { Select } from "../Editor/Protos/Select";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { Input } from "postcss";
import { Icons } from "../Icons/Icons";

export const AddNestedProps = ({
  object = {},
  setObject = () => {},
  destination = [],
  secondDestination = [],
  className,
  keywords = [],
  placeholder = "",
}) => {
  const [value, setValue] = useState("");
  const [animatedRef] = useAutoAnimate();
  const [parentAnimatedRef] = useAutoAnimate();
  const addProp = (prop) => {
    const clone = cloneDeep(object);
    const editeable = editNestedObject(clone, destination.concat(prop), "");
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(clone, secondDestination.concat(prop), "")
      : {};
    setObject(clone);
  };

  const editeProp = (prop, value) => {
    const clone = cloneDeep(object);
    const editeable = editNestedObject(clone, destination.concat(prop), value);
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(
          clone,
          secondDestination.concat(prop),
          parseAndReturnInputIfNot(value)
        )
      : {};

    setObject(clone);
  };

  const removeProp = (prop, objKey) => {
    const clone = cloneDeep(animation);
    const editeable = removeNestedKey(clone, destination.concat(prop));
    const secondEditeable = isArray(secondDestination)
      ? removeNestedKey(clone, secondDestination.concat(prop))
      : {};

    setObject(clone);
  };

  return (
    <section className="flex flex-col  " ref={parentAnimatedRef}>
      <section
        className={`${className} flex  gap-2  sticky top-0 bg-slate-950 ${
          Object.keys(getNestedValue(object, destination) || {})?.length
            ? "rounded-tl-lg rounded-tr-lg"
            : "rounded-lg"
        }`}
      >
        <Select
          className="p-[unset]"
          inputClassName="bg-slate-800"
          containerClassName="bg-slate-800"
          placeholder={placeholder || "Select Prop"}
          keywords={keywords}
          value={value}
          onInput={(value) => setValue(value)}
          onEnterPress={(value) => {
            addProp(value);
          }}
          onItemClicked={(value) => {
            addProp(value);
          }}
        />
        <SmallButton
          className="w-[40px!important] bg-slate-800"
          onClick={() => {
            addProp(value);
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {!!Object.entries(getNestedValue(object, destination) || {}).length && (
        <section
          ref={animatedRef}
          className=" flex flex-col gap-2 p-1 bg-slate-950 rounded-bl-md rounded-br-md"
        >
          {Object.entries(getNestedValue(object, destination) || {}).map(
            ([key, value], index) => {
              return (
                <section
                  key={index}
                  className="relative flex flex-col gap-2  mt-3"
                >
                  <FitTitle className="capitalize">{key}</FitTitle>

                  <section className="flex  gap-2">
                    <Input
                      placeholder={key}
                      className="bg-slate-800 w-full"
                      value={value}
                      onInput={(ev) => {
                        editeProp(key, ev.target.value);
                      }}
                    />
                    <SmallButton
                      onClick={(ev) => {
                        removeProp(key);
                      }}
                    >
                      {Icons.trash("white")}
                    </SmallButton>
                  </section>
                </section>
              );
            }
          )}
        </section>
      )}
    </section>
  );
};

export const NestedObject = ({
  object = {},
  setObject = (object = {}) => {},
  destination = [],
  secondDestination = [],
}) => {
  const addValue = (value, prop) => {
    console.log("from destoooo : ", destination.concat(prop));
    console.log(
      "from destoooo one and second: ",
      destination.concat(prop),
      secondDestination?.concat?.(prop)
    );

    const clone = cloneDeep(object);
    const editeable = editNestedObject(
      clone,
      destination.concat(prop),
      parseValue(value)
    );
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(
          clone,
          secondDestination.concat(prop),
          parseValue(value)
        )
      : {};

    const editableValue = getNestedValue(editeable, destination.concat(prop));
    const secondEditableValue = isArray(secondDestination)
      ? getNestedValue(secondEditeable, secondDestination.concat(prop))
      : null;
    if (!editableValue && !isBoolean(editableValue)) {
      removeNestedKey(editeable, destination.concat(prop));
    }

    if (
      isArray(secondDestination) &&
      !secondEditableValue &&
      !isBoolean(secondEditableValue)
    ) {
      removeNestedKey(secondEditeable, secondDestination.concat(prop));
    }

    console.log(
      "from after set first and second nested : ",
      editeable,
      secondEditeable
    );

  setObject(clone)
  };

  return (
    <section className="flex flex-col gap-2 p-1 bg-slate-950 rounded-lg">
      {Object.entries(object).map(([key, value], index) => {
        return (
          <section key={index} className="relative flex flex-col gap-2  ">
            <FitTitle
              className={`capitalize font-semibold text-slate-200 text-ellipsis overflow-hidden max-w-full`}
            >
              {key}
            </FitTitle>
            {isPlainObject(value) && !value._custom ? (
              <Accordion
              // variant="shadow"
              // itemClasses={{
              //   trigger: "flex items-center justify-between ",
              //   base: "bg-slate-800 p-3  rounded-lg text-slate-200 font-semibold relative",
              //   content: `bg-slate-900 p-[unset!important] mt-2 rounded-md`,
              //   title: `capitalize custom-font-size`,
              //   indicator: `text-[18px] transition-all`,
              // }}
              >
                <AccordionItem title={key}>
                  <NestedObject
                    object={value}
                    setObject={setObject}
                    destination={[...destination, key]}
                    secondDestination={
                      secondDestination && isArray(secondDestination)
                        ? [...secondDestination, key]
                        : null
                    }
                  />
                </AccordionItem>
              </Accordion>
            ) : isPlainObject(value) &&
              value._custom &&
              value._type == "choose" ? (
              <>
                {/* <FitTitle className={`capitalize font-semibold`}>
                    {key}
                  </FitTitle> */}
                <AddNestedProps
                  destination={[...destination, key]}
                  secondDestination={
                    isArray(secondDestination)
                      ? [...secondDestination, key]
                      : null
                  }
                  object={object}
                  setObject={setObject}
                  keywords={value._keys}
                />
              </>
            ) : isArray(value) ? (
              <Select
                placeholder={key}
                value={
                  isPlainObject(
                    getNestedValue(animation, [...destination, key])
                  )
                    ? ""
                    : getNestedValue(animation, [...destination, key])
                }
                keywords={value}
                onAll={(value) => {
                  console.log(
                    "from select : ",
                    [...destination, key],
                    getNestedValue(animation, [...destination, key])
                  );

                  addValue(value, key);
                }}
              />
            ) : key.startsWith("on") && /on[A-Z]/gi.test(key) ? (
              <Select
                placeholder={key}
                isCode
                allowCmdsContext
                value={getNestedValue(animation, [...destination, key])}
                codeProps={{
                  language: "javascript",
                  value: getNestedValue(animation, [...destination, key]),
                  onChange: (value) => {
                    addValue(value, key);
                  },
                }}
              />
            ) : isString(value) ? (
              <Input
                placeholder={key}
                value={
                  isPlainObject(
                    getNestedValue(animation, [...destination, key])
                  )
                    ? ""
                    : getNestedValue(animation, [...destination, key])
                }
                className="bg-slate-900 w-full border-[4px]  border-[#1e293b!important]"
                onInput={(ev) => {
                  addValue(ev.target.value, key);
                }}
              />
            ) : null}
          </section>
        );
      })}
    </section>
  );
};
