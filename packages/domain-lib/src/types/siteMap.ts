import {LocaleType, DocumentRecord_Bean} from './document';

export type SiteGeneralSettings = {
    title?: string;
};

export type SiteMap_Bean = {
    defaultLocale: LocaleType;
    generalSettings: SiteGeneralSettings;
    root: DocumentRecord_Bean;
};
