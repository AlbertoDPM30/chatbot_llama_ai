document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const typingIndicator = document.getElementById("typing-indicator");

  // Función para añadir mensajes al chat
  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);

    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Enviar mensaje al servidor
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Añadir mensaje de usuario
    addMessage(message, true);
    messageInput.value = "";

    // Mostrar indicador de typing
    typingIndicator.style.display = "block";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      addMessage(data.reply, false);
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "⚠️ Error al conectar con el servidor. Intenta nuevamente.",
        false
      );
    } finally {
      // Ocultar indicador de typing
      typingIndicator.style.display = "none";
    }
  }

  // Event Listeners
  sendButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
