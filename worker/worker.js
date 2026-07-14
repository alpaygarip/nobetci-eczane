/* ============================================================
   Cloudflare Worker — site + API proxy
   ------------------------------------------------------------
   - /api/dutyPharmacy?il=X isteklerini CollectAPI'ye iletir;
     API anahtarı yalnızca burada (sunucu tarafında, secret olarak)
     durur, istemciye asla inmez.
   - Yanıtlar il + gün bazında Cloudflare edge önbelleğine alınır:
     kaç kişi kullanırsa kullansın, CollectAPI kotasından il başına
     günde ~1 istek düşer.
   - Diğer tüm istekler dist/ içindeki statik siteye gider.

   Kurulum:
     npx wrangler login
     npx wrangler secret put COLLECT_API_KEY   (anahtar sorulunca yapıştırın)
     ./build.sh && npx wrangler deploy
   ============================================================ */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/dutyPharmacy") {
      return dutyPharmacy(url, env);
    }
    if (url.pathname.startsWith("/api")) {
      return json({ success: false, message: "Bilinmeyen uç" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

async function dutyPharmacy(url, env) {
  const il = (url.searchParams.get("il") || "").trim().slice(0, 40);
  if (!il) {
    return json({ success: false, message: "il parametresi gerekli" }, 400);
  }

  // Gün + il bazlı edge önbelleği (30 dk tazelik; gün değişince anahtar değişir)
  const day = new Date().toISOString().slice(0, 10);
  const cacheKey = new Request(
    "https://edge-cache.internal/duty?il=" + encodeURIComponent(il) + "&d=" + day
  );
  const cache = caches.default;

  let res = await cache.match(cacheKey);
  if (!res) {
    const upstream = await fetch(
      "https://api.collectapi.com/health/dutyPharmacy?il=" + encodeURIComponent(il),
      {
        headers: {
          "content-type": "application/json",
          authorization: `apikey ${env.COLLECT_API_KEY}`,
        },
      }
    );

    if (!upstream.ok) {
      return json(
        { success: false, message: `Kaynak API hatası: ${upstream.status}` },
        502
      );
    }

    res = new Response(await upstream.text(), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=1800",
      },
    });
    await cache.put(cacheKey, res.clone());
  }

  const out = new Response(res.body, res);
  out.headers.set("access-control-allow-origin", "*");
  return out;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
