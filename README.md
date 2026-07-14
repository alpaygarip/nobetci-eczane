# Nöbetçi Eczane Bul

Şehrinizdeki nöbetçi eczaneleri saniyeler içinde bulun: il/ilçe filtresi,
arama, "en yakın" sıralaması, tek dokunuşla arama ve yol tarifi.

Kurulum gerektirmez — saf HTML + CSS + JavaScript.

## Çalıştırma

`index.html` dosyasını çift tıklayıp tarayıcıda açmanız yeterli.

İsterseniz yerel sunucuyla da açabilirsiniz (konum izni bazı tarayıcılarda
yalnızca `http://localhost` üzerinde çalışır):

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Canlı veri ve API anahtarı

Veriler CollectAPI "Nöbetçi Eczane API" servisinden gelir
([collectapi.com](https://collectapi.com) → ücretsiz hesap → abonelik →
Hesap/Profil/API Token). Anahtar **hiçbir zaman depoya yazılmaz**:

- **Yayında:** İstemci `/api/dutyPharmacy` proxy'sini çağırır; anahtar
  sunucu tarafında secret/ortam değişkeni olarak durur.
- **Yerelde (proxy'siz):** Depoya girmeyen `js/config.local.js` dosyasını
  oluşturun:

```js
// js/config.local.js  (.gitignore'ludur)
CONFIG.proxyUrl = "";
CONFIG.collectApiKey = "COLLECTAPI-ANAHTARINIZ";
```

Anahtar hiçbir yerde tanımlı değilse uygulama üç şehirlik örnek (demo)
veriyle çalışır. Günlük il sorguları cihazda önbelleğe alınır; kota korunur.

## Telefona kurulum (PWA)

Uygulama bir PWA'dır: tarayıcıda açıp **"Ana ekrana ekle"** derseniz
uygulama gibi kurulur, kabuğu çevrimdışı da açılır ve daha önce
baktığınız illerin listesi internetsiz görüntülenebilir.

## Yayınlama: Vercel (GitHub entegrasyonlu — ücretsiz)

Depo GitHub'a bağlandığında her `git push` otomatik yayınlanır.
`api/dutyPharmacy.js` serverless fonksiyonu proxy görevi görür.

1. [vercel.com](https://vercel.com)'da GitHub ile giriş yapıp bu depoyu
   **Import** edin (ayar değiştirmeye gerek yok, statik site otomatik algılanır).
2. Project → **Settings → Environment Variables**:
   `COLLECT_API_KEY` = CollectAPI anahtarınız (Production).
3. Deploy. Yanıtlar `s-maxage=1800` ile edge önbelleğine alınır;
   il başına 30 dakikada en fazla 1 istek CollectAPI'ye gider.

## Yayınlama: Cloudflare Workers (alternatif — ücretsiz)

Yayın mimarisi API anahtarını istemciden tamamen çıkarır:
tarayıcı → `siteniz/api/dutyPharmacy` → Worker (anahtar burada, secret
olarak) → CollectAPI. Ayrıca yanıtlar il+gün bazında edge önbelleğine
alınır; kaç ziyaretçi olursa olsun kota il başına günde ~1 istek harcar.

```bash
npx wrangler login                      # Cloudflare hesabıyla oturum aç (ücretsiz hesap: dash.cloudflare.com)
npx wrangler secret put COLLECT_API_KEY # sorulunca CollectAPI anahtarını yapıştır
./build.sh                              # dist/ üret (anahtar silinir, proxy açılır)
npx wrangler deploy                     # yayınla → https://nobetci-eczane.<hesap>.workers.dev
```

Güncelleme yayınlamak için: `./build.sh && npx wrangler deploy`
(kabuk dosyaları değiştiyse `sw.js` içindeki `CACHE` sürümünü artırın).

Yerelde yayın kurulumunu denemek için: `npx wrangler dev --local`
(anahtarı `.dev.vars` dosyasından okur; bu dosyayı asla paylaşmayın).

## Dosya yapısı

| Dosya | Görev |
|---|---|
| `index.html` | Sayfa iskeleti |
| `css/style.css` | Tasarım (açık/koyu tema, mobil öncelikli) |
| `js/data.js` | Veri katmanı — demo veri + CollectAPI/proxy entegrasyonu |
| `js/app.js` | Arayüz mantığı — filtre, arama, sıralama, konum |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: kurulum + çevrimdışı kabuk |
| `worker/worker.js`, `wrangler.toml` | Cloudflare Worker: site + API proxy |
| `build.sh` | Yayın kopyası üretir (`dist/`, anahtar temizlenir) |
| `.dev.vars` | Yerel Worker testi için anahtar (gizli tutun) |

Farklı bir veri kaynağına (ör. İl Eczacı Odası, NosyAPI) geçmek için
yalnızca `js/data.js` içindeki `fetchDutyPharmacies()` fonksiyonunu
değiştirmeniz yeterlidir; arayüz koduna dokunmanız gerekmez.
