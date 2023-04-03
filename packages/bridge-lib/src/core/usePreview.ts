import {useState, useEffect} from 'react';
import {PageData} from './types';
import {PreviewBus, getPreviewBusInstance, fetchPageDataPreview} from '../preview';

interface PreviewState {
    status: 'success' | 'error' | 'uninitialized';
    error?: string;
    pageDataPreview?: PageData;
}

export const usePreview = (isPreview: boolean, locale?: string, slug?: string): any => {
    const [previewState, setPreviewState] = useState<PreviewState>({status: 'uninitialized'});
    useEffect(() => {
        if (isPreview && previewState.status === 'uninitialized') {
            const previewBus: PreviewBus = getPreviewBusInstance();
            if (!previewBus.timeoutId) {
                previewBus.initPreviewConfig((error?: string) => {
                    if (error) {
                        console.error(error);
                        setPreviewState({
                            status: 'error', error: `Preview Error. ${error}`
                        });
                    } else if (!previewBus.previewConfig) {
                        setPreviewState({
                            status: 'error', error: 'Preview Error. Missing preview config.'
                        });
                    } else if (!locale) {
                        setPreviewState({
                            status: 'error', error: 'Preview Error. Missing locale identification.'
                        });
                    } else {
                        console.log('[Home] try to get data from branch');
                        fetchPageDataPreview(previewBus.changesData, previewBus.previewConfig, locale, slug)
                            .then((pageDataPreview: PageData) => {
                                setPreviewState({
                                    status: 'success',
                                    pageDataPreview,
                                });
                            })
                            .catch((error: any) => {
                                setPreviewState({
                                    status: 'error', error: `Preview Error. ${error.message}`
                                });
                            });
                    }
                });
            }
        }
    }, [isPreview, locale, previewState]);

    return previewState;
}