import React from "react";

export const TabLabel = ({icon, label = ""}) => {
    return (
      <figure className=" flex items-center justify-center gap-2">
        {icon}
        <figcaption className="capitalize">{label}</figcaption>
      </figure>
    );
  };
  