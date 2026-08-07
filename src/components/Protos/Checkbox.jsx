import { uniqueId } from 'lodash'
import React, { useId, useRef } from 'react'
import { Input } from '@/components/Editor/Protos/Input';

export const Checkbox = ({
    title = '',
    className = '',
    onInput = () => { },
    onChange = () => { },
    checked
}) => {
    const id = useId();
    return (
        <label htmlFor={`${id}-select`} className={`font-semibold cursor-pointer bg-brand-primary py-1 px-2 rounded-lg flex items-center gap-2 capitalize ${className}`}>
            {title}
            <Input className='cursor-pointer' id={`${id}-select`} type="checkbox" onChange={onChange} onInput={onInput} checked={checked} />
        </label>
    )
}
