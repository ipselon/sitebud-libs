import React from 'react';
import {DocumentData} from './types';
import {PageDataProvider} from './PageDataProvider';
import {SiteDataProvider} from './SiteDataProvider';

interface RawDataProviderProps {
    siteData?: DocumentData;
    pageData?: DocumentData;
    custom404: React.ReactNode;
    children: React.ReactNode;
}

export function RawDataProvider(props: RawDataProviderProps) {
    const {siteData, pageData, custom404, children} = props;
    if (pageData && pageData.content && siteData) {
        return (
            <SiteDataProvider siteData={siteData}>
                <PageDataProvider pageData={pageData}>
                    {children}
                </PageDataProvider>
            </SiteDataProvider>
        );
    }
    return <>{custom404}</>;
}
