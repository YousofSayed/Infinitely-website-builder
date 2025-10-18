import React, { forwardRef } from "react";
export const GridComponents = {
  List: forwardRef(({ style, children, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Responsive wrapping
        // gridTemplateRows: "repeat(auto-fill, minmax(40px, 250px))", // Responsive wrapping
        // height:'100%',
        transform:'translateZ(0)',
        gap: "10px",
        // padding: "10px", // Add some padding for breathing room
        ...style, // VirtuosoGrid will override height/width as needed
      }}
    >
      {children}
    </div>
  )),
  Item: ({ children, ...props }) => (
    <div
      {...props}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Responsive wrapping
        gap: "10px",
        // padding: "10px",// Prevent overflow issues
      }}
    >
      {children}
    </div>
  ),
};

// export const GridComponents = {
//   List: forwardRef(({ style, children, ...props }, ref) => (
//     <div
//       ref={ref}
//       {...props}
//       style={{
//         display: "flex",
//         flexWrap: "wrap",
//         ...style,
//       }}
//     >
//       {children}
//     </div>
//   )),
//   Item: ({ children, ...props }) => (
//     <div
//       {...props}
//       style={{
//         padding: "0.5rem",
//         // width: "33%",
//         display: "flex",
//         flex: "none",
//         alignContent: "stretch",
//         boxSizing: "border-box",
//       }}
//     >
//       {children}
//     </div>
//   )
// }