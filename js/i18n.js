/* ============================================================
   ÇOK DİLLİLİK (TR / EN / AR)
   ------------------------------------------------------------
   t(anahtar, degiskenler) → aktif dilde metin.
   Arapça seçilince belge sağdan-sola (RTL) düzene geçer.
   Şehir/ilçe adları özel isim olduğundan çevrilmez.
   ============================================================ */

const I18N = {
  tr: {
    "app.title": "Nöbetçi Eczane",
    "app.docTitle": "Nöbetçi Eczane Bul",
    "badge.active": "Nöbet aktif",
    "badge.evening": "Bu akşamın listesi",
    "duty.active": "<b>Nöbet aktif</b> · bitişine {left}",
    "duty.sunday": "<b>Nöbet aktif</b> · pazar günü gün boyu nöbetçiler hizmette",
    "duty.day": "Nöbet {start}'da başlar · {left} kaldı",
    "time.hm": "{h} sa {m} dk",
    "time.m": "{m} dk",
    "em.btnTitle": "En Yakın Nöbetçiyi Bul",
    "em.btnSub": "Tek dokunuş — konumunuza en yakın açık eczane",
    "label.city": "İl",
    "label.district": "İlçe",
    "district.all": "Tüm ilçeler",
    "locate.default": "Konumumu kullan — en yakını göster",
    "locate.locating": "Konum alınıyor…",
    "locate.acquired": "Konum alındı ✓ — en yakın önce",
    "locate.home": "Mesafeler Evim'e göre — canlı konum için dokunun",
    "locate.denied": "Konum izni verilmedi — tekrar deneyin",
    "locate.unsupported": "Tarayıcınız konum desteklemiyor",
    "home.save": "Bu konumu Evim olarak kaydet",
    "home.saved": "Evim kayıtlı — mesafeler otomatik · <u>kaldır</u>",
    "toast.homeSaved": "Evim kaydedildi — mesafeler artık hep hazır",
    "toast.homeRemoved": "Evim kaydı kaldırıldı",
    "search.placeholder": "Eczane veya mahalle ara…",
    "sort.district": "İlçeye göre",
    "sort.name": "A–Z",
    "sort.distance": "En yakın",
    "view.list": "Liste",
    "view.map": "Harita",
    "count.found": "<b>{n} nöbetçi eczane</b> bulundu — {where}",
    "loading": "Nöbet listesi yükleniyor…",
    "source.live": "Kaynak: İl Eczacı Odası günlük nöbet listesi",
    "source.updated": "Güncellendi {time}",
    "source.demo": "Örnek (demo) veri gösteriliyor",
    "empty.title": "Sonuç bulunamadı",
    "empty.body": "Aramanızla eşleşen nöbetçi eczane yok.<br>Yazımı kontrol edin veya ilçe filtresini <b>“Tüm ilçeler”</b> yapın.",
    "empty.reset": "Filtreleri temizle",
    "error.title": "Liste yüklenemedi",
    "error.body": "Nöbet listesine şu an ulaşılamıyor.<br>İnternet bağlantınızı kontrol edip tekrar deneyin.",
    "error.retry": "Tekrar dene",
    "warn.far": "Konumunuz {city} eczanelerinden uzakta görünüyor (en yakını ~{km} km). {suggest} ilinde olabilirsiniz.",
    "warn.farPlain": "Konumunuz seçili ildeki eczanelerden uzakta görünüyor (en yakını ~{km} km). Yukarıdan ilinizi kontrol edin.",
    "warn.switch": "{city} iline geç",
    "warn.close": "Kapat",
    "card.open": "Nöbetçi · Açık",
    "card.call": "Ara",
    "card.directions": "Yol Tarifi",
    "card.share": "Eczane bilgisini paylaş",
    "distance.away": "{d} uzakta",
    "est.walk": "~{m} dk yürüme",
    "est.car": "~{m} dk araçla",
    "em.rank1": "Size en yakın nöbetçi",
    "em.rankN": "{n}. en yakın nöbetçi",
    "em.call": "Hemen Ara",
    "em.dir": "Yol Tarifi Al",
    "em.share": "Paylaş",
    "em.next": "Sonraki en yakın",
    "em.locating": "Konumunuz alınıyor…",
    "em.fetching": "<b>{city}</b> nöbet listesi alınıyor…",
    "em.noGeo": "Tarayıcınız konum özelliğini desteklemiyor.<br>Aşağıdaki listeden ilçenizi seçerek arayabilirsiniz.",
    "em.denied": "<b>Konum izni verilmedi.</b><br>Tarayıcı ayarlarından izin verip tekrar deneyin ya da aşağıdaki listeden ilçenizi seçin.",
    "em.noCoords": "Bu il için konum bilgili eczane kaydı yok.<br>Listeden ilçenize göre arayabilirsiniz.",
    "em.netFail": "Nöbet listesine ulaşılamadı.<br>Bağlantınızı kontrol edip tekrar deneyin.",
    "map.hint": "İşarete dokunun: eczane bilgisi, arama ve yol tarifi açılır.",
    "share.text": "{name} — Nöbetçi Eczane\n{address} ({district}/{city})\nTel: {phone}\nHarita: {url}",
    "toast.copied": "Eczane bilgisi panoya kopyalandı",
    "toast.noShare": "Paylaşım bu tarayıcıda desteklenmiyor",
    "footer.hours": "<b>Nöbet saatleri:</b> Eczaneler akşam kapanışından ertesi sabah açılışa kadar (genellikle 19:00 – 08:30) nöbetçidir; listedeki eczaneler bugün 24 saat hizmet verir.",
    "footer.live": "Veriler CollectAPI üzerinden canlı alınmaktadır ve gün içinde güncellenir. Gitmeden önce eczaneyi arayarak teyit edebilirsiniz. Acil durumlar için <b>112</b>.",
    "footer.demo": "Şu an <b>örnek (demo) veri</b> gösterilmektedir. Canlı veri için <code>js/data.js</code> dosyasına CollectAPI anahtarınızı ekleyin. Acil durumlar için <b>112</b>.",
  },

  en: {
    "app.title": "Duty Pharmacy",
    "app.docTitle": "Find Duty Pharmacy in Türkiye",
    "badge.active": "On duty now",
    "badge.evening": "Tonight's list",
    "duty.active": "<b>On duty now</b> · ends in {left}",
    "duty.sunday": "<b>On duty now</b> · duty pharmacies serve all day on Sundays",
    "duty.day": "Duty starts at {start} · {left} to go",
    "time.hm": "{h} h {m} min",
    "time.m": "{m} min",
    "em.btnTitle": "Find the Nearest Duty Pharmacy",
    "em.btnSub": "One tap — the closest open pharmacy to you",
    "label.city": "Province",
    "label.district": "District",
    "district.all": "All districts",
    "locate.default": "Use my location — show nearest",
    "locate.locating": "Getting your location…",
    "locate.acquired": "Location set ✓ — nearest first",
    "locate.home": "Distances from Home — tap for live location",
    "locate.denied": "Location permission denied — try again",
    "locate.unsupported": "Your browser doesn't support location",
    "home.save": "Save this location as Home",
    "home.saved": "Home saved — distances are automatic · <u>remove</u>",
    "toast.homeSaved": "Home saved — distances are always ready now",
    "toast.homeRemoved": "Home location removed",
    "search.placeholder": "Search pharmacy or neighbourhood…",
    "sort.district": "By district",
    "sort.name": "A–Z",
    "sort.distance": "Nearest",
    "view.list": "List",
    "view.map": "Map",
    "count.found": "<b>{n} pharmacies on duty</b> — {where}",
    "loading": "Loading tonight's duty list…",
    "source.live": "Source: official daily duty roster (Chamber of Pharmacists)",
    "source.updated": "Updated {time}",
    "source.demo": "Showing sample (demo) data",
    "empty.title": "No results",
    "empty.body": "No duty pharmacy matches your search.<br>Check the spelling or set the district filter to <b>“All districts”</b>.",
    "empty.reset": "Clear filters",
    "error.title": "Couldn't load the list",
    "error.body": "The duty list is unreachable right now.<br>Check your connection and try again.",
    "error.retry": "Try again",
    "warn.far": "You seem far from pharmacies in {city} (nearest ~{km} km). You might be in {suggest}.",
    "warn.farPlain": "You seem far from pharmacies in the selected province (nearest ~{km} km). Check the province above.",
    "warn.switch": "Switch to {city}",
    "warn.close": "Dismiss",
    "card.open": "On duty · Open",
    "card.call": "Call",
    "card.directions": "Directions",
    "card.share": "Share pharmacy details",
    "distance.away": "{d} away",
    "est.walk": "~{m} min walk",
    "est.car": "~{m} min drive",
    "em.rank1": "Nearest duty pharmacy to you",
    "em.rankN": "Nearest #{n}",
    "em.call": "Call Now",
    "em.dir": "Get Directions",
    "em.share": "Share",
    "em.next": "Next nearest",
    "em.locating": "Getting your location…",
    "em.fetching": "Fetching the duty list for <b>{city}</b>…",
    "em.noGeo": "Your browser doesn't support geolocation.<br>You can pick your district from the list below.",
    "em.denied": "<b>Location permission denied.</b><br>Allow it in browser settings and retry, or pick your district from the list below.",
    "em.noCoords": "No geo-tagged pharmacies for this province.<br>You can browse the list by district.",
    "em.netFail": "Couldn't reach the duty list.<br>Check your connection and try again.",
    "map.hint": "Tap a marker for pharmacy details, call and directions.",
    "share.text": "{name} — Duty Pharmacy\n{address} ({district}/{city})\nPhone: {phone}\nMap: {url}",
    "toast.copied": "Pharmacy details copied to clipboard",
    "toast.noShare": "Sharing isn't supported in this browser",
    "footer.hours": "<b>Duty hours:</b> Pharmacies are on duty from evening closing until next morning (typically 19:00 – 08:30); the pharmacies listed serve 24 hours today.",
    "footer.live": "Data is fetched live via CollectAPI and updated during the day. Consider calling the pharmacy before you go. For emergencies dial <b>112</b>.",
    "footer.demo": "Currently showing <b>sample (demo) data</b>. Add your CollectAPI key in <code>js/data.js</code> for live data. For emergencies dial <b>112</b>.",
  },

  ar: {
    "app.title": "صيدلية مناوبة",
    "app.docTitle": "ابحث عن صيدلية مناوبة في تركيا",
    "badge.active": "المناوبة جارية",
    "badge.evening": "قائمة هذه الليلة",
    "duty.active": "<b>المناوبة جارية</b> · تنتهي بعد {left}",
    "duty.sunday": "<b>المناوبة جارية</b> · يوم الأحد تعمل الصيدليات المناوبة طوال اليوم",
    "duty.day": "تبدأ المناوبة الساعة {start} · بقي {left}",
    "time.hm": "{h} س {m} د",
    "time.m": "{m} د",
    "em.btnTitle": "اعثر على أقرب صيدلية مناوبة",
    "em.btnSub": "لمسة واحدة — أقرب صيدلية مفتوحة إليك",
    "label.city": "المحافظة",
    "label.district": "المنطقة",
    "district.all": "كل المناطق",
    "locate.default": "استخدم موقعي — أظهر الأقرب",
    "locate.locating": "جارٍ تحديد الموقع…",
    "locate.acquired": "تم تحديد الموقع ✓ — الأقرب أولاً",
    "locate.home": "المسافات وفق «منزلي» — المس للموقع المباشر",
    "locate.denied": "لم يُمنح إذن الموقع — حاول مجدداً",
    "locate.unsupported": "متصفحك لا يدعم تحديد الموقع",
    "home.save": "احفظ هذا الموقع كـ«منزلي»",
    "home.saved": "«منزلي» محفوظ — المسافات تلقائية · <u>إزالة</u>",
    "toast.homeSaved": "تم حفظ «منزلي» — المسافات جاهزة دائماً",
    "toast.homeRemoved": "أُزيل موقع «منزلي»",
    "search.placeholder": "ابحث عن صيدلية أو حي…",
    "sort.district": "حسب المنطقة",
    "sort.name": "أ–ي",
    "sort.distance": "الأقرب",
    "view.list": "قائمة",
    "view.map": "خريطة",
    "count.found": "تم العثور على <b>{n} صيدلية مناوبة</b> — {where}",
    "loading": "جارٍ تحميل قائمة المناوبة…",
    "source.live": "المصدر: قائمة المناوبة اليومية لنقابة الصيادلة",
    "source.updated": "حُدِّثت {time}",
    "source.demo": "تُعرض بيانات تجريبية",
    "empty.title": "لا نتائج",
    "empty.body": "لا توجد صيدلية مناوبة مطابقة لبحثك.<br>تحقق من الكتابة أو اختر <b>«كل المناطق»</b>.",
    "empty.reset": "امسح عوامل التصفية",
    "error.title": "تعذر تحميل القائمة",
    "error.body": "يتعذر الوصول إلى قائمة المناوبة حالياً.<br>تحقق من اتصالك وحاول مجدداً.",
    "error.retry": "حاول مجدداً",
    "warn.far": "يبدو موقعك بعيداً عن صيدليات {city} (الأقرب ~{km} كم). قد تكون في {suggest}.",
    "warn.farPlain": "يبدو موقعك بعيداً عن صيدليات المحافظة المختارة (الأقرب ~{km} كم). تحقق من المحافظة أعلاه.",
    "warn.switch": "الانتقال إلى {city}",
    "warn.close": "إغلاق",
    "card.open": "مناوبة · مفتوحة",
    "card.call": "اتصال",
    "card.directions": "الاتجاهات",
    "card.share": "مشاركة معلومات الصيدلية",
    "distance.away": "على بعد {d}",
    "est.walk": "~{m} د مشياً",
    "est.car": "~{m} د بالسيارة",
    "em.rank1": "أقرب صيدلية مناوبة إليك",
    "em.rankN": "الأقرب رقم {n}",
    "em.call": "اتصل الآن",
    "em.dir": "احصل على الاتجاهات",
    "em.share": "مشاركة",
    "em.next": "التالية الأقرب",
    "em.locating": "جارٍ تحديد موقعك…",
    "em.fetching": "جارٍ جلب قائمة مناوبة <b>{city}</b>…",
    "em.noGeo": "متصفحك لا يدعم تحديد الموقع.<br>يمكنك اختيار منطقتك من القائمة أدناه.",
    "em.denied": "<b>لم يُمنح إذن الموقع.</b><br>اسمح به من إعدادات المتصفح وحاول مجدداً، أو اختر منطقتك من القائمة أدناه.",
    "em.noCoords": "لا توجد صيدليات بموقع جغرافي لهذه المحافظة.<br>يمكنك تصفح القائمة حسب المنطقة.",
    "em.netFail": "تعذر الوصول إلى قائمة المناوبة.<br>تحقق من اتصالك وحاول مجدداً.",
    "map.hint": "المس العلامة: تظهر معلومات الصيدلية والاتصال والاتجاهات.",
    "share.text": "{name} — صيدلية مناوبة\n{address} ({district}/{city})\nهاتف: {phone}\nالخريطة: {url}",
    "toast.copied": "نُسخت معلومات الصيدلية إلى الحافظة",
    "toast.noShare": "المشاركة غير مدعومة في هذا المتصفح",
    "footer.hours": "<b>ساعات المناوبة:</b> تعمل الصيدليات المناوبة من إغلاق المساء حتى صباح اليوم التالي (عادة 19:00 – 08:30)؛ الصيدليات المدرجة تعمل اليوم على مدار الساعة.",
    "footer.live": "تُجلب البيانات مباشرة عبر CollectAPI وتُحدَّث خلال اليوم. يُستحسن الاتصال بالصيدلية قبل الذهاب. للطوارئ اتصل بـ<b>112</b>.",
    "footer.demo": "تُعرض حالياً <b>بيانات تجريبية</b>. أضف مفتاح CollectAPI في <code>js/data.js</code> للبيانات المباشرة. للطوارئ اتصل بـ<b>112</b>.",
  },
};

const LANG_KEY = "eczane:lang";
const LOCALES = { tr: "tr-TR", en: "en-GB", ar: "ar" };

let LANG = (() => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
  } catch {}
  const nav = (navigator.language || "tr").slice(0, 2).toLowerCase();
  return I18N[nav] ? nav : "en";
})();

function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.tr[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}

function currentLocale() {
  return LOCALES[LANG] || "tr-TR";
}

/* Statik HTML'deki data-i18n / data-i18n-html / data-i18n-placeholder
   öznitelikli öğeleri aktif dile çevirir */
function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.title = t("app.docTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function setLang(code) {
  if (!I18N[code]) return;
  LANG = code;
  try { localStorage.setItem(LANG_KEY, code); } catch {}
  applyStaticI18n();
  // app.js yüklendiyse dinamik bölümleri de tazele
  if (typeof refreshAfterLangChange === "function") refreshAfterLangChange();
}
