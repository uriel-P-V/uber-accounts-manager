const cron = require("node-cron")
const db = require("../db/client")
const sendWhatsApp = require("./whatsapp")

cron.schedule("0 9 * * *", async () => {
  const result = await db.execute(`
    SELECT * FROM accounts
    WHERE DATE(uber_one_expira) = DATE('now', '+1 day')
    OR DATE(uber_one_expira) = DATE('now', '+3 days')
  `)

  result.rows.forEach(acc => {
    const message = `⚠️ Uber One expira pronto: ${acc.email} — ${acc.uber_one_expira}`
    console.log(message)
    sendWhatsApp(message)
  })
})