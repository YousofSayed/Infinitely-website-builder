import React, { useEffect, useState } from "react";
import { Select } from "./Select";
import { LinearGradient } from "./LinearGradient";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Input } from "./Input";
import { cloneObject, pushBetween, uniqueID } from "../../../helpers/cocktail";
import { Color } from "./Color";
import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { Adder } from "./Adder";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useRemoveCssProp } from "../../../hooks/useRemoveCssProp";
import { HexAlphaColorPicker } from "react-colorful";
import { ColorPicker } from "./ColorPicker";
import { getCloneArray } from "../../../helpers/functions";

const value = {
  direction: "",
  colors: [
    {
      color: "",
      opacity: "",
    },
  ],
};

const valueInit = {
  0: cloneObject(value),
};

/**
 *
 * @param {import("../../../helpers/types").gradientValues} values
 * @param {string} type
 * @returns
 */
const stringifyValues = (values, type) => {
  const finalVal = [];
  values.forEach((key, i) => {
    if(!key.type || !key.direction || !key.colors.length || key.colors.length < 2)return;
    finalVal.push(
      `${key.type}-gradient(${key.direction} ,  ${key.colors.map(
        (colorObj) => `${colorObj.color} ${colorObj.opacity}`
      )})`
    );
  });

  return finalVal.join(",");
};

function parseGradient(input = "") {
  const types = input.match(/linear|radial/gi);
  const data = input
    .split(/linear-gradient|radial-gradient/gi)
    .filter((text) => text);
  const finalData = data.map((data, i) => {
    const obj = {
      direction: "",
      type: "",
      colors: [],
    };
    obj.type = types[i];
    const splitedData = data.split(/\(|\)|\,/gi).filter((text) => text);
    const direction = splitedData.shift();
    obj.direction = direction;
    splitedData.forEach((data) => {
      const colorAndOpacity = data.split(" ").filter((text) => text);
      obj.colors.push({
        color: colorAndOpacity[0] || "",
        opacity: colorAndOpacity[1] || "",
      });
    });
    return obj;
  });

  return finalData;
}

/**
 *
 * @param {{values : import("../../../helpers/types").gradientValues , deleteAllContainer:(index:number , values:[]  ) setValues:Function , index:number}} param0
 * @returns
 */

