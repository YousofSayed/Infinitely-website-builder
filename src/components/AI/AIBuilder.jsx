import { Chats } from '@/components/AI/Chats'
import { Prefrences } from '@/components/AI/Prefrences'
import { MultiTab } from '@/components/Protos/Multitabs'
import React from 'react'

export const AIBuilder = () => {
  return (
    <MultiTab
    className='!rounded-none'
    navClassName='!rounded-none'
      tabs={[
        {
          content: <Chats/>,
          title:'Chats'
        },
        {
          content:<Prefrences/>,
          title:'Prefrences'
        }
      ]}
    />
  )
}
