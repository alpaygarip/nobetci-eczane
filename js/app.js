/* ============================================================
   Nöbetçi Eczane Bul — uygulama mantığı
   ============================================================ */

const els = {
  dateLine: document.getElementById("dateLine"),
  citySelect: document.getElementById("citySelect"),
  districtSelect: document.getElementById("districtSelect"),
  locateBtn: document.getElementById("locateBtn"),
  locateBtnText: document.getElementById("locateBtnText"),
  searchInput: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearch"),
  sortBtns: document.querySelectorAll(".sort-btn"),
  sortDistanceBtn: document.getElementById("sortDistanceBtn"),
  resultCount: document.getElementById("resultCount"),
  list: document.getElementById("pharmacyList"),
  emptyState: document.getElementById("emptyState"),
  resetFilters: document.getElementById("resetFilters"),
  errorState: document.getElementById("errorState"),
  errorMessage: document.getElementById("errorMessage"),
  retryBtn: document.getElementById("retryBtn"),
  dataSourceNote: document.getElementById("dataSourceNote"),
  locationWarning: document.getElementById("locationWarning"),
  locationWarningText: document.getElementById("locationWarningText"),
  switchCityBtn: document.getElementById("switchCityBtn"),
  dismissWarning: document.getElementById("dismissWarning"),
  dutyLine: document.getElementById("dutyLine"),
  liveBadgeText: document.getElementById("liveBadgeText"),
  emergencyBtn: document.getElementById("emergencyBtn"),
  emergencyOverlay: document.getElementById("emergencyOverlay"),
  emBody: document.getElementById("emBody"),
  emClose: document.getElementById("emClose"),
  toast: document.getElementById("toast"),
  mapView: document.getElementById("mapView"),
  viewListBtn: document.getElementById("viewListBtn"),
  viewMapBtn: document.getElementById("viewMapBtn"),
  homeBtn: document.getElementById("homeBtn"),
  sourceLine: document.getElementById("sourceLine"),
  textSizeBtn: document.getElementById("textSizeBtn"),
};

const state = {
  city: "İstanbul",
  district: "",
  query: "",
  sort: "district",          // district | name | distance
  view: "list",              // list | map
  userLocation: null,        // { lat, lng }
  pharmacies: [],
  loading: false,
  error: null,
};

/* ---------- Yardımcılar ---------- */

// Türkçe'ye uygun küçültme (İ→i, I→ı) — aramada büyük/küçük harf sorunu yaşatmaz
function trLower(s) {
  return s.toLocaleLowerCase("tr-TR");
}

// İki koordinat arası kuş uçuşu mesafe (km) — Haversine formülü
function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Kuş uçuşu mesafeden kaba yolculuk süresi (×1,3 güzergâh katsayısı)
function travelEstimates(km) {
  const route = km * 1.3;
  return {
    walkMin: Math.max(1, Math.round((route / 4.5) * 60)),  // 4,5 km/sa yürüme
    carMin: Math.max(2, Math.round((route / 28) * 60)),    // ~28 km/sa şehir içi
  };
}

function mapsUrl(p) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(`${p.name} ${p.address} ${p.district} ${state.city}`)
  );
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

/* ---------- Son seçimi hatırlama ---------- */

const PREF_KEY = "eczane:pref";

function savePrefs() {
  try {
    localStorage.setItem(
      PREF_KEY,
      JSON.stringify({ city: state.city, district: state.district })
    );
  } catch {}
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY)) || {};
  } catch {
    return {};
  }
}

/* ---------- "Evim" konumu ---------- */

const HOME_KEY = "eczane:home";

function loadHome() {
  try {
    const h = JSON.parse(localStorage.getItem(HOME_KEY));
    return h && Number.isFinite(h.lat) && Number.isFinite(h.lng) ? h : null;
  } catch { return null; }
}

// usingHome: mesafelerin referansı canlı GPS değil, kayıtlı Evim
function updateHomeBtn() {
  const home = loadHome();
  if (home) {
    els.homeBtn.hidden = false;
    els.homeBtn.innerHTML = `${ICONS.home} Evim kayıtlı — mesafeler otomatik · <u>kaldır</u>`;
  } else if (state.userLocation) {
    els.homeBtn.hidden = false;
    els.homeBtn.innerHTML = `${ICONS.home} Bu konumu Evim olarak kaydet`;
  } else {
    els.homeBtn.hidden = true;
  }
}

