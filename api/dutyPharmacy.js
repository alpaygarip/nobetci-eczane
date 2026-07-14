/* ============================================================
   Vercel Serverless Function — API proxy
   ------------------------------------------------------------
   Cloudflare Worker'daki proxy'nin Vercel karşılığı.
   /api/dutyPharmacy?il=X isteklerini CollectAPI'ye iletir;
   anahtar yalnızca Vercel ortam değişkeninde durur
   (Project Settings → Environment Variables → COLLECT_API_KEY).

   s-maxage sayesinde yanıtlar Vercel edge önbelleğine alınır:
   il başına 30 dakikada en fazla 1 istek CollectAPI'ye gider.
   ============================================================ */

module.exports = async (req, res) => {
  const il = String(req.query.il || "").trim().slice(0, 40);
  if (!il) {
    return res
      .status(400)
      .json({ success: false, message: "il parametresi gerekli" });
  }

  if (!process.env.COLLECT_API_KEY) {
    return res
      .status(500)
      .json({ success: false, message: "COLLECT_API_KEY tanımlı değil" });
  }

  const upstream = await fetch(
    "https://api.collectapi.com/health/dutyPharmacy?il=" +
      encodeURIComponent(il),
    {
      headers: {
        "content-type": "application/json",
        authorization: `apikey ${process.env.COLLECT_API_KEY}`,
      },
    }
  );

  if (!upstream.ok) {
    return res
      .status(502)
      .json({ success: false, message: `Kaynak API hatası: ${upstream.status}` });
  }

  const data = await upstream.json();
  res.setHeader(
    "cache-control",
    "public, s-maxage=1800, stale-while-revalidate=600"
  );
  res.setHeader("access-control-allow-origin", "*");
  return res.status(200).json(data);
};
