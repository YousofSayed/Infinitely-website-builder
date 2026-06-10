import React, { useEffect, useRef, useState } from 'react'
import { config } from '../../../../brand';
import { Input } from '../../Protos/Input';
import { SmallButton } from '../../Protos/SmallButton';
import { Icons } from '../../../Icons/Icons';
import { wp_delete_media_files_by_slugs, wp_get, wp_upload_multiple_files } from '../../../../Apps/wordpress/functions';
import { isArray } from 'lodash';
import { VirtuosoGrid } from 'react-virtuoso';
import { WpFileView } from '../../../Protos/wordpress/WpFileView';
import { NoItemsHere } from '../../../Protos/NoItemsHere';
import { current_project_id } from '../../../../constants/shared';
import { Loader } from '../../../Loader';
import { GridComponents } from '../../../Protos/VirtusoGridComponent';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { toast } from 'react-toastify';
import { ToastMsgInfo } from '../../Protos/ToastMsgInfo';
import { toMB } from '../../../../helpers/bridge';
import { getProjectData, wpWorkerCallbackMaker } from '../../../../helpers/functions';
import { BusyProvider, useBusy } from '../../../Protos/BusyProvider';
import { assetsWorker, pageBuilderWorker } from '../../../../helpers/defineWorkers';



