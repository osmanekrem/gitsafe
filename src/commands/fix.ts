import inquirer from 'inquirer';
import { isDetachedHead, executeGit } from '../core/git';

export async function handleFix() {
    console.log('🩺 Projenizin durumu analiz ediliyor...');

    try {
        if (await isDetachedHead()) {
            console.error('\n❌ SORUN TESPİT EDİLDİ: "Detached HEAD"');
            console.warn('Şu anda bir branch üzerinde değilsiniz. Bu durumda yapacağınız commit\'ler kaybolabilir.');

            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Ne yapmak istersiniz?',
                    choices: [
                        { name: 'Bu noktada yeni bir branch oluştur (Tavsiye Edilir)', value: 'new_branch' },
                        { name: 'Değişiklikleri önemseme ve önceki branch\'e geri dön', value: 'go_back' },
                        { name: 'Hiçbir şey yapma', value: 'cancel' },
                    ]
                }
            ]);

            if (action === 'new_branch') {
                const { branchName } = await inquirer.prompt([{
                    type: 'input',
                    name: 'branchName',
                    message: 'Yeni branch için bir isim girin:',
                    validate: input => !!input || 'Branch adı boş bırakılamaz.'
                }]);
                await executeGit(`checkout -b ${branchName}`);
                console.log(`✅ Başarılı! Artık '${branchName}' adlı yeni bir branch üzerindesiniz.`);
            } else if (action === 'go_back') {
                await executeGit('switch -');
                console.log('✅ Başarılı! Önceki branch\'inize geri döndünüz.');
            } else {
                console.log('İşlem iptal edildi.');
            }
            return;
        }

        console.log('\n✅ Projenizde bilinen bir sorun tespit edilmedi. Her şey yolunda görünüyor!');

    } catch (error) {
        const gitError = error as { stderr?: string };
        console.error(`\n❌ Analiz sırasında bir hata oluştu:\n${gitError.stderr || 'Bilinmeyen bir hata.'}`);
    }
}