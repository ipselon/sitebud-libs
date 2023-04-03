import {formatISO, format} from 'date-fns';
import path from 'path';
import * as rollupLibApi from './rollup-lib-api';
import {
    getBranch,
    getBranchTree,
    createTree,
    createCommit,
    waitForBranchUpdatedWithCommit,
    createBlob
} from './githubUtils';
import {GitTreeItem, FileDescription} from '../types';
import {readAllFilesInDir, readFile, readAllImagesInDir} from './fileUtils';

interface UploadOptions {
    ownerLogin: string;
    installationToken: string;
    repoName: string;
    workingBranch: string;
    userName: string;
    email: string;
}

export async function uploadSkin(uploadOptions: UploadOptions, libDirPath: string, distDirPath: string, dataDirPath: string) {
    const {ownerLogin, installationToken, repoName, workingBranch, userName, email} = uploadOptions;
    await rollupLibApi.build();
    const branchData = await getBranch(ownerLogin, installationToken, repoName, workingBranch, true);
    const branchTreeData = await getBranchTree(ownerLogin, installationToken, repoName, branchData.commit.sha, true);

    const libFilesIndex: Record<string, boolean> = {};
    const siteBudFilesIndex: Record<string, boolean> = {};
    const dataImagesFilesIndex: Record<string, boolean> = {};
    branchTreeData.tree.forEach((branchTreeItem: GitTreeItem) => {
        if (branchTreeItem.type === 'blob') {
            if (branchTreeItem.path.startsWith('src/theme')) {
                libFilesIndex[branchTreeItem.path] = true;
            }
            else if (branchTreeItem.path.startsWith('siteBud')) {
                siteBudFilesIndex[branchTreeItem.path] = true;
            } else if (branchTreeItem.path.startsWith('data/images')) {
                dataImagesFilesIndex[branchTreeItem.path] = true;
            }
        }
    });

    const newTreeItems: Array<GitTreeItem> = [];

    const libFiles = readAllFilesInDir(libDirPath);
    if (libFiles && libFiles.length > 0) {
        let newLibFilePath;
        const libDirPathPrefix = `${libDirPath}/`;
        libFiles.forEach(fileItem => {
            newLibFilePath = `src/theme/${fileItem.filePath.replace(libDirPathPrefix, '')}`;
            delete libFilesIndex[newLibFilePath];
            newTreeItems.push({
                path: newLibFilePath,
                mode: '100644',
                type: 'blob',
                content: fileItem.fileData
            });
        });
    }
    Object.keys(libFilesIndex).forEach(libFileKey => {
        newTreeItems.push({
            path: libFileKey,
            mode: '100644',
            type: 'blob',
            sha: null
        });
    });

    const dataImagesFiles = readAllImagesInDir(path.join(dataDirPath, 'images'));
    if (dataImagesFiles && dataImagesFiles.length > 0) {
        let newDataImageFilePath;
        const dataImagesDirPathPrefix = `${path.join(dataDirPath, 'images')}/`;
        let newBlob;
        for (const fileItem of dataImagesFiles) {
            newDataImageFilePath = `data/images/${fileItem.filePath.replace(dataImagesDirPathPrefix, '')}`;
            try {
                newBlob = await createBlob(ownerLogin, installationToken, repoName, fileItem.fileData, 'base64');
            } catch (e) {
                console.log(`Error creating blob in the repository for ${fileItem.filePath}`);
            }
            if (newBlob) {
                delete dataImagesFilesIndex[newDataImageFilePath];
                newTreeItems.push({
                    path: newDataImageFilePath,
                    mode: '100644',
                    type: 'blob',
                    sha: newBlob.sha
                });
            }
        }
    }
    Object.keys(dataImagesFilesIndex).forEach(imageFileKey => {
        newTreeItems.push({
            path: imageFileKey,
            mode: '100644',
            type: 'blob',
            sha: null
        });
    });

    const documentClassIndexFileDescription: FileDescription = readFile(path.join(dataDirPath, 'documentClassIndex.json'));
    newTreeItems.push({
        path: `data/${documentClassIndexFileDescription.fileName}`,
        mode: '100644',
        type: 'blob',
        content: documentClassIndexFileDescription.fileData
    });

    const distFiles = readAllFilesInDir(distDirPath);
    if (distFiles && distFiles.length > 0) {
        let newDistFilePath;
        const distDirPathPrefix = `${distDirPath}/`;
        distFiles.forEach(fileItem => {
            newDistFilePath = `siteBud/${fileItem.filePath.replace(distDirPathPrefix, '')}`;
            delete siteBudFilesIndex[newDistFilePath];
            newTreeItems.push({
                path: newDistFilePath,
                mode: '100644',
                type: 'blob',
                content: fileItem.fileData
            });
        });
    }
    Object.keys(siteBudFilesIndex).forEach(itemFileKey => {
        newTreeItems.push({
            path: itemFileKey,
            mode: '100644',
            type: 'blob',
            sha: null
        });
    });

    const newTree = await createTree(ownerLogin, installationToken, repoName, branchData.commit.sha, newTreeItems)
    const newCommit = await createCommit(
        ownerLogin,
        installationToken,
        repoName,
        workingBranch,
        branchData.commit.sha,
        newTree.sha,
        {
            name: userName,
            email,
            date: formatISO(Date.now())
        },
        `Update theme library (${format(Date.now(), 'yyyy-MM-dd HH:mm:ss')})`
    );
    await waitForBranchUpdatedWithCommit(ownerLogin, installationToken, repoName, workingBranch, newCommit.sha);
}