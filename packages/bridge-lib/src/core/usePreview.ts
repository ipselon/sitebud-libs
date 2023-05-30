import {useEffect, useRef, useReducer, useState} from 'react';
import {Data, RequestOptions, SiteTree} from './types';
import {fetchDataPreview} from '../preview/fetchDataPreview';
import {PreviewBus} from '../preview/PreviewBus';
import {siteTreeDefault, cloneDeep} from './defaultBeans';

type PreviewStatus = {
    status: 'success' | 'error' | 'uninitialized' | 'loading';
    error?: string;
}
type PreviewData = {
    documentIdPreview: string;
    siteTreePreview: SiteTree;
};

type PreviewStateAction = {
    type: 'changeStatus' | 'changeData' | 'changeAll',
    newStatus?: PreviewStatus;
    newData?: PreviewData;
};

export type PreviewState = PreviewData & PreviewStatus;

const initialState: PreviewState = {
    status: 'uninitialized',
    documentIdPreview: '',
    siteTreePreview: cloneDeep(siteTreeDefault),
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

export const usePreview = (isPreview: boolean, locale: string, requestOptions: RequestOptions, slug?: string): PreviewState => {
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
                fetchDataPreview(changesData, previewConfig, requestOptions, locale, slug)
                    .then((dataPreview: Data) => {
                        dispatch({
                            type: 'changeAll',
                            newStatus: {status: 'success'},
                            newData: {
                                documentIdPreview: dataPreview.documentId,
                                siteTreePreview: dataPreview.siteTree,
                            }
                        });
                    })
                    .catch((error: any) => {
                        dispatch({
                            type: 'changeAll',
                            newStatus: {status: 'error', error: `Preview Error. ${error.message}`},
                            newData: {
                                documentIdPreview: '',
                                siteTreePreview: cloneDeep(siteTreeDefault),
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
