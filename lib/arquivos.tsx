"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Fotos, currículos e certificados ficam em buckets privados do Supabase (fotos, curriculos).
 * O banco guarda o endereço "público" do arquivo só como identificador; para mostrar, o
 * navegador de quem está logado pede um link assinado, que expira em algumas horas.
 * Sem login, o Supabase recusa o link (RLS em storage.objects).
 */

const PROTEGIDO = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/(fotos|curriculos)\/([^?#]+)/;
const VALIDADE = 60 * 60 * 6; // 6 horas

const cache = new Map<string, Promise<string>>();
const fila = new Map<string, { bucket: string; caminho: string; resolver: (u: string) => void }>();
let agendado = false;

/** Junta os pedidos do mesmo momento num só, por bucket. */
async function processarFila() {
  agendado = false;
  const sb = supabase();
  const itens = [...fila.entries()];
  fila.clear();
  const porBucket = new Map<string, typeof itens>();
  for (const it of itens) porBucket.set(it[1].bucket, [...(porBucket.get(it[1].bucket) ?? []), it]);
  for (const [bucket, lista] of porBucket) {
    const caminhos = lista.map(([, v]) => decodeURIComponent(v.caminho));
    const { data } = sb ? await sb.storage.from(bucket).createSignedUrls(caminhos, VALIDADE) : { data: null };
    lista.forEach(([chave, v], i) => {
      const assinado = data?.[i]?.signedUrl;
      if (!assinado) cache.delete(chave); // tenta de novo depois (ex.: login ainda carregando)
      v.resolver(assinado ?? "");
    });
  }
}

/** Link que o navegador pode abrir. Endereços de fora do Supabase (ex.: exemplos) voltam iguais. */
export function urlSegura(url: string): Promise<string> {
  const m = url.match(PROTEGIDO);
  if (!m) return Promise.resolve(url);
  const chave = `${m[1]}/${m[2]}`;
  let p = cache.get(chave);
  if (!p) {
    p = new Promise<string>((resolver) => fila.set(chave, { bucket: m[1]!, caminho: m[2]!, resolver }));
    cache.set(chave, p);
    if (!agendado) {
      agendado = true;
      setTimeout(processarFila, 0);
    }
  }
  return p;
}

export function ehArquivoProtegido(url: string | undefined | null) {
  return !!url && PROTEGIDO.test(url);
}

/** Hook: devolve o link assinado (vazio enquanto carrega, ou se não houver permissão). */
export function useUrlSegura(url: string | undefined | null): string {
  const protegido = ehArquivoProtegido(url);
  const [final, setFinal] = useState(protegido ? "" : url ?? "");
  useEffect(() => {
    if (!url) return setFinal("");
    if (!ehArquivoProtegido(url)) return setFinal(url);
    let ativo = true;
    setFinal("");
    urlSegura(url).then((u) => ativo && setFinal(u));
    return () => {
      ativo = false;
    };
  }, [url]);
  return final;
}

/** <img> para arquivos que podem estar no bucket privado. */
export function ImgSegura(props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const src = useUrlSegura(props.src);
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return src ? <img {...props} src={src} /> : <span className={`img-carregando ${props.className ?? ""}`.trim()} style={{ display: "block", width: "100%", aspectRatio: props.width && props.height ? `${props.width} / ${props.height}` : undefined }} aria-hidden="true" />;
}

/** <a> para arquivos que podem estar no bucket privado (currículo, certificado, galeria). */
export function LinkSeguro({ href, children, ...resto }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const final = useUrlSegura(href);
  return (
    <a {...resto} href={final || undefined} aria-disabled={!final}>
      {children}
    </a>
  );
}
