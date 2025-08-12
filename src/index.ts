import { Command } from 'commander';

const program = new Command();

program
    .name('gitsafe')
    .description('Geliştirici hatalarından kaynaklı Git kullanım sorunlarını önleyen bir CLI aracı.')
    .version('0.1.0');

program.parse(process.argv);
