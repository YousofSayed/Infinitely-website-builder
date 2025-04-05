import { addClickClass } from "../../../helpers/cocktail";
import { useUpdateInputValue } from "../../../hooks/useUpdateInputValue";
import { SelectedBorder } from "./SelectedBorder";

export const SidesControllers = ({ option, setOption }) => {

  // useUpdateInputValue({
  //   cssProp:option,
  //   setVal:setOption,
  // })

  return (
    <section className="p-2 w-full  rounded-lg bg-gray-950 flex justify-between items-center">

      <SelectedBorder
        borderDir={"all"}
        borderName={"border-2"}
        option={option}
        setOption={setOption}
      />

      <SelectedBorder
        borderDir={"lr"}
        borderName={"border-l-2 border-r-2"}
        option={option}
        setOption={setOption}
      />

      <SelectedBorder
        borderDir={"tb"}
        borderName={"border-t-2 border-b-2"}
        option={option}
        setOption={setOption}
      />
    </section>
  );
};
