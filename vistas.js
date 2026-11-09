/* =========================================================
   FERRETERÍA — Panel · Vistas
   ========================================================= */
const VIEWS = {}; let VISTA = "inicio";
const TODOS = ["Administración", "Ventas"];
const NAV = [
  ["inicio", "home", "Inicio", TODOS], ["pedidos", "bell", "Pedidos web", TODOS], ["venta", "pos", "Venta en tienda", TODOS],
  ["productos", "box", "Productos y stock", TODOS], ["categorias", "grid", "Categorías", ["Administración"]], ["caja", "cash", "Caja", TODOS],
  ["clientes", "users", "Clientes", TODOS], ["mensajes", "msg", "Mensajes", TODOS], ["reportes", "chart", "Reportes", ["Administración"]], ["ajustes", "gear", "Ajustes de la web", ["Administración"]]
];
const puede = v => (NAV.find(n => n[0] === v) || [, , , []])[3].includes(YO().rol);
const ICONOS_CAT = ["wrench", "drill", "brick", "roller", "pipe", "bolt", "helmet", "screw", "garden", "lock", "bulb", "ladder", "box", "ruler"];
const IC_CAT = { wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>', drill: '<path d="M3 6h11v6H3zM14 7h4l3 2-3 2h-4M6 12l-1 9h4l1-9"/>', brick: '<path d="M3 5h18v14H3zM3 10h18M3 15h18M9 5v5M15 10v5M9 15v4"/>', roller: '<rect x="3" y="3" width="15" height="6" rx="1"/><path d="M18 6h3v5h-9v3M11 14h2v7h-2z"/>', pipe: '<path d="M3 9h7a3 3 0 0 1 3 3v9M3 15h4a1 1 0 0 1 1 1v5M17 3v6M14 3h6"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', helmet: '<path d="M4 16a8 8 0 0 1 16 0M2 16h20v3H2zM10 8V5h4v3"/>', screw: '<path d="M9 3h6l-1 4h-4zM10 7h4v3l-4 2v2l4 2v2l-2 3-2-3"/>', garden: '<path d="M12 22V12M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>', ladder: '<path d="M7 2v20M17 2v20M7 6h10M7 11h10M7 16h10"/>', box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>', ruler: '<path d="M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2"/>' };
const icCat = k => `<svg class="ic" viewBox="0 0 24 24">${IC_CAT[k] || IC_CAT.box}</svg>`;
const pedTxt = p => (p.items || []).map(i => `${i.cant}× ${i.n}`).join(", ");

/* ================= Sesión ================= */
function pantallaLogin() {
  document.body.innerHTML = `<main class="login"><form class="l-box" id="lf"><div class="l-logo">${ico("tool")}</div><h1>Panel · Ferretería</h1><p>Entra con el correo de tu equipo.</p>
    ${DEMO ? `<div class="demo-n"><b>MODO DEMO</b> · elige con qué rol probar:</div>${fld("rol", "Entrar como", APP.equipo[0].email, { opts: APP.equipo.map(p => [p.email, `${p.nombre} · ${p.rol}`]) })}`
      : `${fld("email", "Correo", "", { type: "email", req: true, extra: 'autocomplete="username"' })}${fld("pass", "Contraseña", "", { type: "password", req: true, extra: 'autocomplete="current-password"' })}`}
    <p class="l-err" id="lErr" role="alert"></p><button class="btn btn-pri btn-lg">Entrar</button></form></main>`;
  $("#lf").addEventListener("submit", async e => {
    e.preventDefault(); const d = datosForm(e.currentTarget), err = $("#lErr");
    if (DEMO) { sessionStorage.setItem("fr_admin", d.rol); return iniciar(perfil(d.rol)); }
    try { const { au, auth } = await fb(); await au.signInWithEmailAndPassword(auth, d.email, d.pass); }
    catch (er) { err.textContent = /invalid|wrong|user-not-found/i.test(er.code || "") ? "Correo o contraseña incorrectos." : "No se pudo entrar: " + (er.code || er.message); }
  });
}
async function salir() { if (DEMO) sessionStorage.removeItem("fr_admin"); else { const { au, auth } = await fb(); await au.signOut(auth); } location.reload(); }
async function arrancar() {
  if (DEMO) { const e = sessionStorage.getItem("fr_admin"); return e && perfil(e) ? iniciar(perfil(e)) : pantallaLogin(); }
  const { au, auth } = await fb();
  au.onAuthStateChanged(auth, u => { if (!u) return pantallaLogin(); const p = perfil(u.email); if (!p) { document.body.innerHTML = `<main class="login"><div class="l-box"><h1>Sin permiso</h1><p>${esc(u.email)} no está en el equipo (firebase-config.js → equipo).</p><button class="btn btn-pri" onclick="salir()">Salir</button></div></main>`; return; } iniciar(p); });
}
async function iniciar(p) {
  USER = p; await cargarCatalogo();
  if (!CAT.prods.length && esAdm() && !DEMO) VISTA = "ajustes";
  const nav = NAV.filter(n => n[3].includes(p.rol));
  document.body.innerHTML = `<div class="shell"><aside class="side" id="side"><div class="s-brand">${ico("tool")}<div><b></b><small>Panel</small></div></div>
      <nav class="s-nav">${nav.map(([k, i, t]) => `<button data-v="${k}">${ico(i)}<span>${t}</span><b class="cnt" id="cnt-${k}" hidden></b></button>`).join("")}</nav>
      <div class="s-user"><small>Sesión</small><b>${esc(p.nombre)}</b><span class="st mute">${esc(p.rol)}</span>${DEMO ? `<span class="st warn">MODO DEMO</span>` : ""}<button class="btn btn-light btn-sm" id="salir">${ico("logout")} Salir</button></div></aside>
    <div class="main"><header class="tb"><button class="tb-m" id="menuB" aria-label="Menú">${ico("menu")}</button><span class="tb-f">${fmtF(HOY(), { weekday: "long", day: "numeric", month: "long" })}</span>
      <button class="btn btn-pri btn-sm" data-go="venta">${ico("pos")} <span>Nueva venta</span></button></header>
      <main id="view" class="view" tabindex="-1"></main></div></div>`;
  marcaPanel();
  $(".s-nav").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) go(b.dataset.v); });
  $("#salir").addEventListener("click", salir); $("#menuB").addEventListener("click", () => $("#side").classList.toggle("open"));
  document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) go(g.dataset.go); });
  go(puede(VISTA) ? VISTA : nav[0][0]); vigilar(); setInterval(vigilar, 20000);
}
async function go(v) {
  VISTA = v; $$(".s-nav button").forEach(b => b.setAttribute("aria-current", b.dataset.v === v ? "page" : "false")); $("#side")?.classList.remove("open");
  $("#view").innerHTML = `<div class="loading"><span class="spin"></span></div>`;
  try { await VIEWS[v](); if (!CAT.prods.length && esAdm() && v !== "ajustes") $("#view").insertAdjacentHTML("afterbegin", `<div class="alert warn">${ico("alert")} <span><b>Tu tienda aún no tiene productos guardados.</b> Ve a Ajustes y pulsa «Cargar ejemplos» para empezar a editarlos.</span><button class="btn btn-pri btn-sm" data-go="ajustes">Ir a Ajustes</button></div>`); }
  catch (e) { console.error(e); $("#view").innerHTML = `<div class="empty">${ico("alert")}<p>No se pudo cargar: ${esc(e.message)}</p></div>`; }
}
const refrescar = () => go(VISTA);
let ULT = null;
async function vigilar() {
  try {
    const [peds, msgs] = await Promise.all([DB.list("pedidos", ["estado", "in", ["por-validar", "nuevo"]]), DB.list("mensajes", ["estado", "==", "nuevo"])]);
    const n = peds.length, b = $("#cnt-pedidos"), m = $("#cnt-mensajes");
    if (b) { b.textContent = n; b.hidden = !n; } if (m) { m.textContent = msgs.length; m.hidden = !msgs.length; }
    if (ULT !== null && n > ULT) { beep(); toast(`🔔 ${n - ULT} pedido(s) nuevo(s) desde la web`); if (VISTA === "pedidos" || VISTA === "inicio") VIEWS[VISTA](); }
    ULT = n;
  } catch (e) { console.warn("vigilar:", e.message); }
}

/* ================= Utilidades de stock y caja ================= */
function movimiento(m) { return { op: "set", col: "movimientos", id: codigo("MV"), data: { fecha: HOY(), hora: new Date().toISOString(), usuario: YO().nombre, ...m, monto: r2(m.monto) } }; }
async function opsStock(items, signo) {   // signo -1 descuenta, +1 devuelve
  await cargarCatalogo(); const ops = [];
  (items || []).forEach(i => { const p = prodDe(i.id); if (!p || p.stock == null || p.stock === "") return; p.stock = Math.max(0, (+p.stock || 0) + signo * i.cant); ops.push({ op: "set", col: "productos", id: p.id, data: { stock: p.stock } }); });
  return ops;
}
const stockBajo = () => CAT.prods.filter(p => p.activo !== false && p.stock != null && p.stock !== "" && +p.stock <= (+CAT.aj.stockMinimo || 5));

