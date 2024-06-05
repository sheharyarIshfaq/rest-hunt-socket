const io = require("socket.io")(8800, {
  cors: {
    origin: "*",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  //add new user to activeUsers array
  socket.on("new-user-add", (newUserId) => {
    //if user is not in activeUsers array, add it
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    console.log("Connected users: ", activeUsers);
    //send activeUsers array to all users
    io.emit("get-users", activeUsers);
  });

  //send message to user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending message to: ", receiverId);
    console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
      console.log("Message sent to", user.socketId);
    }
  });

  //remove user from activeUsers array
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User disconnected: ", activeUsers);
    io.emit("get-users", activeUsers);
  });
});
