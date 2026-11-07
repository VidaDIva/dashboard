self.addEventListener("push", (event) => {
  let datos = {};

  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data ? event.data.text() : "" };
  }

  const titulo = datos.title || "Picur";
  const opciones = {
    body: datos.body || "Nueva alerta del sensor",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: datos.tag || "picur-alerta",
    renotify: true,
    data: { url: datos.url || "/recomendaciones" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destino = event.notification.data?.url || "/recomendaciones";

  event.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const ventana of ventanas) {
        if ("focus" in ventana) {
          await ventana.focus();
          if ("navigate" in ventana) {
            await ventana.navigate(destino);
          }
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(destino);
      }
    })()
  );
});
