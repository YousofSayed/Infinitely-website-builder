import React from 'react'
import { isWordpress } from '../../../helpers/functions'

export const Wordpress = ({ children }) => {
    if (isWordpress()) return <>{children}</>
}
