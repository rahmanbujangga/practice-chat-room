const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const BadWords = require("bad-words");
const { generateMessage, generateLocUrl } = require("./utils/messages");
const userUtil = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New web socket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = userUtil.addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }
    socket.join(user.room);

    socket.emit("logMsg", generateMessage("Admin", `Welcome!`));
    socket.broadcast
      .to(user.room)
      .emit("logMsg", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: userUtil.getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on("submitMsg", (val, cb) => {
    const user = userUtil.getUser(socket.id);
    const filterWord = new BadWords();
    if (filterWord.isProfane(val)) {
      return cb("Bad word not allowed!!!");
    }
    io.to(user.room).emit("logMsg", generateMessage(user.username, val));
    cb();
  });

  socket.on("sendLocation", (loc, cb) => {
    const user = userUtil.getUser(socket.id);
    io.to(user.room).emit(
      "locationMsg",
      generateLocUrl(
        user.username,
        `https://google.com/maps?q=${loc.latitude},${loc.longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = userUtil.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "logMsg",
        generateMessage("Admin", `${user.username} left the chat`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: userUtil.getUsersInRoom(user.room),
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Chat app</h1>");
});

server.listen(3000, () => {
  console.log("Connected to the server");
});
