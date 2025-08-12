import inquirer from 'inquirer';
import { loadConfig } from '../core/config';
import {getCurrentBranch, getMergedBranches, deleteBranches, getRemoteDefaultBranch, executeGit} from '../core/git';

async function findMainBranch(config: ReturnType<typeof loadConfig>): Promise<string> {
    if (config?.mainBranch) {
        console.log(`Bilgi: Ana branch yapılandırma dosyasından bulundu: '${config.mainBranch}'`);
        return config.mainBranch;
    }

    const remoteDefault = await getRemoteDefaultBranch();
    if (remoteDefault) {
        console.log(`Bilgi: Ana branch uzak depodan tespit edildi: '${remoteDefault}'`);
        return remoteDefault;
    }

    try {
        const branches = await executeGit('branch');
        if (branches.includes('main')) {
            console.log(`Bilgi: 'main' branch'i lokalde bulundu ve ana branch olarak varsayıldı.`);
            return 'main';
        }
        if (branches.includes('master')) {
            console.log(`Bilgi: 'master' branch'i lokalde bulundu ve ana branch olarak varsayıldı.`);
            return 'master';
        }
    } catch (e) { }

    throw new Error('Projenin ana branch\'i otomatik olarak tespit edilemedi. Lütfen `gitsafe init` komutu ile `mainBranch` ayarını yapın.');
}

export async function handleClean() {
    try {
        const config = loadConfig();
        const mainBranch = await findMainBranch(config);

        console.log(`\nAna branch olarak '${mainBranch}' kullanılarak temizlik yapılacak...`);

        const currentBranch = await getCurrentBranch();
        const allMergedBranches = await getMergedBranches(mainBranch);

        const branchesToClean = allMergedBranches.filter(branch =>
            branch !== currentBranch &&
            branch !== mainBranch &&
            branch !== `* ${currentBranch}` &&
            !(config?.protectedBranches?.includes(branch))
        );

        if (branchesToClean.length === 0) {
            console.log('✅ Tebrikler, temizlenecek birleştirilmiş branch bulunmuyor!');
            return;
        }

        console.log(`'${mainBranch}' branch'i ile birleştirilmiş ve artık gereksiz olabilecek branch'ler bulundu.`);
        const { selectedBranches } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedBranches',
                message: 'Hangi branch\'leri silmek istersiniz?',
                choices: branchesToClean,
                loop: false,
            }
        ]);

        if (selectedBranches.length > 0) {
            console.log(`\n'${selectedBranches.join(', ')}' branch'leri siliniyor...`);
            const output = await deleteBranches(selectedBranches);
            console.log(`\n✅ Başarılı:\n${output}`);
        } else {
            console.log('Hiçbir branch silinmedi.');
        }

    } catch (error) {
        const gitError = error as { stderr?: string };
        console.error(`\n❌ Bir hata oluştu:\n${gitError.stderr || 'Bilinmeyen bir hata.'}`);
    }
}