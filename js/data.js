/* ============================================================
   VERİ KATMANI
   ------------------------------------------------------------
   Uygulama veriyi yalnızca fetchDutyPharmacies() üzerinden okur.

   CANLI VERİ (CollectAPI):
   1) https://collectapi.com adresinde ücretsiz hesap açın
   2) "Nöbetçi Eczane API"ye abone olun (ücretsiz plan mevcut)
   3) API anahtarınızı aşağıdaki collectApiKey alanına yapıştırın
      (yalnızca anahtar; başındaki "apikey " yazısı OLMADAN)

   Anahtar boş bırakılırsa uygulama örnek (demo) veriyle çalışır.
   ============================================================ */

const CONFIG = {
  // Varsayılan: aynı sunucudaki proxy ("/api") kullanılır — hem Cloudflare
  // Worker hem Vercel bu yolu sunar; API anahtarı istemciye hiç inmez.
  proxyUrl: "/api",

  // Anahtar BURAYA YAZILMAZ (depo herkese açık). Yerel geliştirme için
  // js/config.local.js dosyası kullanılır (gitignore'ludur, örneği README'de).
  collectApiKey: "",
};

const DUTY_HOURS = { start: "19:00", end: "08:30" };

/* 81 il — canlı veri modunda tamamı seçilebilir */
const ALL_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya",
  "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir",
  "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu",
  "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay",
  "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük",
  "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli",
  "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya",
  "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde",
  "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon",
  "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

/* İl merkezi koordinatları — "yanlış ildesiniz" tespiti ve en yakın
   il önerisi için (yaklaşık şehir merkezi, ~1 km hassasiyet yeterli) */
const CITY_CENTERS = {
  "Adana": [37.00, 35.32], "Adıyaman": [37.76, 38.28], "Afyonkarahisar": [38.76, 30.54],
  "Ağrı": [39.72, 43.05], "Aksaray": [38.37, 34.03], "Amasya": [40.65, 35.83],
  "Ankara": [39.93, 32.86], "Antalya": [36.90, 30.71], "Ardahan": [41.11, 42.70],
  "Artvin": [41.18, 41.82], "Aydın": [37.85, 27.85], "Balıkesir": [39.65, 27.89],
  "Bartın": [41.63, 32.34], "Batman": [37.88, 41.13], "Bayburt": [40.26, 40.22],
  "Bilecik": [40.15, 29.98], "Bingöl": [38.88, 40.50], "Bitlis": [38.40, 42.11],
  "Bolu": [40.74, 31.61], "Burdur": [37.72, 30.29], "Bursa": [40.19, 29.06],
  "Çanakkale": [40.15, 26.41], "Çankırı": [40.60, 33.62], "Çorum": [40.55, 34.95],
  "Denizli": [37.78, 29.09], "Diyarbakır": [37.91, 40.24], "Düzce": [40.84, 31.16],
  "Edirne": [41.68, 26.56], "Elazığ": [38.68, 39.22], "Erzincan": [39.75, 39.49],
  "Erzurum": [39.90, 41.27], "Eskişehir": [39.78, 30.52], "Gaziantep": [37.07, 37.38],
  "Giresun": [40.91, 38.39], "Gümüşhane": [40.46, 39.48], "Hakkari": [37.58, 43.74],
  "Hatay": [36.20, 36.16], "Iğdır": [39.92, 44.04], "Isparta": [37.77, 30.56],
  "İstanbul": [41.01, 28.98], "İzmir": [38.42, 27.13], "Kahramanmaraş": [37.58, 36.93],
  "Karabük": [41.20, 32.62], "Karaman": [37.18, 33.22], "Kars": [40.60, 43.10],
  "Kastamonu": [41.38, 33.78], "Kayseri": [38.73, 35.49], "Kırıkkale": [39.85, 33.51],
  "Kırklareli": [41.73, 27.22], "Kırşehir": [39.15, 34.16], "Kilis": [36.72, 37.12],
  "Kocaeli": [40.85, 29.88], "Konya": [37.87, 32.48], "Kütahya": [39.42, 29.98],
  "Malatya": [38.35, 38.31], "Manisa": [38.61, 27.43], "Mardin": [37.31, 40.74],
  "Mersin": [36.81, 34.64], "Muğla": [37.22, 28.36], "Muş": [38.73, 41.49],
  "Nevşehir": [38.62, 34.71], "Niğde": [37.97, 34.68], "Ordu": [40.98, 37.88],
  "Osmaniye": [37.07, 36.25], "Rize": [41.02, 40.52], "Sakarya": [40.76, 30.38],
  "Samsun": [41.29, 36.33], "Siirt": [37.93, 41.94], "Sinop": [42.03, 35.15],
  "Sivas": [39.75, 37.02], "Şanlıurfa": [37.16, 38.79], "Şırnak": [37.52, 42.46],
  "Tekirdağ": [40.98, 27.51], "Tokat": [40.31, 36.55], "Trabzon": [41.00, 39.72],
  "Tunceli": [39.11, 39.55], "Uşak": [38.68, 29.41], "Van": [38.49, 43.41],
  "Yalova": [40.65, 29.27], "Yozgat": [39.82, 34.81], "Zonguldak": [41.45, 31.79],
};

