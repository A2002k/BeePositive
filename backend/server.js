import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT) || 5000;



const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

async function startServer() {


  
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is missing from the .env file."
    );

    process.exit(1);
  }

  await connectDatabase();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes(origin)
        ) {
          return callback(null, true);
        }

        return callback(
          new Error(
            "Socket connection blocked by CORS"
          )
        );
      },

      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    socket.on("join-admin", () => {
      socket.join("admins");

      console.log(
        `Admin joined notifications: ${socket.id}`
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}`,
        reason
      );
    });
  });

  const server = httpServer.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `BeePositive API running on port ${port}`
    );
  }
);


  const shutdown = (signal) => {
    console.log(
      `${signal} received. Closing the server...`
    );

    io.close(() => {
      console.log(
        "Socket.IO connections closed."
      );
    });

    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on(
    "SIGINT",
    () => shutdown("SIGINT")
  );

  process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
  );
}

startServer().catch((error) => {
  console.error(
    "Unable to start the server:",
    error
  );

  process.exit(1);
});