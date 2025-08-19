import React, { useEffect, useState } from "react";
import { Select } from "./Select";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Choices } from "./Choices";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useRecoilValue } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { P } from "../../Protos/P";

/**
 *
 * @param {{cssProp : string , keywords: string[] , placeholder:string , label:string}} param0
 * @returns
 */
export const AddMultiValuestoSingleProp = ({
  cssProp,
  keywords,
  placeholder = "",
  label = "",
}) => {
  const [value, setValue] = useState("");
  const [values, setValues] = useState([]);
  const [updatedValue, setUpdateValue] = useState("");
  const selectedEl = useRecoilValue(currentElState);
  const setClass = useSetClassForCurrentEl();

  const addValue = () => {
    const newValues = Array.from(new Set([...values, value]));
    setValues(newValues);
    setClass({
      cssProp,
      value: Array.from(newValues).join(","),
    });
    setValue("");
  };

  useUpdateInputValue({
    cssProp,
    setVal: setUpdateValue,
  });

  useEffect(() => {
    if(!updatedValue) {
      setValues([]);
      return;
    }
    setValues(!updatedValue.split(",")[0] ? [] : updatedValue.split(","));
  }, [updatedValue]);

  return (
    <section className=" flex flex-col gap-3 p-1 bg-slate-800 rounded-lg">
      {label ? label : null}
      <section className="flex justify-between gap-2">
        <Select
          className="p-[unset] px-[unset]"
          placeholder={placeholder}
          setVal={setValue}
          value={value}
          keywords={keywords}
          onInput={(value) => {
            setValue(value);
          }}
          onItemClicked={(value) => {
            setValue(value);
          }}
          onEnterPress={(value) => {
            setValue(value);
          }}
        />
        <SmallButton
          className="bg-slate-900"
          onClick={(ev) => {
            addValue();
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {values[0] ? (
        <Choices
          className="bg-slate-900"
          keywords={values}
          onCloseClick={(ev, keyword) => {
            const newValues = values.filter((value) => value != keyword);
            setValues(newValues);
            setClass({
              cssProp,
              value: newValues.join(","),
            });
          }}
        />
      ) : null}
    </section>
  );
};
