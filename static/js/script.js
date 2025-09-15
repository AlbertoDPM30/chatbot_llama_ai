document.addEventListener("DOMContentLoaded", () => {
  // Mostrar Chatbot
  let btnShowChatBot = document.querySelector(".btnChatNow");
  let windowChat = document.querySelector(".chat-wrapper");

  btnShowChatBot.addEventListener("click", function () {
    // alert("hola");
    windowChat.style.display = "flex";
  });

  // Cargar historial para el aside nav
  async function loadHistorySidebar() {
    try {
      const response = await fetch("/history");
      if (!response.ok) throw new Error("Error al recuperar historial");

      const history = await response.json();
      const historyList = document.getElementById("history-list");

      history.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item.user_msg;
        li.addEventListener("click", () => {
          addMessage(item.user_msg, true);
          addMessage(item.bot_response, false);
        });
        historyList.appendChild(li);
      });
    } catch (error) {
      console.error("Error al cargar historial en el aside:", error);
    }
  }

  loadHistorySidebar();

  // Cargar historial completo al iniciar
  async function loadHistory() {
    try {
      const response = await fetch("/history");
      if (!response.ok) throw new Error("Error al recuperar historial");

      const history = await response.json();

      history.forEach((item) => {
        addMessage(item.user_msg, true);
        addMessage(item.bot_response, false);
      });
    } catch (error) {
      console.error("Error al cargar historial:", error);
      // addMessage("⚠️ No se pudo cargar el historial completo.", false);
    }
  }

  // Llamar al cargar el DOM
  loadHistory();

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
            htmlOutput += '<ul style="margin-left: 20px;">';
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

    // Activar animación del cohete
    let rocketIcon = document.querySelector(".send-icon");
    rocketIcon.classList.add("send-icon-activated");

    setTimeout(() => {
      rocketIcon.classList.remove("send-icon-activated");
    }, 600);

    // Validar mensaje no vacío
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
