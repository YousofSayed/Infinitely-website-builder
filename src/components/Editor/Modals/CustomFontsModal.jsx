import React from 'react'
import { MultiTab } from '../../Protos/Multitabs'
import { CustomFontsInstaller } from '../Protos/CustomFontsInstaller'
import { TabLabel } from '../Protos/TabLabel'
import { Icons } from '../../Icons/Icons'
import { GoogleFontsInstaller } from '../Protos/GoogleFontsInstaller'
import { InstalledFonts } from '../Protos/InstalledFonts'

export const CustomFontsModal = () => {
  return (
    <MultiTab tabs={[ 
      {content:<InstalledFonts /> , title:<TabLabel icon={Icons.export('white')} label='Installed Fonts'/>},
      {content:<CustomFontsInstaller /> , title:<TabLabel icon={Icons.upload({strokeColor:'white'})} label='Upload Fonts'/>},
      {content:<GoogleFontsInstaller /> , title:<TabLabel icon={Icons.google({height:23})} label='Google Fonts'/>},
    ]}/>
  )
}
