const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware to parse JSON bodies
app.use(express.json());

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  // Join room based on user type (admin or user)
  socket.on("joinRoom", (userData) => {
    try {
      const { type, username } = userData;
      const room = "support";
      socket.join(room);
      console.log(`${username} joined room: ${room}`);
    } catch (error) {
      console.error("Error joining room:", error);
      // Emit error message to client
      socket.emit("error", { message: "Error joining room" });
    }
  });

  // Listen for messages from clients
  socket.on("message", async (data) => {
    try {
      console.log("New message:", data);
      // Emit message to the recipient's room
      //   io.to(data.to).emit("message", data);
      socket.to("support").emit("message", data);
    } catch (error) {
      console.error("Error sending message:", error);
      // Emit error message to client
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
