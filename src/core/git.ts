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

export async function getMergedBranches(baseBranch: string): Promise<string[]> {
    try {
        const output = await executeGit(`branch --merged ${baseBranch}`);
        return output.split('\n').map(b => b.trim()).filter(b => b);
    } catch (e) {
        console.error(`❌ '${baseBranch}' branch'i ile birleştirilmiş branch'ler alınamadı.`);
        throw e;
    }
}

export async function deleteBranches(branches: string[]): Promise<string> {
    if (branches.length === 0) {
        return Promise.resolve('Silinecek branch seçilmedi.');
    }
    const branchList = branches.join(' ');
    try {
        return await executeGit(`branch -d ${branchList}`);
    } catch (e) {
        console.error(`❌ Branch'ler silinirken bir hata oluştu.`);
        throw e;
    }
}

export async function getRemoteDefaultBranch(): Promise<string | null> {
    try {
        const output = await executeGit('remote show origin');
        const match = output.match(/HEAD branch: (.*)/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}