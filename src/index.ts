import { Command } from "commander";
import { handleInit } from "./commands/init";
import { handleCommit } from "./commands/commit";
import { handlePush } from "./commands/push";
import { handleBranch } from "./commands/branch";
import { handleClean } from "./commands/clean";
import { handleSync } from "./commands/sync";
import { handleValidateCommit } from "./commands/validate-commit";
import { handleFix } from "./commands/fix";
import { handleAdd } from "./commands/add";
import { handleValidatePush } from "./commands/validate-push";

const program = new Command();

program
  .name("gitsafe")
  .description(
    "Geliştirici hatalarından kaynaklı Git kullanım sorunlarını önleyen bir CLI aracı."
  )
  .version("0.1.0");
program
  .command("init")
  .description(
    "gitsafe'i mevcut projede başlatır ve yapılandırma dosyalarını oluşturur."
  )
  .action(handleInit);

program
  .command("commit")
  .description(
    "Conventional Commits standardına uygun bir commit oluşturmanıza yardımcı olur."
  )
  .action(handleCommit);

program
  .command("push")
  .description(
    "Uzak depo ile senkronizasyon kontrolü yaparak güvenli bir şekilde push yapmanızı sağlar."
  )
  .allowUnknownOption()
  .action(handlePush);

program
  .command("branch <name>")
  .description(
    "Yeni bir branch oluştururken isimlendirme standartlarını kontrol eder."
  )
  .action(handleBranch);

program
  .command("clean")
  .description(
    "Ana branch ile birleştirilmiş lokal branch'leri interaktif olarak temizler."
  )
  .action(handleClean);

program
  .command("sync")
  .description(
    "Ana depoyu ve tüm submodule'leri tek komutla güvenli bir şekilde günceller."
  )
  .action(handleSync);

program
  .command("validate-commit <commitMsgFilePath>")
  .description(
    "(Dahili) Bir commit mesajının formatını doğrular. Git hook'u tarafından kullanılır."
  )
  .action(handleValidateCommit);

program
  .command("fix")
  .description(
    "Yaygın Git sorunlarını otomatik olarak teşhis eder ve interaktif çözüm sunar."
  )
  .action(handleFix);

program
  .command("add")
  .description(
    'Değişiklikleri "staging area"ya interaktif ve güvenli bir şekilde ekler.'
  )
  // .argument('[pathspec]', 'Eklenecek dosya veya klasör yolu', '.') // Gelecekte eklenebilir
  .action(handleAdd);

program
  .command("validate-push")
  .description(
    "(Dahili) Push işleminin güvenli olup olmadığını doğrular. Git hook'u tarafından kullanılır."
  )
  .action(handleValidatePush);

program.parse(process.argv);
