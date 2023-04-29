import {useEffect, useRef, useReducer, useState} from 'react';
import {DocumentData, Data} from './types';
import {fetchDataPreview} from '../preview/fetchDataPreview';
import {PreviewBus} from '../preview/PreviewBus';

type PreviewStatus = {
    status: 'success' | 'error' | 'uninitialized' | 'loading';
    error?: string;
}
type PreviewData = {
    pageDataPreview: DocumentData;
    siteDataPreview: DocumentData;
};

type PreviewStateAction = {
    type: 'changeStatus' | 'changeData' | 'changeAll',
    newStatus?: PreviewStatus;
    newData?: PreviewData;
};

export type PreviewState = PreviewData & PreviewStatus;

const initialState: PreviewState = {
    status: 'uninitialized',
    pageDataPreview: {},
    siteDataPreview: {},
};

function reducer(state: PreviewState, action: PreviewStateAction): PreviewState {
    const {type, newStatus, newData} = action;
    switch (type) {
        case 'changeAll':
            return {
                ...state,
                ...newStatus,
                ...newData
            };
        case 'changeData':
            return {
                ...state,
                ...newData
            };
        case 'changeStatus':
            return {
                ...state,
                ...newStatus
            };
        default:
            throw new Error('Wrong action type');
    }
}

export const usePreview = (isPreview: boolean, locale: string, slug?: string): PreviewState => {
    const previewBusRef = useRef<PreviewBus>();
    const [previewBusChangesCounter, setPreviewBusChangesCounter] = useState<number>(0);
    const [previewState, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (previewBusRef.current && previewBusChangesCounter > 0) {
            const {changesData, previewConfig} = previewBusRef.current;
            if (!previewConfig) {
                dispatch({
                    type: 'changeStatus',
                    newStatus: {status: 'error', error: 'Preview Error. Missing preview config.'}
                });
            } else {
                dispatch({
                    type: 'changeStatus',
                    newStatus: {status: 'loading'}
                });
                fetchDataPreview(changesData, previewConfig, locale, slug)
                    .then((dataPreview: Data) => {
                        dispatch({
                            type: 'changeAll',
                            newStatus: {status: 'success'},
                            newData: {
                                pageDataPreview: dataPreview.pageData,
                                siteDataPreview: dataPreview.siteData
                            }
                        });
                    })
                    .catch((error: any) => {
                        dispatch({
                            type: 'changeAll',
                            newStatus: {status: 'error', error: `Preview Error. ${error.message}`},
                            newData: {
                                pageDataPreview: {},
                                siteDataPreview: {}
                            }
                        });
                    });
            }

        }
    }, [
        previewBusChangesCounter,
        locale,
        slug
    ]);

    useEffect(() => {
        if (isPreview && !previewBusRef.current) {
            previewBusRef.current = new PreviewBus();
            if (previewBusRef.current) {
                previewBusRef.current.onChange(() => {
                    setPreviewBusChangesCounter((prevValue: number) => prevValue + 1);
                });
                previewBusRef.current.initPreviewConfig((error?: string) => {
                    if (error) {
                        console.error(error);
                        dispatch({
                            type: 'changeStatus',
                            newStatus: {status: 'error', error: `Preview Error. ${error}`}
                        });
                    }
                });
            }
        }
    }, []);

    return previewState;
}
