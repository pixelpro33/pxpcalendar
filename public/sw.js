self.addEventListener("push", function (event) {
    let data = {
      title: "pxpcalendar",
      body: "Ai primit o notificare noua.",
    };
  
    if (event.data) {
      try {
        data = event.data.json();
      } catch {
        data = {
          title: "pxpcalendar",
          body: event.data.text(),
        };
      }
    }
  
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    );
  });
  
  self.addEventListener("notificationclick", function (event) {
    event.notification.close();
  
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }
  
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  });