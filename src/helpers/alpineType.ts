type AllHTMLElements =  HTMLElementTagNameMap[keyof HTMLElementTagNameMap] & HTMLElement & Element  & HTMLObjectElement
var $el:AllHTMLElements;
var $event :   GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap];
var $root : AllHTMLElements;
var $store : {};
var $watch : (value: string , callback : (value: string)=>void)=>void
var $dispatch : (event : string)=>void
var $nextTick : (callback : ()=>void)=>void
var $data : {}
var $id : (id:string)=>string

