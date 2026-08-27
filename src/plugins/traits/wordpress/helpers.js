/**
 * 
 * @param {{editor : import('grapesjs').Editor , model : import('grapesjs').Component , values : string[]}} param0 
 * @returns 
 */
export const showCallback = ({editor ,model, values=[]})=>{
  return ()=> !values.map(v=>model.getTrait(v)?.attributes?.value).some(Boolean);
}

