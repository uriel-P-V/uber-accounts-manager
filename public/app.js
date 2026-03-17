let currentView = localStorage.getItem("view") || "cards"
let uberFilterVal = ""

function setView(v) {
  currentView = v
  localStorage.setItem("view", v)
  document.getElementById("view-cards").classList.toggle("hidden", v !== "cards")
  document.getElementById("view-table").classList.toggle("hidden", v !== "table")
  document.getElementById("btn-cards").classList.toggle("active", v === "cards")
  document.getElementById("btn-table").classList.toggle("active", v === "table")
}

function setChip(el) {
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"))
  el.classList.add("active")
  uberFilterVal = el.dataset.filter
  document.getElementById("uberFilter").value = uberFilterVal
  loadAccounts()
}

function toggleSection(id) {
  const body = document.getElementById("body-" + id)
  const arrow = document.getElementById("arrow-" + id)
  body.classList.toggle("hidden")
  if (arrow) arrow.textContent = body.classList.contains("hidden") ? "▼" : "▲"
}

function resetFilters() {
  document.getElementById("search").value = ""
  document.getElementById("minPedidos").value = ""
  document.getElementById("minReembolsos").value = ""
  document.getElementById("ordenar").value = ""
  uberFilterVal = ""
  document.getElementById("uberFilter").value = ""
  document.querySelectorAll(".chip").forEach((c, i) => c.classList.toggle("active", i === 0))
  loadAccounts()
}

function uberBadge(expira) {
  if (!expira) return `<span class="badge badge-none">Sin Uber One</span>`
  const diff = (new Date(expira) - new Date()) / (1000 * 60 * 60 * 24)
  const fecha = new Date(expira).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
  if (diff < 0) return `<span class="badge badge-expired">Expiró</span>`
  if (diff <= 3) return `<span class="badge badge-warning">⚠ ${fecha}</span>`
  if (diff <= 7) return `<span class="badge badge-warning">${fecha}</span>`
  return `<span class="badge badge-active">${fecha}</span>`
}

function alertClass(expira) {
  if (!expira) return ""
  const diff = (new Date(expira) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0 || diff <= 3) return "alerta-roja"
  if (diff <= 7) return "alerta-orange"
  return ""
}

