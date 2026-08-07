import { editNestedObject, getNestedValue, removeNestedKey } from "@/helpers/bridge";
import { parseAndReturnInputIfNot } from "@/helpers/cocktail";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cloneDeep, isArray, isBoolean, isPlainObject } from "lodash";
import { Input } from "postcss";
import React, { useState } from "react";

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
        className={`${className} flex  gap-2  sticky top-0 bg-surface-main ${
          Object.keys(getNestedValue(object, destination) || {})?.length
            ? "rounded-tl-lg rounded-tr-lg"
            : "rounded-lg"
        }`}
      >
        <Select
          className="p-[unset]"
          inputClassName="bg-surface-tertiary"
          containerClassName="bg-surface-tertiary"
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
          className="w-[40px!important] bg-surface-tertiary"
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
          className=" flex flex-col gap-2 p-1 bg-surface-main rounded-bl-md rounded-br-md"
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
                      className="bg-surface-tertiary w-full"
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
    <section className="flex flex-col gap-2 p-1 bg-surface-main rounded-lg">
      {Object.entries(object).map(([key, value], index) => {
        return (
          <section key={index} className="relative flex flex-col gap-2  ">
            <FitTitle
              className={`capitalize font-semibold text-text-primary text-ellipsis overflow-hidden max-w-full`}
            >
              {key}
            </FitTitle>
            {isPlainObject(value) && !value._custom ? (
              <Accordion
              // variant="shadow"
              // itemClasses={{
              //   trigger: "flex items-center justify-between ",
              //   base: "bg-surface-tertiary p-3  rounded-lg text-text-primary font-semibold relative",
              //   content: `bg-surface-secondary p-[unset!important] mt-2 rounded-md`,
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
                className="bg-surface-secondary w-full border-[4px]  border-[#1e293b!important]"
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
