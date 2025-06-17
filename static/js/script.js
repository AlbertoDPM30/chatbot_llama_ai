document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  // Función para formatear el texto del asistente
  function formatBotMessage(text) {
    // Convertir **texto** en negrita
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convertir * elementos en lista
    if (formattedText.startsWith("* ") || formattedText.includes("\n* ")) {
      const lines = formattedText.split("\n");
      let listStarted = false;
      let htmlOutput = "";

      lines.forEach((line) => {
        if (line.startsWith("* ")) {
          if (!listStarted) {
            htmlOutput += "<ul>";
            listStarted = true;
          }
          htmlOutput += `<li>\t${line.substring(2)}</li>`;
        } else {
          if (listStarted) {
            htmlOutput += "</ul>";
            listStarted = false;
          }
          htmlOutput += `<p>${line}</p>`;
        }
      });

      if (listStarted) htmlOutput += "</ul>";
      return htmlOutput;
    }

    // Mantener saltos de línea
    return formattedText.replace(/\n/g, "<br>");
  }

  // Función para crear el indicador de "Pensando..."
  function createTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("typing-indicator");
    typingDiv.id = "typing-indicator";
    typingDiv.textContent = "Pensando...";
    return typingDiv;
  }

  // Función para añadir mensajes al chat
  function addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");

    if (isUser) {
      // Mensaje de usuario (texto plano)
      messageDiv.textContent = text;
    } else {
      // Mensaje del asistente (formateado)
      messageDiv.innerHTML = formatBotMessage(text);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
  }

  // Enviar mensaje al servidor
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Añadir mensaje de usuario
    addMessage(message, true);
    messageInput.value = "";

    // Crear y mostrar indicador de typing
    const typingIndicator = createTypingIndicator();
    chatMessages.appendChild(typingIndicator);
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

      // Eliminar el indicador de typing
      typingIndicator.remove();

      // Añadir respuesta del asistente formateada
      addMessage(data.reply, false);
    } catch (error) {
      console.error("Error:", error);
      typingIndicator.remove();
      addMessage(
        "⚠️ Error al conectar con el servidor. Intenta nuevamente.",
        false
      );
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
