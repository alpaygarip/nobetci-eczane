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
};

const state = {
  city: "İstanbul",
  district: "",
  query: "",
  sort: "district",          // district | name | distance
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

/* ---------- Başlıktaki tarih ---------- */

function renderDate() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", weekday: "long",
  });
  els.dateLine.textContent = `${dateStr} · ${DUTY_HOURS.start}–${DUTY_HOURS.end}`;
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
  els.list.innerHTML = items.map(cardHtml).join("");
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

function cardHtml(p) {
  const distance =
    p._distance != null
      ? `<span class="distance-chip">📍 ${formatDistance(p._distance)} uzakta</span>`
      : "";

  const mapsQuery = encodeURIComponent(
    `${p.name} ${p.address} ${p.district} ${state.city}`
  );
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
        <span class="icon" aria-hidden="true">🏙️</span>
        <span><span class="district-tag">${escapeHtml(p.district)}</span>${p.neighborhood ? " / " + escapeHtml(p.neighborhood) : ""} ${distance}</span>
      </div>
      <div class="row">
        <span class="icon" aria-hidden="true">🗺️</span>
        <span>${escapeHtml(p.address)}</span>
      </div>
      <div class="row">
        <span class="icon" aria-hidden="true">📞</span>
        <span>${escapeHtml(p.phone)}</span>
      </div>
    </div>
    ${p.note ? `<div class="card-note">💡 ${escapeHtml(p.note)}</div>` : ""}
    <div class="card-actions">
      <a class="action-btn action-call" href="${telHref}">
        📞 Ara
      </a>
      <a class="action-btn action-directions" href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}" target="_blank" rel="noopener">
        🧭 Yol Tarifi
      </a>
    </div>
  </article>`;
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
  els.sortBtns.forEach((b) =>
    b.classList.toggle("is-active", b.dataset.sort === sort)
  );
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
      els.locateBtn.disabled = false;
      els.locateBtnText.textContent = "Konum alındı ✓ — en yakın önce";
      els.sortDistanceBtn.disabled = false;
      els.sortDistanceBtn.title = "";
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
