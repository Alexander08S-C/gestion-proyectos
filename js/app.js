// ================================
// DATOS INICIALES
// ================================
const proyectosIniciales = [
  {
    id: 1,
    nombre: "Transformación Digital — BancoNorte",
    cliente: "BancoNorte S.A.",
    responsable: "Valentina Cruz",
    estado: "en-curso",
    progreso: 68,
    fechaEntrega: "2026-03-15",
    tareas: [
      { id: 101, texto: "Auditoría de sistemas legacy", hecha: true },
      { id: 102, texto: "Diseño de arquitectura cloud", hecha: true },
      { id: 103, texto: "Migración fase 1 — Core banking", hecha: false },
      { id: 104, texto: "Capacitación equipo TI cliente", hecha: false },
    ],
  },
  {
    id: 2,
    nombre: "Optimización Supply Chain — RetailMax",
    cliente: "RetailMax Corp.",
    responsable: "Diego Morales",
    estado: "en-riesgo",
    progreso: 42,
    fechaEntrega: "2026-02-28",
    tareas: [
      { id: 201, texto: "Relevamiento de procesos logísticos", hecha: true },
      { id: 202, texto: "Modelado de inventario dinámico", hecha: false },
      { id: 203, texto: "Integración con ERP SAP", hecha: false },
    ],
  },
  {
    id: 3,
    nombre: "Estrategia ESG — GrupoVerde",
    cliente: "GrupoVerde Holding",
    responsable: "Sofía Leal",
    estado: "completado",
    progreso: 100,
    fechaEntrega: "2026-01-31",
    tareas: [
      { id: 301, texto: "Diagnóstico huella de carbono", hecha: true },
      { id: 302, texto: "Benchmark competidores ESG", hecha: true },
      { id: 303, texto: "Hoja de ruta 2030", hecha: true },
      { id: 304, texto: "Presentación a directorio", hecha: true },
    ],
  },
  {
    id: 4,
    nombre: "CX Redesign — AeroLatam",
    cliente: "AeroLatam",
    responsable: "Marcos Ruiz",
    estado: "en-curso",
    progreso: 25,
    fechaEntrega: "2026-04-30",
    tareas: [
      { id: 401, texto: "Investigación de usuarios (UXR)", hecha: true },
      { id: 402, texto: "Journey mapping cliente actual", hecha: false },
      { id: 403, texto: "Prototipado nuevas experiencias", hecha: false },
    ],
  },
];

// ================================
// LOCALSTORAGE — CARGAR Y GUARDAR
// ================================

// Si ya hay datos guardados los usamos, sino usamos los iniciales
function cargarProyectos() {
  const guardados = localStorage.getItem("proyectos");
  if (guardados) {
    return JSON.parse(guardados);
  } else {
    localStorage.setItem("proyectos", JSON.stringify(proyectosIniciales));
    return proyectosIniciales;
  }
}

function guardarProyectos(proyectos) {
  localStorage.setItem("proyectos", JSON.stringify(proyectos));
}

// ================================
// ESTADÍSTICAS
// ================================
function actualizarResumen(proyectos) {
  document.getElementById("total-proyectos").textContent = proyectos.length;
  document.getElementById("en-curso").textContent = proyectos.filter(p => p.estado === "en-curso").length;
  document.getElementById("en-riesgo").textContent = proyectos.filter(p => p.estado === "en-riesgo").length;
  document.getElementById("completados").textContent = proyectos.filter(p => p.estado === "completado").length;
}

// ================================
// ETIQUETA DE ESTADO
// ================================
function badgeEstado(estado) {
  const etiquetas = {
    "en-curso": "En curso",
    "en-riesgo": "En riesgo",
    "completado": "Completado",
  };
  return `<span class="badge ${estado}">${etiquetas[estado]}</span>`;
}

