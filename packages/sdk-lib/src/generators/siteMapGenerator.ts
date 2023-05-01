import template from 'lodash/template';

const fs = require('fs-extra');
const path = require('path');
import {DocumentRecord_Bean} from '@sitebud/domain-lib';

export type SiteMap_IndexBean = {
    nodePath: string;
    byLocale?: Record<string, SiteMap_IndexBean>;
    includeInSiteMap?: boolean;
};

export type SiteMap_Index = Record<string, SiteMap_IndexBean>;

export function makeSiteIndex(
    root: DocumentRecord_Bean,
    defaultLocale: string,
    accumulator: SiteMap_Index = {},
    rootNodePath?: Array<DocumentRecord_Bean>
): SiteMap_Index {
    let accumulatorLocal: SiteMap_Index = {...accumulator};
    const localNodePath: Array<DocumentRecord_Bean> = rootNodePath ? [...rootNodePath, root] : [root];
    if (localNodePath.length > 0) {
        const siteMapRecord: SiteMap_IndexBean = {
            nodePath: '',
        };
        const byLocale: Record<string, SiteMap_IndexBean> = {};
        for (const nodeItem of localNodePath) {
            for(const nodeItemContent of Object.entries(nodeItem.contents)) {
                if (nodeItemContent[1]) {
                    if (nodeItemContent[0] === defaultLocale) {
                        siteMapRecord.nodePath = `${siteMapRecord.nodePath}/${nodeItemContent[1].slug}`;
                        siteMapRecord.includeInSiteMap = nodeItemContent[1].includeInSiteMap;
                    } else {
                        byLocale[nodeItemContent[0]] = byLocale[nodeItemContent[0]] || {
                            nodePath: ''
                        };
                        byLocale[nodeItemContent[0]].includeInSiteMap = nodeItemContent[1].includeInSiteMap;
                        byLocale[nodeItemContent[0]].nodePath = `${byLocale[nodeItemContent[0]].nodePath}/${nodeItemContent[1].slug}`
                    }
                }
            }
        }
        Object.keys(byLocale).forEach((localeKey) => {
            byLocale[localeKey].nodePath = byLocale[localeKey].nodePath.replace('/@site', '');
        });
        siteMapRecord.nodePath = siteMapRecord.nodePath.replace('/@site', '');
        siteMapRecord.byLocale = byLocale;
        accumulatorLocal[root.id] = siteMapRecord;
    }
    if (root.children && root.children.length > 0) {
        let childDocument: DocumentRecord_Bean;
        for (childDocument of root.children) {
            accumulatorLocal = makeSiteIndex(
                childDocument,
                defaultLocale,
                accumulatorLocal,
                [...localNodePath]
            );
        }
    }
    return accumulatorLocal;
}



const URL_BASE: string | undefined = process.env.SB_WEBSITE_URL_BASE;

const siteMapXMLWrapperTemplate = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"><% for (const siteIndexRecord of Object.entries(siteIndex)) { %><% if (siteIndexRecord[1].includeInSiteMap) { %><url><loc><%= URL_BASE %><%= siteIndexRecord[1].nodePath %></loc><% for (const byLocaleItem of Object.entries(siteIndexRecord[1].byLocale)) { %><% if (byLocaleItem[1].includeInSiteMap) { %><xhtml:link rel="alternate" hreflang="<%= byLocaleItem[0] %>" href="<%= URL_BASE %>/<%= byLocaleItem[0] %><%= byLocaleItem[1].nodePath %>"/><% } %><% } %></url><% } %><% } %></urlset>
`;

export async function generateSiteMapXML(): Promise<void> {
    if (!URL_BASE) {
        console.error('[SiteBud CMS] Error generating sitemap.xml file: missing SB_WEBSITE_URL_BASE environment variable. Please read the documentation about Sitemap automatic generation on SiteBud CMS website.');
        return;
    }
    try {
        const siteMapFilePath = path.join(process.cwd(), 'data/siteMap.json');
        const siteMap = await fs.readJSON(siteMapFilePath);
        const siteIndex: SiteMap_Index = makeSiteIndex(siteMap.root, siteMap.defaultLocale);
        const fileBody: string = template(siteMapXMLWrapperTemplate)({URL_BASE, siteIndex});
        const siteMapXMLFilePath = path.join(process.cwd(), 'public/sitemap.xml');
        await fs.ensureFile(siteMapXMLFilePath);
        await fs.outputFile(siteMapXMLFilePath, fileBody);
    } catch (e: any) {
        console.error('[SiteBud CMS] Can not write to sitemap.xml file: ', e.message);
    }
}
