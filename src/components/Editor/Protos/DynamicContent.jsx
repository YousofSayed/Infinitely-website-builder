// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useEditorMaybe } from "@grapesjs/react";
// import { useRecoilValue } from "recoil";
// import { restModelState } from "../../../helpers/atoms";
// import { Select } from "./Select";
// import {
//   getModelResAndKeys,
//   viewDynamicContent,
// } from "../../../helpers/functions";
// import { toast } from "react-toastify";
// import { ToastMsgInfo } from "./ToastMsgInfo";
// import { dynamic_container } from "../../../constants/cmpsTypes";
// import { SmallButton } from "./SmallButton";
// import { Icons } from "../../Icons/Icons";
// import { Choices } from "./Choices";
// import { HighlightContentEditable } from "./HighlightContentEditable";
// import { useLiveQuery } from "dexie-react-hooks";
// import { current_project_id } from "../../../constants/shared";
// import { db } from "../../../helpers/db";
// import { SuggestionMenu } from "./SuggestionMenu";
// import { flatten } from "flat";
// import { restModelType } from "../../../helpers/jsDocs";

// export const DynamicContent = () => {
//   const editor = useEditorMaybe();
//   const projectId = +localStorage.getItem(current_project_id);
//   const [restModels, setRestModels] = useState(restModelType); //useRecoilValue(restModelState);
//   const [modelsNames, setModelNames] = useState([]);
//   const [modelKeywords, setModelsKeywords] = useState([]);
//   const [choosesModelsVals, setChoosesModelsVals] = useState([]);
//   const [choosedModel, setChoosedModel] = useState("");
//   const [modelResKeyAndValue, setModelResKeyAndValue] = useState({});
//   const [val, setVal] = useState("");
//   const [inner, setInner] = useState("");
//   const editorRef = useRef();

//   useLiveQuery(async () => {
//     const restModels = await (await db.projects.get(projectId)).restAPIModels;
//     setRestModels(restModels);
//   });

//   useEffect(() => {
//     if (!restModels) return;
//     // setModelsKeywords(getModelResAndKeys(restModels).keys);
//     setModelNames(restModels.map((model) => model.name));
//     getNames();
//   }, [restModels]);

//   useEffect(() => {
//     if (!choosedModel || !restModels) return;
//     const model = structuredClone(restModels).filter(
//       (model) => model.name == choosedModel
//     )[0];
//     if (!model) {
//       toast.error(<ToastMsgInfo msg={"No model founded..."} />);
//       return;
//     }
//     // const modelRes = flattenObject(JSON.parse(model.response), model.varName);
//     const modelRes = flatResponse(JSON.parse(model.response), model.varName);
//     setModelsKeywords(Object.keys(modelRes));
//     setModelResKeyAndValue(modelRes);
//   }, [choosedModel]);

//   //   useEffect(() => {
//   // const sle = editor?.getSelected();
//   // const attr = sle?.getAttributes()['inf-dynamic-content']
//   // if (!editor || !sle || !choosesModelsVals.length) return;

//   // sle.addAttributes({
//   //   "inf-dynamic-content": JSON.stringify({
//   //     modelName:choosedModel,
//   //     keys:[...choosesModelsVals]
//   //   }),
//   // });
//   //     let inner = '';
//   //      choosesModelsVals.forEach(md=>{
//   //         inner += modelResKeyAndValue[md] || md || ''
//   //     })

//   // sle.getEl().innerHTML = inner;
//   //   }, [choosesModelsVals]);

//   useEffect(() => {
//     getInner();
//   }, []);

//   const getNames = () => {
//     const names = getModelResAndKeys(restModels).keys;
//     // setModelNames(names);
//     setModelsKeywords(names);
//     console.log("Name getted...", names);
//   };

//   useEffect(() => {
//     const sle = editor?.getSelected();
//     const attr = sle?.getAttributes()["inf-dynamic-content"];
//     if (!editor || !sle || !inner || !inner.length || !sle.getEl()) return;
//     // const attrVal = typeof attr == 'object' ? JSON.parse(attr) : {modelsName : [] , inner : ''};
//     console.log("attr : ", attr);

//     sle.addAttributes({
//       "inf-dynamic-content": inner.slice(1,-1),
//     });
//     // console.log('parsed inner : ' , parseDynamicContent(inner , modelResKeyAndValue));

//     sle.components(inner.slice(1,-1), { silent: true });

//     // sle.getEl().innerHTML = parseDynamicContent(
//     //   inner,
//     //   getModelResAndKeys(restModels).res
//     // );
//     sle.getEl().innerHTML = viewDynamicContent(restModels,inner);
//     console.log('fuckkekk inner');
    
//     editor.refresh({ tools: true });
//   }, [inner, restModels]);

//   const getInner = () => {
//     const sle = editor?.getSelected();
//     const attrVal = sle?.getAttributes()["inf-dynamic-content"];
//     if (!editor || !sle || !attrVal) return;
//     // const content = JSON.parse(attrVal);
//     // console.log('keys :  ',content.keys);
//     console.log("get inner", attrVal);

