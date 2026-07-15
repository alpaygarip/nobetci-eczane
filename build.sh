#!/bin/bash
# Cloudflare yayın kopyasını dist/ altına üretir.
# data.js artık depoda anahtarsızdır (proxy varsayılan); bu betik yalnızca
# yerel geliştirme dosyası config.local.js'nin dist'e sızmadığını garantiler.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist
cp -R index.html css js icons vendor manifest.webmanifest sw.js dist/
rm -f dist/js/config.local.js

if grep -q 'collectApiKey: ""' dist/js/data.js \
   && grep -q 'proxyUrl: "/api"' dist/js/data.js \
   && [ ! -f dist/js/config.local.js ]; then
  echo "✓ dist/ hazır — anahtar yok, proxy modu açık"
else
  echo "✗ HATA: dist/ içinde anahtar sızıntısı riski!" >&2
  exit 1
fi