async function loadAccounts() {
  const res = await fetch("/accounts")
  let data = await res.json()

  const search = document.getElementById("search").value.toLowerCase()
  const filter = document.getElementById("uberFilter").value
  const minPedidos = parseInt(document.getElementById("minPedidos").value) || 0
  const minReembolsos = parseInt(document.getElementById("minReembolsos").value) || 0
  const ordenar = document.getElementById("ordenar").value

  data = data.filter(acc => {
    if (search && !acc.email.toLowerCase().includes(search)) return false
    if (filter === "activo" && !acc.uber_one_expira) return false
    if (filter === "sin" && acc.uber_one_expira) return false
    if (filter === "expirando") {
      if (!acc.uber_one_expira) return false
      const diff = (new Date(acc.uber_one_expira) - new Date()) / (1000 * 60 * 60 * 24)
      if (diff > 7 || diff < 0) return false
    }
    if (acc.pedidos < minPedidos) return false
    if (acc.reembolsos < minReembolsos) return false
    return true
  })

  if (ordenar === "estrella") data.sort((a, b) => b.estrella - a.estrella)
  if (ordenar === "pedidos") data.sort((a, b) => b.pedidos - a.pedidos)
  if (ordenar === "reembolsos") data.sort((a, b) => b.reembolsos - a.reembolsos)
  if (ordenar === "ratio") data.sort((a, b) => {
    const ra = a.pedidos > 0 ? a.reembolsos / a.pedidos : 0
    const rb = b.pedidos > 0 ? b.reembolsos / b.pedidos : 0
    return rb - ra
  })
  if (ordenar === "expira") {
    data.sort((a, b) => {
      if (!a.uber_one_expira) return 1
      if (!b.uber_one_expira) return -1
      return new Date(a.uber_one_expira) - new Date(b.uber_one_expira)
    })
  }

  // Stats
  let totalPedidos = 0, totalReembolsos = 0, cuentasUberOne = 0
  data.forEach(acc => {
    totalPedidos += Number(acc.pedidos)
    totalReembolsos += Number(acc.reembolsos)
    if (acc.uber_one_expira) cuentasUberOne++
  })

  document.getElementById("stats").innerHTML = `
    <div class="stat"><span class="stat-val">${data.length}</span><span class="stat-lbl">CUENTAS</span></div>
    <div class="stat"><span class="stat-val">${totalPedidos}</span><span class="stat-lbl">PEDIDOS</span></div>
    <div class="stat"><span class="stat-val">${totalReembolsos}</span><span class="stat-lbl">REEMBOLSOS</span></div>
    <div class="stat"><span class="stat-val">${cuentasUberOne}</span><span class="stat-lbl">UBER ONE</span></div>
  `

  document.getElementById("count-badge").textContent = data.length

  // ── CARDS VIEW ──
  const grid = document.getElementById("view-cards")
  grid.innerHTML = ""

  if (data.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No se encontraron cuentas</div></div>`
  } else {
    data.forEach(acc => {
      const ratio = acc.pedidos > 0 ? (acc.reembolsos / acc.pedidos).toFixed(2) : "—"
      const cls = alertClass(acc.uber_one_expira)
      const card = document.createElement("div")
      card.className = "acc-card " + cls
      card.innerHTML = `
        <div class="acc-card-top">
          <span class="acc-email">${acc.email}</span>
          <button class="acc-star" onclick="toggleStar(${acc.id},${acc.estrella})">${acc.estrella ? "⭐" : "☆"}</button>
        </div>
        <div class="acc-stats">
          <div class="acc-stat"><span class="acc-stat-val">${acc.pedidos}</span><span class="acc-stat-lbl">PEDIDOS</span></div>
          <div class="acc-stat"><span class="acc-stat-val">${acc.reembolsos}</span><span class="acc-stat-lbl">REEMBOLSOS</span></div>
          <div class="acc-stat"><span class="acc-stat-val">${ratio}</span><span class="acc-stat-lbl">RATIO</span></div>
        </div>
        <div>${uberBadge(acc.uber_one_expira)}</div>
        ${acc.tarjetas ? `<div class="acc-tarjetas">💳 ${acc.tarjetas}</div>` : ""}
        <div class="acc-actions">
          <button class="btn-edit" onclick="window.location.href='/Edit.html?id=${acc.id}'">✏️ Editar</button>
          <button class="btn-delete-sm" onclick="deleteAccount(${acc.id})">🗑</button>
        </div>
      `
      grid.appendChild(card)
    })
  }

  // ── TABLE VIEW ──
  const tbody = document.getElementById("accountsTable")
  tbody.innerHTML = ""
  data.forEach(acc => {
    const ratio = acc.pedidos > 0 ? (acc.reembolsos / acc.pedidos).toFixed(2) : "—"
    const cls = alertClass(acc.uber_one_expira)
    const row = document.createElement("tr")
    if (cls) row.classList.add(cls)
    row.innerHTML = `
      <td><button class="acc-star" onclick="toggleStar(${acc.id},${acc.estrella})">${acc.estrella ? "⭐" : "☆"}</button></td>
      <td style="font-size:0.78rem">${acc.email}</td>
      <td>${acc.pedidos}</td>
      <td>${acc.reembolsos}</td>
      <td style="font-size:0.8rem">${ratio}</td>
      <td>${uberBadge(acc.uber_one_expira)}</td>
      <td style="font-size:0.76rem;color:var(--text-muted)">${acc.tarjetas ?? "—"}</td>
      <td>
        <div class="tbl-actions">
          <button class="btn-tbl-edit" onclick="window.location.href='/edit.html?id=${acc.id}'">✏️</button>
          <button class="btn-tbl-del" onclick="deleteAccount(${acc.id})">🗑</button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })

  // Aplicar vista guardada
  setView(currentView)
}

async function addAccount() {
  const email = document.getElementById("email").value.trim()
  if (!email) return

  const btn = document.querySelector(".btn-accent")
  btn.textContent = "Guardando…"
  btn.disabled = true

  await fetch("/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      pedidos: parseInt(document.getElementById("pedidos").value) || 0,
      reembolsos: parseInt(document.getElementById("reembolsos").value) || 0,
      uber_one_expira: document.getElementById("uberOne").value || null,
      tarjetas: document.getElementById("tarjetas").value
    })
  })

  document.getElementById("email").value = ""
  document.getElementById("pedidos").value = ""
  document.getElementById("reembolsos").value = ""
  document.getElementById("uberOne").value = ""
  document.getElementById("tarjetas").value = ""

  btn.textContent = "＋ Guardar cuenta"
  btn.disabled = false

  // Cerrar el formulario después de guardar
  const body = document.getElementById("body-form")
  if (!body.classList.contains("hidden")) toggleSection("form")

  loadAccounts()
}

async function toggleStar(id, current) {
  await fetch("/accounts/star", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, estrella: current ? 0 : 1 })
  })
  loadAccounts()
}

async function deleteAccount(id) {
  if (!confirm("¿Eliminar esta cuenta?")) return
  await fetch("/accounts/" + id, { method: "DELETE" })
  loadAccounts()
}

async function testWhatsApp() {
  const btn = document.querySelector(".btn-whatsapp")
  btn.querySelector(".wa-title").textContent = "Enviando…"

  try {
    const res = await fetch("/test-whatsapp")
    const data = await res.json()
    btn.querySelector(".wa-title").textContent = data.ok ? "✅ Mensaje enviado" : "❌ Error al enviar"
  } catch {
    btn.querySelector(".wa-title").textContent = "❌ Error de red"
  }

  setTimeout(() => {
    btn.querySelector(".wa-title").textContent = "Probar notificación WhatsApp"
  }, 4000)
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js")

loadAccounts()