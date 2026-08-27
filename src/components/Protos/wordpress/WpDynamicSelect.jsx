import { Select } from "@/components/Editor/Protos/Select";
import { wpQueryState } from "@/helpers/atoms";
import { useWpGetInfinite } from "@/queries/wp.queries";
import { useEffect, useState } from "react";
import { useMemo } from "react";
import { useRecoilState } from "recoil";

export const WpDynamicSelect = ({
  value,
  placeholder,
  useOnInput = false,
  effect = (keywords = [], setKeywords = () => {}) => {},
}) => {
  const [keywords, setKeywords] = useState([]);
  //   const [wpQuery , setWpQuery] = useRecoilState(wpQueryState)
  const { isPending, isRefetching, data, setData } = effect(
    keywords,
    setKeywords,
  );

  return (
    <Select
      className="!p-[unset]"
      inputClassName="!p-3 bg-surface-tertiary"
      placeholder={placeholder}
      useLoader={isPending || isRefetching}
      keywords={keywords}
      value={value}
      onItemClicked={(newValue) => {
        setData(newValue);
      }}
      onEnterPress={(newValue) => {
        setData(newValue);
      }}
      {...(useOnInput && { onInput: (newValue) => setData(newValue) })}
    />
  );
};