const GradientHandler = ({ values, setValues, index, type , deleteAllContainer=(_ , _1)=>{} }) => {
  const setClass = useSetClassForCurrentEl();
  const removeProp = useRemoveCssProp();

  const updateProp = (cloneValues) => {
    const prop = "background";
    const value = stringifyValues(cloneValues, type);
    console.log(value);

    setClass({
      cssProp: prop,
      value: value,
    });
  };

  const setDirection = (value) => {
    const cloneValues = getCloneArray(values);
    cloneValues[index].direction = value;
    setValues(cloneValues);
    updateProp(cloneValues);
  };

  const addColorContainer = () => {
    const cloneValues = getCloneArray(values);
    console.log(index);

    cloneValues[index].colors = [
      ...cloneValues[index].colors,
      { color: "", opacity: "" },
    ];
    setValues(cloneValues);
  };

  const setColor = (color, colorsIndex) => {
    const cloneValues = getCloneArray(values);
    cloneValues[index].colors[colorsIndex].color = color;
    console.log(stringifyValues(cloneValues, type));
    setValues(cloneValues);

    updateProp(cloneValues);
  };

  const setOpacity = (opacity, colorsIndex) => {
    const cloneValues = getCloneArray(values);
    cloneValues[index].colors[colorsIndex].opacity = opacity;
    setValues(cloneValues);
    updateProp(cloneValues);
  };

  const deleteColor = (colorsIndex) => {
    if (colorsIndex <= 0) {
      deleteAllContainer(index, values);
      return;
    }
    const cloneValues = getCloneArray(values);
    cloneValues[index].colors = cloneValues[index].colors.filter(
      (colorObj, i) => i != colorsIndex
    );
    setValues(cloneValues);
    updateProp(cloneValues);
  };

  return (
    <section className="flex flex-col gap-2 bg-gray-950 p-2 rounded-lg">
      {/* <h1 className="pl-2 border-l-[3px] border-l-blue-600 rounded-l-md text-slate-300 font-semibold">{values[index].type}:</h1> */}
      <Input
        className={`bg-gray-900 b0rder border-l-[3px] border-l-blue-600`}
        value={values[index].type}
        placeholder={values[index].type}
        onInput={(ev) => {
          const newValues = getCloneArray(values);
          newValues[index].type = ev.target.value;
          setValues(newValues);
          updateProp(newValues);
          console.log(newValues);
        }}
      />
      <section className="flex  gap-2 w-full">
        <Input
          className="bg-gray-900 w-full"
          placeholder="Direction"
          value={values[index].direction}
          onInput={(ev) => {
            setDirection(ev.target.value);
          }}
        />

        <SmallButton
          className="bg-gray-900"
          onClick={(ev) => {
            deleteAllContainer(index);
          }}
        >
          {Icons.delete("white")}
        </SmallButton>

        <SmallButton
          className="bg-gray-900"
          onClick={(ev) => {
            addColorContainer();
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {values[index].colors.map(({ color, opacity }, i) => {
        return (
          <Adder
            key={i}
            className=" p-1 bg-gray-900"
            onAddClick={(ev) => {
              addColorContainer();
            }}
            onDeleteClick={(ev) => {
              deleteColor(i);
            }}
          >
            <section className="flex items-center  gap-2">
              <ColorPicker
                color={values[index].colors[i].color}
                setColor={(color) => {
                  setColor(color, i);
                }}
                onEffect={(color, setColor) => {
                  console.log(color, "lolo");
                }}
              />

              <Input
                className={`bg-gray-950 w-[70%] text-center text-[${values[index].colors[i].color}]`}
                value={values[index].colors[i].color}
                placeholder="Color"
                onInput={(ev) => {
                  setColor(ev.target.value, i);
                }}
              />

              <Input
                className="bg-gray-950 w-[30%]"
                value={values[index].colors[i].opacity}
                placeholder="Opacity"
                onInput={(ev) => {
                  setOpacity(ev.target.value, i);
                }}
              />
            </section>
          </Adder>
        );
      })}
    </section>
  );
};

export const Gradient = () => {
  const [type, setType] = useState("");
  const [values, setValues] = useState([]);
  const [updatedValue, setUpdateValue] = useState("");
  const removeProp = useRemoveCssProp();
  const setClass = useSetClassForCurrentEl();

  const addGradientContainer = (between = false, index) => {
    if (!type) return;
    const newValue = {
      direction: "",
      type: "",
      colors: [
        {
          color: "",
          opacity: "",
        },
      ],
    };
    newValue.type = type;
    const newValues = between
      ? pushBetween({
          arr: values,
          oldContet: values[index],
          content: newValue,
        })
      : [...values, newValue];

    setValues(newValues);
  };

  const deleteAllContainer = (index, values) => {
    const cloneValues = getCloneArray(values);
    delete cloneValues[index];
    const newValues = cloneValues.filter((val, i) => i != index);
    setValues(newValues);
    setClass({
      cssProp: "background",
      value: stringifyValues(newValues),
    });
    (!newValues.length ||
      !CSS.supports("background", stringifyValues(newValues))) &&
      removeProp({ cssProp: "background" });
  };

  // useEffect(() => {
  // }, [updatedValue]);
  
  useUpdateInputValue({
    cssProp: "background",
    setVal: setUpdateValue,
    onEffect(cssProp , value){
      console.log(value , 'changeeee');
      
      setValues(value ? parseGradient(value) : []); 
    }
  });

  return (
    <section className="flex flex-col gap-2 bg-gray-800 p-1 rounded-lg">
      <section className="flex gap-2 p-2 bg-gray-950 rounded-lg">
        <Select
          className="p-[unset] px-[unset]"
          placeholder="chose type"
          keywords={["linear", "radial"]}
          setVal={setType}
          val={type}
          // onInput={(value)=>{setType(value)}}
        />

        <SmallButton
          className="bg-gray-900"
          onClick={(ev) => {
            addGradientContainer();
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {/* {type == "linear" ? <LinearGradient /> : null} */}
      {values[0] ? (
        <section className="flex flex-col gap-2 ">
          {values.map((key, i) => {
            return (
              <Adder
                key={i}
                className="p-[unset]"
                onAddClick={(ev) => {
                  addGradientContainer(true, i);
                }}
                onDeleteClick={(ev) => {
                  deleteAllContainer(i, values);
                }}
              >
                <GradientHandler
                  values={values}
                  setValues={setValues}
                  deleteAllContainer={deleteAllContainer}
                  index={i}
                  type={type}
                  key={i}
                />
              </Adder>
            );
          })}
        </section>
      ) : null}
    </section>
  );
};