//     // setChoosedModel(content.modelsName[content.modelsName.length - 1]);
//     setInner(attrVal);
//     setModelResKeyAndValue(getModelResAndKeys(restModels).res);

//     // sle.getEl().innerHTML = parseDynamicContent(
//     //   attrVal,
//     //   getModelResAndKeys(restModels).res
//     // );

//     sle.getEl().innerHTML = viewDynamicContent(restModels,attrVal);
//   };

//   // const viewDynamicContent = useCallback(
//   //   (valueToView = "") => {
//   //     const restModelsContext = restModels.map(
//   //       (model) => `var \$${model.varName} = ${model.response}`
//   //     );

//   //     console.log("vvvv :", valueToView, restModelsContext);
//   //     // const view = new Function(
//   //     //   `${restModelsContext}\n\n return ${valueToView}`
//   //     // )();
//   //     // return view;
//   //   },
//   //   [restModels]
//   // );

  
//   const addContent = (value = "") => {
//     // setChoosesModelsVals([...choosesModelsVals, value]);
//     // setInner(inner + `\${${value}}`);
//     setInner(value);
//     setVal(new String(""));
//   };

//   const removeContent = (index) => {
//     const newArr = choosesModelsVals.filter((cm, i) => i != index);
//     setChoosesModelsVals(newArr);
//   };

//   return (
//     <main className="flex flex-col gap-2 p-2 bg-slate-800 rounded-lg">
//       {/* <p className="w-fit p-1 bg-slate-800 rounded-lg custom-font-size text-slate-200 font-semibold">
//         Choose Model :{" "}
//       </p>
//       <Select
//         className="bg-slate-900 "
//         inputClassName="py-3 bg-slate-900"
//         // containerClassName="p-1 bg-slate-800"
//         value={choosedModel}
//         placeholder="Choose Model"
//         keywords={modelsNames}
//         onAll={(value) => {
//           setChoosedModel(value);
//         }}
//       /> */}

//       {/* {!!Object.keys(modelKeywords).length && ( */}
//       <>
//         <p className="w-fit p-2 bg-slate-800 rounded-lg custom-font-size text-slate-200 font-semibold">
//           Enter Value :{" "}
//         </p>
//         {/* <section className="w-full flex  gap-2">
//           <Select
//             value={val}
//             keywords={modelKeywords}
//             className="bg-slate-900 "
//             inputClassName="py-3 bg-slate-900"
//             placeholder="Choose Value"
//             onInput={(value) => {
//               setVal(value);
//             }}
//             onEnterPress={(value) => {
//               console.log('value : ' , value);
              
//               addContent(value);
//               // setContentInsideCmp(value);
//             }}
//             onItemClicked={(value) => {
//               addContent(value);
//               // setContentInsideCmp(value);
//             }}
//             // onMenuOpen={() => {
//             //   console.log(getModelResAndKeys(restModels).keys);

//             //   setModelsKeywords(getModelResAndKeys(restModels).keys);
//             // }}
//           />

//           <SmallButton
//             className="bg-slate-900 shadow-[unset!important] flex-shrink-0"
//             onClick={() => {
//               addContent(`\${${val}}`);
//             }}
//           >
//             {Icons.plus("white")}
//           </SmallButton>
//         </section> */}

//         {/* <HighlightContentEditable
//           editorRef={editorRef}
//           innerStt={inner}
//           onInput={(ev) => {
//             setInner(ev.target.value);
//           }}
//         /> */}

//         <Select
//           value={inner.slice(1,-1)}
//           // isTextarea
//           keywords={modelKeywords}
//           replaceLastWorld={true}
//           className="bg-slate-900 "
//           inputClassName="py-3 bg-slate-900"
//           placeholder="Enter Dynamic Content"
//           isCode
//           isTemplateEngine
//           allowCmdsContext
//           allowRestAPIModelsContext
//           codeProps={{
//             value: inner,
//             language: "javascript",
//             onChange(value) {
//               setInner(value);
//             },
//           }}
//           // onInput={(value) => {
//           //   setInner(value);
//           // }}
//           // onEnterPress={(value) => {
//           //   addContent(value);
//           //   // setContentInsideCmp(value);
//           // }}
//           // onItemClicked={(value) => {
//           //   addContent(value);
//           //   // setContentInsideCmp(value);
//           // }}
//           // onMenuOpen={() => {
//           //   getNames();
//           // }}
//         />
//         {/* <ReactQuill theme="snow" className="min-h-[300px] max-h-full h-[300px]"/> */}

//         {/* {!!choosesModelsVals.length && (
//             <Choices
//               className="bg-slate-900 flex-wrap"
//               keywords={choosesModelsVals}
//               onCloseClick={(ev, keyword, index) => {
//                 removeContent(index);
//               }}
//             />
//           )} */}
//       </>
//       {/* )} */}
//     </main>
//   );
// };

// // console.log( 'dsadsad',new Function(`var dsa = 1; return dsa;`)());
