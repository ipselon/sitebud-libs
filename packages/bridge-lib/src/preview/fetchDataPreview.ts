import {
    SiteMap_Bean,
    Document_Bean
} from '@sitebud/domain-lib';
import {
    makeSiteIndex,
} from '../core/documentDataFactory';
import {fetchData} from '../core/dataFactory';
import type {
    Data,
    RequestOptions,
    FetchOptions,
    SiteMapIndex,
} from '../core/types';
import {setImageResolver} from '../core/imageResolver';
import {
    getBranch,
    getBranchTree,
    getJson,
    getContentString,
    getImage,
    getImageSvg
} from './github/githubService';
import {PreviewConfig} from './PreviewBus';
import {FileDataFetchingStatus} from './types';
import {
    getChanges,
    setChangesBulk
} from './memoryStorage';
import {
    getFromCache,
    putIntoCache,
    getCacheKeys,
    delFromCache
} from './storage/localStorage';

let branchDataStatus: { status: 'uninitialized' | 'fetching' | 'done' | 'error' } = {status: 'uninitialized'};

async function waitForBranchData(): Promise<void> {
    while (branchDataStatus.status !== 'done') {
        // Wait for 100ms before checking the semaphore again
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // If the semaphore is true, resolve the Promise
    return Promise.resolve();
}

function makeCacheKey(owner: string, repo: string, filePath: string, fileSha: string): string {
    return `${owner}_${repo}_${filePath}_${fileSha}`;
}

function makeCacheKeyPrefix(owner: string, repo: string): string {
    return `${owner}_${repo}_`;
}

async function cleanLocalStorage(owner: string, repo: string): Promise<void> {
    const lastCleaningTimestampKey: string = `LAST_CLEANING_TIMESTAMP_${owner}_${repo}`;
    const lastCleaningTimestamp = await getFromCache(lastCleaningTimestampKey);
    if (!lastCleaningTimestamp || Date.now() - lastCleaningTimestamp > (1000 * 60 * 10)) { // 10 minutes
        const currentRepoKeyPrefix: string = makeCacheKeyPrefix(owner, repo);
        await putIntoCache(lastCleaningTimestampKey, Date.now());
        let allCacheKeys: Array<string> = await getCacheKeys();
        allCacheKeys = allCacheKeys.filter(i => i.startsWith(currentRepoKeyPrefix));
        const validCacheKeys: Array<string> = [];
        for (const treeEntry of (window as any).branchTreeData.tree) {
            validCacheKeys.push(makeCacheKey(owner, repo, treeEntry.path, treeEntry.sha));
        }
        const delTasks: Array<Promise<void>> = [];
        for (const existingCacheKey of allCacheKeys) {
            if (!validCacheKeys.includes(existingCacheKey)) {
                delTasks.push(delFromCache(existingCacheKey));
            }
        }
        await Promise.all(delTasks);
    }
}

async function getFileRef(owner: string, ghToken: string, repo: string, workingBranch: string, filePath: string, noCache: boolean = false) {
    if ((window as any).branchTreeData && noCache) {
        if (branchDataStatus.status === 'fetching') {
            await waitForBranchData();
        }
        (window as any).branchTreeData = undefined;
        branchDataStatus.status = 'uninitialized'
    }
    if (!(window as any).branchTreeData) {
        if (branchDataStatus.status === 'uninitialized') {
            try {
                branchDataStatus.status = 'fetching';
                const branchData = await getBranch(owner, ghToken, repo, workingBranch, true);
                (window as any).branchTreeData = await getBranchTree(owner, ghToken, repo, branchData.commit.sha, true);
                branchDataStatus.status = 'done';
            } catch (e: any) {
                branchDataStatus.status = 'error';
                throw Error(`Can not read the ${workingBranch} working branch data. ${e.message}`);
            }
        } else if (branchDataStatus.status === 'fetching') {
            await waitForBranchData();
        }
    }
    if (!(window as any).branchTreeData) {
        throw Error('Missing the working branch data');
    }
    const fileRef = (window as any).branchTreeData.tree.find((i: any) => i.path === filePath);
    await cleanLocalStorage(owner, repo);
    // if (!fileRef) {
    //     throw Error(`Missing the "${filePath}" file reference in the tree`);
    // }
    return fileRef;
}

export async function fetchDataFromBranch<T>(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<T | undefined> {
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
    if (fileRef) {
        const fileRefKey: string = makeCacheKey(owner, repo, filePath, fileRef.sha);
        let foundCached: any | undefined = await getFromCache(fileRefKey);
        if (!foundCached) {
            foundCached = await getJson(owner, ghToken, repo, fileRef.sha, noCache);
            await putIntoCache(fileRefKey, foundCached);
        }
        return foundCached;
    }
    console.warn(`[SiteBud] Missing the "${filePath}" file reference in the tree`);
    return undefined;
}

async function fetchStringFromBranch(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<string> {
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
    if (fileRef) {
        const fileRefKey: string = makeCacheKey(owner, repo, filePath, fileRef.sha);
        let foundCached: any | undefined = await getFromCache(fileRefKey);
        if (!foundCached) {
            foundCached = await getContentString(owner, ghToken, repo, fileRef.sha, noCache);
            await putIntoCache(fileRefKey, foundCached);
        }
        return foundCached;
    }
    console.warn(`[SiteBud] Missing the "${filePath}" file reference in the tree`);
    return '';
}

async function fetchImageFromBranch(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<string> {
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
    if (fileRef) {
        const fileRefKey: string = makeCacheKey(owner, repo, filePath, fileRef.sha);
        let foundCached: any | undefined = await getFromCache(fileRefKey);
        if (!foundCached) {
            if (filePath.endsWith('.svg')) {
                foundCached = await getImageSvg(owner, ghToken, repo, fileRef.sha, noCache);
            } else {
                foundCached = await getImage(owner, ghToken, repo, fileRef.sha, noCache);
            }
            await putIntoCache(fileRefKey, foundCached);
        }
        return foundCached;
    }
    console.warn(`[SiteBud] Missing the "${filePath}" file reference in the tree`);
    return '';
}

const fetchDocumentDataById = (previewConfig: PreviewConfig) => async (fetchOptions: FetchOptions, documentId: string, locale: string): Promise<Document_Bean> =>  {
    const ownerLogin: string | undefined = previewConfig.owner;
    const repoName: string = previewConfig.repo;
    let document: Document_Bean | undefined;
    const memCacheDocument: Document_Bean | undefined = getChanges(`${ownerLogin}/${repoName}__documents__${documentId}`);
    if (memCacheDocument) {
        document = JSON.parse(JSON.stringify(memCacheDocument));
    }
    if (!document) {
        document = await fetchDataFromBranch<Document_Bean>(`data/documents/${documentId}.json`, previewConfig);
    }
    if (document) {
        if (document.isDeleted) {
            throw Error('Page was deleted.');
        }
        return document;
    }
    throw Error(`Document ${documentId} was not found.`)
}

async function fetchSiteMap(previewConfig: PreviewConfig): Promise<SiteMap_Bean> {
    const ownerLogin: string | undefined = previewConfig.owner;
    const repoName: string = previewConfig.repo;
    let siteMap: SiteMap_Bean | undefined = getChanges(`${ownerLogin}/${repoName}__siteMap`);
    if (!siteMap) {
        siteMap = await fetchDataFromBranch<SiteMap_Bean>('data/siteMap.json', previewConfig);
    }
    if (!siteMap) {
        throw Error('Site map file is not found.');
    }
    return siteMap;
}

export async function fetchFileData(
    previewConfig: PreviewConfig,
    filePath: string,
    noCache: boolean = false
): Promise<FileDataFetchingStatus> {
    try {
        const fileContent: string = await fetchStringFromBranch(filePath, previewConfig, noCache);
        return {
            fileContent
        };
    } catch (e: any) {
        return {
            isError: true,
            error: e.message,
        }
    }
}

export async function fetchImageData(
    previewConfig: PreviewConfig,
    filePath: string,
    noCache: boolean = false
): Promise<string> {
    return await fetchImageFromBranch(filePath, previewConfig, noCache);
}

export async function fetchDataPreview(
    changesData: any,
    previewConfig: PreviewConfig,
    requestOptions: RequestOptions,
    locale: string,
    slug?: string
): Promise<Data> {
    setChangesBulk(changesData);
    setImageResolver(async (imgSrc?: string | null) => {
        if (imgSrc && imgSrc.startsWith("/_assets/images")) {
            try {
                return fetchImageData(previewConfig, `public${imgSrc}`);
            } catch (e) {
                //
            }
        }
        return imgSrc || '';
    });
    const fetchOptions: FetchOptions = {...requestOptions};
    const siteMap: SiteMap_Bean = await fetchSiteMap(previewConfig);
    const siteIndex: SiteMapIndex = makeSiteIndex(siteMap.root, {}, siteMap.defaultLocale, locale);
    const validLocale: string = locale || siteMap.defaultLocale;
    return fetchData(
        siteMap,
        siteIndex,
        fetchOptions,
        validLocale,
        fetchDocumentDataById(previewConfig),
        slug
    );
}

export async function cleanDataCache(previewConfig: PreviewConfig): Promise<void> {
    if (branchDataStatus.status === 'fetching') {
        await waitForBranchData();
    }
    (window as any).branchTreeData = undefined;
    branchDataStatus.status = 'uninitialized';
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    try {
        branchDataStatus.status = 'fetching';
        const branchData = await getBranch(owner, ghToken, repo, workingBranch, true);
        (window as any).branchTreeData = await getBranchTree(owner, ghToken, repo, branchData.commit.sha, true);
        branchDataStatus.status = 'done';
    } catch (e: any) {
        branchDataStatus.status = 'error';
        throw Error(`Can not read the ${workingBranch} working branch data. ${e.message}`);
    }
}
