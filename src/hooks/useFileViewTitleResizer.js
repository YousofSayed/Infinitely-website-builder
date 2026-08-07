import { isOverflowedHiddenEl } from '@/helpers/functions';
import React, { useLayoutEffect, useRef, useState } from 'react'
import { refType } from '@/helpers/jsDocs';

export const useFileViewTitleResizer = (ref = refType, setShowFileNameTooltib) => {
    const fileNameRef = ref;
    // const [showFilNameTooltib, setShowFileNameTooltib] = useState(false);
    useLayoutEffect(() => {
        if (!fileNameRef || !fileNameRef.current) return;
        const handler = (el) => {
            const isOverflowHidden = isOverflowedHiddenEl(fileNameRef.current);
            setShowFileNameTooltib(isOverflowHidden);
        };
        handler(fileNameRef.current);
        const resizerObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => handler(entry.target));
        });

        return () => {
            resizerObserver.disconnect();
        };
    }, [fileNameRef, fileNameRef.current]);
}
