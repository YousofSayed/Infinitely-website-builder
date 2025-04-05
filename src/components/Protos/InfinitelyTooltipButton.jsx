import React from 'react'
import { Button } from './Button'


/**
 * A great component that displays a shop name!
 * @typedef {object} InfinitelyTooltipButtonProps
 * @property {React.ReactNode} children
 * @property {( ev:MouseEvent , callback: ( setTooltipData : import('react-tooltip').TooltipRefProps)=>void)=>void} onPress
 * @param {React.HTMLAttributes<HTMLButtonElement> & InfinitelyTooltipButtonProps} props
 * @returns {JSX.Element}
 */
export const InfinitelyTooltipButton = ({tooltipProps , onPress=()=>{},  className = '' , children , ...props}  ) => {
  return (
    <button  {...props} onClick={(ev)=>{
        onPress(ev , )
    }}>
        {children}
    </button>
  )
}

<InfinitelyTooltipButton></InfinitelyTooltipButton>