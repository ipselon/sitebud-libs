import { Octokit } from 'octokit';
import {GitTreeItem, GitAuthor} from '../types';

let octokit: Octokit;
let currentGhToken: string;
let currentLogin;

function getOctokit(ghToken: string) {
    if (!octokit || currentGhToken !== ghToken) {
        currentGhToken = ghToken;
        currentLogin = null;
        octokit = new Octokit({ auth: ghToken });
    }
    return octokit;
}

export async function getBranch(
    owner: string,
    ghToken: string,
    repositoryName: string,
    branchName: string,
    noCache: boolean = false
) {
    const octokitInstance = getOctokit(ghToken);
    const options: any = {
        owner,
        repo: repositoryName,
        branch: branchName
    };
    if (noCache) {
        options.headers = {'If-None-Match': ''};
    }
    return octokitInstance.request('GET /repos/{owner}/{repo}/branches/{branch}', options)
        .then(({data}) => {
            return data;
        });
}

export async function getBranchTree(
    owner: string,
    ghToken: string,
    repositoryName: string,
    sha: string,
    noCache = false
) {
    const octokitInstance = getOctokit(ghToken);
    const options: any = {
        owner,
        repo: repositoryName,
        tree_sha: sha
    };
    if (noCache) {
        options.headers = {'If-None-Match': ''};
    }
    return octokitInstance.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1', options)
        .then(({data}) => {
            return data;
        });
}

export async function createBlob(owner: string, ghToken: string, repositoryName: string, content: string, encoding: 'base64' | 'utf8') {
    const octokitInstance: Octokit = getOctokit(ghToken);
    return octokitInstance.request('POST /repos/{owner}/{repo}/git/blobs', {
        owner: owner,
        repo: repositoryName,
        content,
        encoding
    }).then(({data}) => {
        return data;
    });
}


export async function createTree(
    owner: string,
    ghToken: string,
    repositoryName: string,
    baseTree: string,
    tree: Array<GitTreeItem>
) {
    const octokitInstance = getOctokit(ghToken);
    return octokitInstance.request('POST /repos/{owner}/{repo}/git/trees', {
        owner: owner,
        repo: repositoryName,
        base_tree: baseTree,
        tree
    }).then(({data}) => {
        return data;
    });
}

export async function createCommit(
    owner: string,
    ghToken: string,
    repositoryName: string,
    branchName: string,
    parentSha: string,
    treeSha: string,
    author: GitAuthor,
    commitMessage: string
) {
    const octokitInstance = getOctokit(ghToken);
    return octokitInstance.request('POST /repos/{owner}/{repo}/git/commits', {
        owner: owner,
        repo: repositoryName,
        message: commitMessage,
        author: author,
        parents: [
            parentSha
        ],
        tree: treeSha,
    }).then(({data}) => {
        return octokitInstance.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
            owner: owner,
            repo: repositoryName,
            ref: `heads/${branchName}`,
            sha: data.sha,
            force: true
        }).then(() => {
            return data;
        });
    });
}

export async function waitForBranchUpdatedWithCommit(
    owner: string,
    ghToken: string,
    repositoryName: string,
    branchName: string,
    commitSha: string,
    timesCounter: number = 0
): Promise<void> {
    if (timesCounter >= 10) {
        throw Error(`It seems that we need more than 30 seconds to wait for the ${branchName} branch is updated on the server.`);
    }
    return new Promise<void>((resolve, reject) => setTimeout(() => {
        return getBranch(owner, ghToken, repositoryName, branchName, true)
            .then((branchData) => {
                if (branchData.commit.sha === commitSha) {
                    resolve();
                } else {
                    return waitForBranchUpdatedWithCommit(owner, ghToken, repositoryName, branchName, commitSha, timesCounter + 1);
                }
            })
            .catch((e: any) => {
                reject(`Can not get the ${branchName} branch: ${e.message}`);
            });
    }, 3000));
}
