export function subscribeManagerWs(onEvent) {
  // Skeleton: dacă există socket.io global, ne abonăm.
  // Altfel, fallback la un interval care forțează refresh.
  if (typeof window !== "undefined" && window.io) {
    try {
      const socket = window.io();
      const handler = (event, payload) => onEvent?.({ event, payload });
      socket.on("newOrder", (p) => handler("newOrder", p));
      socket.on("orderPaid", (p) => handler("orderPaid", p));
      socket.on("groupPaid", (p) => handler("groupPaid", p));
      socket.on("visitClosed", (p) => handler("visitClosed", p));
      return () => {
        try {
          socket.off("newOrder");
          socket.off("orderPaid");
          socket.off("groupPaid");
          socket.off("visitClosed");
        } catch {}
      };
    } catch {
      // fall back
    }
  }
  const id = setInterval(() => onEvent?.({ event: "tick" }), 15000);
  return () => clearInterval(id);
}


