import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import { runCommand } from '../core/runner';

export async function handleInit() {
    console.log('gitsafe kurulum sihirbazına hoş geldiniz!');

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'commitMessage',
            message: 'Commit mesajları için bir standart zorunlu kılınsın mı? (Örn: feat: ...)',
            choices: [
                { name: 'Evet, Conventional Commits standardı zorunlu olsun.', value: 'conventional' },
                { name: 'Hayır, zorunlu olmasın.', value: 'off' },
            ],
        },
        {
            type: 'list',
            name: 'branchNaming',
            message: 'Branch isimlendirme için bir kural belirleyelim mi?',
            choices: [
                { name: 'Strict: Standart dışı isimleri engelle (örn: feature/login)', value: 'strict' },
                { name: 'Warn: Sadece uyar, engelleme', value: 'warn' },
                { name: 'Off: Kural olmasın', value: 'off' },
            ],
        },
        {
            type: 'input',
            name: 'mainBranch',
            message: 'Projenin ana branch\'inin adı nedir? (örn: main, master, production)',
            default: 'main',
        },
        {
            type: 'confirm',
            name: 'setupProtectedBranches',
            message: 'Doğrudan push\'a karşı korumalı branch\'ler belirlemek ister misiniz?',
            default: true,
        },
        {
            type: 'input',
            name: 'protectedBranchesInput',
            message: 'Korunacak branch\'leri yazın (virgülle ayırın, boş bırakmak için Enter):',
            default: 'main, master, develop',
            when: (answers) => answers.setupProtectedBranches === true,
        },
        {
            type: 'confirm',
            name: 'setupHusky',
            message: 'Husky ile Git hook\'ları otomatik olarak kurulsun mu? (Tavsiye Edilir)',
            default: true,
        },
        {
            type: 'checkbox',
            name: 'hooksToInstall',
            message: 'Hangi gitsafe otomasyonlarını (Git Hooks) aktive etmek istersiniz?',
            when: (answers) => answers.setupHusky,
            choices: [
                {
                    name: 'Commit Mesajı Formatını Otomatik Denetle (commit-msg)',
                    value: 'commit-msg',
                    short: 'Commit Mesajı Denetimi'
                },
                {
                    name: 'Kodu Push\'lamadan Önce Güvenlik Kontrolü Yap (pre-push)',
                    value: 'pre-push',
                    short: 'Push Güvenlik Kontrolü'
                },
            ],
            default: (currentAnswers: any) => {
                const defaults = [];
                if (currentAnswers.commitMessage === 'conventional') {
                    defaults.push('commit-msg');
                }
                defaults.push('pre-push');
                return defaults;
            }
        }
    ]);

    let protectedBranchesYaml = `
# Korumalı branch'ler
# 'gitsafe push' komutu bu branch'lere doğrudan push yapılmasını engeller.
# Bu özelliği aktif etmek için aşağıdaki listeye branch isimleri ekleyebilirsiniz.
protectedBranches: []`;

    if (answers.setupProtectedBranches && answers.protectedBranchesInput) {
        const branches = answers.protectedBranchesInput.split(',').map((b: string) => b.trim()).filter((b: string) => b); // Boş girdileri temizle
        if (branches.length > 0) {
            protectedBranchesYaml = `
# Korumalı branch'ler
# 'gitsafe push' komutu bu branch'lere doğrudan push yapılmasını engeller.
protectedBranches:
  - ${branches.join('\n  - ')}
`;
        }
    }

    const yamlContent = `
# gitsafe Configuration File
# Bu dosya 'gitsafe init' komutu ile otomatik olarak oluşturulmuştur.

# Commit mesajı kuralları
commitMessage:
  style: ${answers.commitMessage}

# Branch isimlendirme kuralları
branchNaming:
  rule: ${answers.branchNaming}
  
# gitsafe clean gibi komutlar için projenin ana branch'i
mainBranch: ${answers.mainBranch}

${protectedBranchesYaml.trim()}
`;

    const filePath = path.join(process.cwd(), '.gitsafe.yml');

    try {
        fs.writeFileSync(filePath, yamlContent.trimStart());
        console.log(`\n✅ Yapılandırma başarıyla oluşturuldu: ${filePath}`);
        console.log('Şimdi gitsafe\'i projenizin Git hook\'larına ekleyebilirsiniz.');
    } catch (error) {
        console.error('\n❌ Hata: Yapılandırma dosyası oluşturulamadı.', error);
    }

    if (answers.setupHusky && answers.hooksToInstall && answers.hooksToInstall.length > 0) {
        try {
            console.log('\n🔧 Husky ve seçilen Git hook\'ları ayarlanıyor...');

            await runCommand('npm install husky --save-dev');
            await runCommand('npm pkg set scripts.prepare="husky install"');
            await runCommand('npm run prepare');

            if (answers.hooksToInstall.includes('pre-push')) {
                const prePushHookPath = path.join(process.cwd(), '.husky', 'pre-push');
                const prePushScriptContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx --no-install gitsafe push
`;
                fs.writeFileSync(prePushHookPath, prePushScriptContent);
                fs.chmodSync(prePushHookPath, '755');
                console.log(`✅ pre-push hook'u başarıyla oluşturuldu.`);
            }

            if (answers.hooksToInstall.includes('commit-msg')) {
                const commitMsgHookPath = path.join(process.cwd(), '.husky', 'commit-msg');
                const commitMsgScriptContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx --no-install gitsafe validate-commit "$1"
`;
                fs.writeFileSync(commitMsgHookPath, commitMsgScriptContent);
                fs.chmodSync(commitMsgHookPath, '755');
                console.log(`✅ commit-msg hook'u başarıyla oluşturuldu.`);
            }

            console.log('\n✅ Seçilen Husky hook\'ları başarıyla ayarlandı!');

        } catch (error) {
            console.error('\n❌ Husky kurulumu sırasında bir hata oluştu.');
            console.error('Lütfen projenizde Node.js ve npm\'in kurulu olduğundan ve package.json dosyanızın olduğundan emin olun.');
        }
    } else if (answers.setupHusky) {
        console.log('\nℹ️ Hiçbir hook seçilmediği için Husky kurulumu atlandı.');
    }
}