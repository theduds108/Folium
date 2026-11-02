"use client";

import { useEffect, useRef } from "react";
import type { Material } from "three";
import { reduzirMovimento } from "./movimento";

const CORES = [0x4f7a3a, 0xb0673b, 0x6b4a34, 0x7c8b5a, 0x2f3e2a];

/**
 * Three.js: folhas 3D caindo e girando atrás do topo da página.
 * Carrega a biblioteca só no navegador, pausa quando sai da tela
 * e não roda se a pessoa preferir menos movimento.
 */
export function FolhasCaindo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduzirMovimento()) return;
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

      const visivelY = () => Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const qtd = largura() < 640 ? 12 : 24;
      const folhas = Array.from({ length: qtd }, (_, i) => {
        const material = new THREE.MeshStandardMaterial({
          color: CORES[i % CORES.length],
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
          roughness: 0.8,
        });
        const m = new THREE.Mesh(geometria, material);
        const s = 0.25 + Math.random() * 0.35;
        m.scale.set(s, s, s);
        const vy = visivelY();
        const vx = vy * camera.aspect;
        m.position.set((Math.random() * 2 - 1) * vx, (Math.random() * 2 - 1) * vy, -Math.random() * 6);
        m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        cena.add(m);
        return {
          m,
          queda: 0.004 + Math.random() * 0.008,
          balanco: Math.random() * Math.PI * 2,
          giro: new THREE.Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.01),
        };
      });

      let quadro = 0;
      let rodando = true;
      const tick = (t: number) => {
        if (!rodando) return;
        const vy = visivelY() + 1.5;
        const vx = vy * camera.aspect;
        for (const f of folhas) {
          f.m.position.y -= f.queda * 6;
          f.m.position.x += Math.sin(t / 1400 + f.balanco) * 0.006;
          f.m.rotation.x += f.giro.x;
          f.m.rotation.y += f.giro.y;
          f.m.rotation.z += f.giro.z;
          if (f.m.position.y < -vy) {
            f.m.position.y = vy;
            f.m.position.x = (Math.random() * 2 - 1) * vx;
          }
        }
        renderer.render(cena, camera);
        quadro = requestAnimationFrame(tick);
      };
      quadro = requestAnimationFrame(tick);

      const observador = new IntersectionObserver(([e]) => {
        const visivel = !!e?.isIntersecting;
        if (visivel && !rodando) {
          rodando = true;
          quadro = requestAnimationFrame(tick);
        } else if (!visivel) {
          rodando = false;
          cancelAnimationFrame(quadro);
        }
      });
      observador.observe(el);

      const redimensionar = () => {
        camera.aspect = largura() / altura();
        camera.updateProjectionMatrix();
        renderer.setSize(largura(), altura());
      };
      window.addEventListener("resize", redimensionar);

      limpar = () => {
        rodando = false;
        cancelAnimationFrame(quadro);
        observador.disconnect();
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