function onHomeBtnClick() {
  const home = loadHome();
  if (home) {
    localStorage.removeItem(HOME_KEY);
    if (state.usingHome) {
      state.usingHome = false;
      state.userLocation = null;
      if (state.sort === "distance") setSort("district");
      els.sortDistanceBtn.disabled = true;
      els.locateBtnText.textContent = "Konumumu kullan — en yakını göster";
    }
    showToast("Evim kaydı kaldırıldı");
  } else if (state.userLocation) {
    localStorage.setItem(HOME_KEY, JSON.stringify(state.userLocation));
    showToast("Evim kaydedildi — mesafeler artık hep hazır");
  }
  updateHomeBtn();
  render();
}

/* ---------- Büyük yazı modu ---------- */

const BIGTEXT_KEY = "eczane:bigtext";

function applyBigText(on) {
  document.body.classList.toggle("big-text", on);
  els.textSizeBtn.setAttribute("aria-pressed", String(on));
  try { localStorage.setItem(BIGTEXT_KEY, on ? "1" : ""); } catch {}
}

/* ---------- Başlıktaki tarih ve canlı nöbet durumu ---------- */

// Şu an nöbet penceresinde miyiz? (19:00 → ertesi 08:30; pazar tüm gün)
function dutyStatus(now = new Date()) {
  const [sh, sm] = DUTY_HOURS.start.split(":").map(Number);
  const [eh, em] = DUTY_HOURS.end.split(":").map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end = new Date(now); end.setHours(eh, em, 0, 0);

  if (now < end) return { active: true, until: end };
  if (now >= start) {
    const until = new Date(end);
    until.setDate(until.getDate() + 1);
    return { active: true, until };
  }
  if (now.getDay() === 0) return { active: true, allDay: true };
  return { active: false, until: start };
}

function formatLeft(until, now = new Date()) {
  const mins = Math.max(1, Math.round((until - now) / 60000));
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
}

function renderDate() {
  const now = new Date();
  els.dateLine.textContent = now.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", weekday: "long",
  });

  const st = dutyStatus(now);
  if (st.allDay) {
    els.dutyLine.innerHTML = "<b>Nöbet aktif</b> · pazar günü gün boyu nöbetçiler hizmette";
    els.liveBadgeText.textContent = "Nöbet aktif";
  } else if (st.active) {
    els.dutyLine.innerHTML = `<b>Nöbet aktif</b> · bitişine ${formatLeft(st.until, now)}`;
    els.liveBadgeText.textContent = "Nöbet aktif";
  } else {
    els.dutyLine.textContent = `Nöbet ${DUTY_HOURS.start}'da başlar · ${formatLeft(st.until, now)} kaldı`;
    els.liveBadgeText.textContent = "Bu akşamın listesi";
  }
}

/* ---------- Filtre + sıralama boru hattı ---------- */

function getVisiblePharmacies() {
  let items = [...state.pharmacies];

  if (state.district) {
    items = items.filter((p) => p.district === state.district);
  }

  if (state.query) {
    const q = trLower(state.query.trim());
    items = items.filter(
      (p) =>
        trLower(p.name).includes(q) ||
        trLower(p.neighborhood).includes(q) ||
        trLower(p.district).includes(q) ||
        trLower(p.address).includes(q)
    );
  }

  if (state.userLocation) {
    items.forEach((p) => {
      // Canlı veride bazı kayıtların koordinatı olmayabilir
      p._distance = p.lat != null ? distanceKm(state.userLocation, p) : null;
    });
  }

  const collator = new Intl.Collator("tr-TR");
  if (state.sort === "name") {
    items.sort((a, b) => collator.compare(a.name, b.name));
  } else if (state.sort === "distance" && state.userLocation) {
    // Koordinatı olmayanlar listenin sonuna
    items.sort(
      (a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity)
    );
  } else {
    items.sort(
      (a, b) =>
        collator.compare(a.district, b.district) ||
        collator.compare(a.name, b.name)
    );
  }

  return items;
}