// ================================
// RENDERIZAR PROYECTOS
// ================================
function renderizarProyectos(proyectos) {
  const lista = document.getElementById("lista-proyectos");
  lista.innerHTML = "";

  if (proyectos.length === 0) {
    lista.innerHTML = `<p style="color:#64748b; text-align:center; padding: 40px 0;">No hay proyectos todavía.</p>`;
    return;
  }

  proyectos.forEach(proyecto => {
    const div = document.createElement("div");
    div.classList.add("proyecto", proyecto.estado);

    // Calcular alerta de vencimiento
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(proyecto.fechaEntrega);
    const diasRestantes = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
    let alertaHTML = "";
    if (proyecto.estado !== "completado") {
      if (diasRestantes < 0) {
        alertaHTML = `<div class="alerta vencido">⚠️ Vencido hace ${Math.abs(diasRestantes)} día(s)</div>`;
      } else if (diasRestantes <= 7) {
        alertaHTML = `<div class="alerta proximo">⏰ Vence en ${diasRestantes} día(s)</div>`;
      }
    }

    div.innerHTML = `
      <div class="proyecto-header">
        <h3>${proyecto.nombre}</h3>
        <div class="proyecto-acciones">
          ${badgeEstado(proyecto.estado)}
          <button class="btn-editar" onclick="abrirEdicion(${proyecto.id})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProyecto(${proyecto.id})">Eliminar</button>
        </div>
      </div>
      <p class="proyecto-info">
        Cliente: <strong>${proyecto.cliente}</strong> &nbsp;|&nbsp;
        Responsable: <strong>${proyecto.responsable}</strong> &nbsp;|&nbsp;
        Entrega: <strong>${proyecto.fechaEntrega}</strong>
      </p>
      ${alertaHTML}
      <div class="progreso-label">
        <span>Progreso</span>
        <span>${proyecto.progreso}%</span>
      </div>
      <div class="barra-fondo">
        <div class="barra-fill" style="width: ${proyecto.progreso}%"></div>
      </div>
      <div class="tareas-toggle">
        <button class="btn-tareas" onclick="toggleTareas(${proyecto.id})">
          ▶ Ver tareas (${(proyecto.tareas || []).length})
        </button>
      </div>
      <div class="tareas-panel oculto" id="tareas-${proyecto.id}">
        <ul class="lista-tareas" id="lista-tareas-${proyecto.id}"></ul>
        <div class="nueva-tarea">
          <input type="text" id="input-tarea-${proyecto.id}" placeholder="Nueva tarea..." />
          <button onclick="agregarTarea(${proyecto.id})">+ Agregar</button>
        </div>
      </div>

      <div class="comentarios-toggle">
        <button class="btn-comentarios" onclick="toggleComentarios(${proyecto.id})">
          💬 Comentarios (${(proyecto.comentarios || []).length})
        </button>
      </div>
      <div class="comentarios-panel oculto" id="comentarios-${proyecto.id}">
        <ul class="lista-comentarios" id="lista-comentarios-${proyecto.id}"></ul>
        <div class="nuevo-comentario">
          <input type="text" id="input-autor-${proyecto.id}" placeholder="Tu nombre" class="input-autor" />
          <input type="text" id="input-comentario-${proyecto.id}" placeholder="Escribí un comentario..." />
          <button onclick="agregarComentario(${proyecto.id})">Enviar</button>
        </div>
      </div>
    `;
    lista.appendChild(div);
    renderizarTareas(proyecto);
    renderizarComentarios(proyecto);
  });
}

// ================================
// INICIAR LA APP
// ================================
function init() {
  const proyectos = cargarProyectos();
  actualizarResumen(proyectos);
  renderizarProyectos(proyectos);
  actualizarGrafico(proyectos);
  actualizarResponsables(proyectos);
}

init();

// ================================
// FORMULARIO — ABRIR Y CERRAR
// ================================
function abrirFormulario() {
  document.getElementById("formulario-container").classList.remove("oculto");
  document.getElementById("btn-nuevo").style.display = "none";
}



function limpiarFormulario() {
  document.getElementById("nombre").value = "";
  document.getElementById("cliente").value = "";
  document.getElementById("responsable").value = "";
  document.getElementById("estado").value = "en-curso";
  document.getElementById("progreso").value = "";
  document.getElementById("fechaEntrega").value = "";
}



// ================================
// ELIMINAR PROYECTO
// ================================
function eliminarProyecto(id) {
  const confirmar = confirm("¿Estás seguro que querés eliminar este proyecto?");
  if (!confirmar) return;

  let proyectos = cargarProyectos();
  proyectos = proyectos.filter(p => p.id !== id);
  guardarProyectos(proyectos);

  actualizarResumen(proyectos);
  renderizarProyectos(proyectos);
  actualizarGrafico(proyectos);
  actualizarResponsables(proyectos);
}

