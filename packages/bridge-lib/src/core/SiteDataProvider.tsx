import React, { ReactNode } from 'react';
import {DocumentData} from './types';
import {documentDataDefault} from './defaultBeans';

export type SiteDataProviderProps = {
    siteData: DocumentData;
    children: ReactNode;
};

export const SiteDataContext = React.createContext<DocumentData>({...documentDataDefault});

export const SiteDataProvider: React.FC<SiteDataProviderProps> = (props) => {
    const { children, siteData } = props;
    return (
        <SiteDataContext.Provider value={siteData}>
            {children}
        </SiteDataContext.Provider>
    );
};
