/**
 * Gera os ícones do app (public/icons) a partir da folha oficial do Fólium
 * (o "O" da capa: anel verde com a folha dentro; mesmos traços de components/Marca.tsx).
 *
 * Uso: node scripts/gerar-icones.mjs  (ou NODE_PATH=$(npm root -g) node scripts/gerar-icones.mjs)
 * Precisa do Playwright com Chromium instalado na máquina (não é dependência do site).
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// require() acha o Playwright instalado globalmente (NODE_PATH) ou no projeto.
const { chromium } = createRequire(import.meta.url)("playwright");

const VERDE = "#4F7A3A";
const CREME = "#F6F0E4";

/** Símbolo num quadro 100×100, posicionado em (x, y) com lado `lado`. */
function simbolo(x, y, lado) {
  const k = lado / 100;
  return `<g transform="translate(${x} ${y}) scale(${k})">
    <circle cx="50" cy="50" r="43" fill="none" stroke="${VERDE}" stroke-width="11"/>
    <path d="M28 72c0-26 16-42 44-44 0 28-16 44-44 44Z" fill="${VERDE}"/>
    <path d="M30 70 58 42" stroke="${CREME}" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}

/**
 * - comum: cartão creme arredondado, símbolo ocupando 72% (favicon e ícone "any");
 * - maskable: fundo cheio, símbolo em 58% para caber na zona segura do Android;
 * - apple: fundo cheio sem cantos (o iOS arredonda), símbolo em 68%.
 */
const svg = {
  comum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="${CREME}"/>${simbolo(72, 72, 368)}</svg>`,
  maskable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${CREME}"/>${simbolo(107.5, 107.5, 297)}</svg>`,
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${CREME}"/>${simbolo(82, 82, 348)}</svg>`,
};

writeFileSync("public/icons/icon.svg", svg.comum + "\n");

const saidas = [
  ["icon-192.png", "comum", 192, true],
  ["icon-512.png", "comum", 512, true],
  ["icon-maskable-192.png", "maskable", 192, false],
  ["icon-maskable-512.png", "maskable", 512, false],
  ["apple-touch-icon.png", "apple", 180, false],
];

const navegador = await chromium.launch();
for (const [arquivo, tipo, lado, transparente] of saidas) {
  const pagina = await navegador.newPage({ viewport: { width: lado, height: lado }, deviceScaleFactor: 1 });
  await pagina.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${lado}px;height:${lado}px}</style>${svg[tipo]}`,
  );
  await pagina.screenshot({ path: `public/icons/${arquivo}`, omitBackground: transparente });
  await pagina.close();
}
await navegador.close();
console.log("Ícones gerados em public/icons/");
