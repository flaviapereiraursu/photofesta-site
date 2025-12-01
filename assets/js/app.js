// ============================
// MENU MOBILE
// ============================
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

// ============================
// HELPER PARA QUERYSTRING
// ============================
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ============================
// ACESSO DO ANFITRIÃO
// ============================
const HOST_ACCESS_CODE = "VXLARI";

const hostAccessForm = document.getElementById("hostAccessForm");
const hostAccessCodeInput = document.getElementById("hostAccessCode");
const hostAccessStatus = document.getElementById("hostAccessStatus");

if (hostAccessForm && hostAccessCodeInput) {
  hostAccessForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const code = hostAccessCodeInput.value.trim();
    if (!code) return;

    if (code === HOST_ACCESS_CODE) {
      // marca no localStorage que o anfitrião passou pelo código
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

// ============================
// CRIAR EVENTO / GERAR CÓDIGO
// ============================
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
    window.location.href = "acesso-anfitriao.html";
  }

  createEventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // garante que exista um código
    if (!eventCodeInput.value) {
      eventCodeInput.value = generateEventCode();
    }

    const code = eventCodeInput.value;

    // =========================
    // monta o link público (funciona local e no GitHub Pages)
    // =========================
    let baseUrl;

    // Se estiver rodando localmente (127.0.0.1 ou localhost)
    if (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    ) {
      // Live Server normalmente já está na raiz do projeto
      baseUrl = window.location.origin;
    } else {
      // Em produção (GitHub Pages) precisa do nome do repositório
      baseUrl = window.location.origin + "/photofesta-site";
    }

    const publicLink = `${baseUrl}/enviar-fotos.html?evento=${encodeURIComponent(
      code
    )}`;

    if (eventPublicLinkInput && eventLinkBox) {
      eventPublicLinkInput.value = publicLink;
      eventLinkBox.style.display = "block";
    }

    // ====== SALVA DADOS DO EVENTO NO LOCALSTORAGE ======
    const eventNameInput = document.getElementById("eventName");
    const hostNameInput = document.getElementById("hostName");

    const eventName = eventNameInput?.value.trim() || "";
    const hostName = hostNameInput?.value.trim() || "";

    try {
      const raw = localStorage.getItem("fotofesta_events") || "[]";
      const events = JSON.parse(raw);

      // remove registro anterior com mesmo código (se existir)
      const filtered = events.filter((ev) => ev.code !== code);

      filtered.push({
        code,
        eventName,
        hostName,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("fotofesta_events", JSON.stringify(filtered));
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
    }
    // ============================================

    if (statusSpan) {
      statusSpan.textContent =
        "Evento salvo localmente. Envie o link abaixo para os convidados.";
      statusSpan.style.color = "#0b7a30";
    }
  });
}

// gera um código baseado no nome do evento
function generateEventCode() {
  const nameInput = document.getElementById("eventName");
  const name = (nameInput?.value || "EVENTO").trim();

  const prefix =
    name
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
    if (statusSpan) {
      statusSpan.textContent = "Código gerado! Agora salve o evento.";
      statusSpan.style.color = "#6e5b75";
    }
  });
}

if (copyCodeButton && eventCodeInput) {
  copyCodeButton.addEventListener("click", async () => {
    if (!eventCodeInput.value) return;
    await navigator.clipboard.writeText(eventCodeInput.value);
    if (statusSpan) {
      statusSpan.textContent = "Código copiado!";
      statusSpan.style.color = "#0b7a30";
    }
  });
}

if (copyLinkButton && eventPublicLinkInput) {
  copyLinkButton.addEventListener("click", async () => {
    if (!eventPublicLinkInput.value) return;
    await navigator.clipboard.writeText(eventPublicLinkInput.value);
    if (statusSpan) {
      statusSpan.textContent = "Link copiado!";
      statusSpan.style.color = "#0b7a30";
    }
  });
}

// ============================
// PÁGINA ENVIAR FOTOS – HERO
// ============================
(function configurarUploadHero() {
  // Só roda se estiver na página de envio
  const uploadHero = document.querySelector(".upload-hero");
  const heroCodeEl = document.getElementById("heroEventCode");
  const heroSubEl = document.querySelector(".upload-hero-subtitle");

  if (!uploadHero) return; // não está nessa página

  // Lê o código do evento da URL
  const eventCode = getQueryParam("evento");

  if (eventCode && heroCodeEl) {
    heroCodeEl.textContent = eventCode;
  }

  try {
    const raw = localStorage.getItem("fotofesta_events") || "[]";
    const events = JSON.parse(raw);
    const found = events.find((ev) => ev.code === eventCode);

    if (found) {
      // monta o "slug" do anfitrião para bater com o nome do arquivo
      const hostSlug =
        (found.hostName || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase() || "default-event";

      // define a imagem de fundo
      uploadHero.style.backgroundImage =
        `linear-gradient(120deg, rgba(0,0,0,.55), rgba(0,0,0,.25)), url("assets/img/${hostSlug}.jpg")`;
      uploadHero.style.backgroundSize = "cover";
      uploadHero.style.backgroundPosition = "center";

      if (heroSubEl && found.hostName) {
        heroSubEl.textContent = `Compartilhe as melhores fotos do evento de ${found.hostName}.`;
      }
    } else {
      // se não achar o evento, usa uma imagem padrão
      uploadHero.style.backgroundImage =
        'linear-gradient(120deg, rgba(0,0,0,.55), rgba(0,0,0,.25)), url("assets/img/default-event.jpg")';
      uploadHero.style.backgroundSize = "cover";
      uploadHero.style.backgroundPosition = "center";
    }
  } catch (err) {
    console.error("Erro ao configurar hero de upload:", err);
  }
})();
