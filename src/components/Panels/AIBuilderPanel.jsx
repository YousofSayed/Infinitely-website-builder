import { AIBuilder } from '@/components/AI/AIBuilder';
import { ShowIf } from '@/components/ShowIf';
import { showComponentsInLeftPanelState } from '@/helpers/atoms';
import React from 'react'
import { useRecoilState } from 'recoil';

export const AIBuilderPanel = () => {
   const [showsComponents, setShowsComponents] = useRecoilState(
      showComponentsInLeftPanelState,
    );

  return (
    <>
      <ShowIf
        condition={showsComponents.views.aiBuilder.panels.aiBuilder.show}
      >
        <AIBuilder />
      </ShowIf>
    </>
  )
}
