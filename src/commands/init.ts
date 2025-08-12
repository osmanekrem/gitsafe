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

    if (answers.setupHusky) {
        try {
            console.log('\n🔧 Husky ve Git hook\'ları ayarlanıyor (Güncel Yöntem)...');

            // package.json'a husky'yi ekle ve husky'nin package.json'da bir script oluşturmasını sağla
            await runCommand('npm install husky --save-dev');
            await runCommand('npm pkg set scripts.prepare="husky install"');
            await runCommand('npm run prepare'); // `prepare` scriptini çalıştırarak `.husky` klasörünü oluştur.

            // --- pre-push hook'unu doğrudan oluştur ---
            const prePushHookPath = path.join(process.cwd(), '.husky', 'pre-push');
            const prePushScriptContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 'git push' komutu çalıştırıldığında, gitsafe'in push kontrolleri devreye girer.
npx --no-install gitsafe push
`;

            console.log(`\n> .husky/pre-push dosyası oluşturuluyor...`);
            fs.writeFileSync(prePushHookPath, prePushScriptContent);

            // Dosyaya çalıştırılabilirlik izni ver (+x)
            fs.chmodSync(prePushHookPath, '755');
            console.log(`✅ pre-push hook'u başarıyla oluşturuldu.`);


            // --- Gelecek için commit-msg hook örneği ---
            /*
            const commitMsgHookPath = path.join(process.cwd(), '.husky', 'commit-msg');
            const commitMsgScriptContent = `#!/bin/sh
      . "$(dirname "$0")/_/husky.sh"

      npx --no-install gitsafe validate-commit --input $1
      `;
            fs.writeFileSync(commitMsgHookPath, commitMsgScriptContent);
            fs.chmodSync(commitMsgHookPath, '755');
            console.log(`✅ commit-msg hook'u başarıyla oluşturuldu.`);
            */

            console.log('\n✅ Husky hook\'ları başarıyla ayarlandı!');
            console.log('Artık `git push` komutunu çalıştırdığınızda, gitsafe korumaları otomatik olarak devreye girecek.');

        } catch (error) {
            console.error('\n❌ Husky kurulumu sırasında bir hata oluştu.');
            console.error('Lütfen projenizde Node.js ve npm\'in kurulu olduğundan ve package.json dosyanızın olduğundan emin olun.');
        }
    }
}