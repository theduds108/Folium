"use client";

import { useEffect } from "react";

/** Registra o service worker, que permite instalar o Fólium na tela inicial. */
export function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
