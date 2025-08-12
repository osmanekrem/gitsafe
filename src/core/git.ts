import { exec, ExecException } from 'child_process';
import path from 'path';

export interface SubmoduleStatus {
    path: string;
    newCommit: string;
}

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

export async function getStagedSubmodules(): Promise<SubmoduleStatus[]> {
    try {
        const output = await executeGit('diff --cached --submodule=log');
        const submodules: SubmoduleStatus[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.startsWith('Submodule ')) {
                const parts = line.split(' ');
                const submodulePath = parts[1].replace(':', '');
                const commitRange = parts[2];
                const newCommit = commitRange.split('..')[1];
                if (newCommit) {
                    submodules.push({ path: submodulePath, newCommit: newCommit });
                }
            }
        }
        return submodules;
    } catch (e) {
        return [];
    }
}

export async function isCommitPushed(submodulePath: string, commitHash: string): Promise<boolean> {
    try {
        const originalDir = process.cwd();
        process.chdir(path.join(originalDir, submodulePath));
        const output = await executeGit(`branch -r --contains ${commitHash}`);
        process.chdir(originalDir);
        return output.length > 0;
    } catch (e) {
        return false;
    }
}