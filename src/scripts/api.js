export const API_URL = "http://localhost:8080/api";

export const WS_URL = "ws://localhost:8080/ws";

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

export function obtenerMediciones({ pagina = 0, tamano = 20, estado = "", orden = "fechaRegistro,desc" } = {}) {
  const params = new URLSearchParams({
    page: pagina,
    size: tamano,
    sort: orden,
  });
  if (estado) params.set("estado", estado);
  return solicitud(`/mediciones?${params.toString()}`);
}

export function obtenerResumen() {
  return solicitud("/mediciones/resumen");
}

// ===== WebSocket (tiempo real) =====

export function conectarWebSocket({ alMensaje, alCambiarEstado } = {}) {
  let socket = null;
  let cerrado = false;
  let reintento = 0;

  function abrir() {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      reintento = 0;
      if (alCambiarEstado) alCambiarEstado(true);
    };

    socket.onmessage = (evento) => {
      if (alMensaje) {
        try {
          alMensaje(JSON.parse(evento.data));
        } catch {
          // Mensaje no JSON: se ignora.
        }
      }
    };

    socket.onclose = () => {
      if (alCambiarEstado) alCambiarEstado(false);
      if (cerrado) return;
      const espera = Math.min(1000 * 2 ** reintento, 15000);
      reintento += 1;
      setTimeout(abrir, espera);
    };

    socket.onerror = () => {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    };
  }

  abrir();

  return {
    cerrar() {
      cerrado = true;
      if (socket) socket.close();
    },
  };
}

// ===== Utilidades =====

export function formatearNumero(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "—";
  }
  return Number(valor).toFixed(decimales);
}

const MESES_CO = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatearFecha(iso) {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = MESES_CO[fecha.getMonth()];
  const anio = fecha.getFullYear();

  let horas = fecha.getHours();
  const meridiano = horas >= 12 ? "p. m." : "a. m.";
  horas = horas % 12;
  if (horas === 0) horas = 12;

  return `${dia} ${mes} ${anio} · ${String(horas).padStart(2, "0")}:${String(
    fecha.getMinutes()
  ).padStart(2, "0")} ${meridiano}`;
}

export function formatearHora(iso) {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";

  let horas = fecha.getHours();
  const meridiano = horas >= 12 ? "p. m." : "a. m.";
  horas = horas % 12;
  if (horas === 0) horas = 12;

  return `${String(horas).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(
    2,
    "0"
  )} ${meridiano}`;
}

// ===== Estados de vibración =====

export function normalizarEstado(estado) {
  return String(estado || "").toUpperCase();
}

export function etiquetaEstado(estado) {
  const e = normalizarEstado(estado);
  if (e === "PRECAUCION") return "PRECAUCIÓN";
  if (e === "ANOMALA" || e === "ANOMALIA") return "ANÓMALA";
  if (e === "NORMAL") return "NORMAL";
  return "SIN DATOS";
}

export function sufijoEstado(estado) {
  const e = normalizarEstado(estado);
  if (e === "PRECAUCION") return "precaucion";
  if (e === "ANOMALA" || e === "ANOMALIA") return "anomala";
  return "normal";
}