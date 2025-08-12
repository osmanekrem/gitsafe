import inquirer from 'inquirer';
import { loadConfig } from '../core/config';
import {executeGit, getStagedSubmodules, hasStagedFiles, isCommitPushed} from '../core/git';
import path from "path";
import {handleAdd} from "./add";

async function pushSubmodule(submodulePath: string): Promise<void> {
    const originalDir = process.cwd();
    try {
        console.log(`\n'${submodulePath}' klasörüne giriliyor...`);
        process.chdir(path.join(originalDir, submodulePath));

        console.log(`> git push komutu çalıştırılıyor...`);
        const pushOutput = await executeGit('push');
        console.log(pushOutput);

    } finally {
        console.log(`Ana depoya geri dönülüyor...`);
        process.chdir(originalDir);
    }
}

export async function handleCommit() {
    try {
        const config = loadConfig();
        if (!config) {
            console.error('❌ Hata: .gitsafe.yml bulunamadı. Lütfen önce `gitsafe init` komutunu çalıştırın.');
            process.exit(1);
        }

        if (!(await hasStagedFiles())) {
            console.log('ℹ️ Commitlemek için hazırlanmış (staged) hiçbir değişiklik bulunamadı.');
            const { proceedToAdd } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'proceedToAdd',
                    message: '`gitsafe add` yardımcısını çalıştırarak şimdi dosya eklemek ister misiniz?',
                    default: true,
                },
            ]);

            if (proceedToAdd) {
                await handleAdd();
                if (!(await hasStagedFiles())) {
                    console.log('Staging area hala boş. Commit işlemi iptal edildi.');
                    return;
                }
            } else {
                console.log('Commit işlemi iptal edildi.');
                return;
            }
        }

        console.log('🔍 Submodule tutarlılığı kontrol ediliyor...');
        const stagedSubmodules = await getStagedSubmodules();
        let submodulesPushed = false;

        for (const sub of stagedSubmodules) {
            const isPushed = await isCommitPushed(sub.path, sub.newCommit);
            if (!isPushed) {
                console.error(`\n❌ DUR! '${sub.path}' submodule'ünde push'lanmamış değişiklikler var.`);
                console.warn(`Bu commit (${sub.newCommit.substring(0, 7)}) uzak depoda bulunmuyor ve bu durum takım arkadaşlarınızın projesini kıracaktır.`);

                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'Ne yapmak istersiniz?',
                        choices: [
                            { name: `'${sub.path}' submodule'ünü şimdi push'la ve commite devam et (Tavsiye Edilir)`, value: 'push' },
                            { name: 'Commit işlemini tamamen iptal et', value: 'cancel' },
                        ]
                    }
                ]);

                if (action === 'push') {
                    await pushSubmodule(sub.path);
                    submodulesPushed = true;
                } else {
                    console.log('Commit işlemi iptal edildi.');
                    process.exit(0);
                }
            }
        }

        if (stagedSubmodules.length > 0 && !submodulesPushed) {
            console.log('✅ Tüm submodule\'ler güncel.');
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