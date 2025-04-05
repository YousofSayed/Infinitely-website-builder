import { useEditorMaybe } from '@grapesjs/react'
import React from 'react'

export const useRemoveCssProp = () => {
  const editor = useEditorMaybe();

  return ({cssProp})=>{
    editor?.getSelected()?.removeStyle(cssProp); 
  }
}