// ================================
// EDITAR PROYECTO
// ================================

// Variable para saber si estamos editando y qué proyecto
let idEditando = null;

function abrirEdicion(id) {
  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === id);
  if (!proyecto) return;

  // Guardamos el id que estamos editando
  idEditando = id;

  // Cargamos los datos en el formulario
  document.getElementById("nombre").value = proyecto.nombre;
  document.getElementById("cliente").value = proyecto.cliente;
  document.getElementById("responsable").value = proyecto.responsable;
  document.getElementById("estado").value = proyecto.estado;
  document.getElementById("progreso").value = proyecto.progreso;
  document.getElementById("fechaEntrega").value = proyecto.fechaEntrega;

  // Cambiamos el título y el botón guardar
  document.querySelector("#formulario h3").textContent = "Editar Proyecto";
  document.getElementById("btn-guardar").textContent = "Actualizar proyecto";

  // Mostramos el formulario
  document.getElementById("formulario-container").classList.remove("oculto");
  document.getElementById("btn-nuevo").style.display = "none";

  // Hacemos scroll hacia arriba para ver el formulario
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cerrarFormulario() {
  idEditando = null;
  document.getElementById("formulario-container").classList.add("oculto");
  document.getElementById("btn-nuevo").style.display = "inline-block";
  document.querySelector("#formulario h3").textContent = "Nuevo Proyecto";
  document.getElementById("btn-guardar").textContent = "Guardar proyecto";
  limpiarFormulario();
}

function guardarNuevoProyecto() {
  const nombre = document.getElementById("nombre").value.trim();
  const cliente = document.getElementById("cliente").value.trim();
  const responsable = document.getElementById("responsable").value.trim();
  const estado = document.getElementById("estado").value;
  const progreso = parseInt(document.getElementById("progreso").value);
  const fechaEntrega = document.getElementById("fechaEntrega").value;

  if (!nombre || !cliente || !responsable || !fechaEntrega || isNaN(progreso)) {
    alert("Por favor completá todos los campos.");
    return;
  }

  if (progreso < 0 || progreso > 100) {
    alert("El progreso debe estar entre 0 y 100.");
    return;
  }

  let proyectos = cargarProyectos();

  if (idEditando !== null) {
    // Modo edición — actualizamos el proyecto existente
    proyectos = proyectos.map(p => {
      if (p.id === idEditando) {
        return { ...p, nombre, cliente, responsable, estado, progreso, fechaEntrega };
      }
      return p;
    });
  } else {
    // Modo creación — agregamos uno nuevo
    const nuevoProyecto = {
      id: Date.now(),
      nombre, cliente, responsable, estado, progreso, fechaEntrega,
    };
    proyectos.push(nuevoProyecto);
  }

  guardarProyectos(proyectos);
  actualizarResumen(proyectos);
  renderizarProyectos(proyectos);
  actualizarGrafico(proyectos);
  actualizarResponsables(proyectos);
  cerrarFormulario();
}

// ================================
// FILTRAR PROYECTOS
// ================================
let filtroActivo = "todos";

function filtrar(estado, boton) {
  filtroActivo = estado;
  document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
  boton.classList.add("activo");
  aplicarFiltroYOrden();
}

// ================================
// BUSCADOR
// ================================
function buscar(texto) {
  aplicarFiltroYOrden();
}

// ================================
// TAREAS
// ================================

function renderizarTareas(proyecto) {
  const lista = document.getElementById(`lista-tareas-${proyecto.id}`);
  if (!lista) return;
  lista.innerHTML = "";

  const tareas = proyecto.tareas || [];

  if (tareas.length === 0) {
    lista.innerHTML = `<li class="sin-tareas">No hay tareas todavía.</li>`;
    return;
  }

  tareas.forEach(tarea => {
    const li = document.createElement("li");
    li.classList.add("tarea-item");
    if (tarea.hecha) li.classList.add("hecha");
    li.innerHTML = `
      <label class="tarea-label">
        <input type="checkbox" ${tarea.hecha ? "checked" : ""} onchange="toggleTarea(${proyecto.id}, ${tarea.id})" />
        <span>${tarea.texto}</span>
      </label>
      <button class="btn-eliminar-tarea" onclick="eliminarTarea(${proyecto.id}, ${tarea.id})">✕</button>
    `;
    lista.appendChild(li);
  });
}

