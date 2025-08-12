import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface GitSafeConfig {
    commitMessage: {
        style: 'conventional' | 'off';
    };
    branchNaming: {
        rule: 'strict' | 'warn' | 'off';
    };
    protectedBranches: string[];
}

export function loadConfig(): GitSafeConfig | null {
    try {
        const filePath = path.join(process.cwd(), '.gitsafe.yml');
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents) as GitSafeConfig;
    } catch (error) {
        console.error('❌ Yapılandırma dosyası okunurken bir hata oluştu:', error);
        return null;
    }
}