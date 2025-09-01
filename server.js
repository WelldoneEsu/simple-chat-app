const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const users = {}; // Store users as { socketId: { username, room } }

function getUsersInRoom(room) {
    return Object.values(users).filter(user => user.room === room);
}

io.on("connection", socket => {
    console.log("New client connected:", socket.id);

    // User joins a room
    socket.on("joinRoom", ({ username, room }) => {
        console.log(`${username} joined room ${room}`);

        users[socket.id] = { username, room };
        socket.join(room);

        // Send welcome message to the user
        socket.emit("chat message", `Welcome ${username} to ${room} Room`);

        // Notify others in the room
        socket.to(room).emit("chat message", `${username} joined ${room} Room`);

        // Update user list in the room
        io.to(room).emit("room users", getUsersInRoom(room));
    });

    
    // Handle typing indicator
const typingUsers = {}; // Track typing users by room

socket.on("typing", () => {
    const user = users[socket.id];
    if (user) {
        if (!typingUsers[user.room]) typingUsers[user.room] = new Set();
        typingUsers[user.room].add(user.username);

        io.to(user.room).emit("typing", Array.from(typingUsers[user.room]));
    }
});

socket.on("stop typing", () => {
    const user = users[socket.id];
    if (user && typingUsers[user.room]) {
        typingUsers[user.room].delete(user.username);
        io.to(user.room).emit("typing", Array.from(typingUsers[user.room]));
    }
});


    // Handle chat messages sent by users
    socket.on("chat message", msg => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit("chat message", `${user.username}: ${msg}`);
        }
    });

    // Handle user leaving the room explicitly
    socket.on("leaveRoom", () => {
        const user = users[socket.id];
        if (user) {
            console.log(`${user.username} is leaving room ${user.room}`);

            // Notify others
            socket.to(user.room).emit("chat message", `${user.username} left ${user.room} Room`);

            // Remove user from room
            socket.leave(user.room);

            // Remove from users list
            delete users[socket.id];

            // Update user list for the room
            io.to(user.room).emit("room users", getUsersInRoom(user.room));
        }
    });

    // Handle user disconnecting (e.g., closing tab)
    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            console.log(`${user.username} disconnected from room ${user.room}`);

            // Notify others
            socket.to(user.room).emit("chat message", `${user.username} left ${user.room} Room`);

            // Remove user from users list
            delete users[socket.id];

            // Update user list for the room
            io.to(user.room).emit("room users", getUsersInRoom(user.room));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));