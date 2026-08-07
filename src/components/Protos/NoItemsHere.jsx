
import React from 'react'

export const NoItemsHere = ({ title }) => {
    return (
        <div className="flex items-center justify-center h-full w-full  rounded-lg">
            <h1 className="text-2xl font-bold text-slate-300 capitalize animate-pulse text-center select-none">{title}</h1>
        </div>
    )
}