function toggleTareas(proyectoId) {
  const panel = document.getElementById(`tareas-${proyectoId}`);
  const btn = panel.previousElementSibling.querySelector(".btn-tareas");
  const abierto = !panel.classList.contains("oculto");
  panel.classList.toggle("oculto");
  btn.textContent = abierto
    ? `▶ Ver tareas (${btn.textContent.match(/\d+/)[0]})`
    : `▼ Ocultar tareas (${btn.textContent.match(/\d+/)[0]})`;
}

function toggleTarea(proyectoId, tareaId) {
  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return;
  const tarea = proyecto.tareas.find(t => t.id === tareaId);
  if (tarea) tarea.hecha = !tarea.hecha;
  guardarProyectos(proyectos);
  renderizarTareas(proyecto);
}

function agregarTarea(proyectoId) {
  const input = document.getElementById(`input-tarea-${proyectoId}`);
  const texto = input.value.trim();
  if (!texto) return;

  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return;
  if (!proyecto.tareas) proyecto.tareas = [];

  proyecto.tareas.push({
    id: Date.now(),
    texto,
    hecha: false,
  });

  guardarProyectos(proyectos);
  input.value = "";
  renderizarTareas(proyecto);

  // Actualizar contador del botón
  const btn = document.querySelector(`#tareas-${proyectoId}`).previousElementSibling.querySelector(".btn-tareas");
  btn.textContent = `▼ Ocultar tareas (${proyecto.tareas.length})`;
}

function eliminarTarea(proyectoId, tareaId) {
  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return;
  proyecto.tareas = proyecto.tareas.filter(t => t.id !== tareaId);
  guardarProyectos(proyectos);
  renderizarTareas(proyecto);

  // Actualizar contador
  const btn = document.querySelector(`#tareas-${proyectoId}`).previousElementSibling.querySelector(".btn-tareas");
  btn.textContent = `▼ Ocultar tareas (${proyecto.tareas.length})`;
}

// ================================
// MODO OSCURO
// ================================
function toggleTema() {
  const oscuro = document.body.classList.toggle("oscuro");
  localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
  document.getElementById("btn-tema").textContent = oscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

function cargarTema() {
  const tema = localStorage.getItem("tema");
  if (tema === "oscuro") {
    document.body.classList.add("oscuro");
    document.getElementById("btn-tema").textContent = "☀️ Modo claro";
  }
}

// Cargar tema al iniciar
cargarTema();

// ================================
// ORDENAR PROYECTOS
// ================================
let ordenActivo = "";

function ordenar(criterio) {
  ordenActivo = criterio;
  aplicarFiltroYOrden();
}

function aplicarFiltroYOrden() {
  let proyectos = cargarProyectos();
  const textoBusqueda = document.getElementById("buscador").value.toLowerCase();

  // Aplicar filtro de estado
  if (filtroActivo !== "todos") {
    proyectos = proyectos.filter(p => p.estado === filtroActivo);
  }

  // Aplicar búsqueda
  if (textoBusqueda) {
    proyectos = proyectos.filter(p =>
      p.nombre.toLowerCase().includes(textoBusqueda) ||
      p.cliente.toLowerCase().includes(textoBusqueda)
    );
  }

  // Aplicar orden
  if (ordenActivo === "nombre") {
    proyectos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (ordenActivo === "fecha-asc") {
    proyectos.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
  } else if (ordenActivo === "fecha-desc") {
    proyectos.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega));
  } else if (ordenActivo === "progreso-asc") {
    proyectos.sort((a, b) => a.progreso - b.progreso);
  } else if (ordenActivo === "progreso-desc") {
    proyectos.sort((a, b) => b.progreso - a.progreso);
  }

  renderizarProyectos(proyectos);
}

// ================================
// GRÁFICO DE PROGRESO
// ================================
let instanciaGrafico = null;

