import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'

export const useDBAssetsSw = () => {
  const [dbAssetsSw , setDBAssetsSw] = useRecoilState(dbAssetsSw);

  useEffect(()=>{
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => { // Wait for page load
          try {
            const reg = await navigator.serviceWorker.register( new URL("../helpers/dbAssets-sw.js", import.meta.url),
            {
              type: "module",
            });
            console.log('SW Registered:', reg.scope);
      
            // Ensure SW is active
            const sw = await navigator.serviceWorker.ready;
            
            // Force page control (optional, for dev)
            if (reg.active) {
              console.log('SW State:', reg.active.state);
              
            } else {
              console.log('SW not active yet, reloading...');
              window.location.reload(); // Reload to ensure control
              return;
            }
      
            // Fetch the CSS
            const response = await fetch('/css/custom-style');
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            const file = await response.blob();
            const text = await file.text();
            console.log('File is:', text); // Should log: body { color: red; }
          } catch (err) {
            console.error('Error:', err);
          }
        });
      }
  },[])
}
