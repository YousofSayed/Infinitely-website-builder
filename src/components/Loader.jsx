import React from "react";

export const Loader = ({
  width = 70,
  height = 70,
  zIndex,
  loaderClassName,
  className,
  children,
  isLoading = true,
}) => {
  return (
    <section
      style={{ zIndex }}
      id="loader"
      className={`relative w-full h-full flex justify-center items-center bg-transparent ${className}`}
    >
      {isLoading && (
        <div
          style={{
            width,
            height,
          }}
          className={`absolute rounded-full border-2 border-blue-600 border-r-transparent animate-spin ${loaderClassName}`}
        />
      )}

      {children}
    </section>
  );
};