export const MediaManager = () => {
    /**
     * @type {[import('../../../../helpers/types').InfinitelyWpMedia[] , React.Dispatch<React.SetStateAction<import('../../../../helpers/types').InfinitelyWpMedia[]>>]}
     */
    const [mediaFiles, setMediaFiles] = useState([]);
    /**
     * @type {[import('../../../../helpers/types').InfinitelyWpMedia[] , React.Dispatch<React.SetStateAction<import('../../../../helpers/types').InfinitelyWpMedia[]>>]}
     */
    const [mediaSelected, setMediaSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isBusy, runWithBusy } = useBusy();
    const [animateRef] = useAutoAnimate();
    const queryParams = useRef({
        page: 1,
        per_page: 100,
        search: "",
        mime_type: "",
        orderby: "date",
        order: "desc",
    });
    const searchTimer = useRef();
    /**
      * @type {{current : HTMLInputElement}}
      */
    const inputRef = useRef();

    const projectId = +localStorage.getItem(current_project_id);

    const search = (value) => {
        queryParams.current.search = value;
        clearTimeout(searchTimer.current);
        queryParams.current.page = 1;
        setMediaFiles([]);
        searchTimer.current = setTimeout(() => {
            runWithBusy(async () => {
                const tid = toast.loading(<ToastMsgInfo msg="Searching..." />);
                await getMediaFiles();
                toast.dismiss(tid);
            })
        }, 500);
    };

    const openUploader = () => {
        inputRef.current.click();
    };

    const onUploaderLoad = async (ev) => {
        runWithBusy(async () => {
            const tid = toast.loading(<ToastMsgInfo msg="Uploading files..." />)
            try {
                const files = [...ev.target.files];
                if (!files.length) return;
                if (files.length > 50) {
                    toast.dismiss(tid);
                    toast.warn(<ToastMsgInfo msg="You can only upload 50 files at a time" />);
                    return;
                }

                const totalSize = files.reduce((acc, file) => acc + file.size, 0);
                if (totalSize > 100 * 1024 * 1024) {
                    toast.dismiss(tid);
                    toast.warn(<ToastMsgInfo msg="Total file size should not exceed 100MB" />);
                    return;
                }

                if (files.some(file => toMB(file.size) > 10)) {
                    toast.dismiss(tid);
                    toast.warn(<ToastMsgInfo msg="Individual file size should not exceed 10MB" />);
                    return;
                }

                setLoading(true);
                const res = await wp_upload_multiple_files({
                    files,
                    projectId
                });
                if (!res.success) {
                    throw new Error(`Failed to upload files 😑`);
                }
                queryParams.current.page = 1;
                setMediaFiles([]);
                await getMediaFiles();
                setLoading(false);
                toast.done(tid);
                toast.success(<ToastMsgInfo msg="Files uploaded successfully 🎉" />);
            } catch (error) {
                toast.dismiss(tid);
                toast.error(error.message);
                setLoading(false);
            }
        })
    }

    const deleteAll = async () => {
        runWithBusy(async () => {
            if (mediaSelected.length) {
                await deleteSelected();
                return;
            }
            const cnfrm = confirm(`Are you sure to delete ${mediaFiles.length} files?`)
            if (!cnfrm) return;
            setLoading(true);
            const res = await wp_delete_media_files_by_slugs({
                slugs: mediaFiles.map(file => file.slug),
                projectId
            });
            if (!res.success) {
                throw new Error(`Failed to delete files 😑`);
            }
            setMediaFiles([]);
            queryParams.current.page = 1;
            await getMediaFiles();
            setLoading(false);
            toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
        })
    }

    const deleteSelected = async () => {
        return await runWithBusy(async () => {
            const cnfrm = confirm(`Are you sure to delete ${mediaSelected.length} files?`)
            if (!cnfrm) return;
            const tid = toast.loading(<ToastMsgInfo msg="Deleting files..." />)
            return new Promise((res, rej) => {
                try {
                    wpWorkerCallbackMaker(assetsWorker, 'wp_delete_media_files_by_slugs', {
                        slugs: mediaSelected.map(file => file.slug),
                        projectId
                    }, (worker_res) => {
                        if (worker_res.done) {
                            setLoading(true);

                            if (!worker_res.res.success) {
                                rej(new Error(`Failed to delete files 😑`));
                                throw new Error(`Failed to delete files 😑`);
                            }
                            setMediaFiles(mediaFiles.filter(item => !mediaSelected.some(s => s.id === item.id)));
                            setMediaSelected([]);
                            setLoading(false);
                            toast.dismiss(tid);
                            toast.success(<ToastMsgInfo msg="Files deleted successfully 🎉" />);
                            res(worker_res);
                        }
                    })
                } catch (error) {
                    toast.dismiss(tid);
                    toast.error(error.message);
                    rej(error);
                }

            })

        })
    }

    const getMediaFiles = async () => {
        // if (window.__res) return;
        runWithBusy(async () => {
            setLoading(true);
            queryParams.current.page = 1;
            const res = await wp_get({
                endpoint: "media",
                params: queryParams.current,
                projectId
            });
            const projectData = await getProjectData(projectId);
            const excludes = projectData.mainEditorScripts.footer.concat(projectData.mainEditorScripts.header).concat(projectData.globalCss).concat(projectData.globalJs).concat(projectData.mainEditorStyles);
            if (isArray(res)) {
                const willBe = res.filter(item => !excludes.some(ex => ex.id === item.id));
                // window.__res = willBe;
                setMediaFiles((old) => [...willBe]);
            }


            setLoading(false);
        })
    }

    const selectMedia = (media) => {
        const isSelected = mediaSelected.some(item => item.id === media.id);
        if (isSelected) {
            setMediaSelected(prev => prev.filter(item => item.id !== media.id));
        } else {
            setMediaSelected(prev => [...prev, media]);
        }
    }


    useEffect(() => {
        getMediaFiles();
    }, []);


    return (
        <section className=' h-full w-full flex flex-col gap-2 overflow-hidden'>
            <header className="h-[50px!important] flex justify-between items-center gap-2 p-2 overflow-hidden  rounded-lg bg-surface-tertiary ">
                <figure>
                    {/* {Icons.logo({ width: 38 })} */}
                    <img src={config.logo} alt="logo" />
                </figure>

                <Input
                    placeholder="Search..."
                    className="w-full h-full bg-surface-secondary"
                    onInput={(ev) => {
                        search(ev.target.value);
                    }}
                />

                <SmallButton
                    disabled={isBusy}
                    title={mediaSelected.length ? "Delete Selected" : "Delete All"}
                    className="h-full flex-shrink-0 bg-surface-secondary hover:bg-[crimson!important]"
                    onClick={async () => {
                        await deleteAll();
                    }}
                >
                    {Icons.trash("white")}
                </SmallButton>

                <SmallButton
                    disabled={isBusy}
                    className="h-full flex-shrink-0 bg-surface-secondary"
                    title={"Upload"}
                    onClick={openUploader}
                // className="py-[7.5px] px-[30px]  font-bold text-lg"
                >
                    {Icons.upload({ strokeColor: "white" })}
                </SmallButton>
            </header>

            <main className='w-full h-[calc(100%-50px)] overflow-x-hidden overflow-y-auto rounded-lg' ref={animateRef}>
                {loading && <Loader />}
                {!!mediaFiles.length && !loading && (
                    <VirtuosoGrid
                        totalCount={mediaFiles.length}
                        components={GridComponents}
                        style={{
                            height: "100%",
                        }}
                        // className="h-full"
                        className="p-[unset] h-full"
                        // itemClassName="p-[unset]"
                        endReached={async () => {
                            runWithBusy(async () => {
                                if (mediaFiles.length <= 100) return;
                                const tid = toast.loading(<ToastMsgInfo msg={"Loading more files..."} />);
                                queryParams.current.page++;
                                return new Promise((res, rej) => {
                                    wpWorkerCallbackMaker(pageBuilderWorker, 'wp_get', {
                                        endpoint: "media",
                                        params: queryParams.current,
                                        projectId
                                    }, (worker_res) => {
                                        if (isArray(worker_res.res)) {
                                            setMediaFiles(prev => [...prev, ...worker_res.res]);
                                        }
                                        toast.dismiss(tid);
                                        res(worker_res);
                                    });
                                });

                                // const res = await wp_get({
                                //     endpoint: "media",
                                //     params: queryParams.current,
                                //     projectId
                                // });
                                // if (isArray(res)) {
                                //     setMediaFiles(prev => [...prev, ...res]);
                                // }
                                // toast.dismiss(tid);
                            })
                        }}
                        listClassName={`${mediaFiles.length > 3 ? " pr-2" : ""}`}
                        itemContent={(index) => {
                            const i = index,
                                media = mediaFiles[index];
                            // console.log("files from virtuso : ", media);

                            return <WpFileView media={media} setData={getMediaFiles} allowCheckBox checked={mediaSelected.some(item => item.id === media.id)} onChange={() => {
                                selectMedia(media)
                            }} />;
                        }}
                    />
                )}

                {!mediaFiles.length && !loading && (
                    <NoItemsHere title={`No media files found`} />
                )}

                <input
                    onChange={onUploaderLoad}
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={true}
                />
            </main>
        </section>
    )
}
