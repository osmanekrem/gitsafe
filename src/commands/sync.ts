import { executeGit } from '../core/git';
import inquirer from "inquirer";

export async function handleSync() {
    console.log('🔄 Proje senkronizasyonu başlatılıyor...');

    try {
        const { proceed } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: `Bu komut, proje geçmişini temiz tutmak için 'git pull --rebase' kullanacaktır. Devam etmek istiyor musunuz?`,
                default: true,
            }
        ]);

        if (!proceed) {
            console.log('İşlem iptal edildi. Normal `git pull` komutunu kullanabilirsiniz.');
            return;
        }

        console.log('\n[1/2] Ana depo güncelleniyor (git pull --rebase)...');
        const pullOutput = await executeGit('pull --rebase');
        console.log(pullOutput);
        console.log('✅ Ana depo başarıyla güncellendi.');

        console.log('\n[2/2] Submodule\'ler senkronize ediliyor (git submodule update)...');
        const submoduleOutput = await executeGit('submodule update --init --recursive');

        if (submoduleOutput) {
            console.log(submoduleOutput);
        }

        console.log('✅ Submodule\'ler başarıyla senkronize edildi.');
        console.log('\n✨ Projeniz artık tamamen güncel!');

    } catch (error) {
        const gitError = error as { stderr?: string };

        if (gitError.stderr?.includes('CONFLICT') || gitError.stderr?.includes('conflict')) {
            console.error('\n❌ REBASE ÇAKIŞMASI: Otomatik birleştirme başarısız oldu.');
            console.warn('Panik yapmayın! gitsafe size yardımcı olacaktır.');
            console.log('\n--- Ne Yapmalısınız? ---');
            console.log('1. `git status` komutu ile çakışan dosyaları listeleyin.');
            console.log('2. Bu dosyaları kod editörünüzde açın ve `<<<<<<<`, `=======`, `>>>>>>>` işaretlerini düzelterek son halini oluşturun.');
            console.log('3. Düzelttiğiniz her dosya için `git add <dosya-adı>` komutunu çalıştırın.');
            console.log('4. Tüm çakışmaları çözdükten sonra, `git rebase --continue` komutu ile işleme devam edin.');
            console.log('\n--- İşin İçinden Çıkamazsanız? ---');
            console.log('Eğer rebase\'i iptal edip her şeyi eski haline getirmek isterseniz, şu komutu çalıştırın:');
            console.log('`git rebase --abort`');
        } else {
            console.error(`\n❌ Senkronizasyon sırasında bir hata oluştu:\n${gitError.stderr || 'Bilinmeyen bir hata.'}`);
        }
    }
}