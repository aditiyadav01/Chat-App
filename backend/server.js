const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const chats = require("./data/data");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");
const messageRoutes = require("./routes/messageRoutes.js");
const Message = require("../backend/models/messageModel.js");
const uploadRoutes = require("./routes/uploadRoutes.js");
const session = require("express-session");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is Running");
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server Started on PORT ${PORT}`);
});

let onlineUsers = new Map();

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    onlineUsers.set(userData._id, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // Find all 'sent' messages not yet delivered
    const undeliveredMessages = await Message.find({
      status: "sent",
    }).populate("chat");

    undeliveredMessages.forEach(async (msg) => {
      const isRecipient = msg.chat.users.some(
        (u) =>
          u.toString() === userData._id &&
          u.toString() !== msg.sender.toString()
      );

      if (isRecipient) {
        msg.status = "delivered";
        await msg.save();

        const senderSocketId = onlineUsers.get(msg.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("message-delivered", {
            messageId: msg._id,
            status: "delivered",
          });
        }
      }
    });

    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:" + room);
    socket.to(room).emit("message-delivered", { room });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat?.users) return console.error("chat.users not defined");

    chat.users.forEach(async (user) => {
      if (user._id === newMessageRecieved.sender._id) return;

      // Emit to receiver
      socket.in(user._id).emit("message recieved", newMessageRecieved);

      // ✅ If receiver is online, update and emit 'delivered'
      if (onlineUsers.has(user._id)) {
        await Message.findByIdAndUpdate(newMessageRecieved._id, {
          status: "delivered",
        });

        const senderSocketId = onlineUsers.get(newMessageRecieved.sender._id);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message-delivered", {
            messageId: newMessageRecieved._id,
            status: "delivered",
          });
        }
      }
    });
  });

  socket.on("message-seen", async ({ chatId, userId }) => {
    // Update all unseen messages for that chat
    await Message.updateMany(
      { chat: chatId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId }, status: "seen" }
    );

    socket.to(chatId).emit("message-seen", { chatId, userId });
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    // Emit updated list
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log("🚫 User disconnected. Updated online users sent.");
  });
});
