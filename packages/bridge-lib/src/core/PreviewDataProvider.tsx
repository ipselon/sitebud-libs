import React from 'react';
import {PreviewNotification} from '../preview/PreviewNotification';
import {PageDataProvider} from './PageDataProvider';
import {SiteDataProvider} from './SiteDataProvider';
import {usePreview} from './usePreview';

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

    let content: JSX.Element;
    let notification: JSX.Element | null = null;
    if (pageDataPreview?.content) {
        if (status === 'uninitialized' || status === 'loading') {
            notification = (
                <PreviewNotification message="Please wait. Loading data from GitHub..." />
            );
        } else if (status === 'error') {
            notification = (
                <PreviewNotification message={error || 'Some error occurred. See the console output.'} severity="error" />
            );
        }
        content = (
            <SiteDataProvider siteData={siteDataPreview}>
                <PageDataProvider pageData={pageDataPreview}>
                    {notification}
                    {children}
                </PageDataProvider>
            </SiteDataProvider>
        );
    } else {
        if (status === 'uninitialized' || status === 'loading') {
            content = (
                <PreviewNotification message="Please wait. Loading data from GitHub..." />
            );
        } else if (status === 'error') {
            content = (
                <PreviewNotification message={error || 'Some error occurred. See the console output.'} severity="error" />
            );
        } else {
            content = (
                <>{custom404}</>
            );
        }
    }

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
            {content}
        </>
    );
}