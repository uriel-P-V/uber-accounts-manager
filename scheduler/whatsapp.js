async function sendWhatsApp(message) {
  const phone = "5213310948374"
  const apikey = "8467636"
  const text = encodeURIComponent(message)

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apikey}`

  const res = await fetch(url)
  const body = await res.text()
  console.log("WhatsApp:", body)
}

module.exports = sendWhatsApp