/* ---------- Demo veri (anahtar girilmediğinde) ---------- */

const DEMO_DATA = {
  "İstanbul": [
    { name: "Yeni Umut Eczanesi", district: "Kadıköy", neighborhood: "Caferağa Mah.", address: "Caferağa Mah. Moda Cad. No:114/A", phone: "0216 336 41 20", note: "Moda sahiline 200 m, Kadıköy İskelesi tarafı", lat: 40.9819, lng: 29.0246 },
    { name: "Şifa Eczanesi", district: "Kadıköy", neighborhood: "Kozyatağı Mah.", address: "Kozyatağı Mah. Bayar Cad. No:76/2", phone: "0216 384 22 51", note: "Kozyatağı metro çıkışı karşısı", lat: 40.9744, lng: 29.0919 },
    { name: "Merkez Eczanesi", district: "Üsküdar", neighborhood: "Mimar Sinan Mah.", address: "Mimar Sinan Mah. Hakimiyet-i Milliye Cad. No:38", phone: "0216 553 18 74", note: "Üsküdar Meydanı, çarşı içi", lat: 41.0247, lng: 29.0156 },
    { name: "Deniz Eczanesi", district: "Üsküdar", neighborhood: "Acıbadem Mah.", address: "Acıbadem Mah. Tekin Sok. No:8/B", phone: "0216 545 90 33", note: "Acıbadem Hastanesi yanı", lat: 41.0031, lng: 29.0439 },
    { name: "Aile Eczanesi", district: "Beşiktaş", neighborhood: "Sinanpaşa Mah.", address: "Sinanpaşa Mah. Ortabahçe Cad. No:12/1", phone: "0212 261 45 08", note: "Beşiktaş Çarşı, vapur iskelesine 3 dk", lat: 41.0430, lng: 29.0046 },
    { name: "Levent Eczanesi", district: "Beşiktaş", neighborhood: "Levent Mah.", address: "Levent Mah. Çarşı Cad. No:24", phone: "0212 279 16 62", note: "Levent Çarşısı içi", lat: 41.0805, lng: 29.0141 },
    { name: "Güneş Eczanesi", district: "Şişli", neighborhood: "Meşrutiyet Mah.", address: "Meşrutiyet Mah. Halaskargazi Cad. No:215/A", phone: "0212 240 73 55", note: "Osmanbey metro durağına 1 dk", lat: 41.0533, lng: 28.9877 },
    { name: "Hayat Eczanesi", district: "Şişli", neighborhood: "Mecidiyeköy Mah.", address: "Mecidiyeköy Mah. Büyükdere Cad. No:87/3", phone: "0212 275 34 19", note: "Mecidiyeköy metrobüs üst geçidi yanı", lat: 41.0672, lng: 28.9948 },
    { name: "Çınar Eczanesi", district: "Fatih", neighborhood: "Aksaray Mah.", address: "Aksaray Mah. Ordu Cad. No:212/B", phone: "0212 528 66 41", note: "Aksaray metro çıkışı, Pertevniyal Lisesi karşısı", lat: 41.0116, lng: 28.9527 },
    { name: "Marmara Eczanesi", district: "Fatih", neighborhood: "Cerrahpaşa Mah.", address: "Cerrahpaşa Mah. Koca Mustafapaşa Cad. No:44", phone: "0212 588 12 90", note: "Cerrahpaşa Tıp Fakültesi acil kapısı karşısı", lat: 41.0039, lng: 28.9391 },
    { name: "Pelin Eczanesi", district: "Bakırköy", neighborhood: "Zeytinlik Mah.", address: "Zeytinlik Mah. Fişekhane Cad. No:31/1", phone: "0212 543 27 84", note: "Bakırköy Meydanı, Özgürlük Anıtı yanı", lat: 40.9799, lng: 28.8722 },
    { name: "Ataköy Eczanesi", district: "Bakırköy", neighborhood: "Ataköy 3-4-11. Kısım Mah.", address: "Ataköy 4. Kısım Çarşısı No:17", phone: "0212 559 08 46", note: "Ataköy 4. Kısım Çarşısı içi", lat: 40.9847, lng: 28.8551 },
    { name: "Yıldız Eczanesi", district: "Kartal", neighborhood: "Kordonboyu Mah.", address: "Kordonboyu Mah. Ankara Cad. No:98/A", phone: "0216 353 71 25", note: "Kartal Lütfi Kırdar Şehir Hastanesi'ne 5 dk", lat: 40.8891, lng: 29.1897 },
    { name: "Anadolu Eczanesi", district: "Pendik", neighborhood: "Batı Mah.", address: "Batı Mah. 23 Nisan Cad. No:16/C", phone: "0216 483 55 09", note: "Pendik sahil yolu, marina girişi karşısı", lat: 40.8747, lng: 29.2333 },
  ],

  "Ankara": [
    { name: "Başkent Eczanesi", district: "Çankaya", neighborhood: "Kızılay Mah.", address: "Kızılay Mah. Atatürk Bulvarı No:97/B", phone: "0312 418 32 47", note: "Kızılay Meydanı, Güvenpark karşısı", lat: 39.9188, lng: 32.8541 },
    { name: "Tunalı Eczanesi", district: "Çankaya", neighborhood: "Kavaklıdere Mah.", address: "Kavaklıdere Mah. Tunalı Hilmi Cad. No:64/A", phone: "0312 427 90 15", note: "Kuğulu Park'a 2 dk", lat: 39.9070, lng: 32.8621 },
    { name: "Sıhhiye Eczanesi", district: "Çankaya", neighborhood: "Sağlık Mah.", address: "Sağlık Mah. Mithatpaşa Cad. No:23", phone: "0312 431 58 26", note: "Hacettepe Hastanesi acil girişi karşısı", lat: 39.9276, lng: 32.8580 },
    { name: "Ulus Eczanesi", district: "Altındağ", neighborhood: "Anafartalar Mah.", address: "Anafartalar Mah. Anafartalar Cad. No:51", phone: "0312 310 74 92", note: "Ulus Heykel yakını", lat: 39.9427, lng: 32.8560 },
    { name: "Demetevler Eczanesi", district: "Yenimahalle", neighborhood: "Demetevler Mah.", address: "Demetevler Mah. 337. Sok. No:5/A", phone: "0312 336 20 61", note: "Demetevler metro durağına 3 dk", lat: 39.9723, lng: 32.7889 },
    { name: "Batıkent Eczanesi", district: "Yenimahalle", neighborhood: "Batıkent Mah.", address: "Batıkent Mah. Vedat Dalokay Cad. No:112", phone: "0312 255 43 18", note: "Batıkent metro çıkışı", lat: 39.9662, lng: 32.7317 },
    { name: "Keçiören Eczanesi", district: "Keçiören", neighborhood: "Etlik Mah.", address: "Etlik Mah. Yunus Emre Cad. No:29/B", phone: "0312 321 66 30", note: "Etlik Şehir Hastanesi'ne 4 dk", lat: 39.9847, lng: 32.8309 },
    { name: "Mamak Eczanesi", district: "Mamak", neighborhood: "Abidinpaşa Mah.", address: "Abidinpaşa Mah. Malazgirt Cad. No:73", phone: "0312 365 12 84", note: "Abidinpaşa Polikliniği yanı", lat: 39.9302, lng: 32.9006 },
  ],

  "İzmir": [
    { name: "Kordon Eczanesi", district: "Konak", neighborhood: "Alsancak Mah.", address: "Alsancak Mah. Kıbrıs Şehitleri Cad. No:140/A", phone: "0232 464 27 53", note: "Alsancak Sevinç Pastanesi karşısı", lat: 38.4370, lng: 27.1428 },
    { name: "Ege Eczanesi", district: "Konak", neighborhood: "Güzelyalı Mah.", address: "Güzelyalı Mah. Mithatpaşa Cad. No:1124", phone: "0232 285 61 40", note: "Güzelyalı vapur iskelesi karşısı", lat: 38.3970, lng: 27.0819 },
    { name: "Karşıyaka Eczanesi", district: "Karşıyaka", neighborhood: "Bostanlı Mah.", address: "Bostanlı Mah. Cemal Gürsel Cad. No:387/B", phone: "0232 336 84 15", note: "Bostanlı Pazaryeri yanı", lat: 38.4650, lng: 27.0980 },
    { name: "Çarşı Eczanesi", district: "Karşıyaka", neighborhood: "Donanmacı Mah.", address: "Donanmacı Mah. Kemalpaşa Cad. No:52", phone: "0232 368 30 92", note: "Karşıyaka Çarşı, İZBAN çıkışı", lat: 38.4560, lng: 27.1120 },
    { name: "Bornova Eczanesi", district: "Bornova", neighborhood: "Kazımdirik Mah.", address: "Kazımdirik Mah. 372. Sok. No:18/A", phone: "0232 342 75 06", note: "Ege Üniversitesi Hastanesi acil karşısı", lat: 38.4544, lng: 27.2137 },
    { name: "Buca Eczanesi", district: "Buca", neighborhood: "Şirinyer Mah.", address: "Şirinyer Mah. Menderes Cad. No:213", phone: "0232 448 19 37", note: "Şirinyer aktarma merkezi yanı", lat: 38.3852, lng: 27.1683 },
  ],
};

