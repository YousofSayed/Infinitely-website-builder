import React from 'react'

export const Loader = ({width =70, height=70 }) => {
  return (
    <section id='loader' className='w-full h-full flex justify-center items-center'>
        <div style={{
          width,
          height
        }} className={` rounded-full border-2 border-blue-600 border-r-transparent animate-spin`}></div>
    </section>
  )
} 
  