// ======== FUNÇÕES HELPERS ========

// extrai parâmetro da URL
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// ======== SENHA DO ANFITRIÃO (CONFIGURAÇÃO DO DONO DO SITE) ========
const HOST_PASSWORD = "XVLARI2025"; // troque se quiser

// ======== URL DO WEBHOOK DO MAKE PARA ENVIAR FOTOS ========
// 👉 COLE AQUI A URL QUE O MAKE TE DEU
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/jybiyv0upp6g9ku76ayz6wi52cixl685";

// cria elemento do preview da lista de arquivos + miniaturas
function renderFilePreview(files, listElement, labelElement, galleryElement) {
  if (!listElement || !labelElement || !galleryElement) return;

  listElement.innerHTML = "";
  galleryElement.innerHTML = "";

  if (!files || files.length === 0) {
    labelElement.style.display = "none";
    return;
  }

  labelElement.style.display = "block";

  Array.from(files).forEach((file) => {
    const sizeKB = Math.round(file.size / 1024);

    // linha de texto
    const li = document.createElement("li");
    li.textContent = `${file.name} (${sizeKB} KB)`;
    listElement.appendChild(li);

    // miniatura
    const item = document.createElement("div");
    item.className = "gallery-item";

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = file.name;
      item.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = false;
      item.appendChild(video);
    } else {
      // outros tipos (ex: zip) – mostra só um quadradinho
      const span = document.createElement("span");
      span.textContent = "Arquivo";
      item.appendChild(span);
    }

    galleryElement.appendChild(item);
  });
}

// ======== MENU MOBILE ========
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector(".nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
});

// ======== PÁGINA "ENVIAR FOTOS" ========

document.addEventListener("DOMContentLoaded", () => {
  const heroEventCode  = document.getElementById("heroEventCode");
  const uploadForm     = document.getElementById("uploadForm");
  const uploadStatus   = document.getElementById("uploadStatus");
  const guestNameInput = document.getElementById("guestName");
  const fileInput      = document.getElementById("fileInput");
  const fileListEl     = document.getElementById("fileList");
  const previewLabel   = document.getElementById("previewLabel");
  const dropArea       = document.getElementById("dropArea");
  const addMoreButton  = document.getElementById("addMoreFilesButton");
  const galleryPreview = document.getElementById("galleryPreview");

  // preenche o código do evento no topo
  if (heroEventCode) {
    const code = getQueryParam("codigo_evento");
    heroEventCode.textContent = code || "—";
  }

  // preview dos arquivos ao selecionar
  if (fileInput && fileListEl && previewLabel && galleryPreview) {
    fileInput.addEventListener("change", () => {
      renderFilePreview(fileInput.files, fileListEl, previewLabel, galleryPreview);
    });
  }

  // clique no dropzone abre seletor
  if (dropArea && fileInput) {
    dropArea.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove("dragover");
      });
    });

    // soltar arquivos no Drop Area
    dropArea.addEventListener("drop", (e) => {
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length) {
        fileInput.files = droppedFiles;
        renderFilePreview(droppedFiles, fileListEl, previewLabel, galleryPreview);
      }
    });
  }

  // botão "Adicionar mais fotos"
  if (addMoreButton && fileInput) {
    addMoreButton.addEventListener("click", () => fileInput.click());
  }

  // validação e envio do form para o MAKE (webhook)
  if (uploadForm && fileInput && uploadStatus && guestNameInput) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const eventCode = getQueryParam("codigo_evento");
      const guestName = guestNameInput.value.trim();
      const files = fileInput.files;

      // validações
      if (!eventCode) {
        uploadStatus.textContent = "❗ Código do evento não encontrado na URL.";
        uploadStatus.style.color = "#ff6b6b";
        return;
      }

      if (!guestName) {
        uploadStatus.textContent = "❗ Digite seu nome antes de enviar.";
        uploadStatus.style.color = "#ff6b6b";
        return;
      }

      if (!files || files.length === 0) {
        uploadStatus.textContent = "❗ Selecione ao menos 1 foto ou vídeo.";
        uploadStatus.style.color = "#ff6b6b";
        return;
      }

      try {
        uploadStatus.textContent = "Enviando arquivos... ⏳";
        uploadStatus.style.color = "#6e5b75";

        const formData = new FormData();
        formData.append("codigo_evento", eventCode);
        formData.append("guest_name", guestName);

        Array.from(files).forEach((file) => {
          formData.append("files[]", file, file.name);
        });

        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro no webhook");
        }

        uploadStatus.textContent =
          "💜 Arquivos enviados com sucesso! Obrigado por participar!";
        uploadStatus.style.color = "#1b8f4b";

        // limpa o form após 4s
        setTimeout(() => {
          uploadForm.reset();
          uploadStatus.textContent = "";
          if (fileListEl) fileListEl.innerHTML = "";
          if (previewLabel) previewLabel.style.display = "none";
          if (galleryPreview) galleryPreview.innerHTML = "";
        }, 4000);
      } catch (err) {
        console.error(err);
        uploadStatus.textContent =
          "❗ Ocorreu um erro ao enviar. Tente novamente em instantes.";
        uploadStatus.style.color = "#ff6b6b";
      }
    });
  }
});

