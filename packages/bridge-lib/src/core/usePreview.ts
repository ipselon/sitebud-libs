import {useState, useEffect} from 'react';
import {DocumentData} from './types';
import {fetchDataPreview} from '../preview/fetchDataPreview';
import {PreviewBus, getPreviewBusInstance} from '../preview/PreviewBus';

export interface PreviewState {
    status: 'success' | 'error' | 'uninitialized';
    error?: string;
    pageDataPreview: DocumentData;
    siteDataPreview: DocumentData;
}

export const usePreview = (isPreview: boolean, locale?: string, slug?: string): PreviewState => {
    const [previewState, setPreviewState] = useState<PreviewState>({
        status: 'uninitialized',
        pageDataPreview: {},
        siteDataPreview: {}
    });
    useEffect(() => {
        if (isPreview && previewState.status === 'uninitialized') {
            const previewBus: PreviewBus = getPreviewBusInstance();
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
                        console.log('[Home] try to get data from branch');
                        const {changesData, previewConfig} = previewBus;
                        fetchDataPreview(changesData, previewConfig, locale, slug)
                            .then((pageDataPreview: DocumentData) => {
                                return fetchDataPreview(changesData, previewConfig, locale, '@site')
                                    .then((siteDataPreview: DocumentData) => {
                                        setPreviewState({
                                            status: 'success',
                                            pageDataPreview,
                                            siteDataPreview
                                        });
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
            }
        }
    }, [isPreview, locale, previewState]);

    return previewState;
}