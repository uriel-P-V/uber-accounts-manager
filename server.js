const express = require("express")
const cors = require("cors")
const db = require("./db/client")
require("dotenv").config()
require("./scheduler/reminders")

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.get("/accounts", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM accounts")
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post("/accounts", async (req, res) => {
  const { email, pedidos, reembolsos, uber_one_expira, tarjetas } = req.body
  await db.execute({
    sql: `INSERT INTO accounts (email, pedidos, reembolsos, uber_one_expira, tarjetas)
          VALUES (?, ?, ?, ?, ?)`,
    args: [email, pedidos, reembolsos, uber_one_expira || null, tarjetas]
  })
  res.send("Cuenta agregada")
})

app.post("/accounts/star", async (req, res) => {
  const { id, estrella } = req.body
  await db.execute({
    sql: "UPDATE accounts SET estrella = ? WHERE id = ?",
    args: [estrella, id]
  })
  res.send("ok")
})

app.delete("/accounts/:id", async (req, res) => {
  await db.execute({
    sql: "DELETE FROM accounts WHERE id = ?",
    args: [req.params.id]
  })
  res.send("Cuenta eliminada")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`))