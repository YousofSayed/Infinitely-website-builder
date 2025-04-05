import { Editor } from '@monaco-editor/react'
import React from 'react'

export const SmallMonacoEditor = ({lang = 'javascript',theme='vs-dark'}) => {
  return (
    <section className='rounded-lg h-[300px]'>
        <Editor theme={theme} language={lang} className='w-full h-full'/>
    </section>
  )
}
