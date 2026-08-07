
import React from 'react'
import { MultiTab } from '@/components/Protos/Multitabs'
import { CustomFontsInstaller } from '@/components/Editor/Protos/CustomFontsInstaller'
import { TabLabel } from '@/components/Editor/Protos/TabLabel'
import { Icons } from '@/components/Icons/Icons'
import { GoogleFontsInstaller } from '@/components/Editor/Protos/GoogleFontsInstaller'
import { InstalledFonts } from '@/components/Editor/Protos/InstalledFonts'

export const CustomFontsModal = () => {
  return (
    <MultiTab tabs={[ 
      {content:<InstalledFonts /> , title:<TabLabel icon={Icons.export('white')} label='Installed Fonts'/>},
      {content:<CustomFontsInstaller /> , title:<TabLabel icon={Icons.upload({strokeColor:'white'})} label='Upload Fonts'/>},
      {content:<GoogleFontsInstaller /> , title:<TabLabel icon={Icons.google({height:23})} label='Google Fonts'/>},
    ]}/>
  )
}
