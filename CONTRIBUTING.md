# `gitsafe`'e Katkıda Bulunma Kılavuzu

Öncelikle, `gitsafe` projesine katkıda bulunmayı düşündüğünüz için çok teşekkür ederiz! Her bir katkı, aracımızı daha iyi ve daha güvenli hale getirmemize yardımcı oluyor. Bu topluluk, sizin gibi geliştiriciler sayesinde büyüyor.

Bu kılavuz, katkıda bulunma sürecini olabildiğince basit ve etkili hale getirmek için tasarlanmıştır.

## Nasıl Katkıda Bulunabilirim?

Katkıda bulunmanın birçok yolu vardır, sadece kod yazmak zorunda değilsiniz!
*   **Hataları Raporlama:** Bir sorunla mı karşılaştınız? Lütfen bir [Issue (Sorun) oluşturun](https://github.com/osmanekrem/gitsafe/issues/new?template=bug_report.md).
*   **Özellik Önerme:** `gitsafe`'i daha da iyi yapacak bir fikriniz mi var? Bir [Issue (Sorun) oluşturarak](https://github.com/osmanekrem/gitsafe/issues/new?template=feature_request.md) fikrinizi bizimle paylaşın.
*   **Dokümantasyonu İyileştirme:** `README.md` dosyasında veya kod içi yorumlarda bir yazım hatası mı gördünüz? Düzeltmek için bir Pull Request (PR) gönderebilirsiniz.
*   **Kod Katkısı:** Bir hatayı düzeltmek veya yeni bir özellik eklemek mi istiyorsunuz? Aşağıdaki adımları izleyerek bir Pull Request gönderebilirsiniz.

## Kod Katkısı için Geliştirme Süreci

Yeni bir özellik eklemek veya bir hatayı düzeltmek için aşağıdaki adımları izlemeniz, sürecin herkes için sorunsuz ilerlemesini sağlayacaktır.

### 1. Hazırlık

*   **Depoyu Çatallayın (Fork):** `gitsafe` deposunun sağ üst köşesindeki "Fork" düğmesine tıklayarak kendi Github hesabınıza bir kopyasını oluşturun.
*   **Depoyu Klonlayın (Clone):** Çatalladığınız depoyu kendi bilgisayarınıza klonlayın:
    ```bash
    git clone https://github.com/osmanekrem/gitsafe.git
    cd gitsafe
    ```
*   **Bağımlılıkları Kurun:** Proje kök dizininde `npm install` komutunu çalıştırın.
    ```bash
    npm install
    ```

### 2. Değişiklikleri Yapma

*   **Yeni Bir Branch Oluşturun:** Yapacağınız değişikliği açıklayan bir isimle yeni bir branch oluşturun. Lütfen doğrudan `main` branch'i üzerinde çalışmayın.
    ```bash
    # Yeni bir özellik için:
    git checkout -b feature/kullanici-kayit-formu

    # Bir hata düzeltmesi için:
    git checkout -b fix/yanlis-commit-mesaji
    ```
*   **Kodunuzu Yazın:** Değişikliklerinizi yapın! `src` klasörü altındaki kod yapısını ve stilini takip etmeye özen gösterin.
*   **Test Edin:** Yaptığınız değişikliğin mevcut işlevselliği bozmadığından ve beklediğiniz gibi çalıştığından emin olun. Geliştirme sırasında `npm run start -- <komut>` veya `npx ts-node src/index.ts <komut>` komutlarını kullanabilirsiniz.
    ```bash
    # Örneğin, 'add' komutunu test etmek için:
    npx ts-node src/index.ts add
    ```

### 3. Değişiklikleri Gönderme (Pull Request)

*   **Değişikliklerinizi Commit'leyin:** Projenin kendi standardına uymak için `gitsafe commit` komutunu kullanmanızı öneririz!
    ```bash
    # Önce 'gitsafe'in kendisini derleyin
    npm run build

    # Sonra global olarak linkleyerek test edebilirsiniz
    npm link
    gitsafe add 
    gitsafe commit
    ```
*   **Branch'inizi Push'layın:** Değişikliklerinizi kendi çatalladığınız depoya gönderin:
    ```bash
    git push origin feature/kullanici-kayit-formu
    ```
*   **Pull Request (PR) Oluşturun:** Github'da çatalladığınız depoya gidin. "Compare & pull request" düğmesini göreceksiniz. Buna tıklayarak bir PR oluşturun.
    *   Lütfen PR başlığınızı ve açıklamanızı, yaptığınız değişikliği net bir şekilde anlatacak biçimde doldurun. Bir Issue'yu çözüyorsanız, açıklama kısmına `Fixes #123` gibi bir ifade ekleyin.

Bundan sonra, proje yöneticileri kodunuzu inceleyecek, geri bildirimde bulunacak ve her şey yolundaysa değişikliğinizi ana projeye dahil edecektir.

Sabrınız ve katkınız için şimdiden teşekkürler