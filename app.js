import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Determine the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://fluffy-hotteok-9d2456.netlify.app",
    methods: ["GET", "POST"],
  },
});

let users = {};
const messages = [];

// Enable CORS
app.use(
  cors({
    origin: "https://fluffy-hotteok-9d2456.netlify.app", // Allow your React app origin
    methods: ["GET", "POST"],
  })
);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Notify about new user
  socket.on("user joined", (user) => {
    console.log(user);
    users[socket.id] = user;
    io.emit("update users", Object.values(users));
  });

  // Broadcast the message to all clients
  socket.on("chat message", (msg) => {
    console.log("chat message");
    messages.push(msg);
    io.emit("chat message", msg);
  });

  // Imitate get request of messages
  socket.on("get messages", () => {
    io.emit("all messages", messages);
  });

  // Delete user if disconnected
  socket.on("log out", () => {
    console.log("A user disconnected:", socket.id);
    delete users[socket.id];
    io.emit("update users", Object.values(users));
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete users[socket.id];
    io.emit("update users", Object.values(users));
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Listening on *:" + (process.env.PORT || 8080));
});
