const express = require('express'); 
const http = require('http'); 
const { Server } = require('socket.io'); 
const app = express(); 
const server = http.createServer(app); 
const io = new Server(server); 
const path = require('path');
const PORT = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", (socket) => { 
console.log("✅A user connected"); 
// Listen for messages from client 
socket.on("chat message", (msg) => { 
console.log("Message: " + msg); 
// Broadcast message to everyone 
io.emit("chat message", msg); 
}); 
socket.on("disconnect", () => { 
console.log("⛓️‍User disconnected"); 
}); 
}); 

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
