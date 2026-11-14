// Fica fora de lib/instalar.ts porque o layout (componente de servidor) precisa ler este texto.
/** Roda no <head>, antes do React: guarda o pedido de instalação para ninguém perder o evento. */
export const SCRIPT_CAPTURA =
  "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__foliumPedido=e;});" +
  "window.addEventListener('appinstalled',function(){window.__foliumPedido=null;});";
