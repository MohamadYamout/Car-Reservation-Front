const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

function appendMessage(sender, message) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendChat.addEventListener("click", function() {
  const text = chatInput.value.trim();
  if (text !== "") {
    appendMessage("You", text);
    chatInput.value = "";
    setTimeout(() => {
      appendMessage("Agent", "Thank you for reaching out. How can I help you?");
    }, 1000);
  }
});

chatInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") sendChat.click();
});
