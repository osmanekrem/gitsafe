import { exec, ExecException } from 'child_process';

export function executeGit(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(`git ${command}`, (error: ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                return reject({ error, stderr });
            }
            resolve(stdout.trim());
        });
    });
}

export async function getCurrentBranch(): Promise<string> {
    try {
        return await executeGit('rev-parse --abbrev-ref HEAD');
    } catch (e) {
        console.error('❌ Mevcut branch alınamadı. Bir git deposunda olduğunuzdan emin misiniz?');
        throw e;
    }
}

export async function getRemoteBehindCount(branchName: string, remoteName: string = 'origin'): Promise<number> {
    try {
        await executeGit('fetch');
        const countStr = await executeGit(`rev-list --count ${branchName}..${remoteName}/${branchName}`);
        return parseInt(countStr, 10);
    } catch (e) {
        return 0;
    }
}