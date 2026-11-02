"use client";

import { useEffect, useRef } from "react";
import type { Material } from "three";
import { reduzirMovimento } from "./movimento";

const CORES = [0x4f7a3a, 0xb0673b, 0x6b4a34, 0x7c8b5a, 0x2f3e2a];
/** Tempo que cada folha leva para atravessar a capa (s). */
const QUEDA_MIN = 3.2;
const QUEDA_MAX = 5.2;

/**
 * Three.js: folhas 3D que caem UMA vez atrás da capa e param.
 *
 * Objetivo: dar a sensação de "chegada" na página inicial, junto com a entrada da marca,
 * sem ficar disputando atenção com a busca. Cada folha atravessa a capa uma única vez;
 * quando a última sai de cena, o laço para e o WebGL é liberado.
 * É só decoração (aria-hidden): a capa comunica tudo sem ele.
 * Não roda em telas estreitas nem com prefers-reduced-motion: reduce.
 */
export function FolhasCaindo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduzirMovimento() || window.innerWidth < 720) return;
    let limpar: (() => void) | undefined;
    let cancelado = false;

    import("three").then((THREE) => {
      if (cancelado) return;
      const largura = () => el.clientWidth;
      const altura = () => el.clientHeight;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(largura(), altura());
      el.appendChild(renderer.domElement);

      const cena = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, largura() / altura(), 0.1, 100);
      camera.position.z = 14;

      cena.add(new THREE.AmbientLight(0xffffff, 1.6));
      const luz = new THREE.DirectionalLight(0xffffff, 1.4);
      luz.position.set(3, 5, 6);
      cena.add(luz);

      // Forma de folha: duas curvas que se encontram nas pontas.
      const forma = new THREE.Shape();
      forma.moveTo(0, -1);
      forma.quadraticCurveTo(0.9, 0, 0, 1);
      forma.quadraticCurveTo(-0.9, 0, 0, -1);
      const geometria = new THREE.ShapeGeometry(forma, 12);

      const visivelY = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z + 1.5;
      const folhas = Array.from({ length: 14 }, (_, i) => {
        const material = new THREE.MeshStandardMaterial({
          color: CORES[i % CORES.length],
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
          roughness: 0.8,
        });
        const m = new THREE.Mesh(geometria, material);
        const s = 0.25 + Math.random() * 0.3;
        m.scale.set(s, s, s);
        const vy = visivelY();
        // Todas começam acima da capa, em alturas diferentes, e caem uma vez.
        m.position.set((Math.random() * 2 - 1) * vy * camera.aspect, vy + Math.random() * vy * 0.8, -Math.random() * 6);
        m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        cena.add(m);
        const duracao = QUEDA_MIN + Math.random() * (QUEDA_MAX - QUEDA_MIN);
        return {
          m,
          velocidade: (2 * vy) / duracao,
          balanco: Math.random() * Math.PI * 2,
          giro: new THREE.Vector3(Math.random() * 1.2, Math.random() * 1.2, Math.random() * 0.6),
        };
      });

      let quadro = 0;
      let anterior = performance.now();
      const tick = (t: number) => {
        const dt = Math.min((t - anterior) / 1000, 0.05);
        anterior = t;
        const limite = -visivelY();
        let caindo = 0;
        for (const f of folhas) {
          if (f.m.position.y < limite) continue;
          caindo++;
          f.m.position.y -= f.velocidade * dt;
          f.m.position.x += Math.sin(t / 1400 + f.balanco) * 0.35 * dt;
          f.m.rotation.x += f.giro.x * dt;
          f.m.rotation.y += f.giro.y * dt;
          f.m.rotation.z += f.giro.z * dt;
        }
        renderer.render(cena, camera);
        if (caindo > 0) quadro = requestAnimationFrame(tick);
        else limpar?.();
      };
      quadro = requestAnimationFrame(tick);

      const redimensionar = () => {
        camera.aspect = largura() / altura();
        camera.updateProjectionMatrix();
        renderer.setSize(largura(), altura());
      };
      window.addEventListener("resize", redimensionar);

      let limpo = false;
      limpar = () => {
        if (limpo) return;
        limpo = true;
        cancelAnimationFrame(quadro);
        window.removeEventListener("resize", redimensionar);
        geometria.dispose();
        folhas.forEach((f) => (f.m.material as Material).dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelado = true;
      limpar?.();
    };
  }, []);

  return <div ref={ref} className="folhas-3d" aria-hidden="true" />;
}
