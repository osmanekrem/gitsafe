import inquirer from 'inquirer';
import { getChangedFiles, executeGit } from '../core/git';

export async function handleAdd() {
    try {
        console.log('🔄 Değişiklikler aranıyor...');
        const changedFiles = await getChangedFiles();

        if (changedFiles.length === 0) {
            console.log('✅ Projenizde "staging area"ya eklenecek yeni bir değişiklik bulunmuyor.');
            return;
        }

        const { filesToAdd } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'filesToAdd',
                message: 'Hangi dosyaları "staging area"ya eklemek istersiniz?\n(Seçmek için <space>, onaylamak için <enter>)\n',
                choices: changedFiles,
                loop: false,
            }
        ]);

        if (!filesToAdd || filesToAdd.length === 0) {
            console.log('Hiçbir dosya seçilmedi. İşlem iptal edildi.');
            return;
        }

        const filesWithQuotes = filesToAdd.map((file: string) => `"${file}"`);
        const addCommand = `add ${filesWithQuotes.join(' ')}`;

        console.log(`\n> git ${addCommand}`);
        await executeGit(addCommand);
        console.log(`\n✅ ${filesToAdd.length} adet dosya başarıyla eklendi.`);

    } catch (error) {
        const gitError = error as { stderr?: string };
        console.error(`\n❌ Bir hata oluştu:\n${gitError.stderr || 'Bilinmeyen bir hata.'}`);
    }
}