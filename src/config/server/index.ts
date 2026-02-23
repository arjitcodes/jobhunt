import type { Server } from "http";


export const gracefullyShutdown = (server: Server | null) => {
  console.log("[•] Closing HTTP server");
  if (server) server.close();
  console.log("[✔]HTTP server closed");
};
