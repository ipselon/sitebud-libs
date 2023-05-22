import React, { ReactNode } from 'react';
import {DocumentData} from './types';
import {documentDataDefault} from './defaultBeans';

export type PageDataProviderProps = {
    pageData: DocumentData;
    children: ReactNode;
};

export const PageDataContext = React.createContext<DocumentData>({...documentDataDefault});

export const PageDataProvider: React.FC<PageDataProviderProps> = (props) => {
    const { children, pageData } = props;
    return (
        <PageDataContext.Provider value={pageData}>
            {children}
        </PageDataContext.Provider>
    );
};
