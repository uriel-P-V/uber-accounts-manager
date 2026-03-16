const { createClient } = require("@libsql/client")
require("dotenv").config()

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
})

async function init() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      pedidos INTEGER,
      reembolsos INTEGER,
      uber_one_expira DATE,
      tarjetas TEXT,
      estrella INTEGER DEFAULT 0
    )
  `)
  console.log("Tabla creada en Turso")
}

init()