import {loadConfig} from "../core/config";
import inquirer from "inquirer";
import {exec} from "child_process";

export async function handleCommit()  {
    const config = loadConfig();
    if (!config) {
        console.error('❌ Hata: .gitsafe.yml bulunamadı. Lütfen önce `gitsafe init` komutunu çalıştırın.');
        process.exit(1);
    }

    console.log(' Conventional Commit sihirbazına hoş geldiniz!');

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'Commit tipini seçin:',
            choices: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
        },
        {
            type: 'input',
            name: 'scope',
            message: 'Değişikliğin kapsamı nedir? (opsiyonel, örn: "api", "ui"):',
        },
        {
            type: 'input',
            name: 'subject',
            message: 'Commit\'i açıklayan kısa bir başlık yazın:',
            validate: (input) => input ? true : 'Başlık boş bırakılamaz.',
        },
    ]);

    let commitMessage = `${answers.type}`;
    if (answers.scope) {
        commitMessage += `(${answers.scope.trim()})`;
    }
    commitMessage += `: ${answers.subject.trim()}`;

    const escapedMessage = commitMessage.replace(/"/g, '\\"');

    console.log(`\n Oluşturulan komut: git commit -m "${escapedMessage}"`);
    console.log(' Git komutu çalıştırılıyor...');

    exec(`git commit -m "${escapedMessage}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`\n❌ Git Hatası:\n${stderr}`);
            return;
        }
        console.log(`\n✅ Başarılı:\n${stdout}`);
    });
}