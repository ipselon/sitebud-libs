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

/**
 * This function exists here because of
 * fs-extra can not be bundled due to missing ESM support:
 * https://github.com/jprichardson/node-fs-extra/issues/746
 */
export type ReadDataFunc = <T>(filePath: string) => Promise<T>;
