import type {Octokit} from 'octokit';
import {getOctokit} from './githubFactory';
import {UTF8ArrToStr, base64DecToArr} from './base64Utils';

export async function getBranch(owner: string, ghToken: string, repositoryName: string, branchName: string, noCache: boolean = false) {
    const octokitInstance: Octokit = await getOctokit(ghToken);
    const options: any = {
        owner,
        repo: repositoryName,
        branch: branchName
    };
    if (noCache) {
        options.headers = {'If-None-Match': ''};
    }
    const {data} = await octokitInstance.request('GET /repos/{owner}/{repo}/branches/{branch}', options);
    return data;
}

export async function getBranchTree(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const octokitInstance: Octokit = await getOctokit(ghToken);
    const options: any = {
        owner,
        repo: repositoryName,
        tree_sha: sha
    };
    if (noCache) {
        options.headers = {'If-None-Match': ''};
    }
    const {data} = await octokitInstance.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1', options);
    return data;
}

export async function getBlob(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const octokitInstance: Octokit = await getOctokit(ghToken);
    const options: any = {
        owner,
        repo: repositoryName,
        file_sha: sha
    };
    if (noCache) {
        options.headers = {'If-None-Match': ''};
    }
    const {data} = await octokitInstance.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', options);
    return data;
}

export async function getContentString(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const blobContent = await getBlob(owner, ghToken, repositoryName, sha, noCache);
    return UTF8ArrToStr(base64DecToArr(blobContent.content));
}

export async function getJson(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const fileContent = await getContentString(owner, ghToken, repositoryName, sha, noCache);
    try{
        return JSON.parse(fileContent);
    } catch(e) {
        throw Error('Can not read JSON file from blob.');
    }
}

export async function getImage(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const blobContent = await getBlob(owner, ghToken, repositoryName, sha, noCache);
    return 'data:image/*;base64,' + (blobContent.content ? blobContent.content.replace(/\n/g, '') : '');
}

export async function getImageSvg(owner: string, ghToken: string, repositoryName: string, sha: string, noCache: boolean = false) {
    const blobContent = await getBlob(owner, ghToken, repositoryName, sha, noCache);
    return 'data:image/svg+xml;base64,' + (blobContent.content ? blobContent.content.replace(/\n/g, '') : '');
}
