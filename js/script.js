/* script.js — genera los pases y ajusta la vista previa. Los textos se editan en config.js */

/* =====================================================
   GENERACIÓN DE LOS PASES
   ===================================================== */
function buildPass(n) {
  const folio = String(n).padStart(CONFIG.folioDigits, "0");

  const el = document.createElement("article");
  el.className = "pass";
  el.dataset.folio = folio;

  const img = document.createElement("img");
  img.className = "bg";
  img.alt = "";
  img.src = FLORAL_IMG;
  el.appendChild(img);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.innerHTML = `
    <div class="intro">${CONFIG.intro}</div>
    <div class="title">${CONFIG.title}</div>
    <div class="rule"></div>
    <div class="valid">${CONFIG.validLabel}</div>
    <div class="num">${CONFIG.people}</div>
    <div class="person">${CONFIG.personText}</div>
    <div class="names">${CONFIG.names.replace("&", "&amp;")}</div>
    <div class="folio">${CONFIG.folioLabel} ${folio}</div>
  `;
  el.appendChild(panel);
  return el;
}

const sheets = document.getElementById("sheets");
const totalInput = document.getElementById("totalPasses");
const passesPerPageInput = document.getElementById("passesPerPage");
const startFolioInput = document.getElementById("startFolio");
const generationForm = document.getElementById("generationForm");
const generationSummary = document.getElementById("generationSummary");

function generatePasses(total, passesPerPage, startFolio) {
  const sheetFrag = document.createDocumentFragment();
  const pageCount = Math.ceil(total / passesPerPage);
  const columns = Math.min(3, passesPerPage);
  const rows = Math.ceil(passesPerPage / columns);
  const passWidthMm = 62;
  const passHeightMm = passWidthMm / 1.52;
  const gapMm = 4;
  const gridWidthMm = columns * passWidthMm + (columns - 1) * gapMm;
  const gridHeightMm = rows * passHeightMm + (rows - 1) * gapMm;
  const scale = Math.min(1, 210 / gridWidthMm, 292 / gridHeightMm);

  for (let firstPass = 1; firstPass <= total; firstPass += passesPerPage) {
    const sheetWrap = document.createElement("div");
    sheetWrap.className = "sheet-wrap";

    const sheet = document.createElement("div");
    sheet.className = "sheet";

    const grid = document.createElement("div");
    grid.className = "grid";
    grid.style.setProperty("--columns", columns);
    grid.style.setProperty("--rows", rows);
    grid.style.transform = `scale(${scale})`;

    const lastPass = Math.min(firstPass + passesPerPage - 1, total);
    for (let pass = firstPass; pass <= lastPass; pass++) {
      grid.appendChild(buildPass(startFolio + pass - 1));
    }

    sheet.appendChild(grid);
    sheetWrap.appendChild(sheet);
    sheetFrag.appendChild(sheetWrap);
  }

  sheets.replaceChildren(sheetFrag);
  generationSummary.textContent =
    `${total} pases · ${pageCount} ${pageCount === 1 ? "página" : "páginas"} · Folios ${String(startFolio).padStart(CONFIG.folioDigits, "0")}–${String(startFolio + total - 1).padStart(CONFIG.folioDigits, "0")}`;
  fitPreview();
}

totalInput.value = CONFIG.total;
passesPerPageInput.value = CONFIG.passesPerPage;
startFolioInput.value = CONFIG.startFolio;
generatePasses(CONFIG.total, CONFIG.passesPerPage, CONFIG.startFolio);

generationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!generationForm.reportValidity()) return;

  generatePasses(
    Number(totalInput.value),
    Number(passesPerPageInput.value),
    Number(startFolioInput.value)
  );
});

/* =====================================================
   VISTA PREVIA: ajusta la hoja al ancho de la pantalla
   (solo en pantalla; no afecta a la impresión)
   ===================================================== */
function fitPreview() {
  const mmToPx = 96 / 25.4;
  const sheetW = 210 * mmToPx;
  const sheetH = 297 * mmToPx;
  const scale  = Math.min(1, (window.innerWidth - 24) / sheetW);
  document.querySelectorAll(".sheet-wrap").forEach((wrap) => {
    wrap.style.transform = `scale(${scale})`;
    wrap.style.width = sheetW + "px";
    wrap.style.height = sheetH + "px";
    wrap.style.marginBottom = `${-(sheetH * (1 - scale))}px`;
  });
}
window.addEventListener("resize", fitPreview);
window.addEventListener("beforeprint", () => {
  document.querySelectorAll(".sheet-wrap").forEach((wrap) => {
    wrap.style.transform = "none";
    wrap.style.marginBottom = "0";
  });
});
window.addEventListener("afterprint", fitPreview);
fitPreview();

document.getElementById("btnPrint").addEventListener("click", () => window.print());