/* ---------- SVG ikon seti (emoji yerine tutarlı çizgi ikonlar) ---------- */

const ICON_ATTRS =
  'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const ICONS = {
  pin: `<svg ${ICON_ATTRS}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  map: `<svg ${ICON_ATTRS}><path d="m9 3-6 2v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/></svg>`,
  phone: `<svg ${ICON_ATTRS}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`,
  info: `<svg ${ICON_ATTRS} width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  nav: `<svg ${ICON_ATTRS} width="16" height="16"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  phoneSm: `<svg ${ICON_ATTRS} width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`,
  share: `<svg ${ICON_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5"/></svg>`,
  next: `<svg ${ICON_ATTRS} width="16" height="16"><path d="m9 18 6-6-6-6"/></svg>`,
  home: `<svg ${ICON_ATTRS} width="16" height="16"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>`,
  check: `<svg ${ICON_ATTRS} width="14" height="14"><path d="M20 6 9 17l-5-5"/></svg>`,
};

/* ---------- Görselleştirme ---------- */

function render() {
  if (state.loading) {
    els.resultCount.textContent = "Nöbet listesi yükleniyor…";
    els.emptyState.hidden = true;
    els.errorState.hidden = true;
    els.list.innerHTML = skeletonHtml().repeat(4);
    return;
  }

  if (state.error) {
    els.resultCount.textContent = "";
    els.emptyState.hidden = true;
    els.errorState.hidden = false;
    els.list.innerHTML = "";
    return;
  }

  const items = getVisiblePharmacies();

  // Sonuç sayısı
  const where = state.district || state.city;
  els.resultCount.innerHTML = items.length
    ? `<b>${items.length} nöbetçi eczane</b> bulundu — ${escapeHtml(where)}`
    : "";

  els.errorState.hidden = true;
  els.emptyState.hidden = items.length > 0;
  state._visible = items; // paylaş düğmeleri dizindeki sıraya başvurur

  // Kaynak / güncelleme damgası
  const info = getLastFetchInfo();
  if (!items.length) {
    els.sourceLine.hidden = true;
  } else if (!hasLiveData()) {
    els.sourceLine.hidden = false;
    els.sourceLine.innerHTML = `${ICONS.check} Örnek (demo) veri gösteriliyor`;
  } else {
    els.sourceLine.hidden = false;
    const saat = info.time
      ? info.time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      : null;
    els.sourceLine.innerHTML =
      `${ICONS.check} Kaynak: İl Eczacı Odası günlük nöbet listesi` +
      (saat ? ` · Güncellendi ${saat}` : "");
  }

  const mapActive = state.view === "map" && items.length > 0;
  els.mapView.hidden = !mapActive;
  els.list.hidden = mapActive;
  els.list.innerHTML = mapActive ? "" : items.map(cardHtml).join("");
  if (mapActive) refreshMap(items);
}

function skeletonHtml() {
  return `
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-line w60"></div>
    <div class="skeleton-line w80"></div>
    <div class="skeleton-line w40"></div>
    <div class="skeleton-line btn"></div>
  </div>`;
}

function cardHtml(p, i) {
  const distance =
    p._distance != null
      ? ` <span class="distance-chip">· ${formatDistance(p._distance)} uzakta</span>`
      : "";

  // Son 10 hane: baştaki 0 veya 90 ön eklerinden bağımsız çalışır
  const telHref = "tel:+90" + p.phone.replace(/\D/g, "").slice(-10);

  return `
  <article class="card">
    <div class="card-top">
      <h3>${escapeHtml(p.name)}</h3>
      <span class="badge-open">Nöbetçi · Açık</span>
    </div>
    <div class="card-meta">
      <div class="row">
        <span class="icon">${ICONS.pin}</span>
        <span><span class="district-tag">${escapeHtml(p.district)}</span>${p.neighborhood ? " / " + escapeHtml(p.neighborhood) : ""}${distance}</span>
      </div>
      <div class="row">
        <span class="icon">${ICONS.map}</span>
        <span>${escapeHtml(p.address)}</span>
      </div>
      <div class="row">
        <span class="icon">${ICONS.phone}</span>
        <span class="phone-number">${escapeHtml(p.phone)}</span>
      </div>
    </div>
    ${p.note ? `<div class="card-note"><span class="icon">${ICONS.info}</span><span>${escapeHtml(p.note)}</span></div>` : ""}
    <div class="card-actions">
      <a class="action-btn action-call" href="${telHref}">
        ${ICONS.phoneSm} Ara
      </a>
      <a class="action-btn action-directions" href="${mapsUrl(p)}" target="_blank" rel="noopener">
        ${ICONS.nav} Yol Tarifi
      </a>
      <button class="action-btn action-share" type="button" data-share="${i}" aria-label="Eczane bilgisini paylaş" title="Paylaş">
        ${ICONS.share}
      </button>
    </div>
  </article>`;
}

