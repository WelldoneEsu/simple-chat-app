// Connect to the Socket.io server
const socket = io();

// Parse URL parameters to get the username and selected room
const params = new URLSearchParams(window.location.search);
const username = params.get("username");
const room = params.get("room");

// Notify the server that the user wants to join a specific room
socket.emit("joinRoom", { username, room });

// Get references to DOM elements
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const userList = document.getElementById("user-list");

// Listen for message form submission
messageForm.addEventListener("submit", e => {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Send the message if it's not just whitespace
    if (messageInput.value.trim()) {
        socket.emit("chat message", messageInput.value.trim()); // Send message to server
        messageInput.value = ""; // Clear the input field
    }
});

// Logout button click handler
document.getElementById("logout-btn").addEventListener("click", () => {
    // Notify the server the user is leaving the room
    socket.emit("leaveRoom");

    // Disconnect socket connection cleanly
    socket.disconnect();

    // Redirect user back to the join page
    window.location.href = "index.html";
});

// Listen for incoming chat messages from the server
socket.on("chat message", msg => {
    // Create a new div element for the message
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerText = msg;

    // Add the message to the chat box
    messages.appendChild(div);

    // Auto-scroll to the latest message
    messages.scrollTop = messages.scrollHeight;
});

// Listen for updated user list in the current room
socket.on("room users", users => {
    // Update the sidebar with the current users in the room
    userList.innerHTML = users.map(user => `<li>${user.username}</li>`).join("");
});