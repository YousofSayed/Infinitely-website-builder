import React, { useCallback, useEffect, useRef, useState } from "react";

export const LazyList = ({ list = [], renderItem=(item,index)=>{}, count = 15, delay = 50 }) => {
  const [lazyList, setLazyList] = useState([]);
  const [lazyListCount , setLazyListCount] = useState(count)
  const timeout = useRef();
  const renderList =
//    useCallback(
      ({ start = 0, end = 15 }) => {

          // console.log(lazyList);
        if (lazyListCount >= list.length) return;
        console.log(lazyListCount);
        
        // timeout.current && clearTimeout(timeout.current);
        timeout.current = setTimeout(
          () => {
            setLazyListCount((prev) => Math.min(prev + count, list.length));
            // if (newArr.length != list.length) {
            //   renderList({ start: end, end: end + count });
            // }
          },
          lazyListCount == 15 ? 0 : delay
        );
      }
    //   ,
    //   []
    // );
    useEffect(() => {
        
        renderList({start:0 , end:count})
  }, [lazyListCount]);
  return list.slice(0,lazyListCount).map((item,index)=>renderItem(item,index));
};