/* ---------- Yardımcılar ---------- */

function hasLiveData() {
  return CONFIG.proxyUrl.trim().length > 0 || CONFIG.collectApiKey.trim().length > 0;
}

function getCities() {
  return hasLiveData() ? ALL_CITIES : Object.keys(DEMO_DATA);
}

// API bazı alanları TAMAMEN BÜYÜK HARF döndürür; okunabilirlik için
// "AKYURT MERKEZ ECZANESİ" → "Akyurt Merkez Eczanesi" (yalnızca tümü
// büyükse dokunur, karışık yazımı korur)
function trTitleCase(s) {
  if (!s || s !== s.toLocaleUpperCase("tr-TR")) return s;
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/(^|[\s./-])(\S)/g, (_, sep, ch) =>
      sep + ch.toLocaleUpperCase("tr-TR")
    );
}

// "Caferağa Mah. Moda Cad. No:114" → "Caferağa Mah."
function extractNeighborhood(address) {
  const m = (address || "").match(/([^,;]{2,40}?(?:Mah\.|Mahallesi))/i);
  return m ? m[1].trim() : "";
}

// API'den "0(216)381-21-12", "90 216...", "+90..." gibi karışık
// biçimler gelir; son 10 haneyi alıp "0216 381 21 12" biçimine çevirir
function formatPhone(raw) {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length < 10) return raw || "";
  const c = d.slice(-10);
  return `0${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6, 8)} ${c.slice(8)}`;
}

