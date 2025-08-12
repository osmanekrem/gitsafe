import { Command } from 'commander';
import {handleInit} from "./commands/init";
import {handleCommit} from "./commands/commit";
import {handlePush} from "./commands/push";
import {handleBranch} from "./commands/branch";

const program = new Command();

program
    .name('gitsafe')
    .description('Geliştirici hatalarından kaynaklı Git kullanım sorunlarını önleyen bir CLI aracı.')
    .version('0.1.0');
program
    .command('init')
    .description('gitsafe\'i mevcut projede başlatır ve yapılandırma dosyalarını oluşturur.')
    .action(handleInit);

program
    .command('commit')
    .description('Conventional Commits standardına uygun bir commit oluşturmanıza yardımcı olur.')
    .action(handleCommit);

program
    .command('push')
    .description('Uzak depo ile senkronizasyon kontrolü yaparak güvenli bir şekilde push yapmanızı sağlar.')
    .allowUnknownOption()
    .action(handlePush);

program
    .command('branch <name>')
    .description('Yeni bir branch oluştururken isimlendirme standartlarını kontrol eder.')
    .action(handleBranch);

program.parse(process.argv);
