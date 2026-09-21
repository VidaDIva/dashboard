export const API_URL = "http://localhost:8080/api";

export const SESION_KEY = "picur_sesion";

// ===== Sesión =====

export function guardarSesion(usuario) {
  localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
}

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY));
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
}

export function estaConectado() {
  return obtenerSesion() !== null;
}

// ===== API =====

export async function solicitud(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(cuerpo?.mensaje || "Error en la solicitud");
  }

  return cuerpo;
}

export function obtenerMediciones() {
  return solicitud("/mediciones");
}

// ===== Utilidades =====

export function formatearNumero(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "—";
  }
  return Number(valor).toFixed(decimales);
}

export function formatearFecha(iso) {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-CO");
}