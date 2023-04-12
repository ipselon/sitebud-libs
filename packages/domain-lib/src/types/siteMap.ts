import {LocaleType, DocumentRecord_Bean} from './document';

export type SiteGeneralSettings = {
    title?: string;
};

export type SiteTagLinks = Record<string, string>;

export type SiteMap_Bean = {
    defaultLocale: LocaleType;
    generalSettings: SiteGeneralSettings;
    tagsLinks?: Record<string, SiteTagLinks>;
    root: DocumentRecord_Bean;
};
