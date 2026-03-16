async function loadAccounts() {
  const res = await fetch("/accounts")
  let data = await res.json()

  const search = document.getElementById("search").value.toLowerCase()
  const filter = document.getElementById("uberFilter").value
  const minPedidos = document.getElementById("minPedidos").value
  const minReembolsos = document.getElementById("minReembolsos").value
  const ordenar = document.getElementById("ordenar").value

  data = data.filter(acc => {
    if (search && !acc.email.toLowerCase().includes(search)) return false
    if (filter === "activo" && !acc.uber_one_expira) return false
    if (filter === "sin" && acc.uber_one_expira) return false
    if (minPedidos && acc.pedidos < minPedidos) return false
    if (minReembolsos && acc.reembolsos < minReembolsos) return false
    return true
  })

  if (ordenar === "pedidos") data.sort((a, b) => b.pedidos - a.pedidos)
  if (ordenar === "reembolsos") data.sort((a, b) => b.reembolsos - a.reembolsos)
  if (ordenar === "expira") {
    data.sort((a, b) => {
      if (!a.uber_one_expira) return 1
      if (!b.uber_one_expira) return -1
      return new Date(a.uber_one_expira) - new Date(b.uber_one_expira)
    })
  }

  let totalPedidos = 0, totalReembolsos = 0, cuentasUberOne = 0
  data.forEach(acc => {
    totalPedidos += acc.pedidos
    totalReembolsos += acc.reembolsos
    if (acc.uber_one_expira) cuentasUberOne++
  })

  document.getElementById("stats").innerHTML = `
    <div class="stat"><span class="stat-val">${data.length}</span>CUENTAS</div>
    <div class="stat"><span class="stat-val">${totalPedidos}</span>PEDIDOS</div>
    <div class="stat"><span class="stat-val">${totalReembolsos}</span>REEMBOLSOS</div>
    <div class="stat"><span class="stat-val">${cuentasUberOne}</span>UBER ONE</div>
  `

  const table = document.getElementById("accountsTable")
  table.innerHTML = ""

  data.forEach(acc => {
    const row = document.createElement("tr")
    const ratio = acc.pedidos > 0 ? (acc.reembolsos / acc.pedidos).toFixed(2) : "—"
    const hoy = new Date()
    let alertClass = ""
    let uberBadge = ""

    if (acc.uber_one_expira) {
      const expira = new Date(acc.uber_one_expira)
      const diff = (expira - hoy) / (1000 * 60 * 60 * 24)
      const fechaStr = expira.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })

      if (diff < 0) {
        alertClass = "alerta-roja"
        uberBadge = `<span class="badge badge-expired">Expiró</span>`
      } else if (diff <= 3) {
        alertClass = "alerta-roja"
        uberBadge = `<span class="badge badge-warning">⚠ ${fechaStr}</span>`
      } else if (diff <= 7) {
        alertClass = "alerta-naranja"
        uberBadge = `<span class="badge badge-warning">${fechaStr}</span>`
      } else {
        uberBadge = `<span class="badge badge-active">${fechaStr}</span>`
      }
    } else {
      uberBadge = `<span class="badge badge-none">Sin Uber One</span>`
    }

    if (alertClass) row.classList.add(alertClass)

    row.innerHTML = `
      <td>
        <button class="btn-star" onclick="toggleStar(${acc.id}, ${acc.estrella})">
          ${acc.estrella ? "⭐" : "☆"}
        </button>
      </td>
      <td><span class="email-text">${acc.email}</span></td>
      <td>${acc.pedidos}</td>
      <td>${acc.reembolsos}</td>
      <td><span class="ratio-text">${ratio}</span></td>
      <td>${uberBadge}</td>
      <td><span class="tarjetas-text">${acc.tarjetas ?? "—"}</span></td>
      <td><button class="btn-delete" onclick="deleteAccount(${acc.id})">Eliminar</button></td>
    `
    table.appendChild(row)
  })
}

loadAccounts()

async function addAccount() {
  const email = document.getElementById("email").value
  const pedidos = document.getElementById("pedidos").value
  const reembolsos = document.getElementById("reembolsos").value
  const uberOne = document.getElementById("uberOne").value
  const tarjetas = document.getElementById("tarjetas").value

  await fetch("/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pedidos, reembolsos, uber_one_expira: uberOne, tarjetas })
  })

  document.getElementById("email").value = ""
  document.getElementById("pedidos").value = ""
  document.getElementById("reembolsos").value = ""
  document.getElementById("uberOne").value = ""
  document.getElementById("tarjetas").value = ""

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
  btn.textContent = "Enviando…"
  btn.disabled = true

  try {
    const res = await fetch("/test-whatsapp")
    const data = await res.json()
    if (data.ok) {
      btn.textContent = "✅ Mensaje enviado"
    } else {
      btn.textContent = "❌ Error: " + data.error
    }
  } catch (e) {
    btn.textContent = "❌ Error de red"
  }

  setTimeout(() => {
    btn.innerHTML = "<span>📲</span> Enviar mensaje de prueba a WhatsApp"
    btn.disabled = false
  }, 4000)
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
}