function actualizarGrafico(proyectos) {
  const enCurso = proyectos.filter(p => p.estado === "en-curso").length;
  const enRiesgo = proyectos.filter(p => p.estado === "en-riesgo").length;
  const completados = proyectos.filter(p => p.estado === "completado").length;
  const promedio = proyectos.length
    ? Math.round(proyectos.reduce((acc, p) => acc + p.progreso, 0) / proyectos.length)
    : 0;

  // Actualizar leyenda
  document.getElementById("leyenda-en-curso").textContent = enCurso;
  document.getElementById("leyenda-en-riesgo").textContent = enRiesgo;
  document.getElementById("leyenda-completados").textContent = completados;
  document.getElementById("leyenda-promedio").textContent = promedio + "%";

  const ctx = document.getElementById("miGrafico").getContext("2d");
  const datos = [enCurso, enRiesgo, completados];
  const total = datos.reduce((a, b) => a + b, 0);

  // Si ya existe el gráfico lo destruimos antes de recrear
  if (instanciaGrafico) instanciaGrafico.destroy();

  instanciaGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["En curso", "En riesgo", "Completado"],
      datasets: [{
        data: total > 0 ? datos : [1, 0, 0],
        backgroundColor: ["#2563eb", "#f59e0b", "#10b981"],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: total > 0 },
      },
      animation: { animateRotate: true, duration: 600 },
    }
  });
}

// ================================
// EXPORTAR A PDF
// ================================
async function exportarPDF() {
  const btn = document.getElementById("btn-exportar");
  btn.textContent = "⏳ Generando...";
  btn.disabled = true;

  // Ocultamos botones de acción para que no aparezcan en el PDF
  const botonesAccion = document.querySelectorAll(".btn-editar, .btn-eliminar, .btn-tareas, .tareas-panel, #btn-nuevo, #ordenar-container, #buscador-container, #filtros, #header-botones");
  botonesAccion.forEach(el => el.style.display = "none");

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const anchoPDF = 210;
    const margenes = 10;
    const anchoUtil = anchoPDF - margenes * 2;

    // Título del reporte
    const hoy = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, 210, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Gestión de Proyectos", margenes, 12);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Reporte generado el ${hoy}`, margenes, 20);

    let y = 36;

    // Capturamos el resumen de estadísticas
    const seccionResumen = document.getElementById("resumen");
    const canvasResumen = await html2canvas(seccionResumen, { scale: 2, backgroundColor: null });
    const imgResumen = canvasResumen.toDataURL("image/png");
    const altoResumen = (canvasResumen.height * anchoUtil) / canvasResumen.width;
    pdf.addImage(imgResumen, "PNG", margenes, y, anchoUtil, altoResumen);
    y += altoResumen + 6;

    // Capturamos el gráfico
    const seccionGrafico = document.getElementById("seccion-grafico");
    const canvasGrafico = await html2canvas(seccionGrafico, { scale: 2, backgroundColor: null });
    const imgGrafico = canvasGrafico.toDataURL("image/png");
    const altoGrafico = (canvasGrafico.height * anchoUtil) / canvasGrafico.width;
    pdf.addImage(imgGrafico, "PNG", margenes, y, anchoUtil, altoGrafico);
    y += altoGrafico + 6;

    // Capturamos cada proyecto individualmente
    const tarjetas = document.querySelectorAll(".proyecto");
    for (const tarjeta of tarjetas) {
      const canvas = await html2canvas(tarjeta, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const alto = (canvas.height * anchoUtil) / canvas.width;

      // Si no cabe en la página actual, añadimos una nueva
      if (y + alto > 285) {
        pdf.addPage();
        y = 10;
      }

      pdf.addImage(img, "PNG", margenes, y, anchoUtil, alto);
      y += alto + 4;
    }

    pdf.save("reporte-proyectos.pdf");

  } catch (err) {
    alert("Hubo un error al generar el PDF. Intentá de nuevo.");
    console.error(err);
  }

  // Restauramos los botones ocultos
  botonesAccion.forEach(el => el.style.display = "");
  btn.textContent = "🖨️ Exportar PDF";
  btn.disabled = false;
}

// ================================
// VISTA KANBAN
// ================================
let vistaActual = "lista";

