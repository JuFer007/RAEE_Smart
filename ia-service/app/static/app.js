const ETIQUETAS = {
  CELULAR: "Celular",
  EQUIPO_DE_SONIDO: "Equipo de sonido",
  IMPRESORA: "Impresora",
  LAPTOP: "Laptop",
  PEQUENO_ELECTRODOMESTICO: "Pequeño electrodoméstico",
  REFRIGERADORA: "Refrigeradora",
  TABLET: "Tablet",
  TELEVISOR: "Televisor",
};

const MAX_BYTES = 8 * 1024 * 1024;

const $ = (id) => document.getElementById(id);

const dropzone = $("dropzone");
const fileInput = $("file-input");
const dropzoneEmpty = $("dropzone-empty");
const preview = $("preview");
const previewImg = $("preview-img");
const previewName = $("preview-name");
const previewSize = $("preview-size");
const previewRemove = $("preview-remove");

const btnClasificar = $("btn-clasificar");
const btnLimpiar = $("btn-limpiar");
const overlay = $("overlay");

const resultEmpty = $("result-empty");
const resultError = $("result-error");
const resultErrorMsg = $("result-error-msg");
const result = $("result");

const statusBox = $("status");
const statusTitle = $("status-title");
const statusSub = $("status-sub");
const modeBadge = $("mode-badge");

let archivoActual = null;
let previewUrl = null;

function etiqueta(categoria) {
  return ETIQUETAS[categoria] || categoria || "—";
}

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ---------------- Estado del servicio ---------------- */
async function consultarEstado() {
  try {
    const res = await fetch("/estado", { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();

    statusBox.dataset.state = "ok";
    statusTitle.textContent = "Servicio activo";
    statusSub.textContent = data.modelo
      ? `Modelo: ${data.modelo}`
      : "Esperando modelo entrenado";

    modeBadge.hidden = false;
    if (data.modo_simulado) {
      modeBadge.textContent = "Modo simulado";
      modeBadge.className = "badge badge--sim";
    } else {
      modeBadge.textContent = "Modo real";
      modeBadge.className = "badge badge--real";
    }
  } catch (e) {
    statusBox.dataset.state = "down";
    statusTitle.textContent = "Servicio no disponible";
    statusSub.textContent = "No se pudo contactar con la IA";
    modeBadge.hidden = true;
  }
}

/* ---------------- Selección de imagen ---------------- */
function limpiarSeleccion() {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  archivoActual = null;
  fileInput.value = "";
  previewImg.removeAttribute("src");
  preview.hidden = true;
  dropzoneEmpty.hidden = false;
  btnClasificar.disabled = true;
  btnLimpiar.disabled = true;

  result.hidden = true;
  resultError.hidden = true;
  resultEmpty.hidden = false;
}

function mostrarError(msg) {
  resultErrorMsg.textContent = msg;
  resultError.hidden = false;
  resultEmpty.hidden = true;
  result.hidden = true;
}

function mostrarSeleccion(archivo) {
  archivoActual = archivo;
  previewUrl = URL.createObjectURL(archivo);

  previewImg.src = previewUrl;
  previewName.textContent = archivo.name;
  previewSize.textContent = formatearTamano(archivo.size);

  dropzoneEmpty.hidden = true;
  preview.hidden = false;
  btnClasificar.disabled = false;
  btnLimpiar.disabled = false;

  resultError.hidden = true;
  result.hidden = true;
  resultEmpty.hidden = false;
}

function procesarArchivo(archivo) {
  if (!archivo) return;
  if (!archivo.type.startsWith("image/")) {
    mostrarError("El archivo debe ser una imagen (JPG, PNG).");
    return;
  }
  if (archivo.size > MAX_BYTES) {
    mostrarError("La imagen supera el tamaño máximo de 8 MB.");
    return;
  }
  mostrarSeleccion(archivo);
}

/* ---------------- Clasificación ---------------- */
function pintarResultado(data) {
  resultEmpty.hidden = true;
  resultError.hidden = true;
  result.hidden = false;

  $("result-category").textContent = etiqueta(data.categoria);

  const pct = Math.round((data.confianza || 0) * 100);
  $("result-conf").textContent = `${pct}%`;
  const bar = $("result-conf-bar");
  bar.style.width = "0%";
  requestAnimationFrame(() => { bar.style.width = `${pct}%`; });

  const lista = $("top3-list");
  lista.innerHTML = "";
  (data.top3 || []).forEach((item) => {
    const li = document.createElement("li");
    const value = Math.round((item.confianza || 0) * 100);
    li.innerHTML = `
      <span class="t3-name">${etiqueta(item.categoria)}</span>
      <span class="t3-val">${value}%</span>
      <div class="t3-track"><span style="width:${value}%"></span></div>
    `;
    lista.appendChild(li);
  });

  $("result-time").textContent = `${data.tiempo_inferencia_ms ?? "—"} ms`;
  $("result-mode").textContent = data.modo_simulado ? "Simulado" : "Real";
}

async function clasificar() {
  if (!archivoActual) return;

  overlay.hidden = false;

  const form = new FormData();
  form.append("imagen", archivoActual);

  try {
    const res = await fetch("/clasificar", { method: "POST", body: form });
    if (!res.ok) {
      let detalle = "No se pudo clasificar la imagen.";
      try {
        const err = await res.json();
        if (err.detail) detalle = typeof err.detail === "string" ? err.detail : detalle;
      } catch (_) {}
      throw new Error(detalle);
    }
    const data = await res.json();
    pintarResultado(data);
  } catch (e) {
    mostrarError(e.message || "Ocurrió un error al clasificar la imagen.");
  } finally {
    overlay.hidden = true;
  }
}

/* ---------------- Eventos ---------------- */
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", (e) => procesarArchivo(e.target.files[0]));

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-drag");
  })
);

["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-drag");
  })
);

dropzone.addEventListener("drop", (e) => {
  const archivo = e.dataTransfer.files && e.dataTransfer.files[0];
  procesarArchivo(archivo);
});

previewRemove.addEventListener("click", (e) => {
  e.stopPropagation();
  limpiarSeleccion();
});

btnClasificar.addEventListener("click", clasificar);
btnLimpiar.addEventListener("click", limpiarSeleccion);

consultarEstado();
setInterval(consultarEstado, 15000);
