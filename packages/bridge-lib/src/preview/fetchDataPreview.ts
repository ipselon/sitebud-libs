import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    Document_Bean,
    DocumentContent_Bean,
    findDocument,
    DocumentContent_Base
} from '@sitebud/domain-lib';
import {createDocumentData, enhanceDocumentData} from '../core/documentDataFactory';
import type {
    DocumentData,
    Data,
    RequestOptions,
    FetchOptions,
    FoundByParentReference,
} from '../core/types';
import {removeRestrictedBlocks, filterAreas} from '../core/documentDataUtility';
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
import {getChanges, setChangesBulk} from './memoryStorage';
import {getFromCache, putIntoCache, getCacheKeys, delFromCache} from './storage/localStorage';
import {documentDataDefault} from '../core/defaultBeans';

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

function findDocumentBySlug(root: DocumentRecord_Bean, documentSlug: string, locale: string): DocumentRecord_Bean | undefined {
    const foundContent = root.contents[locale];
    if (foundContent && foundContent.slug === documentSlug) {
        return root;
    } else {
        let foundDocument: DocumentRecord_Bean | undefined;
        if (root.children && root.children.length > 0) {
            let childDocument: DocumentRecord_Bean;
            for (childDocument of root.children) {
                foundDocument = findDocumentBySlug(childDocument, documentSlug, locale);
                if (foundDocument) {
                    break;
                }
            }
        }
        return foundDocument;
    }
}

async function fetchDocumentDataById(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    documentId: string,
    fetchOptions: FetchOptions,
    nestedLevel: number,
    locale: string
): Promise<DocumentData> {
    let result: DocumentData = {...documentDataDefault};
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
        const documentContent: DocumentContent_Bean | undefined = document.contents[locale];
        // todo: should we return default locale if we didn't find the document content with requested locale?
        // const documentContent: DocumentContent_Bean | undefined = document.contents[locale] || document.contents[siteMap.defaultLocale];
        if (!documentContent) {
            throw Error('Page content is not found.');
        }
        const {accessLevel, requiredDocumentAreas} = fetchOptions;
        if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
            if (nestedLevel > 0) {
                documentContent.documentAreas = filterAreas(documentContent.documentAreas, requiredDocumentAreas);
            }
            documentContent.documentAreas = removeRestrictedBlocks(documentContent.documentAreas, accessLevel);
        }
        result = await createDocumentData({
            documentClass: document.documentClass,
            locale,
            siteMap,
            documentId: document.id,
            documentType: document.type,
            documentContent
        });
    }
    return result;
}

async function fetchDocumentDataBySlug(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    nestedLevel: number,
    locale: string,
    documentSlug?: string
): Promise<DocumentData> {
    let result: DocumentData = {...documentDataDefault};
    let foundDocument: DocumentRecord_Bean | undefined;
    if (documentSlug) {
        foundDocument = findDocumentBySlug(siteMap.root, documentSlug, locale);
        // if (!foundDocument) {
        //     foundDocument = findDocumentBySlug(siteMap.root, documentSlug, siteMap.defaultLocale);
        // }
    } else {
        foundDocument = siteMap.root.children.find(i => i.type === 'main_page' && i.contents[locale]);
    }
    if (foundDocument) {
        result = await fetchDocumentDataById(previewConfig, siteMap, foundDocument.id, fetchOptions, nestedLevel, locale);
    }
    return result;
}

async function fetchDocumentsDataByParentId(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    nestedLevel: number,
    parentDocumentId: string,
    locale: string
): Promise<{parentReference?: FoundByParentReference; array: Array<DocumentData>;}> {
    const resultList: Array<DocumentData> = [];
    let parentReference: FoundByParentReference | undefined = undefined;
    const foundParentDocumentRecord: DocumentRecord_Bean | undefined = findDocument(siteMap.root, parentDocumentId);
    if (foundParentDocumentRecord && foundParentDocumentRecord.children && foundParentDocumentRecord.children.length > 0) {
        const foundDocumentContent: DocumentContent_Base | undefined = foundParentDocumentRecord.contents[locale];
        if (foundDocumentContent) {
            parentReference = {
                id: foundParentDocumentRecord.id,
                title: foundDocumentContent.title,
                slug: foundDocumentContent.slug
            }
        }
        for (const documentItem of foundParentDocumentRecord.children) {
            try {
                resultList.push(await fetchDocumentDataById(previewConfig, siteMap, documentItem.id, fetchOptions, nestedLevel, locale));
            } catch (e) {
                // do nothing...
            }
        }
    }
    return {parentReference, array: resultList};
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

async function fetchDocumentLinkedData(
    documentData: DocumentData,
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    locale: string,
    level: number = 1
): Promise<DocumentData> {
    const {
        documentDataListByParentId,
        documentDataById,
        // documentDataListByTag
    } = documentData;
    if (documentDataListByParentId) {
        for (const parentDataLink of Object.entries(documentDataListByParentId)) {
            const {parentReference, array} =
                await fetchDocumentsDataByParentId(
                    previewConfig,
                    siteMap,
                    {...fetchOptions, requiredDocumentAreas: parentDataLink[1].options.documentAreas},
                    level,
                    parentDataLink[0],
                    locale
                );
            parentDataLink[1].parentReference = parentReference;
            if (array.length > 0) {
                const fetchedDataList: Array<DocumentData> = [];
                for (const childDocumentData of array) {
                    if (childDocumentData && childDocumentData.content) {
                        if (level < 2) {
                            const documentWithLinkedData: DocumentData = await fetchDocumentLinkedData(
                                childDocumentData,
                                previewConfig,
                                siteMap,
                                fetchOptions,
                                locale,
                                level + 1
                            );
                            fetchedDataList.push(documentWithLinkedData);
                        } else {
                            fetchedDataList.push(childDocumentData);
                        }
                    }
                }
                parentDataLink[1].array = fetchedDataList;
            }
        }
    }
    if (documentDataById) {
        for (const dataLink of Object.entries(documentDataById)) {
            try {
                let documentData: DocumentData = await fetchDocumentDataById(
                    previewConfig,
                    siteMap,
                    dataLink[0],
                    {...fetchOptions, requiredDocumentAreas: dataLink[1].options.documentAreas},
                    level,
                    locale
                );
                if (documentData && documentData.content) {
                    if (level < 2) {
                        documentData = await fetchDocumentLinkedData(documentData, previewConfig, siteMap, fetchOptions, locale, level + 1);
                    }
                    dataLink[1].item = documentData;
                }
            } catch (e) {
                // do nothing...
            }
        }
    }
    return enhanceDocumentData(documentData, siteMap, locale);
}

async function fetchDocumentData(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    locale: string,
    slug?: string
): Promise<DocumentData> {
    const result: DocumentData = await fetchDocumentDataBySlug(
        previewConfig,
        siteMap,
        fetchOptions,
        0,
        locale,
        slug
    );
    return await fetchDocumentLinkedData(result, previewConfig, siteMap, fetchOptions, locale);
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
    const pageData: DocumentData = await fetchDocumentData(previewConfig, siteMap, fetchOptions, locale, slug);
    let siteData: DocumentData = await fetchDocumentData(previewConfig, siteMap, fetchOptions, locale, '@site');
    // siteData = await fetchExtraData(siteData, previewConfig, siteMap, fetchOptions, locale);
    return {
        pageData,
        siteData
    }
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
