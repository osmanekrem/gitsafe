import { Command } from 'commander';
import {handleInit} from "./commands/init";

const program = new Command();

program
    .name('gitsafe')
    .description('Geliştirici hatalarından kaynaklı Git kullanım sorunlarını önleyen bir CLI aracı.')
    .version('0.1.0');
program
    .command('init')
    .description('gitsafe\'i mevcut projede başlatır ve yapılandırma dosyalarını oluşturur.')
    .action(handleInit);


program.parse(process.argv);
