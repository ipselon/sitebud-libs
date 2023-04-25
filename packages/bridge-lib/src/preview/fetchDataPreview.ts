import {
    SiteMap_Bean,
    DocumentRecord_Bean,
    Document_Bean,
    DocumentContent_Bean,
    findDocument,
    Document_Common,
    getAllDocuments,
    DocumentContent_Base
} from '@sitebud/domain-lib';
import {createDocumentData, enhanceDocumentData} from '../core/documentDataFactory';
import type {DocumentData} from '../core/types';
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
import {getChanges, setChangesBulk} from './localStorage';
import {Data} from '../core';

const fileRefCache: Map<string, any> = new Map<string, any>();

let branchDataStatus: { status: 'uninitialized' | 'fetching' | 'done' | 'error' } = {status: 'uninitialized'};

async function waitForBranchData(): Promise<void> {
    while (branchDataStatus.status !== 'done') {
        // Wait for 100ms before checking the semaphore again
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // If the semaphore is true, resolve the Promise
    return Promise.resolve();
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
                const branchData = await getBranch(owner, ghToken, repo, workingBranch, noCache);
                (window as any).branchTreeData = await getBranchTree(owner, ghToken, repo, branchData.commit.sha, noCache);
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
    if (!fileRef) {
        throw Error(`Missing the "${filePath}" file reference in the tree`);
    }
    return fileRef;
}

export async function fetchDataFromBranch<T>(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<T> {
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
    const fileRefKey: string = `${filePath}_${fileRef.sha}`;
    let foundCached: any | undefined = fileRefCache.get(fileRefKey);
    if (!foundCached) {
        foundCached = await getJson(owner, ghToken, repo, fileRef.sha, noCache);
        fileRefCache.set(fileRefKey, foundCached);
    }
    return foundCached;
}

async function fetchStringFromBranch(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<string> {
    const {repo, owner, ghToken, workingBranch} = previewConfig;
    const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
    const fileRefKey: string = `${filePath}_${fileRef.sha}`;
    let foundCached: any | undefined = fileRefCache.get(fileRefKey);
    if (!foundCached) {
        foundCached = await getContentString(owner, ghToken, repo, fileRef.sha, noCache);
        fileRefCache.set(fileRefKey, foundCached);
    }
    return foundCached;
}

async function fetchImageFromBranch(filePath: string, previewConfig: PreviewConfig, noCache: boolean = false): Promise<string> {
    try {
        const {repo, owner, ghToken, workingBranch} = previewConfig;
        const fileRef = await getFileRef(owner, ghToken, repo, workingBranch, filePath, noCache);
        const fileRefKey: string = `${filePath}_${fileRef.sha}`;
        let foundCached: any | undefined = fileRefCache.get(fileRefKey);
        if (!foundCached) {
            if (filePath.endsWith('.svg')) {
                foundCached = await getImageSvg(owner, ghToken, repo, fileRef.sha, noCache);
            } else {
                foundCached = await getImage(owner, ghToken, repo, fileRef.sha, noCache);
            }
            fileRefCache.set(fileRefKey, foundCached);
        }
        return foundCached;
    } catch (e) {
        // do not throw the error when there is no image in assets
        return '';
    }
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
    locale: string
): Promise<DocumentData> {
    let result: DocumentData = {};
    const ownerLogin: string | undefined = previewConfig.owner;
    const repoName: string = previewConfig.repo;
    let document: Document_Bean | undefined = getChanges(`${ownerLogin}/${repoName}__documents__${documentId}`);
    if (!document) {
        document = await fetchDataFromBranch<Document_Bean>(`data/documents/${documentId}.json`, previewConfig);
    }
    if (document) {
        const documentContent: DocumentContent_Bean | undefined = document.contents[locale] || document.contents[siteMap.defaultLocale];
        if (!documentContent) {
            throw Error('Page content is not found.');
        }
        let documentCommon: Document_Common | undefined = getChanges(`${ownerLogin}/${repoName}__commons__${document.documentClass}`);
        if (!documentCommon) {
            try {
                documentCommon = await fetchDataFromBranch<Document_Bean>(`data/commons/${document.documentClass}.json`, previewConfig);
            } catch (e) {
                // do nothing when we do not find commons class file
            }
        }
        if (documentCommon && documentCommon.contents && documentCommon.contents[locale]) {
            documentContent.commonAreas = documentCommon.contents[locale].commonAreas || [];
        } else {
            documentContent.commonAreas = [];
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
    locale: string,
    documentSlug?: string
): Promise<DocumentData> {
    let result: DocumentData = {};
    let foundDocument: DocumentRecord_Bean | undefined;
    console.log('[fetchDocumentDataBySlug] documentSlug: ', documentSlug);
    if (documentSlug) {
        foundDocument = findDocumentBySlug(siteMap.root, documentSlug, locale);
        // if (!foundDocument) {
        //     foundDocument = findDocumentBySlug(siteMap.root, documentSlug, siteMap.defaultLocale);
        // }
    } else {
        foundDocument = siteMap.root.children.find(i => i.type === 'main_page' && i.contents[locale]);
    }
    console.log('[fetchDocumentDataBySlug] foundDocument: ', foundDocument);
    if (foundDocument) {
        result = await fetchDocumentDataById(previewConfig, siteMap, foundDocument.id, locale);
    }
    return result;
}

async function fetchDocumentsDataByParentId(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    parentDocumentId: string,
    locale: string
): Promise<Array<DocumentData>> {
    const resultList: Array<DocumentData> = [];
    const foundParentDocumentRecord: DocumentRecord_Bean | undefined = findDocument(siteMap.root, parentDocumentId);
    if (foundParentDocumentRecord && foundParentDocumentRecord.children && foundParentDocumentRecord.children.length > 0) {
        for (const documentItem of foundParentDocumentRecord.children) {
            resultList.push(await fetchDocumentDataById(previewConfig, siteMap, documentItem.id, locale));
        }
    }
    return resultList;
}

async function fetchDocumentsDataByTag(
    previewConfig: PreviewConfig,
    siteMap: SiteMap_Bean,
    tag: string,
    locale: string
): Promise<Array<DocumentData>> {
    const resultList: Array<DocumentData> = [];
    const foundDocumentRecords: Array<DocumentRecord_Bean> = getAllDocuments(siteMap.root, (documentRecord: DocumentRecord_Bean) => {
        const foundDocumentContent: DocumentContent_Base | undefined = documentRecord.contents[locale];
        return !!foundDocumentContent && foundDocumentContent.tags[tag] >= 1;
    });
    if (foundDocumentRecords && foundDocumentRecords.length > 0) {
        for (const documentItem of foundDocumentRecords) {
            resultList.push(await fetchDocumentDataById(previewConfig, siteMap, documentItem.id, locale));
        }
    }
    return resultList;
}

async function fetchSiteMap(previewConfig: PreviewConfig): Promise<SiteMap_Bean> {
    const ownerLogin: string | undefined = previewConfig.owner;
    const repoName: string = previewConfig.repo;
    let siteMap: SiteMap_Bean = getChanges(`${ownerLogin}/${repoName}__siteMap`);
    if (!siteMap) {
        siteMap = await fetchDataFromBranch<SiteMap_Bean>('data/siteMap.json', previewConfig);
    }
    if (!siteMap) {
        throw Error('Site map file is not found.');
    }
    return siteMap;
}

async function fetchDocumentData(previewConfig: PreviewConfig, siteMap: SiteMap_Bean, locale: string, slug?: string): Promise<DocumentData> {
    const result: DocumentData = await fetchDocumentDataBySlug(previewConfig, siteMap, locale, slug);
    if (result.documentDataListByParentId) {
        const newPageDataListByParentIdMap: Record<string, Array<DocumentData>> = {};
        for (const parentId of Object.keys(result.documentDataListByParentId)) {
            const childrenDocumentData: Array<DocumentData> =
                await fetchDocumentsDataByParentId(previewConfig, siteMap, parentId, locale);
            if (childrenDocumentData.length > 0) {
                newPageDataListByParentIdMap[parentId] = [];
                for (const childDocumentData of childrenDocumentData) {
                    if (childDocumentData && childDocumentData.content) {
                        newPageDataListByParentIdMap[parentId].push(childDocumentData);
                    }
                }
            }
        }
        result.documentDataListByParentId = newPageDataListByParentIdMap;
    }
    if (result.documentDataById) {
        const newPageDataByIdMap: Record<string, DocumentData> = {};
        for (const documentId of Object.keys(result.documentDataById)) {
            const documentData: DocumentData =
                await fetchDocumentDataById(previewConfig, siteMap, documentId, locale);
            if (documentData && documentData.content) {
                newPageDataByIdMap[documentId] = documentData;
            }
        }
        result.documentDataById = newPageDataByIdMap;
    }
    if (result.documentDataListByTag) {
        const newPageDataListByTagMap: Record<string, Array<DocumentData>> = {};
        for (const tag of Object.keys(result.documentDataListByTag)) {
            const tagsDocumentData: Array<DocumentData> =
                await fetchDocumentsDataByTag(previewConfig, siteMap, tag, locale);
            if (tagsDocumentData.length > 0) {
                newPageDataListByTagMap[tag] = [];
                for (const tagDocumentData of tagsDocumentData) {
                    if (tagDocumentData && tagDocumentData.content) {
                        newPageDataListByTagMap[tag].push(tagDocumentData);
                    }
                }
            }
        }
        result.documentDataListByTag = newPageDataListByTagMap;
    }
    return enhanceDocumentData(result, siteMap, locale);
}

export async function fetchFileData(previewConfig: PreviewConfig, filePath: string, noCache: boolean = false): Promise<FileDataFetchingStatus> {
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

export async function fetchImageData(previewConfig: PreviewConfig, filePath: string, noCache: boolean = false): Promise<string> {
    return await fetchImageFromBranch(filePath, previewConfig, noCache);
}

export async function fetchExtraData(documentData: DocumentData, previewConfig: PreviewConfig, siteMap: SiteMap_Bean, locale: string): Promise<DocumentData> {
    documentData.authorProfiles = {};
    if (siteMap.authorsDocumentIds) {
        const localeAuthorDocumentIds: Record<string, string> | undefined = siteMap.authorsDocumentIds[locale];
        if (localeAuthorDocumentIds) {
            for (const authorDocumentId of Object.entries(localeAuthorDocumentIds)) {
                const authorProfileDocumentData: DocumentData = await fetchDocumentDataById(previewConfig, siteMap, authorDocumentId[1], locale);
                documentData.authorProfiles[authorDocumentId[0]] = enhanceDocumentData(authorProfileDocumentData, siteMap, locale);
            }
        }
    }
    return documentData;
}

export async function fetchDataPreview(changesData: any, previewConfig: PreviewConfig, locale: string, slug?: string): Promise<Data> {
    setChangesBulk(changesData);
    setImageResolver(async (imgSrc?: string | null) => {
        if (imgSrc && imgSrc.startsWith("/_assets/images")) {
            return fetchImageData(previewConfig, `public${imgSrc}`);
        }
        return imgSrc || '';
    });
    const siteMap: SiteMap_Bean = await fetchSiteMap(previewConfig);
    const pageData: DocumentData = await fetchDocumentData(previewConfig, siteMap, locale, slug);
    let siteData: DocumentData = await fetchDocumentData(previewConfig, siteMap, locale, '@site');
    siteData = await fetchExtraData(siteData, previewConfig, siteMap, locale);
    return {
        pageData,
        siteData
    }
}
