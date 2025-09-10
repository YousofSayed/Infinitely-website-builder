import { isFunction } from 'lodash'
import React from 'react'

export const Show = ({children , condition , msg}) => {
  return (
    Boolean(condition) ? children : isFunction(msg) ? msg() : msg
  )
}
