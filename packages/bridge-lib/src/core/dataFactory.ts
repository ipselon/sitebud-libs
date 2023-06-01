import {DocumentRecord_Bean, SiteMap_Bean, Document_Bean, DocumentContent_Bean} from '@sitebud/domain-lib';
import {SiteMapIndex, SiteTreeNode, SiteMapIndexRecord, SiteTree, DocumentData, FetchOptions, Data} from './types';
import {cloneDeep, siteTreeNodeDefault, siteTreeDefault} from './defaultBeans';
import {removeRestrictedBlocks, clearIds, getLinkedDocumentIds} from './documentDataUtility';
import {createDocumentData} from './documentDataFactory';

type FetchDocumentByIdFn = (fetchOptions: FetchOptions, documentId: string, locale: string) => Promise<Document_Bean>;

const documentDataMap: Map<string, DocumentData> = new Map<string, DocumentData>();

async function fetchDocument(
    siteIndex: SiteMapIndex,
    fetchOptions: FetchOptions,
    documentId: string,
    locale: string,
    fetchDocumentById: FetchDocumentByIdFn
): Promise<void> {
    const {accessLevel} = fetchOptions;
    const fetchedDocument: Document_Bean = await fetchDocumentById(fetchOptions, documentId, locale);
    const documentContent: DocumentContent_Bean | undefined = fetchedDocument.contents[locale];
    if (!documentContent) {
        throw Error(`Document "${documentId}" content for "${locale}" locale is not found.`);
    }
    if (documentContent.documentAreas && documentContent.documentAreas.length > 0) {
        documentContent.documentAreas = removeRestrictedBlocks(documentContent.documentAreas, accessLevel);
        documentContent.documentAreas = clearIds(documentContent.documentAreas);
    }
    const documentPath: string = siteIndex[documentId]?.nodePath;
    documentDataMap.set(
        documentId,
        await createDocumentData(
            fetchedDocument.documentClass,
            documentContent,
            fetchedDocument.id,
            fetchedDocument.type,
            locale,
            documentPath
        )
    );
    const linkedDocumentIds: Array<string> = getLinkedDocumentIds(documentContent.documentAreas, siteIndex);
    if (linkedDocumentIds) {
        for (const linkedDocumentId of linkedDocumentIds) {
            if (!documentDataMap.has(linkedDocumentId)) {
                await fetchDocument(siteIndex, fetchOptions, linkedDocumentId, locale, fetchDocumentById);
            }
        }
    }
}

function makeSiteTreeNode(documentRecord: DocumentRecord_Bean, siteIndex: SiteMapIndex): SiteTreeNode {
    const foundIndexRecord: SiteMapIndexRecord | undefined = siteIndex[documentRecord.id];
    if (foundIndexRecord) {
        const treeNode: SiteTreeNode = {
            id: documentRecord.id,
            documentClass: documentRecord.documentClass || '',
            name: foundIndexRecord.title || '',
            path: foundIndexRecord.nodePath || '',
            children: []
        };
        const foundDocumentData: DocumentData | undefined = documentDataMap.get(documentRecord.id);
        if (foundDocumentData) {
            treeNode.documentData = foundDocumentData;
        }
        if (documentRecord.children && documentRecord.children.length > 0) {
            for (const documentRecordChild of documentRecord.children) {
                treeNode.children.push(makeSiteTreeNode(documentRecordChild, siteIndex));
            }
        }
        return treeNode;
    }
    return cloneDeep(siteTreeNodeDefault);
}

export async function fetchData(
    siteMap: SiteMap_Bean,
    siteIndex: SiteMapIndex,
    fetchOptions: FetchOptions,
    locale: string,
    fetchDocumentById: FetchDocumentByIdFn,
    slug?: string
): Promise<Data> {
    const foundSiteDocument: DocumentRecord_Bean | undefined = siteIndex['site']?.node;
    if (!foundSiteDocument) {
        console.error('[SiteBud CMS] Can not find the site document in the "data/siteMap.json" file.');
        throw Error('Not Found');
    }
    // search the required document in the site map
    let foundDocument: DocumentRecord_Bean | undefined;
    if (slug) {
        let foundIndexRecord: [string, SiteMapIndexRecord] | undefined = Object.entries(siteIndex).find(([id, record]) => record.slug === slug);
        if (!foundIndexRecord) {
            console.error(`[SiteBud CMS] Can not find a document with slug "${slug}" in the "data/siteMap.json" file.`);
            throw Error('Not Found');
        }
        if (foundIndexRecord && foundIndexRecord[1]) {
            foundDocument = foundIndexRecord[1].node;
        }
    } else {
        foundDocument = siteIndex['main_page']?.node;
    }
    if (!foundDocument) {
        console.error(`[SiteBud CMS] Can not find a document in the "data/siteMap.json" file.`);
        throw Error('Not Found');
    }
    documentDataMap.clear();
    await fetchDocument(siteIndex, fetchOptions, foundSiteDocument.id, locale, fetchDocumentById);
    await fetchDocument(siteIndex, fetchOptions, foundDocument.id, locale, fetchDocumentById);

    let siteTree: SiteTree = cloneDeep(siteTreeDefault);
    if (siteMap && siteMap.root) {
        siteTree.root = makeSiteTreeNode(siteMap.root, siteIndex);
    }
    return {
        documentId: foundDocument.id,
        siteTree
    };
}
