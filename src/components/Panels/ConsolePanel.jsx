import { Console } from '@/components/Editor/Console';
import { ShowIf } from '@/components/ShowIf';
import { showComponentsInLeftPanelState } from '@/helpers/atoms';
import React from 'react'
import { useRecoilState } from 'recoil';

export const ConsolePanel = () => {
    const [showsComponents, setShowsComponents] = useRecoilState(
       showComponentsInLeftPanelState,
     );
 
   return (
     <>
       <ShowIf
         condition={showsComponents.views.console.panels.console.show}
       >
         <Console />
       </ShowIf>
     </>
   )
}