/* CollectAPI kaydını uygulama şemasına çevirir */
function mapCollectApiRecord(r) {
  let lat = null, lng = null;
  if (r.loc && r.loc.includes(",")) {
    const [la, ln] = r.loc.split(",").map(Number);
    if (Number.isFinite(la) && Number.isFinite(ln)) { lat = la; lng = ln; }
  }
  // Kaynak veride ara sıra "No:No:3/A" gibi yinelenmeler olur
  const address = (r.address || "").replace(/No:\s*No:/gi, "No:").trim();

  return {
    name: trTitleCase(r.name || ""),
    district: trTitleCase(r.dist || ""),
    neighborhood: extractNeighborhood(address),
    address,
    phone: formatPhone(r.phone),
    note: "",
    lat,
    lng,
  };
}

/* Aynı gün içinde tekrar tekrar API kotası harcamamak için önbellek.
   localStorage kullanılır: sekme/tarayıcı kapansa bile gün boyu geçerlidir. */
function cacheKey(city) {
  return `duty:${city}:${new Date().toISOString().slice(0, 10)}`;
}

function readCache(city) {
  try {
    const raw = localStorage.getItem(cacheKey(city));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Eski biçim (yalın dizi) ile geriye dönük uyumluluk
    return Array.isArray(parsed) ? { t: null, data: parsed } : parsed;
  } catch { return null; }
}

