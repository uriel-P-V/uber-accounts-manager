const express = require("express")
const cors = require("cors")
const fs = require("fs")
const db = require("./db/client")
const sendWhatsApp = require("./scheduler/whatsapp")
require("dotenv").config()
require("./scheduler/reminders")

const app = express()
app.use(cors())
app.use(express.json())

// Servir SW con versión dinámica para auto-invalidar cache
app.get("/sw.js", (req, res) => {
  let sw = fs.readFileSync("./public/sw.js", "utf8")
  sw = sw.replace("{{VERSION}}", Date.now().toString())
  res.setHeader("Content-Type", "application/javascript")
  res.setHeader("Cache-Control", "no-cache")
  res.send(sw)
})

app.use(express.static("public"))

// GET todas las cuentas
app.get("/accounts", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM accounts")
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST nueva cuenta
app.post("/accounts", async (req, res) => {
  const { email, pedidos, reembolsos, uber_one_expira, tarjetas } = req.body
  await db.execute({
    sql: `INSERT INTO accounts (email, pedidos, reembolsos, uber_one_expira, tarjetas)
          VALUES (?, ?, ?, ?, ?)`,
    args: [email, pedidos, reembolsos, uber_one_expira || null, tarjetas]
  })
  res.send("Cuenta agregada")
})

// PUT editar cuenta
app.put("/accounts/:id", async (req, res) => {
  const { email, pedidos, reembolsos, uber_one_expira, tarjetas } = req.body
  await db.execute({
    sql: `UPDATE accounts
          SET email=?, pedidos=?, reembolsos=?, uber_one_expira=?, tarjetas=?
          WHERE id=?`,
    args: [email, pedidos, reembolsos, uber_one_expira || null, tarjetas, req.params.id]
  })
  res.send("Cuenta actualizada")
})

// POST toggle estrella
app.post("/accounts/star", async (req, res) => {
  const { id, estrella } = req.body
  await db.execute({
    sql: "UPDATE accounts SET estrella = ? WHERE id = ?",
    args: [estrella, id]
  })
  res.send("ok")
})

// DELETE cuenta
app.delete("/accounts/:id", async (req, res) => {
  await db.execute({
    sql: "DELETE FROM accounts WHERE id = ?",
    args: [req.params.id]
  })
  res.send("Cuenta eliminada")
})

// GET prueba WhatsApp
app.get("/test-whatsapp", async (req, res) => {
  try {
    await sendWhatsApp("✅ Prueba desde Uber Accounts Manager — notificaciones funcionando")
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`))