function cambiarVista(vista) {
  vistaActual = vista;

  const listaEl = document.getElementById("lista-proyectos");
  const kanbanEl = document.getElementById("kanban-board");
  const filtrosEl = document.getElementById("filtros");
  const btnLista = document.getElementById("btn-lista");
  const btnKanban = document.getElementById("btn-kanban");

  if (vista === "kanban") {
    listaEl.classList.add("oculto");
    kanbanEl.classList.remove("oculto");
    filtrosEl.style.display = "none";
    btnLista.classList.remove("activo");
    btnKanban.classList.add("activo");
    renderizarKanban();
  } else {
    listaEl.classList.remove("oculto");
    kanbanEl.classList.add("oculto");
    filtrosEl.style.display = "";
    btnLista.classList.add("activo");
    btnKanban.classList.remove("activo");
  }
}

function renderizarKanban() {
  const proyectos = cargarProyectos();
  const columnas = {
    "en-curso":   { items: document.getElementById("items-en-curso"),   count: document.getElementById("count-en-curso") },
    "en-riesgo":  { items: document.getElementById("items-en-riesgo"),  count: document.getElementById("count-en-riesgo") },
    "completado": { items: document.getElementById("items-completado"), count: document.getElementById("count-completado") },
  };

  // Limpiar columnas
  Object.values(columnas).forEach(col => col.items.innerHTML = "");

  proyectos.forEach(proyecto => {
    const col = columnas[proyecto.estado];
    if (!col) return;

    // Calcular alerta
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const entrega = new Date(proyecto.fechaEntrega);
    const diasRestantes = Math.ceil((entrega - hoy) / (1000*60*60*24));
    let alertaHTML = "";
    if (proyecto.estado !== "completado") {
      if (diasRestantes < 0) alertaHTML = `<span class=\"kanban-alerta vencido\">⚠️ Vencido</span>`;
      else if (diasRestantes <= 7) alertaHTML = `<span class=\"kanban-alerta proximo\">⏰ ${diasRestantes}d</span>`;
    }

    const tareasTotales = (proyecto.tareas || []).length;
    const tareasHechas = (proyecto.tareas || []).filter(t => t.hecha).length;

    const card = document.createElement("div");
    card.classList.add("kanban-card");
    card.innerHTML = `
      <div class=\"kanban-card-header\">
        <p class=\"kanban-nombre\">${proyecto.nombre}</p>
        ${alertaHTML}
      </div>
      <p class=\"kanban-cliente\">${proyecto.cliente}</p>
      <p class=\"kanban-responsable\">👤 ${proyecto.responsable}</p>
      <div class=\"kanban-progreso\">
        <div class=\"barra-fondo\">
          <div class=\"barra-fill\" style=\"width:${proyecto.progreso}%\"></div>
        </div>
        <span>${proyecto.progreso}%</span>
      </div>
      ${tareasTotales > 0 ? `<p class=\"kanban-tareas\">✅ ${tareasHechas}/${tareasTotales} tareas</p>` : ""}
      <div class=\"kanban-acciones\">
        <button class=\"btn-editar\" onclick=\"abrirEdicion(${proyecto.id}); cambiarVista('lista')\">Editar</button>
        <button class=\"btn-eliminar\" onclick=\"eliminarDesdeKanban(${proyecto.id})\">Eliminar</button>
      </div>
    `;
    col.items.appendChild(card);
  });

  // Actualizar contadores
  Object.entries(columnas).forEach(([estado, col]) => {
    col.count.textContent = proyectos.filter(p => p.estado === estado).length;
  });
}

function eliminarDesdeKanban(id) {
  const confirmar = confirm("¿Estás seguro que querés eliminar este proyecto?");
  if (!confirmar) return;
  let proyectos = cargarProyectos();
  proyectos = proyectos.filter(p => p.id !== id);
  guardarProyectos(proyectos);
  actualizarResumen(proyectos);
  actualizarGrafico(proyectos);
  renderizarKanban();
}

// ================================
// COMENTARIOS
// ================================
function renderizarComentarios(proyecto) {
  const lista = document.getElementById(`lista-comentarios-${proyecto.id}`);
  if (!lista) return;
  lista.innerHTML = "";

  const comentarios = proyecto.comentarios || [];

  if (comentarios.length === 0) {
    lista.innerHTML = `<li class="sin-comentarios">No hay comentarios todavía.</li>`;
    return;
  }

  comentarios.forEach(c => {
    const li = document.createElement("li");
    li.classList.add("comentario-item");
    li.innerHTML = `
      <div class="comentario-header">
        <span class="comentario-autor">${c.autor}</span>
        <span class="comentario-fecha">${c.fecha}</span>
        <button class="btn-eliminar-comentario" onclick="eliminarComentario(${proyecto.id}, ${c.id})">✕</button>
      </div>
      <p class="comentario-texto">${c.texto}</p>
    `;
    lista.appendChild(li);
  });
}

function toggleComentarios(proyectoId) {
  const panel = document.getElementById(`comentarios-${proyectoId}`);
  const btn = panel.previousElementSibling.querySelector(".btn-comentarios");
  const abierto = !panel.classList.contains("oculto");
  panel.classList.toggle("oculto");
  const total = btn.textContent.match(/\d+/)[0];
  btn.textContent = abierto
    ? `💬 Comentarios (${total})`
    : `💬 Ocultar comentarios (${total})`;
}

function agregarComentario(proyectoId) {
  const inputAutor = document.getElementById(`input-autor-${proyectoId}`);
  const inputTexto = document.getElementById(`input-comentario-${proyectoId}`);
  const autor = inputAutor.value.trim();
  const texto = inputTexto.value.trim();

  if (!autor || !texto) {
    alert("Por favor escribí tu nombre y el comentario.");
    return;
  }

  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return;
  if (!proyecto.comentarios) proyecto.comentarios = [];

  const fecha = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  proyecto.comentarios.push({
    id: Date.now(),
    autor,
    texto,
    fecha,
  });

  guardarProyectos(proyectos);
  inputTexto.value = "";

  // Actualizar contador del botón
  const btn = document.querySelector(`#comentarios-${proyectoId}`).previousElementSibling.querySelector(".btn-comentarios");
  btn.textContent = `💬 Ocultar comentarios (${proyecto.comentarios.length})`;

  renderizarComentarios(proyecto);
}

function eliminarComentario(proyectoId, comentarioId) {
  const proyectos = cargarProyectos();
  const proyecto = proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return;
  proyecto.comentarios = proyecto.comentarios.filter(c => c.id !== comentarioId);
  guardarProyectos(proyectos);

  // Actualizar contador
  const btn = document.querySelector(`#comentarios-${proyectoId}`).previousElementSibling.querySelector(".btn-comentarios");
  btn.textContent = `💬 Ocultar comentarios (${proyecto.comentarios.length})`;

  renderizarComentarios(proyecto);
}

// ================================
// ESTADÍSTICAS POR RESPONSABLE
// ================================
function actualizarResponsables(proyectos) {
  const contenedor = document.getElementById("lista-responsables");
  if (!contenedor) return;

  // Agrupar por responsable
  const mapa = {};
  proyectos.forEach(p => {
    if (!mapa[p.responsable]) {
      mapa[p.responsable] = {
        nombre: p.responsable,
        proyectos: [],
      };
    }
    mapa[p.responsable].proyectos.push(p);
  });

  const responsables = Object.values(mapa);

  if (responsables.length === 0) {
    contenedor.innerHTML = `<p class="sin-responsables">No hay proyectos todavía.</p>`;
    return;
  }

  // Ordenar por cantidad de proyectos (mayor primero)
  responsables.sort((a, b) => b.proyectos.length - a.proyectos.length);

  contenedor.innerHTML = "";

  responsables.forEach((r, idx) => {
    const total = r.proyectos.length;
    const enCurso = r.proyectos.filter(p => p.estado === "en-curso").length;
    const enRiesgo = r.proyectos.filter(p => p.estado === "en-riesgo").length;
    const completados = r.proyectos.filter(p => p.estado === "completado").length;
    const promedio = Math.round(r.proyectos.reduce((acc, p) => acc + p.progreso, 0) / total);
    const tareasPendientes = r.proyectos.reduce((acc, p) => {
      return acc + (p.tareas || []).filter(t => !t.hecha).length;
    }, 0);

    // Color de avatar según índice
    const colores = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#ef4444"];
    const color = colores[idx % colores.length];
    const iniciales = r.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const div = document.createElement("div");
    div.classList.add("responsable-card");
    div.innerHTML = `
      <div class="responsable-avatar" style="background-color:${color}">${iniciales}</div>
      <div class="responsable-info">
        <p class="responsable-nombre">${r.nombre}</p>
        <div class="responsable-tags">
          ${enCurso > 0 ? `<span class="rtag en-curso">${enCurso} en curso</span>` : ""}
          ${enRiesgo > 0 ? `<span class="rtag en-riesgo">${enRiesgo} en riesgo</span>` : ""}
          ${completados > 0 ? `<span class="rtag completado">${completados} completado</span>` : ""}
        </div>
      </div>
      <div class="responsable-stats">
        <div class="rstat">
          <span class="rstat-valor">${total}</span>
          <span class="rstat-label">proyectos</span>
        </div>
        <div class="rstat">
          <span class="rstat-valor">${promedio}%</span>
          <span class="rstat-label">promedio</span>
        </div>
        <div class="rstat">
          <span class="rstat-valor ${tareasPendientes > 0 ? 'pendiente' : ''}">${tareasPendientes}</span>
          <span class="rstat-label">tareas pend.</span>
        </div>
      </div>
      <div class="responsable-barra">
        <div class="barra-fondo">
          <div class="barra-fill" style="width:${promedio}%; background-color:${color}"></div>
        </div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}

// ================================
// VISTA CALENDARIO
// ================================
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

const meses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

function cambiarMes(direccion) {
  mesActual += direccion;
  if (mesActual > 11) { mesActual = 0; anioActual++; }
  if (mesActual < 0)  { mesActual = 11; anioActual--; }
  renderizarCalendario();
}

function renderizarCalendario() {
  const proyectos = cargarProyectos();
  const grid = document.getElementById("calendario-grid");
  const titulo = document.getElementById("calendario-titulo");
  grid.innerHTML = "";

  titulo.textContent = `${meses[mesActual]} ${anioActual}`;

  // Primer día del mes y total de días
  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const hoy = new Date();

  // Celdas vacías antes del primer día
  for (let i = 0; i < primerDia; i++) {
    const vacia = document.createElement("div");
    vacia.classList.add("cal-dia", "vacio");
    grid.appendChild(vacia);
  }

  // Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const celda = document.createElement("div");
    celda.classList.add("cal-dia");

    // Marcar hoy
    const esHoy = hoy.getDate() === dia &&
                  hoy.getMonth() === mesActual &&
                  hoy.getFullYear() === anioActual;
    if (esHoy) celda.classList.add("hoy");

    // Buscar proyectos que vencen este día
    const fechaDia = `${anioActual}-${String(mesActual + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
    const proyectosDia = proyectos.filter(p => p.fechaEntrega === fechaDia);

    celda.innerHTML = `<span class="cal-numero">${dia}</span>`;

    proyectosDia.forEach(p => {
      const etiqueta = document.createElement("div");
      etiqueta.classList.add("cal-evento", p.estado);
      etiqueta.textContent = p.nombre.length > 18 ? p.nombre.slice(0, 18) + "…" : p.nombre;
      etiqueta.title = `${p.nombre} — ${p.cliente}`;
      celda.appendChild(etiqueta);
    });

    grid.appendChild(celda);
  }
}

// Actualizamos cambiarVista para incluir calendario
const _cambiarVistaOriginal = cambiarVista;
function cambiarVista(vista) {
  const calendarioEl = document.getElementById("calendario-board");
  const btnCalendario = document.getElementById("btn-calendario");
  const filtrosEl = document.getElementById("filtros");

  if (vista === "calendario") {
    document.getElementById("lista-proyectos").classList.add("oculto");
    document.getElementById("kanban-board").classList.add("oculto");
    calendarioEl.classList.remove("oculto");
    filtrosEl.style.display = "none";
    document.querySelectorAll(".btn-vista").forEach(b => b.classList.remove("activo"));
    btnCalendario.classList.add("activo");
    renderizarCalendario();
  } else {
    calendarioEl.classList.add("oculto");
    _cambiarVistaOriginal(vista);
  }
}