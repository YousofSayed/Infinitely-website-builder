
import React from 'react'
import { isNormal } from '@/helpers/functions'

export const Normal = ({ children }) => {
    if (isNormal()) return <>{children}</>
}
