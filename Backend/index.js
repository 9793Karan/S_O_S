import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./utils/db.connect.js";
import authRoutes from "./routes/authRoutes.js";
import sosRoutes from "./routes/sos.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "https://s-o-s-1.onrender.com", credentials: true } });

export const onlineResponders = new Map();

io.on("connection", (socket) => {
  socket.on("registerResponder", (userId) => {
    onlineResponders.set(userId, socket.id);
  });
  socket.on("disconnect", () => {
    onlineResponders.forEach((value, key) => {
      if (value === socket.id) onlineResponders.delete(key);
    });
  });
});

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "https://s-o-s-1.onrender.com", credentials: true }));
db();
app.use("/api/auth", authRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/api/test", (req, res) => {
  res.json({ message: "API working!" });
});
server.listen(8000, () => console.log("Server running on port 8000"));
