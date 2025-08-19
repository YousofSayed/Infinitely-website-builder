export const scrollBarResizerObserver = new ResizeObserver((entries)=>{
  entries.forEach(entry=>{
    entry.target.dispatchEvent(new CustomEvent(`observer-resize`) , {...entry})
  })
})