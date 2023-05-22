import {SiteMap_Bean} from '@sitebud/domain-lib';
import {enhanceDocumentData} from '../core/documentDataFactory';
import {DocumentData, FetchOptions} from '../core/types';
import {fetchDocumentsDataByParentId} from './fetchDocumentsDataByParentId';
import {fetchDocumentDataById} from './fetchDocumentDataById';

export async function fetchLinkedData(
    documentData: DocumentData,
    siteMap: SiteMap_Bean,
    fetchOptions: FetchOptions,
    locale: string | undefined,
    level: number = 1
): Promise<DocumentData> {
    const {
        documentDataListByParentId,
        documentDataById,
    } = documentData;
    if (documentDataListByParentId) {
        for (const parentDataLink of Object.entries(documentDataListByParentId)) {
            const {parentReference, array} = await fetchDocumentsDataByParentId(
                siteMap,
                parentDataLink[0],
                {
                    ...fetchOptions,
                    requiredDocumentAreas: parentDataLink[1].options.documentAreas,
                    requiredDocumentClasses: parentDataLink[1].options.documentClasses
                },
                level,
                locale
            );
            parentDataLink[1].parentReference = parentReference;
            if (array.length > 0) {
                const fetchedDataList: Array<DocumentData> = [];
                for (const childDocumentData of array) {
                    if (level < 2) { // todo: possible to be a library global parameter fetchingDepthLevel
                        // go to recursion
                        const withLinkedData: DocumentData = await fetchLinkedData(
                            childDocumentData,
                            siteMap,
                            fetchOptions,
                            locale,
                            level + 1
                        );
                        fetchedDataList.push(withLinkedData);
                    } else {
                        fetchedDataList.push(childDocumentData);
                    }
                }
                parentDataLink[1].array = fetchedDataList;
            }
        }
    }
    if (documentDataById) {
        for (const dataLink of Object.entries(documentDataById)) {
            try {
                const fetchedDocumentData: DocumentData = await fetchDocumentDataById(
                    siteMap,
                    dataLink[0],
                    {
                        ...fetchOptions,
                        requiredDocumentAreas: dataLink[1].options.documentAreas,
                        requiredDocumentClasses: dataLink[1].options.documentClasses
                    },
                    level,
                    locale
                );
                if (level < 2) {
                    // go to recursion
                    dataLink[1].item = await fetchLinkedData(
                        fetchedDocumentData,
                        siteMap,
                        fetchOptions,
                        locale,
                        level + 1
                    );
                } else {
                    dataLink[1].item = fetchedDocumentData;
                }
            } catch (e: any) {
                console.error(`[SiteBub CMS] ${e.message}`);
            }
        }
    }
    return enhanceDocumentData(documentData, siteMap, locale);
}
