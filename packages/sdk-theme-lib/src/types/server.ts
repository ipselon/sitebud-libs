export type FileDescription = {
    filePath: string;
    fileName: string;
    fileData: string;
};

export type GitCommit = {
    sha: string;
};

export type GitAuthor = {
    name: string;
    email: string;
    date: string; // YYYY-MM-DDTHH:MM:SSZ
};

export type GitTreeItem = {
    path: string;
    mode: '100644' | '100755' | '040000' | '160000' | '120000';
    type: 'blob' | 'tree' | 'commit';
    sha?: string | null;
    content?: string;
};

export type GitBranch = {
    name: string;
    commit: GitCommit;
};