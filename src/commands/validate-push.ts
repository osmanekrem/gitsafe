import { getCurrentBranch, getRemoteBehindCount } from "../core/git";
import { loadConfig } from "../core/config";

export async function handleValidatePush() {
  try {
    console.log("--- [gitsafe pre-push hook aktif] ---");
    const config = loadConfig();
    if (!config) {
      process.exit(0);
    }

    const currentBranch = await getCurrentBranch();

    if (config.protectedBranches?.includes(currentBranch)) {
      console.error(`\n❌ ENGELENDİ: '${currentBranch}' branch'i korumalıdır!`);
      console.warn(
        "Bu branch'e doğrudan push yapamazsınız. Lütfen bir Pull Request (PR) oluşturun."
      );
      process.exit(1);
    }

    const pushArgs = process.env.HUSKY_GIT_PARAMS?.split(" ") || [];
    const isForcePush = pushArgs.includes("--force") || pushArgs.includes("-f");

    if (isForcePush) {
      console.warn("\n🚨 UYARI: `--force` push işlemi tespit edildi.");
      console.warn(
        "Bu işlem, takım arkadaşlarınızın değişikliklerini silebilir. Daha güvenli olan `--force-with-lease` kullanmayı düşünün."
      );
    }

    const behindCount = await getRemoteBehindCount(currentBranch);
    if (behindCount > 0) {
      console.error(
        `\n❌ ENGELENDİ: Lokal branch'iniz uzak depodan ${behindCount} commit geride.`
      );
      console.warn(
        "Lütfen önce `git pull` veya daha iyisi `gitsafe sync` komutunu çalıştırın."
      );
      process.exit(1);
    }

    console.log("✅ Tüm push kontrolleri başarılı.");
    console.log("--- [gitsafe pre-push hook tamamlandı] ---");
    process.exit(0);
  } catch (error) {
    const gitError = error as { stderr?: string };
    console.error(
      `\n❌ Push doğrulaması sırasında bir hata oluştu:\n${
        gitError.stderr || "Bilinmeyen bir hata."
      }`
    );
    process.exit(1);
  }
}
