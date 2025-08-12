import inquirer from 'inquirer';
import { loadConfig } from '../core/config';
import { executeGit } from '../core/git';

const BRANCH_NAME_REGEX = /^(feat|fix|hotfix|chore|docs|style|refactor|test|revert)\/[a-z0-9-]+$/;

export async function handleBranch(name: string) {
    try {
        const config = loadConfig();
        if (!config) {
            console.error('❌ Hata: .gitsafe.yml bulunamadı. Lütfen önce `gitsafe init` komutunu çalıştırın.');
            process.exit(1);
        }

        const rule = config.branchNaming.rule;

        if (rule === 'off' || BRANCH_NAME_REGEX.test(name)) {
            console.log(`✅ Branch ismi standartlara uygun. Branch oluşturuluyor: ${name}`);
            const output = await executeGit(`checkout -b ${name}`);
            console.log(output);
            return;
        }

        if (rule === 'strict') {
            console.error(`\n❌ ENGELENDİ: Branch ismi standartlara uymuyor.`);
            console.warn(`Beklenen format: 'tip/kısa-açıklama' (Örn: 'feat/new-user-button')`);
            console.warn(`Geçerli tipler: feat, fix, hotfix, chore, docs, style, refactor, test, revert`);
            process.exit(1);
        }

        if (rule === 'warn') {
            console.warn(`\n⚠️ UYARI: Branch ismi ('${name}') standartlara uymuyor.`);
            console.log(`Önerilen format: 'tip/kısa-açıklama' (Örn: 'feat/new-user-button')`);

            const { proceed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'proceed',
                    message: 'Yine de bu isimle devam etmek istiyor musunuz?',
                    default: false,
                },
            ]);

            if (proceed) {
                console.log(`Branch oluşturuluyor: ${name}`);
                const output = await executeGit(`checkout -b ${name}`);
                console.log(output);
            } else {
                console.log('İşlem iptal edildi.');
            }
        }

    } catch (error) {
        const gitError = error as { stderr?: string };
        console.error(`\n❌ Git Hatası:\n${gitError.stderr || 'Bilinmeyen bir git hatası.'}`);
    }
}