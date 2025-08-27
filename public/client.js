const socket = io();

// Elements
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');  


// Send message
form.addEventListener('submit', (e) => {
    e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value); 
    input.value = '';
  }
});

// Listen for messages
socket.on("chat message", (msg) => {
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
});
