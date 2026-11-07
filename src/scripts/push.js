import { API_URL, VAPID_PUBLIC_KEY, obtenerSesion } from "./api.js";

export function soportaPush() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function base64UrlAUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normal = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binario = window.atob(normal);
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }

  return bytes;
}

export async function obtenerSuscripcion() {
  if (!soportaPush()) return null;

  try {
    const registro = await navigator.serviceWorker.ready;
    return await registro.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function enviarSuscripcion(suscripcion) {
  const sesion = obtenerSesion();
  if (!sesion?.id) {
    throw new Error("Inicia sesión para activar las notificaciones");
  }

  const cuerpo = suscripcion.toJSON();

  const respuesta = await fetch(`${API_URL}/push/suscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuarioId: sesion.id,
      endpoint: cuerpo.endpoint,
      p256dh: cuerpo.keys?.p256dh,
      auth: cuerpo.keys?.auth,
      userAgent: navigator.userAgent,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => null);
    throw new Error(detalle?.mensaje || "No se pudo guardar la suscripción");
  }
}

async function eliminarSuscripcion(suscripcion) {
  if (!suscripcion) return;

  try {
    await fetch(
      `${API_URL}/push/suscripciones?endpoint=${encodeURIComponent(
        suscripcion.endpoint
      )}`,
      { method: "DELETE" }
    );
  } catch {
    // Si falla el borrado remoto, igual se elimina en el navegador.
  }

  await suscripcion.unsubscribe();
}

export async function activarPush() {
  if (!soportaPush()) {
    throw new Error("Este navegador no soporta notificaciones push");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("Falta configurar la clave pública VAPID");
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    throw new Error("No se concedió permiso para las notificaciones");
  }

  const registro = await navigator.serviceWorker.ready;
  const existente = await registro.pushManager.getSubscription();

  const suscripcion =
    existente ||
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlAUint8Array(VAPID_PUBLIC_KEY),
    }));

  await enviarSuscripcion(suscripcion);
  return suscripcion;
}

export async function sincronizarPush() {
  if (!soportaPush() || Notification.permission !== "granted") return false;

  const suscripcion = await obtenerSuscripcion();
  if (!suscripcion) return false;

  try {
    await enviarSuscripcion(suscripcion);
    return true;
  } catch {
    return false;
  }
}

export async function desactivarPush() {
  const suscripcion = await obtenerSuscripcion();
  await eliminarSuscripcion(suscripcion);
}

export async function estadoPush() {
  if (!soportaPush()) return "unsupported";

  if (Notification.permission === "denied") return "denied";

  const suscripcion = await obtenerSuscripcion();
  if (suscripcion && Notification.permission === "granted") return "subscribed";

  return "available";
}
