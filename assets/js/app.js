// Menu mobile
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}
// ========= CONFIG GERAL =========
const HOST_ACCESS_CODE = "VXLARI"; // troque para o código que você quiser
// ========= ACESSO DO ANFITRIÃO =========
const hostAccessForm = document.getElementById("hostAccessForm");
const hostAccessCodeInput = document.getElementById("hostAccessCode");
const hostAccessStatus = document.getElementById("hostAccessStatus");

if (hostAccessForm && hostAccessCodeInput) {
  hostAccessForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const code = hostAccessCodeInput.value.trim();

    if (!code) return;

    if (code === HOST_ACCESS_CODE) {
      // marca que o anfitrião está autenticado
      localStorage.setItem("photofesta_host_auth", "ok");

      hostAccessStatus.textContent = "Tudo certo! Redirecionando...";
      hostAccessStatus.style.color = "#0b7a30";

      setTimeout(() => {
        window.location.href = "criar-evento.html";
      }, 700);
    } else {
      hostAccessStatus.textContent =
        "Código inválido. Confira com a Photo&Festa ou tente novamente.";
      hostAccessStatus.style.color = "#b3261e";
    }
  });
}


// ========= CRIAR EVENTO / GERAR CÓDIGO =========
const generateCodeButton = document.getElementById("generateCodeButton");
const copyCodeButton = document.getElementById("copyCodeButton");
const copyLinkButton = document.getElementById("copyLinkButton");
const eventCodeInput = document.getElementById("eventCode");
const createEventForm = document.getElementById("createEventForm");
const statusSpan = document.getElementById("createEventStatus");
const eventLinkBox = document.getElementById("eventLinkBox");
const eventPublicLinkInput = document.getElementById("eventPublicLink");
// se estiver na página de criar evento, checa se o anfitrião se autenticou

if (createEventForm) {
  const isAuthed = localStorage.getItem("photofesta_host_auth") === "ok";

  if (!isAuthed) {
    // se não passou pelo código, volta para a tela de acesso
    window.location.href = "acesso-anfitriao.html";
  }
}


// gera um código baseado no nome do evento
function generateEventCode() {
  const nameInput = document.getElementById("eventName");
  const name = (nameInput?.value || "EVENTO").trim();

  const prefix = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 5) || "EVENTO";

  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  return `${prefix}-${randomPart}`;
}

if (generateCodeButton && eventCodeInput) {
  generateCodeButton.addEventListener("click", () => {
    const code = generateEventCode();
    eventCodeInput.value = code;
    statusSpan.textContent = "Código gerado! Agora salve o evento.";
    statusSpan.style.color = "#6e5b75";
  });
}

if (copyCodeButton && eventCodeInput) {
  copyCodeButton.addEventListener("click", async () => {
    if (!eventCodeInput.value) return;
    await navigator.clipboard.writeText(eventCodeInput.value);
    statusSpan.textContent = "Código copiado!";
    statusSpan.style.color = "#0b7a30";
  });
}

// salvar evento (apenas front-end, sem back-end)
if (createEventForm) {
  createEventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!eventCodeInput.value) {
      eventCodeInput.value = generateEventCode();
    }

    const code = eventCodeInput.value;

    // monta o link público (ajuste para o domínio real depois)
    const baseUrl = window.location.origin + "/photofesta-site"; // se precisar, troque pelo seu repo
    const publicLink = `${baseUrl}/enviar-fotos.html?evento=${encodeURIComponent(
      code
    )}`;

    if (eventPublicLinkInput && eventLinkBox) {
      eventPublicLinkInput.value = publicLink;
      eventLinkBox.style.display = "block";
    }

    statusSpan.textContent =
      "Evento salvo localmente. Envie o link abaixo para os convidados.";
    statusSpan.style.color = "#0b7a30";

    // aqui você pode depois integrar com Make / planilha / banco
  });
}

if (copyLinkButton && eventPublicLinkInput) {
  copyLinkButton.addEventListener("click", async () => {
    if (!eventPublicLinkInput.value) return;
    await navigator.clipboard.writeText(eventPublicLinkInput.value);
    statusSpan.textContent = "Link copiado!";
    statusSpan.style.color = "#0b7a30";
  });
}
