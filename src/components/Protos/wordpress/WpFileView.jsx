import { wp_delete_media_files_by_slugs, wp_get_blob_media_by_slug, } from '@/apps/wordpress/functions';
import { current_project_id } from '@/constants/shared';
import { assetsWorker, pageBuilderWorker } from '@/helpers/defineWorkers';
import { wpWorkerCallbackMaker } from '@/helpers/functions';
import { refType } from '@/helpers/jsDocs';
import { useFileViewTitleResizer } from '@/hooks/useFileViewTitleResizer';
import { FitTitle } from '@/components/Editor/Protos/FitTitle';
import { SmallButton } from '@/components/Editor/Protos/SmallButton';
import { ToastMsgInfo } from '@/components/Editor/Protos/ToastMsgInfo';
import { Icons } from '@/components/Icons/Icons';
import { useBusy } from '@/components/Protos/BusyProvider';
import { Checkbox } from '@/components/Protos/Checkbox';
import { OptionsButton } from '@/components/Protos/OptionsButton';
import { useEditorMaybe } from '@grapesjs/react';
import { isArray, isFunction } from 'lodash';
import React, { useRef, useState } from 'react'
import mime from 'mime'
import { toMB } from '@/helpers/bridge';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';

/**
 * 
 * @param {{media : import('@/helpers/types').InfinitelyWpMedia,
 *  showOptions : boolean,
 *  callback : (media : import('@/helpers/types').InfinitelyWpMedia , url : string)=>void,
 *  checked : boolean,
 *  onChange : (checked : boolean) => void,
 *  allowCheckBox : boolean,
 *  setData : () => void,
 *  showOptions : boolean,
 *  media : import('@/helpers/types').InfinitelyWpMedia,
 *  
 * }} param0 
 * @returns 
 */
