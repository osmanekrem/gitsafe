# 🛡️ gitsafe: Git İş Akışınızdaki Akıllı Koruma Kalkanınız

[![NPM Version](https://img.shields.io/npm/v/gitsafe-cli.svg)](https://www.npmjs.com/package/gitsafe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

`git`, modern yazılım geliştirmenin temel taşıdır, ancak hepimiz oradaydık: Yanlışlıkla `main` branch'ine push'lamak, `pull` yapmayı unutup proje geçmişini kirletmek, önemli bir anahtarı koda dahil etmek... Bu küçük hatalar, büyük zaman kayıplarına ve ciddi güvenlik risklerine yol açabilir.

**`gitsafe`**, bu sorunları çözmek için tasarlanmış akıllı bir komut satırı aracıdır. Sadece hataları engellemekle kalmaz, aynı zamanda size en iyi pratikleri öğreterek daha iyi bir geliştirici olmanıza yardımcı olur.

## ✨ Ana Özellikler

*   **Akıllı `push` Koruması:** `git push` demeden önce `pull` yapmayı unuttunuz mu? `gitsafe` sizi uyarır ve proje geçmişini temiz tutmak için `rebase` seçeneği sunar.
*   **Korumalı Branch Kalkanı:** `main` veya `develop` gibi kritik branch'lere doğrudan `push` yapmayı engelleyerek Pull Request (PR) iş akışını teşvik eder.
*   **Güvenli `--force`:** Tehlikeli `git push --force` komutunu yakalar ve bunun yerine başkasının kodunu ezme riski olmayan `--force-with-lease` seçeneğini önerir.
*   **İnteraktif `commit` Yardımcısı:** `gitsafe commit` ile, Conventional Commits standardına uygun, temiz ve anlamlı commit mesajları oluşturmak artık çok kolay.
*   **Otomatik Hook Entegrasyonu:** `gitsafe init` ile Husky hook'larını kurun ve `gitsafe`'in tüm korumalarının standart `git` komutlarınızla otomatik olarak çalışmasını izleyin.
*   **Submodule Yönetimi:** `gitsafe sync` ile hem ana deponuzu hem de tüm submodule'lerinizi tek, güvenli bir komutla güncelleyin.
*   **Branch Hijyeni:** `gitsafe clean` ile ana branch ile birleşmiş ve artık gereksiz olan lokal branch'lerinizi kolayca temizleyin.
*   **İlk Yardım Çantası:** `gitsafe fix` ile "Detached HEAD" gibi kafa karıştırıcı Git sorunlarını otomatik olarak teşhis edip çözün.

## 🚀 Kurulum

`gitsafe`'i global olarak kurarak herhangi bir projenizde kullanabilirsiniz:

```bash
npm install -g gitsafe
```*(Not: Paket adınız neyse onu buraya yazın.)*

## 🛠️ Kullanım

Bir projede `gitsafe`'i kullanmaya başlamak için tek yapmanız gereken:

**1. Projenizi Başlatın**

Projenizin kök dizinine gidin ve aşağıdaki komutu çalıştırın:
```bash
gitsafe init
```
Bu interaktif sihirbaz, projenize özel kuralları belirleyecek bir `.gitsafe.yml` dosyası oluşturacak ve (isteğinize bağlı olarak) Husky ile Git hook'larını otomatik olarak kuracaktır.

**2. Günlük İş Akışınızda Kullanın**

Artık standart `git` komutları yerine `gitsafe`'in akıllı alternatiflerini kullanabilirsiniz:

| Standart Komut | `gitsafe` Alternatifi | Sağladığı Fayda |
| :--- | :--- | :--- |
| `git add .` | `gitsafe add` | Hangi dosyaları eklediğinizi interaktif olarak seçin, kazaları önleyin. |
| `git commit` | `gitsafe commit` | Adım adım yönlendirme ile mükemmel formatta commit mesajları oluşturun. |
| `git push` | `gitsafe push` | Otomatik senkronizasyon ve güvenlik kontrollerinden geçerek push yapın. |
| `git checkout -b <ad>` | `gitsafe branch <ad>` | Takım standartlarına uygun branch isimleri oluşturun. |
| `git pull` + `git submodule...`| `gitsafe sync` | Tek komutla tüm projenizi ve submodule'lerinizi güvenle güncelleyin. |

**Otomatik Korumayı mı Tercih Edersiniz?**

Eğer `gitsafe init` sırasında Husky hook'larını kurduysanız, hiçbir şeyi değiştirmenize gerek yok! Sadece standart `git push` veya `git commit` komutlarını kullanmaya devam edin. `gitsafe`, gerektiğinde arka planda otomatik olarak devreye girerek sizi koruyacaktır.

---

## 🤝 Katkıda Bulunma

Bu proje topluluk tarafından yönlendirilmektedir ve katkılarınıza her zaman açığız! Bir hata mı buldunuz? Yeni bir özellik mi istiyorsunuz? Lütfen bir [Issue oluşturun](https://github.com/kullanici-adiniz/gitsafe/issues) veya bir [Pull Request gönderin](https://github.com/kullanici-adiniz/gitsafe/pulls).

Detaylar için `CONTRIBUTING.md` dosyasına göz atın.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.