// ======== PÁGINA "ACESSO DO ANFITRIÃO" ========
document.addEventListener("DOMContentLoaded", () => {
  const hostForm = document.getElementById("hostAccessForm");
  const hostStatus = document.getElementById("hostAccessStatus");

  if (hostForm) {
    hostForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const input = document.getElementById("hostAccessCode");
      const code = (input.value || "").trim();

      if (code === HOST_PASSWORD) {
        hostStatus.textContent = "Acesso liberado ✅";
        hostStatus.className = "form-status is-success";

        setTimeout(() => {
          window.location.href = "criar-evento.html";
        }, 1200);
      } else {
        hostStatus.textContent = "Senha inválida ❗";
        hostStatus.className = "form-status is-error";
      }
    });
  }
});

// ======== PÁGINA "CRIAR EVENTO" – GERAR CÓDIGO E LINK =========
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn   = document.getElementById("generateCodeButton");
  const copyBtn       = document.getElementById("copyCodeButton");
  const codeInput     = document.getElementById("eventCode");
  const createForm    = document.getElementById("createEventForm");
  const statusEl      = document.getElementById("createEventStatus");
  const linkBox       = document.getElementById("eventLinkBox");
  const linkInput     = document.getElementById("eventPublicLink");

  if (!generateBtn || !codeInput) return; // não está na página de criar evento

  function generateEventCode() {
    const nameInput = document.getElementById("eventName");
    const rawName = (nameInput?.value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const prefix = rawName.substring(0, 4) || "EVNT";

    const random = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${random}`;

    codeInput.value = code;
  }

  generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    generateEventCode();

    if (statusEl) {
      statusEl.textContent = "Código do evento gerado ✔";
      statusEl.style.color = "#1b8f4b";
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (!codeInput.value) {
        if (statusEl) {
          statusEl.textContent = "Gere o código antes de copiar.";
          statusEl.style.color = "#d62839";
        }
        return;
      }

      navigator.clipboard.writeText(codeInput.value).then(() => {
        if (statusEl) {
          statusEl.textContent = "Código copiado para a área de transferência ✔";
          statusEl.style.color = "#1b8f4b";
          setTimeout(() => (statusEl.textContent = ""), 2500);
        }
      });
    });
  }

  if (createForm) {
    createForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!codeInput.value) {
        generateEventCode();
      }

      const code = codeInput.value;
      if (!code) {
        if (statusEl) {
          statusEl.textContent = "Não foi possível gerar o código do evento.";
          statusEl.style.color = "#d62839";
        }
        return;
      }

      const publicUrl = `${window.location.origin}/enviar-fotos.html?codigo_evento=${encodeURIComponent(
        code
      )}`;

      if (linkInput) {
        linkInput.value = publicUrl;
      }
      if (linkBox) {
        linkBox.style.display = "block";
      }
      if (statusEl) {
        statusEl.textContent =
          "Evento salvo (simulado). Copie o link abaixo para enviar aos convidados.";
        statusEl.style.color = "#1b8f4b";
      }
    });
  }
});
