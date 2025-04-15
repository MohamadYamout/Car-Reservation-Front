const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const typingIndicator = document.getElementById("typingIndicator");

function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(sender === "You" ? "user-message" : "agent-message");

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  contentDiv.textContent = message;

  const timeDiv = document.createElement("div");
  timeDiv.classList.add("message-time");
  const now = new Date();
  timeDiv.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);

  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendChat.addEventListener("click", function () {
  const text = chatInput.value.trim();
  if (text !== "") {
    appendMessage("You", text);
    chatInput.value = "";

    // Show typing indicator
    typingIndicator.classList.add("active");

    setTimeout(() => {
      typingIndicator.classList.remove("active");
      appendMessage("Agent", "Thank you for reaching out. How can I help you?");
    }, 1000);
  }
});

chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendChat.click();
});
