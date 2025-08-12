import inquirer from 'inquirer';
import { getCurrentBranch, getRemoteBehindCount, executeGit } from '../core/git';
import { exec } from 'child_process';

export async function handlePush() {
    try {
        console.log('🔄 gitsafe push kontrolü başlatılıyor...');
        const currentBranch = await getCurrentBranch();
        console.log(`Mevcut branch: ${currentBranch}`);

        console.log('Uzak depo ile senkronizasyon kontrol ediliyor...');
        const behindCount = await getRemoteBehindCount(currentBranch);

        if (behindCount > 0) {
            console.warn(`\n⚠️ DUR! Lokal branch'iniz uzak depodaki '${currentBranch}' branch'inden ${behindCount} commit geride.`);
            console.warn('Eğer şimdi push yaparsanız, proje geçmişinde "merge bubble" oluşabilir.');

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Ne yapmak istersiniz?',
                    choices: [
                        { name: `Rebase ile pull yap (git pull --rebase) - (Tavsiye Edilir, Temiz Geçmiş)`, value: 'rebase' },
                        { name: `Merge ile pull yap (git pull)`, value: 'merge' },
                        { name: 'İşlemi iptal et', value: 'cancel' },
                    ],
                },
            ]);

            if (action === 'rebase') {
                console.log('`git pull --rebase` çalıştırılıyor...');
                exec('git pull --rebase', (err, stdout, stderr) => {
                    if (err) { console.error(stderr); return; }
                    console.log(stdout);
                    console.log('\n✅ Rebase başarılı! Şimdi `gitsafe push` komutunu tekrar çalıştırabilirsiniz.');
                });
            } else if (action === 'merge') {
                console.log('`git pull` çalıştırılıyor...');
                exec('git pull', (err, stdout, stderr) => {
                    if (err) { console.error(stderr); return; }
                    console.log(stdout);
                    console.log('\n✅ Merge başarılı! Şimdi `gitsafe push` komutunu tekrar çalıştırabilirsiniz.');
                });
            } else {
                console.log('İşlem iptal edildi.');
            }
        } else {
            console.log('✅ Lokal branch\'iniz güncel. Güvenli push işlemi gerçekleştiriliyor...');
            const pushArgs = process.argv.slice(3).join(' ');
            exec(`git push ${pushArgs}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(`\n❌ Git Hatası:\n${stderr}`);
                    return;
                }
                console.log(`\n✅ Başarılı:\n${stdout}${stderr}`);
            });
        }
    } catch (error) {
        const gitError = error as { stderr?: string };
        console.error(`\n❌ Bir hata oluştu: ${gitError.stderr || 'Bilinmeyen bir git hatası.'}`);
        process.exit(1);
    }
}