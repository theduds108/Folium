#!/usr/bin/env bash
# Bateria de testes de ponta a ponta do Fólium (navegador de verdade, celular e computador).
# Usa um Supabase SIMULADO (supabase-simulado.js): não toca no banco de produção nem manda e-mail.
# Precisa do Playwright com o Chromium: npm i -D playwright && npx playwright install chromium
set -e
cd "$(dirname "$0")/../.."
AQUI=testes/e2e
mkdir -p $AQUI/capturas /tmp/folium-e2e
echo "1/3 build ligado ao banco simulado"
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=teste npx next build >/dev/null
rm -rf /tmp/folium-e2e/banco && cp -r out /tmp/folium-e2e/banco
echo "2/3 build em modo demonstração"
npx next build >/dev/null
rm -rf /tmp/folium-e2e/demo && cp -r out /tmp/folium-e2e/demo
(cd /tmp/folium-e2e/banco && python3 -m http.server 3100 >/dev/null 2>&1 &)
(cd /tmp/folium-e2e/demo && python3 -m http.server 3200 >/dev/null 2>&1 &)
trap 'pkill -f "http.server 3100"; pkill -f "http.server 3200"; pkill -f supabase-simulado.js' EXIT
echo "3/3 testes"
for t in $AQUI/0*.js; do
  pkill -f supabase-simulado.js || true
  node $AQUI/supabase-simulado.js >/dev/null 2>&1 &
  sleep 1
  echo "== $(basename $t)"
  node "$t"
done