function writeCache(city, data) {
  try {
    purgeOldCache();
    localStorage.setItem(cacheKey(city), JSON.stringify({ t: Date.now(), data }));
  } catch {}
}

/* Son başarılı veri alımının zamanı — arayüzdeki güven damgası için */
let lastFetchInfo = { time: null, cached: false };
function getLastFetchInfo() { return lastFetchInfo; }

/* Önceki günlerin listelerini temizler */
function purgeOldCache() {
  const today = new Date().toISOString().slice(0, 10);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith("duty:") && !k.endsWith(today)) {
      localStorage.removeItem(k);
    }
  }
}

/* ---------- Ana giriş noktası ---------- */

/**
 * Bugünün nöbetçi eczanelerini getirir.
 * @param {string} city - İl adı (ör. "İstanbul")
 * @returns {Promise<Array>} eczane listesi
 * @throws canlı veri modunda ağ/API hatasında Error fırlatır
 */
async function fetchDutyPharmacies(city) {
  if (!hasLiveData()) {
    // Demo mod: ağ gecikmesini taklit et (yükleme durumu görünür olsun)
    await new Promise((r) => setTimeout(r, 150));
    lastFetchInfo = { time: new Date(), cached: false };
    return DEMO_DATA[city] || [];
  }

  const cached = readCache(city);
  if (cached) {
    lastFetchInfo = { time: cached.t ? new Date(cached.t) : null, cached: true };
    return cached.data;
  }

  // Proxy varsa oradan (anahtarsız), yoksa CollectAPI'den doğrudan çek
  const useProxy = CONFIG.proxyUrl.trim().length > 0;
  const url = useProxy
    ? `${CONFIG.proxyUrl.trim()}/dutyPharmacy?il=${encodeURIComponent(city)}`
    : `https://api.collectapi.com/health/dutyPharmacy?il=${encodeURIComponent(city)}`;

  const res = await fetch(
    url,
    useProxy
      ? {}
      : {
          headers: {
            "content-type": "application/json",
            authorization: `apikey ${CONFIG.collectApiKey.trim()}`,
          },
        }
  );

  if (!res.ok) {
    throw new Error(`API yanıtı: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json.success || !Array.isArray(json.result)) {
    throw new Error("API beklenmeyen bir yanıt döndürdü");
  }

  const pharmacies = json.result.map(mapCollectApiRecord);
  writeCache(city, pharmacies);
  lastFetchInfo = { time: new Date(), cached: false };
  return pharmacies;
}
