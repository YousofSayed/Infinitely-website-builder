import { showComponentsInLeftPanelState } from '@/helpers/atoms';
import React from 'react'
import { useRecoilState } from 'recoil';
import { Button } from '@/components/Protos/Button';
import { Icons } from '@/components/Icons/Icons';

export const ViewsPanelNav = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
     showComponentsInLeftPanelState,
   );
 
   return (
     <nav className="flex flex-col gap-2 w-full h-full max-h-full overflow-y-auto hideScrollBar p-2 animate-to-go">
       {Object.entries(showsComponents.views[showsComponents.views.viewKey].panels).map(([key, value]) => (
         <Button
         className="h-fit !p-3 font-medium bg-surface-tertiary hover:bg-brand-primary transition-colors flex items-center justify-between"
           onClick={() => {
             setShowsComponents((prev) => ({
               ...prev,
               views: {
                 ...prev.views,
                 [showsComponents.views.viewKey]: {
                   ...prev.views[showsComponents.views.viewKey],
                   panels: {
                     ...prev.views[showsComponents.views.viewKey].panels,
                     [key]: {
                       ...prev.views[showsComponents.views.viewKey].panels[key],
                       show: !(prev.views[showsComponents.views.viewKey].panels[key].show),
                     },
                   },
                 },
               },
             }));
           }}
         >
           <span>{value.title}</span>
           <span className="rotate-[-90deg]">
             <Icons.arrow/>
           </span>
         </Button>
       ))}
     </nav>
   );
    
}
