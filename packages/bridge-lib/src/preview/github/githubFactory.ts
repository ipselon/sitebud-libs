let octokitInstance: any | undefined;
let currentGhToken: string | undefined;
let currentLogin: string | null = null;

export async function getOctokit(ghToken: string) {
    if (!(window as any).Octokit) {
        throw Error('Missing Octokit instance in the global space.');
    }
    if (!octokitInstance || currentGhToken !== ghToken) {
        currentGhToken = ghToken;
        currentLogin = null;
        octokitInstance = new (window as any).Octokit({ auth: ghToken });
    }
    return octokitInstance;
}