export const WpFileView = ({ media, showOptions = true, callback, setData, allowCheckBox = false, checked, onChange }) => {
    const mediaType = mime.getType(media.source_url) || media.media_type || 'application/octet-stream';
    const fileNameRef = useRef(refType);
    const { isBusy, runWithBusy } = useBusy();
    const editor = useEditorMaybe();
    const [showFilNameTooltib, setShowFileNameTooltib] = useState(false);
    const projectId = +localStorage.getItem(current_project_id);
    useFileViewTitleResizer(fileNameRef, setShowFileNameTooltib);

    const onItemClicked = (ev, asset) => {
        runWithBusy(async () => {
            await callback(asset, asset.source_url);
        })
    };

    const deleteMedia = async () => {
        runWithBusy(async () => {
            const cnfrm = confirm(`Are you sure you want to delete ${media.slug} ?`);
            if (!cnfrm) {
                return;
            }
            const tid = toast.loading(<ToastMsgInfo msg={`Deleting ${media.slug}...`} />);
            try {
                return new Promise((res, rej) => {
                    wpWorkerCallbackMaker(assetsWorker, 'wp_delete_media_files_by_slugs', {
                        projectId,
                        slugs: [media.slug]
                    }, (worker_res) => {
                        if (!worker_res.res.success) {
                            // toast.dismiss(tid);
                            // toast.error(<ToastMsgInfo msg={`Failed to delete ${media.slug}`} />);
                            rej(new Error(`Failed to delete ${media.slug} 😶`));
                            return;
                        }
                        isFunction(setData) && setData();
                        toast.done(tid);
                        toast.success(<ToastMsgInfo msg={`${media.slug} deleted successfully`} />);
                        res(worker_res);
                    })
                })
            } catch (error) {
                toast.dismiss(tid);
                toast.error(<ToastMsgInfo msg={`Failed to delete ${media.slug}`} />);

            }
        })
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(media.source_url);
        toast.success(<ToastMsgInfo msg={`link coppied`} />)
    }


    const downloadFile = async () => {
        runWithBusy(async () => {
            const tid = toast.loading(<ToastMsgInfo msg={`Downloading ${media.slug}...`} />);

            wpWorkerCallbackMaker(assetsWorker, 'wp_get_blob_media_by_slug', {
                media,
                projectId,
            }, (res) => {
                if (res.done) {
                    const blob = res.res;
                    try {
                        if (!(blob instanceof Blob)) {
                            console.error("blob is not a blob", blob);
                            toast.error(<ToastMsgInfo msg={`Failed to download ${media.slug}`} />);
                            rej(new Error(`Failed to download ${media.slug}`));
                            return;
                        }
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        const fileName = media.source_url.split('/').pop();
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        toast.dismiss(tid);
                        toast.success(<ToastMsgInfo msg={`${media.slug} downloaded successfully`} />);
                    } catch (error) {
                        console.error(error);
                        toast.dismiss(tid);
                        toast.error(<ToastMsgInfo msg={`Failed to download ${media.slug}`} />);
                    }
                } else {
                    toast.dismiss(tid);
                    toast.error(<ToastMsgInfo msg={`Failed to download ${media.slug}`} />);
                }
            })

        })
    }

    return (
        <section

            className={`group   relative rounded-lg p-3 bg-surface-tertiary  flex flex-col justify-center items-center gap-2`}
        >
            <FitTitle className="absolute left-0 top-0 z-[100] ">
                {toMB(media.media_details.filesize, 3)}MB
            </FitTitle>
            {/* <button
                onClick={(ev) => {
                    deleteMedia(media);
                }}
                className="absolute group-hover:flex z-[200] right-0 top-0 bg-brand-primary fill-white cursor-pointer hidden justify-center items-center rounded-full w-[23px] h-[23px]"
            >
                {Icons.close("white", 1.5)}
            </button> */}
            {allowCheckBox && <Checkbox className='absolute right-1 top-1 z-[200] py-2' checked={checked} onChange={onChange} />}
            {/* <OptionsButton className='absolute right-1 top-1 z-[200] h-[23px] w-[23px] rotate-90' /> */}
            <figure
                onDoubleClick={(ev) => {
                    ev.stopPropagation();
                    onItemClicked(ev, media);
                }}
                className=" p-2 h-[150px]  cursor-pointer rounded-lg  bg-surface-tertiary"
            >
                {(mediaType.includes("video") && (
                    <section>
                        <video
                            className="w-full  h-[140px] max-h-full max-w-full "
                            onPointerEnter={(ev) => {
                                ev.stopPropagation();
                                ev.preventDefault();
                                ev.currentTarget.play();
                                console.log("play");
                            }}
                            onPointerLeave={(ev) => {
                                ev.currentTarget.pause();
                            }}
                            onDoubleClick={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                console.log("dbplay");
                                onItemClicked(ev, media);
                            }}
                            // autoPlay={true}
                            onLoadedData={(ev) => {
                                // console.log('loaded ............');
                                const videoEl = ev.currentTarget;
                                videoEl.play();
                                setTimeout(() => {
                                    videoEl.pause();
                                }, 10)
                            }}
                            preload="auto"
                            muted={true}
                            poster=""
                            src={media.source_url}
                        ></video>
                    </section>
                )) ||
                    (mediaType.includes("audio") && (
                        <section className="h-full flex justify-between gap-2 items-center flex-col bg-surface-secondary rounded-lg overflow-hidden pt-2">
                            {Icons.headphone("white", undefined, 75, 75)}
                            <audio
                                onClick={(ev) => onItemClicked(ev, media)}
                                className="w-full"
                                src={media.source_url}
                                controls={true}
                            ></audio>
                        </section>
                    )) ||
                    (mediaType.includes("image") && (
                        <img
                            // onLoad={(ev) => {
                            //   console.log("image load...");
                            // }}
                            // loading="lazy"
                            // style={{
                            //   willChange:'transform',
                            //   zIndex:'-1'
                            // }}
                            onClick={(ev) => onItemClicked(ev, media)}
                            className="w-full h-full object-contain "
                            src={media.source_url}
                        ></img>
                    ))}

                {!/image|audio|video/gi.test(mediaType) &&
                    Icons.file({ fill: "white", width: 130, height: 130 })}
            </figure>
            <p
                tooltib-id={media.slug}
                ref={fileNameRef}
                title={media.slug}
                className="text-text-primary p-2 bg-surface-secondary rounded-md text-ellipsis  max-w-full   text-nowrap overflow-hidden "
            >
                {media.slug}
            </p>
            {showFilNameTooltib && (
                <Tooltip
                    anchorSelect={`[tooltib-id="${media.slug}"]`}
                    place="bottom-end"
                    opacity={1}
                    className="shadow-sm shadow-slate-950 z-[1001]"
                    positionStrategy="fixed"
                >
                    {media.slug}
                </Tooltip>
            )}

            {showOptions && <section className='flex  gap-2 justify-between p-2  rounded-lg bg-surface-secondary w-full'>
                <SmallButton disabled={isBusy} tooltipTitle='Copy link' onClick={copyLink}>{Icons.copy({ fill: 'white' })}</SmallButton>
                <SmallButton disabled={isBusy} tooltipTitle='Download file' onClick={downloadFile}>{Icons.export('white')}</SmallButton>
                <SmallButton disabled={isBusy} tooltipTitle='Delete file' className='hover:bg-[crimson!important] bg-surface-tertiary py-3' tooltipClassName='bg-[crimson!important]' onClick={deleteMedia}>{Icons.trash('white')}</SmallButton>
            </section>}
        </section>
    );
}
