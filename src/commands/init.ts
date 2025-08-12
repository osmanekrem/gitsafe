import inquirer from "inquirer";
import path from "path";
import fs from "fs";

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
}