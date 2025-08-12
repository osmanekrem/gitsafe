import fs from 'fs';
import { loadConfig } from '../core/config';

const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|docs|style|refactor|test|chore|revert)(\(.+\))?!?: .{1,50}/;

export function handleValidateCommit(commitMsgFilePath: string) {
    const config = loadConfig();

    if (!config || config.commitMessage.style === 'off') {
        process.exit(0);
    }

    try {
        const message = fs.readFileSync(commitMsgFilePath, 'utf-8').trim();

        if (!CONVENTIONAL_COMMIT_REGEX.test(message)) {
            console.error('\n❌ HATA: Commit mesajı Conventional Commits standardına uymuyor.');
            console.warn('Mesajınız şu formatta olmalıdır: `tip(kapsam): açıklama`');
            console.info('Örnek: `feat(api): kullanıcı girişi için yeni endpoint ekle`');
            console.info('Doğru formatta bir mesaj oluşturmak için `gitsafe commit` yardımcısını kullanabilirsiniz.');
            process.exit(1);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Commit mesajı dosyası okunurken bir hata oluştu.', error);
        process.exit(1);
    }
}