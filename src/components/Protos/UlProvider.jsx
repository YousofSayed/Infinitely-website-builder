import React, { createContext, useContext, useState } from "react";

const UlContext = createContext();

export const UlContextProvider = ({ children }) => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <UlContext.Provider value={{ selectedId, setSelectedId }}>
      {children}
    </UlContext.Provider>
  );
};

export const useUlContext = () =>
  useContext(UlContext) || {
    selectedId: null,
    setSelectedId: () => null,
  };