/* ================= INICIO ================= */
VIEWS.inicio = async () => {
  await cargarCatalogo();
  const hoy = HOY(), [peds, movs, msgs] = await Promise.all([DB.list("pedidos", ["creado", ">=", addD(hoy, -30)]), DB.list("movimientos", ["fecha", "==", hoy]), DB.list("mensajes", ["estado", "==", "nuevo"])]);
  const act = peds.filter(p => ["por-validar", "nuevo", "preparando", "enviado"].includes(p.estado)), ventasHoy = movs.reduce((a, m) => a + m.monto, 0), bajos = stockBajo();
  const K = [["Caja de hoy", S(ventasHoy), `${movs.length} movimiento(s)`], ["Pagos por validar", act.filter(p => p.estado === "por-validar").length, "pedidos web con captura"], ["Por preparar o enviar", act.filter(p => p.estado !== "por-validar").length, "pedidos en curso"], ["Stock bajo", bajos.length, `${bajos.filter(p => +p.stock <= 0).length} agotado(s)`]];
  $("#view").innerHTML = topBar(`Hola, ${esc(YO().nombre)}`, "Así va tu ferretería hoy.") + `
    <div class="kpis">${K.map(([a, b, c]) => `<div class="kpi"><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join("")}</div>
    <div class="two"><section class="card"><div class="card-h"><h2>${ico("bell")} Pedidos en curso</h2><button class="btn btn-light btn-sm" data-go="pedidos">Ver todos</button></div>
      <ul class="lst">${act.sort((a, b) => String(a.creado).localeCompare(b.creado)).slice(0, 8).map(p => `<li><div><b>${esc(p.nombre)} · ${S(p.total)}</b><small>${esc(p.codigo || p.id)} · ${hace(p.creado)} · ${esc(pedTxt(p)).slice(0, 70)}</small></div>${estP(p.estado, p)}</li>`).join("") || `<li class="muted">No hay pedidos pendientes.</li>`}</ul></section>
    <section class="card"><div class="card-h"><h2>${ico("alert")} Stock bajo</h2><button class="btn btn-light btn-sm" data-go="productos">Productos</button></div>
      <ul class="lst">${bajos.slice(0, 8).map(p => `<li><div><b>${esc(p.nombre)}</b><small>${esc(catDe(p.cat).nombre || "")}</small></div><span class="st ${+p.stock <= 0 ? "bad" : "warn"}">${+p.stock <= 0 ? "Agotado" : `Quedan ${p.stock}`}</span></li>`).join("") || `<li class="muted">Todo con stock suficiente. 👍</li>`}</ul></section></div>
    ${msgs.length ? `<div class="alert warn">${ico("msg")} <span>Tienes <b>${msgs.length}</b> mensaje(s) o cotización(es) sin responder.</span><button class="btn btn-sm btn-light" data-go="mensajes">Ver</button></div>` : ""}`;
};

/* ================= PEDIDOS WEB ================= */
let PT = "pendientes";
VIEWS.pedidos = async () => {
  const todos = (await DB.list("pedidos")).filter(p => p.origen !== "tienda").sort((a, b) => String(b.creado).localeCompare(a.creado));
  const TABS = [["pendientes", "Por atender", p => ["por-validar", "nuevo"].includes(p.estado)], ["curso", "Preparando / en camino", p => ["preparando", "enviado"].includes(p.estado)], ["hist", "Entregados y anulados", p => ["entregado", "anulado", "rechazado"].includes(p.estado)]];
  const tab = TABS.find(t => t[0] === PT), l = todos.filter(tab[2]).slice(0, PT === "hist" ? 80 : 200);
  const ops = {}; todos.forEach(p => { if (p.operacion) ops[p.operacion] = (ops[p.operacion] || 0) + 1; });
  $("#view").innerHTML = topBar("Pedidos web", "Pedidos hechos desde la tienda online. Suena cuando llega uno nuevo.", `<div class="seg">${TABS.map(([k, t, f]) => `<button class="${k === PT ? "on" : ""}" data-pt="${k}">${t} (${todos.filter(f).length})</button>`).join("")}</div>`) +
    (PT === "pendientes" && l.some(p => p.estado === "por-validar") ? `<div class="alert warn">${ico("alert")} <span>Antes de validar un pago, <b>confirma en tu app de Yape/Plin o en tu banca que el dinero llegó</b>. Una captura se puede editar.</span></div>` : "") +
    `<div class="peds">${l.map(p => { const al = [];
      if (p.estado === "por-validar") { if (p.montoLeido == null) al.push(["warn", "No se pudo leer el monto de la captura."]); else if (p.coincide === false) al.push(["bad", `La captura dice ${S(p.montoLeido)} y el total es ${S(p.total)}.`]); if (p.fechaOk === false) al.push(["bad", "La fecha de la captura no es de hoy."]); if (p.operacion && ops[p.operacion] > 1) al.push(["bad", "Número de operación repetido en otro pedido."]); }
      return `<article class="card ped ${esc(p.estado)}"><div class="ped-i">${ico(p.entrega === "recojo" ? "store" : "truck")}</div><div class="ped-b">
        <div class="ped-h"><b>${esc(p.nombre)}</b><span class="mono">${esc(p.codigo || p.id)}</span><span class="muted">${hace(p.creado)}</span>${estP(p.estado, p)}</div>
        <p>${(p.items || []).map(i => `<span class="it">${i.cant}× ${esc(i.n)}</span>`).join("")}</p>
        <p><b>${S(p.total)}</b>${p.envio ? ` <span class="muted">(incl. envío ${S(p.envio)})</span>` : ""} · ${esc(p.pago)}${p.banco ? " " + esc(p.banco) : ""}${p.operacion ? ` · op. ${esc(p.operacion)}` : ""}${p.pagado ? ` · <span class="st ok">Pagado</span>` : ""}${p.boleta ? ` · <span class="st ok">🧾 ${esc(p.boleta)}</span>` : ""}</p>
        <p class="muted">${p.entrega === "domicilio" ? `🚚 ${esc(p.zona || "")} · ${esc(p.direccion || "")}${p.referencia ? " · " + esc(p.referencia) : ""}` : "🏪 Recoge en tienda"} · 📱 ${esc(p.celular)} · ${esc(p.comprobante || "")}${p.doc ? " " + esc(p.doc) : ""}</p>
        ${al.map(([c, t]) => `<div class="alert ${c} sm">${ico("alert")} ${t}</div>`).join("")}
        <div class="acts-g">${accionesPedido(p)}<button class="btn btn-light btn-sm" data-pa="pdf|${esc(p.id)}">${ico("file")} Recibo</button><button class="btn btn-light btn-sm" data-pa="boleta|${esc(p.id)}">🧾 ${p.boleta ? "Editar N° " + esc(p.comprobante || "boleta") : "N° de " + esc(p.comprobante || "boleta")}</button><button class="btn btn-wa btn-sm" data-pa="wa|${esc(p.id)}">${ico("wa")}</button></div></div></article>`; }).join("") || vacio("No hay pedidos aquí.")}</div>`;
  $("#view").onclick = async e => {
    const t = e.target.closest("[data-pt]"); if (t) { PT = t.dataset.pt; return VIEWS.pedidos(); }
    const b = e.target.closest("[data-pa]"); if (!b) return; const [a, id] = b.dataset.pa.split("|"), p = todos.find(x => x.id === id); if (p) accionPedido(a, p);
  };
};
function accionesPedido(p) {
  const B = (a, t, c = "btn-light") => `<button class="btn ${c} btn-sm" data-pa="${a}|${esc(p.id)}">${t}</button>`;
  return { "por-validar": B("validar", `${ico("check")} Ver captura y validar`, "btn-pri") + B("rechazar", "Rechazar"),
    nuevo: B("preparar", `${ico("box")} Preparar pedido`, "btn-pri") + B("anular", "Anular"),
    preparando: B("enviar", p.entrega === "recojo" ? `${ico("store")} Listo para recoger` : `${ico("truck")} Enviar`, "btn-pri") + B("anular", "Anular"),
    enviado: B("entregar", `${ico("check")} Entregado`, "btn-pri") + B("anular", "Anular") }[p.estado] || "";
}
const msgCliente = (p, t) => `Hola ${String(p.nombre || "").split(" ")[0]} 👋 te escribe *${NOMBRE()}*.\n\n${t}\n\n🧾 Pedido *${p.codigo || p.id}* · ${S(p.total)}\nSigue tu pedido aquí: ${linkPedido(p.codigo || p.id)}`;
async function accionPedido(a, p) {
  const id = p.id, upd = data => ({ op: "set", col: "pedidos", id, data: { ...data, actualizado: new Date().toISOString(), por: YO().nombre } }), fin = async (ops, msg, wa) => { await DB.batch(ops); toast(msg); if (wa) abrirWA(p.celular, wa); vigilar(); refrescar(); };
  if (a === "pdf") return pdfNota(p);
  if (a === "boleta") return modal(`${p.comprobante || "Boleta"} electrónica · ${p.codigo || id}`, `<p class="muted">Cuando emitas la ${esc((p.comprobante || "boleta").toLowerCase())} en SUNAT (o en tu sistema de facturación), escribe aquí su número. El cliente lo verá en su recibo y en «Mis compras».</p>
      <div class="g2">${fld("comprobante", "Tipo", p.comprobante || "Boleta", { opts: ["Boleta", "Factura"] })}${fld("boleta", "Número (serie-correlativo)", p.boleta || "", { ph: "Ej. B001-000123" })}</div>`, async d =>
    fin([upd({ comprobante: d.comprobante, boleta: String(d.boleta || "").trim().toUpperCase().slice(0, 20) })], d.boleta ? "Número guardado" : "Número borrado"), "Guardar");
  if (a === "wa") return abrirWA(p.celular, msgCliente(p, "Te escribimos sobre tu pedido."));
  if (a === "validar") { const c = await DB.get("capturas", id);
    return modal(`Validar pago · ${p.codigo || id}`, `${c && c.captura ? `<img class="zoom" src="${esc(c.captura)}" alt="Captura del pago">` : `<p class="muted">Sin imagen de captura.</p>`}
      <p>Confirma que llegaron <b>${S(p.total)}</b> por ${esc(p.pago)}${p.banco ? " " + esc(p.banco) : ""}${p.operacion ? ` (op. ${esc(p.operacion)})` : ""}.</p><div class="g2">${fld("monto", "Monto recibido (S/)", p.total, { type: "number", req: true, extra: 'min="0.1" step="0.1"' })}${fld("enviar", "Avisar al cliente por WhatsApp", true, { type: "checkbox" })}</div>`, async d => {
      const ops = [upd({ estado: "nuevo", pagado: r2(d.monto), validado: new Date().toISOString() }), movimiento({ concepto: `Pedido web ${p.codigo || id} · ${p.nombre}`, monto: d.monto, metodo: p.pago === "Transferencia" ? "Transferencia" : p.pago, pedido: id }), { op: "set", col: "capturas", id, data: { captura: "", revisado: true } }];
      await fin(ops, "Pago validado y registrado en caja", d.enviar ? msgCliente(p, `✅ Recibimos tu pago de ${S(d.monto)}. Ya estamos preparando tu pedido.`) : null); }, "Validar pago"); }
  if (a === "rechazar") return modal("Rechazar pago", `${fld("motivo", "Motivo", "No llegó el pago", { full: true, opts: ["No llegó el pago", "El monto no coincide", "La captura no se lee", "La captura es de otro pago"] })}${fld("enviar", "Avisar por WhatsApp", true, { type: "checkbox" })}`, async d =>
    fin([upd({ estado: "rechazado", motivo: d.motivo })], "Pedido rechazado", d.enviar ? msgCliente(p, `No pudimos validar tu pago: ${d.motivo}. Escríbenos por aquí para ayudarte a completarlo.`) : null), "Rechazar");
  if (a === "preparar") { const falta = (p.items || []).filter(i => { const x = prodDe(i.id); return x && x.stock != null && x.stock !== "" && +x.stock < i.cant; });
    if (falta.length && !confirm(`Stock insuficiente: ${falta.map(i => i.n).join(", ")}. ¿Preparar igual?`)) return;
    return fin([upd({ estado: "preparando" }), ...(p.stockDescontado ? [] : [...await opsStock(p.items, -1), upd({ estado: "preparando", stockDescontado: true })])], "Pedido en preparación · stock descontado"); }
  if (a === "enviar") return fin([upd({ estado: "enviado" })], p.entrega === "recojo" ? "Listo para recoger" : "Pedido enviado", msgCliente(p, p.entrega === "recojo" ? `📦 Tu pedido está *listo para recoger* en ${CAT.aj.direccion || "la tienda"}. Horario: ${CAT.aj.horario || ""}.` : "🚚 Tu pedido ya *va en camino*. ¡Pronto llega!"));
  if (a === "entregar") { if (!p.pagado) return modal(`Cobrar · ${p.codigo || id}`, `<p>Total a cobrar <b>${S(p.total)}</b> (${esc(p.pago)}).</p>${fld("metodo", "¿Cómo pagó?", "Efectivo", { opts: METODOS })}`, async d =>
      fin([upd({ estado: "entregado", pagado: p.total, pagoReal: d.metodo }), movimiento({ concepto: `Pedido web ${p.codigo || id} · ${p.nombre}`, monto: p.total, metodo: d.metodo, pedido: id }), ...(p.stockDescontado ? [] : await opsStock(p.items, -1)), upd({ estado: "entregado", pagado: p.total, pagoReal: d.metodo, stockDescontado: true })], "Entregado y cobrado"), "Entregado y cobrado");
    return fin([upd({ estado: "entregado" }), ...(p.stockDescontado ? [] : [...await opsStock(p.items, -1), upd({ estado: "entregado", stockDescontado: true })])], "Pedido entregado"); }
  if (a === "anular") return modal(`Anular ${p.codigo || id}`, `${fld("motivo", "Motivo", "", { full: true, ph: "Ej. el cliente canceló" })}${p.stockDescontado ? `<p class="muted">Los productos vuelven al stock.</p>` : ""}${p.pagado ? fld("devolver", `Registrar devolución de ${S(p.pagado)} en caja`, true, { type: "checkbox", full: true }) : ""}${fld("enviar", "Avisar por WhatsApp", true, { type: "checkbox" })}`, async d =>
    fin([upd({ estado: "anulado", motivo: d.motivo, stockDescontado: false }), ...(p.stockDescontado ? await opsStock(p.items, +1) : []), ...(d.devolver ? [movimiento({ concepto: `Devolución pedido ${p.codigo || id}`, monto: -p.pagado, metodo: p.pago === "Contra entrega" ? (p.pagoReal || "Efectivo") : p.pago, pedido: id })] : [])], "Pedido anulado", d.enviar ? msgCliente(p, `Tu pedido fue anulado${d.motivo ? ": " + d.motivo : ""}.`) : null), "Anular pedido");
}

/* ================= VENTA EN TIENDA (caja rápida) ================= */
let VT = { items: [], q: "", cat: "" };
VIEWS.venta = async () => {
  await cargarCatalogo();
  $("#view").innerHTML = topBar("Venta en tienda", "Busca, agrega y cobra. El stock baja solo y la venta entra a Caja.") + `<div class="pos">
    <section class="card"><div class="pos-f"><input class="q" id="vq" placeholder="Buscar producto…" value="${esc(VT.q)}" autocomplete="off"><select class="q" id="vc"><option value="">Todas las categorías</option>${CAT.cats.map(c => `<option value="${esc(c.id)}" ${VT.cat === c.id ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}</select></div><div class="pos-g" id="vg"></div></section>
    <aside class="card pos-c" id="vcart"></aside></div>`;
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const grid = () => { const l = CAT.prods.filter(p => p.activo !== false && (!VT.cat || p.cat === VT.cat) && norm(p.nombre).includes(norm(VT.q))).slice(0, 60);
    $("#vg").innerHTML = l.map(p => { const ag = p.stock != null && p.stock !== "" && +p.stock <= 0; return `<button class="pos-p ${ag ? "off" : ""}" data-add="${esc(p.id)}" ${ag ? "disabled" : ""}><span class="pos-i" style="background-image:url('${esc(IMG(p.foto, 200))}')"></span><b>${esc(p.nombre)}</b><span>${S(p.precio)}</span><small>${p.stock == null || p.stock === "" ? "" : ag ? "Agotado" : `Stock ${p.stock}`}</small></button>`; }).join("") || `<p class="muted">Sin resultados.</p>`; };
  const carro = () => { const sub = VT.items.reduce((a, i) => a + i.precio * i.cant, 0);
    $("#vcart").innerHTML = `<h2>${ico("cart")} Venta actual</h2>${VT.items.length ? `<ul class="pos-l">${VT.items.map((i, k) => `<li><div><b>${esc(i.n)}</b><small>${S(i.precio)} c/u</small></div><span class="qty-b"><button data-vm="${k}" aria-label="Menos">${ico("minus")}</button><b>${i.cant}</b><button data-vp="${k}" aria-label="Más">${ico("plus")}</button></span><b>${S(i.precio * i.cant)}</b></li>`).join("")}</ul>
      <form id="vf" class="g2">${fld("descuento", "Descuento (S/)", "", { type: "number", extra: 'min="0" step="0.1"' })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}${fld("recibido", "Recibido (efectivo)", "", { type: "number", extra: 'min="0" step="0.1"' })}<div class="fld"><span>Vuelto</span><b id="vVuelto" class="vuelto">—</b></div>
        ${fld("nombre", "Cliente (opcional)", "")}${fld("doc", "DNI / RUC (opcional)", "")}${fld("celular", "Celular (opcional)", "", { type: "tel" })}${fld("comprobante", "Comprobante", "Nota de venta", { opts: ["Nota de venta", "Boleta", "Factura"] })}
        <div class="full pos-t"><span>Total</span><b id="vTot">${S(sub)}</b></div><button class="btn btn-pri btn-lg full">${ico("check")} Cobrar</button></form>
      <button class="btn btn-light btn-sm" id="vClear">Vaciar</button>` : `<p class="muted">Toca un producto para agregarlo.</p>`}`;
    const F = $("#vf"); if (!F) return;
    const calc = () => { const d = +$("[name=descuento]", F).value || 0, t = Math.max(0, sub - d), rc = +$("[name=recibido]", F).value || 0; $("#vTot").textContent = S(t); $("#vVuelto").textContent = rc ? S(Math.max(0, rc - t)) : "—"; return { t, d, rc }; };
    F.addEventListener("input", calc);
    F.addEventListener("submit", async e => { e.preventDefault(); const { t, d, rc } = calc(), v = datosForm(F), mt = v.metodo;
      if (mt === "Efectivo" && rc && rc < t) return toast("El monto recibido es menor que el total", true);
      const cod = codigo("VT"), ped = { codigo: cod, items: VT.items.map(i => ({ id: i.id, n: i.n, precio: i.precio, cant: i.cant, unidad: i.unidad })), subtotal: r2(sub), descuento: r2(d), envio: 0, total: r2(t), entrega: "tienda", nombre: v.nombre || "Cliente", celular: v.celular, doc: v.doc, comprobante: v.comprobante,
        pago: mt, monto: r2(t), pagado: r2(t), recibido: rc || null, vuelto: rc ? r2(rc - t) : null, estado: "entregado", origen: "tienda", stockDescontado: true, creado: new Date().toISOString(), por: YO().nombre };
      $("button.btn-pri", F).disabled = true;
      await DB.batch([{ op: "set", col: "pedidos", id: cod, data: ped, merge: false }, movimiento({ concepto: `Venta en tienda ${cod} · ${VT.items.length} producto(s)`, monto: t, metodo: mt, pedido: cod }), ...await opsStock(ped.items, -1)]);
      VT.items = []; toast(`Venta ${cod} registrada · ${S(t)}`); grid(); carro();
      modal("Venta registrada", `<p class="pin-big">Total<br><b>${S(t)}</b></p>${rc ? `<p style="text-align:center">Vuelto: <b>${S(rc - t)}</b></p>` : ""}<div class="acts-g" style="justify-content:center"><button type="button" class="btn btn-pri" id="tk">${ico("print")} Ticket</button><button type="button" class="btn btn-light" id="nt">${ico("file")} Nota A5</button>${ped.celular ? `<button type="button" class="btn btn-wa" id="vw">${ico("wa")} Enviar</button>` : ""}</div>`, null);
      $("#tk").onclick = () => pdfNota(ped, true); $("#nt").onclick = () => pdfNota(ped); $("#vw")?.addEventListener("click", () => abrirWA(ped.celular, `Gracias por tu compra en *${NOMBRE()}* 🛠️\n\n${ped.items.map(i => `• ${i.cant}× ${i.n} = ${S(i.precio * i.cant)}`).join("\n")}\n\nTOTAL: ${S(t)}`)); });
    $("#vClear").addEventListener("click", () => { VT.items = []; carro(); });
  };
  grid(); carro();
  $("#vq").addEventListener("input", e => { VT.q = e.target.value; grid(); }); $("#vc").addEventListener("change", e => { VT.cat = e.target.value; grid(); });
  $("#view").onclick = e => {
    const a = e.target.closest("[data-add]"), m = e.target.closest("[data-vm]"), pl = e.target.closest("[data-vp]");
    if (a) { const p = prodDe(a.dataset.add), it = VT.items.find(i => i.id === p.id), max = p.stock == null || p.stock === "" ? 9999 : +p.stock;
      if ((it ? it.cant : 0) + 1 > max) return toast(`Solo hay ${max} en stock`, true); if (it) it.cant++; else VT.items.push({ id: p.id, n: p.nombre, precio: +p.precio, cant: 1, unidad: p.unidad || "unidad" }); carro(); }
    if (m) { const i = VT.items[+m.dataset.vm]; i.cant--; if (i.cant < 1) VT.items.splice(+m.dataset.vm, 1); carro(); }
    if (pl) { const i = VT.items[+pl.dataset.vp], p = prodDe(i.id), max = p && p.stock != null && p.stock !== "" ? +p.stock : 9999; if (i.cant + 1 > max) return toast(`Solo hay ${max} en stock`, true); i.cant++; carro(); }
  };
};

/* ================= PRODUCTOS Y STOCK ================= */
let PF = { q: "", cat: "", bajo: false };
VIEWS.productos = async () => {
  await cargarCatalogo();
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""), bajos = stockBajo();
  const l = CAT.prods.filter(p => (!PF.cat || p.cat === PF.cat) && norm(p.nombre).includes(norm(PF.q)) && (!PF.bajo || bajos.includes(p)));
  const valor = CAT.prods.reduce((a, p) => a + (+p.precio || 0) * (+p.stock || 0), 0);
  $("#view").innerHTML = topBar("Productos y stock", "Lo que agregues o cambies aquí se ve al instante en la tienda online.", `<button class="btn btn-pri btn-sm" id="np">${ico("plus")} Producto</button>`) + `
    <div class="kpis"><div class="kpi"><span>Productos</span><b>${CAT.prods.length}</b><small>${CAT.prods.filter(p => p.activo === false).length} oculto(s)</small></div><div class="kpi"><span>Stock bajo</span><b class="${bajos.length ? "neg" : ""}">${bajos.length}</b><small>${bajos.filter(p => +p.stock <= 0).length} agotado(s)</small></div>
      <div class="kpi"><span>Valor del inventario</span><b>${S(valor)}</b><small>a precio de venta</small></div><div class="kpi"><span>En oferta</span><b>${CAT.prods.filter(p => p.antes).length}</b><small>con precio anterior</small></div></div>
    <section class="card"><div class="card-h"><div class="pos-f"><input class="q" id="pq" placeholder="Buscar producto…" value="${esc(PF.q)}"><select class="q" id="pc"><option value="">Todas las categorías</option>${CAT.cats.map(c => `<option value="${esc(c.id)}" ${PF.cat === c.id ? "selected" : ""}>${esc(c.nombre)}</option>`).join("")}</select>
      <label class="chk"><input type="checkbox" id="pb" ${PF.bajo ? "checked" : ""}><span>Solo stock bajo</span></label></div><span class="muted sm">${l.length} producto(s)</span></div>
      <div class="tbl-w"><table class="tbl"><thead><tr><th></th><th>Producto</th><th>Categoría</th><th class="r">Precio</th><th>Stock</th><th></th></tr></thead><tbody>
      ${l.map(p => `<tr class="${p.activo === false ? "off" : ""}"><td><span class="p-th" style="background-image:url('${esc(IMG(p.foto, 120))}')"></span></td><td><b>${esc(p.nombre)}</b><small>${esc(p.unidad || "unidad")}${p.badge ? ` · <span class="st ${p.badge === "Oferta" ? "pri" : p.badge === "Nuevo" ? "ok" : "warn"}">${esc(p.badge)}</span>` : ""}${p.activo === false ? " · oculto" : ""}</small></td>
        <td>${esc(catDe(p.cat).nombre || p.cat)}</td><td class="r"><b>${S(p.precio)}</b>${p.antes ? `<small><del>${S(p.antes)}</del></small>` : ""}</td>
        <td>${p.stock == null || p.stock === "" ? `<span class="muted sm">Sin control</span>` : `<div class="stk"><button class="btn btn-light btn-xs" data-st="-1|${esc(p.id)}" aria-label="Menos">${ico("minus")}</button><b class="${+p.stock <= (+CAT.aj.stockMinimo || 5) ? "neg" : ""}">${p.stock}</b><button class="btn btn-light btn-xs" data-st="1|${esc(p.id)}" aria-label="Más">${ico("plus")}</button><button class="btn btn-light btn-xs" data-rep="${esc(p.id)}">Reponer</button></div>`}</td>
        <td><button class="btn btn-light btn-sm" data-ep="${esc(p.id)}" aria-label="Editar">${ico("edit")}</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">Sin productos.</td></tr>`}</tbody></table></div></section>`;
  $("#pq").addEventListener("change", e => { PF.q = e.target.value; VIEWS.productos(); }); $("#pc").addEventListener("change", e => { PF.cat = e.target.value; VIEWS.productos(); }); $("#pb").addEventListener("change", e => { PF.bajo = e.target.checked; VIEWS.productos(); });
  $("#np").addEventListener("click", () => formProducto());
  $("#view").onclick = async e => { const ep = e.target.closest("[data-ep]"), st = e.target.closest("[data-st]"), rp = e.target.closest("[data-rep]");
    if (ep) return formProducto(prodDe(ep.dataset.ep));
    if (st) { const [d, id] = st.dataset.st.split("|"), p = prodDe(id); p.stock = Math.max(0, (+p.stock || 0) + +d); await DB.set("productos", id, { stock: p.stock }); st.parentElement.querySelector("b").textContent = p.stock; }
    if (rp) { const p = prodDe(rp.dataset.rep);
      modal(`Reponer · ${p.nombre}`, `<p class="muted">Stock actual <b>${p.stock ?? 0}</b></p><div class="g2">${fld("cant", "¿Cuántas unidades llegaron?", "", { type: "number", req: true, extra: 'min="1"' })}${fld("costo", "Costo total de la compra (opcional → egreso en caja)", "", { type: "number", extra: 'min="0" step="0.1"' })}${fld("metodo", "Pagado con", "Efectivo", { opts: METODOS })}${fld("prov", "Proveedor (opcional)", "")}</div>`, async d => {
        const n = (+p.stock || 0) + (+d.cant || 0), ops = [{ op: "set", col: "productos", id: p.id, data: { stock: n } }];
        if (+d.costo > 0) ops.push(movimiento({ concepto: `Compra de ${d.cant} × ${p.nombre}${d.prov ? " · " + d.prov : ""}`, monto: -(+d.costo), metodo: d.metodo }));
        await DB.batch(ops); toast(`Stock de ${p.nombre}: ${n}`); VIEWS.productos(); }, "Reponer"); }
  };
};
async function formProducto(p) {
  let FOTOS = [p?.foto, ...(p ? ((await DB.get("fotos_prod", p.id)) || {}).fotos || [] : [])].filter(Boolean).slice(0, 4);
  modal(p ? "Editar producto" : "Nuevo producto", `<div class="g2">
    <div class="full"><span class="lbl">Fotos (hasta 4 · la ⭐ es la principal, la que se ve en el catálogo)</span><div class="gal-ed" id="galEd"></div>
      <div class="foto-up" style="margin-top:8px"><input class="q" id="pUrl" placeholder="…o pega el enlace de una foto (https://…) y pulsa Agregar" style="flex:1;min-width:200px"><button type="button" class="btn btn-light btn-sm" id="pUrlAdd">Agregar enlace</button>
      <small class="muted">Fotos cuadradas, de frente y con fondo claro. Se achican solas. Muestra el producto por varios lados.</small></div></div>
    ${fld("nombre", "Nombre", p?.nombre || "", { req: true, full: true })}${fld("cat", "Categoría", p?.cat || CAT.cats[0]?.id, { opts: CAT.cats.map(c => [c.id, c.nombre]) })}${fld("unidad", "Se vende por", p?.unidad || "unidad", { ph: "unidad, galón, rollo, bolsa, ciento…" })}
    ${fld("precio", "Precio (S/)", p?.precio ?? "", { type: "number", req: true, extra: 'min="0" step="0.01"' })}${fld("antes", "Precio anterior (si está en oferta)", p?.antes ?? "", { type: "number", extra: 'min="0" step="0.01"' })}
    ${fld("stock", "Stock", p ? (p.stock ?? "") : 10, { type: "number", extra: 'min="0"', help: "Vacío = no controlar stock" })}${fld("badge", "Etiqueta", p?.badge || "", { opts: [["", "Ninguna"], "Más vendido", "Oferta", "Nuevo"] })}
    ${fld("desc", "Descripción", p?.desc || "", { type: "textarea", full: true, rows: 2 })}${fld("specs", "Características (una por línea)", (p?.specs || []).join("\n"), { type: "textarea", full: true, rows: 4 })}
    ${fld("activo", "Visible en la tienda online", p ? p.activo !== false : true, { type: "checkbox", full: true })}</div>${p ? `<button type="button" class="btn btn-light danger btn-sm" id="delP">${ico("trash")} Eliminar producto</button>` : ""}`, async d => {
    const id = p?.id || "p" + Date.now().toString(36), u = $("#pUrl").value.trim();
    if (/^https:\/\//.test(u) && FOTOS.length < 4 && !FOTOS.includes(u)) FOTOS.push(u);
    const foto = FOTOS[0] || "";
    const data = { nombre: d.nombre, cat: d.cat, unidad: d.unidad || "unidad", precio: +d.precio, antes: d.antes === "" ? null : +d.antes, stock: d.stock === "" ? null : Math.max(0, +d.stock), badge: d.badge, desc: d.desc,
      specs: d.specs.split("\n").map(x => x.trim()).filter(Boolean), activo: d.activo, foto, orden: p?.orden ?? CAT.prods.length, actualizado: new Date().toISOString() };
    if (data.antes && data.antes <= data.precio) { toast("El precio anterior debe ser mayor al precio actual", true); return false; }
    if (JSON.stringify(data).length > 400000) { toast("La foto pesa demasiado", true); return false; }
    data.nFotos = FOTOS.length;
    if (FOTOS.slice(1).join("").length > 900000) { toast("Las fotos extra pesan demasiado", true); return false; }
    await DB.batch([{ op: "set", col: "productos", id, data, merge: false }, { op: "set", col: "fotos_prod", id, data: { fotos: FOTOS.slice(1) }, merge: false }]);
    toast("Producto guardado · ya se ve en la tienda"); VIEWS.productos(); }, "Guardar", { wide: true, alAbrir: F => {
    const pintarG = () => { $("#galEd").innerHTML = FOTOS.map((f, k) => `<div class="g-th ${k ? "" : "main"}" style="background-image:url('${esc(IMG(f, 300))}')">${k ? `<button type="button" data-gp="${k}" title="Hacer principal" aria-label="Hacer principal">⭐</button>` : `<span>Principal</span>`}<button type="button" data-gx="${k}" title="Quitar" aria-label="Quitar foto">×</button></div>`).join("")
      + (FOTOS.length < 4 ? `<label class="g-add">${ico("camera")}<span>Subir fotos</span><input type="file" accept="image/*" multiple hidden id="gFile"></label>` : ""); };
    pintarG();
    $("#galEd").addEventListener("click", e => { const x = e.target.closest("[data-gx]"), pr = e.target.closest("[data-gp]"); if (x) { FOTOS.splice(+x.dataset.gx, 1); pintarG(); } if (pr) { FOTOS.unshift(FOTOS.splice(+pr.dataset.gp, 1)[0]); pintarG(); } });
    $("#galEd").addEventListener("change", async e => { if (e.target.id !== "gFile") return; const fs = [...e.target.files].slice(0, 4 - FOTOS.length); for (const [k, f] of fs.entries()) FOTOS.push(await redimensionar(f, !FOTOS.length && !k ? 600 : 900, .72)); pintarG(); });
    $("#pUrlAdd").addEventListener("click", () => { const u = $("#pUrl").value.trim(); if (!/^https:\/\//.test(u)) return toast("Pega un enlace que empiece con https://", true); if (FOTOS.length >= 4) return toast("Máximo 4 fotos", true); FOTOS.push(u); $("#pUrl").value = ""; pintarG(); });
    $("#delP")?.addEventListener("click", async () => { if (!confirm(`¿Eliminar «${p.nombre}»?`)) return; await DB.batch([{ op: "del", col: "productos", id: p.id }, { op: "del", col: "fotos_prod", id: p.id }]); cerrarModal(); toast("Producto eliminado"); VIEWS.productos(); }); } });
}

/* ================= CATEGORÍAS ================= */
VIEWS.categorias = async () => {
  await cargarCatalogo();
  $("#view").innerHTML = topBar("Categorías", "Aparecen en el menú, en la barra lateral y (con foto) en la franja de la portada.", `<button class="btn btn-pri btn-sm" id="nc">${ico("plus")} Categoría</button>`) +
    `<section class="card"><ul class="lst cats">${CAT.cats.map((c, i) => `<li><span class="cat-ic">${icCat(c.icono)}</span><span class="p-th" style="background-image:url('${esc(IMG(c.foto, 160))}')"></span><div><b>${esc(c.nombre)}</b><small>${CAT.prods.filter(p => p.cat === c.id).length} producto(s)${c.franja ? " · en la portada" : ""}</small></div>
      <button class="btn btn-light btn-xs" data-up="${i}" ${i ? "" : "disabled"} aria-label="Subir">▲</button><button class="btn btn-light btn-xs" data-dn="${i}" ${i < CAT.cats.length - 1 ? "" : "disabled"} aria-label="Bajar">▼</button><button class="btn btn-light btn-sm" data-ec="${esc(c.id)}">${ico("edit")}</button></li>`).join("") || `<li class="muted">Sin categorías.</li>`}</ul></section>`;
  const form = c => modal(c ? c.nombre : "Nueva categoría", `<div class="g2">${fld("nombre", "Nombre", c?.nombre || "", { req: true, full: true })}
    <div class="full"><span class="lbl">Ícono</span><div class="ic-pick">${ICONOS_CAT.map(k => `<label><input type="radio" name="icono" value="${k}" ${(c?.icono || "box") === k ? "checked" : ""}><span>${icCat(k)}</span></label>`).join("")}</div></div>
    <div class="full"><span class="lbl">Foto (para la franja de la portada)</span><div class="foto-up"><span id="cPrev" style="background-image:url('${esc(IMG(c?.foto, 300))}')"></span><label class="btn btn-light btn-sm">${ico("camera")} Subir foto<input type="file" accept="image/*" id="cFile" hidden></label><input type="hidden" name="foto" value="${esc(c?.foto || "")}"></div></div>
    ${fld("franja", "Mostrar en la franja de la portada (máximo 4)", !!c?.franja, { type: "checkbox", full: true })}</div>${c ? `<button type="button" class="btn btn-light danger btn-sm" id="delC">${ico("trash")} Eliminar categoría</button>` : ""}`, async d => {
    const id = c?.id || d.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\W+/g, "-").replace(/^-|-$/g, "") || "cat-" + Date.now().toString(36);
    if (!c && CAT.cats.find(x => x.id === id)) { toast("Ya existe esa categoría", true); return false; }
    await DB.set("categorias", id, { nombre: d.nombre, icono: d.icono || "box", foto: d.foto, franja: d.franja, orden: c?.orden ?? CAT.cats.length }); toast("Categoría guardada"); VIEWS.categorias(); }, "Guardar", { alAbrir: F => {
    $("#cFile").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; const u = await redimensionar(f, 700, .7); $("[name=foto]", F).value = u; $("#cPrev").style.backgroundImage = `url('${u}')`; });
    $("#delC")?.addEventListener("click", async () => { const n = CAT.prods.filter(p => p.cat === c.id).length; if (n) return toast(`Tiene ${n} producto(s). Muévelos a otra categoría primero.`, true); if (!confirm(`¿Eliminar «${c.nombre}»?`)) return; await DB.del("categorias", c.id); cerrarModal(); VIEWS.categorias(); }); } });
  $("#nc").addEventListener("click", () => form());
  $("#view").onclick = async e => { const ec = e.target.closest("[data-ec]"), up = e.target.closest("[data-up]"), dn = e.target.closest("[data-dn]");
    if (ec) return form(catDe(ec.dataset.ec));
    if (up || dn) { const i = +(up || dn).dataset[up ? "up" : "dn"], j = up ? i - 1 : i + 1, l = CAT.cats.slice(); [l[i], l[j]] = [l[j], l[i]]; await DB.batch(l.map((c, k) => ({ op: "set", col: "categorias", id: c.id, data: { orden: k } }))); VIEWS.categorias(); } };
};

/* ================= CAJA ================= */
let CAJA_F = null;
VIEWS.caja = async () => {
  CAJA_F = CAJA_F || HOY(); const l = (await DB.list("movimientos", ["fecha", "==", CAJA_F])).sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
  const ing = l.filter(m => m.monto > 0).reduce((a, m) => a + m.monto, 0), egr = l.filter(m => m.monto < 0).reduce((a, m) => a + m.monto, 0), por = {}; l.forEach(m => por[m.metodo] = (por[m.metodo] || 0) + m.monto);
  $("#view").innerHTML = topBar("Caja", "Ventas en tienda, pedidos web cobrados, compras y gastos.", `<input type="date" id="cf" value="${CAJA_F}" class="q"><button class="btn btn-light btn-sm" id="mov">${ico("plus")} Ingreso / gasto</button><button class="btn btn-light btn-sm" id="csv">${ico("download")} Excel (CSV)</button>`) + `
    <div class="kpis"><div class="kpi"><span>Saldo del día</span><b>${S(ing + egr)}</b><small>${l.length} movimiento(s)</small></div><div class="kpi"><span>Ingresos</span><b>${S(ing)}</b></div><div class="kpi"><span>Gastos y compras</span><b class="neg">${S(egr)}</b></div>${METODOS.map(k => `<div class="kpi sm"><span>${k}</span><b>${S(por[k] || 0)}</b></div>`).join("")}</div>
    <section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Hora</th><th>Concepto</th><th>Método</th><th>Usuario</th><th class="r">Monto</th></tr></thead><tbody>
      ${l.map(m => `<tr><td>${fmtH(m.hora)}</td><td>${esc(m.concepto)}</td><td>${esc(m.metodo)}</td><td>${esc(m.usuario || "")}</td><td class="r ${m.monto < 0 ? "neg" : ""}">${S(m.monto)}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Sin movimientos este día.</td></tr>`}</tbody></table></div></section>`;
  $("#cf").addEventListener("change", e => { CAJA_F = e.target.value; VIEWS.caja(); });
  $("#csv").addEventListener("click", () => { const rows = [["Fecha", "Hora", "Concepto", "Método", "Usuario", "Monto"], ...l.map(m => [m.fecha, fmtH(m.hora), m.concepto, m.metodo, m.usuario || "", m.monto])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n")], { type: "text/csv" })); a.download = `caja-${CAJA_F}.csv`; a.click(); });
  $("#mov").addEventListener("click", () => modal("Ingreso o gasto", `<div class="g2">${fld("tipo", "Tipo", "egreso", { opts: [["ingreso", "Ingreso"], ["egreso", "Gasto / compra"]] })}${fld("monto", "Monto (S/)", "", { type: "number", req: true, extra: 'min="0.1" step="0.1"' })}
    ${fld("concepto", "Concepto", "", { req: true, full: true, ph: "Ej. pago de luz, flete, compra a proveedor" })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}</div>`, async d => {
    await DB.batch([movimiento({ concepto: d.concepto, monto: d.tipo === "egreso" ? -d.monto : d.monto, metodo: d.metodo, fecha: CAJA_F })]); toast("Registrado"); VIEWS.caja(); }));
};

/* ================= CLIENTES ================= */
let CQ = "";
VIEWS.clientes = async () => {
  const todos = (await DB.list("pedidos")).filter(p => p.celular), peds = todos.filter(p => !["anulado", "rechazado"].includes(p.estado)), M = {}, kc = cel => String(cel).replace(/\D/g, "").slice(-9);
  peds.forEach(p => { const k = kc(p.celular); const c = M[k] || (M[k] = { k, nombre: p.nombre, celular: p.celular, doc: p.doc, n: 0, total: 0, ult: "" }); c.n++; c.total += +p.total || 0; if (String(p.creado) > c.ult) { c.ult = p.creado; c.nombre = p.nombre; c.doc = p.doc || c.doc; } });
  const q = CQ.toLowerCase(), l = Object.values(M).filter(c => !q || [c.nombre, c.celular, c.doc].join(" ").toLowerCase().includes(q)).sort((a, b) => b.total - a.total);
  $("#view").innerHTML = topBar("Clientes", "Quienes te compraron por la web o dejaron su celular en tienda. Ordenados por lo que más compran.", `<input class="q" id="cq" placeholder="Buscar nombre, celular o RUC" value="${esc(CQ)}">`) +
    `<section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Cliente</th><th>Celular</th><th>DNI / RUC</th><th>Compras</th><th class="r">Total</th><th>Última</th><th></th></tr></thead><tbody>
    ${l.slice(0, 300).map(c => `<tr class="clk" data-cli="${esc(c.k)}" title="Ver sus compras y recibos"><td><b>${esc(c.nombre)}</b>${c.n > 1 ? ` <span class="st ok">Frecuente</span>` : ""}</td><td>${esc(c.celular)}</td><td>${esc(c.doc || "")}</td><td>${c.n}</td><td class="r">${S(c.total)}</td><td>${fmtF(c.ult)}</td><td class="nw"><button class="btn btn-light btn-sm" data-cli="${esc(c.k)}">${ico("file")} Recibos</button> <button class="btn btn-wa btn-sm" data-wa="${esc(c.celular)}|${esc(c.nombre)}">${ico("wa")}</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Aún no hay clientes.</td></tr>`}</tbody></table></div></section>`;
  $("#cq").addEventListener("change", e => { CQ = e.target.value; VIEWS.clientes(); });
  $("#view").onclick = e => { const b = e.target.closest("[data-wa]"); if (b) { const [cel, n] = b.dataset.wa.split("|"); return abrirWA(cel, `Hola ${n.split(" ")[0]} 👋 Te saluda *${NOMBRE()}*. `); }
    const r = e.target.closest("[data-cli]"); if (r && M[r.dataset.cli]) historialCliente(M[r.dataset.cli], todos.filter(p => kc(p.celular) === r.dataset.cli)); };
};
function historialCliente(c, ps) {
  ps = ps.sort((a, b) => String(b.creado).localeCompare(String(a.creado)));
  const ok = ps.filter(p => !["anulado", "rechazado"].includes(p.estado));
  modal(`Compras de ${c.nombre}`, `<div class="hc-top"><div><small>Celular</small><b>${esc(c.celular)}</b></div><div><small>DNI / RUC</small><b>${esc(c.doc || "—")}</b></div><div><small>Compras</small><b>${ok.length}</b></div><div><small>Total comprado</small><b>${S(ok.reduce((a, p) => a + (+p.total || 0), 0))}</b></div></div>
    <div class="tbl-w"><table class="tbl"><thead><tr><th>Fecha</th><th>Código</th><th>Productos</th><th class="r">Total</th><th>Estado</th><th>Comprobante</th><th></th></tr></thead><tbody>
    ${ps.map(p => `<tr><td class="nw">${new Date(p.creado).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}<br><small class="muted">${new Date(p.creado).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</small></td>
      <td class="mono nw">${esc(p.codigo || p.id)}<br><small class="muted">${p.origen === "tienda" ? "Tienda" : "Web"}</small></td><td><small>${(p.items || []).map(i => `${i.cant}× ${esc(i.n)}`).join("<br>")}</small></td><td class="r nw"><b>${S(p.total)}</b></td><td>${estP(p.estado, p)}</td>
      <td>${p.boleta ? `<b>${esc(p.boleta)}</b>` : `<span class="muted">${esc(p.comprobante || "Boleta")} sin N°</span>`}<br><button class="btn btn-light btn-sm" data-hb="${esc(p.id)}">🧾 ${p.boleta ? "Editar" : "Poner N°"}</button></td>
      <td><button class="btn btn-pri btn-sm" data-hp="${esc(p.id)}">${ico("file")} PDF</button></td></tr>`).join("")}</tbody></table></div>`, null, "", { wide: true, alAbrir: F => {
    F.onclick = e => { const b = e.target.closest("[data-hp],[data-hb]"); if (!b) return; e.preventDefault(); const p = ps.find(x => x.id === (b.dataset.hp || b.dataset.hb)); if (!p) return;
      if (b.dataset.hp) pdfNota(p); else accionPedido("boleta", p); };
  } });
}

/* ================= MENSAJES ================= */
VIEWS.mensajes = async () => {
  const l = (await DB.list("mensajes")).sort((a, b) => String(b.creado).localeCompare(a.creado));
  $("#view").innerHTML = topBar("Mensajes y cotizaciones", "Lo que escriben en el formulario de Contacto de la web.") +
    `<div class="peds">${l.map(m => `<article class="card ped ${m.estado === "nuevo" ? "nuevo" : ""}"><div class="ped-i">${ico("msg")}</div><div class="ped-b"><div class="ped-h"><b>${esc(m.nombre)}</b><span class="st ${m.asunto && /cotiz|mayor/i.test(m.asunto) ? "warn" : "mute"}">${esc(m.asunto || "")}</span><span class="muted">${hace(m.creado)}</span>${m.estado === "nuevo" ? `<span class="st pri">Nuevo</span>` : `<span class="st ok">Atendido</span>`}</div>
      <p>${esc(m.mensaje)}</p><p class="muted">📱 ${esc(m.telefono || "sin teléfono")}</p>
      <div class="acts-g">${m.telefono ? `<button class="btn btn-wa btn-sm" data-mw="${esc(m.id)}">${ico("wa")} Responder</button>` : ""}${m.estado === "nuevo" ? `<button class="btn btn-light btn-sm" data-mo="${esc(m.id)}">${ico("check")} Marcar atendido</button>` : ""}<button class="btn btn-light btn-sm" data-md="${esc(m.id)}">${ico("trash")}</button></div></div></article>`).join("") || vacio("No hay mensajes.")}</div>`;
  $("#view").onclick = async e => { const w = e.target.closest("[data-mw]"), o = e.target.closest("[data-mo]"), d = e.target.closest("[data-md]"); const m = l.find(x => x.id === (w || o || d || {}).dataset?.[w ? "mw" : o ? "mo" : "md"]); if (!m) return;
    if (w) { abrirWA(m.telefono, `Hola ${m.nombre.split(" ")[0]} 👋 te escribe *${NOMBRE()}* por tu consulta: «${m.mensaje.slice(0, 120)}»\n\n`); await DB.set("mensajes", m.id, { estado: "atendido" }); }
    if (o) await DB.set("mensajes", m.id, { estado: "atendido" }); if (d && confirm("¿Eliminar este mensaje?")) await DB.del("mensajes", m.id);
    vigilar(); VIEWS.mensajes(); };
};

/* ================= REPORTES ================= */
VIEWS.reportes = async () => {
  await cargarCatalogo(); const d0 = addD(HOY(), -29), peds = (await DB.list("pedidos", ["creado", ">=", d0])).filter(p => p.pagado || p.estado === "entregado"), movs = await DB.list("movimientos", ["fecha", ">=", d0]);
  const dias = [...Array(30)].map((_, i) => addD(d0, i)), porDia = dias.map(f => movs.filter(m => m.fecha === f && m.monto > 0).reduce((a, m) => a + m.monto, 0)), max = Math.max(1, ...porDia);
  const top = {}, porCat = {}; peds.forEach(p => (p.items || []).forEach(i => { top[i.n] = top[i.n] || { c: 0, m: 0 }; top[i.n].c += i.cant; top[i.n].m += i.cant * i.precio; const c = (prodDe(i.id) || {}).cat || "otros"; porCat[c] = (porCat[c] || 0) + i.cant * i.precio; }));
  const tot = porDia.reduce((a, b) => a + b, 0), web = peds.filter(p => p.origen === "web"), tienda = peds.filter(p => p.origen === "tienda"), maxC = Math.max(1, ...Object.values(porCat));
  $("#view").innerHTML = topBar("Reportes", "Últimos 30 días.") + `
    <div class="kpis"><div class="kpi"><span>Ingresos</span><b>${S(tot)}</b><small>promedio ${S(tot / 30)} por día</small></div><div class="kpi"><span>Ventas</span><b>${peds.length}</b><small>${web.length} web · ${tienda.length} tienda</small></div>
      <div class="kpi"><span>Ticket promedio</span><b>${S(peds.length ? peds.reduce((a, p) => a + (+p.total || 0), 0) / peds.length : 0)}</b></div><div class="kpi"><span>Ventas web</span><b>${S(web.reduce((a, p) => a + (+p.total || 0), 0))}</b><small>${peds.length ? Math.round(web.length / peds.length * 100) : 0}% de las ventas</small></div></div>
    <section class="card"><div class="card-h"><h2>Ingresos por día</h2></div><div class="dias">${porDia.map((v, i) => `<div title="${fmtF(dias[i])}: ${S(v)}"><i style="height:${Math.max(2, v / max * 100)}%"></i><small>${+dias[i].slice(8) % 5 === 0 || i === 29 ? +dias[i].slice(8) : ""}</small></div>`).join("")}</div></section>
    <div class="two"><section class="card"><div class="card-h"><h2>Lo más vendido</h2></div><table class="tbl"><tbody>${Object.entries(top).sort((a, b) => b[1].m - a[1].m).slice(0, 12).map(([n, v]) => `<tr><td>${esc(n)}</td><td>${v.c} u.</td><td class="r">${S(v.m)}</td></tr>`).join("") || `<tr><td class="muted">Aún no hay ventas.</td></tr>`}</tbody></table></section>
      <section class="card"><div class="card-h"><h2>Por categoría</h2></div><div class="bars">${Object.entries(porCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<div class="bar-r"><span>${esc(catDe(c).nombre || c)}</span><div class="bar"><i style="width:${v / maxC * 100}%"></i></div><b>${S(v)}</b></div>`).join("") || `<p class="muted">Aún no hay ventas.</p>`}</div></section></div>`;
};

/* ================= AJUSTES DE LA WEB ================= */
VIEWS.ajustes = async () => {
  await cargarCatalogo(); const a = CAT.aj;
  const img = (n, t, w, q, help) => `<div class="full"><span class="lbl">${t}</span><div class="foto-up"><span id="prev_${n}" style="background-image:url('${esc(IMG(a[n], 400))}')"></span><label class="btn btn-light btn-sm">${ico("camera")} Subir<input type="file" accept="image/*" data-img="${n}" data-w="${w}" data-q="${q}" hidden></label>${a[n] ? `<button type="button" class="btn btn-light btn-sm" data-imgx="${n}">Quitar</button>` : ""}<input type="hidden" name="${n}" value="${esc(a[n] || "")}">${help ? `<small class="muted">${help}</small>` : ""}</div></div>`;
  $("#view").innerHTML = topBar("Ajustes de la web", "Todo lo que se ve en tu tienda online. Los colores se mantienen.") + `
    ${!CAT.prods.length || DEMO ? `<section class="card hi"><h2>${ico("download")} Cargar ejemplos</h2><p>Crea las categorías y productos de ejemplo de tu web para empezar a editarlos. ${!CAT.prods.length ? "<b>Tu tienda aún no tiene productos guardados.</b>" : ""}</p><button class="btn btn-pri" id="seed">Cargar ejemplos</button></section>` : ""}
    <form class="card" id="ajF">
      <h2>${ico("star")} Marca</h2><div class="g2">
        <div class="full"><span class="lbl">Logo (reemplaza al dibujo de la casita; PNG con fondo transparente)</span><div class="foto-up"><span id="prev_logo" class="logo-prev">${a.logo ? `<img src="${esc(a.logo)}" alt="">` : ico("tool")}</span><label class="btn btn-light btn-sm">${ico("camera")} Subir logo<input type="file" accept="image/*" id="logoFile" hidden></label>${a.logo ? `<button type="button" class="btn btn-light btn-sm" data-imgx="logo">Quitar</button>` : ""}<input type="hidden" name="logo" value="${esc(a.logo || "")}"></div></div>
        ${fld("nombre", "Nombre del negocio", a.nombre)}${fld("ruc", "RUC (sale en notas y tickets)", a.ruc || "")}${fld("marca1", "Logo: línea pequeña", a.marca1)}${fld("marca2", "Logo: línea grande (amarilla)", a.marca2)}${fld("lema", "Lema", a.lema, { full: true })}</div>
      <h2>${ico("phone")} Contacto</h2><div class="g2">${fld("whatsapp", "WhatsApp (51 + número, sin espacios)", a.whatsapp, { req: true })}${fld("telefono", "Teléfono que se muestra", a.telefono)}${fld("email", "Correo", a.email)}${fld("horario", "Horario", a.horario)}
        ${fld("direccion", "Dirección", a.direccion, { full: true })}${fld("mapa", "Ubicación para el mapa (dirección o «lat,lng»)", a.mapa, { full: true })}
        ${fld("facebook", "Facebook", (a.redes || {}).facebook || "", { type: "url", ph: "https://facebook.com/…" })}${fld("instagram", "Instagram", (a.redes || {}).instagram || "", { type: "url" })}${fld("tiktok", "TikTok", (a.redes || {}).tiktok || "", { type: "url" })}</div>
      <h2>${ico("home")} Portada</h2><div class="g2">${fld("heroTit", "Título del banner (lo que vaya entre *asteriscos* sale en amarillo)", a.heroTit, { full: true })}${fld("heroSub", "Subtítulo", a.heroSub, { full: true })}
        ${img("heroFoto", "Foto del banner", 1500, .66, "Horizontal. Vacío = foto de ejemplo.")}
        ${(a.perks || []).concat(["", "", "", ""]).slice(0, 4).map((x, i) => fld("perk" + i, `Ventaja ${i + 1} (columna derecha del banner)`, x)).join("")}
        ${fld("promoTit", "Recuadro lateral: título (*palabra* en amarillo)", a.promoTit)}${fld("promoCat", "Recuadro lateral: lleva a la categoría", a.promoCat, { opts: CAT.cats.map(c => [c.id, c.nombre]) })}${img("promoFoto", "Recuadro lateral: foto", 700, .7)}</div>
      <h2>${ico("users")} Nosotros</h2><div class="g2">${fld("nosTit", "Título", a.nosTit, { full: true })}${fld("nosP1", "Párrafo 1", a.nosP1, { type: "textarea", full: true, rows: 3 })}${fld("nosP2", "Párrafo 2", a.nosP2, { type: "textarea", full: true, rows: 3 })}${img("nosFoto", "Foto", 1000, .7)}</div>
      <h2>${ico("truck")} Envíos</h2><div class="g2">${fld("zonas", "Zonas de envío (una por línea: Zona | costo)", (a.zonas || []).map(z => `${z.n} | ${z.costo}`).join("\n"), { type: "textarea", full: true, rows: 4, ph: "Mismo distrito | 10" })}
        ${fld("envioGratisDesde", "Envío gratis desde (S/) · vacío = nunca", a.envioGratisDesde ?? "", { type: "number", extra: 'min="0"' })}${fld("recojo", "Permitir recojo en tienda", a.recojo !== false, { type: "checkbox" })}${fld("stockMinimo", "Avisar stock bajo cuando quede", a.stockMinimo ?? 5, { type: "number", extra: 'min="0"' })}</div>
      <h2>${ico("cash")} Pagos</h2><div class="g2">${fld("contraEntrega", "Aceptar pago contra entrega (efectivo / POS al recibir)", a.contraEntrega !== false, { type: "checkbox", full: true })}
        ${["yape", "plin"].map(k => { const N = k[0].toUpperCase() + k.slice(1); return `${fld("pago" + N, `Aceptar ${N}`, a["pago" + N] !== false, { type: "checkbox", full: true })}<div class="full qr-up"><span id="prev_${k}QR">${a[k + "QR"] ? `<img src="${esc(a[k + "QR"])}" alt="">` : ico("qr")}</span><label class="btn btn-light btn-sm">${ico("camera")} QR de ${N}<input type="file" accept="image/*" data-qr="${k}" hidden></label><input type="hidden" name="${k}QR" value="${esc(a[k + "QR"] || "")}">${fld(k + "Num", "Número", a[k + "Num"] || "")}${fld(k + "Titular", "A nombre de", a[k + "Titular"] || "")}</div>`; }).join("")}
        ${fld("pagoTransf", "Aceptar transferencias", a.pagoTransf !== false, { type: "checkbox" })}${fld("pagoOCR", "Leer las capturas automáticamente", a.pagoOCR !== false, { type: "checkbox" })}
        ${fld("cuentas", "Cuentas (banco | número | CCI | titular)", (a.cuentas || []).map(c => `${c.banco} | ${c.num} | ${c.cci} | ${c.titular}`).join("\n"), { type: "textarea", full: true, help: "Bancos con su color: BCP, Interbank, BBVA, Scotiabank, BanBif, Pichincha." })}</div>
      <div class="f-end"><button class="btn btn-pri">${ico("check")} Guardar ajustes</button></div></form>`;
  const F = $("#ajF");
  $$("[data-img]", F).forEach(i => i.addEventListener("change", async e => { const f = e.target.files[0], n = e.target.dataset.img; if (!f) return; const u = await redimensionar(f, +e.target.dataset.w, +e.target.dataset.q); $(`[name=${n}]`, F).value = u; $("#prev_" + n).style.backgroundImage = `url('${u}')`; }));
  $$("[data-qr]", F).forEach(i => i.addEventListener("change", async e => { const f = e.target.files[0], k = e.target.dataset.qr; if (!f) return; const u = await redimensionar(f, 600, .92, "image/png"); $(`[name=${k}QR]`, F).value = u; $(`#prev_${k}QR`).innerHTML = `<img src="${u}" alt="">`; }));
  $("#logoFile").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; const u = await redimensionar(f, 320, .92, "image/png"); $("[name=logo]", F).value = u; $("#prev_logo").innerHTML = `<img src="${u}" alt="">`; });
  F.addEventListener("click", e => { const x = e.target.closest("[data-imgx]"); if (!x) return; const n = x.dataset.imgx; $(`[name=${n}]`, F).value = ""; const p = $("#prev_" + n); if (n === "logo") p.innerHTML = ico("tool"); else p.style.backgroundImage = "none"; x.remove(); });
  F.addEventListener("submit", async e => { e.preventDefault(); const d = datosForm(F), sp = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
    const URL_B = { BCP: "https://www.viabcp.com", Interbank: "https://interbank.pe", BBVA: "https://www.bbva.pe", Scotiabank: "https://www.scotiabank.com.pe", BanBif: "https://www.banbif.com.pe", Pichincha: "https://www.pichincha.pe" };
    const x = { ...d, redes: { facebook: d.facebook, instagram: d.instagram, tiktok: d.tiktok }, perks: [0, 1, 2, 3].map(i => d["perk" + i]).filter(Boolean),
      zonas: sp(d.zonas).map(l => { const [n, c] = l.split("|").map(y => (y || "").trim()); return { n, costo: +String(c || "0").replace(/[^\d.]/g, "") || 0 }; }).filter(z => z.n),
      cuentas: sp(d.cuentas).map((l, i) => { const [banco, num, cci, titular] = l.split("|").map(y => (y || "").trim()); return { id: (banco || "banco").toLowerCase().replace(/\W/g, "") + i, banco, num, cci, titular, url: URL_B[banco] || "" }; }),
      envioGratisDesde: d.envioGratisDesde === "" ? null : +d.envioGratisDesde, stockMinimo: +d.stockMinimo || 5, whatsapp: String(d.whatsapp).replace(/\D/g, "") };
    ["facebook", "instagram", "tiktok", "perk0", "perk1", "perk2", "perk3"].forEach(k => delete x[k]);
    if (JSON.stringify(x).length > 950000) return toast("Las imágenes pesan demasiado. Usa fotos más livianas.", true);
    await DB.set("ajustes", "general", x); Object.assign(CAT.aj, x); marcaPanel(); toast("Ajustes guardados · ya se ven en la web"); });
  $("#seed")?.addEventListener("click", async () => {
    if (!confirm(DEMO ? "En modo demo esto reinicia TODOS los datos de prueba. ¿Continuar?" : "Se crearán las categorías y productos de ejemplo. ¿Continuar?")) return;
    if (DEMO) { localStorage.removeItem("fr_db"); LDB.get(); toast("Datos demo reiniciados"); await cargarCatalogo(); return go("inicio"); }
    window.FR_DEMO_PEDIDOS = false; const d = window.FR_SEMILLA(), ops = [];
    if (!(await DB.get("ajustes", "general"))) ops.push({ op: "set", col: "ajustes", id: "general", data: window.FR_AJUSTES });
    Object.entries(d.categorias).forEach(([id, c]) => ops.push({ op: "set", col: "categorias", id, data: c }));
    Object.entries(d.productos).forEach(([id, p]) => ops.push({ op: "set", col: "productos", id, data: p }));
    await DB.batch(ops); toast("Ejemplos cargados"); await cargarCatalogo(); go("productos");
  });
};

arrancar();
