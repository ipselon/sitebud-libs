import React from 'react';
import {PageDataProvider} from './PageDataProvider';
import {SiteDataProvider} from './SiteDataProvider';
import {usePreview} from './usePreview';
import {PreviewNotification} from '../preview/PreviewNotification';

interface PreviewDataProviderProps {
    Script: React.FC<any>;
    custom404: React.ReactNode;
    locale: string;
    slug?: string;
    children: React.ReactNode;
}

const octokitCDNScript: string = `
import { Octokit, App } from 'https://cdn.skypack.dev/octokit';
window.Octokit = Octokit;
window.App = App;
`;


export function PreviewDataProvider(props: PreviewDataProviderProps) {
    const {Script, custom404, locale, slug, children} = props;
    const {status, siteDataPreview, pageDataPreview, error} = usePreview(true, locale, slug);
    return (
        <>
            <Script
                id="octokit-script"
                type="module"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: octokitCDNScript
                }}
            />
            {status === 'uninitialized' && (
                <PreviewNotification message="Please wait. Loading data from GitHub..." />
            )}
            {status === 'error' && (
                <PreviewNotification message={error || 'Some error occurred. See the console output.'} severity="error" />
            )}
            {(status === 'success' || status === 'loading') && pageDataPreview?.content && (
                <SiteDataProvider siteData={siteDataPreview}>
                    <PageDataProvider pageData={pageDataPreview}>
                        {status === 'loading' && (
                            <PreviewNotification message="Please wait. Loading data from GitHub..." />
                        )}
                        {children}
                    </PageDataProvider>
                </SiteDataProvider>
            )}
            {status === 'success' && !pageDataPreview?.content && (
                <>{custom404}</>
            )}
        </>
    );
}