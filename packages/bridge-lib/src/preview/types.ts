export type FileDataFetchingStatus = {
    fileContent?: string;
    isUninitialized?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    isSuccess?: boolean;
    isNotFound?: boolean;
    error?: string;
};
