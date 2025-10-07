import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../../Icons/Icons";
import { Property } from "./Property";
import directionsImg from "../../../assets/images/directions.png";
import { SidesControllers } from "./SideControllers";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentElState,
  framesStylesState,
  ifrDocument,
} from "../../../helpers/atoms";

import { useSetClassForCurrentEl } from "../../../hooks/useSetclassForCurrentEl";
import { SidesInput } from "./SidesInput";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { useEditorMaybe } from "@grapesjs/react";

/**
 *
 * @param {{defultoption: 'all' | 'lr' | 'tb',  tProp:string , rProp:string , bProp:string , lProp:string}} param0
 * @returns
 */
export const DirectionsModel = ({
  defultoption = "all",
  tProp,
  rProp,
  bProp,
  lProp,
}) => {
  const setClass = useSetClassForCurrentEl();
  const [option, setOption] = useState(defultoption);
  const updateValue = useState("");
  const frameStyles = useRecoilValue(framesStylesState);
  const selectedEl = useRecoilValue(currentElState);
  const editor= useEditorMaybe();
  const [props , setProps] = useState({});
  const [vals, setVal] = useState({
    tVal: "",
    rVal: "",
    bVal: "",
    lVal: "",
  });

  const isCurrentELChange = useRef(false);

  /**
   *
   * @param {string} val
   * @param {string} specificDir
   */
  const handleVals = (val, specificDir) => {
    if (option == "all") {
      setVal({
        tVal: val,
        rVal: val,
        bVal: val,
        lVal: val,
      });
    } else if (option == "tb") {
      setVal({
        ...vals,
        tVal: val,
        bVal: val,
      });
    } else if (option == "lr") {
      setVal({
        ...vals,
        rVal: val,
        lVal: val,
      });
    } else {
      setVal({
        ...vals,
        [specificDir]: val,
      });
    }
  };

  const handleClass = ({ cssProp, value }) => {
    const allProps = [tProp, rProp, bProp, lProp];
    const tbProp = [tProp, bProp];
    const lrProp = [lProp, rProp];

    if (option == "all") {
      setClass({
        cssProp: allProps,
        value,
      });
    } else if (option == "tb") {
      setClass({
        cssProp: tbProp,
        value,
      });
    } else if (option == "lr") {
      setClass({
        cssProp: lrProp,
        value,
      });
    } else {
      setClass({
        cssProp,
        value,
      });
    }
  };

  // useUpdateInputValue({
  //   cs
  // })

  useEffect(() => {
    if(!Object.keys(frameStyles).length) return;
    // console.log('frameStyles :' ,frameStyles );
    
   handlePropsStates(frameStyles)
  }, [frameStyles ]);

  const handlePropsStates = (styles)=>{
    const newVals = {};
    const props = [
      { cssProp: tProp, key: "tVal" },
      { cssProp: rProp, key: "rVal" },
      { cssProp: bProp, key: "bVal" },
      { cssProp: lProp, key: "lVal" },
    ];
    props.forEach(({cssProp , key})=>{
      newVals[key] = styles[cssProp] ||''
    });
    setVal(newVals);
  }

 useUpdateInputValue({
  returnPropsAsIt:true,
  // cssProp:`position`,
  setVal:setProps,
  onEffect(cssProp , props){
    // if(!Object.keys(props).length) return;
    // console.log('props : ' , props , cssProp);
    
    handlePropsStates(props)
  }
 })

  return (
    <section className="flex flex-col gap-2">
      <SidesControllers option={option} setOption={setOption} />
      <section className="flex flex-col gap-2 justify-center items-center bg-slate-800 p-2 rounded-lg">
        <div className="flex items-center justify-center">
          <SidesInput
            value={vals.tVal}
            placeholder={"Top"}
            cssProp={tProp}
            handleClass={handleClass}
            handleVals={handleVals}
            specificDir={"tVal"}
            isCurrentELChange={isCurrentELChange}
          />
        </div>
        <figure className="flex items-center justify-center gap-3">
          <SidesInput
            value={vals.lVal}
            placeholder={"Left"}
            cssProp={lProp}
            handleClass={handleClass}
            handleVals={handleVals}
            specificDir={"lVal"}
            isCurrentELChange={isCurrentELChange}
          />

          <img src={directionsImg} className="w-[40%]  object-fill" alt="" />
          <SidesInput
            value={vals.rVal}
            placeholder={"Right"}
            cssProp={rProp}
            handleClass={handleClass}
            handleVals={handleVals}
            specificDir={"rVal"}
            isCurrentELChange={isCurrentELChange}
          />
        </figure>
        <div className="flex items-center justify-center">
          <SidesInput
            value={vals.bVal}
            placeholder="Bottom"
            cssProp={bProp}
            handleClass={handleClass}
            handleVals={handleVals}
            specificDir={"bVal"}
            isCurrentELChange={isCurrentELChange}
          />
        </div>
      </section>
    </section>
  );
};
