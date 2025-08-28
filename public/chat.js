// Connect to Socket.io server
const socket = io();

// Get username and room from URL parameters
const params = new URLSearchParams(window.location.search);
const username = params.get("username");
const room = params.get("room");

console.log("Joining room:", username, room);

// Emit joinRoom event to server immediately
if (username && room) {
    socket.emit("joinRoom", { username, room });
} else {
    alert("Username and room are required.");
    window.location.href = "index.html"; // redirect back if missing params
}

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const userList = document.getElementById("user-list");

// Send chat message on form submit
messageForm.addEventListener("submit", e => {
    e.preventDefault();

    const msg = messageInput.value.trim();
    if (msg) {
        socket.emit("chat message", msg);
        messageInput.value = "";
    }
});

// Logout button - emit leaveRoom then disconnect and redirect
document.getElementById("logout-btn").addEventListener("click", () => {
    socket.emit("leaveRoom");
    socket.disconnect();
    window.location.href = "index.html";
});

// Listen for chat messages from server
socket.on("chat message", msg => {
    console.log("Received message:", msg);

    const div = document.createElement("div");
    div.classList.add("message");
    div.innerText = msg;
    messages.appendChild(div);

    // Auto-scroll to newest message
    messages.scrollTop = messages.scrollHeight;
});

// Listen for updated user list in the room
socket.on("room users", users => {
    userList.innerHTML = users.map(user => `<li>${user.username}</li>`).join("");
});