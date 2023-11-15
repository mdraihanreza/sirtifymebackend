
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    host: "smtppro.zoho.in",
    port: 465,
    secure: true,
    auth: {
        user: "jagan@elvirainfotech.com",
        pass: "Jr@zm#22980608",
    },
});

module.exports = transporter;