/* ---------- Harita görünümü (Leaflet + OpenStreetMap) ---------- */

let map = null;
let markerLayer = null;
let userMarker = null;

function initMap() {
  map = L.map("map", { zoomControl: true, attributionControl: true });
  map.setView([39.0, 35.3], 6); // Türkiye geneli başlangıç; fitBounds hemen daraltır
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları',
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

function popupHtml(p) {
  const telHref = "tel:+90" + p.phone.replace(/\D/g, "").slice(-10);
  return `
  <div class="map-popup">
    <h4>${escapeHtml(p.name)}</h4>
    <p>${escapeHtml(p.address)} — <b>${escapeHtml(p.district)}</b></p>
    <p class="pp-phone">${escapeHtml(p.phone)}</p>
    <div class="pp-actions">
      <a class="pp-call" href="${telHref}">Ara</a>
      <a class="pp-dir" href="${mapsUrl(p)}" target="_blank" rel="noopener">Yol Tarifi</a>
    </div>
  </div>`;
}

function refreshMap(items) {
  if (!map) initMap();
  markerLayer.clearLayers();

  const pinIcon = L.divIcon({
    className: "",
    html: '<div class="pin-eczane">E</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -26],
  });

  const points = [];
  for (const p of items) {
    if (p.lat == null) continue;
    points.push([p.lat, p.lng]);
    L.marker([p.lat, p.lng], { icon: pinIcon, title: p.name })
      .bindPopup(popupHtml(p), { maxWidth: 260 })
      .addTo(markerLayer);
  }

  // Kullanıcı konumu (varsa) mavi nokta olarak gösterilir
  if (userMarker) { userMarker.remove(); userMarker = null; }
  if (state.userLocation) {
    userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], {
      icon: L.divIcon({ className: "", html: '<div class="pin-user"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      title: "Konumunuz",
      interactive: false,
    }).addTo(map);
    points.push([state.userLocation.lat, state.userLocation.lng]);
  }

  // Kap yeni görünür olduysa boyut bir sonraki döngüde oturur;
  // rAF bazen erken kalıyor, kısa gecikme güvenilir.
  setTimeout(() => {
    map.invalidateSize();
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    }
  }, 60);
}

function setView(view) {
  state.view = view;
  const isMap = view === "map";
  els.viewListBtn.classList.toggle("is-active", !isMap);
  els.viewMapBtn.classList.toggle("is-active", isMap);
  els.viewListBtn.setAttribute("aria-pressed", String(!isMap));
  els.viewMapBtn.setAttribute("aria-pressed", String(isMap));
  render();
}

/* ---------- Paylaşım ---------- */

let toastTimer = null;

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2600);
}

