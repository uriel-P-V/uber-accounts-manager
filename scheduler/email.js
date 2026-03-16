const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:"TU_CORREO@gmail.com",
pass:"APP_PASSWORD"
}

})

function sendEmail(message){

transporter.sendMail({

from:"TU_CORREO@gmail.com",
to:"TU_CORREO@gmail.com",
subject:"Alerta Uber One",
text:message

})

}

module.exports = sendEmail
