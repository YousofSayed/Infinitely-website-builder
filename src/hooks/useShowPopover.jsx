import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { popoverState } from '../helpers/atoms'

export const useShowPopover = (dependencies=[]) => {
    const popoverData = useRecoilValue(popoverState);
    const setPopoverData = useSetRecoilState(popoverState);

    useEffect(()=>{
        console.log('update : ' , popoverData , dependencies);
        
        setPopoverData({
            ...popoverData,
        })
    },dependencies)

  const showPopover = ( {isOpen , content = <></> , element , isTextarea=false}) => {
      const { top, left, right, bottom } =
      element.current.getBoundingClientRect();
      setPopoverData({
        ...popoverData,
        isOpen: isOpen || !popoverData.isOpen,
        parentWidth: element.current.offsetWidth,
        parentHeight: element.current.offsetHeight,
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        width: isTextarea ? 600 : 300,
        height: 300,
        className: "",
      
        content,
      });
    };

  return showPopover;
}