async function sharePharmacy(p) {
  const text =
    `${p.name} — Nöbetçi Eczane\n` +
    `${p.address} (${p.district}/${state.city})\n` +
    `Tel: ${p.phone}\n` +
    `Harita: ${mapsUrl(p)}`;

  if (navigator.share) {
    try { await navigator.share({ title: p.name, text }); } catch { /* vazgeçildi */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Eczane bilgisi panoya kopyalandı");
  } catch {
    showToast("Paylaşım bu tarayıcıda desteklenmiyor");
  }
}

/* ---------- Acil mod ---------- */

const emState = { list: [], index: 0 };

function emMessage(html) {
  return `<div class="em-message">${html}</div>`;
}

function openEmergency() {
  els.emergencyOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  els.emBody.innerHTML = emMessage("Konumunuz alınıyor…");

  if (!navigator.geolocation) {
    els.emBody.innerHTML = emMessage("Tarayıcınız konum özelliğini desteklemiyor.<br>Aşağıdaki listeden ilçenizi seçerek arayabilirsiniz.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      state.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      els.sortDistanceBtn.disabled = false;
      els.sortDistanceBtn.title = "";

      // Kullanıcı farklı bir ildeyse önce doğru ilin listesini çek
      const best = nearestCityTo(state.userLocation);
      if (best && best.city !== state.city) {
        els.emBody.innerHTML = emMessage(`<b>${escapeHtml(best.city)}</b> nöbet listesi alınıyor…`);
        els.citySelect.value = best.city;
        await loadCity(best.city);
      }
      if (state.error) {
        els.emBody.innerHTML = emMessage("Nöbet listesine ulaşılamadı.<br>Bağlantınızı kontrol edip tekrar deneyin.");
        return;
      }

      const withCoords = state.pharmacies
        .filter((p) => p.lat != null)
        .map((p) => ({ ...p, _distance: distanceKm(state.userLocation, p) }))
        .sort((a, b) => a._distance - b._distance);

      if (!withCoords.length) {
        els.emBody.innerHTML = emMessage("Bu il için konum bilgili eczane kaydı yok.<br>Listeden ilçenize göre arayabilirsiniz.");
        return;
      }

      emState.list = withCoords.slice(0, 5);
      emState.index = 0;
      renderEmergency();
    },
    () => {
      els.emBody.innerHTML = emMessage("<b>Konum izni verilmedi.</b><br>Tarayıcı ayarlarından izin verip tekrar deneyin ya da aşağıdaki listeden ilçenizi seçin.");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
  );
}

function renderEmergency() {
  const p = emState.list[emState.index];
  const telHref = "tel:+90" + p.phone.replace(/\D/g, "").slice(-10);
  const est = travelEstimates(p._distance);
  const rank = emState.index === 0 ? "Size en yakın nöbetçi" : `${emState.index + 1}. en yakın nöbetçi`;
  const walkChip = est.walkMin <= 40 ? `<span>~${est.walkMin} dk yürüme</span>` : "";

  els.emBody.innerHTML = `
    <div class="em-rank">${rank}</div>
    <div class="em-name">${escapeHtml(p.name)}</div>
    <div class="em-badge-row"><span class="badge-open">Nöbetçi · Açık</span></div>
    <div class="em-travel">
      <span>${formatDistance(p._distance)} uzakta</span>
      ${walkChip}
      <span>~${est.carMin} dk araçla</span>
    </div>
    <div class="em-meta">
      ${escapeHtml(p.address)} — <b>${escapeHtml(p.district)}</b><br>
      <span class="phone-number">${escapeHtml(p.phone)}</span>
    </div>
    <a class="em-call" href="${telHref}">${ICONS.phoneSm} Hemen Ara</a>
    <a class="em-directions" href="${mapsUrl(p)}" target="_blank" rel="noopener">${ICONS.nav} Yol Tarifi Al</a>
    <div class="em-secondary-row">
      <button class="em-ghost-btn" type="button" data-em-action="share">${ICONS.share} Paylaş</button>
      <button class="em-ghost-btn" type="button" data-em-action="next">Sonraki en yakın ${ICONS.next}</button>
    </div>`;
}

function closeEmergency() {
  els.emergencyOverlay.hidden = true;
  document.body.style.overflow = "";
}

/* ---------- İl / ilçe seçimleri ---------- */

function populateCities() {
  els.citySelect.innerHTML = getCities()
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join("");
  els.citySelect.value = state.city;
}

function populateDistricts() {
  const districts = [...new Set(state.pharmacies.map((p) => p.district))].sort(
    new Intl.Collator("tr-TR").compare
  );
  els.districtSelect.innerHTML =
    `<option value="">Tüm ilçeler</option>` +
    districts
      .map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`)
      .join("");
  els.districtSelect.value = state.district;
}

async function loadCity(city) {
  state.city = city;
  state.district = "";
  state.loading = true;
  state.error = null;
  render();

  try {
    state.pharmacies = await fetchDutyPharmacies(city);
  } catch (err) {
    state.pharmacies = [];
    state.error = err;
    els.errorMessage.innerHTML =
      "Nöbet listesine şu an ulaşılamıyor.<br>İnternet bağlantınızı kontrol edip tekrar deneyin.<br><small>(" +
      escapeHtml(err.message) +
      ")</small>";
  }

  state.loading = false;
  populateDistricts();
  savePrefs();
  render();
  checkCityMismatch();
}

/* ---------- Konum / il uyuşmazlığı ---------- */

// Konum alındıysa ve seçili ildeki en yakın eczane bile çok uzaksa
// kullanıcı büyük olasılıkla başka bir ildedir: uyar ve en yakın ili öner.
const MISMATCH_THRESHOLD_KM = 30;

function nearestCityTo(loc) {
  let best = null;
  for (const city of getCities()) {
    const c = CITY_CENTERS[city];
    if (!c) continue;
    const km = distanceKm(loc, { lat: c[0], lng: c[1] });
    if (!best || km < best.km) best = { city, km };
  }
  return best;
}

function checkCityMismatch() {
  els.locationWarning.hidden = true;
  if (!state.userLocation || state.loading || state.error) return;

  const withCoords = state.pharmacies.filter((p) => p.lat != null);
  if (!withCoords.length) return;

  const nearestKm = Math.min(
    ...withCoords.map((p) => distanceKm(state.userLocation, p))
  );
  if (nearestKm <= MISMATCH_THRESHOLD_KM) return;

  const suggestion = nearestCityTo(state.userLocation);
  const hasSuggestion = suggestion && suggestion.city !== state.city;

  els.locationWarningText.textContent = hasSuggestion
    ? `Konumunuz ${state.city} eczanelerinden uzakta görünüyor (en yakını ~${Math.round(nearestKm)} km). ${suggestion.city} ilinde olabilirsiniz.`
    : `Konumunuz seçili ildeki eczanelerden uzakta görünüyor (en yakını ~${Math.round(nearestKm)} km). Yukarıdan ilinizi kontrol edin.`;

  els.switchCityBtn.hidden = !hasSuggestion;
  if (hasSuggestion) {
    els.switchCityBtn.textContent = `${suggestion.city} iline geç`;
    els.switchCityBtn.onclick = () => {
      els.citySelect.value = suggestion.city;
      loadCity(suggestion.city);
    };
  }

  els.locationWarning.hidden = false;
}

/* ---------- Sıralama düğmeleri ---------- */

function setSort(sort) {
  state.sort = sort;
  els.sortBtns.forEach((b) => {
    const active = b.dataset.sort === sort;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  render();
}

/* ---------- Konum ---------- */

function requestLocation() {
  if (!navigator.geolocation) {
    els.locateBtnText.textContent = "Tarayıcınız konum desteklemiyor";
    return;
  }

  els.locateBtn.disabled = true;
  els.locateBtnText.textContent = "Konum alınıyor…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      state.usingHome = false;
      els.locateBtn.disabled = false;
      els.locateBtnText.textContent = "Konum alındı ✓ — en yakın önce";
      els.sortDistanceBtn.disabled = false;
      els.sortDistanceBtn.title = "";
      updateHomeBtn();
      setSort("distance");
      checkCityMismatch();
    },
    () => {
      els.locateBtn.disabled = false;
      els.locateBtnText.textContent =
        "Konum izni verilmedi — tekrar deneyin";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

/* ---------- Olay bağlama ---------- */

function bindEvents() {
  els.citySelect.addEventListener("change", (e) => loadCity(e.target.value));

  els.districtSelect.addEventListener("change", (e) => {
    state.district = e.target.value;
    savePrefs();
    render();
  });

  els.dismissWarning.addEventListener("click", () => {
    els.locationWarning.hidden = true;
  });

  // Kart paylaş düğmeleri (liste her çizimde yenilendiği için temsilci dinleyici)
  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-share]");
    if (!btn) return;
    const p = state._visible?.[Number(btn.dataset.share)];
    if (p) sharePharmacy(p);
  });

  // Liste/Harita geçişi
  els.viewListBtn.addEventListener("click", () => setView("list"));
  els.viewMapBtn.addEventListener("click", () => setView("map"));

  // Evim kaydı ve büyük yazı modu
  els.homeBtn.addEventListener("click", onHomeBtnClick);
  els.textSizeBtn.addEventListener("click", () => {
    applyBigText(!document.body.classList.contains("big-text"));
  });

  // Acil mod
  els.emergencyBtn.addEventListener("click", openEmergency);
  els.emClose.addEventListener("click", closeEmergency);
  els.emergencyOverlay.addEventListener("click", (e) => {
    if (e.target === els.emergencyOverlay) closeEmergency();
    const btn = e.target.closest("[data-em-action]");
    if (!btn) return;
    if (btn.dataset.emAction === "share") {
      sharePharmacy(emState.list[emState.index]);
    } else if (btn.dataset.emAction === "next") {
      emState.index = (emState.index + 1) % emState.list.length;
      renderEmergency();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.emergencyOverlay.hidden) closeEmergency();
  });

  els.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    els.clearSearch.hidden = !state.query;
    render();
  });

  els.clearSearch.addEventListener("click", () => {
    state.query = "";
    els.searchInput.value = "";
    els.clearSearch.hidden = true;
    els.searchInput.focus();
    render();
  });

  els.sortBtns.forEach((btn) =>
    btn.addEventListener("click", () => setSort(btn.dataset.sort))
  );

  els.locateBtn.addEventListener("click", requestLocation);

  els.retryBtn.addEventListener("click", () => loadCity(state.city));

  els.resetFilters.addEventListener("click", () => {
    state.district = "";
    state.query = "";
    els.districtSelect.value = "";
    els.searchInput.value = "";
    els.clearSearch.hidden = true;
    render();
  });
}

/* ---------- Başlat ---------- */

async function init() {
  renderDate();
  setInterval(renderDate, 60000); // geri sayım her dakika tazelenir

  // Büyük yazı tercihi
  try { if (localStorage.getItem(BIGTEXT_KEY)) applyBigText(true); } catch {}

  // Kayıtlı Evim varsa mesafeler GPS beklemeden hazır olsun
  const home = loadHome();
  if (home) {
    state.userLocation = home;
    state.usingHome = true;
    els.sortDistanceBtn.disabled = false;
    els.sortDistanceBtn.title = "";
    els.locateBtnText.textContent = "Mesafeler Evim'e göre — canlı konum için dokunun";
  }
  updateHomeBtn();

  // Son ziyaretteki il/ilçe seçimini geri yükle
  const pref = loadPrefs();
  if (pref.city && getCities().includes(pref.city)) {
    state.city = pref.city;
  }

  populateCities();
  bindEvents();

  if (hasLiveData()) {
    els.dataSourceNote.innerHTML =
      "Veriler CollectAPI üzerinden canlı alınmaktadır ve gün içinde güncellenir. Gitmeden önce eczaneyi arayarak teyit edebilirsiniz. Acil durumlar için <b>112</b>.";
  } else {
    els.dataSourceNote.innerHTML =
      "Şu an <b>örnek (demo) veri</b> gösterilmektedir. Canlı veri için <code>js/data.js</code> dosyasına CollectAPI anahtarınızı ekleyin (ayrıntılar README dosyasında). Acil durumlar için <b>112</b>.";
  }

  await loadCity(state.city);

  // İlçe seçimi il yüklendikten sonra geri yüklenebilir
  if (pref.district && pref.city === state.city) {
    const options = [...els.districtSelect.options].map((o) => o.value);
    if (options.includes(pref.district)) {
      state.district = pref.district;
      els.districtSelect.value = pref.district;
      savePrefs();
      render();
    }
  }
}

init();

/* ---------- PWA: service worker kaydı ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Çevrimdışı destek olmadan da uygulama çalışır; sessizce geç
    });
  });
}
