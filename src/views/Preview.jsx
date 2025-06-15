import React, { useEffect, useState } from 'react'
import { preview_url } from '../constants/shared';

export const Preview = () => {
    const broadCastChannel = new BroadcastChannel('preview');
    const [previewUrl, setPreviewUrl] = useState(localStorage.getItem(preview_url) || '');
    useEffect(() => {
        // Listen for messages from the BroadcastChannel
        broadCastChannel.onmessage = (ev) => {
            const { command, props } = ev.data;
            if (command === 'setPreviewUrl') {
                console.log('Received preview URL:', props.url);
                
                setPreviewUrl(new String(props.url));
            }
        };

        // Cleanup on unmount
        return () => {
            broadCastChannel.close();
        };
    }, []);
   
  return (
    <iframe src={previewUrl.toString()} className='h-full w-full' ></iframe>
  )
}
