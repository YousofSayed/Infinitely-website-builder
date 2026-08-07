import { currentElState } from "@/helpers/atoms";
import { useSetClassForCurrentEl } from "@/hooks/useSetclassForCurrentEl";
import { useUpdateInputValue } from "@/hooks/useUpdateInputValue";
import { Icons } from "@/components/Icons/Icons";
import { P } from "@/components/Protos/P";
import { Choices } from "@/components/Editor/Protos/Choices";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

/**
 *
 * @param {{cssProp : string , keywords: string[] , placeholder:string , label:string , separator:string}} param0
 * @returns
 */
export const AddMultiValuestoSingleProp = ({
  cssProp,
  keywords,
  placeholder = "",
  label = "",
  separator = ","
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
      value: Array.from(newValues).join(separator),
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
    setValues(!updatedValue.split(separator)[0] ? [] : updatedValue.split(separator));
  }, [updatedValue]);

  return (
    <section className=" flex flex-col gap-3 p-1 bg-surface-tertiary rounded-lg">
      {label ? <FitTitle className="custom-font-size">{label}</FitTitle> : null}
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
          className="bg-surface-secondary"
          onClick={(ev) => {
            addValue();
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {values[0] ? (
        <Choices
          className="bg-surface-secondary flex-wrap"
          keywords={values}
          onCloseClick={(ev, keyword) => {
            const newValues = values.filter((value) => value != keyword);
            setValues(newValues);
            setClass({
              cssProp,
              value: newValues.join(separator),
            });
          }}
        />
      ) : null}
    </section>
  );
};
