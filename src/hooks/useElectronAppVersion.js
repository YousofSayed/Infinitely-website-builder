import React, { useEffect, useState } from "react";

export const useElectronAppVersion = () => {
  const [version, setVersion] = useState('');

  if (!window.electron) {
    return null;
  }

  useEffect(() => {
    console.log(window.electron.version);
    (async () => {
      setVersion(await window.electron.version());
    })();
  }, [window.electron.version]);

  return version;
};
