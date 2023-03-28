import React, { ReactNode } from 'react';
import {PageData} from './types';

export type PageDataProviderProps = {
    pageData: PageData;
    children: ReactNode;
};

export const PageDataContext = React.createContext<PageData>({});

export const PageDataProvider: React.FC<PageDataProviderProps> = (props) => {
    const { children, pageData } = props;
    return (
        <PageDataContext.Provider value={pageData}>
            {children}
        </PageDataContext.Provider>
    );
};
