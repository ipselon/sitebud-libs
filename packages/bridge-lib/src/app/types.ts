import {DocumentContext, SiteMapDataContext_Proxy} from '../core';

export type DocumentDataFetchingStatus = {
    contextProxy?: DocumentContext;
    isUninitialized?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    isSuccess?: boolean;
    isNotFound?: boolean;
    doRedirect?: boolean;
    defaultLocale?: string;
    pathname?: string;
    error?: string;
};

export type SiteMapDataFetchStatus = {
    contextProxy?: SiteMapDataContext_Proxy;
    isLoading?: boolean;
    isError?: boolean;
    error?: string;
};

export type ReadDataFromFileFunc = <T>(filePath: string) => Promise<T>;
