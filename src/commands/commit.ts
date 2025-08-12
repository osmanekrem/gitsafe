import inquirer from 'inquirer';
import { loadConfig } from '../core/config';
import { executeGit } from '../core/git';

export async function handleCommit() {
    try {
        const config = loadConfig();
        if (!config) {
            console.error('❌ Hata: .gitsafe.yml bulunamadı. Lütfen önce `gitsafe init` komutunu çalıştırın.');
            process.exit(1);
        }

        console.log('✅ Conventional Commit Sihirbazı');

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'Commit tipini seçin:',
                choices: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert'],
            },
            {
                type: 'input',
                name: 'scope',
                message: 'Değişikliğin kapsamı nedir? (opsiyonel):',
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
        const gitCommand = `commit -m "${escapedMessage}"`;

        console.log(`\nOluşturulan komut: git ${gitCommand}`);
        console.log('Git komutu çalıştırılıyor...');

        const stdout = await executeGit(gitCommand);
        console.log(`\n✅ Başarılı:\n${stdout}`);

    } catch (error) {
        const gitError = error as { stderr?: string };

        if (gitError.stderr) {
            console.error(`\n❌ Git Hatası:\n${gitError.stderr}`);
        } else {
            console.error('\n❌ Commit işlemi sırasında bilinmeyen bir hata oluştu.', error);
        }
    }
}