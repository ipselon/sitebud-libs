import {useState, useEffect} from 'react';
import {DocumentData, Data} from './types';
import {fetchDataPreview} from '../preview/fetchDataPreview';
import {PreviewBus, getPreviewBusInstance} from '../preview/PreviewBus';

export interface PreviewState {
    status: 'success' | 'error' | 'uninitialized';
    error?: string;
    pageDataPreview: DocumentData;
    siteDataPreview: DocumentData;
}

export const usePreview = (isPreview: boolean, locale: string, slug?: string): PreviewState => {
    const [previewState, setPreviewState] = useState<PreviewState>({
        status: 'uninitialized',
        pageDataPreview: {},
        siteDataPreview: {}
    });
    useEffect(() => {
        let previewBus: PreviewBus;
        if (isPreview) {
            previewBus = getPreviewBusInstance();
            if (!previewBus.timeoutId) {
                previewBus.initPreviewConfig((error?: string) => {
                    if (error) {
                        console.error(error);
                        setPreviewState({
                            status: 'error',
                            error: `Preview Error. ${error}`,
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                    } else if (!previewBus.previewConfig) {
                        setPreviewState({
                            status: 'error',
                            error: 'Preview Error. Missing preview config.',
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                    } else if (!locale) {
                        setPreviewState({
                            status: 'error',
                            error: 'Preview Error. Missing locale identification.',
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                    } else {
                        setPreviewState({
                            status: 'uninitialized',
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                        const {changesData, previewConfig} = previewBus;
                        fetchDataPreview(changesData, previewConfig, locale, slug)
                            .then((dataPreview: Data) => {
                                setPreviewState({
                                    status: 'success',
                                    pageDataPreview: dataPreview.pageData,
                                    siteDataPreview: dataPreview.siteData
                                });
                            })
                            .catch((error: any) => {
                                setPreviewState({
                                    status: 'error',
                                    error: `Preview Error. ${error.message}`,
                                    pageDataPreview: {},
                                    siteDataPreview: {}
                                });
                            });
                    }
                });
                previewBus.onPreviewConfigChange(() => {
                    const {changesData, previewConfig} = previewBus;
                    if (!previewConfig) {
                        setPreviewState({
                            status: 'error',
                            error: 'Preview Error. Missing preview config.',
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                    } else {
                        setPreviewState({
                            status: 'uninitialized',
                            pageDataPreview: {},
                            siteDataPreview: {}
                        });
                        fetchDataPreview(changesData, previewConfig, locale, slug)
                            .then((dataPreview: Data) => {
                                setPreviewState({
                                    status: 'success',
                                    pageDataPreview: dataPreview.pageData,
                                    siteDataPreview: dataPreview.siteData
                                });
                            })
                            .catch((error: any) => {
                                setPreviewState({
                                    status: 'error',
                                    error: `Preview Error. ${error.message}`,
                                    pageDataPreview: {},
                                    siteDataPreview: {}
                                });
                            });
                    }
                })
            }
        }
        return () => {
            if (previewBus) {
                previewBus.destroy();
            }
        };
    }, [isPreview, locale, slug]);

    return previewState;
}