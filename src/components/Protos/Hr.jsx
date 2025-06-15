import React from 'react'

/**
 * 
 * @param {React.HTMLAttributes<HTMLHRElement>} [props] 
 * @returns 
 */
export const Hr = ({props}) => {
  return (
    <hr {...props}  className='w-[2px] h-[calc(100%-50%)] self-center py-3 bg-slate-600 rounded-lg border-none'/>
  )
}
